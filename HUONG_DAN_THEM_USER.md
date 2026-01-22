# Hướng Dẫn Thêm User Mới

## Vị trí: Google Sheet - Tab `User_view`

Mở Google Sheet Datapool của bạn và tìm tab **`User_view`**.

## Cấu trúc cột (A-F):

| Cột   | Tên Trường    | Mô tả                  | Ví dụ                                              |
| ----- | ------------- | ---------------------- | -------------------------------------------------- |
| **A** | Email         | Email đăng nhập Google | `dinhsang031@gmail.com`                            |
| **B** | Role          | Vai trò                | `HO_Recruiter`, `ST_Recruiter`, `Manager`, `Admin` |
| **C** | Upload Config | Cấu hình upload CV     | Để trống hoặc `DEFAULT`                            |
| **D** | View Config   | Cấu hình xem Kanban    | Để trống hoặc `DEFAULT`                            |
| **E** | Name          | Tên hiển thị           | `Mr. Sang`                                         |
| **F** | Phone number  | Số điện thoại          | `0935764976`                                       |

## Danh sách User cần thêm:

Thêm các dòng sau vào tab `User_view`:

| Email                           | Role         | Upload Config | View Config | Name     | Phone number |
| ------------------------------- | ------------ | ------------- | ----------- | -------- | ------------ |
| dinhsang031@gmail.com           | HO_Recruiter |               |             | Mr. Sang | 0935764976   |
| cbsvn.officetalenthub@gmail.com | HO_Recruiter |               |             | Ms. Nga  | 0906627301   |
| cbsvn.storetalenthub@gmail.com  | ST_Recruiter |               |             |          |              |
| crcsportsvn@gmail.com           | Manager      |               |             | Mr. Hugo | 0338223952   |

## Lưu ý:

- Cột **Upload Config** và **View Config** có thể để trống (sẽ dùng giá trị mặc định).
- **Role** phân quyền:
  - `HO_Recruiter`: Recruiter văn phòng
  - `ST_Recruiter`: Recruiter cửa hàng
  - `Manager`: Quản lý
  - `Admin`: Toàn quyền

## Sau khi thêm:

User mới có thể đăng nhập ngay bằng email Google tương ứng.
