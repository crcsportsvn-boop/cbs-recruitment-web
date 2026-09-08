# BÁO CÁO TIẾN ĐỘ & NHẬT KÝ BÀN GIAO TÍNH NĂNG ORG CHART STUDIO
*Thời gian ghi nhận: 24/08/2026 18:03*

---

## 1. TỔNG QUAN CÔNG VIỆC ĐÃ HOÀN THÀNH

### A. Bóc tách & Chuẩn hóa Dữ liệu (100%)
- **Phân tích Sheet `Org_Chart_Raw`:** Lọc tự động `Group Office/Stores == 'Office'` (201 vị trí Head Office), loại trừ 704 nhân viên Store để không bị vỡ biểu đồ.
- **Tích hợp Sheet `Org_Config`:** Bóc tách toàn bộ 2 bảng do người dùng tạo:
  1. *Lãnh đạo Vùng & Ngoại vi (Virtual Leaders):* Damien, Alex, Andrew F., K Pavi, Penny, K Joyce, Joel, Nino, Hermann, K Ming, Thảo, v.v. kèm cờ quốc gia (🇲🇾 🇹🇭 🇻🇳 ⭐️).
  2. *Liên kết Báo cáo Gián tiếp (Indirect Reports):* Các liên kết nét đứt ma trận chức năng và báo cáo dịch vụ dùng chung under CEO.
- **Thuật toán Nickname Fallback:** Ưu tiên cột `Master_Data.Nick name`, nếu trống sẽ tự động lấy từ cuối của họ tên tiếng Việt (VD: *Cao Thị Hồng Vân* $\rightarrow$ *Vân*, *Nguyễn Doãn Thông* $\rightarrow$ *Thông*).

### B. Xây dựng Kiến trúc & Module Code
- **Cấu trúc Thư mục Module:**
  - [`types/org-chart.ts`](file:///c:/Users/ns20372840/.gemini/antigravity-ide/scratch/cbs-recruitment-web/types/org-chart.ts): Định nghĩa kiểu dữ liệu chuẩn (OrgNode, IndirectLink, CustomDivider, CustomNote, HeadcountSummary, OrgProposalState).
  - [`lib/org-chart/default-config.ts`](file:///c:/Users/ns20372840/.gemini/antigravity-ide/scratch/cbs-recruitment-web/lib/org-chart/default-config.ts): Chứa bộ cấu hình mặc định (fallback mapping).
  - [`lib/org-chart/excel-parser.ts`](file:///c:/Users/ns20372840/.gemini/antigravity-ide/scratch/cbs-recruitment-web/lib/org-chart/excel-parser.ts): Module đọc file Excel in-memory trên trình duyệt (chuẩn Vercel, không cần VPS backend, bảo mật tự hủy dữ liệu sau phiên làm việc).
  - [`lib/org-chart/graph-builder.ts`](file:///c:/Users/ns20372840/.gemini/antigravity-ide/scratch/cbs-recruitment-web/lib/org-chart/graph-builder.ts): Layout engine tính toán tọa độ cho các Template: *Organization N-1, Brand Footwear, Brand Dyson, Brand HOKA, HR CRV Shared, Custom Division*.
  - [`lib/org-chart/export-service.ts`](file:///c:/Users/ns20372840/.gemini/antigravity-ide/scratch/cbs-recruitment-web/lib/org-chart/export-service.ts): Bộ xuất file Vector PDF (chuẩn A4 Landscape trình ký BOD), ảnh Ultra-HD PNG 300 DPI và Save/Load bản nháp `.cbsorg`.
  - [`components/org-chart/`](file:///c:/Users/ns20372840/.gemini/antigravity-ide/scratch/cbs-recruitment-web/components/org-chart/):
    - `OrgNodeCard.tsx`: Card vị trí tương tác (đầy đủ các chế độ Full/Ghế only, Flags, trạng thái New Hire BP viền xanh, Replace chữ đỏ, Highlight vàng).
    - `OrgCanvas.tsx`: SVG Canvas vẽ đường nét liền/nét đứt, dividers, kéo thả vị trí, zoom in/out.
    - `ProposalToolbar.tsx`: Thanh công cụ chuyển template, upload excel, thêm vị trí proposal, thêm vạch ngăn cách, thêm ghi chú.
    - `SumUpWidget.tsx`: Widget thống kê Headcount (Định biên, Hiện hữu, Vacant, New Hire BP, Replace).
    - `SharedSidebar.tsx`: Sidebar cột CBS VN Shared bên phải.
    - `CustomNoteOverlay.tsx`: Khung ghi chú tùy biến có thể kéo thả.
    - `OrgChartStudio.tsx`: Container chính kết nối toàn bộ luồng dữ liệu.

### C. Đấu nối Web App & Môi trường Test
- Đã tích hợp Tab **"Sơ Đồ Tổ Chức (Org Chart)"** vào [`app/page.tsx`](file:///c:/Users/ns20372840/.gemini/antigravity-ide/scratch/cbs-recruitment-web/app/page.tsx) nằm ngay cạnh tab Báo Cáo.
- Phân quyền hiển thị đúng yêu cầu: Chỉ xuất hiện cho vai trò **HO_Recruiter** và **Manager / Admin**.
- Đã tích hợp nút **"⚡ Test Local (Bypass Login as Manager / HO)"** để bỏ qua Google OAuth khi test trên localhost.
- Server Next.js đang chạy trên cổng `http://localhost:3000`.

---

## 2. KẾ HOẠCH BƯỚC TIẾP THEO (NGÀY MAI)
1. Mở trình duyệt truy cập `http://localhost:3000/?tab=orgchart` để người dùng trực tiếp trải nghiệm kéo thả, đổi template, test xuất PDF/PNG.
2. Kiểm tra upload file Excel thực tế và tinh chỉnh thêm chi tiết thẩm mỹ nếu có yêu cầu mới.
3. Tiến hành commit và push lên Git / Vercel khi người dùng nghiệm thu thành công.
