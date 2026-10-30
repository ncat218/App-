# Quy trình quay demo Cửu Long G-Sync · Governance v2

Toàn bộ số liệu, chứng từ và người xác nhận trong bộ mẫu là **GIẢ LẬP**. Chọn **Chuyển vai trò mô phỏng** ở đầu màn hình để đóng vai từng bộ phận; đây chưa phải đăng nhập nhân viên SFG. Backend vẫn kiểm tra vai trò và điều kiện nghiệp vụ.

## 1. Mở app sau khi cập nhật

Mở PowerShell; nếu app đang chạy thì Ctrl+C trước:

```powershell
cd "$env:USERPROFILE\App-"
git pull --ff-only
npm.cmd run dev
```

Mở địa chỉ Local được in ra, thường `http://127.0.0.1:5173`. Bản cập nhật Governance này không đổi thư viện hay bảng SQL, không cần cài lại. Nếu quay bằng `npm run start`, cần `npm.cmd run setup` để build lại trước khi start.

Dữ liệu cũ được giữ và nâng mô hình khi đọc; hồ sơ đang mở chuyển sang xem xét lại, không tự biến xác nhận cũ thành xác nhận chuyên môn. Để quay một lượt mới từ mẫu v2: xuất JSON nếu muốn giữ kết quả cũ, chọn **Kho vận → Đặt lại kịch bản → Đặt lại demo**. Nút đặt lại xóa dữ liệu phiên demo của laptop này; không bắt buộc nếu muốn tiếp tục xử lý dữ liệu cũ.

## 2. Hiểu dữ liệu và xác nhận đầu vào

Chọn **Kho vận → Nhập dữ liệu**. Bốn bước: tiếp nhận → kiểm tra → xác nhận & lưu → chạy cân đối.

- Mẫu Kali: tồn 150, giữ 20, phân bổ ngoài phạm vi 30, dự trữ 20 → dùng được 100 tấn. Nhu cầu LSX-0041 là **220 tấn** vào 24/10/2026 07:00.
- SHIP-90 là 90 tấn dự kiến sẵn sàng 26/10/2026 06:00. Tại 24/10 không cộng chuyến trễ: số dư −120, cần A140 nếu giữ dự trữ.
- Biên bản loại trùng và danh sách lệnh ngoài phạm vi đi cùng A0. Tổng loại trừ không vượt tồn **không chứng minh** đã hết chồng lặp. Web yêu cầu đối soát của người phụ trách.
- Nếu hàng đã trong tồn: nhập **lượng đã nằm trong tồn**, chứng từ nhập và đúng kỳ chốt. Chỉ phần chưa nằm trong tồn được cộng ở hàng về.
- Bốn mốc ETA, bốc dỡ, tiếp nhận, QA có dự kiến và thực tế riêng. Chỉ ETA hoặc tự chọn “Sẵn sàng thực tế” chưa đủ trở thành nguồn chắc chắn.
- Xóa lịch sẵn sàng sẽ chuyển “Chưa rõ lịch”; vẫn giữ 90 tấn, tính bảo thủ.
- Phạm vi mặc định tháng `2026-10`; có thể nhập mã kỳ/lệnh riêng để tách sự kiện độc lập. Nhu cầu vẫn tính lũy kế và cùng dùng tồn, không tự nhân đôi nguồn giữa các kỳ.

Bộ mẫu đã có năm xác nhận **GIẢ LẬP**. Nếu chỉnh dữ liệu, bước 3 cho lưu với lý do; hồ sơ liên quan phải xem xét lại. Sau đó điền mã căn cứ chuyên môn và chuyển từng vai trò để xác nhận trên dữ liệu đã lưu:

| Vai trò | Nút / trách nhiệm |
| --- | --- |
| Kho vận | `Xác nhận KALI inventory`: tồn, loại trừ đã loại trùng, A0 chỉ ngoài phạm vi |
| Kế toán | `Xác nhận KALI books`: đối soát sổ sách |
| QA/QC | `Xác nhận KALI quality`: chất lượng tồn |
| Phân xưởng | `Xác nhận KALI plan`: kế hoạch, định mức có hiệu lực; mã mới không tự hiệu lực |
| KH-TM | `Xác nhận KALI supply`: lịch, nguồn hàng |

Lặp lại cho nguyên liệu thực sự thay đổi. Nếu nhập chuyến released, lưu đủ bốn mốc thực tế và chứng từ rồi Kho vận, QA/QC, KH-TM lần lượt **Xác nhận chuyến SHIP-90**. Cuối cùng Kho vận sang bước 4 **Chạy cân đối & tạo hồ sơ**.

## 3. Workflow A · bổ sung 140 tấn

1. Kho vận bấm **Bắt đầu kịch bản EX-0041** hoặc chạy cân đối. Mở hồ sơ **EX-0041**. Nếu nhập thêm ca nhu cầu trong cùng hồ sơ, A sẽ gợi ý lượng đủ dự trữ tại mọi mốc liên quan; không giữ cứng 140 tấn.
2. Tab **Nhận định & phương án** → A có sẵn 140 tấn, lịch trước ca, mã `KH-TM-DEMO-01` → **Lưu phương án**.
3. Bấm **Thêm bộ căn cứ demo** ở khung Chứng từ. Đây là căn cứ tồn, chất lượng, kế hoạch ban đầu đúng phiên bản; không thay xác nhận thực nhận sau này.
4. Bấm **Soạn nhận định** → đọc C1–C3 → **Chấp nhận C1/C2/C3**. Nếu sửa/bác bỏ: nhập lý do, chọn DATA/RULE/LLM/FLOW. Nhận định bác bỏ chỉ ở lịch sử, không vào thân tờ trình.
5. Chuyển **KH-TM → Xác minh phương án**. Lưu lại phương án sẽ xóa xác minh và đưa nhận định về chờ rà soát; không bấm lưu lại sau khi đã xác minh nếu không sửa gì.
6. Kho vận → **Kiểm tra & phê duyệt → Trình Giám đốc Nhà máy**. Backend chụp checklist và danh sách chứng từ tại thời điểm trình.
7. Giám đốc → **Kiểm tra & trình TGĐ**; Tổng Giám đốc → **Phê duyệt phương án**.
8. Kho vận → **Theo dõi thực thi → Điền kết quả demo → Lưu tiến độ A**. Mẫu lần nhận `PN-DEMO-001`, 140 tấn, trước mốc cần. Điền mẫu chỉ điền form, không xác nhận nghiệp vụ.
9. Khung chứng từ: **phiên bản trên chứng từ = phiên bản hồ sơ hiện hành**, liên kết `PN-DEMO-001`. Thêm lần lượt:
   - Kho vận: **Lệnh mua / điều động**, mã `LM-DEMO-001`.
   - Kho vận: **Chứng từ thực nhận**, mã `PN-DEMO-001`.
   - QA/QC: **Giải phóng chất lượng**, mã `QC-PN-DEMO-001`.
10. Kho vận bấm **Kho vận xác nhận lần nhận**; Kế toán bấm **Kế toán xác nhận lần nhận**; QA/QC bấm **QA/QC xác nhận**. Mỗi người đối chiếu đúng lượng, ngày, mã nhận đang lưu.
11. Giám đốc xem khung **Điều kiện đóng hồ sơ**. Nếu đủ, **Xác nhận đóng hồ sơ** → **Hoàn tất thực thi**. Đổi lượng/ngày/mã nhận làm các xác nhận cũ hết hiệu lực.
12. **Xuất tờ trình → In / lưu PDF**; hoặc **Xuất hồ sơ JSON**. G-Score giữ N/A.

## 4. Workflow B · 80 + 90 tấn, 50 tấn chuyển kỳ

Đặt lại demo trước lượt B để có lại EX-0041 gốc. Không sửa nhu cầu gốc 220 thành 170.

1. Kho vận chạy cân đối, mở EX-0041 → **Nhận định & phương án → B · Tách đợt & chuyển kỳ**.
2. Mẫu có hai đợt:

   | Đợt | Lịch | Nhu cầu | Nguồn | Số dư kế hoạch |
   | --- | --- | --- | --- | --- |
   | DOT-1 | 24/10/2026 07:00 | 80 tấn | OPENING | 100 − 80 = 20 |
   | DOT-2 | 26/10/2026 06:00 | 90 tấn | SHIP-90 | 100 + 90 − 80 − 90 = 20 |

   Chuyển kỳ **50 tấn**, kế hoạch `KH-KYSAU-DEMO`, người phụ trách và căn cứ duyệt có sẵn để sửa. Luôn giữ **220 = 80 + 90 + 50**. Bảng cân đối kiểm tra từng mốc, kể cả nhu cầu khác dùng cùng tồn. SHIP-90 còn planned vẫn lập B có điều kiện được.
3. **Lưu phương án → Thêm bộ căn cứ demo → Soạn nhận định → Chấp nhận C1/C2/C3**.
4. **Phân xưởng → Xác minh phương án**: xác nhận tách lệnh, quy mô mẻ, ảnh hưởng kế hoạch. **KH-TM → Xác minh phương án**: xác nhận lịch nguồn phụ thuộc. Cần đủ cả hai; Giám đốc không xác minh thay Phân xưởng.
5. Kho vận trình → Giám đốc kiểm tra & trình → Tổng Giám đốc phê duyệt như A.
6. Tab **Theo dõi thực thi**, Phân xưởng thêm chứng từ **Kế hoạch điều chỉnh đã duyệt**, mã `KH-DIEUCHINH-DEMO-01`, liên kết đúng mã này, phiên bản hiện hành. Kế hoạch ban đầu không thay chứng từ này. Phải gắn trước lần xác nhận đầu tiên của từng đợt.
7. Kho vận → **Điền mẫu DOT-1 → Lưu DOT-1**. Phân xưởng thêm **Chứng từ thực hiện từng đợt**, mã `TH-DOT-1-GIẢ-LẬP`, liên kết `DOT-1`, phiên bản hiện hành. Kho vận bấm **Xác nhận DOT-1 · Kho vận**, sau đó Phân xưởng bấm **Xác nhận DOT-1 · Phân xưởng**.
8. Thử nhánh chặn: Kho vận điền/lưu DOT-2, Phân xưởng thêm chứng từ thực hiện liên kết `DOT-2` rồi bấm **Xác nhận DOT-2** khi nguồn vẫn chưa có thực tế. App phải báo **Nguồn phụ thuộc chưa thực sự sẵn sàng**. Giám đốc chưa được đóng.
9. Trong khung **Nguồn phụ thuộc**: Kho vận hoặc KH-TM bấm **Điền mẫu nguồn SHIP-90 → Lưu thực tế SHIP-90**. Mẫu gồm 90 tấn và đủ bốn mốc thực tế theo thứ tự. Đây là bước tạo số liệu giả lập có chủ ý cho demo, không phải cập nhật tự động từ nhà máy.
10. Kho vận, QA/QC, KH-TM lần lượt bấm **Xác nhận nguồn SHIP-90**. Cả ba phải có xác nhận trên đúng dữ liệu nguồn đang lưu. Sửa thực tế nguồn sẽ hủy xác nhận cũ.
11. Kho vận → **Xác nhận DOT-2 · Kho vận**; Phân xưởng → **Xác nhận DOT-2 · Phân xưởng**. Nếu đã xác nhận đợt 2 rồi lại sửa nguồn, phải xác nhận lại đợt phụ thuộc.
12. Phân xưởng thêm **Kế hoạch tiếp nhận chuyển kỳ**, mã `PD-CHUYENKY-DEMO`, liên kết `KH-KYSAU-DEMO`, phiên bản hiện hành. Giám đốc → **Xác nhận liên kết chuyển kỳ**.
13. Giám đốc xem khung điều kiện rồi **Xác nhận đóng hồ sơ**. Thiếu kế hoạch điều chỉnh, đợt thực thi, nguồn thực tế, xác nhận, hoặc liên kết 50 tấn sẽ bị chặn và nêu mục thiếu.
14. Xuất tờ trình HTML/PDF và JSON. Cả hai phải có DOT-1/DOT-2, 50 tấn chuyển kỳ, nguồn, xác nhận và phiên bản. Đóng B có nghĩa đã thực hiện 170 tấn và xác nhận liên kết xử lý 50 tấn; **không tuyên bố đã đáp ứng đủ 220**.

## 5. Trả lại, sửa phiên bản và chứng từ cũ

- Khi đang chờ Giám đốc hoặc TGĐ: nhập lý do → **Yêu cầu bổ sung** hoặc **Từ chối**.
- Kho vận sửa/lập lại nội dung sẽ tạo phiên bản hồ sơ mới. Phiên bản cũ xem ở **Quyết định, yêu cầu thay đổi & lịch sử → Xem bản ghi phiên bản cũ**.
- Chứng từ cũ không tự dùng cho v2. Có thể nhập căn cứ tại **Căn cứ chứng từ cũ còn áp dụng** và bấm **Xác nhận còn áp dụng**, hoặc thêm chứng từ mới ghi đúng phiên bản. Chứng từ chuyên môn vẫn cần đúng vai trò.
- Soạn/kiểm tra lại C1–C3, xác minh lại phương án, trình lại đúng tuyến. Không lấy quyết định v1 cho phương án v2.
- Thử đổi **chỉ urê** ở đầu vào rồi lưu có lý do: hồ sơ Kali đang được duyệt/thi hành giữ hiệu lực; urê cần xác nhận lại. Lưu nguyên dữ liệu không tăng phiên bản nghiệp vụ.
- Thử đổi lượng Kali sau phê duyệt: giữ bản quyết định đã ban hành, mở yêu cầu xem xét thay đổi, dừng phần thực hiện chưa hoàn tất của hồ sơ đó. Khung lịch sử nêu trường đổi, lý do, phiên bản và phạm vi dừng.

## 6. Kết thúc theo xác minh

Đặt lại demo → chạy tạo EX-0041 → nhập dữ liệu, tăng tồn Kali từ 150 lên 400 với lý do “Kiểm kê xác minh lại” → lưu. Năm bộ phận xác nhận lại Kali theo bảng ở mục 2 → Kho vận chạy lại cân đối.

EX-0041 chuyển **Cần xem xét lại** vì cân đối đủ. Thêm chứng từ **Xác minh hết ngoại lệ**, đúng phiên bản; Giám đốc mở **Kiểm tra & phê duyệt**, nhập lý do → **Kết thúc theo xác minh**. Không tạo giả phương án mua hàng/đổi lịch. Nhãn kết thúc này không cộng vào KPI “Hoàn tất thực thi”.

## 7. DATA_HOLD và thông báo có điều kiện

Ví dụ bỏ xác nhận tổng hợp hoặc thiếu căn cứ loại trùng → lưu → chạy: DATA_HOLD, không có bảng số kết luận chính thức. Trên **Cân đối & cảnh báo**, điền nội dung rủi ro, người xử lý, hạn xác minh → **Lập thông báo rủi ro**. Thông báo giữ danh sách dữ liệu chưa xác minh; không tự cấp duyệt hay tạo khẳng định định lượng.

## 8. Gemini và bằng chứng thử nghiệm

Không có key: **mẫu tĩnh**. Có key: backend chỉ gửi số khóa từ Rule Engine, phiên bản, trạng thái nguồn và danh mục mã căn cứ; không gửi phương án A/B hay tệp đính kèm để OCR. Gemini chỉ soạn ba nhận định cốt lõi. Đầu ra thiếu trường / nguồn ngoài danh mục / lỗi API: **mẫu dự phòng**, không gắn Gemini thành công. Câu hỏi và căn cứ do AI gợi ý chỉ hỗ trợ rà soát, nằm ở lịch sử, không vào thân tờ trình.

Trong tab nhận định có trạng thái, model phản hồi thật và nút **Xuất lịch sử Gemini (model / token)**. Token chỉ lưu khi API trả; không suy ra chi phí từ dự toán. Tất cả phản hồi đều chờ người kiểm tra; kiểm tra cấu trúc/nguồn không chứng minh AI giữ đúng mọi số.

Để bật local: copy `.dev.vars.example` thành `.dev.vars`, điền key/model của nhóm rồi khởi động lại dev. Không đưa key lên GitHub. Cấu hình này không cần cho A/B hoạt động. Các test Gemini tự động dùng mock được ghi rõ; không phải số liệu gọi thật.

## 9. Các lỗi dễ gặp

| Thông báo / biểu hiện | Xử lý |
| --- | --- |
| Không đủ kiểm tra từng nhận định | Sau lưu phương án, soạn và xử lý lại cả C1–C3; không bỏ mục pending |
| B chỉ có Phân xưởng xác minh | Chuyển KH-TM xác nhận nguồn phụ thuộc nữa |
| Thiếu kế hoạch điều chỉnh | Chọn đúng loại, đúng mã liên kết, phiên bản; chứng từ kế hoạch ban đầu không đủ |
| DOT-2 chưa thực sự sẵn sàng | Lưu thực tế nguồn rồi Kho vận/QA/KH-TM xác nhận; sau đó Kho vận và Phân xưởng xác nhận đợt |
| Thiếu chuyển kỳ | Chứng từ carry_plan liên kết KH-KYSAU-DEMO và Giám đốc xác nhận tiếp nhận |
| A còn chờ Kế toán | Thêm receipt đúng lần nhận rồi Kế toán xác nhận riêng |
| Sửa đầu vào rồi không chạy được | Hoàn thiện căn cứ và năm xác nhận trên dữ liệu đã lưu, sau đó chạy lại |
| Hai laptop không thấy cùng hồ sơ | DB local từng máy độc lập; git pull chỉ cập nhật mã, không đồng bộ hồ sơ |

Chưa xây trong lượt demo này: Microsoft 365/Power Automate thực, Nano, OCR, tiêu hao theo mẻ, SLA tự động, G-Score/Precision/Recall thật, đăng nhập doanh nghiệp và đánh giá hiệu quả nhà máy.
