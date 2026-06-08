# Kịch bản test yêu cầu của thầy

File này **chỉ dùng để test xem project đã đáp ứng yêu cầu của thầy đến đâu**.

Không viết dài dòng, không dùng để thuyết trình. Chỉ có:

- cần mở gì
- gõ lệnh gì
- nhìn kết quả gì
- nếu ra như vậy thì kết luận đạt hay chưa

---

# 0. Bắt đầu từ đâu nếu vừa mở máy lại hoặc đang dùng máy mới

Phần này dành cho 2 tình huống:

1. **Bạn vừa bật máy lại** và muốn test đồ án tiếp.
2. **Bạn đang dùng máy mới** hoặc máy khác, vừa pull code project về.

Nếu bạn đã làm project trên máy này rồi và mọi thứ đang chạy sẵn, bạn vẫn nên đọc nhanh phần này để biết phải mở gì trước.

---

## 0.1. Bạn cần có những thứ gì trên máy

Trên máy Windows 11, để test được project này, tối thiểu nên có:

- **Git**
- **Docker Desktop**
- **Kubernetes** trong Docker Desktop
- **kubectl**
- **Helm**
- **Cursor** hoặc **VS Code**
- **Trình duyệt** như Chrome hoặc Edge
- **Tài khoản GitHub** để pull code và xem GitHub Actions

---

## 0.2. Nếu là máy mới, kiểm tra xem đã cài Git chưa

### Cách làm

1. Nhấn nút **Start**.
2. Gõ:

```text
PowerShell
```

3. Mở **PowerShell**.
4. Gõ lệnh này:

```powershell
git --version
```

### Nếu thấy ra phiên bản

Ví dụ kiểu:

```text
git version 2.xx.x.windows.x
```

thì nghĩa là **đã có Git**.

### Nếu báo lỗi không nhận `git`

Bạn cần cài Git.

### Cách cài Git

1. Mở trình duyệt.
2. Vào link:

[https://git-scm.com/download/win](https://git-scm.com/download/win)

3. Tải Git về.
4. Mở file cài đặt.
5. Cứ bấm **Next** liên tục.
6. Tới cuối bấm **Install**.
7. Cài xong bấm **Finish**.
8. Đóng PowerShell cũ.
9. Mở PowerShell mới.
10. Gõ lại:

```powershell
git --version
```

---

## 0.3. Nếu là máy mới, kiểm tra xem đã cài Docker Desktop chưa

### Cách làm

1. Nhấn **Start**.
2. Gõ:

```text
Docker Desktop
```

### Nếu thấy ứng dụng hiện ra

Bấm mở nó.

### Nếu không thấy

Bạn cần cài Docker Desktop.

### Cách cài Docker Desktop

1. Mở trình duyệt.
2. Vào link:

[https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

3. Tải Docker Desktop cho Windows.
4. Chạy file cài đặt.
5. Cứ làm theo hướng dẫn trên màn hình.
6. Nếu máy yêu cầu restart thì restart máy.
7. Mở lại Docker Desktop sau khi cài xong.

---

## 0.4. Bật Kubernetes trong Docker Desktop

### Cách làm

1. Mở **Docker Desktop**.
2. Nhìn cột bên trái, bấm **Settings**.
3. Tìm mục **Kubernetes**.
4. Bấm vào **Kubernetes**.
5. Tích bật **Enable Kubernetes** nếu nó chưa bật.
6. Bấm **Apply & Restart**.
7. Chờ Docker Desktop khởi động lại.

### Lưu ý

Bước này có thể mất vài phút. Bạn cứ chờ tới khi Docker ổn định hẳn.

---

## 0.5. Kiểm tra `kubectl`

Mở PowerShell rồi gõ:

```powershell
kubectl version --client
```

### Nếu thấy ra phiên bản

Nghĩa là máy đã có `kubectl`.

### Nếu báo lỗi không nhận `kubectl`

Thường khi cài Docker Desktop và bật Kubernetes thì `kubectl` sẽ có sẵn.

Bạn thử:

1. đóng PowerShell
2. mở PowerShell lại
3. gõ lại:

```powershell
kubectl version --client
```

Nếu vẫn lỗi thì bạn cài `kubectl` theo tài liệu chính thức:

[https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/](https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/)

---

## 0.6. Kiểm tra Helm

Trong PowerShell, gõ:

```powershell
helm version
```

### Nếu thấy ra phiên bản

Nghĩa là đã có Helm.

### Nếu báo lỗi không nhận `helm`

Bạn cần cài Helm.

### Cách cài Helm trên Windows

Mở link:

[https://helm.sh/docs/intro/install/](https://helm.sh/docs/intro/install/)

Nếu bạn đã có `winget`, cách dễ nhất là gõ:

```powershell
winget install Helm.Helm
```

Cài xong:

1. đóng PowerShell
2. mở lại PowerShell
3. gõ:

```powershell
helm version
```

---

## 0.7. Cài Cursor hoặc VS Code nếu máy mới chưa có

### Nếu dùng Cursor

Vào link:

[https://www.cursor.com/](https://www.cursor.com/)

Tải về và cài.

### Nếu dùng VS Code

Vào link:

[https://code.visualstudio.com/](https://code.visualstudio.com/)

Tải về và cài.

---

## 0.8. Lấy code project về máy mới

Nếu máy mới chưa có source code, bạn làm như sau.

### Bước 1: tạo thư mục GitHub trong Documents

Mở PowerShell và gõ:

```powershell
cd C:\Users\DELL\Documents
mkdir GitHub
cd GitHub
```

### Bước 2: clone project

Gõ:

```powershell
git clone https://github.com/buiducthien090605/project.git
```

### Bước 3: vào thư mục project

Gõ:

```powershell
cd .\project
```

### Bước 4: kiểm tra code đã về chưa

Gõ:

```powershell
dir
```

### Bạn cần thấy các thư mục như

- `backend`
- `docs`
- `helm`
- `.github`
- `argocd`

---

## 0.9. Nếu không phải clone mới mà chỉ là pull code mới nhất

Nếu project đã có sẵn trên máy rồi, bạn chỉ cần cập nhật code.

### Cách làm

Mở PowerShell rồi gõ:

```powershell
cd C:\Users\DELL\Documents\GitHub\project
git pull
```

### Nếu có lỗi do local changes

Gõ:

```powershell
git status
```

Nếu bạn thấy có file đang sửa dang dở thì đừng kéo bừa. Lúc đó bạn nên kiểm tra lại trước khi `pull`.

---

## 0.10. Mở project trong Cursor

### Cách làm

1. Mở Cursor.
2. Bấm **File**.
3. Bấm **Open Folder**.
4. Chọn:

```text
C:\Users\DELL\Documents\GitHub\project
```

5. Bấm **Select Folder**.

---

## 0.11. Mở PowerShell đúng thư mục project

Gõ:

```powershell
cd C:\Users\DELL\Documents\GitHub\project
```

---

## 0.12. Kiểm tra các công cụ một lượt trước khi test

Gõ lần lượt từng lệnh này:

```powershell
git --version
kubectl version --client
helm version
docker --version
```

## Nếu tất cả đều ra phiên bản

Kết luận:

- máy đã có đủ công cụ cơ bản để test project

---

## 0.13. Nếu vừa mở máy lại thì phải mở gì trước

Nếu bạn **không dùng máy mới**, chỉ là vừa bật máy lại, thì làm đúng thứ tự này:

1. Mở **Docker Desktop**
2. Chờ Docker Desktop ổn định
3. Mở **Cursor**
4. Mở thư mục project
5. Mở **PowerShell**
6. Gõ:

```powershell
cd C:\Users\DELL\Documents\GitHub\project
git pull
```

7. Gõ:

```powershell
kubectl get nodes
```

8. Nếu node `Ready` thì mới bắt đầu test tiếp

---

# 1. Mục tiêu

Sau khi làm hết file này, bạn sẽ tự trả lời được:

- đã tách `CI` và `CD` chưa
- đã có workflow riêng cho từng service chưa
- có reusable workflow chưa
- có SonarQube / Snyk / Trivy / Quality Gate chưa
- có ArgoCD chưa
- có Argo Rollouts canary hoặc blue-green chưa
- có Helm chưa
- có ConfigMap / Secret / PVC / Ingress / HPA chưa
- có ArgoCD Image Updater chưa
- có distributed storage kiểu Longhorn hoặc Rook chưa

---

# 2. Trước khi test cần mở gì

Mở 3 thứ này:

1. **Cursor** mở thư mục project
2. **PowerShell**
3. **Trình duyệt** để mở GitHub nếu cần

Project của bạn ở:

```text
C:\Users\DELL\Documents\GitHub\project
```

Trong PowerShell, gõ:

```powershell
cd C:\Users\DELL\Documents\GitHub\project
```

---

# 3. Test điều kiện nền trước

## 3.1. Kiểm tra Kubernetes có chạy không

Gõ:

```powershell
kubectl get nodes
```

## Kết quả mong đợi

- có ít nhất 1 node
- trạng thái `Ready`

## Nếu đúng

Kết luận:

- máy đang có cluster để test

---

## 3.2. Kiểm tra namespace cần thiết

Gõ:

```powershell
kubectl get ns
```

## Kết quả mong đợi

Có các namespace như:

- `default`
- `argocd`
- `argo-rollouts`
- `ingress-nginx`

## Nếu đúng

Kết luận:

- môi trường nền cho ArgoCD, Rollouts, Ingress đã có

---

# 4. Test yêu cầu: CI tách riêng với CD

## 4.1. Mở file cần xem

Trong Cursor, mở các file:

- `.github/workflows/main-ci.yml`
- `.github/workflows/product-service-ci.yml`
- `.github/workflows/order-service-ci.yml`
- `.github/workflows/inventory-service-ci.yml`
- `argocd/argocd-app.yaml`

## 4.2. Bạn cần nhìn gì

### Ở GitHub Actions

- có workflow CI trong `.github/workflows`
- có workflow riêng cho từng service

### Ở ArgoCD

- có file `argocd/argocd-app.yaml`
- file đó có `kind: Application`

## Nếu đúng

Kết luận:

- `CI` và `CD` đã được tách theo đúng hướng
- `CI` nằm ở GitHub Actions
- `CD` nằm ở ArgoCD

---

# 5. Test yêu cầu: mỗi service là một workflow riêng và được gọi trong main workflow

## 5.1. Kiểm tra file workflow riêng

Trong Cursor, xác nhận có các file:

- `.github/workflows/product-service-ci.yml`
- `.github/workflows/order-service-ci.yml`
- `.github/workflows/inventory-service-ci.yml`

## 5.2. Kiểm tra có dùng `workflow_call` không

Mở từng file và nhìn xem có đoạn:

```yaml
on:
  workflow_call:
```

hay không.

## 5.3. Kiểm tra main workflow có gọi các workflow đó không

Mở `main-ci.yml` và tìm các đoạn dạng:

```yaml
uses: ./.github/workflows/product-service-ci.yml
uses: ./.github/workflows/order-service-ci.yml
uses: ./.github/workflows/inventory-service-ci.yml
```

## Nếu đúng

Kết luận:

- đã có workflow riêng cho từng service
- main workflow đã gọi lại các workflow đó
- đạt yêu cầu reusable workflow ở mức service

---

# 6. Test yêu cầu: chỉ service thay đổi mới build lại

## 6.1. Mở file `main-ci.yml`

Bạn tìm phần dùng filter đường dẫn, thường sẽ có các đoạn như:

- `dorny/paths-filter`
- `backend/Product_Service/**`
- `backend/Order_Service/**`
- `backend/Inventory_Service/**`

## 6.2. Bạn cần hiểu kết quả thế nào

Nếu file `main-ci.yml` có logic:

- phát hiện service nào thay đổi
- chỉ gọi workflow của service đó

thì yêu cầu này coi như đạt về mặt cấu hình.

## Nếu đúng

Kết luận:

- project đã có cơ chế chỉ build service thay đổi

## Nếu muốn test thực tế thêm

Bạn có thể:

1. chỉ sửa 1 file trong `backend/Product_Service`
2. push lên GitHub
3. vào tab **Actions** trên GitHub
4. kiểm tra xem chỉ `product-service-ci` chạy hay không

---

# 7. Test yêu cầu: có SonarQube, Snyk, Trivy, Quality Gate

## 7.1. Kiểm tra file workflow liên quan

Trong Cursor, xem có các file:

- `.github/workflows/sonarqube-analysis.yml`
- `.github/workflows/snyk-scan.yml`
- `.github/workflows/trivy-scan.yml`

## 7.2. Kiểm tra trong service workflow có step scan không

Mở một file như `product-service-ci.yml` và tìm các chữ:

- `SonarQube`
- `Snyk`
- `Trivy`

## Nếu thấy cả 3

Kết luận:

- project đã có SonarQube
- project đã có Snyk
- project đã có Trivy

## 7.3. Kiểm tra `Quality Gate`

Tìm xem có file nào hoặc step nào rõ ràng chứa:

- `quality gate`
- hoặc bước chặn pipeline theo kết quả Sonar

## Nếu không thấy

Kết luận:

- **chưa có hoặc chưa tách rõ Quality Gate**

## Đánh giá mục này

- SonarQube: có
- Snyk: có
- Trivy: có
- Quality Gate: chưa rõ hoặc chưa có riêng

---

# 8. Test yêu cầu: có reusable workflows riêng cho tool scan

## 8.1. Kiểm tra tồn tại file reusable

Xem có các file:

- `.github/workflows/sonarqube-analysis.yml`
- `.github/workflows/snyk-scan.yml`
- `.github/workflows/trivy-scan.yml`

## 8.2. Mở file và kiểm tra có `workflow_call` không

Nếu các file đó có:

```yaml
on:
  workflow_call:
```

thì chúng là reusable workflows.

## 8.3. Kiểm tra service workflow có thực sự gọi lại chúng không

Mở `product-service-ci.yml`, `order-service-ci.yml`, `inventory-service-ci.yml` và xem có `uses:` tới 3 file scan này hay không.

## Kết luận

- nếu file scan riêng có tồn tại: đạt phần tạo reusable workflow
- nếu service workflow chưa gọi lại chúng: mới đạt một phần

---

# 9. Test yêu cầu: dùng Helm để quản lý

## 9.1. Kiểm tra thư mục Helm

Trong Cursor, xem có thư mục:

- `helm/ecom-app`

## 9.2. Kiểm tra các file quan trọng

Xem có:

- `helm/ecom-app/Chart.yaml`
- `helm/ecom-app/values.yaml`
- `helm/ecom-app/templates`

## 9.3. Chạy lint Helm

Trong PowerShell, gõ:

```powershell
helm lint .\helm\ecom-app
```

## Kết quả mong đợi

- không có lỗi
- tốt nhất thấy `0 chart(s) failed`

## 9.4. Render thử chart

Gõ:

```powershell
helm template ecom-app .\helm\ecom-app
```

## Kết quả mong đợi

Nhìn thấy các `kind:` như:

- `ConfigMap`
- `Secret`
- `Service`
- `Deployment` hoặc `Rollout`
- `Ingress`
- `HorizontalPodAutoscaler`

## Nếu đúng

Kết luận:

- project đang dùng Helm để quản lý triển khai

---

# 10. Test yêu cầu: có ConfigMap, Secret, PVC, Ingress, HPA

## 10.1. Triển khai chart nếu cần

Nếu chưa cài hoặc muốn cập nhật, gõ:

```powershell
helm upgrade --install ecom-app .\helm\ecom-app -n default --create-namespace
```

---

## 10.2. Kiểm tra ConfigMap

Gõ:

```powershell
kubectl get configmap -n default
```

## Kết quả mong đợi

Có thể thấy:

- `product-service-config`
- `order-service-config`
- `inventory-service-config`

## Nếu đúng

Kết luận:

- có ConfigMap

---

## 10.3. Kiểm tra Secret

Gõ:

```powershell
kubectl get secret -n default
```

## Kết quả mong đợi

Có secret của app, ví dụ:

- `mongodb-secrets`

## Nếu đúng

Kết luận:

- có Secret

---

## 10.4. Kiểm tra PVC

Gõ:

```powershell
kubectl get pvc -n default
```

## Kết quả mong đợi

- có PVC
- trạng thái tốt nhất là `Bound`

## Nếu đúng

Kết luận:

- có persistent storage ở mức workload

---

## 10.5. Kiểm tra Ingress

Gõ:

```powershell
kubectl get ingress -n default
```

## Kết quả mong đợi

- có ingress cho service cần public

## Nếu đúng

Kết luận:

- có Ingress

---

## 10.6. Kiểm tra HPA

Gõ:

```powershell
kubectl get hpa -n default
```

## Kết quả mong đợi

Có thể thấy:

- `product-service-hpa`
- `order-service-hpa`
- `inventory-service-hpa`

## Nếu đúng

Kết luận:

- có HPA

---

# 11. Test yêu cầu: có Argo Rollouts canary hoặc blue-green

## 11.1. Kiểm tra namespace argo-rollouts

Gõ:

```powershell
kubectl get pods -n argo-rollouts
```

## Kết quả mong đợi

- controller của argo-rollouts đang chạy

---

## 11.2. Kiểm tra rollout trong app

Gõ:

```powershell
kubectl get rollout -n default
```

## Kết quả mong đợi

Có thể thấy:

- `product-service`
- `order-service`

---

## 11.3. Kiểm tra manifest rollout

Trong Cursor, mở:

- `helm/ecom-app/charts/product-service/templates/rollout.yaml`
- `helm/ecom-app/charts/order-service/templates/rollout.yaml`

## Bạn cần nhìn gì

Nếu thấy từ:

- `canary:`

thì đang dùng canary.

Nếu thấy từ:

- `blueGreen:`

thì đang dùng blue-green.

## Kết luận

- nếu có `canary:` thì đạt yêu cầu ở mức canary
- nếu không có `blueGreen:` thì chưa có blue-green

---

# 12. Test yêu cầu: dùng ArgoCD cho CD

## 12.1. Kiểm tra pod ArgoCD

Gõ:

```powershell
kubectl get pods -n argocd
```

## Kết quả mong đợi

Có các pod như:

- `argocd-server`
- `argocd-repo-server`
- `argocd-application-controller`

## Nếu đúng

Kết luận:

- ArgoCD đã được cài trên cluster

---

## 12.2. Kiểm tra Application

Gõ:

```powershell
kubectl get applications -n argocd
```

## Kết quả mong đợi

- có application như `ecom-app`

## Nếu đúng

Kết luận:

- CD bằng ArgoCD đã có cấu hình application

---

# 13. Test yêu cầu: có ArgoCD Image Updater

## 13.1. Mở file `argocd/argocd-app.yaml`

Bạn nhìn xem có annotation bắt đầu bằng:

- `argocd-image-updater.argoproj.io/`

hay không.

## Nếu thấy

Ví dụ các dòng như:

- `image-list`
- `update-strategy`
- `write-back-method`
- `write-back-target`

thì kết luận:

- project đã có cấu hình ArgoCD Image Updater

## Đánh giá

- có cấu hình: đạt phần cấu hình
- muốn chắc hoàn toàn thì còn phải test runtime thật

---

# 14. Test yêu cầu: có distributed storage như Longhorn hoặc Rook

## 14.1. Kiểm tra trong cluster

Gõ:

```powershell
kubectl get pods -A
```

## Bạn tìm xem có namespace hoặc pod liên quan:

- `longhorn`
- `rook`
- `rook-ceph`

hay không.

## 14.2. Kiểm tra storage class

Gõ:

```powershell
kubectl get storageclass
```

## Bạn nhìn gì

- nếu chỉ thấy `hostpath` hoặc local storage thông thường thì chưa thể coi là Longhorn/Rook
- nếu thấy storage class của Longhorn hoặc Rook thì mới tính là có triển khai distributed storage

## Kết luận

- nếu không có Longhorn/Rook: **chưa đạt yêu cầu này**

---

# 15. Test nhanh qua GitHub Actions UI

Nếu muốn test thêm phần CI trên giao diện web:

## 15.1. Mở GitHub repo

Mở link repo của bạn trên trình duyệt.

## 15.2. Bấm vào tab `Actions`

Bạn nhìn xem có các workflow như:

- `Unified Microservices CI Pipeline`
- `Product Service CI`
- `Order Service CI`
- `Inventory Service CI`

## 15.3. Nếu muốn test thật

1. sửa 1 file nhỏ trong đúng 1 service
2. commit
3. push lên GitHub
4. vào `Actions`
5. kiểm tra chỉ workflow tương ứng chạy

## Nếu đúng

Kết luận:

- cơ chế chỉ build service thay đổi đang hoạt động đúng

---

# 16. Mẫu kết luận cuối cùng sau khi test xong

Sau khi test xong, bạn có thể tự kết luận như sau.

## Đã đạt

- CI và CD tách riêng
- mỗi service có workflow riêng
- main workflow gọi workflow từng service
- có Helm
- có ArgoCD
- có Argo Rollouts theo hướng canary
- có ConfigMap
- có Secret
- có PVC
- có Ingress
- có HPA
- có cấu hình ArgoCD Image Updater
- có SonarQube
- có Snyk
- có Trivy

## Đạt một phần

- reusable workflow cho tool scan đã có nhưng có thể chưa được gọi lại triệt để
- ArgoCD Image Updater có cấu hình nhưng có thể chưa test runtime đầy đủ

## Chưa đạt hoặc chưa rõ

- Quality Gate riêng
- blue-green deployment
- distributed storage kiểu Longhorn hoặc Rook

---

# 17. Danh sách lệnh ngắn gọn để test nhanh

```powershell
cd C:\Users\DELL\Documents\GitHub\project
git pull
git --version
kubectl version --client
helm version
docker --version
kubectl get nodes
kubectl get ns
kubectl get pods -n argocd
kubectl get pods -n argo-rollouts
kubectl get pods -n ingress-nginx
helm lint .\helm\ecom-app
helm template ecom-app .\helm\ecom-app
helm upgrade --install ecom-app .\helm\ecom-app -n default --create-namespace
kubectl get configmap -n default
kubectl get secret -n default
kubectl get pvc -n default
kubectl get ingress -n default
kubectl get hpa -n default
kubectl get rollout -n default
kubectl get applications -n argocd
kubectl get storageclass
kubectl get pods -A
```
