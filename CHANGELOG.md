# CBS Recruitment Portal - Changelog

Tài liệu này ghi lại toàn bộ lịch sử thay đổi, cập nhật và các phiên bản của dự án.

## [v1.0.0] - Giai đoạn HO (Head Office) - 2026-01-22

**Trạng thái**: 🟢 Stable (Đã Deploy)  
**Mô tả**: Phiên bản chính thức đầu tiên dành cho khối Văn Phòng (HO). Hoàn thiện luồng tuyển dụng 3 vòng và quản lý dữ liệu ứng viên.

### 🚀 Added (Tính năng mới)

- **Kanban Workflow 3 Vòng**:
  - Thêm cột `HR Interview` (Phỏng vấn nhân sự - không popup Outlook).
  - Cập nhật quy trình: `New` -> `Test/Screen` -> `HR Interview` -> `Manager L1` -> `Manager L2` -> `Offer`.
  - Logic `Withdraw`: Cho phép quay lại trạng thái trước đó chính xác.
- **Data Structure**: Mở rộng bảng Google Sheet (Datapool) từ cột `AE` đến `AK` để chứa dữ liệu PV chi tiết.
- **Filters**: Bộ lọc nâng cao theo Khoảng thời gian (Date Range) và Điểm số (Score) trên cả Kanban và Datapool.
- **Docs**: Bổ sung tài liệu "Hướng dẫn sử dụng", "Cấu trúc dữ liệu", và "Phân quyền".

### 🛠 Changed (Điều chỉnh)

- **UI Header**: Ẩn User ID, chỉ hiển thị Email và Role để giao diện gọn gàng hơn.
- **Mapping**: Cập nhật lại toàn bộ mapping cột Excel để khớp với cấu trúc mới (chèn thêm cột Ngày HR PV).
- **Dictionary**: Chuẩn hóa ngôn ngữ hiển thị (Anh/Việt) cho các trạng thái phỏng vấn.

### 🐛 Fixed (Sửa lỗi)

- Khắc phục lỗi căn chỉnh layout cột điểm số.
- Sửa lỗi crash khi Reject ứng viên mà không có lý do.
- Cải thiện UX bộ chọn ngày (Date Picker) trigger nhạy hơn.

---

## [v0.9.0] - Beta Testing - 2026-01-21

**Mô tả**: Giai đoạn kiểm thử tính năng và hoàn thiện UI cơ bản.

### Added

- Hiển thị **Badge Count** (số lượng hồ sơ) trên tiêu đề cột Kanban và Datapool.
- Thêm trường hiển thị **Chứng chỉ (Certification)** trong chi tiết ứng viên.
- Tự động chuyển sang ứng viên tiếp theo sau khi Reject (Auto-Next).

### Fixed

- Lỗi Date Picker không mở khi click.
- Lỗi layout grid trong màn hình chi tiết ứng viên.
- Kéo dài thời gian phiên đăng nhập (Session Timeout).

---

## [v0.1.0] - Initial Release - 2026-01-20

**Mô tả**: Khởi tạo dự án, thiết lập kết nối Google Sheet và xác thực người dùng.

### Added

- Kết nối Google Sheet API (Read/Write).
- Hệ thống đăng nhập Google OAuth 2.0.
- Components cơ bản: `KanbanBoard`, `DatapoolTable`, `CandidateInputForm`.

---

_File này được quản lý tự động. Vui lòng cập nhật sau mỗi lần Deploy._
