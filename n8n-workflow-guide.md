# 🔧 Hướng dẫn sửa N8N Workflow - Parse từ tên file

## ✅ ĐÃ HOÀN THÀNH - Web App tự động đổi tên file

**Tính năng mới:**

- ✅ Khi user upload file qua tab Input, web app **TỰ ĐỘNG** đổi tên file theo format chuẩn
- ✅ File được upload lên Drive đã có đầy đủ metadata trong tên
- ✅ Bao gồm: Ngày, Vị trí, Job Code, Position ID, **Nguồn tuyển dụng**, Tên file gốc

---

## 📋 Format tên file mới (Tự động từ Web App)

```
[Ngày] - [Vị trí] (JobCode_PositionID) - [Nguồn] - [Tên file gốc].pdf
```

**Ví dụ thực tế:**

```
28/01/2025 - Marketing Executive (MKT_001) - CareerViet - CV_NguyenVanA.pdf
28/01/2025 - Sales Manager (SALES_HCM_002) - LinkedIn - Resume_TranThiB.pdf
28/01/2025 - Accountant (ACC_003) - Web App - HoSo_LeVanC.pdf
```

**Các thành phần:**

- `28/01/2025` - Ngày upload (tự động lấy từ hệ thống)
- `Marketing Executive` - Tên vị trí (user chọn từ dropdown hoặc nhập)
- `(MKT_001)` - Job Code và Position ID (tự động parse từ dropdown)
- `CareerViet` - **Nguồn tuyển dụng** (user chọn: CareerViet, LinkedIn, Web App, etc.)
- `CV_NguyenVanA.pdf` - Tên file gốc user upload

---

## 🛠️ Các bước sửa N8N Workflow

### **Bước 1: Xóa/Vô hiệu hóa node "Vị trí cần tuyển"**

Node này hiện đang đọc Google Sheet. Bạn có 2 lựa chọn:

**Option A: Xóa hoàn toàn** (Khuyến nghị)

- Click vào node "Vị trí cần tuyển"
- Nhấn `Delete`
- Xóa connection từ node "Tìm file1" → "Vị trí cần tuyển"

**Option B: Vô hiệu hóa** (Giữ lại để backup)

- Click vào node "Vị trí cần tuyển"
- Chọn "Disable"
- Ngắt kết nối với node "Code"

---

### **Bước 2: Sửa node "Code" (Parse từ tên file)**

**Vị trí:** Node ID `c29a8c0b-2833-4cee-b7dc-8ef4f583043e`

**Code mới (Đã cập nhật với Nguồn tuyển dụng):**

```javascript
// Lấy tất cả items từ node "Tìm file"
const items = $("Tìm file").all();

// Kiểm tra xem có dữ liệu không
if (!items || items.length === 0) {
  return [{ json: { error: "Không có file nào trong folder" } }];
}

// Lấy item cuối cùng (file mới nhất)
const lastItem = items[items.length - 1];
const fileName = lastItem.json.name || "";

// === REGEX PARSE TÊN FILE MỚI ===
// Format: [Ngày] - [Vị trí] (JobCode_PositionID) - [Nguồn] - [Tên file gốc].pdf
const regex =
  /^(.+?)\s*-\s*(.+?)\s*\(([^_]+)_([^)]+)\)\s*-\s*(.+?)\s*-\s*(.+?)\.pdf$/i;
const match = fileName.match(regex);

if (!match) {
  // Fallback: Thử format cũ (không có Nguồn)
  const oldRegex =
    /^(.+?)\s*-\s*(.+?)\s*\(([^_]+)_([^)]+)\)\s*-\s*(.+?)\.pdf$/i;
  const oldMatch = fileName.match(oldRegex);

  if (oldMatch) {
    const [, dateStr, position, jobCode, positionId, candidateName] = oldMatch;
    return [
      {
        json: {
          col_1: dateStr.trim(),
          col_2: position.trim(),
          col_3: "Drive", // Default source
          job_code: jobCode.trim(),
          position_id: positionId.trim(),
          fullname: candidateName.trim(),
          original_filename: fileName,
        },
      },
    ];
  }

  // Nếu không match cả 2 format
  return [
    {
      json: {
        error: `Tên file không đúng format: ${fileName}`,
        col_1: new Date().toLocaleDateString("en-GB"),
        col_2: "Unknown Position",
        col_3: "Drive",
      },
    },
  ];
}

// Trích xuất thông tin từ format MỚI
const [, dateStr, position, jobCode, positionId, source, originalFilename] =
  match;

return [
  {
    json: {
      col_1: dateStr.trim(), // Ngày tháng
      col_2: position.trim(), // Vị trí
      col_3: source.trim(), // Nguồn tuyển dụng (MỚI)
      job_code: jobCode.trim(), // Job Code
      position_id: positionId.trim(), // Position ID
      fullname: originalFilename.replace(/\.(pdf|doc|docx)$/i, "").trim(), // Tên từ file gốc
      original_filename: fileName,
    },
  },
];
```

---

### **Bước 3: Sửa node "Profile Wanted"**

**Vị trí:** Node ID `8a4ead76-4c2f-4bed-afce-0805dcf1fc7a`

**Code mới (GIỮ NGUYÊN - đã tương thích):**

```javascript
// Lấy data từ node "Code" (đã parse tên file)
const input = $json;

return [
  {
    json: {
      profile_wanted: input.col_2 || "Unknown Position",
      time_create: input.col_1 || new Date().toLocaleDateString("en-GB"),
      source: input.col_3 || "Drive",
      job_code: input.job_code || "",
      position_id: input.position_id || "",
      fullname: input.fullname || "Candidate",
    },
  },
];
```

---

### **Bước 4: Cập nhật kết nối**

**Hiện tại:**

```
Tìm file1 → Vị trí cần tuyển → Code → Profile Wanted
```

**Sau khi sửa:**

```
Tìm file1 → Code → Profile Wanted → Tìm file
```

**Các bước:**

1. Xóa connection: `Vị trí cần tuyển` → `Code`
2. Tạo connection mới: `Tìm file1` → `Code`
3. Giữ nguyên: `Code` → `Profile Wanted`

---

## 🔍 Kiểm tra luồng Gmail (Đảm bảo không bị conflict)

Node **"3. CV Parser (Split & Fix Name)"** (ID: `8658b04f-4b6e-4ad3-8d34-48d11c1c47e5`) đã xử lý tốt việc parse từ Subject email:

```javascript
// Đoạn code hiện tại (GIỮ NGUYÊN - không cần sửa)
const codeRegex = /\(([^_]+)_([^)]+)\)/;
const codeMatch = subject.match(codeRegex);

if (codeMatch) {
  jobCode = codeMatch[1].trim();
  positionId = codeMatch[2].trim();
}
```

**✅ Luồng Gmail vẫn hoạt động bình thường vì:**

- Parse từ Subject email (không dùng Google Sheet)
- Không conflict với luồng Drive mới

---

## 📝 Hướng dẫn sử dụng cho User (Web App)

### **Khi upload file qua tab Input:**

1. **Chọn Nguồn tuyển dụng** (Dropdown):
   - CareerViet
   - LinkedIn
   - Facebook
   - Referral
   - Web App
   - Khác

2. **Chọn/Nhập Vị trí tuyển dụng**:
   - Chọn từ dropdown (tự động điền Job Code & Position ID)
   - Hoặc nhập thủ công theo format: `Position Name (JobCode_PositionID)`

3. **Upload file CV**:
   - Hỗ trợ: PDF, DOC, DOCX, JPG, PNG
   - Có thể upload nhiều file cùng lúc

4. **Nhấn Submit**:
   - Web app tự động đổi tên file theo format chuẩn
   - Upload lên Drive folder `CV-Extract-Automation`
   - N8N workflow tự động xử lý

### **Ví dụ quy trình:**

**Input từ user:**

- Source: `CareerViet`
- Job Title: `Marketing Executive (MKT_001)`
- File upload: `NguyenVanA_CV.pdf`

**File trên Drive sau khi upload:**

```
28/01/2025 - Marketing Executive (MKT_001) - CareerViet - NguyenVanA_CV.pdf
```

**N8N workflow sẽ parse:**

- Ngày: `28/01/2025`
- Vị trí: `Marketing Executive`
- Job Code: `MKT`
- Position ID: `001`
- Nguồn: `CareerViet`
- Tên ứng viên: `NguyenVanA_CV`

---

## 📊 So sánh Before/After

| Tiêu chí             | Before (Google Sheet)        | After (Filename)                        |
| -------------------- | ---------------------------- | --------------------------------------- |
| **Tốc độ**           | Phải đọc Sheet mỗi lần       | Parse trực tiếp từ tên file             |
| **Độ chính xác**     | Phụ thuộc vào cập nhật Sheet | 100% từ tên file                        |
| **Bảo trì**          | Phải sync Sheet thủ công     | Không cần bảo trì                       |
| **Lỗi**              | Nếu Sheet sai → Toàn bộ sai  | Chỉ file nào sai format thì file đó lỗi |
| **Scalability**      | Giới hạn bởi Sheet API quota | Không giới hạn                          |
| **Nguồn tuyển dụng** | ❌ Không có                  | ✅ Có trong tên file                    |
| **User Experience**  | Phải nhập thủ công           | ✅ Tự động từ web app                   |

---

## ⚠️ Lưu ý quan trọng

### **1. Backup trước khi sửa**

- Export workflow hiện tại (JSON)
- Lưu lại Google Sheet "Vị trí cần tuyển" (nếu cần rollback)

### **2. Test từng bước**

1. Test upload file qua web app
2. Kiểm tra tên file trên Drive có đúng format không
3. Test node "Code" với file mẫu
4. Kiểm tra output có đúng format không
5. Test toàn bộ workflow với file thật

### **3. Xử lý lỗi**

- Nếu tên file sai format → Workflow vẫn chạy nhưng ghi log
- Có thể thêm node "Send Email Alert" khi phát hiện lỗi

### **4. Migration Plan**

- ✅ Web app đã tự động đổi tên file
- Giữ lại Google Sheet 1-2 tuần để đảm bảo
- Chạy song song 2 phương pháp (Sheet + Filename)
- Sau khi ổn định → Xóa hoàn toàn node Sheet

---

## 🎯 Checklist triển khai

- [ ] Backup workflow hiện tại
- [ ] Sửa node "Code" với regex mới
- [ ] Test với 1 file upload từ web app
- [ ] Kiểm tra parse đúng: Ngày, Vị trí, Job Code, Position ID, **Nguồn**
- [ ] Test luồng Gmail vẫn hoạt động
- [ ] Deploy production
- [ ] Monitor 1-2 ngày
- [ ] Xóa node "Vị trí cần tuyển" nếu ổn định

---

## 🚀 Tính năng đã hoàn thành

✅ **Web App tự động đổi tên file** khi upload  
✅ **Bao gồm đầy đủ metadata**: Ngày, Vị trí, Job Code, Position ID, Nguồn  
✅ **N8N workflow parse từ tên file** thay vì Google Sheet  
✅ **Không conflict với luồng Gmail**  
✅ **Hỗ trợ fallback** cho format cũ

---

## 💡 Next Steps

1. **Triển khai N8N workflow** theo hướng dẫn trên
2. **Test với file thật** từ web app
3. **Monitor kết quả** trong 1-2 ngày
4. **Xóa Google Sheet node** sau khi ổn định

**Cần tôi giúp implement các bước cụ thể không?** 🚀
