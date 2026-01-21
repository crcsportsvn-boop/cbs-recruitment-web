# Kế hoạch Phân quyền & Quản lý User

## 1. Trạng thái hiện tại (Đã hoàn thành - 20/01/2025)

### A. Hệ thống Đăng nhập & Bảo mật (RBAC)

- [x] **Login Guard:** Chặn truy cập nếu chưa đăng nhập.
- [x] **Google OAuth Logic:** Fix lỗi Loop Login vô hạn (Sửa Cookie Path & Scope).
- [x] **Guest View:** Xử lý trường hợp user đăng nhập nhưng chưa được phân quyền (Hiện thông báo lỗi chi tiết & Nút Logout).
- [x] **Logout:** Thêm API và nút đăng xuất.
- [x] **Service Account Integration:** Code API User tự động parse `GOOGLE_SERVICE_ACCOUNT_JSON` để tránh lỗi thiếu credentials.

### B. Biến Môi trường & Cấu hình (Environment Vars)

- [x] **Đổi tên biến chuẩn hóa:**
  - `GOOGLE_SHEET_ID` -> `GOOGLE_SHEET_ID_HO` (Fallback ID cũ đã tích hợp).
  - `GOOGLE_DRIVE_INPUT_FOLDER_ID` -> `GOOGLE_DRIVE_INPUT_FOLDER_ID_HO` (Fallback ID cũ đã tích hợp).
- [x] **Placeholder cho Store:** Đã khai báo sẵn `_ST` vars trong code (`GOOGLE_SHEET_ID_ST`, `FOLDER...ST`) để dùng cho bước tiếp theo.

### C. Giao diện (UI/UX)

- [x] **Ngôn ngữ:** Mặc định Tiếng Anh (EN), có nút toggle EN/VN ngay màn hình Login.
- [ ] **Màu sắc:** Nút Login & Các nút chính chuyển về màu đỏ Theme (`#EE2E24`).
- [ ] **Kanban:** Cập nhật màu cột chẵn thành đỏ nhạt (`#FFF0F0`) thay vì cam.

---

## 2. Việc cần làm tiếp theo (To-Do Next Session)

### Cho View Store (Cửa hàng)

- [ ] **Kích hoạt Role Store:** Trong `app/api/user/route.ts`, xử lý logic nếu Role == "Store_Manager".
- [ ] **Biến môi trường ST:** Uncomment và map các biến `_ST` vào logic upload/view.
- [ ] **Giao diện Store:** Xây dựng Dashboard riêng cho Store (tối giản, chỉ thấy candidate của store mình).

### Kiểm tra & Vận hành (Validation)

- [ ] **Test luồng HO:** Kiểm tra lại toàn bộ luồng Upload -> Sheet -> Kanban với biến môi trường mới `_HO`.
- [ ] **Test phân quyền:** Cho 2 user khác nhau (1 HO, 1 Store) login để đảm bảo thấy data khác nhau.

### Ghi chú kỹ thuật (Tech Notes)

- File config phân quyền hiện tại: `User_view` tab trong Google Sheet chính.
- Biến môi trường trên Vercel cần lưu ý: `GOOGLE_SERVICE_ACCOUNT_JSON` (Full JSON content).
