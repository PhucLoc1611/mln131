# Thiết kế Khóa 1: kéo–thả và nộp bài

## Mục tiêu

Đội xếp sáu thẻ bằng kéo–thả trên máy tính hoặc chạm thẻ rồi chạm cột trên điện thoại. Các đáp án chỉ được kiểm tra khi đội bấm nút nộp Khóa 1.

## Tương tác

- Thẻ có thuộc tính `draggable` khi phiên đang chơi. Kéo thẻ vào một cột sẽ di chuyển thẻ tới cột đó.
- Cột đang là đích nhận thêm trạng thái trực quan khi thẻ đi vào/đi qua.
- Chạm thẻ rồi chạm cột giữ nguyên như một phương án cho điện thoại và bàn phím.
- Khi cả sáu thẻ đã được xếp, nút “Nộp Khóa 1” có thể bấm. Trước đó nút bị vô hiệu hóa và nêu rõ còn thiếu bao nhiêu thẻ.
- Nộp sai: giữ nguyên bảng, hiện thông báo “Chưa đúng, hãy kiểm tra lại các thẻ.”
- Nộp đúng: lưu đáp án vào máy chủ, mở Khóa 2 và hiện thông báo thành công.

## Dữ liệu và giới hạn

- Trong khi di chuyển, đáp án Khóa 1 chỉ ở trạng thái cục bộ của màn người chơi; máy chủ chỉ nhận chúng sau khi nộp đúng.
- Không đổi đáp án, cách chấm, hoặc API hiện có. Các khóa 2–3 tiếp tục lưu ngay khi người chơi sửa lựa chọn.
- Nút và thao tác bàn phím vẫn được duy trì để không phụ thuộc kéo–thả.

## Kiểm thử

- Kiểm thử kéo–thả đưa đúng thẻ sang cột đích.
- Kiểm thử nút nộp bị vô hiệu hóa khi chưa xếp đủ, báo sai khi xếp sai, và chỉ gọi lưu/mở khóa khi xếp đúng.
- Giữ kiểm thử chạm/bàn phím chuyển thẻ hiện có.
