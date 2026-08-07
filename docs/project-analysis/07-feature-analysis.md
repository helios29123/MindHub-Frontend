# 07. Phân tích Chức năng (Feature Analysis)

## 1. Xác thực (Authentication) (`features/auth`)
- **Mục đích**: Xử lý đăng nhập, đăng ký và quản lý phiên làm việc của người dùng.
- **Giao diện (UI Entry)**: `/login`, `/register`.
- **Components**: `LoginPage`, `RegisterPage`, `AuthScreens`.
- **Backend**: `AuthController`, `AuthService`. Sử dụng Laravel Sanctum.
- **Trạng thái**: ✅ Hoàn thành.

## 2. Danh mục Khóa học (Course Catalog) (`features/courses`)
- **Mục đích**: Tìm kiếm và khám phá công khai các khóa học.
- **Giao diện (UI Entry)**: `/courses`, `/courses/:slug`.
- **Components**: `CourseListPage`, `CourseDetailPage`, các hooks bộ lọc.
- **Backend**: `CatalogController`, `CatalogService`.
- **Trạng thái**: ✅ Hoàn thành. 

## 3. Giỏ hàng & Thanh toán (Cart & Checkout) (`features/cart`)
- **Mục đích**: Xử lý quá trình mua khóa học.
- **Giao diện (UI Entry)**: `/cart`.
- **Components**: `CartAndCheckout`, `VNPayReturnPage`.
- **Backend**: `PaymentController`, `OrderService`, `PaymentService`.
- **Trạng thái**: ✅ Hoàn thành (Đã tích hợp VNPay).

## 4. Không gian Học tập (Learning Workspace) (`features/classroom`)
- **Mục đích**: Môi trường học tập cốt lõi của học viên.
- **Giao diện (UI Entry)**: `/learning/:courseId`.
- **Components**: `ClassroomPage`, Video Player, Sidebar đề cương.
- **Backend**: `LearningController`, `LearningService`, `SignedAssetUrlService`.
- **Trạng thái**: ✅ Hoàn thành. Đã tích hợp các tính năng nâng cao như Watermark (đóng dấu video) và URL bảo mật (Signed URLs).

## 5. Trang tổng quan Giảng viên (Instructor Dashboard) (`features/instructor`)
- **Mục đích**: Khu vực làm việc dành cho người tạo khóa học.
- **Giao diện (UI Entry)**: `/instructor`.
- **Components**: `InstructorDashboard`, `CourseBuilderWizard`, `InstructorRevenueChart`.
- **Backend**: `InstructorProfileController`, `InstructorCourseController`, `InstructorReportService`.
- **Trạng thái**: ⚠️ Hoàn thành một phần (Vẫn còn thiếu một vài API integrations theo như các đợt audit gần đây).

## 6. Trang tổng quan Quản trị viên (Admin Dashboard) (`features/admin`)
- **Mục đích**: Quản trị nền tảng và kiểm duyệt nội dung.
- **Giao diện (UI Entry)**: `/admin`.
- **Components**: `AdminDashboard`, `CoursesManagement`, `PayoutAccounts`.
- **Backend**: `AdminController`, `AdminModerationController`.
- **Trạng thái**: ⚠️ Đang phát triển tích cực. Giao diện UI đã xong, phần tích hợp API vừa mới được sửa lỗi.

## 7. Hỏi đáp & Tương tác (QA & Interaction) (`features/qa`)
- **Mục đích**: Chức năng cho phép học sinh đặt câu hỏi và giảng viên trả lời ngay trong khóa học.
- **Giao diện (UI Entry)**: `/learning/:courseId` (Tab QA).
- **Components**: `QAList`, `QADetailView`.
- **Backend**: `InteractionController`.
- **Trạng thái**: ⚠️ Hoàn thành một phần.

---
*Tiếp theo: [08-request-flow.md](./08-request-flow.md)*
