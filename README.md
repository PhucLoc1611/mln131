# Ba Khóa – Hồ Sơ Kiến Thức

Web game 5 phút cho hoạt động ôn tập sau thuyết trình, gồm màn chơi của đội và bảng điều khiển/màn chiếu của MC.

## Chạy local

Yêu cầu Node.js 20.9 trở lên.

~~~powershell
npm install
npm run dev
~~~

Mở [http://localhost:3000/mc](http://localhost:3000/mc) trên máy MC. Chọn **Tạo phiên 5 phút**, sau đó gửi đường dẫn hiển thị cho các đội. MC bấm **Bắt đầu 5 phút**, theo dõi bảng tiến trình, bấm **Công bố kết quả** và cuối cùng **Mở lời giải**.

## Đồng bộ Upstash Redis

Sao chép `.env.example` thành `.env.local`, rồi điền hai giá trị từ database Upstash của bạn:

~~~env
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
~~~

Khi hai biến này có mặt, dữ liệu phiên/đội được lưu tại Redis và các màn hình polling 2 giây một lần để đồng bộ. Nếu không có chúng, app dùng bộ nhớ tạm để kiểm tra trên một máy; dữ liệu sẽ mất khi server khởi động lại.

## Kiểm tra

~~~powershell
npm test -- --run
npm run build
~~~

Checklist chạy buổi học:

- [ ] MC tạo phiên, gửi mã hoặc đường dẫn cho các đội.
- [ ] Mỗi đội vào `/play?session=<mã>`, nhập tên đội và hoàn thành từng khóa.
- [ ] Màn MC cập nhật tên, ba khóa, gợi ý và xếp hạng trong tối đa 2 giây.
- [ ] Sau 5 phút, MC công bố kết quả rồi mở lời giải; đội không còn gửi đáp án nhưng vẫn đọc được lời giải.

## Nguồn kỹ thuật

- [Next.js: Installation](https://nextjs.org/docs/app/getting-started/installation) — cấu trúc App Router và scripts.
- [Next.js: Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers) — API JSON trong thư mục `app`.
- [Upstash Redis: Connect with @upstash/redis](https://upstash.com/docs/redis/howto/connect-with-upstash-redis) — Redis HTTP và biến môi trường.
