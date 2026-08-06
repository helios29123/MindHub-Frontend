# 00. Tổng quan Dự án

## 1. Giới thiệu
**MindHub** là một nền tảng học trực tuyến (E-learning) hiện đại, toàn diện được xây dựng với kiến trúc Frontend và Backend tách biệt. Dự án hướng đến việc mang lại trải nghiệm giáo dục mạnh mẽ với các tính năng hỗ trợ Học viên (Students), Giảng viên (Instructors) và Quản trị viên (Administrators).

Dự án được chia thành hai kho lưu trữ (repository) chính:
1. **MindHub-Frontend**: Ứng dụng React 19 được xây dựng bằng Vite và TypeScript.
2. **MindHub-Backend**: API backend dùng Laravel 12 để cung cấp dữ liệu và dịch vụ.

Bộ tài liệu này đóng vai trò là hướng dẫn onboarding (nhập môn) và tài liệu kỹ thuật chi tiết dành cho các Kỹ sư Cấp cao (Senior Engineers) mới gia nhập dự án.

## 2. Công nghệ Cốt lõi

### Frontend Stack
- **Framework**: React 19
- **Build Tool**: Vite
- **Ngôn ngữ**: TypeScript
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v7
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Trực quan hóa dữ liệu**: Chart.js & Recharts
- **Thông báo (Toast)**: Sonner

### Backend Stack
- **Framework**: Laravel 12
- **Ngôn ngữ**: PHP 8.3
- **Cơ sở dữ liệu**: MySQL 8.x / MariaDB
- **Xác thực**: Laravel Sanctum v4
- **Kiểm thử**: Pest PHP
- **API Client**: GuzzleHTTP
- **Tích hợp bên thứ 3**: Google API Client

## 3. Các Tính năng Chính
Nền tảng hỗ trợ 3 vai trò người dùng chính:
1. **Học viên**: Khám phá khóa học, đăng ký, học tập (video/tài liệu), làm bài trắc nghiệm (quiz), theo dõi tiến độ và đánh giá khóa học.
2. **Giảng viên**: Tạo khóa học, quản lý giáo trình, kiểm duyệt phần Hỏi đáp (QA), theo dõi doanh thu và quản lý mã giảm giá (coupon).
3. **Quản trị viên**: Xem tổng quan hệ thống, quản lý người dùng, quản lý danh mục, kiểm duyệt nội dung, xử lý doanh thu/rút tiền và báo cáo.

## 4. Quy trình Phát triển (Workflow)
Đội ngũ áp dụng Quy trình Git chuẩn với nhánh `develop` làm nhánh tích hợp chính.
- **Quy tắc Đặt tên nhánh**: `<type>/<issue-id>-<mô-tả-ngắn>` (VD: `feat/LEARN-09-view-learning-history`).
- **Thông điệp Commit**: Bắt buộc dùng Conventional Commits (`feat(...)`, `fix(...)`, `chore(...)`).
- **Tích hợp AI Agent**: Dự án sử dụng AI Agent (như Antigravity/CodeGraph) và yêu cầu ghi lại lịch sử phát triển vào thư mục `.agent/ai-memory/` theo quy ước đặt tên ngày-tính_năng.

## 5. Mô hình Kiến trúc
- **Frontend**: **Feature-based Colocation** (Gom nhóm theo tính năng). Code không được chia theo loại (VD: tất cả components để chung một chỗ), mà chia theo *tính năng* (VD: `src/features/courses/`).
- **Backend**: **Kiến trúc Module nghiêm ngặt** bên trong các thư mục mặc định của Laravel. Controllers đặt phẳng trong `app/Http/Controllers`, nhưng Services, Repositories, Requests, và Resources phải được phân vùng và lồng ghép theo module (VD: `app/Services/Auth/`).

---
*Tiếp theo: [01-system-architecture.md](./01-system-architecture.md)*
