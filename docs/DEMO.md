# Kịch bản quay demo 6–8 phút

Hướng dẫn chi tiết từng workflow, nút bấm và cách xử lý khi bị chặn: [quy trình.md](../quy%20tr%C3%ACnh.md).

## 1. Bối cảnh và dữ liệu (1 phút)

- Chọn Tác nghiệp, vai trò Kho vận.
- Đặt lại kịch bản nếu cần quay từ đầu.
- Mở Nhập dữ liệu, xem 4 nhóm và tải mẫu CSV nếu cần.
- Bước 2: Kali tồn 150; giữ chất lượng 20; dành lệnh khác 30; khả dụng 100. Nhu cầu 220 vào 24/10 lúc 07:00. SHIP-90 đến 26/10.
- Bước 3 xác nhận, bước 4 chạy cân đối.
- Nói rõ: số liệu dựng theo Phụ lục F, không phải kết quả thực tế.

## 2. Cảnh báo (45 giây)

- Kali cấp 2: -120 tấn, dưới mức dự trữ 20 thêm 140.
- Urê bình thường; DAP cấp 1 là bộ dữ liệu bổ sung giả lập để minh họa phân loại.
- Bấm Hồ sơ của Kali để mở EX-0041.

## 3. Chuẩn bị hồ sơ (2 phút)

- Bấm **Thêm bộ căn cứ demo**: tồn kho, chất lượng, kế hoạch.
- Tab **Nhận định & phương án** → **Soạn nhận định**.
- Nếu không bật Gemini, nói đây là mẫu tự động từ Rule Engine, không phải kết quả AI thật.
- Chấp nhận từng nhận định sau đối chiếu, hoặc nhập nội dung/lý do và bấm sửa để thể hiện nhật ký kiểm tra.
- Chọn A, lượng 140, sẵn sàng 24/10/2026 06:00; mã KH-TM-DEMO-01; bấm Lưu phương án.
- Chuyển vai trò **KH-TM**, bấm **Xác minh phương án**.
- Chuyển lại **Kho vận**, tab **Kiểm tra & phê duyệt**, bấm **Trình Giám đốc Nhà máy**.

## 4. Phê duyệt (1 phút)

- Chuyển **Giám đốc Nhà máy**; bấm **Kiểm tra & trình TGĐ**.
- Chuyển **Tổng Giám đốc SFG**; bấm **Phê duyệt phương án**.
- Nói rõ: đây là mô phỏng vai trò trong demo, chưa phải đăng nhập doanh nghiệp.
- Có thể quay thêm nhánh yêu cầu bổ sung: nhập lý do → trả hồ sơ → xác minh lại → trình lại.

## 5. Thực thi và đóng (2 phút)

- Tab **Theo dõi thực thi**. Chuyển **Kho vận**.
- Bấm **Điền kết quả demo**, hoặc nhập thực nhận 140; thời điểm sẵn sàng 24/10/2026 06:00; ghi chú `Nhận đủ lượng theo phương án A (giả lập)`; bấm Lưu tiến độ.
- Bảng chứng từ bên dưới: chọn **Lệnh mua / điều động**, mã `DC-DEMO-001 · cấp 140 tấn`; bấm Thêm.
- Chọn **Chứng từ thực nhận**, mã `PN-DEMO-001 · thực nhận 140 tấn`; bấm Thêm. Có thể đính kèm tệp PDF/ảnh bất kỳ được phép dùng để demo.
- Chuyển **QA/QC**, chọn loại **Giải phóng chất lượng**, mã `QC-DEMO-RELEASE · 140 tấn được phép dùng`; bấm Thêm.
- Bấm **QA/QC xác nhận**.
- Chuyển **Giám đốc Nhà máy**, bấm **Xác nhận đóng hồ sơ**.
- Có thể thử đóng sớm trước bước QC để thấy backend chặn, rồi hoàn tất điều kiện.

## 6. Truy vết (45 giây)

- Xem checklist và lịch sử hồ sơ.
- Mở Audit Trail, tìm EX-0041.
- Mở Governance & báo cáo: số hồ sơ được tính thật; G-Score N/A do chưa có dữ liệu đối chiếu/SLA.
- Xuất báo cáo JSON hoặc mở hồ sơ, bấm Xuất tờ trình, rồi In/lưu PDF trong tab báo cáo đầy đủ.

## Nhánh B, thay đổi dữ liệu và lỗi

- B: chờ đến 26/10, dùng 170 tấn, còn 20; dời 50 tấn nhu cầu. Xác minh B ở vai trò GĐ trong demo. Sau duyệt, xác nhận kế hoạch mới đã chạy và thêm chứng từ **Xác nhận thực hiện kế hoạch** trước khi đóng.
- Đổi ETA SHIP-90 sang trước mốc cần: số dư theo kế hoạch -30; chắc chắn vẫn -120 nếu chưa được phép dùng. Đổi trạng thái released thì nguồn chắc chắn mới tính thêm 90.
- Đổi trạng thái chưa rõ lịch: giữ lượng 90 nhưng không cộng vào nguồn.
- Sửa dữ liệu sau khi đã trình: lưu phiên bản mới, duyệt cũ bị vô hiệu, phải chạy cân đối và chuẩn bị lại hồ sơ.
- Bỏ xác nhận nguyên liệu hoặc nhập lượng giữ vượt tồn: DATA_HOLD, không có kết quả định lượng chính thức.
