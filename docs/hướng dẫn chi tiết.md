# Hướng dẫn triển khai chi tiết dự án `ecom-app` trên Windows 11

Tài liệu này được viết lại theo đúng trạng thái hiện tại của project, dành cho người mới và bám sát những gì đang chạy trong repo này.

Mục tiêu của tài liệu:

- cài môi trường trên Windows 11
- chạy Kubernetes local bằng Docker Desktop
- build và push image backend lên Docker Hub
- triển khai ứng dụng bằng `Helm`
- triển khai ứng dụng bằng `ArgoCD`
- hiểu vai trò của `Argo Rollouts`, `HPA`, `Ingress`, `PVC`
- biết cách kiểm tra hệ thống sau deploy
- biết cách xử lý các lỗi thực tế đã gặp trong project này

---

## 1. Tổng quan hệ thống

Project hiện tại là một hệ thống e-commerce dạng microservices, gồm:

- `product-service`
- `order-service`
- `inventory-service`
- `rabbitmq`

Trong đó:

- `product-service` dùng `Argo Rollout`
- `order-service` dùng `Argo Rollout`
- `inventory-service` dùng `Deployment`
- `rabbitmq` dùng `Deployment` + `PVC`

Chart Helm chính là `helm/ecom-app`, đây là một `umbrella chart` chứa các subchart cho từng service.

---

## 2. Kiến trúc triển khai hiện tại

### 2.1 Thành phần chính

- `Helm`: dùng để đóng gói và triển khai toàn bộ ứng dụng
- `ArgoCD`: dùng để đồng bộ từ Git vào Kubernetes theo mô hình GitOps
- `Argo Rollouts`: dùng để rollout canary cho `product-service` và `order-service`
- `ArgoCD Image Updater`: dùng để cập nhật image tag trong `values.yaml`
- `NGINX Ingress Controller`: dùng để route traffic HTTP
- `HPA`: tự scale pod theo CPU
- `PVC`: lưu dữ liệu cho RabbitMQ

### 2.2 Các file quan trọng

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

### 2.3 Cấu hình image hiện tại

Chart đang dùng:

- registry: `docker.io`
- owner: `buiducthien090605`
- imagePullPolicy: `Always`

Các image service hiện tại trong `values.yaml` là:

- `my-product-service:latest`
- `my-order-service:latest`
- `my-inventory-service:latest`

Khi render thực tế, image đầy đủ sẽ là:

- `docker.io/buiducthien090605/my-product-service:latest`
- `docker.io/buiducthien090605/my-order-service:latest`
- `docker.io/buiducthien090605/my-inventory-service:latest`

---

## 3. Điều kiện cần trước khi triển khai

Bạn cần cài các công cụ sau trên Windows 11:

- `Git`
- `Docker Desktop`
- `kubectl`
- `Helm`
- `PowerShell`
- nên có thêm `kubectl argo rollouts` nếu muốn xem dashboard rollout

---

## 4. Cài Git

Tải tại:

[https://git-scm.com/download/win](https://git-scm.com/download/win)

Sau khi cài xong, kiểm tra:

```powershell
git --version
```

Kết quả mong đợi:

```text
git version 2.xx.x.windows.x
```

---

## 5. Cài Docker Desktop và bật Kubernetes

Tải Docker Desktop tại:

[https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

Sau khi cài:

1. mở Docker Desktop
2. vào `Settings`
3. chọn `Kubernetes`
4. bật `Enable Kubernetes`
5. bấm `Apply & Restart`

Đợi cluster local khởi động xong.

Kiểm tra:

```powershell
kubectl get nodes
```

Kết quả mong đợi:

```text
NAME             STATUS   ROLES           AGE   VERSION
docker-desktop   Ready    control-plane   ...   ...
```

---

## 6. Cài `kubectl`

Nếu chưa có:

```powershell
winget install -e --id Kubernetes.kubectl
```

Kiểm tra:

```powershell
kubectl version --client
```

---

## 7. Cài Helm

Cài bằng `winget`:

```powershell
winget install Helm.Helm
```

Kiểm tra:

```powershell
helm version
```

---

## 8. Mở đúng thư mục project

Di chuyển vào thư mục project:

```powershell
cd C:\Users\DELL\Documents\GitHub\project
```

Từ đây về sau, mọi lệnh đều giả sử bạn đang đứng tại thư mục này.

---

## 9. Kiểm tra cluster local trước khi deploy

### 9.1 Kiểm tra namespace và node

```powershell
kubectl get nodes
kubectl get ns
```

### 9.2 Kiểm tra storage class

Project hiện tại cấu hình:

- `global.storageClass.name: hostpath`
- `global.storageClass.create: false`

Điều đó nghĩa là chart đang kỳ vọng cluster đã có sẵn storage class tên `hostpath`.

Kiểm tra:

```powershell
kubectl get storageclass
```

Trên Docker Desktop, thông thường sẽ có `hostpath` hoặc storage class mặc định tương tự.

Nếu không có `hostpath`, bạn có 2 cách:

- đổi `global.storageClass.name` trong `helm/ecom-app/values.yaml` sang tên storage class đang tồn tại
- hoặc tạo một storage class phù hợp trước khi deploy

---

## 10. Kiểm tra ingress host local

Project hiện dùng host:

- `api.ecom.local`

Giá trị này nằm trong `helm/ecom-app/values.yaml`:

- `global.serviceHost: api.ecom.local`

Bạn nên thêm vào file `hosts` của Windows:

```text
127.0.0.1 api.ecom.local
```

Cách sửa file hosts:

1. mở Notepad bằng quyền Administrator
2. mở file:

```text
C:\Windows\System32\drivers\etc\hosts
```

3. thêm dòng:

```text
127.0.0.1 api.ecom.local
```

---

## 11. Cấu trúc chart Helm hiện tại

### 11.1 Chart cha

`helm/ecom-app/Chart.yaml` định nghĩa đây là chart loại application và khai báo 4 dependency:

- `product-service`
- `order-service`
- `inventory-service`
- `rabbitmq`

### 11.2 values chính

File `helm/ecom-app/values.yaml` chứa:

- cấu hình global
- port cho từng service
- image repository/tag cho từng service
- rollout steps
- resource requests/limits
- HPA
- thông tin kết nối MongoDB
- cấu hình RabbitMQ persistence

---

## 12. Chuẩn bị image backend trước khi deploy

Vì cluster sẽ pull image từ Docker Hub, bạn cần chắc rằng image đã tồn tại trên registry.

### 12.1 Đăng nhập Docker Hub

```powershell
docker login --username buiducthien090605
```

Sau đó nhập password hoặc Personal Access Token.

Nếu thành công, bạn sẽ thấy:

```text
Login Succeeded
```

### 12.2 Build image cho Product Service

```powershell
cd C:\Users\DELL\Documents\GitHub\project\backend\Product_Service
docker build -t buiducthien090605/my-product-service:latest .
```

### 12.3 Build image cho Order Service

```powershell
cd C:\Users\DELL\Documents\GitHub\project\backend\Order_Service
docker build -t buiducthien090605/my-order-service:latest .
```

### 12.4 Build image cho Inventory Service

```powershell
cd C:\Users\DELL\Documents\GitHub\project\backend\Inventory_Service
docker build -t buiducthien090605/my-inventory-service:latest .
```

### 12.5 Push image lên Docker Hub

```powershell
docker push buiducthien090605/my-product-service:latest
docker push buiducthien090605/my-order-service:latest
docker push buiducthien090605/my-inventory-service:latest
```

Nếu bị lỗi kiểu:

```text
push access denied, repository does not exist or may require authorization
```

thì nguyên nhân thường là:

- chưa `docker login`
- đang push sai namespace Docker Hub
- repo chưa tồn tại hoặc tài khoản không có quyền push

---

## 13. Vì sao project cần `/health`

Trong trạng thái hiện tại, cả 3 backend service đều đã có endpoint:

- `GET /health`

Mục đích:

- phục vụ `readinessProbe`
- phục vụ `livenessProbe`
- giúp pod không bị `CrashLoopBackOff` do probe sai endpoint

Nếu service chưa có `/health` mà chart lại probe vào `/health`, pod sẽ fail health check.

Đây là lỗi thực tế đã gặp trước đó trong project này.

---

## 14. Deploy bằng Helm

### 14.1 Kiểm tra chart trước khi deploy

```powershell
cd C:\Users\DELL\Documents\GitHub\project
helm lint helm/ecom-app
```

Kết quả mong đợi:

```text
1 chart(s) linted, 0 chart(s) failed
```

### 14.2 Render thử manifest

```powershell
helm template ecom-app helm/ecom-app -n default
```

Nếu render không báo lỗi, chart hợp lệ ở mức template.

### 14.3 Deploy chart

```powershell
helm upgrade --install ecom-app helm/ecom-app -n default
```

Kết quả mong đợi:

```text
Release "ecom-app" has been upgraded. Happy Helming!
```

Hoặc ở lần đầu:

```text
Release "ecom-app" does not exist. Installing it now.
```

---

## 15. Kiểm tra sau khi deploy Helm

### 15.1 Kiểm tra pod

```powershell
kubectl get pods -n default
```

Kết quả tốt là các pod đều `Running` và `READY` đủ số lượng.

Ví dụ:

```text
inventory-service-xxxxx   1/1   Running
order-service-xxxxx       1/1   Running
product-service-xxxxx     1/1   Running
rabbitmq-xxxxx            1/1   Running
```

### 15.2 Kiểm tra deployment, rollout, service

```powershell
kubectl get deploy,rollout,svc -n default
```

Bạn nên thấy:

- `deployment.apps/inventory-service`
- `deployment.apps/rabbitmq`
- `rollout.argoproj.io/order-service`
- `rollout.argoproj.io/product-service`
- các service tương ứng

### 15.3 Kiểm tra log từng service

```powershell
kubectl logs -n default deployment/inventory-service --tail=30
kubectl logs -n default <order-pod-name> --tail=30
kubectl logs -n default <product-pod-name> --tail=30
```

Dấu hiệu tốt trong log:

- `InventoryDB connected`
- `OrderDB connected`
- `ProductDB conected`
- `RabbitMQ Connected - Ready to publish events`

---

## 16. Endpoint quan trọng sau deploy

### 16.1 Health check

- `http://api.ecom.local/health` chỉ dùng được nếu ingress map root path phù hợp
- thực tế thường sẽ kiểm tra qua pod/service hoặc port-forward

Bạn cũng có thể kiểm tra nội bộ bằng port-forward hoặc gọi trực tiếp vào service.

### 16.2 Swagger

Các service hiện expose Swagger tại:

- Product: `/api-docs`
- Order: `/api-docs`
- Inventory: `/api-docs`

### 16.3 API path theo ingress hiện tại

- Product: `/api/products`
- Order: `/api/orders`
- Inventory: nếu chart của bạn có ingress riêng thì kiểm tra thêm template tương ứng

---

## 17. Argo Rollouts trong project này hoạt động thế nào

`product-service` và `order-service` dùng `Rollout` thay cho `Deployment`.

Canary steps hiện tại là:

- 20%
- pause 60 giây
- 60%
- pause 60 giây
- sau đó lên stable hoàn toàn

Điều này được cấu hình trong `values.yaml` ở phần:

- `product-service.rollout.steps`
- `order-service.rollout.steps`

---

## 18. Lỗi thực tế đã gặp: conflict giữa Helm và Argo Rollouts

### 18.1 Triệu chứng

Trước khi sửa, `helm upgrade` bị lỗi kiểu:

```text
conflict occurred while applying object ... Service ... conflict with "rollouts-controller" using v1: .spec.selector
```

### 18.2 Nguyên nhân

Argo Rollouts tự quản lý `Service.spec.selector` cho:

- `order-service`
- `order-service-canary`
- `product-service`
- `product-service-canary`

Nếu Helm template cũng cố định `selector` trong các Service này, khi upgrade sẽ xảy ra conflict ownership.

### 18.3 Cách sửa đúng

Đã sửa chart để:

- bỏ `selector` khỏi service template của `order-service`
- bỏ `selector` khỏi service template của `product-service`

Từ đó Argo Rollouts toàn quyền cập nhật selector theo `rollouts-pod-template-hash`.

Sau khi sửa, `helm upgrade --install` chạy thành công trở lại.

---

## 19. Cài ArgoCD, Argo Rollouts và Image Updater

Project đã có sẵn script:

- `argocd/install-argocd.ps1`

Chạy script bằng PowerShell:

```powershell
cd C:\Users\DELL\Documents\GitHub\project
powershell -ExecutionPolicy Bypass -File .\argocd\install-argocd.ps1
```

Script này sẽ:

1. tạo namespace `argocd`
2. tạo namespace `argo-rollouts`
3. cài ArgoCD
4. cài ArgoCD Image Updater
5. cài Argo Rollouts Controller
6. cài NGINX Ingress Controller
7. đợi `argocd-server` sẵn sàng

Sau khi cài xong, script sẽ in ra:

- mật khẩu admin ban đầu của ArgoCD
- lệnh port-forward vào ArgoCD UI
- gợi ý mở Argo Rollouts dashboard

---

## 20. Mở ArgoCD UI

Port-forward:

```powershell
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Mở trình duyệt:

[https://localhost:8080](https://localhost:8080)

Lấy password admin:

```powershell
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}"
```

Nếu cần decode trong PowerShell:

```powershell
[System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String((kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}")))
```

---

## 21. Cấu hình Git credentials cho ArgoCD Image Updater

File mẫu:

- `argocd/git-credentials-secret.yaml`

Bạn cần sửa:

- `username: <your-github-username>`
- `password: <your-github-personal-access-token>`

Sau đó apply:

```powershell
kubectl apply -f .\argocd\git-credentials-secret.yaml
```

Lưu ý quan trọng:

- không commit token thật vào Git
- tốt nhất dùng secret ngoài hoặc tạo file local riêng khi demo

---

## 22. Deploy app bằng ArgoCD

Project đã có Application manifest:

- `argocd/argocd-app.yaml`

Manifest này đang trỏ tới:

- repo: `https://github.com/buiducthien090605/project.git`
- branch: `main`
- path: `helm/ecom-app`
- namespace đích: `default`

Để tạo app trong ArgoCD:

```powershell
kubectl apply -f .\argocd\argocd-app.yaml
```

Kiểm tra:

```powershell
kubectl get applications -n argocd
```

---

## 23. ArgoCD Image Updater trong project này

`argocd/argocd-app.yaml` hiện đã khai báo annotation cho 3 image:

- product
- order
- inventory

Write-back target hiện tại là:

- `helm/ecom-app/values.yaml`

Nghĩa là khi phát hiện image mới, Image Updater có thể ghi ngược tag mới về Git vào file `values.yaml`.

---

## 24. Kiểm tra HPA

Project hiện bật HPA cho:

- `product-service`
- `order-service`
- `inventory-service`

Kiểm tra:

```powershell
kubectl get hpa -n default
```

Bạn sẽ thấy:

- min replicas: `2`
- max replicas: `10`
- CPU target: `60%`

Lưu ý: để HPA hoạt động đầy đủ, cluster cần có `metrics-server`.

Nếu chạy local mà chưa có metrics-server, HPA có thể tồn tại nhưng không scale đúng do thiếu metric.

---

## 25. Kiểm tra RabbitMQ persistence

Kiểm tra PVC:

```powershell
kubectl get pvc -n default
```

Kiểm tra deployment RabbitMQ:

```powershell
kubectl get deploy rabbitmq -n default
kubectl logs deployment/rabbitmq -n default --tail=50
```

Mục tiêu là đảm bảo RabbitMQ có volume bền vững và không mất dữ liệu khi pod restart.

---

## 26. Kịch bản triển khai, hướng dẫn test và kết quả mong đợi

Phần này dùng để demo, nghiệm thu, hoặc trình bày với giảng viên theo từng tình huống rõ ràng.

### 26.1 Kịch bản 1: build lại một service khi code thay đổi

Khi bạn sửa code của một service, ví dụ `product-service`, thì nguyên tắc đúng là:

- chỉ build lại image của service đó
- chỉ push lại image của service đó
- cập nhật tag image của service đó
- để ArgoCD đồng bộ phần thay đổi xuống cluster
- nếu service đó dùng Argo Rollouts thì rollout theo canary hoặc blue-green

Ví dụ với `product-service`:

```powershell
cd C:\Users\DELL\Documents\GitHub\project\backend\Product_Service
docker build -t buiducthien090605/my-product-service:latest .
docker push buiducthien090605/my-product-service:latest
```

Sau đó cập nhật tag trong `helm/ecom-app/values.yaml` hoặc để `ArgoCD Image Updater` cập nhật tự động.

#### Cách test

1. kiểm tra image mới đã được push
2. kiểm tra ArgoCD app chuyển sang trạng thái `OutOfSync` rồi `Synced`
3. kiểm tra `kubectl get rollout -n default`
4. kiểm tra pod mới được tạo
5. kiểm tra log service mới
6. gọi endpoint `/health`

#### Kết quả mong đợi

- chỉ service vừa thay đổi được rollout lại
- service còn lại không bị build/deploy lại
- pod mới lên `Running`
- log không có lỗi kết nối DB/RabbitMQ
- endpoint `/health` trả về `200 OK`

### 26.2 Kịch bản 2: thay đổi cấu hình `ConfigMap`

Ví dụ thay đổi:

- port nội bộ
- `OTEL_SERVICE_NAME`
- `PRODUCT_SERVICE_URL`
- host dùng chung trong app

#### Cách thực hiện

1. sửa `helm/ecom-app/values.yaml`
2. chạy `helm lint`
3. deploy lại bằng Helm hoặc commit để ArgoCD sync

```powershell
helm lint helm/ecom-app
helm upgrade --install ecom-app helm/ecom-app -n default
```

#### Cách test

1. kiểm tra ConfigMap trong cluster:

```powershell
kubectl get configmap -n default
kubectl describe configmap order-service-config -n default
```

2. kiểm tra rollout hoặc restart pod nếu cần
3. kiểm tra log service
4. gọi API tương ứng

#### Kết quả mong đợi

- ConfigMap mới xuất hiện trong cluster
- pod dùng cấu hình mới
- ứng dụng vẫn hoạt động bình thường
- không phát sinh `CrashLoopBackOff`

### 26.3 Kịch bản 3: thay đổi Secret kết nối database

Ví dụ thay đổi MongoDB URI.

#### Cách thực hiện

1. cập nhật secret trong chart hoặc secret external
2. deploy lại chart
3. theo dõi log service

#### Cách test

```powershell
kubectl get secret -n default
kubectl logs <pod-name> -n default --tail=50
```

#### Kết quả mong đợi

- service connect được DB
- log hiển thị `ProductDB conected`, `OrderDB connected`, hoặc `InventoryDB connected`
- pod không restart liên tục

### 26.4 Kịch bản 4: kiểm thử sau deploy toàn hệ thống

Sau khi deploy xong toàn bộ chart, hãy chạy checklist test sau.

#### Test 1: kiểm tra tài nguyên Kubernetes

```powershell
kubectl get pods -n default
kubectl get deploy,rollout,svc -n default
kubectl get hpa -n default
kubectl get pvc -n default
```

##### Kết quả mong đợi

- tất cả pod ở trạng thái `Running`
- `inventory-service` là `Deployment`
- `order-service` và `product-service` là `Rollout`
- HPA được tạo
- PVC của RabbitMQ được tạo thành công

#### Test 2: kiểm tra health endpoint

Có thể dùng port-forward hoặc test nội bộ từ service.

Ví dụ port-forward `inventory-service`:

```powershell
kubectl port-forward svc/inventory-service -n default 3003:3003
```

Sau đó gọi:

```powershell
curl http://localhost:3003/health
```

Làm tương tự với `3001` và `3002` cho `product-service` và `order-service`.

##### Kết quả mong đợi

Trả về JSON tương tự:

```json
{
  "status": "OK",
  "service": "inventory-service",
  "time": "2026-06-07T..."
}
```

#### Test 3: kiểm tra Swagger

Port-forward service tương ứng hoặc truy cập qua ingress, sau đó mở:

- `http://localhost:3001/api-docs`
- `http://localhost:3002/api-docs`
- `http://localhost:3003/api-docs`

##### Kết quả mong đợi

- giao diện Swagger UI mở được
- có danh sách API endpoint

#### Test 4: kiểm tra log runtime

```powershell
kubectl logs -n default deployment/inventory-service --tail=30
kubectl logs -n default <order-pod-name> --tail=30
kubectl logs -n default <product-pod-name> --tail=30
```

##### Kết quả mong đợi

- service khởi động thành công
- không có lỗi `ENOTFOUND`
- không có lỗi `connection refused`
- `Order Service` kết nối được RabbitMQ

### 26.5 Kịch bản 5: rollout thất bại và rollback

Nếu image mới lỗi hoặc app không pass health check:

- pod mới sẽ không healthy
- rollout có thể dừng ở giữa
- Argo Rollouts cho phép rollback/promote tùy chiến lược

#### Cách test

1. cố tình deploy image lỗi
2. quan sát pod mới
3. quan sát rollout
4. kiểm tra service stable còn giữ traffic hay không

#### Kết quả mong đợi

- traffic không chuyển hoàn toàn sang bản lỗi nếu đang dùng canary đúng cách
- service stable vẫn còn khả năng phục vụ
- có thể rollback nhanh về phiên bản trước

---

## 27. Thiết kế CI/CD nên tách riêng: `CI -> GitHub Actions`, `CD -> ArgoCD`

Trong project này, hướng thiết kế tốt hơn là tách rõ:

- `CI`: dùng `GitHub Actions`
- `CD`: dùng `ArgoCD`

Lý do:

- CI tập trung vào kiểm tra chất lượng mã nguồn, build, scan bảo mật và tạo image
- CD tập trung vào đồng bộ manifest/Helm từ Git xuống cluster
- giúp pipeline rõ ràng, dễ debug, dễ mở rộng
- đúng với mô hình GitOps hiện đại

### 27.1 Vai trò của CI

CI nên làm các việc sau cho từng service:

- checkout source code
- cài dependency
- chạy test
- chạy static analysis
- chạy `SonarQube`
- chờ `Quality Gate`
- chạy `Snyk`
- chạy `Trivy`
- build image
- push image
- cập nhật image tag vào nơi được quản lý

### 27.2 Vai trò của CD

CD nên làm các việc sau:

- ArgoCD theo dõi repo Git
- khi `values.yaml` hoặc chart thay đổi, ArgoCD sync xuống cluster
- với service dùng `Rollout`, rollout được thực hiện theo canary hoặc blue-green
- có thể dùng `ArgoCD Image Updater` để cập nhật tag image vào Git

### 27.3 Vì sao mỗi service nên là một workflow riêng

Bạn đã định hướng đúng: mỗi service nên có workflow CI riêng, sau đó được gọi từ main workflow.

Ví dụ nên tách:

- `ci-product-service.yml`
- `ci-order-service.yml`
- `ci-inventory-service.yml`
- `ci-rabbitmq.yml` nếu cần scan manifest/image base
- `main-ci.yml` để điều phối

Lợi ích:

- tránh file workflow quá dài
- dễ tái sử dụng
- dễ bảo trì
- chỉ chạy đúng service bị thay đổi
- phù hợp với reusable workflow của GitHub Actions theo `workflow_call`

Theo GitHub Docs, reusable workflow nên dùng `on: workflow_call` và được gọi ở cấp `job` bằng `uses:`.

Tài liệu tham khảo:

- [Reuse workflows - GitHub Docs](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows)

### 27.4 Gợi ý cấu trúc workflow

```text
.github/
  workflows/
    main-ci.yml
    ci-product-service.yml
    ci-order-service.yml
    ci-inventory-service.yml
    job-sonarqube.yml
    job-quality-gate.yml
    job-snyk.yml
    job-trivy.yml
```

### 27.5 Main workflow nên làm gì

`main-ci.yml` có vai trò điều phối.

Ví dụ:

- phát hiện thư mục nào thay đổi
- gọi reusable workflow tương ứng cho từng service
- chỉ gọi `product-service` khi `backend/Product_Service/**` thay đổi
- chỉ gọi `order-service` khi `backend/Order_Service/**` thay đổi
- chỉ gọi `inventory-service` khi `backend/Inventory_Service/**` thay đổi

Tư duy quan trọng:

- code service nào đổi thì build/deploy lại service đó
- không nên build lại toàn bộ nếu không cần

### 27.6 Các workflow kiểm tra nên tách riêng

Bạn cũng định hướng đúng ở phần này. Các bước như:

- `SonarQube`
- `Quality Gate`
- `Snyk`
- `Trivy`

nên được tách thành workflow hoặc module reusable riêng để tái sử dụng cho nhiều service.

Ví dụ:

- `job-sonarqube.yml`
- `job-quality-gate.yml`
- `job-snyk.yml`
- `job-trivy.yml`

Mỗi workflow nhận input như:

- `service_name`
- `working_directory`
- `image_name`
- `image_tag`

### 27.7 Chuỗi CI đề xuất cho từng service

Với mỗi service, pipeline nên có các job theo thứ tự:

1. `test`
2. `sonarqube`
3. `quality-gate`
4. `snyk`
5. `trivy`
6. `build-and-push`
7. `update-image-tag`

#### Kết quả mong đợi

- chỉ service thay đổi mới chạy pipeline riêng của nó
- nếu quality gate fail thì không được build/push
- nếu Snyk/Trivy phát hiện mức độ nghiêm trọng vượt ngưỡng thì pipeline fail
- khi build/push thành công, image tag mới được cập nhật
- ArgoCD phát hiện thay đổi Git và tự sync

---

## 28. Thiết kế CD với ArgoCD và Argo Rollouts

### 28.1 ArgoCD nên là lớp CD chính

ArgoCD nên theo dõi repo chứa:

- chart Helm
- `values.yaml`
- các manifest phụ trợ

Khi có thay đổi hợp lệ trong Git, ArgoCD sẽ sync xuống cluster.

Điểm tốt của cách này:

- không deploy trực tiếp từ GitHub Actions vào cluster
- tránh để CI kiêm luôn CD
- trạng thái triển khai được quản lý tập trung trong ArgoCD

### 28.2 Argo Rollouts cho progressive delivery

Phần CD nên kết hợp `Argo Rollouts` để triển khai an toàn hơn.

Hai chiến lược chính:

- `Canary`
- `Blue-Green`

Theo tài liệu Argo Rollouts, controller này hỗ trợ canary, blue-green, traffic shifting, automated promotion/rollback và tích hợp với ingress controller.

Tài liệu tham khảo:

- [Argo Rollouts](https://argoproj.github.io/rollouts/)

### 28.3 Khi nào nên dùng Canary

Nên dùng `Canary` khi:

- muốn tăng traffic dần dần
- muốn giảm blast radius khi bản mới lỗi
- muốn theo dõi log, metric, error rate theo từng bước
- đã có ingress controller hoặc traffic routing phù hợp

Ví dụ chuỗi step:

- 20%
- pause 60 giây
- 60%
- pause 60 giây
- 100%

Đây cũng là cách `product-service` và `order-service` đang làm trong project hiện tại.

### 28.4 Khi nào nên dùng Blue-Green

Nên dùng `Blue-Green` khi:

- muốn dễ rollback
- muốn có `active service` và `preview service`
- muốn test bản mới trước khi chuyển traffic toàn phần
- muốn ít phụ thuộc hơn vào traffic splitting chi tiết

Blue-Green thường dễ giải thích khi demo, nhưng sẽ tốn tài nguyên hơn vì 2 phiên bản cùng tồn tại trong một khoảng thời gian.

### 28.5 Kiểm thử rollout canary

#### Cách test

1. deploy image tag mới
2. kiểm tra `kubectl get rollout -n default`
3. kiểm tra service stable/canary
4. kiểm tra log pod mới
5. test API trong thời gian pause

#### Kết quả mong đợi

- service stable vẫn phục vụ traffic
- service canary nhận một phần traffic
- sau mỗi bước pause, có thể quan sát log và health
- nếu tốt, rollout tiến lên bước kế tiếp

### 28.6 Kiểm thử rollout blue-green

#### Cách test

1. deploy version mới
2. kiểm tra `preview service`
3. test version mới qua preview
4. promote sang `active service`

#### Kết quả mong đợi

- active service vẫn trỏ vào phiên bản cũ trước khi promote
- preview service trỏ vào phiên bản mới
- sau promote, active service chuyển sang phiên bản mới
- nếu lỗi, rollback nhanh bằng cách chuyển active về bản cũ

---

## 29. File cấu hình Kubernetes nên có gì ngoài `Deployment`/`Service`

Ngoài `Deployment` hoặc `Rollout` và `Service`, một hệ thống production-ready nên có thêm:

- `ConfigMap`
- `Secret`
- `PersistentVolumeClaim`
- `StorageClass`
- `Ingress`
- `HorizontalPodAutoscaler`
- `PodDisruptionBudget` nếu cần
- `NetworkPolicy` nếu cần tăng bảo mật

### 29.1 `ConfigMap`

Dùng cho:

- port
- endpoint nội bộ
- cấu hình feature flag đơn giản
- thông số quan sát như tên service cho telemetry

### 29.2 `Secret`

Dùng cho:

- MongoDB URI
- token
- mật khẩu
- credential của hệ thống ngoài

Khuyến nghị:

- không hard-code secret thật vào Git
- nên dùng external secret, sealed secret hoặc secret manager khi làm production

### 29.3 `Persistent Storage`

RabbitMQ là ví dụ rõ nhất cần persistent storage.

Các lựa chọn distributed storage nên tham khảo:

- `Longhorn`
- `Rook/Ceph`

Nếu chạy local trên Docker Desktop thì có thể dùng `hostpath`.

Nếu chạy môi trường gần production hoặc cluster nhiều node, nên dùng distributed storage để đảm bảo dữ liệu bền vững hơn.

### 29.4 Dùng Helm để quản lý toàn bộ

Các tài nguyên sau nên được quản lý tập trung bằng Helm:

- workload
- service
- configmap
- secret template
- pvc
- storageclass
- ingress
- hpa

Như vậy bạn chỉ cần quản lý cấu hình qua:

- `Chart.yaml`
- `values.yaml`
- `templates/*.yaml`

---

## 30. Cập nhật image tag bằng ArgoCD Image Updater

Thay vì chỉnh tay `values.yaml` sau mỗi lần build image, bạn có thể dùng `ArgoCD Image Updater`.

Trong project hiện tại, file `argocd/argocd-app.yaml` đã có annotation cho:

- `product-service`
- `order-service`
- `inventory-service`

Nó có thể:

- phát hiện tag image mới
- cập nhật giá trị image tag vào `helm/ecom-app/values.yaml`
- commit ngược lại Git
- để ArgoCD sync thay đổi mới đó xuống cluster

### 30.1 Quy trình hoạt động đề xuất

1. developer push code
2. GitHub Actions chạy CI cho đúng service thay đổi
3. image mới được build và push
4. ArgoCD Image Updater phát hiện tag mới hoặc CI cập nhật tag vào Git
5. Git thay đổi `values.yaml`
6. ArgoCD sync chart mới
7. Rollout diễn ra theo canary hoặc blue-green

### 30.2 Kết quả mong đợi

- tag image trong Git luôn phản ánh đúng version đang deploy
- dễ audit
- dễ rollback
- đúng tinh thần GitOps

---

## 31. Checklist triển khai hoàn chỉnh

Khi demo hoặc bàn giao, bạn có thể đi theo checklist sau:

### Bước 1: kiểm tra công cụ

```powershell
git --version
docker --version
kubectl version --client
helm version
```

### Bước 2: kiểm tra cluster

```powershell
kubectl get nodes
kubectl get storageclass
```

### Bước 3: đăng nhập Docker Hub

```powershell
docker login --username buiducthien090605
```

### Bước 4: build image

```powershell
docker build -t buiducthien090605/my-product-service:latest .
docker build -t buiducthien090605/my-order-service:latest .
docker build -t buiducthien090605/my-inventory-service:latest .
```

### Bước 5: push image

```powershell
docker push buiducthien090605/my-product-service:latest
docker push buiducthien090605/my-order-service:latest
docker push buiducthien090605/my-inventory-service:latest
```

### Bước 6: lint chart

```powershell
helm lint helm/ecom-app
```

### Bước 7: deploy chart

```powershell
helm upgrade --install ecom-app helm/ecom-app -n default
```

### Bước 8: kiểm tra pod

```powershell
kubectl get pods -n default
kubectl get deploy,rollout,svc -n default
```

### Bước 9: kiểm tra log

```powershell
kubectl logs -n default deployment/inventory-service --tail=30
```

### Bước 10: cài Argo stack nếu cần demo GitOps

```powershell
powershell -ExecutionPolicy Bypass -File .\argocd\install-argocd.ps1
kubectl apply -f .\argocd\git-credentials-secret.yaml
kubectl apply -f .\argocd\argocd-app.yaml
```

---

## 32. Các lỗi thường gặp và cách xử lý

### 27.1 Pod `CrashLoopBackOff`

Nguyên nhân thường gặp:

- probe gọi vào endpoint không tồn tại
- app không connect được MongoDB
- app không connect được RabbitMQ
- image được deploy không phải image mới nhất

Cách kiểm tra:

```powershell
kubectl logs <pod-name> -n default
kubectl describe pod <pod-name> -n default
```

### 27.2 Lỗi MongoDB `ENOTFOUND`

Nếu log có dạng:

```text
getaddrinfo ENOTFOUND mongodb.example.local
```

thì URI MongoDB đang sai hostname hoặc dùng placeholder chưa thay bằng giá trị thật.

Cần kiểm tra lại:

- `helm/ecom-app/values.yaml`
- secret MongoDB render ra cluster

### 27.3 `helm upgrade` conflict với Rollouts

Nếu gặp lỗi conflict `.spec.selector`, kiểm tra xem service của rollout có đang bị Helm quản lý selector hay không.

Với project hiện tại, lỗi này đã được sửa bằng cách bỏ `selector` khỏi service template của rollout services.

### 27.4 Push Docker bị `insufficient_scope`

Nguyên nhân:

- chưa login Docker Hub
- login sai tài khoản
- push vào repo không có quyền

Cách xử lý:

```powershell
docker login --username <your-user>
```

### 27.5 HPA không có số liệu

Nếu `kubectl get hpa` không hiển thị CPU metric hợp lệ, nhiều khả năng cluster local chưa có `metrics-server`.

---

## 33. Khuyến nghị để project ổn định hơn

Đây là các cải tiến nên làm tiếp:

1. không dùng `latest`, hãy dùng tag theo version hoặc commit SHA
2. không để MongoDB URI thật trong `values.yaml`, nên chuyển sang external secret hoặc sealed secret
3. thêm smoke test sau deploy cho `/health`
4. thêm CI pipeline build + push + update values tự động
5. thêm tài liệu rollback khi rollout lỗi
6. cài `metrics-server` nếu muốn demo HPA đầy đủ trên local

---

## 34. Trạng thái tốt cuối cùng cần đạt

Bạn có thể xem là triển khai thành công khi:

- `helm lint` pass
- `helm upgrade --install` thành công
- `kubectl get pods -n default` cho thấy mọi pod `Running`
- `kubectl get deploy,rollout,svc -n default` hiển thị đủ tài nguyên
- log của từng service xác nhận đã connect DB/RabbitMQ thành công
- ArgoCD UI truy cập được
- ArgoCD Application sync thành công

---

## 35. Lệnh tham chiếu nhanh

### Build và push image

```powershell
cd C:\Users\DELL\Documents\GitHub\project\backend\Product_Service
docker build -t buiducthien090605/my-product-service:latest .
docker push buiducthien090605/my-product-service:latest

cd C:\Users\DELL\Documents\GitHub\project\backend\Order_Service
docker build -t buiducthien090605/my-order-service:latest .
docker push buiducthien090605/my-order-service:latest

cd C:\Users\DELL\Documents\GitHub\project\backend\Inventory_Service
docker build -t buiducthien090605/my-inventory-service:latest .
docker push buiducthien090605/my-inventory-service:latest
```

### Helm

```powershell
cd C:\Users\DELL\Documents\GitHub\project
helm lint helm/ecom-app
helm template ecom-app helm/ecom-app -n default
helm upgrade --install ecom-app helm/ecom-app -n default
```

### Kubernetes

```powershell
kubectl get pods -n default
kubectl get deploy,rollout,svc -n default
kubectl get hpa -n default
kubectl get pvc -n default
kubectl logs -n default deployment/inventory-service --tail=30
```

### ArgoCD

```powershell
powershell -ExecutionPolicy Bypass -File .\argocd\install-argocd.ps1
kubectl apply -f .\argocd\git-credentials-secret.yaml
kubectl apply -f .\argocd\argocd-app.yaml
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

---

## 36. Kết luận

Với repo hiện tại, cách triển khai đúng và ổn định nhất là:

1. đảm bảo image trên Docker Hub luôn tồn tại và đúng tên
2. đảm bảo các service backend có `/health`
3. deploy bằng `helm upgrade --install`
4. để Argo Rollouts quản lý selector của các service canary/stable
5. dùng ArgoCD khi cần trình bày GitOps và tự động đồng bộ từ Git

Nếu bạn muốn, bước tiếp theo mình có thể viết thêm cho bạn một trong 3 tài liệu phụ sau:

- `Hướng dẫn demo project trước giảng viên`
- `Hướng dẫn xử lý sự cố thường gặp`
- `Hướng dẫn triển khai ngắn gọn 1 trang để nộp báo cáo`
