# 13. Cẩm nang Nhập môn: Hướng dẫn Onboarding (Knowledge Transfer)

Chào mừng bạn đến với đội ngũ MindHub! Với tư cách là một Kỹ sư Cấp cao (Senior Engineer) mới, dưới đây là cuốn cẩm nang cực kỳ thực chiến giúp bạn thực hiện các tác vụ lập trình hàng ngày.

## Dữ liệu Chảy trong Hệ thống Như thế nào (How Data Flows)
1. User click vào một nút (button) trên component React.
2. Component gọi đến một function nằm trong custom hook.
3. Hook sử dụng `ApiService` (Axios) để "bắn" một request tới một API route của Laravel.
4. Laravel ánh xạ (match) route đó tới một `Controller`.
5. Controller kích hoạt quá trình xác thực dữ liệu thông qua `FormRequest`.
6. Controller gọi đến một `Service`.
7. Service thực thi logic tính toán (business logic) và gọi một `Repository` để truy vấn/lưu dữ liệu thông qua các `Eloquent Models`.
8. Controller nhận dữ liệu và trả về cho API một `Resource` (đã được format JSON).
9. React hook nhận được phản hồi (resolve promise), cập nhật state, và UI được render (vẽ) lại.

## Cách Tạo một Tính năng Mới
**Ví dụ: Thêm tính năng "Nhắn tin" (Messaging).**

### 1. Phía Backend
1. **Migration & Model**:
   - Chạy lệnh: `php artisan make:model Message -m`
   - Định nghĩa các cột (columns) và các hàm quan hệ (relationships).
2. **Khởi tạo Kiến trúc**:
   - Tạo file `app/Http/Requests/Messaging/SendMessageRequest.php`.
   - Tạo file `app/Repositories/Messaging/MessageRepository.php`.
   - Tạo file `app/Services/Messaging/MessageService.php`.
   - Tạo file `app/Http/Controllers/MessageController.php`.
3. **Route**:
   - Tạo file `routes/api/messaging.php`.
   - Nhúng (require) file này vào `routes/api.php` bằng lệnh `require __DIR__ . '/api/messaging.php';`

### 2. Phía Frontend
1. **Khởi tạo Thư mục (Folder Setup)**:
   - Tạo thư mục `src/features/messaging/`.
2. **API Client**:
   - Tạo file `src/features/messaging/api.ts`. Định nghĩa các hàm bên trong như `sendMessage(data)`.
3. **Components & Pages**:
   - Tạo `MessagingPage.tsx` và `MessageList.tsx` ngay bên trong thư mục `messaging` vừa tạo.
4. **Routing**:
   - Đăng ký route mới vào trong file `src/router/routes.ts`.

## Làm thế nào để Duy trì Tính Đồng nhất của Dự án
1. **Không gọi trực tiếp Axios (Bare Axios Calls) trong Components**: Bắt buộc phải trừu tượng hóa các lời gọi API ra thành các hàm nằm trong file `api.ts` của thư mục tính năng đó.
2. **Import tuyệt đối (Absolute Imports)**: Luôn luôn sử dụng `@/` để import trong React (VD: `import { Button } from '@/shared/components/ui/Button'`) thay vì đường dẫn tương đối (../../../).
3. **Services Dày, Controllers Mỏng (Fat Services, Thin Controllers)**: Trong Laravel, nếu Controller của bạn chứa nhiều hơn 5 dòng code cho mỗi phương thức (method), khả năng cao là bạn đang làm sai. Hãy di chuyển logic tính toán sang Service.
4. **Không Query DB Trực tiếp trong Services**: Services phải gọi Repositories. Tuyệt đối không dùng các lệnh kiểu như `User::where(...)` trực tiếp bên trong một Service.

---
*Tiếp theo: [14-summary.md](./14-summary.md)*
