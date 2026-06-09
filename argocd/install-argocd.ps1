# =============================================================================
# ArgoCD, Argo Rollouts, Image Updater, Metrics Server, and NGINX installation script
# =============================================================================
# Prerequisites:
#   - kubectl configured and connected to your cluster
#   - cluster is running
# =============================================================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host " ArgoCD + Rollouts Installation Script" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/7] Creating namespaces..." -ForegroundColor Yellow
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
kubectl create namespace argo-rollouts --dry-run=client -o yaml | kubectl apply -f -

Write-Host "[2/7] Installing ArgoCD..." -ForegroundColor Yellow
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

Write-Host "[3/7] Installing ArgoCD Image Updater..." -ForegroundColor Yellow
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-image-updater/stable/manifests/install.yaml
kubectl apply -f .\argocd\argocd-image-updater-config.yaml

Write-Host "[4/7] Installing Argo Rollouts Controller..." -ForegroundColor Yellow
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml

Write-Host "[5/7] Installing Metrics Server..." -ForegroundColor Yellow
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

Write-Host "[6/7] Installing NGINX Ingress Controller..." -ForegroundColor Yellow
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml

Write-Host "[7/7] Waiting for ArgoCD server to become available..." -ForegroundColor Yellow
kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host " Installation Complete" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "ArgoCD admin password:" -ForegroundColor Cyan
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | ForEach-Object { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) }
Write-Host ""
Write-Host ""
Write-Host "Access ArgoCD UI:" -ForegroundColor Cyan
Write-Host "  kubectl port-forward svc/argocd-server -n argocd 8080:443" -ForegroundColor White
Write-Host "  Open: https://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "Access Argo Rollouts dashboard:" -ForegroundColor Cyan
Write-Host "  kubectl argo rollouts dashboard" -ForegroundColor White
Write-Host "  Open: http://localhost:3100" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Create a real git-creds secret from argocd/git-credentials-secret.example.yaml" -ForegroundColor White
Write-Host "  2. kubectl apply -f argocd/git-credentials-secret.yaml" -ForegroundColor White
Write-Host "  3. helm lint ./helm/ecom-app" -ForegroundColor White
Write-Host "  4. kubectl apply -f argocd/argocd-app.yaml" -ForegroundColor White
