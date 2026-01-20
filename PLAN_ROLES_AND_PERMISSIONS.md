# Kế hoạch Phân quyền & Quản lý User (Phương án B)

Mục tiêu: Xây dựng hệ thống phân quyền (RBAC) cho Web App, cho phép các nhóm user khác nhau (Admin, HO, Store) truy cập giao diện và luồng xử lý riêng biệt.

## 1. Cơ chế Định danh & Phân quyền

### 1.1. Bảng User Config (Identity Map)

Tạo một Google Sheet mới (hoặc file config JSON/Env) để quản lý danh sách user được phép truy cập.

**Cấu trúc bảng "Users" (đề xuất):**

| Email (Google ID)      | Role (Vai trò)    | Upload Folder ID                   | Dashboard Scope  |
| :--------------------- | :---------------- | :--------------------------------- | :--------------- |
| `admin@cbs.com`        | **ADMIN**         | `ALL`                              | Full Access      |
| `hr.ho@cbs.com`        | **HO_RECRUITER**  | `1L23vAO...` (HO Folder)           | Office Jobs Only |
| `store.aeon@cbs.com`   | **STORE_MANAGER** | `1P60dhE...` (Store Aeon Folder)   | Store Jobs Only  |
| `store.vincom@cbs.com` | **STORE_MANAGER** | `XYZ_ABC...` (Store Vincom Folder) | Store Jobs Only  |

### 1.2. Middleware & Session

- **Login Flow:** Giữ nguyên Google OAuth.
- **Post-Login Check:** Sau khi login thành công, hệ thống sẽ check Email user với bảng "User Config".
  - Nếu Email không tồn tại -> Chặn truy cập (403 Forbidden).
  - Nếu tồn tại -> Lưu `Role` và `AccessScope` vào Session/Cookie.

## 2. Luồng Hoạt động theo Role

### 2.1. Nhóm ADMIN

- **Giao diện:** Thấy toàn bộ Dashboard, cấu hình hệ thống.
- **Quyền hạn:**
  - Thêm/Sửa/Xóa User trong hệ thống.
  - Cấu hình các Job đang active.
  - Xem Log hoạt động.

### 2.2. Nhóm HO (Khối Văn Phòng)

- **Giao diện:** Dashboard hiển thị CV khối văn phòng.
- **Upload:** Upload CV vào folder mặc định (HO Folder).
- **Quy trình:**
  - Duyệt sơ loại (Screening) -> N8N update status.
  - Lên lịch phỏng vấn -> Gửi invite.
  - Offer / Onboarding.

### 2.3. Nhóm STORE (Cửa hàng)

- **Giao diện:** Dashboard tối giản, chỉ hiện CV của Store mình.
- **Upload:**
  - Tự động upload vào Folder riêng của Store (định nghĩa trong bảng User).
  - Form Upload đơn giản hóa (ít trường thông tin hơn).
- **Quy trình:**
  - Xem CV đã lọc bởi N8N.
  - Bấm nút "Gọi PV" -> Note lại kết quả.

## 3. N8N Integration Upgrade (Brainstorm)

- Update N8N Workflow để quét dynamic folders (hoặc gom file từ các folder con về folder xử lý chung nhưng vẫn giữ metadata nguồn gốc).
- Datapool Sheet cần thêm cột `Store/Department` để Web App filter dữ liệu theo Role.

## 4. Checklist Triển khai (To-Do)

- [ ] Tạo bảng Config Users (Google Sheet).
- [ ] Update API `/api/auth/callback` để check role sau khi login.
- [ ] Update API `/api/upload` để lấy Folder ID động dựa trên User Role.
- [ ] Xây dựng Layout riêng cho Admin/Store (hoặc conditional rendering component).
