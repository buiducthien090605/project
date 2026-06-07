# Kịch bản demo và thuyết trình Helm + ArgoCD + Rollouts

Tài liệu này là kịch bản nói và thao tác demo dành cho bạn khi trình bày với giảng viên. Mục tiêu là giúp bạn:

- biết nên nói gì trước
- biết chạy lệnh nào ở từng bước
- biết giải thích ngắn gọn mà đúng ý
- biết kết quả mong đợi để đối chiếu
- biết nếu có lỗi thì chuyển hướng như thế nào

Tài liệu này không thay thế file hướng dẫn chi tiết. Nó là bản để bạn cầm lên và demo theo.

---

## 1. Mục tiêu của buổi demo

Khi demo, bạn cần chứng minh được 5 ý chính:

1. bạn đã đóng gói hệ thống bằng `Helm umbrella chart`
2. bạn đã triển khai được ứng dụng lên Kubernetes
3. bạn đã dùng `ArgoCD` để quản lý triển khai theo GitOps
4. bạn đã dùng `Argo Rollouts` cho cập nhật kiểu canary
5. bạn đã cấu hình các thành phần thực tế như `ConfigMap`, `Secret`, `PVC`, `Ingress`, `HPA`

Nếu làm được 5 ý này thì bài demo đã đủ mạnh.

---

## 2. Chuẩn bị trước khi demo

Bạn nên chuẩn bị trước các thứ sau:

- Docker Desktop đang mở
- Kubernetes trong Docker Desktop đang bật
- PowerShell mở sẵn tại thư mục project
- ArgoCD đã cài xong nếu bạn định demo UI
- nếu demo web UI thì mở sẵn trình duyệt
- nếu demo ingress thì đã thêm `api.ecom.local` vào file hosts

### Lệnh kiểm tra nhanh trước giờ demo

```powershell
kubectl get nodes
kubectl get pods -n argocd
kubectl get pods -n argo-rollouts
kubectl get pods -n ingress-nginx
```

### Kết quả mong đợi
- node ở trạng thái `Ready`
- pod của `argocd`, `argo-rollouts`, `ingress-nginx` đang chạy

### Nếu có lỗi ngay trước giờ demo
- nếu node chưa `Ready`: mở Docker Desktop và chờ
- nếu pod ArgoCD chưa lên: chờ thêm hoặc cài lại script
- nếu ingress chưa lên: đừng demo ingress, chuyển sang demo Helm và ArgoCD trước

---

## 3. Cấu trúc buổi demo nên chia thế nào

Bạn nên demo theo thứ tự này:

### Phần 1: giới thiệu kiến trúc
### Phần 2: chứng minh chart Helm hợp lệ
### Phần 3: chứng minh deploy được lên Kubernetes
### Phần 4: chứng minh có HPA, PVC, Ingress, Rollout
### Phần 5: chứng minh GitOps bằng ArgoCD
### Phần 6: nếu còn thời gian thì demo rollout update image

Đây là thứ tự an toàn nhất.

---

## 4. Kịch bản mở đầu bạn có thể nói

Bạn có thể nói gần như nguyên văn như sau:

"Trong bài này, em triển khai hệ thống e-commerce microservices bằng Kubernetes. Em dùng Helm theo mô hình umbrella chart để quản lý toàn bộ hệ thống. Trong đó product-service và order-service dùng Argo Rollouts để hỗ trợ canary deployment, inventory-service dùng deployment thông thường, còn RabbitMQ có persistent volume claim để lưu trữ dữ liệu. Trên đó em dùng ArgoCD để triển khai theo mô hình GitOps, tức là cấu hình được quản lý trên Git và đồng bộ tự động xuống cluster."

Nếu muốn nói ngắn hơn:

"Bài của em dùng Helm để đóng gói, dùng ArgoCD để GitOps, dùng Argo Rollouts để canary deployment và có đủ các thành phần thực tế như ConfigMap, Secret, PVC, Ingress, HPA."

---

## 5. Phần 1: Giới thiệu cấu trúc project

### Bạn nói gì

"Đây là cấu trúc chính của project. Chart tổng nằm ở `helm/ecom-app`, còn bên trong có các subchart cho từng service. Các tài nguyên dùng chung như ConfigMap, Secret và StorageClass nằm ở chart cha. Phần ArgoCD nằm trong thư mục `argocd`."

### Nếu muốn chỉ file để nói
Bạn có thể mở hoặc chỉ vào các file sau:

- `helm/ecom-app/Chart.yaml`
- `helm/ecom-app/values.yaml`
- `helm/ecom-app/templates/configmaps.yaml`
- `helm/ecom-app/templates/secrets.yaml`
- `helm/ecom-app/templates/storageclass.yaml`
- `argocd/argocd-app.yaml`

### Ý cần nhấn mạnh
- có chart cha và chart con
- không deploy kiểu file YAML rời rạc
- có cấu trúc rõ ràng, dễ quản lý

---

## 6. Phần 2: Chứng minh Helm chart hợp lệ

### Bạn nói gì

"Đầu tiên em kiểm tra chart Helm có hợp lệ không bằng lint và render manifest. Nếu bước này pass thì nghĩa là cấu trúc chart ổn và có thể sinh ra manifest Kubernetes hợp lệ."

### Lệnh nên chạy

```powershell
cd E:\project
helm lint .\helm\ecom-app
```

### Kết quả mong đợi
- không có lỗi
- tốt nhất là hiện `0 chart(s) failed`

### Câu giải thích sau khi chạy xong

"Kết quả này cho thấy chart không lỗi cú pháp Helm."

### Lệnh tiếp theo

```powershell
helm template ecom-app .\helm\ecom-app
```

### Kết quả mong đợi
Render ra các resource như:
- `ConfigMap`
- `Secret`
- `StorageClass`
- `PVC`
- `Service`
- `Ingress`
- `Deployment`
- `Rollout`
- `HPA`

### Câu giải thích sau khi chạy xong

"Bước này cho thấy chart Helm sinh ra được toàn bộ manifest Kubernetes cần thiết cho hệ thống."

---

## 7. Phần 3: Chứng minh deploy được bằng Helm

### Bạn nói gì

"Sau khi kiểm tra chart hợp lệ, em triển khai trực tiếp bằng Helm để chứng minh hệ thống có thể chạy được trên Kubernetes."

### Lệnh nên chạy

```powershell
helm install ecom-app .\helm\ecom-app -n default --create-namespace
```

### Nếu bạn đã cài trước đó rồi
Nếu release đã tồn tại, thay bằng:

```powershell
helm upgrade --install ecom-app .\helm\ecom-app -n default --create-namespace
```

### Câu giải thích sau khi chạy

"Lệnh này sẽ cài toàn bộ hệ thống từ chart cha, đồng thời kéo theo các subchart cho product, order, inventory và rabbitmq."

### Lệnh kiểm tra tổng quát

```powershell
kubectl get all -n default
```

### Kết quả mong đợi
- có pod
- có service
- có deployment hoặc rollout

### Câu giải thích

"Ở đây có thể thấy các service chính đã được tạo và ứng dụng đã được triển khai xuống cluster."

---

## 8. Phần 4: Chứng minh các thành phần quan trọng tồn tại

Bạn nên chia phần này thành 4 mục nhỏ: PVC, HPA, Ingress, Rollout.

---

### 8.1 Demo PVC

#### Bạn nói gì

"RabbitMQ cần lưu dữ liệu nên em cấu hình persistent volume claim để khi pod khởi động lại thì dữ liệu không bị mất ngay."

#### Lệnh nên chạy

```powershell
kubectl get pvc -n default
```

#### Kết quả mong đợi
- có `rabbitmq-data-pvc`
- trạng thái tốt nhất là `Bound`

#### Câu giải thích

"PVC ở trạng thái Bound nghĩa là phần lưu trữ đã được cấp phát thành công cho RabbitMQ."

---

### 8.2 Demo HPA

#### Bạn nói gì

"Để hệ thống có khả năng mở rộng theo tải, em cấu hình HPA cho các service chính."

#### Lệnh nên chạy

```powershell
kubectl get hpa -n default
```

#### Kết quả mong đợi
Có:
- `product-service-hpa`
- `order-service-hpa`
- `inventory-service-hpa`

#### Câu giải thích

"Các HPA này sẽ cho phép service tự động tăng hoặc giảm số pod dựa trên mức sử dụng CPU."

---

### 8.3 Demo Ingress

#### Bạn nói gì

"Để route request từ bên ngoài vào hệ thống, em dùng NGINX Ingress Controller và tạo ingress cho product-service và order-service."

#### Lệnh nên chạy

```powershell
kubectl get ingress -n default
```

#### Kết quả mong đợi
Có:
- `product-service-ingress`
- `order-service-ingress`

#### Câu giải thích

"Ingress giúp định tuyến request theo host và path đến đúng service phía sau."

---

### 8.4 Demo Rollout

#### Bạn nói gì

"Hai service quan trọng là product-service và order-service được triển khai bằng Argo Rollouts thay vì Deployment thường để hỗ trợ canary deployment."

#### Lệnh nên chạy

```powershell
kubectl get rollout -n default
```

#### Kết quả mong đợi
Có:
- `product-service`
- `order-service`

#### Nếu máy có CLI rollout

```powershell
kubectl argo rollouts get rollout product-service -n default
kubectl argo rollouts get rollout order-service -n default
```

#### Câu giải thích

"Rollout cho phép cập nhật phiên bản mới theo từng bước tăng traffic thay vì thay ngay toàn bộ, nhờ đó an toàn hơn."

---

## 9. Phần 5: Demo ArgoCD

### Bạn nói gì

"Sau khi chứng minh hệ thống deploy được bằng Helm, em dùng ArgoCD để quản lý việc triển khai theo mô hình GitOps. Nghĩa là thay vì deploy thủ công, ArgoCD sẽ theo dõi repository Git và tự đồng bộ thay đổi xuống cluster."

### Bước 1: nếu chưa cài ArgoCD thì nói ngắn

"Phần ArgoCD em đã cài bằng script PowerShell có sẵn trong thư mục `argocd`."

### Nếu cần chạy lại script

```powershell
powershell -ExecutionPolicy Bypass -File .\argocd\install-argocd.ps1
```

### Bước 2: apply Application

```powershell
kubectl apply -f .\argocd\argocd-app.yaml
```

### Bước 3: kiểm tra application

```powershell
kubectl get applications -n argocd
```

### Kết quả mong đợi
- có app `ecom-app`
- trạng thái `Synced`
- trạng thái `Healthy`

### Câu giải thích

"Điều này cho thấy ArgoCD đã đọc được chart từ Git, render thành công và đồng bộ xuống cluster."

---

## 10. Phần 6: Demo giao diện ArgoCD

Nếu bạn muốn demo UI thì nên chuẩn bị từ trước.

### Lệnh port-forward

```powershell
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

### Truy cập
Mở trình duyệt tại:

[https://localhost:8080](https://localhost:8080)

### Bạn nói gì khi mở UI

"Trên giao diện ArgoCD, em có thể thấy trạng thái của application, cây resource bên trong app, và biết resource nào đang healthy hay gặp lỗi. Đây là điểm mạnh của GitOps vì trạng thái mong muốn và trạng thái thực tế được quản lý tập trung."

### Những gì nên chỉ trên UI
- tên app `ecom-app`
- trạng thái `Synced`
- trạng thái `Healthy`
- các resource con như rollout, service, ingress, pvc

---

## 11. Phần 7: Demo thay đổi image để kích hoạt rollout

Đây là phần nâng cao. Nếu không đủ thời gian, bạn có thể chỉ nói mô tả thay vì chạy thật.

### Bạn nói gì

"Để kiểm tra canary deployment, em chỉ cần đổi image tag của service trong file values, sau đó ArgoCD sẽ sync lại và Argo Rollouts sẽ triển khai bản mới theo từng bước."

### Bạn làm gì
Mở file `helm/ecom-app/values.yaml` và đổi tag image của `product-service` hoặc `order-service`.

Ví dụ ý tưởng:
- từ `latest` sang `v2`

### Nếu đang demo GitOps đầy đủ
- commit thay đổi
- push lên GitHub
- chờ ArgoCD sync

### Lệnh kiểm tra rollout

```powershell
kubectl argo rollouts get rollout product-service -n default
```

hoặc nếu không có CLI:

```powershell
kubectl get rollout -n default
```

### Kết quả mong đợi
- rollout nhận phiên bản mới
- traffic tăng dần theo các step
- có pause giữa các step

### Câu giải thích

"Cơ chế này giúp giảm rủi ro khi triển khai phiên bản mới vì không đẩy toàn bộ traffic vào bản mới ngay lập tức."

---

## 12. Nếu thầy hỏi: tại sao không dùng Deployment hết?

Bạn có thể trả lời:

"Em vẫn dùng Deployment cho inventory-service vì service đó ít quan trọng hơn trong luồng chính. Còn product-service và order-service ảnh hưởng trực tiếp tới nghiệp vụ chính nên em dùng Argo Rollouts để hỗ trợ cập nhật an toàn hơn theo kiểu canary."

---

## 13. Nếu thầy hỏi: tại sao dùng Helm?

Bạn có thể trả lời:

"Vì hệ thống có nhiều service và nhiều resource Kubernetes khác nhau. Nếu viết YAML rời sẽ khó quản lý. Helm giúp em gom cấu hình thành chart, dùng values để tái sử dụng, dễ nâng cấp, dễ bảo trì và phù hợp để tích hợp với ArgoCD."

---

## 14. Nếu thầy hỏi: tại sao dùng ArgoCD?

Bạn có thể trả lời:

"Vì ArgoCD hỗ trợ triển khai theo GitOps. Toàn bộ cấu hình nằm trên Git nên dễ theo dõi lịch sử thay đổi, dễ rollback, và giảm thao tác thủ công trên cluster. Khi file trên Git đổi thì ArgoCD có thể tự sync xuống cluster."

---

## 15. Nếu thầy hỏi: tại sao cần PVC cho RabbitMQ?

Bạn có thể trả lời:

"RabbitMQ là message broker nên cần lưu trữ dữ liệu và trạng thái hàng đợi. Nếu không có PVC thì khi pod restart, dữ liệu có thể mất. PVC giúp dữ liệu tồn tại bền vững hơn so với lưu trực tiếp trong container."

---

## 16. Nếu thầy hỏi: HPA hoạt động thế nào?

Bạn có thể trả lời:

"HPA theo dõi metric như CPU và tự động thay đổi số lượng pod. Khi tải tăng thì tăng replica, khi tải giảm thì giảm replica. Điều này giúp hệ thống linh hoạt hơn và tiết kiệm tài nguyên."

---

## 17. Nếu thầy hỏi: Image Updater có vai trò gì?

Bạn có thể trả lời:

"ArgoCD Image Updater sẽ theo dõi image mới trên registry, sau đó cập nhật lại tag image trong Git thay vì cập nhật trực tiếp trên cluster. Như vậy vẫn giữ đúng nguyên tắc GitOps: Git là nguồn chân lý duy nhất."

---

## 18. Kịch bản dự phòng nếu live demo bị lỗi

Đây là phần rất quan trọng.

### Trường hợp 1: pod chưa Running
Bạn nói:

"Trong quá trình local demo có thể pod còn đang pull image hoặc chờ storage bind. Tuy nhiên chart đã lint và render thành công, đồng thời cấu trúc triển khai đã đầy đủ. Em có thể kiểm tra tiếp logs hoặc describe để xác định nguyên nhân runtime."

### Trường hợp 2: ingress chưa vào được
Bạn nói:

"Phần ingress local phụ thuộc ingress controller và file hosts của máy. Nếu local route chưa hoạt động ngay thì em vẫn có thể chứng minh ingress resource đã được tạo đúng và controller đã cài đúng."

### Trường hợp 3: ArgoCD UI không mở kịp
Bạn nói:

"Nếu UI chưa mở kịp, em vẫn có thể kiểm tra trạng thái application bằng CLI qua `kubectl get applications -n argocd`."

### Trường hợp 4: rollout chưa hiện đẹp
Bạn nói:

"Rollout cần có thay đổi image thực tế để thể hiện quá trình canary. Nếu chưa đẩy image mới trong lúc demo thì em sẽ trình bày cơ chế hoạt động và chỉ vào cấu hình step trong chart."

---

## 19. Kịch bản demo ngắn 3 phút

Nếu thầy cho thời gian rất ngắn, bạn chỉ cần làm như sau.

### Bạn nói
"Bài của em triển khai hệ thống microservices bằng Helm và Kubernetes. Em dùng umbrella chart để quản lý nhiều service. Product-service và order-service dùng Argo Rollouts để hỗ trợ canary deployment, RabbitMQ dùng PVC để lưu trữ dữ liệu, và em dùng ArgoCD để triển khai theo GitOps từ GitHub xuống cluster."

### Chạy 5 lệnh này

```powershell
helm lint .\helm\ecom-app
helm template ecom-app .\helm\ecom-app
kubectl get all -n default
kubectl get hpa -n default
kubectl get rollout -n default
```

### Nếu còn 1 phút

```powershell
kubectl get applications -n argocd
```

### Kết luận
"Như vậy em đã chứng minh được chart hợp lệ, hệ thống deploy được, có autoscaling, rollout canary và có GitOps với ArgoCD."

---

## 20. Kịch bản demo đầy đủ 7 đến 10 phút

### Bước 1: giới thiệu kiến trúc
Nói 30 đến 45 giây.

### Bước 2: chạy lint và template

```powershell
helm lint .\helm\ecom-app
helm template ecom-app .\helm\ecom-app
```

### Bước 3: kiểm tra resource sau deploy

```powershell
kubectl get all -n default
kubectl get ingress -n default
kubectl get hpa -n default
kubectl get pvc -n default
kubectl get rollout -n default
```

### Bước 4: kiểm tra ArgoCD

```powershell
kubectl get applications -n argocd
```

### Bước 5: nếu có UI thì mở UI
- chỉ trạng thái `Synced`
- chỉ trạng thái `Healthy`
- chỉ các resource con

### Bước 6: kết luận
"Bài của em không chỉ deploy được ứng dụng mà còn tổ chức theo hướng production-like với GitOps, autoscaling, canary deployment và persistent storage."

---

## 21. Mẫu câu kết thúc buổi demo

Bạn có thể nói:

"Tóm lại, trong bài này em đã dùng Helm để đóng gói và quản lý hệ thống microservices, dùng ArgoCD để triển khai theo GitOps, dùng Argo Rollouts cho canary deployment ở các service quan trọng, và bổ sung các thành phần thực tế như PVC, Ingress, HPA để hệ thống hoàn chỉnh hơn trên Kubernetes."

---

## 22. Checklist trước khi bước vào bảo vệ

- [ ] Docker Desktop đang chạy
- [ ] Kubernetes đang bật
- [ ] `kubectl get nodes` ra `Ready`
- [ ] chart Helm lint pass
- [ ] app đã deploy được
- [ ] có `kubectl get all -n default`
- [ ] có `kubectl get hpa -n default`
- [ ] có `kubectl get pvc -n default`
- [ ] có `kubectl get rollout -n default`
- [ ] nếu demo ArgoCD thì UI đăng nhập được hoặc CLI hoạt động
- [ ] nếu demo ingress thì file hosts đã sửa

---

## 23. 10 lệnh quan trọng nhất nên nhớ

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

Nếu nhớ được 10 lệnh này, bạn đã có thể demo khá ổn.
