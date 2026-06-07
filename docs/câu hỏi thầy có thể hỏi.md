# Câu hỏi thầy có thể hỏi và cách trả lời

Tài liệu này giúp bạn chuẩn bị cho phần hỏi đáp khi bảo vệ. Mình chia theo kiểu rất dễ học:

- câu hỏi thầy có thể hỏi
- ý chính cần trả lời
- câu trả lời ngắn
- câu trả lời đầy đủ hơn
- điều nên tránh khi trả lời

Mục tiêu là giúp bạn không bị bí khi thầy hỏi sâu vào Helm, Kubernetes, ArgoCD, Rollouts, HPA, PVC và GitOps.

---

## 1. Câu hỏi: Bài của em đang làm cái gì?

### Ý chính cần trả lời
- triển khai hệ thống microservices lên Kubernetes
- dùng Helm để đóng gói
- dùng ArgoCD để GitOps
- dùng Rollouts để canary deployment

### Câu trả lời ngắn
"Bài của em là triển khai hệ thống microservices lên Kubernetes bằng Helm, sau đó dùng ArgoCD để đồng bộ theo GitOps và dùng Argo Rollouts để hỗ trợ canary deployment cho các service quan trọng."

### Câu trả lời đầy đủ hơn
"Trong bài này em tổ chức hệ thống e-commerce microservices dưới dạng Helm umbrella chart. Các service được quản lý thành các subchart riêng. Sau đó em dùng ArgoCD để theo dõi cấu hình trên Git và tự động đồng bộ xuống cluster theo mô hình GitOps. Ngoài ra em dùng Argo Rollouts cho product-service và order-service để cập nhật phiên bản mới an toàn hơn theo kiểu canary deployment."

### Điều nên tránh
- không trả lời quá chung chung kiểu "em deploy Kubernetes thôi"
- không bỏ quên Helm hoặc ArgoCD nếu bài của bạn đang nhấn mạnh các phần đó

---

## 2. Câu hỏi: Tại sao em dùng Helm?

### Ý chính cần trả lời
- hệ thống có nhiều service
- có nhiều resource khác nhau
- cần tái sử dụng cấu hình
- dễ bảo trì, dễ nâng cấp

### Câu trả lời ngắn
"Em dùng Helm vì hệ thống có nhiều service và nhiều file cấu hình Kubernetes, nếu dùng YAML rời sẽ khó quản lý. Helm giúp đóng gói, tái sử dụng cấu hình và triển khai thuận tiện hơn."

### Câu trả lời đầy đủ hơn
"Hệ thống của em gồm nhiều service như product, order, inventory và rabbitmq. Mỗi service lại có nhiều resource như service, ingress, hpa, deployment hoặc rollout. Nếu viết toàn bộ dưới dạng YAML rời thì sẽ khó quản lý, khó tái sử dụng và khó nâng cấp. Helm giúp em gom tất cả thành chart, dùng values để thay đổi cấu hình tập trung và triển khai hoặc nâng cấp chỉ bằng một lệnh."

### Điều nên tránh
- không trả lời chỉ vì "thấy nhiều người dùng"
- không trả lời kiểu Helm chỉ để cài nhanh

---

## 3. Câu hỏi: Helm umbrella chart là gì?

### Ý chính cần trả lời
- chart cha quản lý nhiều chart con
- phù hợp hệ microservices
- tiện quản lý tập trung

### Câu trả lời ngắn
"Helm umbrella chart là chart cha dùng để quản lý nhiều subchart bên trong. Trong bài của em, chart cha là `ecom-app`, còn từng service là một subchart riêng."

### Câu trả lời đầy đủ hơn
"Umbrella chart là cách tổ chức Helm trong đó có một chart tổng ở bên ngoài, bên trong là nhiều chart con tương ứng với từng thành phần của hệ thống. Cách này phù hợp với microservices vì mỗi service có thể có chart riêng, nhưng vẫn được triển khai tập trung qua chart cha. Nhờ vậy em quản lý dependency, values và triển khai toàn hệ thống dễ hơn."

### Điều nên tránh
- không nói umbrella chart là nhiều file YAML ghép lại, như vậy quá đơn giản và chưa chính xác

---

## 4. Câu hỏi: Vì sao product-service và order-service dùng Rollout, còn inventory-service lại dùng Deployment?

### Ý chính cần trả lời
- product/order quan trọng hơn
- muốn cập nhật an toàn hơn
- inventory có thể triển khai đơn giản hơn

### Câu trả lời ngắn
"Em dùng Rollout cho product-service và order-service vì đây là các service quan trọng trong luồng nghiệp vụ chính, nên cần cơ chế cập nhật an toàn hơn. Inventory-service em giữ dạng Deployment để đơn giản hóa phần triển khai."

### Câu trả lời đầy đủ hơn
"Product-service và order-service ảnh hưởng trực tiếp đến trải nghiệm và nghiệp vụ chính như xem sản phẩm hoặc tạo đơn hàng. Vì vậy em muốn khi cập nhật phiên bản mới có thể kiểm soát traffic theo từng bước và giảm rủi ro bằng canary deployment, nên em dùng Argo Rollouts. Còn inventory-service em dùng Deployment thường để giữ một phần hệ thống đơn giản hơn, đồng thời cũng cho thấy em phân biệt khi nào cần rollout nâng cao và khi nào chỉ cần deployment cơ bản."

### Điều nên tránh
- không nói "em chọn ngẫu nhiên"
- không nói vì inventory-service không deploy được rollout nếu thực ra hoàn toàn có thể

---

## 5. Câu hỏi: ArgoCD là gì và dùng để làm gì?

### Ý chính cần trả lời
- công cụ GitOps
- theo dõi Git
- tự đồng bộ xuống cluster
- giúp giảm thao tác tay

### Câu trả lời ngắn
"ArgoCD là công cụ triển khai theo GitOps. Nó theo dõi cấu hình trên Git và tự đồng bộ trạng thái mong muốn xuống Kubernetes cluster."

### Câu trả lời đầy đủ hơn
"ArgoCD là một công cụ GitOps dành cho Kubernetes. Thay vì phải tự chạy lệnh deploy thủ công, em khai báo cấu hình ứng dụng trên Git. ArgoCD sẽ đọc repository đó, render chart hoặc manifest, rồi đồng bộ xuống cluster. Nhờ vậy việc triển khai có lịch sử rõ ràng, dễ theo dõi, dễ rollback và giảm lỗi do thao tác tay."

### Điều nên tránh
- không mô tả ArgoCD như chỉ là một giao diện xem pod
- không bỏ qua ý Git là nguồn cấu hình chính

---

## 6. Câu hỏi: GitOps là gì?

### Ý chính cần trả lời
- Git là nguồn chân lý
- thay đổi qua Git
- cluster đồng bộ theo Git

### Câu trả lời ngắn
"GitOps là cách quản lý hạ tầng và triển khai trong đó Git được xem là nguồn chân lý, còn cluster sẽ được đồng bộ theo cấu hình trong Git."

### Câu trả lời đầy đủ hơn
"GitOps là phương pháp quản lý hạ tầng và ứng dụng bằng cách lưu trạng thái mong muốn trong Git. Khi có thay đổi, người vận hành sửa file cấu hình trong Git thay vì sửa trực tiếp trên cluster. Một công cụ như ArgoCD sẽ theo dõi Git rồi đồng bộ trạng thái thực tế của cluster về đúng trạng thái mong muốn đó. Cách này giúp dễ audit, dễ rollback và giảm rủi ro thao tác thủ công."

### Điều nên tránh
- không nói GitOps chỉ là dùng Git để lưu code
- phải nhấn mạnh chuyện Git điều khiển deploy

---

## 7. Câu hỏi: Argo Rollouts hoạt động như thế nào?

### Ý chính cần trả lời
- cập nhật từng bước
- phân phối traffic dần dần
- giảm rủi ro khi release

### Câu trả lời ngắn
"Argo Rollouts cho phép triển khai phiên bản mới theo từng bước, ví dụ tăng traffic từ ít lên nhiều, thay vì chuyển toàn bộ ngay lập tức."

### Câu trả lời đầy đủ hơn
"Argo Rollouts thay thế Deployment thường trong các trường hợp cần chiến lược phát hành an toàn hơn. Thay vì update toàn bộ pod cùng lúc, nó có thể chia thành nhiều bước như setWeight và pause, nghĩa là chỉ đưa một phần traffic vào bản mới trước. Nếu hệ thống ổn định thì tiếp tục tăng traffic, còn nếu có vấn đề thì có thể dừng hoặc rollback. Điều này giúp giảm rủi ro khi đưa version mới lên production."

### Điều nên tránh
- không nói rollout chỉ là deployment đẹp hơn
- phải nêu yếu tố canary hoặc progressive delivery

---

## 8. Câu hỏi: Canary deployment là gì?

### Ý chính cần trả lời
- đưa bản mới cho một phần traffic trước
- quan sát rồi mới tăng tiếp
- mục tiêu là an toàn hơn

### Câu trả lời ngắn
"Canary deployment là cách triển khai phiên bản mới cho một phần nhỏ traffic trước, nếu ổn thì mới tăng dần lên toàn bộ traffic."

### Câu trả lời đầy đủ hơn
"Canary deployment là chiến lược release trong đó phiên bản mới không thay thế toàn bộ phiên bản cũ ngay lập tức. Thay vào đó, chỉ một phần người dùng hoặc một phần traffic được chuyển sang bản mới trước. Nếu theo dõi thấy ổn định thì tiếp tục tăng tỷ lệ traffic cho đến khi thay hoàn toàn. Nhờ vậy nếu có lỗi thì phạm vi ảnh hưởng nhỏ hơn."

### Điều nên tránh
- không nói canary là blue-green, vì đó là hai chiến lược khác nhau

---

## 9. Câu hỏi: HPA là gì và hoạt động ra sao?

### Ý chính cần trả lời
- autoscaling theo metric
- thường là CPU hoặc memory
- tăng giảm số replica

### Câu trả lời ngắn
"HPA là Horizontal Pod Autoscaler, dùng để tự động tăng giảm số pod dựa trên metric như CPU."

### Câu trả lời đầy đủ hơn
"HPA là thành phần autoscaling theo chiều ngang trong Kubernetes. Nó theo dõi metric, thường là CPU hoặc đôi khi là custom metrics, rồi tự điều chỉnh số lượng replica của workload. Khi tải tăng, HPA tăng số pod để chia tải. Khi tải giảm, nó giảm số pod để tiết kiệm tài nguyên. Trong bài của em, HPA được dùng cho các service chính để hệ thống linh hoạt hơn."

### Điều nên tránh
- không nhầm HPA với load balancer
- không nói HPA tự tăng cấu hình CPU/RAM cho pod, vì nó tăng số pod chứ không tăng tài nguyên của một pod đang chạy

---

## 10. Câu hỏi: PVC là gì? Vì sao RabbitMQ cần PVC?

### Ý chính cần trả lời
- PVC là yêu cầu cấp phát volume
- RabbitMQ cần lưu dữ liệu
- pod restart mà không mất dữ liệu ngay

### Câu trả lời ngắn
"PVC là PersistentVolumeClaim, tức là yêu cầu xin cấp phát vùng lưu trữ bền vững. RabbitMQ cần nó để dữ liệu hàng đợi không bị mất ngay khi pod restart."

### Câu trả lời đầy đủ hơn
"Trong Kubernetes, container bình thường có filesystem không phù hợp cho lưu trữ bền vững. PVC là cơ chế để workload yêu cầu một vùng lưu trữ tồn tại độc lập với vòng đời pod. RabbitMQ là message broker nên có dữ liệu và trạng thái cần duy trì. Nếu không có PVC, khi pod bị xóa hoặc tạo lại thì dữ liệu có thể mất. Vì vậy em cấu hình PVC cho RabbitMQ để hỗ trợ lưu trữ bền vững hơn."

### Điều nên tránh
- không nói PVC chính là volume vật lý
- nên hiểu PVC là phần yêu cầu, còn PV là tài nguyên volume được cấp phát

---

## 11. Câu hỏi: Ingress là gì?

### Ý chính cần trả lời
- route từ ngoài vào trong cluster
- dựa trên host hoặc path
- đứng trước các service

### Câu trả lời ngắn
"Ingress là tài nguyên dùng để định tuyến HTTP hoặc HTTPS từ bên ngoài vào các service trong Kubernetes cluster."

### Câu trả lời đầy đủ hơn
"Ingress là cách Kubernetes mô tả các rule định tuyến lưu lượng từ bên ngoài vào bên trong cluster, thường dựa trên host hoặc path. Ví dụ cùng một domain nhưng path khác nhau có thể đi đến các service khác nhau. Tuy nhiên ingress resource chỉ là phần khai báo, để hoạt động thực tế cần có ingress controller như NGINX Ingress Controller."

### Điều nên tránh
- không quên nhắc tới ingress controller
- không nói ingress tự hoạt động nếu chưa có controller

---

## 12. Câu hỏi: ConfigMap và Secret khác nhau như thế nào?

### Ý chính cần trả lời
- ConfigMap cho dữ liệu không nhạy cảm
- Secret cho dữ liệu nhạy cảm
- Secret vẫn cần bảo vệ cẩn thận

### Câu trả lời ngắn
"ConfigMap dùng cho cấu hình không nhạy cảm, còn Secret dùng cho dữ liệu nhạy cảm như mật khẩu hoặc token."

### Câu trả lời đầy đủ hơn
"Cả ConfigMap và Secret đều là cách đưa dữ liệu cấu hình vào workload trong Kubernetes, nhưng mục đích khác nhau. ConfigMap dùng cho dữ liệu không nhạy cảm như port, hostname, mode chạy. Secret dùng cho dữ liệu nhạy cảm như password, token hoặc key. Trong bài của em, em tách riêng hai loại này để đúng thực hành tốt hơn."

### Điều nên tránh
- không nói Secret là mã hóa tuyệt đối và luôn an toàn, vì Secret cần thêm các biện pháp bảo vệ khác

---

## 13. Câu hỏi: Tại sao dùng ArgoCD Image Updater mà vẫn cập nhật Git?

### Ý chính cần trả lời
- vẫn giữ đúng GitOps
- Git là nguồn chân lý
- không sửa trực tiếp trên cluster

### Câu trả lời ngắn
"Vì mục tiêu là vẫn giữ Git làm nguồn chân lý. Image Updater phát hiện image mới rồi ghi tag mới vào Git, sau đó ArgoCD mới đồng bộ xuống cluster."

### Câu trả lời đầy đủ hơn
"Nếu updater cập nhật trực tiếp trên cluster mà không phản ánh thay đổi về Git thì sẽ phá vỡ nguyên tắc GitOps. Do đó ArgoCD Image Updater thường được cấu hình để phát hiện image tag mới, sau đó sửa file cấu hình trên Git, ví dụ `values.yaml`. Khi Git thay đổi, ArgoCD lại sync xuống cluster. Như vậy trạng thái thực tế luôn đi theo trạng thái được lưu trong Git."

### Điều nên tránh
- không nói image updater push thẳng image vào cluster là đủ

---

## 14. Câu hỏi: Nếu một pod lỗi thì em debug như thế nào?

### Ý chính cần trả lời
- xem pod
- describe pod
- logs pod
- xác định lỗi image, config, health check, volume

### Câu trả lời ngắn
"Em sẽ kiểm tra `kubectl get pods`, sau đó dùng `kubectl describe pod` và `kubectl logs` để xem nguyên nhân cụ thể."

### Câu trả lời đầy đủ hơn
"Khi pod lỗi, đầu tiên em dùng `kubectl get pods` để xem trạng thái như `CrashLoopBackOff` hay `ImagePullBackOff`. Sau đó em dùng `kubectl describe pod` để xem event, ví dụ lỗi pull image hay mount volume. Tiếp theo em dùng `kubectl logs` để xem log ứng dụng bên trong container. Từ đó em xác định lỗi nằm ở image, config, secret, kết nối database, health check hoặc lưu trữ."

### Điều nên tránh
- không trả lời quá mơ hồ kiểu "em xem log thôi"

---

## 15. Câu hỏi: Nếu HPA không scale thì em kiểm tra gì?

### Ý chính cần trả lời
- metrics-server
- metric có lên không
- có tải thực tế không
- min/max replicas

### Câu trả lời ngắn
"Em sẽ kiểm tra cluster có metrics-server chưa, sau đó kiểm tra có đủ tải thực tế và kiểm tra lại cấu hình minReplicas, maxReplicas, targetCPUUtilizationPercentage."

### Câu trả lời đầy đủ hơn
"Nếu HPA không scale, đầu tiên em kiểm tra cluster đã có metrics-server chưa vì HPA cần metric để hoạt động. Sau đó em xem HPA đang đọc metric nào, ví dụ CPU, rồi kiểm tra có đủ tải thực tế hay chưa. Nếu tải chưa đủ cao thì HPA sẽ không cần scale. Em cũng kiểm tra lại cấu hình minReplicas, maxReplicas và target utilization để chắc rằng ngưỡng scale hợp lý."

### Điều nên tránh
- không khẳng định HPA luôn scale ngay lập tức

---

## 16. Câu hỏi: Nếu PVC cứ Pending thì sao?

### Ý chính cần trả lời
- kiểm tra storage class
- kiểm tra provisioner
- local cluster thường thiếu đúng storage backend

### Câu trả lời ngắn
"Em sẽ kiểm tra `storageClassName`, kiểm tra cluster có provisioner tương ứng hay không, vì nếu không có backend lưu trữ phù hợp thì PVC sẽ không bind được."

### Câu trả lời đầy đủ hơn
"Khi PVC ở trạng thái Pending, nguyên nhân thường là cluster không có storage class phù hợp hoặc provisioner không tồn tại. Trong môi trường local như Docker Desktop, nhiều khi không có Longhorn nên nếu chart đang mặc định Longhorn thì PVC sẽ không bind được. Khi đó em sẽ đổi sang dùng storage class local sẵn có như hostpath hoặc local-path."

### Điều nên tránh
- không nói PVC pending là do pod lỗi, vì nhiều lúc chính pod lỗi là hậu quả của PVC chưa bind

---

## 17. Câu hỏi: Nếu ArgoCD app không Healthy thì em làm gì?

### Ý chính cần trả lời
- kiểm tra resource lỗi nào
- xem UI hoặc CLI
- xem pod, pvc, ingress, rollout tương ứng

### Câu trả lời ngắn
"Em sẽ kiểm tra trong ArgoCD resource nào đang lỗi, sau đó truy xuống resource đó bằng `kubectl` để xem logs hoặc describe."

### Câu trả lời đầy đủ hơn
"Nếu app không Healthy, em không chỉ nhìn trạng thái tổng mà sẽ đi xuống từng resource bên trong application để xem thành phần nào gây lỗi. Có thể là pod crash, rollout chưa hoàn thành, PVC chưa bind hoặc ingress chưa đúng. Em có thể xem trên UI ArgoCD hoặc dùng CLI để xác định resource lỗi, sau đó dùng `kubectl describe` và `kubectl logs` để phân tích sâu hơn."

### Điều nên tránh
- không trả lời kiểu cài lại ArgoCD ngay, vì đa số lỗi không nằm ở bản thân ArgoCD

---

## 18. Câu hỏi: Nếu ArgoCD và Helm cùng deploy thì có bị trùng không?

### Ý chính cần trả lời
- Helm direct deploy là để test thủ công
- ArgoCD là cách vận hành GitOps
- không nên để cả hai cùng quản lý lâu dài cùng một tài nguyên

### Câu trả lời ngắn
"Deploy trực tiếp bằng Helm trong bài của em chủ yếu để kiểm tra chart chạy được. Còn khi vận hành theo GitOps thì ArgoCD mới là công cụ quản lý chính."

### Câu trả lời đầy đủ hơn
"Trong quá trình học và kiểm thử, em deploy trực tiếp bằng Helm trước để xác minh chart đúng và resource tạo ra hợp lệ. Tuy nhiên trong mô hình vận hành chính, ArgoCD mới là thành phần theo dõi và quản lý trạng thái ứng dụng. Về lâu dài không nên để hai bên cùng quản lý một tập resource trong production vì dễ gây lệch trạng thái."

### Điều nên tránh
- không trả lời rằng dùng cả hai đồng thời lâu dài là tốt nhất

---

## 19. Câu hỏi: Tại sao em không deploy bằng file YAML thuần?

### Ý chính cần trả lời
- YAML thuần vẫn được
- nhưng khó tái sử dụng, khó scale project
- Helm phù hợp hơn với bài có nhiều service

### Câu trả lời ngắn
"Vẫn có thể deploy bằng YAML thuần, nhưng với bài có nhiều service và nhiều cấu hình lặp thì Helm phù hợp hơn vì tái sử dụng và quản lý tốt hơn."

### Câu trả lời đầy đủ hơn
"YAML thuần hoàn toàn có thể dùng để deploy Kubernetes. Nhưng khi hệ thống có nhiều service, nhiều môi trường và nhiều giá trị cần thay đổi như image tag, replica, host, secret, storage class thì YAML thuần sẽ rất cồng kềnh và khó bảo trì. Helm giúp em tham số hóa các phần đó bằng `values.yaml`, từ đó dễ tái sử dụng và dễ tích hợp với ArgoCD hơn."

### Điều nên tránh
- không phủ nhận hoàn toàn giá trị của YAML thuần

---

## 20. Câu hỏi: Nếu phải triển khai production thật thì em sẽ bổ sung gì?

### Ý chính cần trả lời
- monitoring, logging
- TLS/HTTPS
- external secrets
- registry private
- multi-environment
- backup/restore
- resource requests/limits chuẩn hơn

### Câu trả lời ngắn
"Nếu triển khai production thật, em sẽ bổ sung monitoring, logging, HTTPS, quản lý secret tốt hơn, backup dữ liệu và tách cấu hình theo môi trường."

### Câu trả lời đầy đủ hơn
"Nếu đưa lên production thực tế, em sẽ bổ sung nhiều phần ngoài phạm vi demo như monitoring và alerting, logging tập trung, TLS/HTTPS, quản lý secret bằng công cụ chuyên dụng, backup và restore cho dữ liệu, cấu hình resource requests/limits chặt chẽ hơn, tách môi trường dev/staging/prod, cũng như policies về bảo mật và networking."

### Điều nên tránh
- không nói bài hiện tại đã production-ready hoàn toàn nếu thực tế chưa phải

---

## 21. Câu hỏi: Trong bài của em phần nào là phần quan trọng nhất?

### Ý chính cần trả lời
- có thể chọn Helm + ArgoCD + Rollouts
- nói lý do chọn

### Câu trả lời ngắn
"Theo em, phần quan trọng nhất là kết hợp Helm với ArgoCD, vì nó biến việc deploy từ thao tác thủ công sang mô hình có cấu trúc và đồng bộ theo Git."

### Câu trả lời đầy đủ hơn
"Theo em phần quan trọng nhất là cách em tổ chức triển khai bằng Helm rồi kết nối với ArgoCD theo GitOps. Vì Helm giúp đóng gói và quản lý cấu hình, còn ArgoCD giúp tự động hóa việc đồng bộ xuống cluster. Argo Rollouts là phần nâng cao thêm để cải thiện độ an toàn khi release."

### Điều nên tránh
- không trả lời phần quan trọng nhất là giao diện ArgoCD vì đó không phải giá trị kỹ thuật cốt lõi

---

## 22. Câu hỏi: Nếu thầy hỏi sâu mà em không chắc thì trả lời sao cho an toàn?

### Cách trả lời an toàn
Bạn có thể nói:

"Theo phần em đã triển khai và kiểm thử thì em hiểu như sau..."

hoặc:

"Trong phạm vi bài của em, em đang áp dụng theo cách này..."

hoặc:

"Phần này em mới triển khai ở mức cơ bản, nhưng cách em hiểu là..."

### Vì sao cách này tốt
- trung thực
- không trả lời quá đà
- vẫn cho thấy bạn hiểu phần mình đã làm

### Điều nên tránh
- không đoán mò quá tự tin
- không nói đại kiểu "chắc là vậy"
- không tranh luận khi bạn không chắc

---

## 23. 10 câu hỏi khả năng cao nhất

Đây là 10 câu bạn nên học thuộc ý chính:

1. Bài của em làm gì?
2. Tại sao dùng Helm?
3. Helm umbrella chart là gì?
4. Tại sao dùng ArgoCD?
5. GitOps là gì?
6. Argo Rollouts là gì?
7. Tại sao product/order dùng rollout?
8. HPA là gì?
9. PVC là gì? Tại sao RabbitMQ cần PVC?
10. Nếu pod lỗi thì em debug thế nào?

---

## 24. Cách ôn nhanh trước buổi bảo vệ

Bạn nên ôn theo thứ tự này:

### Bước 1
Học thuộc phần mở đầu bài của bạn trong 3 đến 4 câu.

### Bước 2
Học ý chính của 10 câu hỏi khả năng cao nhất.

### Bước 3
Học thuộc 10 lệnh demo quan trọng.

### Bước 4
Nhớ 4 cách debug cơ bản:
- `kubectl get pods`
- `kubectl describe pod ...`
- `kubectl logs ...`
- `kubectl get applications -n argocd`

---

## 25. Mẫu kết thúc phần hỏi đáp

Bạn có thể nói:

"Phần em tập trung là chuẩn hóa quy trình triển khai microservices lên Kubernetes bằng Helm và GitOps với ArgoCD, đồng thời bổ sung rollout, autoscaling và lưu trữ để hệ thống thực tế hơn. Trong phạm vi bài này em đã cố gắng triển khai theo hướng gần với thực tế vận hành nhất có thể."
