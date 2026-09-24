# Hướng dẫn chơi — Ba Khóa: Hồ Sơ Kiến Thức

Game gồm hai màn hình: màn MC để điều hành và màn đội chơi trên điện thoại.

## 1. MC tạo phiên

1. Mở trang `/mc`.
2. Chọn **Tạo phiên 5 phút**.
3. Màn chiếu hiện mã QR và mã phiên gồm 6 ký tự.
4. Khi có ít nhất một đội đã đặt tên, chọn **Bắt đầu 5 phút**.

Không cần chờ tất cả đội vào. Những đội vào sau vẫn có thể tham gia nếu phiên đang chạy.

## 2. Đội vào game

Đội chọn một trong hai cách:

- Quét QR trên màn chiếu bằng điện thoại.
- Mở trang chủ game, nhập mã phiên 6 ký tự rồi chọn **Vào phiên**.

Sau đó, đội nhập tên đội. Hãy dùng đúng tên đang dùng trong buổi học để MC dễ nhận diện trên bảng tiến trình.

## 3. Giải ba khóa

- **Khóa 1 — Khôi phục hồ sơ:** chọn thẻ, sau đó chọn ngăn “Nguồn gốc” hoặc “Tính chất”.
- **Khóa 2 — Sửa thông điệp bị sai:** chọn đoạn đánh dấu trong câu, sau đó chọn thẻ thay thế đúng.
- **Khóa 3 — Trở lại khu phố:** chọn hành động, sau đó chọn căn cứ kiến thức trực tiếp nhất.

Mỗi khóa mở được nhận một chìa khóa. Đội có thể sửa đáp án sai không giới hạn và có nút **Gợi ý** khi cần.

## 4. Kết thúc

- Đồng hồ chạy 5 phút sau khi MC bấm bắt đầu.
- Thứ hạng ưu tiên số chìa khóa, sau đó là thời gian hoàn thành.
- MC chọn **Công bố kết quả** để khóa bài làm và xem bảng xếp hạng.
- MC chọn **Mở lời giải** để cả lớp xem đáp án và phần kết bài.

## Lưu ý cho MC

- Nếu đã chọn **Mở lời giải**, phiên đó đã kết thúc và không thể bắt đầu lại. Chọn **Phiên mới** để tạo lượt chơi khác.
- Khi dùng Upstash Redis, dữ liệu đội/phiên được đồng bộ giữa điện thoại và màn MC khoảng mỗi 2 giây.
