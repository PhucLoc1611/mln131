# Thiết kế điều kiện bắt đầu phiên

## Quy tắc

MC chỉ có thể bấm **Bắt đầu 5 phút** sau khi có ít nhất một đội đã hoàn tất bước đặt tên trong phiên. Không có yêu cầu số đội tối đa hoặc phải chờ tất cả đội tham gia.

## Giao diện

- Khi phiên chưa có đội: nút bắt đầu bị vô hiệu hóa, kèm nhãn “Chờ ít nhất 1 đội tham gia”.
- Khi đội đầu tiên tham gia: polling màn MC nhận dữ liệu trong tối đa 2 giây và nút bắt đầu tự hoạt động.
- Bảng tiến trình tiếp tục hiển thị các đội tham gia sau thời điểm bắt đầu theo hành vi hiện có.

## Bảo vệ máy chủ và kiểm thử

- API chuyển trạng thái sang `active` từ chối phiên không có đội để tránh bypass nút giao diện.
- Kiểm thử xác nhận phiên trống không bắt đầu được; phiên có một đội bắt đầu được.
