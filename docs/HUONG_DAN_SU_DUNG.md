# Hướng Dẫn Sử Dụng CBS Recruitment Web App

Tài liệu này hướng dẫn chi tiết cách sử dụng phần mềm Tuyển dụng CBS cho Recruiter.

## 1. Thực Trạng & Giải Pháp AI

### Tại sao chúng ta cần hệ thống này?

**Thực trạng tuyển dụng truyền thống:**

- **Tốn thời gian**: Recruiter phải mở từng file CV (PDF/Word) để đọc và nhập liệu thủ công vào Excel.
- **Dữ liệu phân tán**: CV nằm rải rác trên Email, Link Google Drive và máy cá nhân, khó quản lý tập trung.
- **Đánh giá cảm tính**: Việc sàng lọc thủ công dễ bị bỏ sót ứng viên tiềm năng hoặc đánh giá không đồng nhất.

**Giải Pháp AI của CBS Recruitment App:**
Hệ thống tích hợp trí tuệ nhân tạo (AI) để giải quyết các vấn đề trên:

1.  **Tự động hóa**: AI tự động đọc hiểu file CV, trích xuất thông tin quan trọng (Tên, Email, Kỹ năng, Học vấn) và điền vào bảng dữ liệu.
2.  **Chấm điểm thông minh (Matching Score)**: Hệ thống tự động so sánh năng lực ứng viên với Mô tả công việc (JD) để đưa ra điểm số phù hợp (Xanh/Vàng/Đỏ), giúp Recruiter ưu tiên xử lý hồ sơ tốt nhất.
3.  **Tóm tắt hồ sơ**: Thay vì đọc 5 trang CV, Recruiter chỉ cần đọc 3 dòng tóm tắt do AI tổng hợp để nắm bắt nhanh điểm mạnh/yếu của ứng viên.

---

## 2. Tổng Quan Luồng Ứng Viên (Candidate Flow)

Trước khi đi vào chi tiết, bạn cần hiểu cách một ứng viên xuất hiện trong hệ thống. Có 2 luồng chính:

1.  **Luồng Tự Động (Auto from Email)**:
    - Hệ thống tự động quét Email tuyển dụng.
    - Khi có ứng viên gửi CV qua Email, hệ thống tự động bóc tách thông tin và đưa thẳng vào **Kho Dữ Liệu (Datapool)**.
    - _Recruiter không cần nhập tay_.
2.  **Luồng Thủ Công (Manual Input)**:
    - Dùng cho các trường hợp: CV nhận tay, CV tải từ LinkedIn/TopCV về máy, hoặc CV giấy.
    - Recruiter sử dụng **Tab Input** trên Web App để đẩy vào hệ thống.

### Sơ Đồ Luồng Xử Lý (Đầy Đủ)

![Giao diện Tab Input](./assets/web-process.png)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                          NGUỒN ỨNG VIÊN                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                    │                           │
         (1) Tự Động: Email          (2) Thủ Công: Tab Input
                    │                           │
                    └───────────┬───────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                    KHO DỮ LIỆU - DATAPOOL (Tab Datapool)                    │
│  • AI tự động chấm điểm (Match Score)                                       │
│  • Tóm tắt hồ sơ (AI Summary)                                               │
│  • Lọc theo Score, Nguồn, Thời gian                                         │
│  • Xem chi tiết ứng viên (Keyboard Navigation: ← →)                         │
└─────────────────────────────────────────────────────────────────────────────┘
                    │                           │
         Proceed to Screening              Reject (Decline)
                    │                           │
                    ↓                           ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│              QUY TRÌNH PHỎNG VẤN (Tab Process - Kanban)                     │
│                                                                             │
│  ┌──────┐   ┌──────────┐   ┌────────────┐   ┌──────────┐   ┌────────┐       │
│  │ New  │──▶│ Test/    │──▶│ HR         │──▶│ Manager  │──▶│ Manager│     │
│  │      │   │ Screen   │   │ Interview  │   │ L1       │   │ L2     │       │
│  └──────┘   └──────────┘   └────────────┘   └──────────┘   └────────┘       │
│      │            │              │                │              │          │
│      │            │              │                │              │          │
│      └────────────┴──────────────┴────────────────┴──────────────┘          │
│                                  │                                          │
│                                  ↓                                          │
│                          ┌───────────────┐                                  │
│                          │  OFFER        │                                  │
│                          └───────────────┘                                  │
│                                  │                                          │
│                    ┌─────────────┴─────────────┐                            │
│                    ↓                           ↓                            │
│              ┌──────────┐                 ┌──────────┐                      │
│              │  HIRED   │                 │ REJECTED │                      │
│              └──────────┘                 └──────────┘                      │
│                                                                             │
│  Tính năng:                                                                 │
│  • Kéo thả (Drag & Drop) để chuyển trạng thái                               │
│  • Withdraw: Quay lại trạng thái trước                                      │
│  • Decline: Loại ứng viên (chọn lý do + đánh dấu Potential)                 │
│  • Filter theo Job Code, Score, Date Range                                  │
│  • View Toggles: Active / Rejected / Stock                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ (Nếu Job bị Stop)
                                  ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                    QUẢN LÝ JOB & STOCK                                      │
│                                                                             │
│  ┌─────────────────┐                                                        │
│  │ STOP JOB        │  ← Recruiter quyết định dừng tuyển                     │
│  │ (Ngưng tuyển)   │    (Đủ người / Thay đổi kế hoạch)                      │
│  └─────────────────┘                                                        │
│          │                                                                  │
│          ↓                                                                  │
│  • Job Status = "Stopped"                                                   │
│  • Lưu lý do (Reason) và ngày dừng (Stop Date)                              │
│  • Ứng viên mới tự động vào STOCK                                           │
│  • Ứng viên hiện tại giữ nguyên trạng thái                                  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────┐            │
│  │              KHO LƯU TRỮ - STOCK                            │            │
│  │  • Chứa ứng viên của Job đã dừng tuyển                      │            │
│  │  • Không bị xóa, chỉ "đóng băng"                            │            │
│  │  • Có thể Rehire khi cần                                    │            │
│  └─────────────────────────────────────────────────────────────┘            │
│          │                                                                  │
│          │ (Khi Job mở lại hoặc chuyển Job khác)                            │
│          ↓                                                                  │
│  ┌─────────────────┐                                                        │
│  │ REHIRE          │  ← Kích hoạt lại ứng viên từ Stock                     │
│  │ (Tái tuyển)     │    Chọn Job mới → Trạng thái về "New"                  │
│  └─────────────────┘                                                        │
│          │                                                                  │
│          └──────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐                                                        │
│  │ RESUME JOB      │  ← Mở lại Job đã dừng                                  │
│  │ (Tiếp tục tuyển)│    Job Status = "Hiring"                               │
│  └─────────────────┘                                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ↓
                    Quay lại Kanban (Tab Process)
                    Ứng viên xuất hiện ở cột "New"

┌─────────────────────────────────────────────────────────────────────────────┐
│                         BÁO CÁO (Tab Reports)                               │
│  • Phễu tuyển dụng (Recruitment Funnel)                                     │
│  • Thống kê theo Job Code, Source, Status                                   │
│  • Số lượng: Active / Hired / Rejected / Stock                              │
│  • Hiệu quả nguồn tuyển dụng (LinkedIn, TopCV, Email...)                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Giải thích các trạng thái chính:

| Trạng thái       | Ý nghĩa                            | Hành động tiếp theo                 |
| ---------------- | ---------------------------------- | ----------------------------------- |
| **Datapool**     | CV mới nhận, chưa xử lý            | Proceed to Screening / Reject       |
| **New**          | Ứng viên mới vào quy trình         | Chuyển sang Test/Screen             |
| **Test/Screen**  | Đang làm bài test hoặc sàng lọc CV | Chuyển sang HR Interview / Decline  |
| **HR Interview** | Phỏng vấn với HR                   | Chuyển sang Manager L1 / Decline    |
| **Manager L1**   | Phỏng vấn với Quản lý cấp 1        | Chuyển sang Manager L2 / Decline    |
| **Manager L2**   | Phỏng vấn với Quản lý cấp 2        | Chuyển sang Offer / Decline         |
| **Offer**        | Đã gửi offer cho ứng viên          | Hired / Rejected (từ chối offer)    |
| **Hired**        | Đã tuyển dụng thành công           | Kết thúc quy trình                  |
| **Rejected**     | Bị loại ở bất kỳ vòng nào          | Lưu trữ (có thể đánh dấu Potential) |
| **Stock**        | Ứng viên của Job đã dừng tuyển     | Rehire / Lưu trữ dài hạn            |

---

## 3. Đăng Nhập (Login)

1.  Truy cập vào đường dẫn Web App (URL do Admin cung cấp).
2.  Tại màn hình Chào mừng, nhấp vào nút **"Login to Access"**.
3.  Chọn tài khoản **Google (Gmail)** công ty hoặc cá nhân đã được cấp quyền.
4.  Sau khi đăng nhập thành công, bạn sẽ được chuyển đến giao diện chính của phần mềm.

---

## 4. Tab 1: Nhập Liệu Thủ Công (Input)

Chức năng này dùng cho **Luồng Thủ Công** (khi ứng viên không đến từ Email tự động).

![Giao diện Tab Input](./assets/input_tab.png)

### Các bước thực hiện:

- **Tải lên CV (Upload CV)**:
  - Kéo và thả file PDF CV vào vùng upload (hoặc click để chọn file từ máy tính).
  - _Lưu ý_: Hỗ trợ file đuôi `.pdf`, `.docx`, và hình ảnh.
- **Chọn Nguồn (Source)**:
  - Chọn nguồn ứng viên từ dropdown (LinkedIn, TopCV, Email, Referral, v.v.).
- **Điền Vị trí ứng tuyển (Applied Position)**:
  - Nhập hoặc chọn vị trí từ danh sách gợi ý.
  - **✨ Tính năng mới - Quick Select**:
    - Nhấn vào dropdown "Quick select" bên phải để chọn nhanh từ danh sách Jobs đang tuyển.
    - Hệ thống tự động điền format: `Tên vị trí (JobCode_PositionID)`
    - Danh sách được cập nhật real-time từ Google Sheet Jobs.
    - Chỉ hiển thị các Job có Status = "Hiring" hoặc trống (đang tuyển).
- **Yêu cầu công việc (Job Requirements)**:
  - Điền mô tả ngắn gọn về yêu cầu công việc (tùy chọn).
- **Gửi (Submit)**:
  - Nhấn nút **"Submit Candidate"**.
  - Khi thành công, hệ thống thông báo "Upload Successful" và dữ liệu sẽ được lưu vào Datapool.

---

## 5. Tab 2: Kho Dữ Liệu (Datapool)

Nơi quản lý toàn bộ hồ sơ ứng viên (đến từ cả Email tự động và Nhập tay).

![Giao diện Datapool](./assets/datapool_view.png)

### Các tính năng chính:

- **Xem danh sách**: Dữ liệu hiển thị dưới dạng bảng chi tiết với các cột:
  - **Received**: Ngày nhận hồ sơ
  - **Candidate**: Tên và email ứng viên
  - **Position**: Vị trí ứng tuyển
  - **AI Score**: Điểm đánh giá AI (có màu sắc: xanh lá = cao, vàng = trung bình, đỏ = thấp)
  - **Source**: Nguồn ứng viên
  - **Status**: Trạng thái hiện tại
- **Bộ lọc (Filters)**:
  - **Tìm kiếm nhanh**: Thanh tìm kiếm phía trên để tìm theo tên, email, hoặc vị trí
  - **AI Score**: Dropdown lọc theo điểm AI (All, High >=8, Medium 5-7, Low <5)
  - **Thời gian (Received)**: Chọn khoảng ngày "From" (Từ) và "To" (Đến) ngay dưới header cột
  - **Lọc theo cột**: Mỗi cột có ô tìm kiếm riêng để lọc nhanh
- **Số liệu thống kê**:
  - Các badge hiển thị tổng số ứng viên, số vị trí, và số nguồn khác nhau

### Xem chi tiết ứng viên:

![Chi tiết ứng viên](./assets/candidate_detail.png)

- Nhấn vào **tên ứng viên** để mở cửa sổ chi tiết
- Cửa sổ hiển thị:
  - **AI Match Score**: Điểm đánh giá phù hợp (có màu sắc)
  - **Summary**: Tóm tắt hồ sơ do AI tạo
  - **Thông tin cá nhân**: Email, SĐT, Địa chỉ
  - **Học vấn**: Bằng cấp và trường học
  - **Kinh nghiệm**: Lịch sử công việc
  - **Kỹ năng**: Danh sách kỹ năng chính
  - **Chứng chỉ**: Các chứng chỉ liên quan
  - **Link CV**: Nút mở file CV gốc
- **Thao tác nhanh** từ modal:
  - **Process**: Chuyển sang quy trình phỏng vấn
  - **Decline**: Từ chối ứng viên
  - **Mũi tên trái/phải**: Xem ứng viên trước/sau

### Thao tác xử lý:

- **Proceed to Screening**: Chuyển ứng viên sang tab Process để bắt đầu phỏng vấn
- **Reject (Loại)**: Đánh dấu hồ sơ không đạt, có thể chọn lý do và đánh dấu "Hồ sơ tiềm năng"
- **Withdraw**: Ứng viên tự rút lui (trả lại trạng thái New)

### ✨ Tính năng mới: Điều hướng bàn phím (Keyboard Navigation)

**Cách sử dụng:**

1. Mở chi tiết ứng viên bất kỳ trong Datapool
2. Sử dụng phím mũi tên để chuyển đổi:
   - **Phím ← (Trái)**: Xem ứng viên trước đó
   - **Phím → (Phải)**: Xem ứng viên tiếp theo
3. Hệ thống tự động:
   - Chuyển sang hồ sơ mới
   - **Cuộn lên đầu trang** để bạn luôn thấy thông tin quan trọng nhất (tên, điểm AI, tóm tắt)
   - Không cần dùng chuột, tăng tốc độ xem xét hồ sơ

**Lợi ích:**

- ⚡ Tăng tốc độ xem xét: Không cần đóng/mở modal liên tục
- 🎯 Luôn xem thông tin quan trọng: Tự động scroll về đầu mỗi hồ sơ
- ⌨️ Làm việc hiệu quả: Chỉ cần bàn phím, không cần chuột

![Keyboard Navigation Demo](./assets/keyboard_navigation.png)

---

## 6. Tab 3: Quy Trình (Process / Kanban)

Nơi theo dõi tiến độ phỏng vấn của các ứng viên đang được xử lý.

![Giao diện Kanban](./assets/kanban_view.png)

### Các tính năng:

- **Giao diện Kanban**: Các cột tương ứng với các bước tuyển dụng:
  - **New**: Ứng viên mới.
  - **Screening**: Đang sàng lọc.
  - **Interview Round 1**: Phỏng vấn vòng 1.
  - **Interview Round 2**: Phỏng vấn vòng 2.
  - **Offer / Hired**: Đã gửi offer hoặc đã tuyển dụng chính thức (Nhóm chung).
- **Bộ lọc Job Code**:
  - Chọn mã Job cụ thể để xem ứng viên của Job đó.
  - Có thể thực hiện **Stop Recruitment** (Ngưng tuyển) cho Job đang chọn.
  - **Stock View**: Xem danh sách ứng viên của các Job đã ngưng tuyển.
- **Chuyển trạng thái**:
  - **Kéo và Thả**: Nhấn giữ thẻ ứng viên và kéo sang cột mong muốn.
  - Hệ thống tự động cập nhật trạng thái vào Google Sheet.
- **Loại ứng viên (Reject/Decline)**:
  - Trên mỗi thẻ có nút "Decline".
  - Chọn lý do loại và có thể đánh dấu "Potential Candidate".

---

## 7. Tab 4: Báo Cáo (Reports)

Nơi xem thống kê tổng quan về hiệu quả tuyển dụng.

![Giao diện Reports](./assets/reports_dashboard.png)

### Các biểu đồ chính:

1.  **Phễu Tuyển Dụng (Recruitment Funnel)**:
    - Hiển thị tỷ lệ chuyển đổi qua từng vòng (New -> Screening -> Interview -> Offer -> Hired).
    - Giúp nhận biết vòng nào đang bị rớt nhiều ứng viên nhất.
2.  **Thống Kê Ứng Viên**:
    - Số lượng ứng viên Active, Hired, Rejected, và Stock.
3.  **Bộ Lọc Nâng Cao**:
    - **Job Code**: Xem báo cáo riêng cho từng vị trí.
    - **Source**: So sánh hiệu quả các nguồn (LinkedIn vs TopCV...).
    - **Status**: Lọc theo Job đang tuyển (Hiring) hoặc đã dừng (Stopped).

---

## 8. Quản Lý Job & Stock (Job Management & Stock)

### 8.1. Tính năng Ngưng Tuyển (Stop Recruitment)

**Mục đích:** Tạm dừng tuyển dụng cho một vị trí cụ thể khi đã đủ người hoặc thay đổi kế hoạch.

**Các bước thực hiện:**

1. **Truy cập Tab Process (Kanban)**
   - Click vào tab "Recruitment Process"

2. **Chọn Job cần dừng**
   - Tại dropdown "Filter by Job", chọn mã Job cụ thể (ví dụ: "123")
   - Hệ thống sẽ hiển thị chỉ các ứng viên của Job đó

3. **Nhấn nút Stop Recruitment**
   - Tìm nút **"Stop Recruitment"** (màu đỏ) phía trên bảng Kanban
   - Click vào nút này

4. **Điền thông tin dừng tuyển**
   - Cửa sổ "Stop Recruitment for [JobCode]" xuất hiện
   - Chọn lý do từ dropdown:
     - Headcount reduction (Cắt giảm biên chế)
     - Position filled (Đã tuyển đủ)
     - Budget constraints (Hạn chế ngân sách)
     - Strategic change (Thay đổi chiến lược)
     - Other (Khác)
   - Nếu chọn "Other", nhập lý do cụ thể vào ô text

5. **Xác nhận**
   - Click nút **"Confirm Stop"** (màu đỏ)
   - Hệ thống sẽ:
     - Cập nhật Status = "Stopped" trong Google Sheet Jobs
     - Lưu ngày dừng (Stop Date) và lý do (Reason)
     - Tự động chuyển các ứng viên mới (nếu có) vào kho Stock

**Kết quả:**

- ✅ Job được đánh dấu "Stopped"
- ✅ Không còn hiển thị trong danh sách Job đang tuyển
- ✅ Ứng viên hiện tại giữ nguyên trạng thái
- ✅ Ứng viên mới sẽ tự động vào Stock

![Stop Recruitment Demo](./assets/stop_recruitment.png)

---

### 8.2. Kho Lưu Trữ (Stock View)

**Stock là gì?**

- Kho chứa hồ sơ ứng viên của các Job đã tạm dừng tuyển dụng
- Ứng viên trong Stock không bị xóa, chỉ tạm "đóng băng"
- Có thể kích hoạt lại (Rehire) khi Job mở lại

**Cách xem Stock:**

1. **Chuyển sang Stock View**
   - Tại tab Process (Kanban)
   - Tìm toggle/button **"Stock View"** hoặc filter "Show Stock"
   - Click để chuyển sang chế độ xem Stock

2. **Nội dung Stock View**
   - Hiển thị danh sách ứng viên theo từng Job đã dừng
   - Mỗi card ứng viên có badge "Stock" màu xám
   - Thông tin hiển thị: Tên, Vị trí, AI Score, Ngày nhận

---

### 8.3. Tính năng Rehire (Tái Tuyển)

**Mục đích:** Kích hoạt lại ứng viên từ Stock khi Job mở lại hoặc chuyển sang Job khác.

**Các bước thực hiện:**

1. **Vào Stock View**
   - Làm theo hướng dẫn mục 8.2 để xem danh sách Stock

2. **Chọn ứng viên cần Rehire**
   - Tìm card ứng viên muốn kích hoạt lại
   - Click vào **nút 3 chấm (⋮)** ở góc phải card

3. **Click Rehire**
   - Trong menu dropdown, chọn **"Rehire"**
   - Cửa sổ "Rehire Candidate" xuất hiện

4. **Chọn Job mới**
   - Dropdown "Select New Job" hiển thị danh sách Jobs đang tuyển (Status = "Hiring")
   - Chọn Job phù hợp với ứng viên
   - Hệ thống tự động điền thông tin Job (Title, Group)

5. **Xác nhận Rehire**
   - Click nút **"Confirm Rehire"**
   - Hệ thống sẽ:
     - Cập nhật JobCode mới cho ứng viên
     - Chuyển trạng thái về "New"
     - Di chuyển ứng viên từ Stock về cột "New" trong Kanban
     - Xóa note "Stock" khỏi hồ sơ

**Kết quả:**

- ✅ Ứng viên được "hồi sinh" với Job mới
- ✅ Xuất hiện trong Kanban của Job mới
- ✅ Sẵn sàng cho quy trình phỏng vấn

![Rehire Feature Demo](./assets/rehire_modal.png)

---

### 8.4. Tiếp Tục Tuyển (Resume Recruitment)

**Khi nào dùng:** Job đã dừng nhưng cần mở lại do nhu cầu thay đổi.

**Các bước:**

1. Tại tab Process, chọn Job đã "Stopped" từ filter
2. Click nút **"Resume Recruitment"** (màu xanh)
3. Xác nhận trong dialog
4. Hệ thống cập nhật Status = "Hiring" trong Sheet
5. Job xuất hiện lại trong danh sách đang tuyển

---

## 9. Đăng Xuất (Logout)

![Menu đăng xuất](./assets/logout_menu.png)

1.  Nhìn lên góc trên cùng bên phải màn hình
2.  Nhấn vào **email/tên người dùng** để mở menu
3.  Chọn **"Log out"**
4.  Hệ thống sẽ xóa phiên làm việc và quay lại màn hình đăng nhập

---

## Các Lưu ý Quan Trọng

- **Dữ liệu thực**: Mọi thao tác Thêm/Sửa/Xóa trên Web App đều tác động trực tiếp vào file **Google Sheet** của dự án. Hãy cẩn thận khi thao tác.
- **Quyền truy cập**: Nếu bạn gặp lỗi "Network Error" hoặc không thấy dữ liệu, hãy liên hệ Admin để kiểm tra lại quyền chia sẻ Google Drive của bạn.
- **Tự động lưu**: Mọi thay đổi đều được lưu ngay lập tức, không cần nhấn nút "Save".
- **Keyboard Shortcuts**:
  - Trong modal chi tiết: Dùng phím **←** và **→** để xem ứng viên trước/sau
  - **Esc**: Đóng modal/dialog
