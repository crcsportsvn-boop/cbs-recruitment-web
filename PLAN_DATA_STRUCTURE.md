# Cấu Trúc Dữ Liệu (Data Structure)

Tài liệu này mô tả chi tiết cấu trúc bảng tính Google Sheet (Datapool) và cách hệ thống Mapping dữ liệu.

## 1. Thông Tin Chung

- **Sheet Name**: `Datapool`
- **Range**: `A2:AK` (Dữ liệu bắt đầu từ dòng 2)

## 2. Chi Tiết Các Cột (Column Mapping)

| Cột (Letter) | Index (0-based) | Tên Trường (Code) | Mô Tả                 | Ghi Chú                         |
| :----------- | :-------------- | :---------------- | :-------------------- | :------------------------------ |
| **A**        | 0               | `matchScore`      | Điểm phù hợp (0-10)   | AI chấm điểm                    |
| **B**        | 1               | `timestamp`       | Thời gian nhận        | Format: dd/MM/yyyy HH:mm:ss     |
| **C**        | 2               | `positionRaw`     | Vị trí ứng tuyển      | Tên vị trí lấy từ Email/Input   |
| **D**        | 3               | `source`          | Nguồn                 | LinkedIn, TopCV, Email...       |
| **E**        | 4               | `jobCode`         | Mã công việc          | Ví dụ: 000173                   |
| **F**        | 5               | `positionId`      | Position ID           | Ví dụ: NYS-DYS-HO-135-310       |
| **G**        | 6               | `fullName`        | Họ và Tên             |                                 |
| **H**        | 7               | `yob`             | Năm sinh              |                                 |
| **I**        | 8               | `gender`          | Giới tính             |                                 |
| **J**        | 9               | `phone`           | Số điện thoại         |                                 |
| **K**        | 10              | `email`           | Email                 |                                 |
| **L**        | 11              | `location`        | Địa chỉ/Vùng          |                                 |
| **M**        | 12              | `degree`          | Bằng cấp              | Cao đẳng, Đại học...            |
| **N**        | 13              | `education`       | Trường/Nơi đào tạo    |                                 |
| **O**        | 14              | -                 | (Chưa sử dụng)        |                                 |
| **P**        | 15              | -                 | (Chưa sử dụng)        |                                 |
| **Q**        | 16              | -                 | (Chưa sử dụng)        |                                 |
| **R**        | 17              | `workHistory`     | Lịch sử làm việc      | Tóm tắt các công ty cũ          |
| **S**        | 18              | `jobFunction`     | Chức năng (Function)  |                                 |
| **T**        | 19              | `skills`          | Kỹ năng               |                                 |
| **U**        | 20              | `certification`   | Chứng chỉ             |                                 |
| **V**        | 21              | `summary`         | Tóm tắt hồ sơ         | AI Generate                     |
| **W**        | 22              | `matchReason`     | Lý do phù hợp         | AI Generate                     |
| **X**        | 23              | `cvLink`          | Link CV               | Google Drive Link               |
| **Y**        | 24              | -                 | (Chưa sử dụng)        |                                 |
| **Z**        | 25              | `notes`           | Ghi chú ban đầu       |                                 |
| **AA**       | 26              | `isPotential`     | CV Tiềm năng          | TRUE/FALSE                      |
| **AB**       | 27              | `status`          | Trạng thái hiện tại   | New, Screening, HR Interview... |
| **AC**       | 28              | `failureReason`   | Lý do từ chối         |                                 |
| **AD**       | 29              | `testResult`      | Kết quả Test / Screen | Ngày thực hiện                  |
| **AE**       | 30              | `hrInterviewDate` | **Ngày HR PV**        | (Mới thêm) Vòng HR              |
| **AF**       | 31              | `interviewDate1`  | **Ngày PV Vòng 1**    | Manager L1                      |
| **AG**       | 32              | `interviewDate2`  | **Ngày PV Vòng 2**    | Manager L2                      |
| **AH**       | 33              | `offerDate`       | **Ngày gửi Offer**    |                                 |
| **AI**       | 34              | `startDate`       | **Ngày bắt đầu**      |                                 |
| **AJ**       | 35              | `officialDate`    | **Ngày chính thức**   |                                 |
| **AK**       | 36              | `rejectedRound`   | **Note / Vòng loại**  | Ghi chú thêm hoặc vòng bị loại  |

## 3. Các Trạng Thái (Status Pipeline)

Quy trình tuyển dụng đi qua các bước sau trên Kanban:

1.  **New** (Mới): Hồ sơ vừa được AI quét hoặc nhập tay.
2.  **Screening** (Test / Review): Sàng lọc hồ sơ, làm bài test.
3.  **HR Interview**: Phỏng vấn sơ bộ với HR.
4.  **Interview Round 1** (Manager L1): Phỏng vấn chuyên môn vòng 1.
5.  **Interview Round 2** (Manager L2): Phỏng vấn chuyên môn vòng 2 / Leader.
6.  **Offer**: Đề xuất lương và mời nhận việc.
7.  **Rejected**: Ứng viên bị loại (có thể recover lại các bước trước).

## 4. Lưu ý quan trọng

- Cột **AE (Ngày HR PV)** là cột mới được chèn vào, đẩy các cột sau lùi lại 1 vị trí so với phiên bản cũ.
- Hệ thống App tự động map vào đúng cột này khi update trạng thái.
- Không được tự ý xóa hoặc đổi thứ tự cột trên Google Sheet để tránh lỗi lệch dữ liệu.

## 5. Bảng Quản Lý Job (Jobs) [Mới]

- **Sheet Name**: `Jobs`
- **Range**: `A2:F`

| Cột   | Index | Tên Trường | Ghi Chú              |
| :---- | :---- | :--------- | :------------------- |
| **A** | 0     | `jobCode`  | Mã Job (Unique)      |
| **B** | 1     | `title`    | Tên vị trí           |
| **C** | 2     | `group`    | Nhóm (HO / Store)    |
| **D** | 3     | `status`   | `Hiring` / `Stopped` |
| **E** | 4     | `stopDate` | Ngày dừng (ISO 8601) |
| **F** | 5     | `reason`   | Lý do dừng           |
