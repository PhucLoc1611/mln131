# Thiết kế game "Ba Khóa – Hồ Sơ Kiến Thức"

## Mục tiêu

Tạo web game 5 phút sau phần thuyết trình. Mỗi đội giữ nguyên tên đội/phòng đã dùng từ đầu buổi, giải ba khóa theo thứ tự và nhận tối đa ba chìa khóa. MC đồng thời theo dõi, điều khiển và chiếu tiến độ chung.

## Người dùng và màn hình

### Đội chơi (`/play`)

- Nhập tên đội (lưu lại trên thiết bị) và vào phiên chơi đang mở.
- Thanh trạng thái luôn hiển thị tên đội, đồng hồ 5 phút và chuỗi `🔒 🔒 🔒` chuyển thành `🔓` khi hoàn thành từng khóa.
- Mỗi khóa hiển thị một thử thách tương tác, phản hồi đúng/sai, nút gợi ý và lời giải sau khi hoàn thành.
- Đội có thể sửa đáp án sai không giới hạn. Chỉ lần hoàn thành đầu tiên của khóa được tính thời gian.
- Khi hết giờ hoặc MC công bố kết quả, giao diện khóa thao tác mới và hiển thị phần tổng kết/lời giải chung.

### Màn chiếu MC (`/mc`)

- Tạo hoặc chọn một phiên chơi, có mã phiên ngắn để đội tham gia.
- Nút bắt đầu đồng hồ 5 phút, nút công bố kết quả, nút mở lời giải cho cả lớp và nút làm mới phiên.
- Bảng thời gian thực hiển thị tên đội, ba biểu tượng khóa, số chìa khóa, thời gian hoàn thành và số lượt gợi ý.
- Bảng xếp hạng sắp xếp giảm dần theo số khóa, sau đó tăng dần theo tổng thời gian hoàn thành.
- Phần cuối hiển thị lời kết mẫu và lời giải của từng khóa khi MC mở lời giải.

## Luồng chơi

1. MC mở phiên, đội truy cập `/play?session=<mã>` và nhập tên đội.
2. MC bắt đầu: đội lần lượt chơi ba khóa. Khóa sau chỉ hoạt động khi khóa trước đã mở.
3. Khi có thay đổi trạng thái, máy đội lưu dữ liệu và MC nhận bản cập nhật gần thời gian thực.
4. Sau 5 phút, MC công bố bảng xếp hạng. MC có thể mở lời giải cho toàn lớp, kể cả đội chưa hoàn thành.

## Ba khóa

### Khóa 1 — Khôi phục hồ sơ

Sáu thẻ được xáo thứ tự. Đội chạm thẻ rồi chọn ngăn **Nguồn gốc của tôn giáo** hoặc **Tính chất của tôn giáo**.

| Thẻ | Ngăn đúng |
| --- | --- |
| Nguồn gốc tự nhiên, kinh tế – xã hội | Nguồn gốc |
| Nguồn gốc nhận thức | Nguồn gốc |
| Nguồn gốc tâm lý | Nguồn gốc |
| Tính lịch sử | Tính chất |
| Tính quần chúng | Tính chất |
| Tính chính trị | Tính chất |

Mở khóa khi cả sáu thẻ ở đúng ngăn. Gợi ý: “Một nhóm trả lời câu hỏi ‘Tôn giáo hình thành từ đâu?’, nhóm còn lại nói về các tính chất của tôn giáo.” Sau đó hiện lại hai nhóm để ghi nhớ.

### Khóa 2 — Sửa thông điệp bị sai

Thông điệp có hai đoạn đánh dấu. Đội chạm một đoạn rồi chọn thẻ thay thế:

| Đoạn sai | Thẻ sửa đúng |
| --- | --- |
| chỉ tôn trọng người có tín ngưỡng | tôn trọng, bảo đảm quyền tự do tín ngưỡng và không tín ngưỡng của nhân dân |
| xem tín ngưỡng, tôn giáo và việc lợi dụng tín ngưỡng, tôn giáo là một | phân biệt tín ngưỡng, tôn giáo với việc lợi dụng tín ngưỡng, tôn giáo |

Thẻ nhiễu: “yêu cầu mọi người có cùng một tín ngưỡng”; “áp dụng một cách giải quyết giống nhau trong mọi hoàn cảnh”. Mở khóa khi cả hai đoạn đúng. Lời giải ngắn nhắc tôn trọng cả hai quyền và phải phân biệt hành vi lợi dụng.

### Khóa 3 — Trở lại khu phố

Đội ghép hai hành động với hai căn cứ:

| Hành động | Căn cứ trực tiếp nhất |
| --- | --- |
| Sửa quy định tham gia: không loại một người chỉ vì khác tôn giáo; khuyến khích cùng đóng góp cho hoạt động chung. | Thực hiện chính sách đại đoàn kết dân tộc. |
| Sửa thông báo: việc tham gia nghi lễ tín ngưỡng là tự nguyện. | Tôn trọng, bảo đảm quyền tự do tín ngưỡng và không tín ngưỡng của nhân dân. |

Lời giải nêu rõ hành động thứ nhất cũng liên quan tới tự do tín ngưỡng; trong hai thẻ có sẵn, game yêu cầu chọn căn cứ trực tiếp nhất. Nguồn nội dung: slide 170 và 172.

## Đồng bộ và lưu trữ

- Nếu cấu hình `UPSTASH_REDIS_REST_URL` và `UPSTASH_REDIS_REST_TOKEN`, máy chủ lưu trạng thái phiên/đội trong Upstash Redis.
- Mỗi lần đội thay đổi câu trả lời, ứng dụng cập nhật bản ghi đội và màn MC làm mới dữ liệu theo chu kỳ ngắn. Đây là đồng bộ gần thời gian thực, phù hợp phạm vi một buổi học mà không cần socket server.
- Nếu hai biến chưa tồn tại, ứng dụng dùng bộ nhớ cục bộ để chạy thử một máy; giao diện nêu rõ trạng thái này.
- Không lưu dữ liệu cá nhân ngoài tên đội.

## Trạng thái, lỗi và khả năng tiếp cận

- Nút thao tác có vùng chạm tối thiểu 44 px, có nhãn đọc màn hình, trạng thái focus rõ ràng và có phản hồi văn bản không chỉ dựa vào màu.
- Mạng tạm lỗi: hiển thị thông báo ngắn và nút thử lại; giữ trạng thái làm bài hiện tại tại trình duyệt để tránh mất đáp án.
- Sau khi hết giờ hoặc MC kết thúc, các thao tác gửi đáp án bị vô hiệu hóa nhưng lời giải vẫn đọc được.

## Kiểm thử

- Logic từng khóa: chỉ mở khi đáp án đầy đủ/chính xác, gợi ý không mở khóa, khóa sau không được truy cập sớm.
- Xếp hạng: số khóa ưu tiên hơn thời gian, trường hợp bằng nhau xử lý ổn định.
- Đồng bộ: cập nhật từ đội phản ánh ở dữ liệu MC; chế độ không có Redis không ảnh hưởng trải nghiệm chạy thử.
- Kiểm tra thủ công trên màn hình điện thoại và màn chiếu, bao gồm điều khiển bàn phím.
