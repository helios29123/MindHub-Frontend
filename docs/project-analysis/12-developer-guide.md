# 12. Hướng dẫn Phát triển (Developer Guide)

Tài liệu này cung cấp hướng dẫn cách cài đặt môi trường máy ảo local, cách khởi chạy ứng dụng và công cụ debug.

## 1. Yêu cầu Hệ thống (Prerequisites)
- **Node.js**: v18.x trở lên
- **PHP**: 8.3.x (Khuyên dùng: Laragon trên Windows hoặc Laravel Herd trên macOS)
- **Cơ sở dữ liệu**: MySQL 8.x
- **Composer**: Trình quản lý thư viện (package manager) của PHP

## 2. Cài đặt Backend (Laravel)
1. Di chuyển vào thư mục backend:
   ```bash
   cd MindHub-Backend/BE
   ```
2. Cài đặt các gói phụ thuộc (dependencies):
   ```bash
   composer install
   ```
3. Khởi tạo môi trường:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
4. Mở file `.env` và cấu hình lại các thông số kết nối Database (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`).
5. Chạy Migrations và Seeders. Dự án đã cung cấp sẵn các file SQL dump trong thư mục `database/sql` hoặc `database/` mà bạn nên import thủ công trước, sau đó mới chạy seeder nếu cần thiết.
6. Chạy server Laravel:
   ```bash
   php artisan serve
   ```
   *(Hãy đảm bảo server backend chạy ở địa chỉ `http://localhost:8000` để khớp với cấu hình CORS bên frontend).*

## 3. Cài đặt Frontend (React/Vite)
1. Di chuyển vào thư mục frontend:
   ```bash
   cd MindHub-Frontend
   ```
2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
3. Cấu hình biến môi trường:
   ```bash
   cp .env.example .env
   ```
   *(Hãy đảm bảo biến `VITE_API_BASE_URL` trỏ đúng vào địa chỉ server backend của bạn, thông thường là `http://localhost:8000/api`)*
4. Khởi chạy Vite dev server:
   ```bash
   npm run dev
   ```
   *(Truy cập bằng trình duyệt qua địa chỉ `http://localhost:5173`)*

## 4. Kiểm thử & Đảm bảo Chất lượng (Testing & Quality)
- **Backend**: Chạy bộ test Pest PHP.
  ```bash
  vendor/bin/pest
  ```
- **Frontend**: Kiểm tra lỗi cú pháp và type (TypeScript).
  ```bash
  npm run lint
  ```

## 5. Các Lệnh Tiện ích (Helpful Scripts)
Kho lưu trữ backend có chứa một thư mục `scripts/` bao gồm rất nhiều công cụ hỗ trợ viết bằng PHP dùng để khởi tạo nhanh môi trường local:
- `php scripts/fill_demo_data.php`: Điền đầy đủ dữ liệu giả (demo) để phục vụ test UI.
- `php scripts/create_users.php`: Sinh ra các tài khoản user test cho các role (vai trò) khác nhau.
- `php scripts/check_counts.php`: Kiểm tra tính toàn vẹn của dữ liệu trong cơ sở dữ liệu.

---
*Tiếp theo: [13-onboarding-guide.md](./13-onboarding-guide.md)*
