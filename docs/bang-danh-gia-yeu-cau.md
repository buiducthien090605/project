# Bảng đánh giá mức độ đáp ứng yêu cầu của giảng viên

Tài liệu này tổng hợp nhanh tình trạng hiện tại của project theo từng yêu cầu chính, để tiện đưa vào báo cáo hoặc slide.

## Tổng quan

- Hướng triển khai hiện tại nhìn chung là đúng: `CI` dùng GitHub Actions, `CD` dùng ArgoCD.
- Repo đã có nền tảng cho microservice CI riêng theo từng service, Helm chart, Argo Rollouts và ArgoCD Image Updater.
- Tuy nhiên vẫn còn một số hạng mục mới ở mức một phần hoặc chưa hoàn thiện end-to-end.

## Bảng đánh giá

| Yêu cầu của giảng viên | Hiện trạng triển khai | Đánh giá | Ghi chú / việc cần làm tiếp |
|---|---|---|---|
| Khi thay đổi một service thì chỉ build/deploy lại service đó | `main-ci.yml` đã dùng path filter để xác định service thay đổi và chỉ gọi workflow tương ứng | Đã làm tốt | Cần test thêm luồng deploy thực tế qua ArgoCD để chứng minh chỉ service đó được cập nhật |
| Tách riêng `CI -> GitHub Actions`, `CD -> ArgoCD` | Đã có workflow CI trong GitHub Actions và có `argocd/argocd-app.yaml` để triển khai qua ArgoCD | Đã làm phần lớn | Cần xác nhận runtime ArgoCD, sync và Image Updater hoạt động ổn định end-to-end |
| Mỗi service là một workflow riêng và được gọi trong main workflow | Đã có `product-service-ci.yml`, `order-service-ci.yml`, `inventory-service-ci.yml`, đều được gọi từ `main-ci.yml` bằng `workflow_call` | Đạt | Đây là phần làm đúng yêu cầu và khá rõ ràng |
| Có các job `sonarqube`, `quality gate`, `snyk`, `trivy` | Đã có SonarQube, Snyk, Trivy; có workflow riêng cho SonarQube, Snyk, Trivy | Đạt một phần | Chưa thấy workflow riêng cho `quality gate`; các service workflow hiện vẫn đang chứa step scan inline thay vì gọi lại đầy đủ các reusable workflow |
| Tạo workflow riêng biệt cho các tool và tái sử dụng | Đã có `sonarqube-analysis.yml`, `snyk-scan.yml`, `trivy-scan.yml` dạng `workflow_call` | Đạt một phần | Cần refactor các workflow theo service để thực sự gọi lại các workflow tái sử dụng này |
| Dùng ArgoCD cho phần CD | Đã có ArgoCD `Application` manifest và đã cấu hình repo Helm làm source | Đã có nền tảng | Cần hoàn tất cài đặt ArgoCD trên cluster và verify apply/sync thành công |
| Có Argo Rollouts với `canary` hoặc `blue-green` | Đã có `Rollout` cho ít nhất `product-service` và `order-service`, triển khai theo `canary` | Đạt mức cơ bản | Chưa thấy `blue-green`; nếu báo cáo thì nên nói rõ nhóm chọn chiến lược `canary` |
| Dùng Helm để quản lý triển khai | Đã có chart `helm/ecom-app`, values chung, chart con cho service, RabbitMQ, HPA, ingress, rollout | Đạt | Đây là một điểm mạnh của project |
| File cấu hình K8s cần có thêm `ConfigMap`, `Secret`, `Persistent Storage` | Đã có template `ConfigMap`, `Secret`, `StorageClass`; RabbitMQ có cấu hình persistence | Đạt phần lớn | Nên verify khi render/deploy thật có PVC/PV hoạt động đúng |
| Có distributed storage như `Longhorn`, `Rook` | Chưa thấy triển khai Longhorn hoặc Rook thực tế | Chưa đạt | Hiện mới ở mức định hướng cấu hình storage, chưa phải distributed storage production-grade |
| Cập nhật image tag và tham khảo ArgoCD Image Updater | `argocd-app.yaml` đã có annotation cho `argocd-image-updater` và write-back về `helm/ecom-app/values.yaml` | Đạt phần cấu hình | Cần kiểm chứng thực tế rằng image mới được phát hiện, ghi tag về Git và ArgoCD sync lại thành công |
| Build chất lượng và bảo mật trước khi push/deploy | Đã có test, SonarQube, Snyk, Trivy trong các workflow service | Đạt một phần | Chưa thấy quality gate riêng để chặn pipeline theo đúng chuẩn đánh giá chất lượng |

## Đánh giá theo mức độ hoàn thành

### 1. Các phần đã làm tốt

- Chia `CI` theo từng microservice.
- Có `main workflow` điều phối và chỉ gọi workflow của service thay đổi.
- Dùng `workflow_call` đúng hướng reusable workflows.
- Dùng Helm để quản lý triển khai.
- Đã có ArgoCD Application.
- Đã có Argo Rollouts theo hướng `canary`.
- Đã có `ConfigMap`, `Secret`, và cấu hình persistence.
- Đã có cấu hình ArgoCD Image Updater.

### 2. Các phần đã có nhưng chưa hoàn chỉnh

- SonarQube, Snyk, Trivy đã hiện diện nhưng chưa tái sử dụng triệt để theo mô hình workflow riêng biệt.
- ArgoCD đã có cấu hình nhưng cần hoàn thiện triển khai thực tế trên cluster.
- Image Updater đã có annotation nhưng cần xác minh luồng cập nhật tag hoạt động thật.
- Persistence đã có cấu hình nhưng cần chứng minh chạy ổn khi deploy.

### 3. Các phần còn thiếu hoặc chưa đạt đúng yêu cầu

- Chưa có workflow riêng cho `quality gate`.
- Chưa refactor để từng service workflow gọi lại đầy đủ các reusable workflow scan.
- Chưa có triển khai `blue-green`.
- Chưa triển khai distributed storage bằng `Longhorn` hoặc `Rook`.
- Một số cấu hình secrets hiện vẫn đang để trong `values.yaml`, chưa phù hợp nếu muốn trình bày theo chuẩn production.

## Kết luận ngắn gọn

Nếu đánh giá theo mức độ đáp ứng yêu cầu của giảng viên:

- **Định hướng kiến trúc:** đúng hướng.
- **Mức hoàn thành hiện tại:** khoảng `75% - 80%`.
- **Mức sẵn sàng để bảo vệ rất chắc:** chưa hoàn toàn, vẫn cần bổ sung vài hạng mục quan trọng.

## Ưu tiên nên làm tiếp

1. Tạo workflow riêng cho `quality gate`.
2. Refactor các workflow service để gọi lại `sonarqube-analysis.yml`, `snyk-scan.yml`, `trivy-scan.yml` thay vì viết inline.
3. Hoàn tất cài đặt và kiểm chứng ArgoCD + Image Updater chạy thật end-to-end.
4. Demo rõ `canary rollout` cho ít nhất một service.
5. Nếu còn thời gian, bổ sung hoặc mô phỏng `Longhorn/Rook` để đáp ứng phần distributed storage.
