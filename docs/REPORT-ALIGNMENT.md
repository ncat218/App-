# Đối chiếu app với Final Report The Blazers và tiêu chí video

Nguồn đối chiếu: `Final Report_The Blazers.docx` và `Tiêu chí chấm.docx` do nhóm cung cấp ngày 30/10/2026. Đây là đối chiếu tính năng của **bản mô phỏng local bằng dữ liệu giả lập**; không phải bằng chứng triển khai tại nhà máy.

| Yêu cầu trong report | Cách app hiện thực | Kiểm tra |
| --- | --- | --- |
| Khóa dữ liệu, tránh trùng tồn và nguồn, năm xác nhận chuyên môn | Rule Engine kiểm tra tồn dùng được, nguồn theo mốc và chứng từ; DATA_HOLD nếu thiếu căn cứ | `tests/engine.test.ts` 01–13, 31–33, 38–41, 65–67 |
| Một Decision Passport cho nguyên liệu và phạm vi, có version, snapshot, tuyến Kho vận → Giám đốc → TGĐ | Hồ sơ EX-0041 và các hồ sơ phát sinh; checklist chụp lúc trình; đổi dữ liệu liên quan tạo phiên bản mới | 16–18, 21, 34–37, 47–48, 61–63 |
| A đủ dự trữ tại mọi mốc liên quan; khi đóng kiểm lại lượng và thời điểm nhận thực tế | Bảng mốc trong tab phương án và tờ trình; backend tính `requiredA`, kiểm lại `aTimeline` khi đóng | 14, 19, 22, 46, 64, 69 |
| B giữ nhu cầu gốc 220; 80 + 90 thực hiện, 50 chuyển kỳ có kế hoạch riêng | Bảng đợt và cân đối lũy kế, nguồn SHIP-90 còn dự kiến là điều kiện | 15, 20, 23–29, 59–60 |
| Kế hoạch điều chỉnh đúng phiên bản trước từng đợt; nguồn thực tế và xác nhận chuyên môn | `confirm_stage` đòi quyết định cùng version và chứng từ revised_plan đúng mã; Kho vận và Phân xưởng cùng xác nhận mỗi đợt; nguồn phụ thuộc có bốn mốc và ba xác nhận | 20, 26–29, 59, 70 |
| AI chỉ diễn giải ba nhận định từ số Rule Engine khóa; người kiểm tra giữ quyền quyết định | Prompt chỉ có cân đối, trạng thái nguồn và mã căn cứ; C1–C3 chờ người chấp nhận/sửa/bác bỏ; câu hỏi và thiếu căn cứ AI nằm ở lịch sử, không vào thân tờ trình | 42–43, 49–55, 68, 71 |
| Chỉ số bằng chứng dựa trên **lượt trình theo phiên bản**, kể cả trả lại | `submissionMetrics` đếm bản chụp `caseId:version`, không chỉ trạng thái hiện tại | 47, 72 |

**Giới hạn đúng như report.** G-Score, Precision/Recall và hiệu quả pilot để N/A khi chưa có tập đối chiếu, SLA và dữ liệu thực. Microsoft 365, Power Automate, Nano, OCR, đăng nhập doanh nghiệp và đồng bộ nhà máy là hướng triển khai tiếp, chưa được mô phỏng thành tích hợp thật. 20 ca nghiệm thu trong report chưa đồng nghĩa với nghiệm thu đầy đủ của doanh nghiệp; 72 bài test là kiểm thử phần mềm với dữ liệu giả lập.

**Video nộp.** Theo `Tiêu chí chấm.docx`: MP4 16:9, tối thiểu 1280×720, tối đa 1,5 GB và **không quá 5 phút**. Có quay màn hình thao tác thật, giọng thuyết minh hoặc phụ đề đồng bộ. Trình bày bài toán, công cụ/nền tảng, truy cập → thao tác → đầu ra, tác động dự kiến và giới hạn; không đưa dữ liệu nội bộ chưa được phép. Tập trung một nhánh A trong video chính để giữ thời lượng; nhánh B là bài demo bổ sung. File Word ở gốc repo hướng dẫn từng nút và lời thoại.
