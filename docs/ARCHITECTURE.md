# Kiến trúc demo Governance v2

Web React/Vinext/TypeScript mô phỏng thiết kế report. Giữ D1 SQLite local, R2 local và trạng thái JSON theo owner/revision; chưa thay bằng Excel/Python, Power Automate/SharePoint, Nano hoặc tài khoản doanh nghiệp.

## Nghiệp vụ và dữ liệu

- `lib/engine.ts`: đối soát, năm xác nhận theo dấu dữ liệu từng nguyên liệu, hai bảng cân đối chắc chắn/kế hoạch, phân kỳ hồ sơ, A/B, duyệt và thực thi.
- `Inputs`: tồn tổng hợp kèm căn cứ loại trùng và lệnh phân bổ ngoài phạm vi; nhu cầu có scope; chuyến có phần đã nằm trong tồn, chứng từ/kỳ chốt, bốn mốc dự kiến/thực tế, xác nhận Kho vận/QA/KH-TM. Tổng loại trừ không tự chứng minh không chồng lặp.
- `Case`: khóa sự kiện nguyên liệu + scope (mặc định tháng); mọi nhu cầu vẫn dùng chung tồn lũy kế, không tách tồn ảo giữa các scope. Lưu input snapshot, needIds, version, lịch sử, quyết định đã ban hành, yêu cầu thay đổi, phần thực thi phải chờ.
- B có mảng stages và carry; kiểm tra mọi mốc của các đợt và nhu cầu khác trong chân trời xử lý. 220 = 80 + 90 + 50. B cho phép nguồn dự kiến có điều kiện; chốt thực tế ở xác nhận đợt và đóng.
- B cần Phân xưởng + KH-TM xác minh; Giám đốc chỉ kiểm tra/trình. Trước từng xác nhận đợt phải có quyết định cùng phiên bản và revised_plan đúng mã/phiên bản. B đóng khi mỗi đợt có cả Kho vận và Phân xưởng xác nhận, nguồn sẵn sàng thực tế, và chuyển kỳ được tiếp nhận riêng. Không dùng plan ban đầu thay revised_plan.
- A kiểm tra dự trữ ở mọi mốc nhu cầu liên quan trong phạm vi hồ sơ và tính lại theo lượng/ngày nhận thực tế khi đóng. A giữ lượng, lịch, QA, lệnh/nhận/release; bổ sung xác nhận Kho vận/Kế toán/QA trên đúng receiptId. Đổi lượng/ngày/mã nhận hủy xác nhận.
- Evidence có version + executionId (mã đợt, lần nhận, kế hoạch). Chứng từ cũ không tự áp dụng, cần ghi căn cứ dùng lại. App kiểm tra siêu dữ liệu và xác nhận người, chưa tự thẩm định nội dung tệp.
- Save không đổi nghiệp vụ không tăng input/case version. Save đổi urê không hủy Kali. Thay đổi tồn/nguồn của nguyên liệu ảnh hưởng các hồ sơ dùng nguồn đó; nhu cầu cùng phạm vi hoặc trước chân trời xử lý được xét như phụ thuộc. Nhu cầu ở kỳ tương lai độc lập không hủy quyết định của kỳ trước. Phần chưa thực hiện của hồ sơ bị ảnh hưởng phải chờ; chưa phân tích phụ thuộc cấp lô để chỉ dừng một phần đợt.
- `close_verified`: đủ cân đối mới, đúng xác nhận chuyên môn, bằng chứng và lý do Giám đốc; phân biệt với close thực thi trong UI, JSON, tờ trình và KPI.
- DATA_HOLD không phát kết quả chính thức, vẫn có risk_notice với người/hạn xác minh, chưa có nhắc việc SLA tự động.

## Gemini

`lib/narrative.ts` chỉ nhận số khóa Rule Engine, trạng thái nguồn, phiên bản và mã căn cứ được phép; không diễn giải phương án A/B hay xếp hạng kinh tế. Kiểm tra JSON, trường bắt buộc và nguồn; bắt buộc người rà soát. Chỉ accepted/edited vào thân tờ trình; rejected và gợi ý AI chưa kiểm chứng nằm ở lịch sử rà soát cùng trước/sau, lý do, DATA/RULE/LLM/FLOW, người và version.

Lưu requestedModel, modelVersion phản hồi, promptVersion, thời điểm, thành công/fallback/not-configured, usageMetadata nếu có. Không lưu key; lỗi chỉ ghi mã, không ghi response chứa dữ liệu nhạy cảm. Không có key vẫn chạy mẫu; chưa có lời gọi thực không được báo kết quả AI hoặc chi phí thật. Tham khảo [Google generateContent API](https://ai.google.dev/api/generate-content).

## API và lưu trữ

- GET/POST `/api/demo`: đọc/nâng schema v2, thực hiện transition; optimistic revision tránh ghi đè. Khi nâng dữ liệu cũ, giữ hồ sơ/lịch sử; hồ sơ mở cần xem xét lại, không tự cấp xác nhận chuyên môn.
- `/api/files`: R2/local file upload/download ≤5 MB, theo owner.
- `/api/report`: HTML in/PDF, escape nội dung; đồng bộ stages, carry, source actuals, xác nhận, quyết định, lý do kết thúc. JSON nguyên trạng qua dashboard/hồ sơ.
- Nhóm action mới: confirm_input, confirm_input_shipment, risk_notice, reuse_evidence, source_actual, confirm_source, stage_execution, confirm_stage, confirm_carry, confirm_receipt, close_verified.
- Không thay bảng SQL/thư viện trong bản này; schemaVersion nằm trong JSON. Không tự xóa dữ liệu local. Reset là thao tác demo có chủ ý, có xác nhận trên UI.

## Giới hạn triển khai

Chọn vai trò là mô phỏng, backend kiểm tra vai trò khai báo; chưa gắn vai trò với danh tính SFG. Chưa có audit bất biến bên ngoài payload; reset xóa phiên demo. DB local mỗi máy độc lập. Đồng bộ nhà máy, độ mới dữ liệu, quy mô mẻ thật, mức tồn, thẩm quyền và SLA cần thống nhất khi thí điểm. G-Score/Precision/Recall giữ N/A; không coi test mô phỏng là đo hiệu quả 40–50%.
