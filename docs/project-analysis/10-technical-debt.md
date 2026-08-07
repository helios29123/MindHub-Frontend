# 10. Nợ Kỹ thuật & Cải tiến (Technical Debt & Improvements)

Trong suốt quá trình đánh giá (audit) kiến trúc, một số khu vực mang "nợ kỹ thuật" đã được phát hiện. Việc giải quyết những vấn đề này sẽ giúp cải thiện hiệu suất và khả năng bảo trì của dự án.

## 1. Code Thừa & Các Thư mục Cũ (Frontend)
- **Vấn đề (`src/assets/js/api/` & Mock Data)**: Lịch sử phát triển Frontend từng phụ thuộc vào dữ liệu giả (mock data) hoặc một kiến trúc API bằng JS cũ (VD: `mockDb.ts`). Khi chuyển sang sử dụng TypeScript chặt chẽ và tích hợp với API thực tế của Laravel, các thư mục cũ này chứa rất nhiều logic không còn được dùng đến gây bối rối cho nhà phát triển mới.
- **Giải pháp**: Xóa hoàn toàn `src/assets/js/api/` và `src/services/mockDb.ts` ngay khi tất cả các tính năng đã trỏ về đúng file `api.ts` đặt bên trong thư mục tính năng (colocated) của chúng.

## 2. Điểm nghẽn Quản lý State Toàn cục
- **Vấn đề**: File `src/app/AppContext.tsx` hiện đang ôm đồm quá nhiều state: `courses`, `notifications`, `cart`, `favorites`, `enrolledCourseIds`, `orders`, và `banners`. 
- **Tác động**: Việc cập nhật giỏ hàng (`cart`) sẽ ép các component chỉ quan tâm đến `banners` cũng phải re-render. Sự kết dính chặt chẽ bên trong một Context Provider duy nhất này sẽ gây ra các vấn đề nghiêm trọng về hiệu năng (performance) khi ứng dụng lớn dần.
- **Giải pháp**: Tách Context ra (VD: `AuthContext`, `CartContext`) hoặc chuyển sang một thư viện quản lý state toàn cục chuyên nghiệp như Zustand hoặc Redux Toolkit.

## 3. Vị trí Component Không nhất quán
- **Vấn đề**: Bất chấp quy tắc Gom nhóm theo Tính năng (Feature-based Colocation), một số component UI chỉ dành riêng cho Giảng viên (VD: `InstructorUploaders.tsx`) lại đang bị "lọt" sang các thư mục khác hoặc nằm trong `shared/components`.
- **Giải pháp**: Tiến hành kiểm tra nghiêm ngặt lại toàn bộ thư mục. Nếu một component CHỈ được sử dụng bởi Instructor Dashboard, nó bắt buộc phải nằm bên trong `src/features/instructor/components/`.

## 4. Lặp lại Logic trong API Hooks
- **Vấn đề**: Rất nhiều tính năng đang phải tự khởi tạo thủ công các request Axios và tự xử lý các trạng thái loading/error thông qua `useState` và `useEffect` thông thường.
- **Giải pháp**: Áp dụng thư viện `React Query` (TanStack Query) để lấy dữ liệu. Nó hỗ trợ sẵn cơ chế caching, re-fetching (gọi lại API) và trạng thái loading, qua đó sẽ loại bỏ được hàng trăm dòng code thừa (boilerplate).

## 5. Lặp lại Validation ở Backend
- **Vấn đề**: Một số Backend Controller có thể đang tự viết code if-else kiểm tra điều kiện mà đáng lý ra những thứ đó phải được đặt nghiêm ngặt ở trong `FormRequests` hoặc `Policies`.
- **Giải pháp**: Đảm bảo rằng mọi Controller đều sử dụng một `FormRequest` chuyên biệt để xác thực dữ liệu và một `Policy` để ủy quyền, qua đó giữ cho Controller luôn "mỏng" (thin).

## 6. Mức độ Bao phủ Kiểm thử (Testing Coverage)
- **Vấn đề**: Backend có một bộ test Pest khá tốt, nhưng Frontend lại có quá ít các bài test E2E viết bằng Playwright (hiện chỉ có duy nhất file `auth-login.spec.ts`).
- **Giải pháp**: Triển khai thêm các bài test E2E cho những luồng hoạt động then chốt: Tạo khóa học -> Mua khóa học -> Trình phát Video.

---
*Tiếp theo: [11-roadmap.md](./11-roadmap.md)*
