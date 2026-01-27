# 🧪 Manual QA Checklist - CBS Recruitment Web

> Checklist này dùng để test thủ công các chức năng chính trước khi deploy.  
> ✅ = Passed | ❌ = Failed | ⏭️ = Skipped

---

## 📋 Thông Tin Test Session

| Thông tin  | Giá trị                            |
| ---------- | ---------------------------------- |
| Ngày test  | \_**\_/\_\_**/2026                 |
| Người test | ******\_\_******                   |
| Môi trường | ☐ Dev ☐ Staging ☐ Production       |
| Browser    | ☐ Chrome ☐ Firefox ☐ Edge ☐ Safari |

---

## 1. 🔐 Authentication (Xác thực)

| #   | Test Case                           | Kết quả | Ghi chú       |
| --- | ----------------------------------- | ------- | ------------- |
| 1.1 | Đăng nhập với email/password hợp lệ | ☐       |               |
| 1.2 | Đăng nhập với email sai             | ☐       | Phải hiện lỗi |
| 1.3 | Đăng nhập với password sai          | ☐       | Phải hiện lỗi |
| 1.4 | Đăng xuất và redirect về login      | ☐       |               |
| 1.5 | Session timeout hoạt động đúng      | ☐       |               |

---

## 2. 📥 Input Tab (Nhập ứng viên)

| #   | Test Case                                    | Kết quả | Ghi chú |
| --- | -------------------------------------------- | ------- | ------- |
| 2.1 | Tải lên CV (PDF/Word) thành công             | ☐       |         |
| 2.2 | Form tự động điền từ CV                      | ☐       |         |
| 2.3 | Chọn Job Code từ dropdown                    | ☐       |         |
| 2.4 | Quick Select (⌘+K) hoạt động                 | ☐       |         |
| 2.5 | Validation: bắt lỗi khi thiếu field bắt buộc | ☐       |         |
| 2.6 | Submit form thành công                       | ☐       |         |
| 2.7 | Ứng viên mới xuất hiện trong Kanban          | ☐       |         |

---

## 3. 📊 Kanban View

| #   | Test Case                           | Kết quả | Ghi chú |
| --- | ----------------------------------- | ------- | ------- |
| 3.1 | Hiển thị đúng các cột trạng thái    | ☐       |         |
| 3.2 | Drag & Drop card giữa các cột       | ☐       |         |
| 3.3 | Click card → hiện chi tiết ứng viên | ☐       |         |
| 3.4 | Lọc theo Job Code                   | ☐       |         |
| 3.5 | Tìm kiếm theo tên ứng viên          | ☐       |         |
| 3.6 | Keyboard navigation (↑↓←→)          | ☐       |         |
| 3.7 | Cập nhật trạng thái trong modal     | ☐       |         |

---

## 4. 📋 Datapool View

| #   | Test Case                              | Kết quả | Ghi chú |
| --- | -------------------------------------- | ------- | ------- |
| 4.1 | Hiển thị danh sách ứng viên dạng table | ☐       |         |
| 4.2 | Sort theo các cột                      | ☐       |         |
| 4.3 | Filter theo trạng thái                 | ☐       |         |
| 4.4 | Pagination hoạt động đúng              | ☐       |         |
| 4.5 | Bulk select và thao tác hàng loạt      | ☐       |         |
| 4.6 | Export dữ liệu (nếu có)                | ☐       |         |

---

## 5. 🔄 Rehire Flow

| #   | Test Case                                     | Kết quả | Ghi chú |
| --- | --------------------------------------------- | ------- | ------- |
| 5.1 | Nhập ứng viên trùng email → hiện modal Rehire | ☐       |         |
| 5.2 | Chọn "Tuyển lại" → reset trạng thái           | ☐       |         |
| 5.3 | Chọn "Cập nhật" → giữ trạng thái cũ           | ☐       |         |
| 5.4 | applyDate được reset khi rehire               | ☐       |         |

---

## 6. 📈 Reports Tab

| #   | Test Case                       | Kết quả | Ghi chú |
| --- | ------------------------------- | ------- | ------- |
| 6.1 | Hiển thị đúng số liệu tổng quan | ☐       |         |
| 6.2 | Chart/Graph render đúng         | ☐       |         |
| 6.3 | Lọc theo khoảng thời gian       | ☐       |         |
| 6.4 | Lọc theo Job Code               | ☐       |         |
| 6.5 | Hiring Jobs count đúng          | ☐       |         |

---

## 7. 👥 User Management (Admin only)

| #   | Test Case                | Kết quả | Ghi chú |
| --- | ------------------------ | ------- | ------- |
| 7.1 | Thêm user mới            | ☐       |         |
| 7.2 | Phân quyền: HO_Recruiter | ☐       |         |
| 7.3 | Phân quyền: ST_Recruiter | ☐       |         |
| 7.4 | Phân quyền: Manager      | ☐       |         |
| 7.5 | Vô hiệu hóa user         | ☐       |         |

---

## 8. 🎨 UI/UX General

| #   | Test Case                      | Kết quả | Ghi chú |
| --- | ------------------------------ | ------- | ------- |
| 8.1 | Responsive trên mobile (375px) | ☐       |         |
| 8.2 | Responsive trên tablet (768px) | ☐       |         |
| 8.3 | Loading states hiển thị đúng   | ☐       |         |
| 8.4 | Error messages rõ ràng         | ☐       |         |
| 8.5 | Scroll to top button hoạt động | ☐       |         |

---

## 9. 🚀 Performance

| #   | Test Case                              | Kết quả | Ghi chú |
| --- | -------------------------------------- | ------- | ------- |
| 9.1 | Thời gian load trang < 3s              | ☐       |         |
| 9.2 | Không lag khi có nhiều ứng viên (>100) | ☐       |         |
| 9.3 | Không memory leak khi navigate         | ☐       |         |

---

## 📝 Ghi Chú & Issues Phát Hiện

| #   | Mô tả | Mức độ                     | Trạng thái     |
| --- | ----- | -------------------------- | -------------- |
| 1   |       | ☐ Critical ☐ Major ☐ Minor | ☐ Open ☐ Fixed |
| 2   |       | ☐ Critical ☐ Major ☐ Minor | ☐ Open ☐ Fixed |
| 3   |       | ☐ Critical ☐ Major ☐ Minor | ☐ Open ☐ Fixed |

---

## ✍️ Kết Luận

| Kết quả    | Số lượng        |
| ---------- | --------------- |
| ✅ Passed  | \_**\_ / \_\_** |
| ❌ Failed  | \_\_\_\_        |
| ⏭️ Skipped | \_\_\_\_        |

**Đánh giá tổng thể:** ☐ Ready to Deploy ☐ Cần sửa lỗi ☐ Cần test lại

**Người review:** ******\_\_****** | **Ngày:** \_**\_/\_\_**/2026
