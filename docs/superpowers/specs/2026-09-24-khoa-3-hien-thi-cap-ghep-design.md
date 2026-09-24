# Thiết kế hiển thị cặp ghép Khóa 3

## Mục tiêu

Đội nhìn thấy ngay mỗi hành động của Khóa 3 đã được ghép với căn cứ nào.

## Giao diện

- Thay danh sách hành động rời bằng hai hàng ghép.
- Mỗi hàng gồm nút hành động ở bên trái, mũi tên ở giữa và ô căn cứ ở bên phải.
- Ô căn cứ hiển thị `Chưa chọn căn cứ` khi hàng chưa được ghép; sau khi chọn, hiển thị đúng văn bản căn cứ đã lưu.
- Hàng đang được chọn có trạng thái focus/được chọn rõ ràng. Người chơi vẫn thao tác: chạm hành động, rồi chạm một trong hai thẻ căn cứ bên dưới.
- Có thể chọn lại hành động và thay căn cứ trước khi Khóa 3 hoàn thành.
- Khi Khóa 3 hoàn thành, dữ liệu và điều kiện mở khóa giữ nguyên.

## Kỹ thuật và kiểm thử

- Dữ liệu lấy trực tiếp từ `team.answers.lockThree`; không thêm API hoặc định dạng dữ liệu mới.
- Bổ sung component test: sau khi ghép, hàng `inclusion` hiển thị căn cứ đã chọn, hàng `voluntary` vẫn hiện trạng thái chưa chọn.
- Các nút giữ semantic button, nhãn đầy đủ và khả dụng bằng bàn phím.
