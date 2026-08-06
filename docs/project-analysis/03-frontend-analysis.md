# 03. Phân tích Chuyên sâu Frontend (Frontend Deep Dive)

## 1. Tổng quan
Frontend được xây dựng dưới dạng Single Page Application (SPA) sử dụng React 19, Vite, và TypeScript. Dự án dùng Tailwind CSS v4 để định dạng kiểu (styling) và Framer Motion để tạo hiệu ứng chuyển động (animations).

## 2. Các Khái niệm Cốt lõi

### Gom code theo Tính năng (Feature-Based Colocation)
Thay vì gom nhóm các file theo kiểu (ví dụ: tất cả components để chung ở `src/components`, tất cả API calls ở `src/api`), codebase được nhóm theo **Tính năng (Feature)**.
Nếu một tính năng là "Quản lý Khóa học", thì `src/features/courses/` sẽ chứa các components, hooks, types, và API client wrappers riêng của nó.
Kiến trúc này giúp codebase dễ dàng mở rộng khi dự án lớn lên.

### State Toàn cục (React Context)
Quản lý trạng thái chủ yếu được xử lý thông qua React Context, cụ thể là tại `src/app/AppContext.tsx`.
Nó cung cấp:
- `currentUser` và `isLoggedIn` (Trạng thái Xác thực/Đăng nhập).
- `cart`, `favorites`, `enrolledCourseIds` (Trạng thái thương mại điện tử riêng của người dùng).
- Đồng bộ hóa hồ sơ (Tải hồ sơ cá nhân mới nhất khi mount thông qua `ApiService.getInstructorProfile()`).

*Lưu ý: Đối với một ứng dụng quy mô lớn thực tế, nên cân nhắc chuyển các state có tính động cao sang Redux Toolkit hoặc Zustand trong tương lai, vì React Context có thể gây ra hiện tượng re-render (render lại) không cần thiết.*

### Routing (Định tuyến)
React Router v7 xử lý việc điều hướng phía client.
- `src/router/AppRouter.tsx` định nghĩa `RouterProvider` chính.
- `src/router/routes.ts` export một mảng cấu hình các route.
Các route được lồng nhau (nested). Ví dụ, `/instructor` đóng vai trò là một lớp bao (layout wrapper) cho `/instructor/dashboard`, `/instructor/courses`, v.v.

### Tầng API (API Layer)
Các lời gọi API được cách ly khỏi các component.
- Trước đây, dự án dùng `src/assets/js/api` và `src/services/api.ts`.
- Gần đây, hệ thống đang dần chuyển sang dùng các file API riêng cho từng tính năng (VD: `src/features/courses/api.ts`).
- `src/shared/lib/api-client.ts` cấu hình Axios, tự động chèn `Authorization: Bearer <token>` lấy từ local storage.

## 3. Giao diện (UI) và Định dạng (Styling)
- **Tailwind CSS**: Các class utility được sử dụng trực tiếp trong mã JSX.
- **Framer Motion**: Được dùng để tạo hiệu ứng chuyển trang và các tương tác nhỏ (ví dụ: hiệu ứng hover lên thẻ khóa học).
- **Lucide React**: Cung cấp bộ icon SVG đồng nhất.
- **Radix UI**: Được dùng cho các UI primitive phức tạp, yêu cầu trợ năng tốt (Dialog, Dropdown).

## 4. Các Hệ thống Con Đáng chú ý
- **Lớp học - Classroom (`src/features/classroom`)**: Xử lý trải nghiệm học tập cốt lõi (Trình phát Video, tiến trình bài học).
- **Trang tổng quan Giảng viên - Instructor Dashboard (`src/features/instructor`)**: Cung cấp các biểu đồ toàn diện (sử dụng Chart.js/Recharts) để theo dõi doanh thu và lượt đăng ký.
- **Trang tổng quan Quản trị viên - Admin Dashboard (`src/features/admin`)**: Một layout chuyên biệt dành cho Quản trị viên hệ thống để quản lý danh mục, phê duyệt khóa học và xử lý lệnh thanh toán (payout).

---
*Tiếp theo: [04-backend-analysis.md](./04-backend-analysis.md)*
