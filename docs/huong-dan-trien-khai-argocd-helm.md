# ArgoCD, Helm, and Rollouts deployment guide

Tài liệu này mô tả cách triển khai lại toàn bộ phần `Helm + ArgoCD` cho hệ thống e-commerce microservices theo hướng GitOps, đồng thời kèm checklist test để demo cho giảng viên.

## 1. Cấu trúc triển khai

- `helm/ecom-app`: umbrella chart quản lý toàn bộ ứng dụng
- `helm/ecom-app/charts/product-service`: subchart cho Product Service, dùng `Argo Rollout`
- `helm/ecom-app/charts/order-service`: subchart cho Order Service, dùng `Argo Rollout`
- `helm/ecom-app/charts/inventory-service`: subchart cho Inventory Service, dùng `Deployment`
- `helm/ecom-app/charts/rabbitmq`: subchart cho RabbitMQ, có `PVC`
- `argocd/argocd-app.yaml`: ArgoCD Application đồng bộ chart từ Git
- `argocd/git-credentials-secret.yaml`: secret mẫu cho ArgoCD Image Updater
- `argocd/install-argocd.ps1`: script cài ArgoCD, Argo Rollouts, ingress controller, image updater

## 2. Những gì đã được chuẩn hóa lại

### Helm
- Giữ `umbrella chart` và dependencies rõ ràng
- Tách `ConfigMap`, `Secret`, `StorageClass` ở chart cha
- Chuẩn hóa labels giữa các chart
- Dùng `Rollout + HPA + Ingress` cho `product-service` và `order-service`
- Dùng `Deployment + HPA` cho `inventory-service`
- Dùng `PVC` cho `rabbitmq`

### Secret
- Đã thay secret thật trong `helm/ecom-app/values.yaml` bằng placeholder an toàn
- Secret GitHub cho image updater không còn hardcode giá trị thật, chỉ giữ mẫu điền tay

### ArgoCD
- Application được cấu hình để sync `helm/ecom-app`
- Bật `automated sync`, `self-heal`, `prune`
- Có annotation cho `ArgoCD Image Updater` để cập nhật image tag vào Git

## 3. Chuẩn bị trước khi deploy

Bạn cần chuẩn bị:
- Kubernetes cluster đang hoạt động
- `kubectl` đã cấu hình đúng cluster
- `helm` đã cài
- nếu muốn test rollout bằng CLI: cài thêm `kubectl argo rollouts`
- GitHub Personal Access Token nếu muốn test `ArgoCD Image Updater`

Nếu cluster local không có Longhorn, hãy đổi trong `helm/ecom-app/values.yaml`:

- `global.storageClass.provisioner`
- `global.storageClass.parameters`
- hoặc đặt `global.storageClass.create: false` và dùng storage class có sẵn

Ví dụ với local-path, bạn có thể sửa như sau:

```yaml
global:
  storageClass:
    name: local-path
    create: false
```

## 4. Cài các thành phần ArgoCD

Chạy script:

```powershell
powershell -ExecutionPolicy Bypass -File .\argocd\install-argocd.ps1
```

Script này sẽ cài:
- ArgoCD
- ArgoCD Image Updater
- Argo Rollouts Controller
- NGINX Ingress Controller

Sau đó lấy mật khẩu admin ArgoCD và truy cập UI bằng port-forward.

## 5. Cấu hình Git credentials cho Image Updater

Mở file `argocd/git-credentials-secret.yaml` và thay:
- `<your-github-username>`
- `<your-github-personal-access-token>`

Apply secret:

```bash
kubectl apply -f argocd/git-credentials-secret.yaml
```

## 6. Kiểm tra Helm trước khi deploy

### Lint chart

```bash
helm lint ./helm/ecom-app
```

### Render manifest

```bash
helm template ecom-app ./helm/ecom-app
```

Cần kiểm tra output có đủ:
- `ConfigMap`
- `Secret`
- `StorageClass`
- `Service`
- `Ingress`
- `HorizontalPodAutoscaler`
- `PersistentVolumeClaim`
- `Rollout`
- `Deployment`

## 7. Test deploy trực tiếp bằng Helm

Cài thử chart:

```bash
helm install ecom-app ./helm/ecom-app -n default --create-namespace
```

Kiểm tra tài nguyên:

```bash
kubectl get all -n default
kubectl get ingress -n default
kubectl get hpa -n default
kubectl get pvc -n default
kubectl get storageclass
kubectl get rollout -n default
```

Kỳ vọng:
- `product-service`, `order-service`, `inventory-service`, `rabbitmq` đều chạy
- `rabbitmq-data-pvc` ở trạng thái `Bound`
- `product-service` và `order-service` có rollout
- `inventory-service` có deployment
- HPA được tạo đủ cho 3 service

Nếu cần gỡ ra sau khi test:

```bash
helm uninstall ecom-app -n default
```

## 8. Deploy bằng ArgoCD

Apply application:

```bash
kubectl apply -f argocd/argocd-app.yaml
```

Kiểm tra app:

```bash
kubectl get applications -n argocd
```

Kỳ vọng:
- `STATUS`: `Synced`
- `HEALTH`: `Healthy`

Bạn cũng có thể kiểm tra trực tiếp trên UI ArgoCD.

## 9. Test Ingress

Host mặc định hiện tại là:

- `api.ecom.local`

Nếu test local, thêm vào file hosts của máy:

```text
127.0.0.1 api.ecom.local
```

Sau đó thử truy cập các path:
- `http://api.ecom.local/api/products`
- `http://api.ecom.local/api/orders`

Lưu ý: service thực tế phải có route phù hợp thì mới trả về response mong muốn.

## 10. Test Argo Rollouts

Hai service đang dùng rollout:
- `product-service`
- `order-service`

Kiểm tra rollout:

```bash
kubectl argo rollouts get rollout product-service -n default
kubectl argo rollouts get rollout order-service -n default
```

Để test canary:
1. đổi `image.tag` của `product-service` hoặc `order-service` trong `helm/ecom-app/values.yaml`
2. commit và push lên Git
3. đợi ArgoCD sync
4. kiểm tra rollout progression

Kỳ vọng:
- traffic tăng dần theo `setWeight`
- có pause giữa các bước
- rollout cuối cùng promoted hoàn toàn nếu không có lỗi

## 11. Test HPA

Theo dõi HPA:

```bash
kubectl get hpa -n default -w
```

Sinh tải lên service bằng công cụ bất kỳ như `hey`, `wrk`, `curl loop` hoặc Postman runner.

Kỳ vọng:
- CPU tăng thì replicas tăng
- tải giảm thì replicas giảm về `minReplicas`

Lưu ý: cluster phải có Metrics Server thì HPA mới hoạt động.

## 12. Test PVC và storage

Kiểm tra PVC:

```bash
kubectl get pvc -n default
```

Kiểm tra chi tiết:

```bash
kubectl describe pvc rabbitmq-data-pvc -n default
kubectl describe pod -n default
```

Kỳ vọng:
- PVC `Bound`
- RabbitMQ mount volume thành công

## 13. Test ArgoCD Image Updater

Điều kiện:
- Image Updater đã cài
- `git-creds` secret hợp lệ
- image mới được push lên registry

Kiểm tra luồng:
1. push image mới cho một service
2. chờ Image Updater phát hiện tag mới
3. kiểm tra repo thấy `helm/ecom-app/values.yaml` được cập nhật tag
4. ArgoCD tự sync lại thay đổi

Bạn có thể kiểm tra log:

```bash
kubectl logs -n argocd deployment/argocd-image-updater
```

## 14. Những điểm cần lưu ý khi demo

Khi trình bày với giảng viên, bạn có thể nhấn mạnh:
- Helm dùng mô hình `umbrella chart + subcharts`
- Config không nhạy cảm dùng `ConfigMap`, config nhạy cảm dùng `Secret`
- RabbitMQ có `PVC` và `StorageClass`
- Product/Order dùng `Argo Rollouts` cho canary deployment
- ArgoCD theo dõi Git và tự đồng bộ xuống cluster
- Image Updater cập nhật image tag ngược về Git theo đúng GitOps

## 15. Checklist test nhanh

### Helm
- [ ] `helm lint ./helm/ecom-app` pass
- [ ] `helm template ecom-app ./helm/ecom-app` render đủ resource

### Kubernetes
- [ ] pod chạy đủ
- [ ] ingress được tạo
- [ ] hpa được tạo
- [ ] pvc `Bound`
- [ ] rollout tồn tại cho product/order

### ArgoCD
- [ ] app ở trạng thái `Synced`
- [ ] app ở trạng thái `Healthy`

### Rollouts
- [ ] thay image tag tạo ra rollout mới
- [ ] canary chạy theo step

### Image Updater
- [ ] phát hiện image mới
- [ ] commit tag mới về Git
- [ ] ArgoCD tự sync lại
