# 02. Cấu trúc Thư mục

Tài liệu này hướng dẫn chi tiết cách tổ chức cấu trúc của cả hai kho lưu trữ Frontend và Backend, phác thảo mục đích và trách nhiệm của từng thư mục.

## Frontend (React 19 / Vite)
**Đường dẫn:** `/MindHub-Frontend/`

Frontend áp dụng mô hình **Feature-based Colocation** (Gom nhóm code theo tính năng).

```text
MindHub-Frontend/
├── src/
│   ├── app/                # Các file khởi chạy app, context toàn cục (AppContext.tsx), CSS toàn cục.
│   ├── assets/             # Hình ảnh tĩnh và các file JS cũ (API client từ kiến trúc cũ).
│   ├── components/         # Các khối UI tái sử dụng phức tạp (VD: account-center, instructor-course-form).
│   ├── config/             # Cấu hình tĩnh cứng (VD: mảng cấu hình navigation).
│   ├── features/           # **Logic nghiệp vụ lõi (Core Domain Logic)**. Chia theo tính năng:
│   │   ├── admin/          # Admin dashboard, quản lý danh mục.
│   │   ├── auth/           # Đăng nhập, Đăng ký, Form xác thực.
│   │   ├── classroom/      # Giao diện học tập (Video player, đề cương khóa học).
│   │   ├── courses/        # Danh sách khóa học, lọc, trang chi tiết.
│   │   ├── instructor/     # Instructor dashboard, biểu đồ doanh thu, hồ sơ.
│   │   ├── profile/        # Thành tích của học viên, hồ sơ cá nhân.
│   │   ├── purchase-history/ # Lịch sử mua hàng.
│   │   └── qa/             # Hệ thống Hỏi & Đáp cho khóa học.
│   ├── layouts/            # Các khung bọc trang (Navbar, Footer, MainLayout, ErrorBoundary).
│   ├── pages/              # Các trang tĩnh (About, Pricing, Contact, FAQ).
│   ├── router/             # Cấu hình React Router (`routes.ts`, `AppRouter.tsx`).
│   ├── services/           # Các API service bổ sung và mock database (dữ liệu giả).
│   └── shared/             # Code dùng chung toàn cục:
│       ├── components/ui/  # UI cơ bản (Dumb UI: Buttons, Inputs, Dialogs).
│       ├── lib/            # Tiện ích bọc ngoài (Axios client, các hàm tạo URL).
│       └── utils/          # Các hàm xử lý thuần (format tiền tệ, local storage helpers).
└── tests/                  # Các bài test E2E với Playwright.
```

## Backend (Laravel 12)
**Đường dẫn:** `/MindHub-Backend/BE/`

Backend tuân thủ cấu trúc **Module-based** nghiêm ngặt đối với các tầng bên dưới Controller.

```text
MindHub-Backend/BE/
├── app/
│   ├── Http/
│   │   ├── Controllers/    # Cấu trúc phẳng cho TẤT CẢ Controllers (VD: LearningController, AuthController).
│   │   ├── Middleware/     # Đánh chặn request (Sanctum Auth, Kiểm tra Role).
│   │   ├── Requests/       # FormRequest validation. Nhóm theo Module (VD: Auth/, Learning/, Admin/).
│   │   └── Resources/      # API JSON Transformers. Nhóm theo Module.
│   ├── Models/             # Eloquent ORM Models (VD: User, Course, Lesson). Cấu trúc phẳng.
│   ├── Policies/           # Logic ủy quyền cho các Models (VD: CoursePolicy).
│   ├── Repositories/       # Tầng truy xuất dữ liệu. Nhóm theo Module (VD: Learning/LearningDashboardRepository).
│   └── Services/           # Tầng Business Logic. Nhóm theo Module (VD: Learning/LessonVideoAccessService).
├── bootstrap/              # Khởi động framework.
├── config/                 # File cấu hình Laravel (auth, database, vnpay).
├── database/
│   ├── migrations/         # Định nghĩa Schema DB.
│   └── seeders/            # Seeder tạo dữ liệu giả mạo và trạng thái ban đầu.
├── docs/                   # TODO của Backend và theo dõi endpoint.
├── routes/
│   ├── api.php             # File route API chính (tập hợp các route con).
│   └── api/                # Route API của từng module (VD: auth.php, learning.php, course.php).
├── scripts/                # Script tiện ích để test local và fix data.
├── test_reports/           # Báo cáo kết quả chạy test dưới dạng Markdown.
└── tests/                  # Bộ test Pest PHP. Nhóm theo Feature và Module.
```

## Các Quy tắc Kiến trúc Cốt lõi
1. **Frontend**: Nếu một component, type hoặc hook CHỈ được dùng bởi trang `courses`, nó BẮT BUỘC phải nằm bên trong `src/features/courses/`. Nó chỉ được chuyển ra `src/shared/` nếu có nhiều hơn một feature cần sử dụng nó.
2. **Backend**: Controller và Model được giữ cấu trúc phẳng (flat) để tránh namespace quá dài, nhưng Services, Repositories, Requests, và Resources BẮT BUỘC phải được gom vào các Thư mục con theo Module (VD: `Admin`, `Auth`, `Learning`, `Marketing`).

---
*Tiếp theo: [03-frontend-analysis.md](./03-frontend-analysis.md)*
