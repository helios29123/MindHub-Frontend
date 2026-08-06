# 09. Tiến độ Hiện tại (Current Progress)

Dựa trên quá trình phân tích cấu trúc kho lưu trữ, các báo cáo audit (đánh giá) gần đây và các API endpoint đang hoạt động, dưới đây là bảng ước tính tiến độ hiện tại của dự án.

## Ước tính Hoàn thành Tổng thể: 85%

### Theo Từng Lớp (Layer)
- **Database Schema**: 95% (Đã ổn định, phần lớn các migration và quan hệ đã được định nghĩa).
- **Backend API**: 85% (Core logic đã hoàn thiện, còn một số endpoint của Admin/Instructor đang chờ hoàn thiện).
- **Frontend UI/UX**: 80% (Layout và các trang cốt lõi đã có, đang trong quá trình tích hợp nốt các API cuối cùng).

### Theo Từng Module Tính năng

| Module | Trạng thái | Ghi chú |
|--------|--------|-------|
| **Xác thực (Authentication)** | ✅ Đã hoàn thành | Đăng nhập, Đăng ký, quản lý phiên Sanctum đang hoạt động tốt. |
| **Danh mục Khóa học (Public Catalog)** | ✅ Đã hoàn thành | Danh sách, lọc, tìm kiếm và chi tiết khóa học. |
| **Học tập (Student Learning)** | ✅ Đã hoàn thành | Trình phát video, Signed URLs bảo mật, và theo dõi tiến trình đã hoạt động. |
| **Thanh toán (VNPay Payment)** | ✅ Đã hoàn thành | Luồng thanh toán checkout, nhập mã giảm giá (coupon), xử lý URL trả về từ VNPay. |
| **Dashboard Giảng viên** | ⚠️ Hoàn thành một phần | UI đã được xây xong. Các biểu đồ doanh thu và quản lý khóa học cơ bản đã tích hợp. Tuy nhiên, một số cấu hình nâng cao (như lưu trạng thái chỉnh sửa discount code) vẫn còn lỗi đã biết. |
| **Dashboard Quản trị viên** | ⚠️ Hoàn thành một phần | Chức năng quản lý danh mục và kiểm duyệt đang được phát triển tích cực. Một số API hooks vẫn đang dùng dữ liệu giả (mock data) hoặc cần điều chỉnh lại để khớp với BE. |
| **Hệ thống Hỏi đáp (Q&A)** | ❌ Thiếu/Chưa hoàn thiện | Chỉ mới có bộ khung UI (skeletons), backend endpoint đã được định nghĩa nhưng frontend chưa tích hợp toàn diện. |

## Các Vấn đề Đã biết (Từ các báo cáo Audit)
- Màn hình Instructor đôi khi bị mất state khi tải lại trang (được báo cáo trong file `INSTRUCTOR_PROFILE_PERSISTENCE_AFTER_RELOAD_FIX_RESULT.md`).
- Một số component phân trang của Admin đang dùng mock data (dữ liệu giả) thay vì dùng thông số `meta` thực tế từ API.

## Trạng thái Sẵn sàng cho Môi trường Thực tế (Production Readiness)
- **Kiểm thử (Testing)**: Backend sở hữu một bộ test Pest PHP khá xịn xò bao phủ được các luồng nghiệp vụ quan trọng (Learning, Marketing, Reports). Frontend Testing (Playwright) vẫn còn rất mỏng.
- **Triển khai (Deployment)**: Đã có script `deploy.py`, nhưng các pipeline CI/CD (như GitHub Actions) vẫn chưa được cấu hình hoàn thiện trên repo.

---
*Tiếp theo: [10-technical-debt.md](./10-technical-debt.md)*
