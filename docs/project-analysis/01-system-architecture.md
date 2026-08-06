# 01. Kiến trúc Hệ thống

## 1. Kiến trúc Tổng thể (High-Level Architecture)
MindHub tuân theo kiến trúc Client-Server tách biệt. Frontend là một Ứng dụng Đơn trang (Single Page Application - SPA) giao tiếp với Backend thông qua các API RESTful.

```mermaid
flowchart TD
    Client[Trình duyệt / Client] -->|HTTPS / REST API| FE[MindHub Frontend SPA]
    
    subgraph Frontend [MindHub-Frontend (React 19)]
        UI[React Components] --> Hooks[Custom Hooks / Context]
        Hooks --> APIClient[Axios API Client]
    end
    
    FE -->|JSON Payloads / Tokens| APIClient
    
    APIClient -->|HTTPS Requests| Route[Laravel Router]
    
    subgraph Backend [MindHub-Backend (Laravel 12)]
        Route --> Middleware[Middleware / Sanctum Auth]
        Middleware --> Controllers[Controllers]
        Controllers --> Validation[FormRequests]
        Validation --> Services[Business Logic Services]
        Services --> Repos[Repositories]
        Repos --> Models[Eloquent Models]
    end
    
    Models -->|SQL Queries| DB[(Cơ sở dữ liệu MySQL 8.x)]
```

## 2. Trách nhiệm của các Tầng (Layers)

### Các Tầng Frontend
1. **Components / Pages**: Chịu trách nhiệm render giao diện UI. Được xây dựng bằng Tailwind CSS và Framer Motion. Các component này sử dụng custom hooks để lấy dữ liệu.
2. **Hooks / Context**: Quản lý state cục bộ của component và state toàn cục của ứng dụng (chẳng hạn như Trạng thái Đăng nhập - Authentication Context).
3. **Tầng API Services**: Nằm trong `src/assets/js/api` hoặc trực tiếp bên trong các module tính năng. Sử dụng Axios để gọi API, tự động đính kèm header xác thực và xử lý phản hồi từ mạng.

### Các Tầng Backend
1. **Routing (`routes/api.php`)**: Đóng vai trò là điểm vào (entry point). Nó ánh xạ các phương thức HTTP và endpoint tới các hàm trong Controller. Nó yêu cầu chia nhỏ ra các file route theo module để giữ code gọn gàng.
2. **Middleware (`app/Http/Middleware`)**: Đánh chặn các request. Laravel Sanctum đảm bảo các route được bảo vệ bằng cách kiểm tra Bearer token. Các Policy đảm bảo quyền truy cập dựa trên vai trò (Học viên vs Giảng viên vs Quản trị viên).
3. **Controllers (`app/Http/Controllers`)**: Người điều phối. Controller được thiết kế siêu mỏng (thin); chúng nhận request, kích hoạt validation, gọi Service tương ứng và trả về một API Resource.
4. **Form Requests (`app/Http/Requests`)**: Xử lý validation dữ liệu gửi lên và các quy tắc ủy quyền trước khi logic trong Controller được thực thi.
5. **Services (`app/Services`)**: Tầng Logic Nghiệp vụ (Business Logic) cốt lõi. Mọi tính toán, thao tác phức tạp và điều phối đều diễn ra ở đây. Services không nên tương tác trực tiếp với cơ sở dữ liệu nếu có thể.
6. **Repositories (`app/Repositories`)**: Tầng Truy cập Dữ liệu (Data Access Layer). Trừu tượng hóa các câu lệnh truy vấn Eloquent, đảm bảo rằng tầng Service chỉ làm việc với các phương thức chuẩn hóa thay vì viết SQL thô.
7. **Models (`app/Models`)**: Đại diện cho các bảng trong database. Chứa định nghĩa các mối quan hệ (ví dụ: `hasMany`, `belongsTo`) và scopes.
8. **Resources (`app/Http/Resources`)**: Chuyển đổi dữ liệu từ Model thành cấu trúc JSON chuẩn cho frontend, đảm bảo các trường nhạy cảm (như mật khẩu) được giấu đi.

## 3. Tại sao chọn kiến trúc này?
- **Phân tách mối quan tâm (Separation of Concerns)**: Bằng cách sử dụng mô hình Service/Repository trong Laravel, logic nghiệp vụ được tách khỏi phần truy xuất dữ liệu, làm cho codebase cực kỳ dễ viết test (với Pest PHP).
- **Khả năng mở rộng (Scalability)**: Cách tiếp cận module (cả Feature-based ở Frontend và Module ở Backend) đảm bảo rằng khi các tính năng phình to ra (ví dụ: thêm tính năng `Learning` hay `Quiz`), chúng không làm rối các file lõi.
- **Bảo mật**: Sanctum cung cấp xác thực dựa trên token nhẹ nhàng, an toàn, cực kỳ phù hợp cho SPA mà không gặp phải sự rườm rà của toàn bộ hệ thống OAuth2.

---
*Tiếp theo: [02-folder-structure.md](./02-folder-structure.md)*
