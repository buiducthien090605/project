import time
import subprocess
import json
import warnings
import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from sklearn.neural_network import MLPRegressor
from kubernetes import client, config
from collections import deque

warnings.filterwarnings("ignore")

CPU_HIGH_THRESHOLD = 12.0
CPU_LOW_THRESHOLD = 4.0
DEFAULT_MIN_REPLICAS = 2
MAX_REPLICAS = 10
HISTORY_SIZE = 300
STABILITY_WINDOW_STEPS = 6

cpu_history = deque(maxlen=HISTORY_SIZE)
recommendation_history = deque(maxlen=STABILITY_WINDOW_STEPS)
current_replicas = DEFAULT_MIN_REPLICAS

config.load_kube_config()
k8s_autoscaling = client.AutoscalingV2Api()
mlp_model = MLPRegressor(hidden_layer_sizes=(50, 25), activation='relu', solver='adam', warm_start=True, max_iter=200)

def log(msg):
    print(msg, flush=True)

def get_cpu_metrics():
    try:
        query = 'avg(rate(container_cpu_usage_seconds_total{pod=~"order-service-.*"}[1m]))'
        escaped_query = query.replace('"', '\\"')
        cmd = f'kubectl exec deployment/prometheus -- wget -q -O- "http://localhost:9090/api/v1/query?query={escaped_query}"'
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            data = json.loads(result.stdout)
            results = data.get('data', {}).get('result', [])
            if results:
                return float(results[0]['value'][1]) * 1000
    except Exception as e:
        log(f"Error: {e}")
    return 0.0

def patch_hpa(replicas):
    try:
        body = {"spec": {"minReplicas": replicas}}
        k8s_autoscaling.patch_namespaced_horizontal_pod_autoscaler(
            name="order-service-hpa", namespace="default", body=body
        )
        return True
    except Exception as e:
        log(f"K8s error: {e}")
        return False

def get_current_replicas():
    try:
        result = subprocess.run('kubectl get deployment order-service -o jsonpath="{.spec.replicas}"', 
                               shell=True, capture_output=True, text=True, timeout=10)
        if result.stdout:
            return int(result.stdout)
    except:
        pass
    return current_replicas

log("AI Predictive Scaler (ARIMA + MLP)")
current_replicas = get_current_replicas()
log(f"Initial replicas: {current_replicas}")

iteration = 0
while True:
    iteration += 1
    current_cpu = get_cpu_metrics()
    cpu_history.append(current_cpu)
    
    pod_count = len([line for line in subprocess.run('kubectl get pods -l app=order-service --no-headers', 
                                                       shell=True, capture_output=True, text=True).stdout.split('\n') if line])
    
    log(f"[{iteration}] CPU: {current_cpu:.2f}m | Pods: {pod_count}")

    if len(cpu_history) >= 50:
        try:
            series = pd.Series(list(cpu_history))
            
            arima_model = ARIMA(series, order=(1, 1, 1))
            arima_fit = arima_model.fit()
            arima_forecast = arima_fit.forecast(steps=3).values
            
            residuals = arima_fit.resid.values
            if len(residuals) >= 4:
                X_train = residuals[-4:-1].reshape(1, -1) 
                y_train = residuals[-1:]                  
                mlp_model.fit(X_train, y_train)
                
                recent_residuals = residuals[-3:].reshape(1, -1)
                mlp_residual_forecast = mlp_model.predict(recent_residuals)[0]
                
                hybrid_predicted_cpu_max = max(arima_forecast) + mlp_residual_forecast
                log(f"   Predicted CPU: {hybrid_predicted_cpu_max:.2f}m")

                needed_pods = current_replicas
                if hybrid_predicted_cpu_max > CPU_HIGH_THRESHOLD:
                    needed_pods = min(MAX_REPLICAS, int(hybrid_predicted_cpu_max / 4) + 2)
                elif hybrid_predicted_cpu_max < CPU_LOW_THRESHOLD:
                    needed_pods = max(DEFAULT_MIN_REPLICAS, int(hybrid_predicted_cpu_max / 4) + 1)
                
                recommendation_history.append(needed_pods)

                if len(recommendation_history) == STABILITY_WINDOW_STEPS:
                    target_replicas = max(recommendation_history) 
                    
                    if target_replicas > current_replicas:
                        log(f"   Pre-warming to {target_replicas} Pods")
                        if patch_hpa(target_replicas):
                            current_replicas = target_replicas
                            recommendation_history.clear() 
                    elif target_replicas < current_replicas:
                        log(f"   Scaling down to {target_replicas} Pods")
                        if patch_hpa(target_replicas):
                            current_replicas = target_replicas
                            recommendation_history.clear()

        except Exception as e:
            log(f"   AI Error: {e}")
            
    else:
        log(f"   Warming up ({len(cpu_history)}/50)")

    time.sleep(1)
