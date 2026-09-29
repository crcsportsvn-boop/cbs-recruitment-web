# TÀI LIỆU BÀN GIAO VẬN HÀNH HỆ THỐNG
## PHÂN HỆ SƠ ĐỒ TỔ CHỨC & LẬP ĐỀ XUẤT ĐỊNH BIÊN (CBS ORG CHART STUDIO)

---

### MỤC LỤC
1. [Tổng Quan Hệ Thống & Phạm Vi Ứng Dụng](#1-tổng-quan-hệ-thống--phạm-vi-ứng-dụng)
2. [Kiến Trúc Dữ Liệu & Quy Ước Chuẩn](#2-kiến-trúc-dữ-liệu--quy-ước-chuẩn)
3. [Chi Tiết 6 Nhóm Nghiệp Vụ Vận Hành Cốt Lõi](#3-chi-tiết-6-nhóm-nghiệp-vụ-vận-hành-cốt-lõi)
   - [Nghiệp vụ 1: Nạp Dữ Liệu Gốc & Tự Động Lưu Trữ (Baseline Data)](#nghiệp-vụ-1-nạp-dữ-liệu-gốc--tự-động-lưu-trữ-baseline-data)
   - [Nghiệp vụ 2: Quản Lý Đa Kịch Bản Đề Xuất (Multi-Proposal Workflow)](#nghiệp-vụ-2-quản-lý-đa-kịch-bản-đề-xuất-multi-proposal-workflow)
   - [Nghiệp vụ 3: Quản Lý Ghế & Tuyến Báo Cáo Trên Sơ Đồ](#nghiệp-vụ-3-quản-lý-ghế--tuyến-báo-cáo-trên-sơ-đồ)
   - [Nghiệp vụ 4: Quản Lý Khối Box Group & Phòng Ban Mới](#nghiệp-vụ-4-quản-lý-khối-box-group--phòng-ban-mới)
   - [Nghiệp vụ 5: So Sánh Biến Động & Bảng Thuyết Minh Giải Trình](#nghiệp-vụ-5-so-sánh-biến-động--bảng-thuyết-minh-giải-trình)
   - [Nghiệp vụ 6: Đóng Gói & Xuất Hồ Sơ Báo Cáo Trình Ký](#nghiệp-vụ-6-đóng-gói--xuất-hồ-sơ-báo-cáo-trình-ký)
4. [Bảng Tra Cứu Quy Chuẩn Trực Quan & Thao Tác Nhanh](#4-bảng-tra-cứu-quy-chuẩn-trực-quan--thao-tác-nhanh)
5. [Quy Trình Xử Lý Sự Cố Thường Gặp (Troubleshooting)](#5-quy-trình-xử-lý-sự-cố-thường-gặp-troubleshooting)
6. [Kế Hoạch Bàn Giao Kỹ Thuật & Bảo Trì](#6-kế-hoạch-bàn-giao-kỹ-thuật--bảo-trì)

---

### 1. TỔNG QUAN HỆ THỐNG & PHẠM VI ỨNG DỤNG

**CBS Org Chart Studio** là phân hệ phần mềm nội bộ chuyên sâu, phục vụ Ban Giám Đốc, Bộ phận Nhân sự (HR) và các Cấp Quản lý Khối trong việc:
- **Trực quan hóa cấu trúc tổ chức thực tế (Hiện tại / Baseline)**: Thể hiện đồng thời góc nhìn toàn cảnh cấp cao N-1 và góc nhìn chi tiết từng phòng ban, nhãn hàng trực thuộc.
- **Lập phương án đề xuất kịch bản định biên (Proposal)**: Cho phép tinh chỉnh, tái cấu trúc, thêm mới vị trí tuyển dụng, thay thế nhân sự hoặc phân chia lại phòng ban trong môi trường mô phỏng an toàn, không ảnh hưởng đến dữ liệu thực tế.
- **Tự động hóa báo cáo và trình ký**: So sánh biến động tự động giữa phương án đề xuất và thực tế, xuất báo cáo Excel kèm bảng thuyết minh nhân sự, file PDF A4/A3 chuẩn hóa trang in và bài thuyết trình Slide tương tác.

#### Nền tảng Công nghệ
- **Frontend Framework**: Next.js 14 (App Router), React 18, TypeScript.
- **Giao diện & Tương tác**: Tailwind CSS, Radix UI Primitives, Lucide Icons, Canvas Drag-and-Drop với Smart Snapping Guides.
- **Xử lý Dữ liệu & Xuất bản**: SheetJS (XLSX Engine), jsPDF, html2canvas, Google Sheets API Integration.
- **Hạ tầng Triển khai**: Vercel CI/CD tự động kết nối qua kho mã nguồn GitHub (`crcsportsvn-boop/cbs-recruitment-web`).

---

### 2. KIẾN TRÚC DỮ LIỆU & QUY ƯỚC CHUẨN

#### 2.1. Cấu trúc Tệp Dữ Liệu Đầu Vào Excel (Master Headcount)
Hệ thống chấp nhận tệp Excel chứa dữ liệu định biên nhân sự với các trường thông tin tiêu chuẩn:

| Tên Cột Excel | Kiểu Dữ Liệu | Bắt Buộc | Mô Tả Nghiệp Vụ |
| :--- | :--- | :---: | :--- |
| **Position ID** | Chuỗi ký tự | Có | Mã định danh duy nhất của từng vị trí / ghế làm việc. |
| **Job Title** | Chuỗi ký tự | Có | Chức danh công việc chuẩn hóa (ví dụ: Brand Manager, SCM Head). |
| **Employee Name** | Chuỗi ký tự | Không | Họ tên nhân sự đang đảm nhiệm (để trống nếu là ghế trống/vacant). |
| **Nickname** | Chuỗi ký tự | Không | Tên thân mật của nhân sự để hiển thị gọn gàng trên thẻ ghế. |
| **Division / Department** | Chuỗi ký tự | Có | Phòng ban hoặc Nhãn hàng (ví dụ: Crocs, Dyson, Finance, HR). |
| **Band / Grade** | Số / Chuỗi | Không | Cấp bậc nhân sự phục vụ thống kê bảng định biên (ví dụ: Band 1, 2, 3). |
| **Reports To ID** | Chuỗi ký tự | Có | Mã Position ID của cấp quản lý trực tiếp để dựng cây sơ đồ. |
| **Effective End Date** | Ngày tháng | Không | Ngày hết hạn hiệu lực của ghế (phục vụ ghế dự án / thời vụ). |
| **Note Position ID** | Chuỗi ký tự | Không | Ghi chú bổ sung phục vụ đối soát vị trí. |

#### 2.2. Cơ chế Lưu trữ Đa tầng (Multi-tier Persistence Architecture)
1. **Bộ nhớ Cục bộ (Local Persistence)**:
   - Dữ liệu gốc Hiện tại được tự động lưu trữ vào `localStorage` của trình duyệt ngay sau khi tải tệp. Khi người dùng mở lại trang ở các phiên làm việc tiếp theo, hệ thống tự động tải bản mới nhất này.
   - Các bản thảo đề xuất (Đề xuất 1 đến Đề xuất 5) cùng cấu hình Khối Box Group được lưu trữ tự động liên tục theo thời gian thực (Auto-save).
2. **Đồng bộ Đám mây (Cloud Sheets Sync)**:
   - Tích hợp 2 chiều với Google Sheets HO của doanh nghiệp qua các sheet tương ứng (`org-propose`, `org-propose2`, ...).
   - Đảm bảo an toàn dữ liệu, cho phép chia sẻ phương án giữa nhiều quản lý và khôi phục dữ liệu từ nguồn tập trung bất kỳ lúc nào.

---

### 3. CHI TIẾT 6 NHÓM NGHIỆP VỤ VẬN HÀNH CỐT LÕI

```
                  ┌──────────────────────────────────────────────┐
                  │    1. NẠP DỮ LIỆU GỐC & TỰ ĐỘNG LƯU TRỮ     │
                  │  (Excel Master Upload · Persistence · Sheet) │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │    2. QUẢN LÝ ĐA KỊCH BẢN ĐỀ XUẤT (TỐI ĐA 5) │
                  │  (Đổi tên · Đồng bộ Hiện Tại · Cloud Sync)   │
                  └──────┬────────────────────────────────┬──────┘
                         │                                │
                         ▼                                ▼
       ┌───────────────────────────────────┐    ┌───────────────────────────────────┐
       │ 3. QUẢN LÝ GHẾ & TUYẾN BÁO CÁO    │    │ 4. KHỐI BOX GROUP & PHÒNG BAN MỚI │
       │ • Thêm: Chuẩn / Mới / Thay thế    │    │ • Thêm Box Group với 5 màu sắc    │
       │ • Nút (+) thêm từ ghế Quản lý     │    │ • Nút 3 gạch di chuyển vị trí     │
       │ • Nối ma trận báo cáo gián tiếp   │    │ • Mũi tên góc co giãn kích thước  │
       │ • Chỉnh sửa định biên, highlight  │    │ • Tạo Division / Nhãn hàng mới    │
       └─────────────────┬─────────────────┘    └─────────────────┬─────────────────┘
                         │                                        │
                         └───────────────────┬────────────────────┘
                                             │
                                             ▼
                  ┌──────────────────────────────────────────────┐
                  │    5. SO SÁNH BIẾN ĐỘNG & BẢNG THUYẾT MINH   │
                  │   (Diff Mode · Thuyết minh · Thống kê 3 năm) │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │    6. ĐÓNG GÓI & XUẤT HỒ SƠ BÁO CÁO TRÌNH KÝ │
                  │  (Excel Biến động · PDF A4/A3 · PNG · Slide) │
                  └──────────────────────────────────────────────┘
```

---

#### Nghiệp vụ 1: Nạp Dữ Liệu Gốc & Tự Động Lưu Trữ (Baseline Data)
- **Mục đích**: Thiết lập và duy trì cây sơ đồ tổ chức thực tế làm chuẩn đối chiếu cho toàn bộ các đề xuất thay đổi.
- **Thao tác thực hiện**:
  1. Trên thanh công cụ chính, nhấn nút **Nạp Excel** (biểu tượng đám mây xanh).
  2. Chọn tệp bảng tính định biên nhân sự (`.xlsx` hoặc `.xls`).
  3. Hệ thống hiển thị bảng tiến trình nạp dữ liệu và kiểm tra cấu trúc danh sách nhân sự khối văn phòng cùng các lãnh đạo vùng.
  4. Sau khi nạp thành công, một hộp thoại tóm tắt xuất hiện (thống kê tổng số lượng ghế văn phòng và lãnh đạo khu vực).
- **Cơ chế tự động lưu (Persistence)**:
  - Dữ liệu vừa nạp lập tức trở thành bản ghi gốc mới nhất.
  - Người dùng tắt trình duyệt hoặc mở lại ở phiên làm việc sau sẽ tự động nhìn thấy dữ liệu mới này mà không cần nạp lại file.
- **Khôi phục từ hệ thống dữ liệu gốc**:
  - Khi cần tải lại dữ liệu mới nhất từ nguồn công ty, người dùng vào menu **Xuất Dữ Liệu** > chọn **Tải Lại Dữ Liệu Gốc**.

---

#### Nghiệp vụ 2: Quản Lý Đa Kịch Bản Đề Xuất (Multi-Proposal Workflow)
- **Mục đích**: Cho phép nhân sự và ban lãnh đạo thử nghiệm nhiều phương án tổ chức song song mà không sợ ghi đè dữ liệu.
- **Thao tác thực hiện**:
  1. **Chuyển đổi kịch bản**: Nhấn vào danh sách thả xuống **Kịch Bản Đề Xuất** ở góc trái thanh công cụ. Hệ thống hỗ trợ tối đa 5 bản thảo kịch bản độc lập (Đề Xuất 1 đến Đề Xuất 5).
  2. **Thêm phương án mới**: Nhấn **+ Thêm Đề Xuất mới** (tối đa 5 phương án).
  3. **Đổi tên kịch bản**: Nhấn nút **Đổi tên đề xuất đang chọn** để đặt tên gợi nhớ theo chiến lược (ví dụ: *Phương Án Tối Ưu Q4*, *Mở Rộng Nhãn Hàng Hoka*).
  4. **Đồng bộ từ Hiện Tại**: Trên thanh công cụ phụ, nhấn nút **Đồng bộ từ Hiện Tại** để sao chép nguyên trạng cây sơ đồ gốc sang bản đề xuất đang chọn; giúp người dùng có ngay điểm bắt đầu hoàn chỉnh để chỉnh sửa.
  5. **Lưu trữ phương án lên hệ thống**: Nhấn nút **Lưu Phương Án** trên thanh công cụ hoặc chọn **Lưu Phương Án Này** trong menu Xuất Dữ Liệu để ghi nhận và đồng bộ phương án lên hệ thống phục vụ lưu trữ vĩnh viễn và chia sẻ nội bộ.

---

#### Nghiệp vụ 3: Quản Lý Ghế & Tuyến Báo Cáo Trên Sơ Đồ
- **Mục đích**: Bổ sung, điều chỉnh, cắt giảm hoặc phân cấp lại quyền hạn cho từng vị trí làm việc.
- **Thao tác thực hiện**:
  - **Thêm ghế độc lập**:
    - Nhấn nút **Tuyển mới** (màu xanh lá) để thêm ghế tuyển dụng mới theo kế hoạch ngân sách.
    - Nhấn nút **Thay thế** (màu đỏ hoa hồng) để thêm ghế tuyển thay thế cho nhân sự sắp nghỉ.
    - Nhấn nút **Ghế chuẩn** (màu xám trung tính) để thêm ghế bổ sung cơ cấu thông thường.
  - **Thêm ghế trực thuộc nhanh từ Ghế Quản Lý**:
    - Nhấp chọn ghế của người quản lý > bấm vào biểu tượng dấu cộng `(+)` nằm trên thanh thao tác nhanh của thẻ ghế.
    - Hệ thống lập tức sinh ra ghế cấp dưới mới và **tự động điền sẵn Người quản lý trực tiếp** là vị trí đó mà không cần gõ mã thủ công.
  - **Chỉnh sửa chi tiết ghế**:
    - Nhấp đúp chuột vào thẻ ghế để mở hộp thoại thông tin vị trí.
    - Cập nhật chức danh, mã định biên, tên nhân sự, tên thân mật, ngày hết hạn hiệu lực và ghi chú nội bộ.
  - **Làm nổi bật vị trí (Highlight)**:
    - Bấm nút **Highlight** trên thẻ ghế để kích hoạt viền màu vàng/tím nổi bật, phục vụ trình bày các vị trí trọng điểm trong buổi họp.
  - **Thiết lập Tuyến Báo Cáo Chức Năng (Matrix Reporting Line)**:
    - Nhấn biểu tượng liên kết trên thẻ ghế nhân viên > kéo thả hoặc nhấp vào thẻ lãnh đạo chuyên môn để tạo đường đứt nét báo cáo ma trận.
  - **Kéo thả vị trí & Canh hàng thông minh**:
    - Nhấn giữ và kéo thả ghế tự do trên khung vẽ để sắp xếp bố cục trực quan; hệ thống tự động hiển thị các đường gióng thông minh (Smart Guides) hỗ trợ canh thẳng hàng và đều khoảng cách.

---

#### Nghiệp vụ 4: Quản Lý Khối Box Group & Phòng Ban Mới
- **Mục đích**: Phân nhóm trực quan các khối ngành kinh doanh, khối hỗ trợ dùng chung trên sơ đồ N-1 hoặc mở rộng thêm nhãn hàng mới vào doanh nghiệp.
- **Thao tác thực hiện**:
  - **Thêm Khối Box Group mới trên sơ đồ N-1**:
    1. Trên thanh công cụ phụ, nhấn nút **Thêm Box Group** (biểu tượng dấu cộng màu tím).
    2. Điền tiêu đề khối (ví dụ: *REGIONAL RETAIL OPERATIONS*), ghi chú chân trang, chọn kích thước khởi tạo và bảng màu nhận diện (Xám, Xanh biển, Xanh lá, Vàng cam, Tím).
    3. Bấm **Tạo Khối Box**. Khối mới lập tức xuất hiện trên sơ đồ N-1.
  - **Di chuyển vị trí Khối Box**:
    - Rê chuột vào khối box để làm xuất hiện **nút 3 gạch ngang** ở góc trên bên trái.
    - Nhấn giữ nút 3 gạch và kéo thả khối box đến vị trí mong muốn trên khung vẽ.
  - **Co giãn kích thước Khối Box trực quan**:
    - Rê chuột vào khối box để làm xuất hiện **biểu tượng mũi tên 2 chiều** ở góc dưới bên phải.
    - Nhấn giữ và kéo góc mũi tên để phóng to hoặc thu nhỏ kích thước khối theo nhu cầu.
  - **Chỉnh sửa tiêu đề & văn bản bên trong Khối Box**:
    - Rê chuột vào khối box > bấm biểu tượng **Cây bút** ở góc trên bên phải để mở hộp thoại chỉnh sửa tiêu đề, ghi chú hoặc đổi màu sắc.
  - **Xóa Khối Box tự tạo**:
    - Rê chuột vào khối box tự tạo > bấm biểu tượng **Thùng rác** để xóa bỏ khối khỏi sơ đồ.
  - **Tạo Phòng Ban / Nhãn Hàng mới hoàn toàn**:
    1. Tại mục chọn **Phòng Ban** trên thanh công cụ, chọn dòng `+ Thêm Division mới...` hoặc nhấn biểu tượng dấu cộng bên cạnh.
    2. Nhập tên nhãn hàng mới (ví dụ: *Matin Kim*, *On Running*), chức danh người đứng đầu (ví dụ: *Brand Manager*), tên nhân sự và chỉ định tuyến báo cáo lên ban giám đốc.
    3. Bấm **Tạo Division Mới**. Nhãn hàng mới lập tức xuất hiện trong danh mục phân hệ và có sẵn một ghế đứng đầu để tiếp tục mở rộng cây sơ đồ.

---

#### Nghiệp vụ 5: So Sánh Biến Động & Bảng Thuyết Minh Giải Trình
- **Mục đích**: Cung cấp căn cứ định lượng và định tính về sự khác biệt giữa phương án đề xuất so với hiện trạng trước khi trình duyệt.
- **Thao tác thực hiện**:
  - **Kích hoạt Chế độ So Sánh**:
    - Nhấn nút **So Sánh Biến Động** trên thanh công cụ.
    - Hệ thống tự động so khớp từng vị trí giữa bản Đề xuất đang mở và bản Hiện tại, phân loại thành 5 trạng thái biến động trực quan:
      + `+ Tuyển mới` (Thẻ viền xanh lá đậm)
      + `× Thay thế` (Thẻ viền đỏ hoa hồng)
      + `⇄ Đổi sếp / Chuyển tuyến` (Thẻ viền vàng cam)
      + `✎ Đổi tên chức danh` (Thẻ viền xanh dương)
      + `Không đổi` (Thẻ viền nét đứt màu xám)
  - **Bảng thuyết minh đề xuất**:
    - Cung cấp danh mục ghi chú thuyết minh chi tiết cho từng thay đổi định biên: Căn cứ bổ sung, tác động quỹ lương, thời hạn tuyển dụng dự kiến.
  - **Bảng tổng hợp định biên nhân sự 3 năm**:
    - Bật tùy chọn **Bảng Tổng Hợp** để hiển thị bảng thống kê số lượng nhân sự 3 năm liên tiếp theo từng cấp bậc (Band 1, Band 2, Band 3, Quản lý cửa hàng).

---

#### Nghiệp vụ 6: Đóng Gói & Xuất Hồ Sơ Báo Cáo Trình Ký
- **Mục đích**: Xuất bản các tài liệu chuẩn hóa phục vụ các cuộc họp hội đồng quản trị, trình ký văn bản hoặc lưu trữ hồ sơ nhân sự.
- **Các định dạng xuất bản**:
  1. **Xuất File Excel Đề Xuất**:
     - Nhấn **Xuất Dữ Liệu** > chọn **Xuất File Excel Đề Xuất**.
     - Tệp Excel tải về bao gồm danh sách đầy đủ toàn bộ nhân sự, cơ cấu vị trí mới và một sheet riêng phân tích biến động định biên chi tiết.
  2. **Xuất Ảnh PNG Sắc Nét**:
     - Xuất toàn bộ khung vẽ thành hình ảnh PNG độ phân giải cao, phông nền trong suốt hoặc trắng tinh khiết, tối ưu cho việc dán vào slide báo cáo hoặc email nội bộ.
  3. **Xuất File PDF A4 Khổ Ngang**:
     - Định dạng trang ngang A4 tiêu chuẩn, tự động căn chỉnh tỷ lệ lề trang, tối ưu cho việc in ấn hồ sơ trình ký ban tổng giám đốc.
  4. **Xuất File PDF A3 Khổ Rộng**:
     - Tối ưu đặc biệt cho sơ đồ N-1 toàn công ty hoặc các phòng ban đông nhân sự, đảm bảo kích thước chữ rõ nét, không bị co nhỏ khi in ấn khổ lớn.
  5. **Trình Chiếu Slide Tương Tác**:
     - Hệ thống tích hợp sẵn bài trình chiếu Slide tương tác trực quan tại cổng `http://localhost:5173/s/cbs-orgchart-intro` phục vụ đào tạo nội bộ và giới thiệu tính năng tới người dùng mới.

---

### 4. BẢNG TRA CỨU QUY CHUẨN TRỰC QUAN & THAO TÁC NHANH

#### 4.1. Bảng Mã Màu Quy Ước Thẻ Ghế
| Trạng Thái Thẻ Ghế | Màu Nền | Màu Viền | Ý Nghĩa Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| **Ghế Chuẩn (Standard)** | Trắng tinh khiết | Xám nhạt (`#cbd5e1`) | Vị trí hiện hữu tiêu chuẩn trong cơ cấu. |
| **Tuyển Mới (New Hire)** | Xanh lục nhạt (`#ecfdf5`) | Xanh lá đậm (`#10b981`) | Ghế được phê duyệt tuyển dụng mới trong kỳ. |
| **Tuyển Thay Thế (Replace)** | Đỏ nhạt (`#fff1f2`) | Đỏ hồng (`#f43f5e`) | Vị trí cần tuyển người mới thay thế nhân sự cũ. |
| **Làm Nổi Bật (Highlight)** | Vàng nhạt (`#fefce8`) | Vàng cam (`#eab308`) | Ghế trọng tâm cần sự lưu ý đặc biệt khi họp. |
| **Ghế Trống (Vacant)** | Trắng mờ (`rgba(255,255,255,0.7)`) | Viền đứt nét (`dashed`) | Vị trí chưa có nhân sự ngồi ghế. |

#### 4.2. Bảng Màu Khối Box Group
| Màu Sắc Khối | Màu Nền | Màu Viền | Khuyến Nghị Sử Dụng |
| :--- | :--- | :--- | :--- |
| **Xám (Slate)** | Trắng mờ (`rgba(255,255,255,0.75)`) | Xám (`#94a3b8`) | Khối chức năng hỗ trợ dùng chung (COE, CRV). |
| **Xanh Biển (Blue)** | Xanh dương nhạt (`#eff6ff`) | Xanh biển (`#93c5fd`) | Khối Thương Hiệu (Brand), Khối Bán lẻ (SSP). |
| **Xanh Lá (Emerald)**| Xanh lá mạ (`#ecfdf5`) | Xanh ngọc (`#6ee7b7`) | Khối Vận hành mở rộng, Dự án mới. |
| **Vàng Cam (Amber)** | Vàng nắng (`#fffbeb`) | Cam vàng (`#fcd34d`) | Khối Kinh doanh chiến lược, Đơn vị thí điểm. |
| **Tím (Purple)**     | Tím oải hương (`#faf5ff`) | Tím (`#d8b4fe`) | Khối Sáng tạo, Marketing, Chuyển đổi số. |

#### 4.3. Bảng Thao Tác Chuột & Phím Tắt Tiện Ích
- **Rê chuột vào Khối Box**: Tự động hiển thị nút 3 gạch (di chuyển), cây bút (chỉnh sửa) và góc mũi tên (co giãn).
- **Rê chuột khỏi Khối Box**: Tự động ẩn các nút điều khiển giúp sơ đồ luôn thẩm mỹ và gọn gàng.
- **Giữ chuột trái trên nền trống và kéo (Pan)**: Di chuyển không gian làm việc tự do.
- **Cuộn con lăn chuột (Zoom)**: Phóng to hoặc thu nhỏ tỷ lệ khung vẽ từ 30% đến 200%.
- **Bấm dấu (+) trên ghế quản lý**: Thêm nhanh ghế cấp dưới trực thuộc.
- **Kéo thả ghế**: Bắt điểm gióng hàng tự động theo chiều ngang và chiều dọc.

---

### 5. QUY TRÌNH XỬ LÝ SỰ CỐ THƯỜNG GẶP (TROUBLESHOOTING)

| Hiện Tượng Sự Cố | Nguyên Nhân Khả Dĩ | Biện Pháp Xử Lý Khắc Phục |
| :--- | :--- | :--- |
| **Nạp file Excel báo lỗi hoặc không lên cây sơ đồ** | Cột `Position ID` hoặc `Reports To ID` bị trống, hoặc có vòng lặp báo cáo (A báo cáo B, B báo cáo A). | Kiểm tra file Excel: đảm bảo ghế cao nhất (CEO) có `Reports To ID` để trống và không có vòng lặp định danh. |
| **Mất dữ liệu đề xuất sau khi xóa lịch sử duyệt web** | Trình duyệt đã dọn sạch bộ nhớ cache và `localStorage`. | 1. Tải lại dữ liệu Hiện tại bằng cách nạp lại tệp Excel hoặc bấm "Tải Lại Dữ Liệu Gốc".<br>2. Nếu đã bấm "Lưu Phương Án" trước đó, chỉ cần chọn lại phương án đề xuất đó trên thanh công cụ để khôi phục. |
| **Khối Box bị lệch vị trí sau khi thay đổi độ phân giải màn hình** | Vị trí tọa độ X, Y được lưu cố định theo điểm kéo thả trước đó. | Rê chuột vào khối box > nhấn giữ nút 3 gạch ở góc trên để kéo thả khối về đúng vị trí cân đối mới. |
| **Đường nối đứt nét bị trùng lặp hoặc đè lên ghế** | Hai vị trí được đặt quá sát nhau trên cùng trục dọc. | Dùng chuột kéo nhẹ một trong hai ghế sang trái hoặc phải khoảng 20-30px để đường nối tự động bẻ góc đẹp mắt. |
| **Nội dung ghi chú dưới đáy khối Box bị tràn viền** | Nội dung văn bản quá dài so với chiều rộng hiện tại của khối. | Rê chuột vào góc dưới bên phải khối box > kéo mũi tên ra ngoài để mở rộng chiều rộng của khối; chữ sẽ tự động xuống dòng đều đặn. |

---

### 6. KẾ HOẠCH BÀN GIAO KỸ THUẬT & BẢO TRÌ

1. **Mã Nguồn & Phân Quyền Quản Trị**:
   - Kho mã nguồn GitHub: `https://github.com/crcsportsvn-boop/cbs-recruitment-web.git`
   - Nhánh vận hành chính thức: `main` (mỗi lượt push commit lên `main` sẽ tự động kích hoạt tiến trình xây dựng và phát hành phiên bản mới trên Vercel).
2. **Quy Trình Sao Lưu Dữ Liệu Định Kỳ**:
   - Khuyến nghị bộ phận HR sau mỗi kỳ duyệt sơ đồ định biên quý nên thực hiện thao tác **Xuất File Excel Đề Xuất** và bấm **Lưu Phương Án** để lưu trữ phiên bản snapshot phục vụ kiểm toán nhân sự.
3. **Đầu Mối Hỗ TrỢ Kỹ Thuật**:
   - Khi có nhu cầu tùy biến thêm cấu trúc phòng ban chuyên sâu hoặc nâng cấp tính năng mới, liên hệ đội ngũ kỹ sư hệ thống thông qua hệ thống quản lý công việc của doanh nghiệp.
