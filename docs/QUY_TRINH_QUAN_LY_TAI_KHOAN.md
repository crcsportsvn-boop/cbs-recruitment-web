# Quy Trình Quản Lý Tài Khoản và Phân Quyền (CBS Recruitment App)

Tài liệu này hướng dẫn quy trình cấp phát quyền truy cập cho nhân sự (Recruiters) sử dụng hệ thống CBS Recruitment Web.

## 1. Cơ Chế Xác Thực và Bảo Mật

Hệ thống **không sử dụng cơ sở dữ liệu tài khoản riêng**. Việc xác thực và phân quyền hoàn toàn dựa trên hệ sinh thái Google (Google Workspace/Gmail).

- **Đăng nhập**: Sử dụng tài khoản Google (Gmail cá nhân hoặc Email doanh nghiệp).
- **Kiểm soát quyền**: Dựa trên quyền truy cập (Share) của file Google Sheet và Google Drive Folder chứa dữ liệu.
- **Nguyên tắc**: "Nếu bạn xem được file Sheet, bạn sẽ xem được dữ liệu trên Web App".

## 2. Các Vai Trò (Roles)

Hiện tại hệ thống được thiết kế để hỗ trợ các nhóm tuyển dụng:

1.  **HO Recruiter (Hội Sở)**:
    - Quản lý nguồn dữ liệu tuyển dụng cho Hội Sở.
    - Cần quyền truy cập vào: `HO_Recruitment_Database` (Google Sheet) và `HO_CV_Folder` (Google Drive).
2.  **ST Recruiter (Siêu Thị) - (Dự kiến)**:
    - Quản lý nguồn dữ liệu tuyển dụng cho khối Siêu Thị.
    - Cần quyền truy cập vào: `ST_Recruitment_Database` (Google Sheet) và `ST_CV_Folder` (Google Drive).
3.  **Admin/Owner**:
    - Người tạo ra File Sheet/Folder.
    - Có quyền quyết định ai được phép truy cập (Share/Unshare).

## 3. Quy Trình Cấp Tài Khoản Mới (Onboarding)

Khi có một nhân sự tuyển dụng mới cần sử dụng phần mềm, Admin thực hiện các bước sau:

### Bước 1: Yêu cầu thông tin

Yêu cầu nhân sự cung cấp địa chỉ Email Google (Gmail) sẽ dùng để làm việc.

### Bước 2: Chia sẻ quyền truy cập (Dữ liệu)

Admin truy cập vào Google Drive chứa dữ liệu dự án:

1.  **File Google Sheet (Database)**:
    - Click chuột phải vào file Sheet (ví dụ: `Data_TuyenDung_HO`).
    - Chọn **Share** (Chia sẻ).
    - Nhập email của nhân sự.
    - Chọn quyền: **Editor** (Người chỉnh sửa) - _Bắt buộc để họ có thể Update trạng thái/Upload CV_.
    - Nhấn **Send**.

2.  **Folder Google Drive (Chứa CV Upload)**:
    - Click chuột phải vào Folder (ví dụ: `CV_Storage_HO`).
    - Chọn **Share** (Chia sẻ).
    - Nhập email của nhân sự.
    - Chọn quyền: **Editor** (Người chỉnh sửa) - _Bắt buộc để họ có thể Upload file PDF vào đây_.
    - Nhấn **Send**.

### Bước 3: Hướng dẫn đăng nhập

Nhân sự truy cập vào trang web ứng dụng, nhấn nút **"Log in with Google"** và chọn tài khoản email vừa được cấp quyền.

- _Lưu ý_: Nếu nhân sự đăng nhập nhưng thấy bảng dữ liệu trống hoặc báo lỗi đỏ, nghĩa là Bước 1 hoặc Bước 2 chưa hoàn tất (chưa được share file).

## 4. Quy Trình Thu Hồi Tài Khoản (Offboarding)

Khi nhân sự nghỉ việc hoặc chuyển bộ phận:

1.  Admin vào Google Drive.
2.  Chọn File Sheet và Folder CV tương ứng.
3.  Vào mục **Share** -> Danh sách người có quyền truy cập.
4.  Tìm email nhân sự đó và chọn **Remove access** (Xóa quyền truy cập).

-> Ngay lập tức, nhân sự đó sẽ **không thể** tải dữ liệu trên Web App nữa (dù họ vẫn có thể đăng nhập vào giao diện web, nhưng sẽ không thấy dữ liệu gì).

## 5. Tóm Tắt Kỹ Thuật (Dành cho Dev)

- **Biến môi trường (Environment Variables)**: App sử dụng ID của Sheet/Folder (`GOOGLE_SHEET_ID_HO`, `GOOGLE_DRIVE_INPUT_FOLDER_ID_HO`) được cấu hình trên Vercel.
- **Luồng dữ liệu**:
  - User Login -> Token OAuth (Scope: Drive & Spreadsheets).
  - API Backend dùng Token của User để gọi Google API.
  - Google API kiểm tra quyền của User -> Trả về kết quả hoặc lỗi 403.
