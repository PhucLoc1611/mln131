# Thiết kế vào phiên bằng QR hoặc mã

## Mục tiêu

Thay luồng chia sẻ đường dẫn bằng một trang vào game chung. Người chơi tự chọn quét QR do MC trình chiếu hoặc nhập mã phiên sáu ký tự; sau khi xác thực phiên, họ bắt buộc đặt tên đội rồi mới vào ba khóa.

## Luồng người chơi

1. Truy cập trang chủ `/` và thấy hai hành động: **Quét QR để vào** và **Nhập mã phiên**.
2. Quét QR mở đường dẫn `/play?session=<mã>` trên điện thoại. Nhập mã chuẩn hóa chữ hoa rồi điều hướng tới cùng đường dẫn.
3. Trang `/play` kiểm tra mã phiên. Nếu hợp lệ, hiển thị biểu mẫu đặt tên đội; nếu không hợp lệ, hiển thị lỗi và liên kết quay về trang vào game.
4. Người chơi nhập tên đội (1–40 ký tự), được khôi phục cùng đội nếu trùng tên trong phiên, sau đó chờ MC bắt đầu/chơi ba khóa.

## Luồng MC

- Sau khi tạo phiên, màn `/mc` hiển thị QR lớn chứa đường dẫn đội chơi và mã sáu ký tự ngay bên dưới.
- Dòng hướng dẫn: “Quét mã để vào game hoặc nhập mã phiên ở trang chủ.”
- Không hiển thị đường dẫn dài trên màn chiếu; QR và mã là hai cách dự phòng tương đương.

## Kỹ thuật

- Dùng thư viện React QR nhỏ tạo SVG tại máy khách; QR không gọi dịch vụ ngoài và không chứa dữ liệu ngoài URL phiên.
- Cập nhật trang chủ thành client component để nhập mã và điều hướng bằng router.
- Giữ nguyên route `/play?session=<mã>` để QR hoạt động, API/tên đội và Redis không thay đổi.

## Kiểm thử

- Mã hợp lệ điều hướng tới `/play?session=<MÃ HOA>`; mã trống/không đủ sáu ký tự hiện lỗi tại chỗ.
- QR có URL đúng của phiên hiện tại; mã hiện dưới QR khớp URL.
- Trang `/play` với mã không tồn tại hiện thông báo rõ và nút quay về trang vào game.
- Luồng tên đội hiện tại tiếp tục hoạt động sau cả hai cách vào phiên.
