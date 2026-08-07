# 06. Hướng dẫn sử dụng API (API Walkthrough)

## 1. Tổng quan
API được thiết kế dưới dạng RESTful JSON API sử dụng các phương thức HTTP tiêu chuẩn (`GET`, `POST`, `PUT`, `DELETE`). Xác thực được thực thi thông qua `Bearer` tokens.

Tất cả các endpoint đều có tiền tố là `/api/` (được cấu hình bởi Laravel).

## 2. Các Module API

### Xác thực (Auth) (`routes/api/auth.php`)
- `POST /api/login`: Đăng nhập, trả về token và dữ liệu user.
- `POST /api/register`: Tạo mới tài khoản người dùng.
- `POST /api/logout`: Thu hồi token hiện tại (đăng xuất).
- `GET /api/me`: Lấy dữ liệu hồ sơ của user đang đăng nhập hiện tại.

### Danh mục & Khóa học (Catalog & Courses) (`routes/api/catalog.php`, `course.php`)
- `GET /api/categories`: Lấy danh sách tất cả các danh mục.
- `GET /api/courses`: Lấy danh sách khóa học đang public (Hỗ trợ tìm kiếm, lọc, phân trang).
- `GET /api/courses/{slug}`: Lấy chi tiết công khai của một khóa học.
- `GET /api/courses/{id}/reviews`: Lấy danh sách đánh giá cho một khóa học.

### Giảng viên (Instructor) (`routes/api/instructor.php`)
*(Được bảo vệ bằng `role:instructor`)*
- `GET /api/instructor/courses`: Liệt kê các khóa học thuộc sở hữu của giảng viên.
- `POST /api/instructor/courses`: Tạo một khóa học bản nháp (draft) mới.
- `PUT /api/instructor/courses/{id}`: Cập nhật thông tin chi tiết khóa học.
- `POST /api/instructor/courses/{id}/sections`: Quản lý chương (curriculum sections).
- `POST /api/instructor/courses/{id}/lessons`: Quản lý bài giảng bên trong chương.
- `GET /api/instructor/dashboard`: Lấy thống kê về doanh thu và lượt đăng ký.

### Học tập (Learning) (`routes/api/learning.php`)
*(Được bảo vệ bằng `auth:sanctum` và kiểm tra quyền đã mua khóa học)*
- `GET /api/learning/my-courses`: Liệt kê các khóa học user đã mua.
- `GET /api/learning/courses/{id}/outline`: Trả về toàn bộ đề cương khóa học cho trình phát (video player).
- `GET /api/learning/lessons/{id}`: Trả về nội dung của một bài học (bao gồm cả URL video đã ký/signed URLs).
- `POST /api/learning/progress`: Đánh dấu một bài học hoặc thời điểm trong video là đã hoàn thành.

### Thanh toán (Payment) (`routes/api/payment.php`)
- `POST /api/payment/checkout`: Bắt đầu quá trình thanh toán cho các mục trong giỏ hàng.
- `POST /api/payment/apply-coupon`: Kiểm tra tính hợp lệ và tính toán giảm giá của coupon.
- `GET /api/payment/vnpay-return`: Xử lý URL callback (chuyển hướng) trả về từ cổng thanh toán VNPay.

### Quản trị viên (Admin) (`routes/api/admin.php`)
*(Được bảo vệ bằng `role:admin`)*
- `GET /api/admin/dashboard`: Lấy thống kê tổng quan toàn bộ nền tảng.
- `GET /api/admin/courses/pending`: Liệt kê các khóa học đang chờ kiểm duyệt.
- `POST /api/admin/courses/{id}/approve`: Phê duyệt hoặc Từ chối khóa học.
- `GET /api/admin/withdrawals`: Quản lý các yêu cầu rút tiền của giảng viên.

## 3. Tiêu chuẩn hóa (Standardization)
- **Lỗi Validation (Validation Errors)**: Luôn trả về HTTP `422 Unprocessable Entity` kèm theo một object `errors`.
- **Phản hồi Thành công (Success Responses)**: Trả về HTTP `200 OK` hoặc `201 Created`. Thường được định dạng qua Laravel API Resources để đảm bảo luôn bọc bên trong thẻ `data`.
- **Phân trang (Pagination)**: Các endpoint trả về danh sách đều đính kèm sẵn các object `meta` và `links` chuẩn dùng cho điều hướng phân trang.

---
*Tiếp theo: [07-feature-analysis.md](./07-feature-analysis.md)*
