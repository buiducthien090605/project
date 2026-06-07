# Hướng dẫn chi tiết cài đặt, triển khai và kiểm thử Helm + ArgoCD trên Windows 11

Tài liệu này dành cho người mới bắt đầu. Mục tiêu là giúp bạn làm từng bước từ số 0 đến khi:

- cài được môi trường trên Windows 11
- chạy được Kubernetes local
- triển khai ứng dụng bằng `Helm`
- triển khai ứng dụng bằng `ArgoCD`
- hiểu cách test từng phần
- biết kết quả mong đợi của từng kịch bản
- biết cách xử lý những lỗi thường gặp

---

## 1. Mục tiêu của bài triển khai

Sau khi hoàn thành, hệ thống của bạn sẽ có:

- `Helm umbrella chart`
- nhiều `subchart` cho từng service
- `ConfigMap`
- `Secret`
- `PVC`
- `StorageClass`
- `Ingress`
- `HPA`
- `ArgoCD`
- `Argo Rollouts`
- `ArgoCD Image Updater`

Trong project hiện tại:

- `product-service` dùng `Argo Rollout`
- `order-service` dùng `Argo Rollout`
- `inventory-service` dùng `Deployment`
- `rabbitmq` dùng `PVC`

---

## 2. Bạn cần hiểu rất ngắn gọn các khái niệm

### 2.1 Helm là gì
Helm là công cụ giúp đóng gói các file Kubernetes YAML thành một bộ cài đặt có cấu trúc.

Hiểu đơn giản:
- không cần tự `kubectl apply` từng file rời rạc
- chỉ cần dùng `helm install`
- mọi cấu hình nằm trong `values.yaml`

### 2.2 ArgoCD là gì
ArgoCD là công cụ GitOps.

Hiểu đơn giản:
- code cấu hình nằm trên GitHub
- ArgoCD đọc GitHub
- nếu file trên Git thay đổi thì ArgoCD tự đồng bộ xuống cluster

### 2.3 Argo Rollouts là gì
Argo Rollouts giúp cập nhật phiên bản mới một cách an toàn hơn.

Ví dụ:
- cho 20% traffic vào bản mới trước
- nếu ổn thì tăng lên 60%
- rồi mới thay toàn bộ

### 2.4 HPA là gì
HPA là autoscaling.

Nó sẽ:
- tăng số pod khi tải tăng
- giảm số pod khi tải giảm

### 2.5 PVC là gì
PVC là vùng lưu trữ bền vững cho container.

Ví dụ:
- RabbitMQ cần lưu dữ liệu
- nếu không có PVC thì restart pod có thể mất dữ liệu

---

## 3. Kiến trúc project hiện tại

Các file quan trọng trong project của bạn:

- `helm/ecom-app/Chart.yaml`
- `helm/ecom-app/values.yaml`
- `helm/ecom-app/templates/configmaps.yaml`
- `helm/ecom-app/templates/secrets.yaml`
- `helm/ecom-app/templates/storageclass.yaml`
- `helm/ecom-app/charts/product-service/...`
- `helm/ecom-app/charts/order-service/...`
- `helm/ecom-app/charts/inventory-service/...`
- `helm/ecom-app/charts/rabbitmq/...`
- `argocd/argocd-app.yaml`
- `argocd/git-credentials-secret.yaml`
- `argocd/install-argocd.ps1`

Ý tưởng tổ chức:

- `ecom-app` là chart cha
- từng service là chart con
- cấu hình dùng chung nằm ở chart cha
- ArgoCD sẽ deploy chart cha này

---

## 4. Cần cài gì trên Windows 11

Bạn cần các công cụ sau:

- `Git`
- `Docker Desktop`
- `kubectl`
- `Helm`
- `PowerShell`
- tùy chọn: `kubectl argo rollouts`

---

## 5. Cài Git trên Windows 11

### Bước 1
Tải Git tại đây:

[https://git-scm.com/download/win](https://git-scm.com/download/win)

### Bước 2
Cài đặt bình thường, cứ bấm `Next` theo mặc định.

### Bước 3
Mở PowerShell và kiểm tra:

```powershell
git --version
```

### Kết quả mong đợi
Bạn sẽ thấy dạng như:

```text
git version 2.xx.x.windows.x
```

Nếu hiện version là cài thành công.

---

## 6. Cài Docker Desktop và bật Kubernetes

### Bước 1
Tải Docker Desktop:

[https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

### Bước 2
Cài Docker Desktop.

### Bước 3
Mở Docker Desktop.

### Bước 4
Bật Kubernetes:

1. vào `Settings`
2. chọn `Kubernetes`
3. tick `Enable Kubernetes`
4. bấm `Apply & Restart`

### Bước 5
Chờ vài phút cho cluster local khởi động.

### Kết quả mong đợi
Docker Desktop báo Kubernetes đang chạy.

---

## 7. Cài kubectl

Nếu máy bạn chưa có `kubectl`, chạy:

```powershell
winget install -e --id Kubernetes.kubectl
```

Kiểm tra:

```powershell
kubectl version --client
```

### Kết quả mong đợi
Hiện version client của kubectl.

---

## 8. Cài Helm

Cài bằng `winget`:

```powershell
winget install Helm.Helm
```

Kiểm tra:

```powershell
helm version
```

### Kết quả mong đợi
Hiện version Helm.

---

## 9. Kiểm tra Kubernetes cluster đã sẵn sàng chưa

Mở PowerShell và chạy:

```powershell
kubectl get nodes
```

### Kết quả mong đợi
Bạn sẽ thấy 1 node ở trạng thái `Ready`, ví dụ:

```text
NAME             STATUS   ROLES           AGE   VERSION
docker-desktop   Ready    control-plane   ...   ...
```

Nếu chưa `Ready` thì đợi thêm hoặc kiểm tra Docker Desktop.

---

## 10. Mở project đúng thư mục

Mở PowerShell và chạy:

```powershell
cd E:\project
```

Từ đây trở đi, các lệnh đều giả sử bạn đang đứng trong thư mục này.

---

## 11. Kiểm tra storage class trước khi deploy

Đây là bước rất quan trọng với người mới.

Trong project hiện tại, file `values.yaml` mặc định có phần storage theo hướng dùng `Longhorn`.

Nhưng nếu bạn đang chạy local bằng Docker Desktop trên Windows 11, nhiều khả năng bạn **không có Longhorn**.

### Bước 1: kiểm tra storage class hiện có

```powershell
kubectl get storageclass
```

### Kết quả mong đợi
Bạn sẽ thấy danh sách storage class, ví dụ:

```text
NAME                 PROVISIONER                RECLAIMPOLICY   VOLUMEBINDINGMODE
hostpath (default)   docker.io/hostpath         Delete          Immediate
```

### Bước 2: chỉnh `values.yaml` nếu cần

Mở file:

`E:\project\helm\ecom-app\values.yaml`

Tìm phần:

```yaml
global:
  storageClass:
    name: ecom-storage
    create: true
    provisioner: driver.longhorn.io
```

Nếu local cluster của bạn không có Longhorn, hãy sửa đơn giản thành:

```yaml
global:
  storageClass:
    name: hostpath
    create: false
```

### Vì sao phải sửa như vậy
- `create: false` nghĩa là không tự tạo storage class mới
- `name: hostpath` nghĩa là dùng storage class có sẵn của Docker Desktop

### Kết quả mong đợi
Khi đó PVC của RabbitMQ dễ được bind hơn.

---

## 12. Kiểm tra Helm chart trước khi cài

### Bước 1: lint chart

```powershell
helm lint .\helm\ecom-app
```

### Kết quả mong đợi
Bạn sẽ thấy dạng:

```text
1 chart(s) linted, 0 chart(s) failed
```

### Ý nghĩa
Chart đúng cú pháp cơ bản.

### Bước 2: render chart

```powershell
helm template ecom-app .\helm\ecom-app
```

### Kết quả mong đợi
Hiện ra rất nhiều YAML.

Bạn cần thấy các loại resource như:
- `Secret`
- `ConfigMap`
- `StorageClass`
- `PersistentVolumeClaim`
- `Service`
- `Ingress`
- `Deployment`
- `Rollout`
- `HorizontalPodAutoscaler`

### Ý nghĩa
Nếu render được nghĩa là chart có thể sinh manifest hợp lệ.

---

## 13. Triển khai trực tiếp bằng Helm

Người mới nên làm cách này trước vì dễ hiểu hơn ArgoCD.

### Bước 1: cài chart

```powershell
helm install ecom-app .\helm\ecom-app -n default --create-namespace
```

### Kết quả mong đợi
Helm báo release `ecom-app` đã được cài.

### Bước 2: kiểm tra toàn bộ tài nguyên

```powershell
kubectl get all -n default
```

### Kết quả mong đợi
Bạn sẽ thấy:
- pod của `product-service`
- pod của `order-service`
- pod của `inventory-service`
- pod của `rabbitmq`
- service tương ứng

---

## 14. Kiểm tra từng resource sau khi Helm deploy

### 14.1 Kiểm tra pod

```powershell
kubectl get pods -n default
```

### Kết quả mong đợi
Trạng thái nên là:
- `Running`
- hoặc đang `ContainerCreating` lúc mới deploy

### Nếu không như mong đợi
Nếu có:
- `CrashLoopBackOff`
- `ImagePullBackOff`
- `ErrImagePull`

thì cần kiểm tra logs và describe pod.

---

### 14.2 Kiểm tra Service

```powershell
kubectl get svc -n default
```

### Kết quả mong đợi
Có các service như:
- `product-service`
- `product-service-canary`
- `order-service`
- `order-service-canary`
- `inventory-service`
- `rabbitmq`

---

### 14.3 Kiểm tra Ingress

```powershell
kubectl get ingress -n default
```

### Kết quả mong đợi
Có ít nhất:
- `product-service-ingress`
- `order-service-ingress`

---

### 14.4 Kiểm tra HPA

```powershell
kubectl get hpa -n default
```

### Kết quả mong đợi
Có:
- `product-service-hpa`
- `order-service-hpa`
- `inventory-service-hpa`

---

### 14.5 Kiểm tra PVC

```powershell
kubectl get pvc -n default
```

### Kết quả mong đợi
Có `rabbitmq-data-pvc` và trạng thái tốt nhất là `Bound`.

Nếu PVC bị `Pending`, khả năng cao storage class chưa phù hợp.

---

### 14.6 Kiểm tra Rollout

```powershell
kubectl get rollout -n default
```

### Kết quả mong đợi
Có:
- `product-service`
- `order-service`

---

## 15. Cách kiểm tra lỗi khi pod không chạy

Đây là phần rất quan trọng cho người mới.

### Bước 1: xem danh sách pod

```powershell
kubectl get pods -n default
```

Giả sử một pod lỗi, ví dụ `product-service-xxxx`.

### Bước 2: mô tả pod

```powershell
kubectl describe pod product-service-xxxx -n default
```

### Bước 3: xem log pod

```powershell
kubectl logs product-service-xxxx -n default
```

### Những lỗi thường gặp

#### Lỗi 1: `ImagePullBackOff`
Nguyên nhân:
- image name sai
- image tag sai
- image private nhưng chưa có secret pull

Cách xử lý:
- kiểm tra `image.repository`
- kiểm tra `image.tag`

#### Lỗi 2: app crash vì thiếu database
Nguyên nhân:
- MongoDB URI placeholder chưa thay bằng giá trị thật

Cách xử lý:
- sửa trong `helm/ecom-app/values.yaml`
- rồi upgrade lại chart

#### Lỗi 3: health check fail
Nguyên nhân:
- app của bạn không có endpoint `/health`

Cách xử lý:
- sửa lại `readinessProbe` và `livenessProbe`
- hoặc thêm endpoint `/health` trong service code

---

## 16. Gỡ app nếu deploy lỗi và muốn làm lại

### Gỡ Helm release

```powershell
helm uninstall ecom-app -n default
```

### Kiểm tra lại

```powershell
kubectl get all -n default
```

### Nếu muốn xóa luôn PVC

```powershell
kubectl delete pvc rabbitmq-data-pvc -n default
```

### Lưu ý
Chỉ xóa PVC nếu bạn không cần dữ liệu cũ của RabbitMQ.

---

## 17. Cài ArgoCD, Argo Rollouts, Image Updater và Ingress Controller

Project đã có sẵn script:

`argocd/install-argocd.ps1`

### Bước 1: cho phép PowerShell chạy script tạm thời

```powershell
Set-ExecutionPolicy -Scope Process Bypass
```

Nếu bị hỏi, chọn `Y`.

### Bước 2: chạy script cài

```powershell
cd E:\project
powershell -ExecutionPolicy Bypass -File .\argocd\install-argocd.ps1
```

### Script này cài gì
- ArgoCD
- ArgoCD Image Updater
- Argo Rollouts Controller
- NGINX Ingress Controller

### Bước 3: kiểm tra pod của ArgoCD

```powershell
kubectl get pods -n argocd
```

### Kết quả mong đợi
Các pod của ArgoCD nên `Running`.

### Bước 4: kiểm tra pod của Rollouts

```powershell
kubectl get pods -n argo-rollouts
```

### Kết quả mong đợi
Rollouts controller chạy bình thường.

### Bước 5: kiểm tra ingress controller

```powershell
kubectl get pods -n ingress-nginx
```

### Kết quả mong đợi
Pod ingress controller chạy bình thường.

---

## 18. Truy cập giao diện ArgoCD

### Bước 1: lấy mật khẩu admin

```powershell
[System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String((kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}")))
```

### Kết quả mong đợi
Lệnh sẽ in ra mật khẩu dạng text.

### Bước 2: port-forward ArgoCD server

```powershell
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Giữ cửa sổ này mở.

### Bước 3: mở trình duyệt
Mở:

[https://localhost:8080](https://localhost:8080)

### Bước 4: đăng nhập
- username: `admin`
- password: chuỗi vừa giải mã được

### Kết quả mong đợi
Bạn vào được dashboard ArgoCD.

---

## 19. Cấu hình secret Git cho ArgoCD Image Updater

Phần này chỉ cần nếu bạn muốn test tự động update image qua Git.

### Bước 1: mở file secret mẫu

`E:\project\argocd\git-credentials-secret.yaml`

### Bước 2: thay giá trị mẫu

Sửa:

```yaml
stringData:
  username: <your-github-username>
  password: <your-github-personal-access-token>
```

thành tài khoản thật của bạn.

### Bước 3: apply secret

```powershell
kubectl apply -f .\argocd\git-credentials-secret.yaml
```

### Bước 4: kiểm tra secret

```powershell
kubectl get secret -n argocd
```

### Kết quả mong đợi
Có secret tên `git-creds`.

---

## 20. Triển khai app bằng ArgoCD

### Bước 1: apply Application

```powershell
kubectl apply -f .\argocd\argocd-app.yaml
```

### Bước 2: kiểm tra Application

```powershell
kubectl get applications -n argocd
```

### Kết quả mong đợi
App `ecom-app` có:
- `Synced`
- `Healthy`

### Bước 3: kiểm tra trên UI ArgoCD
Vào dashboard ArgoCD.

### Kết quả mong đợi
- thấy app `ecom-app`
- thấy cây resource bên trong app
- không có resource báo đỏ nghiêm trọng

---

## 21. Cách test Ingress trên Windows 11

### Mục tiêu
Test xem request từ ngoài có đi vào service không.

### Bước 1: sửa file hosts của Windows
Mở Notepad bằng quyền admin.

Mở file:

`C:\Windows\System32\drivers\etc\hosts`

Thêm dòng:

```text
127.0.0.1 api.ecom.local
```

### Bước 2: test bằng trình duyệt hoặc curl

```powershell
curl http://api.ecom.local/api/products
curl http://api.ecom.local/api/orders
```

### Kết quả mong đợi
- request đi được qua ingress
- nhận response từ service

### Nếu không như mong đợi
Nguyên nhân có thể là:
- ingress controller chưa chạy
- backend chưa healthy
- route `/api/products` hoặc `/api/orders` không tồn tại trong code service

---

## 22. Cách test Argo Rollouts

### Mục tiêu
Kiểm tra product-service và order-service có rollout canary đúng không.

### Cách 1: kiểm tra tồn tại rollout

```powershell
kubectl get rollout -n default
```

### Kết quả mong đợi
Có 2 rollout:
- `product-service`
- `order-service`

### Cách 2: xem chi tiết rollout
Nếu bạn đã cài plugin CLI:

```powershell
kubectl argo rollouts get rollout product-service -n default
kubectl argo rollouts get rollout order-service -n default
```

### Kết quả mong đợi
Bạn sẽ thấy rollout đi theo step.

### Kịch bản test rollout thực tế
1. mở file `helm/ecom-app/values.yaml`
2. đổi `image.tag` của `product-service`
3. nếu đang dùng ArgoCD thì commit và push lên GitHub
4. chờ ArgoCD sync
5. kiểm tra rollout progression

### Kết quả mong đợi
- rollout chạy theo các bước `setWeight`
- có `pause`
- nếu không lỗi thì promoted hoàn toàn

### Nếu không như mong đợi
Nguyên nhân có thể là:
- image mới không tồn tại
- ingress controller chưa đúng
- rollouts controller chưa chạy

---

## 23. Cách test HPA

### Mục tiêu
Kiểm tra autoscaling có hoạt động không.

### Bước 1: xem HPA

```powershell
kubectl get hpa -n default
```

### Kết quả mong đợi
Có 3 HPA.

### Bước 2: theo dõi realtime

```powershell
kubectl get hpa -n default -w
```

### Bước 3: tạo tải thử
Bạn có thể tạo nhiều request lặp lại:

```powershell
for ($i=0; $i -lt 200; $i++) { curl http://api.ecom.local/api/products }
```

### Kết quả mong đợi
Nếu cluster có `metrics-server` và service phản hồi đủ tải:
- CPU tăng
- replicas tăng

### Điều kiện bắt buộc
Cluster cần có `metrics-server`.

### Kiểm tra metrics-server

```powershell
kubectl get apiservices | findstr metrics
```

Nếu không có metrics-server, HPA có thể tồn tại nhưng không scale thật.

---

## 24. Cách test PVC và lưu trữ

### Mục tiêu
Kiểm tra RabbitMQ có volume hoạt động không.

### Bước 1: xem PVC

```powershell
kubectl get pvc -n default
```

### Kết quả mong đợi
`rabbitmq-data-pvc` ở trạng thái `Bound`.

### Bước 2: xem chi tiết PVC

```powershell
kubectl describe pvc rabbitmq-data-pvc -n default
```

### Bước 3: xem pod RabbitMQ

```powershell
kubectl describe pod -n default
```

### Kết quả mong đợi
RabbitMQ mount volume thành công.

### Nếu không như mong đợi
Nguyên nhân phổ biến:
- storage class name sai
- cluster không có provisioner tương ứng
- `create: true` nhưng provisioner không tồn tại

---

## 25. Cách test ArgoCD sync

### Mục tiêu
Kiểm tra ArgoCD có lấy manifest từ Git rồi deploy xuống cluster không.

### Bước 1: apply Application

```powershell
kubectl apply -f .\argocd\argocd-app.yaml
```

### Bước 2: kiểm tra app

```powershell
kubectl get applications -n argocd
```

### Kết quả mong đợi
- `Synced`
- `Healthy`

### Bước 3: đổi một cấu hình nhỏ trong Git
Ví dụ đổi `image.tag` hoặc replicas trong `values.yaml`, rồi push lên Git.

### Bước 4: xem ArgoCD phản ứng

Kết quả mong đợi:
- ArgoCD phát hiện thay đổi
- tự sync nếu cấu hình auto-sync đang bật

---

## 26. Cách test ArgoCD Image Updater

Phần này nâng cao hơn, nếu bạn mới học có thể làm sau.

### Điều kiện cần
- đã cài `ArgoCD Image Updater`
- secret `git-creds` đúng
- repo GitHub cho phép push
- image mới đã được push lên registry

### Bước 1: push image mới
Ví dụ push version mới cho `product-service`.

### Bước 2: xem log image updater

```powershell
kubectl logs -n argocd deployment/argocd-image-updater
```

### Kết quả mong đợi
Log cho thấy updater phát hiện image mới.

### Bước 3: kiểm tra GitHub
Mở repo GitHub xem `helm/ecom-app/values.yaml` có được đổi tag image không.

### Bước 4: kiểm tra ArgoCD
ArgoCD sẽ sync lại app sau khi Git thay đổi.

### Kết quả mong đợi
Luồng hoàn chỉnh là:
1. image mới xuất hiện
2. image updater ghi tag mới vào Git
3. ArgoCD đọc Git
4. cluster được update

---

## 27. Kịch bản test đầy đủ và kết quả mong đợi

### Kịch bản 1: test chart hợp lệ
Lệnh:

```powershell
helm lint .\helm\ecom-app
```

Kết quả mong đợi:
- chart pass
- không có chart failed

---

### Kịch bản 2: test render manifest
Lệnh:

```powershell
helm template ecom-app .\helm\ecom-app
```

Kết quả mong đợi:
- render thành công
- có đủ resource quan trọng

---

### Kịch bản 3: test deploy bằng Helm
Lệnh:

```powershell
helm install ecom-app .\helm\ecom-app -n default --create-namespace
kubectl get all -n default
```

Kết quả mong đợi:
- pod/service/deployment/rollout được tạo

---

### Kịch bản 4: test PVC
Lệnh:

```powershell
kubectl get pvc -n default
```

Kết quả mong đợi:
- `rabbitmq-data-pvc` là `Bound`

---

### Kịch bản 5: test ArgoCD
Lệnh:

```powershell
kubectl apply -f .\argocd\argocd-app.yaml
kubectl get applications -n argocd
```

Kết quả mong đợi:
- app `Synced`
- app `Healthy`

---

### Kịch bản 6: test ingress
Lệnh:

```powershell
curl http://api.ecom.local/api/products
curl http://api.ecom.local/api/orders
```

Kết quả mong đợi:
- request đi tới backend

---

### Kịch bản 7: test rollout
Lệnh:

```powershell
kubectl get rollout -n default
```

Hoặc:

```powershell
kubectl argo rollouts get rollout product-service -n default
```

Kết quả mong đợi:
- rollout tồn tại
- rollout đi theo step khi update image

---

### Kịch bản 8: test HPA
Lệnh:

```powershell
kubectl get hpa -n default -w
```

Kết quả mong đợi:
- replicas tăng khi có tải

---

### Kịch bản 9: test image updater
Lệnh:

```powershell
kubectl logs -n argocd deployment/argocd-image-updater
```

Kết quả mong đợi:
- updater phát hiện image mới
- update values trên Git
- ArgoCD sync lại

---

## 28. Những lỗi thường gặp và cách xử lý nhanh

### Lỗi: `kubectl get nodes` không ra node `Ready`
Cách xử lý:
- mở Docker Desktop
- kiểm tra Kubernetes đã bật chưa
- chờ cluster khởi động xong

### Lỗi: `helm install` fail vì PVC Pending
Cách xử lý:
- kiểm tra `kubectl get storageclass`
- sửa `values.yaml` cho đúng storage class local

### Lỗi: pod `ImagePullBackOff`
Cách xử lý:
- kiểm tra lại repository/tag image

### Lỗi: pod `CrashLoopBackOff`
Cách xử lý:
- xem `kubectl logs`
- kiểm tra secret MongoDB URI
- kiểm tra app có endpoint `/health` không

### Lỗi: ArgoCD app không `Healthy`
Cách xử lý:
- mở UI ArgoCD
- xem resource nào đỏ
- kiểm tra namespace, service, PVC, rollout

### Lỗi: ingress không vào được
Cách xử lý:
- kiểm tra `ingress-nginx` running chưa
- kiểm tra file hosts của Windows
- kiểm tra service backend có chạy không

### Lỗi: HPA không scale
Cách xử lý:
- kiểm tra metrics-server
- kiểm tra có đủ tải thực tế chưa

---

## 29. Thứ tự triển khai tốt nhất cho người mới

Mình khuyên bạn làm theo thứ tự này:

1. cài Docker Desktop và bật Kubernetes
2. cài `kubectl`
3. cài `helm`
4. chạy `kubectl get nodes`
5. chạy `kubectl get storageclass`
6. chỉnh `values.yaml` nếu storage class không phù hợp
7. chạy `helm lint`
8. chạy `helm template`
9. chạy `helm install`
10. kiểm tra pod/service/pvc/hpa/rollout
11. sau khi Helm ổn mới cài ArgoCD
12. apply `argocd-app.yaml`
13. sau cùng mới test image updater

Lý do:
- nếu Helm chưa ổn mà test ArgoCD ngay, bạn sẽ rất khó biết lỗi nằm ở đâu
- làm tuần tự sẽ dễ học hơn nhiều

---

## 30. Checklist thao tác từng bước

### Phần A: môi trường
- [ ] cài Git
- [ ] cài Docker Desktop
- [ ] bật Kubernetes
- [ ] cài kubectl
- [ ] cài Helm

### Phần B: cluster
- [ ] `kubectl get nodes`
- [ ] `kubectl get storageclass`

### Phần C: chuẩn bị chart
- [ ] mở `helm/ecom-app/values.yaml`
- [ ] sửa storage class nếu cần
- [ ] thay MongoDB URI placeholder nếu bạn có database thật

### Phần D: test Helm
- [ ] `helm lint .\helm\ecom-app`
- [ ] `helm template ecom-app .\helm\ecom-app`

### Phần E: deploy Helm
- [ ] `helm install ecom-app .\helm\ecom-app -n default --create-namespace`
- [ ] `kubectl get all -n default`
- [ ] `kubectl get ingress -n default`
- [ ] `kubectl get hpa -n default`
- [ ] `kubectl get pvc -n default`
- [ ] `kubectl get rollout -n default`

### Phần F: deploy ArgoCD
- [ ] chạy `argocd/install-argocd.ps1`
- [ ] lấy password ArgoCD
- [ ] port-forward ArgoCD UI
- [ ] đăng nhập
- [ ] apply `argocd-app.yaml`
- [ ] kiểm tra `Synced` và `Healthy`

### Phần G: test nâng cao
- [ ] test ingress
- [ ] test rollout
- [ ] test HPA
- [ ] test Image Updater

---

## 31. 5 lệnh đầu tiên bạn nên chạy ngay

Nếu bạn chưa biết bắt đầu từ đâu, hãy chạy đúng thứ tự này:

```powershell
kubectl get nodes
kubectl get storageclass
cd E:\project
helm lint .\helm\ecom-app
helm template ecom-app .\helm\ecom-app
```

Nếu các bước này ổn, làm tiếp:

```powershell
helm install ecom-app .\helm\ecom-app -n default --create-namespace
kubectl get all -n default
kubectl get pvc -n default
kubectl get hpa -n default
kubectl get rollout -n default
```

---

## 32. Gợi ý demo với giảng viên

Bạn có thể demo theo mạch sau:

### Demo 1: giải thích kiến trúc
Nói:
- em dùng Helm umbrella chart
- mỗi service là một subchart
- product/order dùng rollout, inventory dùng deployment, rabbitmq dùng PVC

### Demo 2: kiểm tra chart
Chạy:

```powershell
helm lint .\helm\ecom-app
helm template ecom-app .\helm\ecom-app
```

### Demo 3: deploy bằng Helm
Chạy:

```powershell
helm install ecom-app .\helm\ecom-app -n default --create-namespace
kubectl get all -n default
kubectl get hpa -n default
kubectl get pvc -n default
kubectl get rollout -n default
```

### Demo 4: ArgoCD
Chạy:

```powershell
kubectl apply -f .\argocd\argocd-app.yaml
kubectl get applications -n argocd
```

### Demo 5: rollout
Đổi tag image rồi cho ArgoCD sync, sau đó kiểm tra rollout.

---

## 33. Kết luận

Nếu bạn là người mới, hãy nhớ nguyên tắc đơn giản sau:

- đừng làm tất cả một lúc
- chạy Helm trước
- khi Helm ổn rồi mới sang ArgoCD
- khi ArgoCD ổn rồi mới test Image Updater

Làm theo đúng tài liệu này, bạn sẽ biết:
- cài gì trước
- chạy lệnh nào
- mong đợi điều gì
- khi lỗi thì xem ở đâu

Nếu cần, sau tài liệu này bạn có thể làm thêm 2 file nữa:
- một file checklist ngắn để demo
- một file kịch bản thuyết trình với giảng viên
