# 🏢 CBS Org Chart Studio (Frozen Feature Archive & Reactivation Guide)

Tài liệu lưu trữ toàn diện và đóng băng tính năng **CBS Org Chart Studio (Sơ đồ tổ chức & Đề xuất Định biên Headcount)** cho dự án `cbs-recruitment-web`.

---

## 📦 1. Danh Mục Mã Nguồn Đã Đóng Băng Độc Lập

Toàn bộ tính năng đã được quy hoạch thành một module độc lập, hoàn chỉnh, nằm trong 3 thư mục chính:

### 1.1. Giao diện & Tương tác Canvas (`components/org-chart/`)
* **`OrgChartStudio.tsx`**: Container chính quản lý State, Upload Excel, Modal cấu hình báo cáo, Xuất PDF/PNG/Draft.
* **`OrgCanvas.tsx`**: Canvas SVG vẽ đường nối bus độc lập, đường ma trận nét đứt, kéo thả vị trí và 4 cổng neo (anchors).
* **`OrgNodeCard.tsx`**: Thẻ ghế chuẩn 2 dòng title thẳng hàng, cờ SVG, nút ✏️ chỉnh sửa, nút thu gọn `[ +N ]`.
* **`CountryFlagSVG.tsx`**: Vector SVG thuần của cờ Việt Nam 🇻🇳, Thái Lan 🇹🇭, Malaysia 🇲🇾.
* **`ProposalToolbar.tsx`**: Toolbar 2 hàng điều khiển chế độ xem, nạp file, thêm proposal, xuất báo cáo.
* **`SharedSidebar.tsx`**: Hộp danh mục CBS VN Shared kéo thả tự do ở góc phải.
* **`SumUpWidget.tsx`**: Widget tổng hợp Headcount định biên.
* **`CustomNoteOverlay.tsx`**: Note ghi chú kéo thả trên canvas.

### 1.2. Thuật toán & Data Engine (`lib/org-chart/`)
* **`excel-parser.ts`**: Parser đọc trực tiếp sheet `Org_Chart_Raw` và `Org_Config` từ file Excel `.xlsm`.
* **`graph-builder.ts`**: Thuật toán bố cục tự động phân tầng nhỏ (tối đa 3 ghế/hàng con), cách ly nhánh sếp (Subtree Isolation), tính toán số ghế ẩn.
* **`export-service.ts`**: Service xuất PDF Vector A4 Landscape, PNG 300 DPI và file draft `.cbsorg`.
* **`default-config.ts`**: Cấu hình C-Suite Vùng, Leader ảo, Đường indirect mặc định.
* **`default-office-data.ts`**: Nạp sẵn **201 vị trí Head Office** và **16 Divisions**.

### 1.3. Khai báo kiểu dữ liệu (`types/org-chart.ts`)
* Định nghĩa toàn bộ kiểu dữ liệu chuẩn: `OrgNode`, `IndirectLink`, `DensityMode`, `ViewTemplate`, `HeadcountSummary`, `CustomDivider`, `CustomNote`, v.v.

### 1.4. Tài liệu & File Mẫu (`docs/`)
* **`docs/HOW_TO_REACTIVATE_ORG_CHART.md`**: Cẩm nang hướng dẫn kích hoạt lại và mở rộng sau này.
* **`docs/sample_org_proposal_template.cbsorg`**: File mẫu bản thảo đề xuất định biên để test mở nhanh.

---

## 🚀 2. Hướng Dẫn Kích Hoạt / Sử Dụng Lại Trong Tương Lai

Khi bạn muốn mang tính năng này ra sử dụng hoặc phát triển thêm:

### Cách 1: Sử dụng qua URL (Không cần code thêm gì cả)
Truy cập trực tiếp:
```
http://localhost:3000/?role=admin&tab=orgchart
```

### Cách 2: Nhúng vào bất kỳ trang hoặc Modal nào (1 dòng code)
```tsx
import OrgChartStudio from "@/components/org-chart/OrgChartStudio";

export default function MyPage() {
  return <OrgChartStudio lang="vi" user={currentUser} />;
}
```

### Cách 3: Tách thành một trang chuyên biệt `/org-chart`
Tạo file `app/org-chart/page.tsx`:
```tsx
import OrgChartStudio from "@/components/org-chart/OrgChartStudio";

export default function OrgChartPage() {
  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <OrgChartStudio lang="en" />
    </div>
  );
}
```

---

## 🌟 3. Danh Sách Tính Năng Đã Hoàn Thiện 100%

1. **Parser Excel Tự Động:**
   * Đọc trực tiếp sheet `Org_Chart_Raw` và `Org_Config` từ file `CBS_Org_Chart.xlsm`.
   * Tự động chuẩn hóa tên cột có chứa ký tự xuống dòng `\r\n` hoặc khoảng trắng.
   * Nhận diện đầy đủ **201 vị trí Head Office** và **16 Divisions**.

2. **Cây Phân Cấp Động & Phân Tầng Nhỏ Gọn (Multi-Row Wrapping):**
   * Thuật toán `Subtree Isolation` đóng khung từng nhánh sếp, trục bus ngang riêng biệt, không giao cắt sang nhóm khác.
   * Với các nhóm đông nhân viên (Marketing 16 người, Online 8 người...), hệ thống tự động bọc thành các tầng nhỏ **tối đa 3 ghế / hàng con**, chiều rộng thu nhỏ gọn từ 3.300px về ~800px.

3. **Thu Gọn / Mở Rộng Nhánh Cây (Collapsible Org Tree):**
   * Nút bấm `[ +N ]` ở đáy mỗi ghế hiển thị chính xác số ghế báo cáo cấp dưới.
   * Click để đóng/mở từng nhánh giúp trình chiếu báo cáo nhiều cấp độ linh hoạt.

4. **Neo 4 Điểm Trung Vị (4 Anchor Connection Ports):**
   * Chấm tròn ở 4 cạnh của mỗi thẻ ghế:
     * 🔵 **Top / Bottom:** Nối đường báo cáo trực tiếp (**Direct Report - Nét liền**).
     * 🟣 **Left / Right:** Nối đường báo cáo ma trận (**Matrix Indirect - Nét đứt**).

5. **Đồng Nhất Giao Diện Thẻ Ghế:**
   * Tiêu đề 2 dòng cố định (`min-h-[30px] line-clamp-2`), kích thước đồng nhất `185px × 72px`, baseline thẳng hàng 100%.
   * Nút Cây Bút (✏️) để chỉnh sửa có chủ đích, nhấp rê chuột để kéo thả vị trí thoải mái.

6. **Lá Cờ Quốc Gia Vector SVG:**
   * Vector SVG thuần 🇻🇳 🇹🇭 🇲🇾 sắc nét, hiển thị đồng bộ trên mọi thiết bị và giữ nguyên độ phân giải khi xuất PDF A4/PNG.

7. **Hộp CBS VN Shared:**
   * Ẩn ở View N-1 (vì đã có trên biểu đồ).
   * Xuất hiện ở View Division ở sát mép phải ngoài cùng, hỗ trợ kéo thả tự do.

8. **Bảng Tổng Hợp Headcount (Sum-up Widget):**
   * Tự động thống kê: *Tổng định biên, Hiện hữu, Vacant, New Hire BP, Replace*.

9. **Xuất Báo Cáo:**
   * Xuất file **PDF Vector A4 Landscape** chuẩn trình ký BOD.
   * Xuất ảnh **PNG Ultra-HD (300 DPI)** chèn slide PowerPoint.
   * Lưu trữ & mở lại bản thảo đề xuất dạng file **`.cbsorg` (JSON)**.

---

## 🎯 4. Checklist 6 Kịch Bản Thử Nghiệm Toàn Diện (Test Cases)

Khi cần mang tính năng này ra phát triển tiếp hoặc nâng cấp lên Production, bạn có thể thực hiện theo checklist này:

| STT | Kịch bản thử nghiệm | Mục tiêu kiểm tra | Cách thực hiện |
| :--- | :--- | :--- | :--- |
| **1** | **Upload dữ liệu kỳ mới** | Đọc dữ liệu `.xlsm` tự động không lỗi định dạng | Bấm nút **Upload Excel** $\rightarrow$ chọn file `CBS_Org_Chart.xlsm`. Xem thông báo xác nhận số ghế Head Office và danh sách Division. |
| **2** | **Thuyết trình theo cấp độ (BOD Meeting)** | Ẩn bớt cấp dưới, chỉ xem tầng Head/Manager | Bấm vào nút thu gọn `⌃` dưới ghế Manager để ẩn nhân viên (sẽ hiện huy hiệu `+16` hoặc `+8`). Bấm lại để mở bung ra. |
| **3** | **Đề xuất Tuyển mới / Thay thế (BP 2027)** | Mô phỏng định biên tuyển dụng | Bấm `+ Add Proposal` $\rightarrow$ chọn *New Hire BP* (Xanh) hoặc *Replace* (Đỏ) $\rightarrow$ chọn Sếp trực tiếp. Xem số liệu tự cập nhật trên bảng Sum-up. |
| **4** | **Nối Báo cáo Ma trận (Matrix Dotted)** | Vẽ quan hệ báo cáo gián tiếp | Rê chuột vào thẻ ghế $\rightarrow$ click vào cổng tròn tím ở **cạnh Trái hoặc Phải** $\rightarrow$ click vào ghế đích để tạo đường nét đứt. |
| **5** | **Xuất File Trình Ký** | Đảm bảo file in sắc nét chuẩn vector | Bấm **Export PDF (A4)** để lấy file PDF A4 ngang, hoặc **Export PNG (300 DPI)** để chèn vào Slide PowerPoint. |
| **6** | **Lưu Bản Thảo Đề Xuất** | Tiếp tục chỉnh sửa vào buổi sau | Bấm biểu tượng 💾 **Save Draft** để tải file `.cbsorg` về máy. Lần sau chỉ cần bấm **Open Draft** để khôi phục 100% vị trí đã chỉnh sửa. |

---

## 🧹 5. Quản Lý Môi Trường & Git Commit

* Toàn bộ mã nguồn Org Chart Studio đã được tổ chức khép kín, sạch sẽ, không có file thừa.
* Khi bạn thực hiện commit lên Git, các file mới sẽ được lưu trữ an toàn trong `components/org-chart/`, `lib/org-chart/`, `types/` và `docs/`.
