# BÁO CÁO TIẾN ĐỘ & TÀI LIỆU KỸ THUẬT: TÍNH NĂNG ORG CHART STUDIO

> **Trạng thái tính năng:** Đang hoàn thiện phần lõi (In Progress) — **ĐÃ ẨN KHỎI GIAO DIỆN (CHƯA DEPLOY)**  
> **Cập nhật lần cuối:** 09/09/2026  
> **Phạm vi áp dụng:** CBS Recruitment Portal (`cbs-recruitment-web`)

---

## 1. Mục tiêu & Bối cảnh

Tính năng **Org Chart Studio** được thiết kế nhằm phục vụ quản lý và lập kế hoạch tổ chức cho Head Office CBS (Central Retail Vietnam):
- **Quy mô dữ liệu:** 201 vị trí Head Office, 16 Divisions (Brand & Supporting Functions).
- **Nguồn dữ liệu thực tế:** File `CBS_Org_Chart.xlsm` (các sheet `Position_Master`, `Org_Config`, `Headcount_Summary`).
- **Mục tiêu cốt lõi:**
  1. Loại bỏ layout cứng (hardcode N-1); chuyển sang **Dynamic Tree Engine** linh hoạt dựa trên `Reports To Position ID` và quan hệ báo cáo ma trận.
  2. Hiển thị Auto-Fit 100%: Mở ra là nhìn thấy trọn vẹn toàn bộ sơ đồ trong một khung nhìn, không phải cuộn ngang liên tục.
  3. Thao tác mượt mà: Di chuyển canvas tự do bằng **Space + Kéo chuột (Space + Drag to Pan)**, phóng to/thu nhỏ, kéo thả node phân cấp.
  4. Ẩn tính năng khi chưa có yêu cầu deploy chính thức.

---

## 2. Nhật ký công việc đã thực hiện (Changelog)

### A. Core Data & Parser Engine
1. **Seed Data Head Office (`lib/org-chart/default-office-data.ts`):**
   - Đã cập nhật và chuẩn hóa toàn bộ 201 ghế Head Office với đầy đủ Position ID, Title, Department, Division, Job Level, Incumbent, Vacant status.
   - Thiết lập cấu trúc phân chia 16 Division chuẩn xác theo dữ liệu thực tế.

2. **Excel Parser Nâng cao (`lib/org-chart/excel-parser.ts`):**
   - Bổ sung hàm `resolveNodeIdentifier`: dùng Regular Expression để chuẩn hóa chuỗi From/To trong sheet `Org_Config` (ví dụ `"THL_CAT_FASHION (K Joyce)"` -> tự động map về Position ID thực tế tương ứng).

3. **Dynamic Graph Layout Engine (`lib/org-chart/graph-builder.ts`):**
   - **`buildDynamicN1Layout`:** Tự động phát hiện vị trí President (đỉnh), tự động phân nhóm các Brand Heads và Supporting Function Heads, tạo các cột dọc gọn gàng và vẽ đường nét đứt biểu diễn ma trận báo cáo kép.
   - **`buildDynamicDivisionTree`:** Xây dựng cây phân cấp đệ quy cho từng Division. Kích thước thẻ co giãn thích ứng (division nhỏ dùng 185×72px, division lớn dùng 160×66px), phân nhánh nhiều hàng (multi-row wrap: 3-4 node/hàng) giúp cây không bị bè ngang quá mức.
   - **LOẠI BỎ logic `externalSupervisor` ("Sếp Báo Cáo Trực Tiếp"):** 
     - *Nguyên nhân phát hiện:* Logic cũ tự sinh ra node giả `sup_${parent.id}` với tọa độ lệch chuẩn, dẫn đến các đường kết nối bị gãy khúc/đứt lìa.
     - *Giải pháp:* Đã loại bỏ hoàn toàn thẻ Sếp ngoại bộ. Sử dụng hàm lọc `cleanedNodes` tách đứt các `reportsToId` liên phòng ban để các vị trí đầu tàu trong Division trở thành các Root Nodes thực sự, các đường kết nối luôn liên tục và chính xác.

---

### B. Canvas & Tương tác UI/UX
4. **Không gian vẽ OrgCanvas (`components/org-chart/OrgCanvas.tsx`):**
   - **Tự động Co vừa màn hình (Auto-Fit 100%):** Dùng `ResizeObserver` đo đạc kích thước vùng vẽ và bounding box của cây, tự tính toán tỷ lệ zoom tối ưu (`fitZoom` từ 0.25 đến 1.0).
   - **Space + Drag to Pan:** Cho phép người dùng nhấn giữ phím cách (`Space`) và kéo chuột để di chuyển vùng nhìn linh hoạt, kèm con trỏ chuột `grab`/`grabbing` và hướng dẫn trực quan trên thanh điều khiển.
   - **Kéo thả phân cấp (Hierarchical Drag):** Khi di chuyển một node cha, toàn bộ cây con bên dưới sẽ di chuyển đồng bộ theo tỷ lệ tương ứng.
   - **Xử lý sự kiện cấp container:** Đưa mouse handlers (`mousedown`, `mousemove`, `mouseup`) ra outer div để thao tác kéo mượt, không bị khựng khi con trỏ lọt ra ngoài node.

5. **Thẻ vị trí OrgNodeCard (`components/org-chart/OrgNodeCard.tsx`):**
   - Bổ sung `overflow-hidden` và cơ chế CSS `-webkit-line-clamp: 2` cùng `break-words` để đảm bảo text chức danh dài không bị tràn ra khỏi khung thẻ.
   - Đồng bộ hiển thị trạng thái ghế trống `(Vacant)` và tên nhân sự rõ ràng.

6. **Studio Quản lý Kế hoạch (`components/org-chart/OrgChartStudio.tsx`):**
   - Khi thêm mới hoặc đề xuất ghế (Proposal), hệ thống tự động tính toán lại tọa độ qua Dynamic Layout Engine thay vì gán tọa độ cứng.

---

### C. Cơ chế kiểm thử cục bộ & Quản lý Deploy (Feature Flag)
7. **Cơ chế SSR Dev Bypass (`app/page.tsx`):**
   - Đã xử lý lỗi hydration vô hạn (treo ở màn hình "Verifying credentials...") khi test trên localhost: Sử dụng cờ `mounted` kết hợp phát hiện hostname client-side để cấp quyền dev lập tức, không phụ thuộc vào endpoint Google Auth ngoài mạng nội bộ.

8. **Cơ chế ẩn tính năng an toàn (`app/page.tsx`):**
   - Bổ sung biến môi trường kiểm soát:
     ```typescript
     const ENABLE_ORG_CHART = process.env.NEXT_PUBLIC_ENABLE_ORG_CHART === "true";
     ```
   - Cả thẻ tab `<TabsTrigger value="orgchart">` và nội dung `<TabsContent value="orgchart">` đều được bọc trong điều kiện `ENABLE_ORG_CHART`.
   - **Mặc định:** Tab Org Chart **hoàn toàn ẩn** trên môi trường Production/Deploy cho đến khi có yêu cầu chính thức.

---

## 3. Danh sách các file đã chỉnh sửa

| Tệp tin | Vai trò / Nội dung thay đổi |
| :--- | :--- |
| `app/page.tsx` | Thêm cờ `ENABLE_ORG_CHART` ẩn tính năng, sửa lỗi SSR Dev Bypass |
| `components/org-chart/OrgCanvas.tsx` | Thêm Space+Drag pan, Auto-Fit Zoom, quản lý sự kiện kéo thả |
| `components/org-chart/OrgNodeCard.tsx` | Khắc phục tràn chữ (text-overflow, line-clamp), định dạng thẻ |
| `components/org-chart/OrgChartStudio.tsx` | Tích hợp thêm proposal vào dynamic layout |
| `lib/org-chart/graph-builder.ts` | Dynamic N-1 & Division layout; bỏ external supervisor fix đứt đường nối |
| `lib/org-chart/default-office-data.ts` | Bộ dữ liệu gốc 201 ghế Head Office thực tế |
| `lib/org-chart/excel-parser.ts` | Regex parser map quan hệ phòng ban từ sheet Org_Config |
| `types/org-chart.ts` | Khai báo các thuộc tính layout: `nodeWidth`, `nodeHeight`, `fitZoom` |

---

## 4. Hướng dẫn làm tiếp cho phiên sau (Next Steps & Checklist)

Khi bạn muốn tiếp tục phát triển tính năng này trong các phiên tới:

### Bước 1: Kích hoạt lại tính năng trên môi trường Dev
Để hiển thị lại tab Org Chart khi test cục bộ, có 2 cách:
1. **Cách 1 (Khuyên dùng khi dev):** Thêm vào file `.env.local`:
   ```bash
   NEXT_PUBLIC_ENABLE_ORG_CHART=true
   ```
2. **Cách 2 (Code trực tiếp):** Trong `app/page.tsx`, tạm thời sửa:
   ```typescript
   const ENABLE_ORG_CHART = true; // hoặc process.env.NODE_ENV === 'development';
   ```

### Bước 2: Kiểm chứng và tinh chỉnh các tồn đọng UI/UX
- [ ] **Kiểm tra độ vừa vặn của chữ trên thẻ (Text Fit):** Thử nghiệm với các vị trí có chức danh dài (như *"Senior Wholesale Executive"*, *"Financial Planning & Analysis Manager"*) trên độ phân giải màn hình khác nhau để đảm bảo không bị đè lên nhãn `(Vacant)`.
- [ ] **Kiểm tra đường nối toàn diện trên 16 Division:** Lần lượt chọn từng Division trong dropdown để đảm bảo tất cả các nhánh con đều có đường bus-tree nối liền mạch từ node cấp trên.
- [ ] **Thử nghiệm tải file Excel mới:** Dùng nút Upload Excel trên giao diện, nạp file `C:\Users\ns20372840\Desktop\CBS_Org_Chart.xlsm` để kiểm chứng bộ parser tự động.

### Bước 3: Chuẩn bị khi được yêu cầu Deploy chính thức
1. Bật biến `NEXT_PUBLIC_ENABLE_ORG_CHART=true` trong cài đặt môi trường của máy chủ hoặc cấu hình build Vercel/CI-CD.
2. Chạy `npm run build` để kiểm tra biên dịch không có lỗi cú pháp.
3. Commit toàn bộ thay đổi với thông điệp rõ ràng:
   ```bash
   git add app/page.tsx components/org-chart/ lib/org-chart/ types/org-chart.ts ORG_CHART_DEV_LOG.md
   git commit -m "feat(org-chart): implement dynamic layout engine, fit zoom, space-drag pan, and deploy feature flag"
   ```
