# Quy trình hướng dẫn các workflow demo Cửu Long G-Sync

Tài liệu này hướng dẫn thao tác trên bản app hiện tại: chọn vai trò nào, mở màn hình nào, bấm nút nào và kết quả cần thấy. Chọn **workflow A** làm luồng demo chính; các workflow còn lại dùng để trình bày nhánh xử lý và kiểm soát.

## 1. Chuẩn bị trước khi demo

1. Mở PowerShell, vào thư mục repo, cập nhật và chạy app theo [README](README.md).
2. Mở địa chỉ `Local` mà terminal in ra, thường là `http://127.0.0.1:5173/`. Giữ PowerShell đang chạy.
3. Dùng một laptop và một tab app để quay toàn bộ quy trình. Đổi người thao tác bằng ô **Vai trò demo** ở góc trên bên phải.
4. Nếu muốn bắt đầu từ bộ mẫu ban đầu: chọn **Kho vận** → **Đặt lại kịch bản** ở sidebar → **Đặt lại demo**. Chỉ làm khi không cần giữ hồ sơ và nhật ký của phiên cũ; xuất báo cáo trước nếu cần lưu lại.

Mỗi laptop chạy local có database riêng. `git pull` chỉ cập nhật mã nguồn, không đồng bộ dữ liệu hồ sơ giữa các laptop. Các thành viên có thể chia nhau thuyết trình, nhưng cần đổi vai trên cùng một app để đi tiếp cùng hồ sơ.

**Điều cần nói rõ khi quay:** đây là dữ liệu giả lập, thao tác vai trò được mô phỏng; chưa phải kết quả vận hành hoặc triển khai tại nhà máy. Không cấu hình Gemini thì nhận định dùng mẫu tự động có ghi nhãn trên UI.

### Ai làm bước nào?

| Vai trò demo | Công việc trong app |
| --- | --- |
| **Kho vận** | Nhập dữ liệu, chạy cân đối, lập hồ sơ, rà soát nhận định, lưu phương án, trình và cập nhật thực hiện. |
| **KH-TM** | Xác minh nguồn và lịch của phương án A; có thể cập nhật tiến độ cung ứng. |
| **QA/QC** | Thêm chứng từ giải phóng chất lượng và xác nhận hàng thực nhận được phép dùng. |
| **Giám đốc Nhà máy** | Kiểm tra hồ sơ, trình TGĐ, yêu cầu bổ sung/từ chối và xác nhận đóng. Bản demo còn dùng vai trò này để xác minh phương án B. |
| **Tổng Giám đốc SFG** | Phê duyệt, yêu cầu bổ sung hoặc từ chối hồ sơ đã được GĐ trình. |

Với phương án B trong nghiệp vụ thực tế, phân xưởng cần xác nhận tính khả thi của kế hoạch điều chỉnh. App hiện mô phỏng bước này bằng vai trò Giám đốc Nhà máy, chưa có vai trò phân xưởng riêng.

## 2. Workflow A — Bổ sung nguyên liệu, từ đầu đến hoàn tất

**Mục tiêu:** phát hiện thiếu Kali, bổ sung kịp thời, duyệt đúng tuyến và đóng hồ sơ có bằng chứng.

```text
Kho vận nhập dữ liệu và chạy cân đối
→ Kho vận rà soát nhận định, lập phương án A
→ KH-TM xác minh phương án
→ Kho vận trình GĐ
→ GĐ kiểm tra và trình TGĐ
→ TGĐ phê duyệt
→ Kho vận cập nhật thực nhận
→ QA/QC xác nhận được phép dùng
→ GĐ kiểm tra bằng chứng và đóng hồ sơ
```

### A1. Nhập dữ liệu và tạo cảnh báo

| Bước | Vai trò | Thao tác | Kết quả cần thấy |
| --- | --- | --- | --- |
| 1 | Kho vận | Chọn **Tác nghiệp** → **Nhập dữ liệu**. | Bốn bước tiếp nhận, kiểm tra, xác nhận, chạy cân đối. |
| 2 | Kho vận | Bấm **Kiểm tra dữ liệu**. Giữ bộ mẫu để quay luồng chính. | Kali: tồn 150, chưa được dùng 20, dành cho lệnh khác 30, dự trữ 20 tấn. |
| 3 | Kho vận | Kiểm tra nhu cầu Kali 220 tấn lúc 07:00 ngày 24/10/2026; SHIP-90 có 90 tấn, sẵn sàng 26/10/2026. | Tồn dùng được là 100 tấn; hàng về sau mốc cần. |
| 4 | Kho vận | Bấm **Xác nhận dữ liệu** → **Dùng dữ liệu đã lưu**. Nếu có sửa số thì bấm **Lưu phiên bản mới**. | Sang bước 4. |
| 5 | Kho vận | Bấm **Chạy cân đối & tạo hồ sơ**. | Kali cấp 2: số dư -120 tấn; Urê bình thường; DAP cấp 1. |
| 6 | Kho vận | Tại dòng Kali, bấm **Hồ sơ**. | Mở EX-0041 nếu bắt đầu từ kịch bản vừa đặt lại. |

Giải thích số liệu: `150 − 20 − 30 = 100` tấn dùng được; `100 − 220 = −120` tấn. Bù 120 tấn chỉ đủ sản xuất; bù **140 tấn** thì còn giữ được **20 tấn dự trữ**. Chuyến 90 tấn về ngày 26 không được cộng trước ngày 24.

### A2. Chuẩn bị bằng chứng và rà soát nhận định

1. Giữ vai trò **Kho vận**. Trong hồ sơ, bấm **Thêm bộ căn cứ demo** ở phần **Chứng từ & bằng chứng**. App thêm ba tham chiếu giả lập: đối soát tồn kho, chất lượng và kế hoạch.
2. Mở tab **Nhận định & phương án** → bấm **Soạn nhận định**.
3. Ở phần **Nhận định có nguồn**, đọc từng mục **C1, C2, C3** và đối chiếu số khóa/nguồn:
   - Đúng: bấm **Chấp nhận** ở mục đó.
   - Cần sửa: nhập nội dung thay thế và lý do, bấm **Sửa & lưu lý do**.
   - Không có căn cứ: nhập lý do, bấm **Bác bỏ**.
4. Hoàn thành kiểm tra cả ba mục, không để mục nào **Chờ kiểm tra**. Phải còn ít nhất một nhận định được chấp nhận hoặc sửa hợp lệ; nếu bác bỏ toàn bộ, cần soạn và kiểm tra lại nội dung có căn cứ.

**Đây là bước riêng với xác minh phương án.** KH-TM xác minh nguồn/lịch không tự đánh dấu C1–C3 đã được Kho vận kiểm tra. Nếu bấm **Soạn nhận định** lần nữa, bộ nhận định mới trở lại trạng thái chờ kiểm tra.

### A3. Lưu và xác minh phương án

| Bước | Vai trò | Thao tác | Kết quả cần thấy |
| --- | --- | --- | --- |
| 1 | Kho vận | Kéo xuống **Phương án xử lý**, chọn **A — Bổ sung nguyên liệu**. | Hiển thị trường lượng bổ sung và lịch sẵn sàng. |
| 2 | Kho vận | Điền 140 tấn; lịch sẵn sàng 24/10/2026 06:00 hoặc giữ mặc định 07:00. Không muộn hơn mốc cần 07:00. | Số dư sau phương án 20 tấn, đạt dự trữ. |
| 3 | Kho vận | Điền mã nguồn/lịch `KH-TM-DEMO-01`; ghi rõ điều kiện và dữ liệu giả lập → **Lưu phương án**. | Nút **Xác minh phương án** xuất hiện cạnh nút lưu. |
| 4 | KH-TM | Đổi **Vai trò demo** sang **KH-TM**, vẫn ở tab **Nhận định & phương án** → bấm **Xác minh phương án**. | Dấu ✓ **Phương án đã xác minh**. |

Nút xác minh chỉ xuất hiện sau khi phương án được lưu và chưa được xác minh. Muốn bấm phải chọn đúng vai trò. Lưu lại phương án sẽ yêu cầu xác minh lại, kể cả khi vừa thấy dấu ✓ trước đó.

### A4. Trình và duyệt đúng tuyến

| Bước | Vai trò | Màn hình và nút bấm | Trạng thái sau thao tác |
| --- | --- | --- | --- |
| 1 | Kho vận | Tab **Tổng hợp & bằng chứng**: kiểm tra sáu mục checklist. | Đúng phiên bản; đủ tồn kho, chất lượng, kế hoạch; nhận định đã kiểm tra; phương án đã xác minh. |
| 2 | Kho vận | Tab **Kiểm tra & phê duyệt** → **Trình Giám đốc Nhà máy**. | **Chờ GĐ Nhà máy**. |
| 3 | Giám đốc Nhà máy | Đổi vai trò, vẫn ở tab này → **Kiểm tra & trình TGĐ**. | **Chờ TGĐ SFG**. |
| 4 | Tổng Giám đốc SFG | Đổi vai trò → **Phê duyệt phương án**. | **Đang thực hiện**; lưu phiên bản được duyệt. |

Hồ sơ còn mang nhãn **Nháp · chờ xác minh** sau khi riêng phương án đã xác minh là bình thường trong bản UI hiện tại. Chỉ khi trình thành công mới chuyển sang **Chờ GĐ Nhà máy**. Xem checklist và thông báo để biết bước còn thiếu.

### A5. Thực nhận, QA/QC và đóng hồ sơ

| Bước | Vai trò | Thao tác | Kết quả cần thấy |
| --- | --- | --- | --- |
| 1 | Kho vận | Mở tab **Theo dõi thực thi** → **Điền kết quả demo**. | Điền 140 tấn, lịch theo phương án đã duyệt và ghi chú giả lập. |
| 2 | Kho vận | Kiểm tra thời điểm sẵn sàng không muộn hơn 24/10/2026 07:00 → **Lưu tiến độ**. | Kết quả thực nhận được lưu; chỉ bấm điền mẫu chưa lưu database. |
| 3 | Kho vận | Kéo xuống **Chứng từ & bằng chứng**. Chọn **Lệnh mua / điều động**, nhập `DC-DEMO-001 · cấp 140 tấn giả lập` → **Thêm**. | Có dòng chứng từ lệnh cấp/mua. |
| 4 | Kho vận | Chọn **Chứng từ thực nhận**, nhập `PN-DEMO-001 · nhận đủ 140 tấn giả lập` → **Thêm**. | Có dòng chứng từ thực nhận. |
| 5 | QA/QC | Đổi vai trò. Chọn loại **Giải phóng chất lượng**, nhập `QC-DEMO-001 · 140 tấn được phép dùng, giả lập` → **Thêm**. | Có chứng từ xác nhận được phép dùng. |
| 6 | QA/QC | Quay lên phần thực thi → **QA/QC xác nhận**. | Checklist QA/QC chuyển sang đã xác nhận. Thêm phiếu chưa thay cho thao tác xác nhận này. |
| 7 | Giám đốc Nhà máy | Đổi vai trò → **Xác nhận đóng hồ sơ**. | Hồ sơ **Hoàn tất**, ghi nhận người và thời điểm đóng. |

Có thể đính kèm tệp được phép sử dụng khi thêm chứng từ. Bản demo cũng cho ghi mã tham chiếu mà không tải tệp; luôn ghi rõ chứng từ dựng là giả lập.

Nếu sửa lượng hoặc thời điểm thực nhận sau khi QA/QC đã xác nhận, backend yêu cầu QA/QC xác nhận lại trước khi đóng.

### A6. Trình bày kết quả

1. Trong hồ sơ, xem trạng thái **Hoàn tất**, checklist và **Lịch sử hồ sơ**.
2. Bấm **Xuất tờ trình** ở đầu trang → trong tab báo cáo, bấm **In / lưu PDF** nếu cần.
3. Chọn khu vực **Điều hành** → **Audit Trail**, tìm `EX-0041`: xem ai soạn, kiểm tra, xác minh, trình, duyệt và đóng.
4. Mở **Governance & báo cáo**: xem số đếm theo database và xuất báo cáo JSON/CSV. G-Score hiện **N/A** vì chưa đủ dữ liệu đối chiếu độc lập/SLA; không trình bày thành điểm quản trị thực tế.

## 3. Workflow B — Điều chỉnh kế hoạch sản xuất

**Mục tiêu:** chứng minh hệ thống kiểm tra được phương án đổi lịch/giảm nhu cầu, thay cho bổ sung nguyên liệu trước ngày 24.

Để dễ quay, xuất kết quả A rồi đặt lại kịch bản. Thực hiện lại **A1–A2** để có EX-0041 và đủ căn cứ/nhận định đã kiểm tra. Sau đó:

| Bước | Vai trò | Thao tác | Kết quả cần thấy |
| --- | --- | --- | --- |
| 1 | Kho vận | Tab **Nhận định & phương án** → chọn **B — Điều chỉnh kế hoạch**. | Có trường nhu cầu chạy tại lịch mới. |
| 2 | Kho vận | Đặt lịch 26/10/2026 07:00, nhu cầu 170 tấn; mã `KH-DIEUCHINH-DEMO-01`; ghi chú dời 50 tấn nhu cầu. | 100 tồn giữ lại + 90 hàng về − 170 nhu cầu = 20 tấn dự trữ. |
| 3 | Kho vận | Bấm **Lưu phương án**. | Chờ xác minh phương án B. |
| 4 | Giám đốc Nhà máy | Đổi vai trò → **Xác minh phương án**. | Phương án đã xác minh, theo phân công mô phỏng của bản demo. |
| 5 | Kho vận → GĐ → TGĐ | Làm đúng tuyến ở **A4**. | Hồ sơ **Đang thực hiện** theo phương án B. |
| 6 | Kho vận | Tab **Theo dõi thực thi** → **Điền kết quả demo**; kiểm tra ô **Kế hoạch điều chỉnh đã được thực hiện** được chọn → **Lưu tiến độ**. | Lưu xác nhận đã thực hiện lịch mới. |
| 7 | Kho vận | Thêm loại **Kế hoạch được duyệt**, tham chiếu `KH-DC-DEMO-001 · lịch mới 26/10, nhu cầu 170 tấn, giả lập`. | Bằng chứng kế hoạch điều chỉnh. |
| 8 | Kho vận | Thêm loại **Xác nhận thực hiện kế hoạch**, tham chiếu `LSX-MOI-DEMO-001 · đã chạy theo kế hoạch điều chỉnh, giả lập`. | Có bằng chứng thực thi B. |
| 9 | Giám đốc Nhà máy | Bấm **Xác nhận đóng hồ sơ**. | **Hoàn tất** phương án B. |

Phương án này giả định 100 tấn ban đầu vẫn được giữ đến ngày 26. Nếu lượng đó đã dùng cho lệnh khác, phải cập nhật và tính lại. Không kết luận “chờ chuyến 90 tấn rồi chạy đủ 220 tấn”; để giữ dự trữ 20, chỉ đủ chạy 170 tấn trong tình huống mẫu.

## 4. Workflow yêu cầu bổ sung hoặc từ chối

**Điểm bắt đầu:** hồ sơ đang **Chờ GĐ Nhà máy** hoặc **Chờ TGĐ SFG**.

1. Chọn vai trò đúng với cấp đang chờ: **Giám đốc Nhà máy** hoặc **Tổng Giám đốc SFG**.
2. Tab **Kiểm tra & phê duyệt**: nhập **Ý kiến kiểm tra / lý do trả lại**, ví dụ `Cần bổ sung xác nhận nguồn và lịch cấp hàng`.
3. Bấm **Yêu cầu bổ sung** hoặc **Từ chối**. Hồ sơ lần lượt chuyển sang **Yêu cầu bổ sung** hoặc **Đã từ chối**; lý do và thao tác được ghi vào nhật ký.
4. Đổi sang **Kho vận**, sửa nhận định/phương án hoặc thêm bằng chứng theo yêu cầu. Khi chỉnh nội dung hồ sơ được trả lại, app tạo phiên bản mới và giữ bản trước trong lịch sử.
5. Nếu lưu lại phương án, hoàn thành các thay đổi trước rồi mới đổi sang **KH-TM** để xác minh A, hoặc **Giám đốc Nhà máy** để xác minh B.
6. Đổi về **Kho vận**, bảo đảm nhận định đã kiểm tra và checklist đầy đủ → trình lại từ GĐ → TGĐ.

Không để TGĐ duyệt ngay hồ sơ vừa bị trả lại; hồ sơ phải đi lại đúng tuyến.

## 5. Workflow thay đổi dữ liệu sau khi đã trình hoặc duyệt

**Mục tiêu:** chứng minh quyết định cũ không tự áp dụng cho số liệu mới. Chọn một hồ sơ chưa đóng; có thể dừng luồng A ở **Chờ GĐ Nhà máy** hoặc **Đang thực hiện** để quay nhánh này.

1. Chọn **Kho vận** → **Nhập dữ liệu** → bước **Kiểm tra dữ liệu**.
2. Đổi nhu cầu Kali từ 220 thành 230 tấn và đổi phiên bản kế hoạch thành `KH-2026-10-v2`.
3. Sang **Xác nhận & lưu** → **Lưu phiên bản mới**. Hồ sơ đang mở chuyển sang **Cần xem xét lại**; phê duyệt của phiên bản trước không còn là điều kiện thực hiện phiên bản mới.
4. Sang bước 4 → **Chạy cân đối & tạo hồ sơ**. Kali có số dư -130 tấn; để giữ dự trữ 20 cần bù 150 tấn theo nguồn chắc chắn.
5. Mở lại hồ sơ: kiểm tra phiên bản tăng và bộ số liệu mới. Chuẩn bị lại bằng chứng, soạn/rà soát nhận định, lập và xác minh phương án rồi trình duyệt lại.
6. Mở lịch sử/ xuất báo cáo JSON để đối chiếu phiên bản và nhật ký thay đổi.

Khi chạy lại sau khi đầu vào đổi, căn cứ, nhận định, phương án và phần thực thi của bản đang xử lý được chuẩn bị lại; snapshot trước được giữ trong lịch sử. Không cần xóa hồ sơ để giả lập tình huống này.

## 6. Workflow kiểm tra lịch hàng về và DATA_HOLD

Chạy từng tình huống từ bộ dữ liệu mẫu, ở vai trò **Kho vận**. Sau khi sửa ở bước 2, luôn **Lưu phiên bản mới** rồi **Chạy cân đối**. Các thay đổi này sẽ yêu cầu xem xét lại hồ sơ đang mở.

### Các kịch bản hàng về

Giữ tồn dùng được 100 tấn, nhu cầu 220, dự trữ 20 và chuyến 90 tấn:

| Tình huống | Thay đổi SHIP-90 | Số dư chắc chắn | Số dư kế hoạch | Điểm cần giải thích |
| --- | --- | --- | --- | --- |
| Về trễ | Giữ lịch 26/10, trạng thái **Lịch dự kiến đã xác nhận**. | -120 | -120 | Không cộng nguồn sau mốc cần ngày 24. |
| Có lịch dự kiến kịp | Sẵn sàng 24/10/2026 06:00, trạng thái **Lịch dự kiến đã xác nhận**. | -120 | -30 | Hai kịch bản khác nhau; kế hoạch vẫn thiếu. |
| Được phép dùng, kịp thời điểm | Giữ lịch 24/10/2026 06:00, chuyển sang **Đã được phép sử dụng**. | -30 | -30 | Nguồn này mới được tính vào kịch bản chắc chắn; vẫn thiếu 30 tấn cho sản xuất. |
| Chưa rõ lịch | Chọn **Chưa rõ lịch**; giữ lượng gốc 90 tấn. | -120 | -120 | Không xóa lượng chuyến; không cộng nguồn chưa rõ lịch. |

### Dữ liệu không đủ tin cậy

1. Trong bảng tồn kho, nhập lượng Kali **Chưa được dùng = 160 tấn**, vượt tồn báo cáo 150; hoặc bỏ dấu xác nhận Kali ở bước 3.
2. Lưu phiên bản rồi chạy cân đối.
3. Kết quả mong đợi: **DATA_HOLD · Cần xác minh dữ liệu**, chỉ rõ lỗi; không phát kết quả cân đối định lượng chính thức.
4. Sửa lại lượng giữ 20 tấn, xác nhận căn cứ, lưu và chạy lại để tiếp tục.

Nói rõ đây là kiểm tra chất lượng đầu vào. Khi lỗi dữ liệu lõi tồn tại, app không được tự đưa ra kết luận thiếu hụt chính thức.

## 7. Workflow chứng minh không được đóng hồ sơ quá sớm

**Điểm bắt đầu:** phương án A đã được duyệt, hồ sơ **Đang thực hiện**.

| Thao tác thử | Kết quả mong đợi | Cách đi tiếp |
| --- | --- | --- |
| Chọn GĐ và bấm đóng khi chưa cập nhật nhận đủ hàng. | Chặn: **Chưa nhận đủ lượng theo phương án đã duyệt.** | Kho vận điền đúng kết quả và **Lưu tiến độ**. |
| Nhận đủ 140 nhưng lịch sẵn sàng sau 07:00 ngày 24/10. | Chặn: **Thực nhận chưa kịp thời điểm cần; phải xử lý tiếp.** | Trong kịch bản kiểm thử, sửa về thời điểm giả lập đúng; tình huống thực tế cần xử lý lại phương án. |
| Nhận đủ, đúng thời điểm, nhưng QA/QC chưa xác nhận. | Chặn: **QA/QC chưa xác nhận hàng được phép dùng.** | QA/QC thêm chứng từ giải phóng chất lượng rồi bấm **QA/QC xác nhận**. |
| Đã nhận đủ và QA/QC xác nhận, nhưng còn thiếu lệnh mua/điều động hoặc chứng từ nhận. | Chặn vì chưa đủ chứng từ thực thi. | Thêm đúng loại chứng từ còn thiếu; GĐ kiểm tra rồi đóng. |

Backend kiểm tra theo thứ tự; nếu còn nhiều điều kiện thiếu, thông báo sẽ nêu điều kiện bị chặn trước tiên. Đây là hành vi kiểm soát, không phải lỗi app.

Với phương án B, để trống xác nhận kế hoạch mới đã thực hiện hoặc thiếu chứng từ **Xác nhận thực hiện kế hoạch** cũng sẽ bị chặn đóng.

## 8. Tra nhanh khi đang demo bị vướng

| Hiện tượng | Cần làm gì? |
| --- | --- |
| Không thấy **Xác minh phương án**. | Kho vận phải **Lưu phương án** trước. Nút xuất hiện ở tab **Nhận định & phương án**, phần **Phương án xử lý**, cạnh nút lưu. |
| Thấy nút xác minh nhưng không bấm được. | Chọn **KH-TM** cho A; **Giám đốc Nhà máy** cho B; hồ sơ phải đang ở bước có thể xác minh. |
| Đã xác minh phương án nhưng chưa trình được. | Xem thông báo và checklist. **C1–C3 cũng phải được kiểm tra**, không chỉ xác minh phương án. |
| Báo **Cần kiểm tra từng nhận định trước khi trình**. | Kho vận → tab **Nhận định & phương án** → kéo lên mục **Nhận định có nguồn** → xử lý hết C1, C2, C3. Nếu chưa có, bấm soạn rồi rà soát. |
| Báo thiếu tồn kho/chất lượng/kế hoạch. | Kho vận → phần **Chứng từ & bằng chứng** → **Thêm bộ căn cứ demo**, hoặc thêm từng loại có căn cứ tương ứng. |
| Nhãn vẫn **Nháp · chờ xác minh** dù có dấu ✓ phương án. | Nhãn bao quát toàn bộ hồ sơ. Kiểm tra các mục khác rồi trình; trạng thái sẽ đổi khi trình thành công. |
| Nút trình hoặc duyệt bị mờ. | Đổi đúng vai trò và kiểm tra đúng trạng thái: Kho vận trình, GĐ chuyển TGĐ, TGĐ duyệt. |
| Đã thêm phiếu QA/QC nhưng chưa đóng được. | QA/QC còn phải bấm **QA/QC xác nhận**. Nếu sửa lượng/thời điểm sau đó, xác nhận lại. |
| Đã **Điền kết quả demo** nhưng checklist thực nhận chưa đổi. | Bấm **Lưu tiến độ** để gửi dữ liệu xuống backend. |
| Báo dữ liệu đã thay đổi ở cửa sổ khác. | Tải lại trang, mở đúng hồ sơ, chọn lại vai trò rồi thao tác theo bản mới. Hạn chế chạy hai tab cùng lúc khi quay. |
| Đồng đội không thấy hồ sơ trên laptop khác. | Database local riêng từng máy. Quay luồng liên vai trên cùng một máy; Git không đồng bộ dữ liệu demo. |
| Không sửa được hồ sơ đã hoàn tất. | Hồ sơ đã đóng được giữ lại. Xuất kết quả trước, rồi đặt lại kịch bản nếu cần quay từ đầu. |

## 9. Thứ tự gợi ý để thuyết trình

1. **Bài toán:** tồn báo cáo khác lượng có thể sử dụng; cần cân đối theo hạn sản xuất.
2. **Luồng chính A:** đủ từ nhập liệu đến hoàn tất, nhấn mạnh phân biệt rà soát nhận định, xác minh phương án và phê duyệt.
3. **Một nhánh kiểm soát:** thử trình khi nhận định chưa kiểm tra hoặc đóng khi thiếu bằng chứng; khắc phục rồi đi tiếp.
4. **Kết quả:** tờ trình, Audit Trail, số đếm thực tế trong phiên demo.
5. **Nếu còn thời gian:** quay riêng B hoặc thay đổi ETA/phiên bản; đặt lại dữ liệu có chủ đích trước khi chuyển kịch bản.

Không trình bày số liệu giả lập thành hồ sơ thật, nhận định theo mẫu thành lời gọi Gemini thật, hoặc demo thành kết quả pilot. Kịch bản thuyết trình ngắn 6–8 phút có ở [docs/DEMO.md](docs/DEMO.md).
