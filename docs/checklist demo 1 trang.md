# Checklist demo 1 trang

Tài liệu này là bản cực ngắn để bạn dùng ngay trước và trong lúc bảo vệ.

---

## 1. Mục tiêu cần chứng minh

Bạn chỉ cần chứng minh 5 ý:

- [ ] dùng `Helm umbrella chart`
- [ ] deploy được lên Kubernetes
- [ ] có `PVC`, `HPA`, `Ingress`, `Rollout`
- [ ] có `ArgoCD` để GitOps
- [ ] nếu kịp thì nói thêm `Image Updater`

---

## 2. Kiểm tra nhanh trước giờ demo

Chạy các lệnh sau:

```powershell
kubectl get nodes
kubectl get pods -n argocd
kubectl get pods -n argo-rollouts
kubectl get pods -n ingress-nginx
```

Kết quả mong đợi:
- [ ] node `Ready`
- [ ] pod `argocd` chạy
- [ ] pod `argo-rollouts` chạy
- [ ] pod `ingress-nginx` chạy

---

## 3. Câu mở đầu ngắn gọn

Bạn có thể nói:

"Bài của em triển khai hệ thống microservices trên Kubernetes. Em dùng Helm theo mô hình umbrella chart để quản lý nhiều service, dùng ArgoCD để triển khai theo GitOps, dùng Argo Rollouts cho canary deployment ở các service chính, và có thêm PVC, Ingress, HPA để hệ thống hoàn chỉnh hơn."

---

## 4. 10 lệnh quan trọng nhất

```powershell
cd E:\project
helm lint .\helm\ecom-app
helm template ecom-app .\helm\ecom-app
helm upgrade --install ecom-app .\helm\ecom-app -n default --create-namespace
kubectl get all -n default
kubectl get ingress -n default
kubectl get hpa -n default
kubectl get pvc -n default
kubectl get rollout -n default
kubectl get applications -n argocd
```

---

## 5. Thứ tự demo an toàn nhất

### Bước 1: giới thiệu kiến trúc
Nói:
- chart cha ở `helm/ecom-app`
- có các subchart cho từng service
- config dùng chung nằm ở chart cha

### Bước 2: chứng minh Helm chart hợp lệ
Chạy:

```powershell
helm lint .\helm\ecom-app
helm template ecom-app .\helm\ecom-app
```

Nói:
- chart hợp lệ
- render được đầy đủ manifest Kubernetes

### Bước 3: chứng minh deploy được
Chạy:

```powershell
helm upgrade --install ecom-app .\helm\ecom-app -n default --create-namespace
kubectl get all -n default
```

Nói:
- hệ thống đã được triển khai xuống cluster

### Bước 4: chứng minh các thành phần quan trọng
Chạy:

```powershell
kubectl get ingress -n default
kubectl get hpa -n default
kubectl get pvc -n default
kubectl get rollout -n default
```

Nói:
- có ingress để route request
- có HPA để autoscaling
- có PVC cho RabbitMQ
- có rollout cho product-service và order-service

### Bước 5: chứng minh ArgoCD
Chạy:

```powershell
kubectl get applications -n argocd
```

Nói:
- ArgoCD đang theo dõi và đồng bộ ứng dụng theo GitOps

---

## 6. Kết quả mong đợi khi demo

### Helm
- [ ] `helm lint` pass
- [ ] `helm template` render được

### Kubernetes
- [ ] có pod
- [ ] có service
- [ ] có ingress
- [ ] có hpa
- [ ] có pvc
- [ ] có rollout

### ArgoCD
- [ ] app `ecom-app` hiện `Synced`
- [ ] app `ecom-app` hiện `Healthy`

---

## 7. Câu giải thích ngắn cho từng phần

### Helm
"Helm giúp em đóng gói toàn bộ cấu hình Kubernetes thành một chart tổng và nhiều subchart, dễ quản lý hơn so với YAML rời."

### ArgoCD
"ArgoCD giúp triển khai theo GitOps, tức là Git là nguồn cấu hình chính và cluster sẽ được đồng bộ theo Git."

### Rollout
"Argo Rollouts giúp cập nhật phiên bản mới theo từng bước để giảm rủi ro hơn deployment thường."

### HPA
"HPA giúp hệ thống tự tăng giảm số pod theo tải."

### PVC
"PVC giúp RabbitMQ có lưu trữ bền vững hơn khi pod khởi động lại."

### Ingress
"Ingress giúp định tuyến request từ bên ngoài vào đúng service phía trong cluster."

---

## 8. Nếu thầy hỏi nhanh thì trả lời thế nào

### Tại sao dùng Helm?
"Vì hệ thống có nhiều service và nhiều resource, Helm giúp tổ chức và tái sử dụng cấu hình tốt hơn."

### Tại sao dùng ArgoCD?
"Để triển khai theo GitOps, dễ theo dõi lịch sử thay đổi và giảm thao tác thủ công trên cluster."

### Tại sao product/order dùng rollout còn inventory không dùng?
"Vì product và order là các service nghiệp vụ quan trọng hơn nên em dùng canary deployment để cập nhật an toàn hơn."

### Tại sao RabbitMQ cần PVC?
"Vì RabbitMQ cần lưu dữ liệu hàng đợi, nếu không có PVC thì restart pod có thể mất dữ liệu."

---

## 9. Nếu live demo bị lỗi thì nói gì

### Nếu pod chưa Running
"Phần local runtime có thể còn phụ thuộc image hoặc storage, nhưng chart đã lint và render thành công, đồng thời cấu trúc triển khai đã đầy đủ."

### Nếu ingress chưa vào được
"Ingress local còn phụ thuộc file hosts và ingress controller, nhưng resource ingress đã được tạo đúng."

### Nếu ArgoCD UI chưa mở
"Em có thể kiểm tra trạng thái application bằng CLI thay cho UI."

### Nếu rollout chưa thể hiện rõ
"Rollout sẽ thể hiện rõ nhất khi có image mới, còn hiện tại em trình bày cơ chế canary qua cấu hình step và resource rollout đã được tạo."

---

## 10. Kịch bản cực ngắn 2 đến 3 phút

Nói mở đầu:

"Bài của em dùng Helm để đóng gói hệ thống microservices, dùng ArgoCD để GitOps, dùng Argo Rollouts cho canary deployment và có các thành phần thực tế như PVC, Ingress, HPA."

Chạy các lệnh:

```powershell
helm lint .\helm\ecom-app
helm template ecom-app .\helm\ecom-app
kubectl get all -n default
kubectl get hpa -n default
kubectl get pvc -n default
kubectl get rollout -n default
kubectl get applications -n argocd
```

Kết câu:

"Như vậy em đã chứng minh được chart hợp lệ, hệ thống deploy được, có autoscaling, có canary deployment và có GitOps với ArgoCD."
