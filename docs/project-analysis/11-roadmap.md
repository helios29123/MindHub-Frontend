# 11. Lộ trình Phát triển (Development Roadmap)

Dựa trên tiến độ hiện tại của dự án và các khoản nợ kỹ thuật đã được xác định, dưới đây là lộ trình được đề xuất để có thể ra mắt phiên bản v1.0 chính thức trên môi trường Production.

## Ưu tiên: Đặc biệt Khẩn cấp (Critical)
*Thời gian ước tính: 1-2 Tuần*

1. **Hoàn thiện Tích hợp Admin Dashboard**:
   - Xử lý dứt điểm các lỗi (conflicts) giao diện UI và gỡ bỏ toàn bộ dữ liệu giả (biến `allItems`) khỏi các trang Quản trị (VD: `CoursesManagement.tsx`, `DashboardOverview.tsx`).
   - Đảm bảo luồng Phê duyệt Khóa học (Course Approval) hoạt động trơn tru từ đầu đến cuối (end-to-end).

2. **Hoàn thiện Hệ thống Hỏi Đáp (Features/QA)**:
   - Đấu nối các component QA phía Frontend vào API `InteractionController` của Backend.
   - Đảm bảo Giảng viên sẽ nhận được thông báo (notifications) khi có câu hỏi mới.

3. **Sửa các lỗi nghiêm trọng ảnh hưởng đến Production**:
   - Sửa lỗi trang Hồ sơ Giảng viên bị mất dữ liệu trạng thái (state dropping) khi người dùng nhấn F5 (reload).
   - Xác minh (Verify) lại luồng Callback trả về của VNPay xem có hoạt động đúng trên môi trường deploy thực tế hay không, thay vì chỉ test ở máy local.

## Ưu tiên: Cao (High)
*Thời gian ước tính: 2-3 Tuần*

1. **Thanh toán Nợ Kỹ thuật (Technical Debt Eradication)**:
   - Xóa bỏ thư mục `src/assets/js/api` và di chuyển (migrate) hoàn toàn các chức năng còn sót lại sang file `api.ts` nằm ngay bên trong thư mục tính năng tương ứng.
   - Refactor (Cải tiến cấu trúc) file `AppContext.tsx`. Chia nhỏ Context này ra thành `AuthContext`, `CartContext`, và `CourseContext` để ngăn chặn việc hàng loạt component bị re-render không cần thiết.

2. **Xử lý Lỗi & Tăng tính Ổn định (Error Handling & Resilience)**:
   - Triển khai bộ bắt lỗi toàn cục (global error catching) cho Axios (tự động chuyển hướng về trang `/500` hoặc hiện Toast thông báo khi gặp lỗi 4xx).
   - Hoàn thiện giao diện Error Boundary tùy chỉnh để ứng dụng không bị trắng màn hình khi crash.

## Ưu tiên: Trung bình (Medium)
*Thời gian ước tính: 3-4 Tuần*

1. **Bộ Kiểm thử Frontend (Testing Suite)**:
   - Mở rộng phạm vi các bài test Playwright E2E cho luồng Lộ trình Học tập của Học viên và luồng Tạo Khóa học của Giảng viên.

2. **Tối ưu hóa Hiệu suất (Performance Optimization)**:
   - Áp dụng kỹ thuật tải lười (React Lazy Loading - `React.lazy`) cho các trang nặng nề (như Trình phát Video và Admin Dashboard) để giảm thiểu kích thước bundle JS tải về ban đầu.
   - Cài đặt Redis Cache phía Laravel để cache lại các dữ liệu thường xuyên truy cập nhưng ít bị thay đổi (như Danh mục khóa học Public và Banners).

## Ưu tiên: Thấp / Sau Launching (Low - Post-Launch)
*Thời gian ước tính: Thường xuyên (Ongoing)*

1. **Chuyển đổi sang React Query**:
   - Thay thế các đoạn code gọi API dùng `useEffect` tiêu chuẩn bằng `@tanstack/react-query`.
2. **Phân tích Số liệu Nâng cao (Advanced Analytics)**:
   - Tích hợp các công cụ theo dõi tương tác (engagement) của người dùng một cách sâu sát hơn.
3. **Ứng dụng Di động (Mobile Application)**:
   - Lên kế hoạch đánh phiên bản API (API versioning - VD: `/api/v2/`) để chuẩn bị hỗ trợ cho các ứng dụng native mobile (iOS/Android) trong tương lai.

---
*Tiếp theo: [12-developer-guide.md](./12-developer-guide.md)*
