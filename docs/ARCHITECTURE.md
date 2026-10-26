# Kiến trúc và đối chiếu report

## Ranh giới

App này hiện thực quy trình nghiệp vụ để quay demo. Mẫu HTML được dùng làm định hướng hình ảnh; các con số trang trí trong HTML không được dùng như kết quả thật. Mọi số đếm trên dashboard lấy từ database.

Report mô tả triển khai tận dụng Excel/Python, Microsoft 365 và Gemini. Bản web gom chúng thành ba lớp tương ứng. Chưa kết nối tài khoản Microsoft/Nano, chưa triển khai tại nhà máy. Thiết kế kết nối hệ thống thực tế phải được xác nhận riêng.

| Report | Hiện thực |
| --- | --- |
| Excel chuẩn hóa dữ liệu | Bốn bước nhập dữ liệu, bảng sửa trực tiếp, CSV/JSON |
| Rule Engine Excel/Python/Pandas | `validate`, `calculate`, `proposalBalance` trong `lib/engine.ts` |
| SharePoint/Lists + Power Automate | API `transition`, DB, tuyến duyệt, checklist, audit events |
| Decision Passport | Case có số khóa, snapshot đầu vào, phương án, nhận định, nguồn, bằng chứng, quyết định, thực thi |
| Phiên bản và Override_Log | InputVersion, case version, history snapshot, audit trước/sau nhận định và lý do |
| Gemini | Backend gọi API tùy chọn; mẫu tự động được ghi nhãn rõ khi chưa có key/lỗi |
| OCR / lệch tiêu hao | Chưa bật; là phân hệ mở rộng có điều kiện |
| G-Score | N/A khi chưa có nhãn đối chiếu độc lập, SLA và dữ liệu đánh giá đầy đủ |

## API

- `GET /api/demo`: đọc/khởi tạo trạng thái của người dùng.
- `POST /api/demo`: `{revision, role, action, payload}`. Backend kiểm tra điều kiện nghiệp vụ, ghi nhật ký, UPDATE với revision cũ để phát hiện xung đột.
- `POST /api/files`: multipart `file`, tối đa 5 MB; lưu vào kho tệp của người dùng.
- `GET /api/files?key=...`: chỉ tải tệp thuộc người dùng hiện tại, qua attachment download.
- `GET /api/report?caseId=...`: báo cáo HTML đầy đủ, có nút in/lưu PDF; escape nội dung người dùng.

Actions chính: `save_inputs`, `run`, `narrative`, `review_claim`, `proposal`, `confirm_proposal`, `evidence`, `submit`, `forward`, `approve`, `return`, `reject`, `execution`, `release`, `close`, `reset`.

## Trạng thái

```text
draft → director_review → ceo_review → executing → closed
           ↓                  ↓
       needs_info          rejected
           └── xác minh / sửa / trình lại ──→ director_review

save_inputs → needs_review (hồ sơ đang mở)
run với dữ liệu hợp lệ → draft ở phiên bản mới
```

DATA_HOLD nằm ở chất lượng dữ liệu: không xóa hồ sơ, chặn số kết luận và chặn trình từ dữ liệu lỗi. Nếu chỉ thiếu ETA thì vẫn tính bảo thủ, giữ lượng chuyến và không cộng nguồn đó.

## Cân đối

U = tồn báo cáo - hàng chưa được phép dùng - phân bổ ngoài phạm vi. Các phần loại trừ được nhập dưới dạng đã chuẩn hóa, không chồng lặp.

P(t) = U + tổng nguồn đủ điều kiện sẵn sàng trước t - tổng nhu cầu trong phạm vi từ thời điểm chốt đến t.

Hai kịch bản: chắc chắn chỉ cộng chuyến released; kế hoạch cộng thêm planned được xác nhận lịch. unknown không được cộng. P >= S bình thường; 0 <= P < S cấp 1; P < 0 cấp 2.

Nhận hàng được theo dõi tại hồ sơ và không tự sửa snapshot đã duyệt. Cân đối kỳ tiếp theo phải nhập bộ tồn/kế hoạch mới, loại chuyến đã vào tồn để tránh tính trùng.

## Persistence và bảo mật demo

Schema có một bản trạng thái JSON theo owner và revision; thích hợp demo nhỏ, không phải mô hình quan hệ tối ưu cho vận hành nhiều phòng ban. Events chỉ được thêm qua transition; reset được phép xóa phiên demo. Snapshot cũ lưu trong history khi đầu vào đổi.

Local: owner mặc định `local-demo`. Hosting hỗ trợ identity header do dispatch cung cấp; app tách dữ liệu theo owner. Vai trò trong request là giả lập, người dùng có thể đổi để quay video. Kiểm tra vai trò trong state machine giúp kiểm chứng luồng nhưng không thay thế quyền tài khoản thực tế. Khi triển khai doanh nghiệp phải có membership, vai trò server-side và audit bất biến bên ngoài bản trạng thái.

Tệp nằm trong R2/local emulator, tách khỏi JSON. Khóa và database local không được commit. Gemini chỉ nhận số khóa và nhận định mẫu khi được cấu hình; đầu ra được lưu chờ kiểm tra, không thay phép tính hay duyệt tự động.

## Giới hạn cần kiểm chứng tiếp

Độ mới dữ liệu, SLA/lịch làm việc, mức dự trữ và thẩm quyền xác nhận cụ thể cần SFG thống nhất. Kịch bản B trong demo dùng Giám đốc xác minh thay vai trò phân xưởng riêng. Chưa có bộ đối chiếu lịch sử nhà máy hoặc kết quả tiết kiệm thời gian thực tế. Bộ test tự động kiểm tra hiện thực phần lõi, không tự nhận hoàn thành mọi điều kiện nghiệm thu trong report.
