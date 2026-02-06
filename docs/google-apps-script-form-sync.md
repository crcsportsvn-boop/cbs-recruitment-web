# Google Apps Script - Tự động sync Form Response sang Datapool Store

## 📋 Mục tiêu

Tự động chuyển dữ liệu từ 3 bảng câu hỏi Google Form sang sheet "CV Scan-Stores" khi có response mới.

## 🏗️ Cấu trúc

### Input (Form Response - 12 cột)

| Cột | Tên trường                             |
| --- | -------------------------------------- |
| A   | Dấu thời gian                          |
| B   | Vị trí bạn muốn ứng tuyển              |
| C   | Nhãn hàng bạn muốn ứng tuyển là gì     |
| D   | Họ và tên\*                            |
| E   | Giới tính                              |
| F   | Ngày tháng năm sinh                    |
| G   | Số điện thoại của bạn                  |
| H   | Địa chỉ email của bạn                  |
| I   | Địa chỉ hiện tại của Bạn\*             |
| J   | Kinh nghiệm làm việc                   |
| K   | CV của bạn (Ưu tiên có CV)             |
| L   | Bạn thấy thông tin tuyển dụng ở đâu?\* |

### Output (CV Scan-Stores - 38 cột)

| Cột | Tên trường                   | Mapping từ Form                      |
| --- | ---------------------------- | ------------------------------------ |
| A   | Điểm phù hợp                 | (để trống)                           |
| B   | Thời gian                    | Dấu thời gian                        |
| C   | Vị trí ứng tuyển             | Vị trí bạn muốn ứng tuyển            |
| D   | Source                       | Bạn thấy thông tin tuyển dụng ở đâu? |
| E   | Job code                     | (để trống)                           |
| F   | Position ID                  | (để trống)                           |
| G   | Họ và Tên                    | Họ và tên                            |
| H   | Năm sinh                     | Extract năm từ Ngày sinh             |
| I   | Giới tính                    | Giới tính                            |
| J   | Số điện thoại                | Số điện thoại của bạn                |
| K   | Email                        | Địa chỉ email của bạn                |
| L   | Nơi ở                        | Địa chỉ hiện tại của Bạn             |
| M   | Brand                        | Nhãn hàng bạn muốn ứng tuyển         |
| N   | TA User                      | Xác định từ sheet nguồn (User 1/2/3) |
| O   | Ngành tốt nghiệp             | (để trống)                           |
| P   | Năm tốt nghiệp               | (để trống)                           |
| Q   | Loại tốt nghiệp              | (để trống)                           |
| R   | Lịch sử làm việc             | Kinh nghiệm làm việc                 |
| S   | Task công việc               | (để trống)                           |
| T   | Kỹ năng                      | (để trống)                           |
| U   | Chứng chỉ                    | (để trống)                           |
| V   | Tóm tắt                      | (để trống)                           |
| W   | Sự phù hợp                   | (để trống)                           |
| X   | Link Hồ sơ                   | CV của bạn                           |
| Y   | TA duyệt nội dung            | (để trống)                           |
| Z   | Ghi chú                      | (để trống)                           |
| AA  | CV Tiềm năng                 | (để trống)                           |
| AB  | Kết quả                      | (để trống)                           |
| AC  | Lý do TD thất bại            | (để trống)                           |
| AD  | Kết quả bài Test / Screen CV | (để trống)                           |
| AE  | Ngày HR PV                   | (để trống)                           |
| AF  | Ngày PV vòng 1               | (để trống)                           |
| AG  | Ngày PV vòng 2               | (để trống)                           |
| AH  | Ngày gửi Offer               | (để trống)                           |
| AI  | Ngày bắt đầu                 | (để trống)                           |
| AJ  | Ngày chính thức              | (để trống)                           |
| AK  | Note                         | (để trống)                           |
| AL  | Vòng Rejected                | (để trống)                           |
| AM  | Thời gian apply              | Dấu thời gian                        |

---

## 🚀 Hướng dẫn từng bước

### Bước 1: Mở Google Apps Script

1. Mở Google Sheet chứa **CV Scan-Stores** (Datapool)
2. Vào menu **Extensions** → **Apps Script**
3. Xóa code mặc định và paste code bên dưới

### Bước 2: Paste Code Script

```javascript
/**
 * ============================================
 * FORM RESPONSE TO DATAPOOL SYNC SCRIPT
 * ============================================
 * Tự động chuyển dữ liệu từ Form Response sang CV Scan-Stores
 */

// ==================== CẤU HÌNH ====================

const CONFIG = {
  // ID của sheet Datapool (CV Scan-Stores)
  DATAPOOL_SPREADSHEET_ID: "YOUR_DATAPOOL_SPREADSHEET_ID", // Thay bằng ID thực
  DATAPOOL_SHEET_NAME: "CV Scan-Stores",

  // Danh sách Form Response Sheets (thêm/bớt theo nhu cầu)
  FORM_SHEETS: [
    {
      spreadsheetId: "1RYqeq81E1WO8ceipByIoTKqwI8M7JuKkaFC-HqPpeIo",
      sheetName: "Form Responses 1", // Tên sheet responses
      taUser: "User 1",
    },
    {
      spreadsheetId: "YOUR_FORM_SPREADSHEET_ID_2", // Thay bằng ID thực
      sheetName: "Form Responses 1",
      taUser: "User 2",
    },
    {
      spreadsheetId: "YOUR_FORM_SPREADSHEET_ID_3", // Thay bằng ID thực
      sheetName: "Form Responses 1",
      taUser: "User 3",
    },
  ],
};

// ==================== MAPPING COLUMNS ====================

/**
 * Map dữ liệu từ form response sang datapool row
 * @param {Array} formRow - Dữ liệu 1 dòng từ form response
 * @param {string} taUser - TA User (User 1, 2, 3)
 * @returns {Array} - Dữ liệu đã map cho datapool (38 cột)
 */
function mapFormToDatapool(formRow, taUser) {
  // Form columns (0-indexed)
  const timestamp = formRow[0] || ""; // A: Dấu thời gian
  const position = formRow[1] || ""; // B: Vị trí ứng tuyển
  const brand = formRow[2] || ""; // C: Nhãn hàng
  const fullName = formRow[3] || ""; // D: Họ và tên
  const gender = formRow[4] || ""; // E: Giới tính
  const birthDate = formRow[5] || ""; // F: Ngày sinh
  const phone = formRow[6] || ""; // G: Số điện thoại
  const email = formRow[7] || ""; // H: Email
  const address = formRow[8] || ""; // I: Địa chỉ
  const experience = formRow[9] || ""; // J: Kinh nghiệm
  const cvLink = formRow[10] || ""; // K: CV
  const source = formRow[11] || ""; // L: Nguồn tuyển dụng

  // Extract năm sinh từ ngày sinh (format: dd/mm/yyyy hoặc yyyy)
  const birthYear = extractYear(birthDate);

  // Tạo row cho datapool (38 cột: A -> AM)
  return [
    "", // A: Điểm phù hợp
    timestamp, // B: Thời gian
    position, // C: Vị trí ứng tuyển
    source, // D: Source
    "", // E: Job code
    "", // F: Position ID
    fullName, // G: Họ và Tên
    birthYear, // H: Năm sinh
    gender, // I: Giới tính
    phone, // J: Số điện thoại
    email, // K: Email
    address, // L: Nơi ở
    brand, // M: Brand
    taUser, // N: TA User
    "", // O: Ngành tốt nghiệp
    "", // P: Năm tốt nghiệp
    "", // Q: Loại tốt nghiệp
    experience, // R: Lịch sử làm việc
    "", // S: Task công việc
    "", // T: Kỹ năng
    "", // U: Chứng chỉ
    "", // V: Tóm tắt
    "", // W: Sự phù hợp
    cvLink, // X: Link Hồ sơ
    "", // Y: TA duyệt nội dung
    "", // Z: Ghi chú
    "", // AA: CV Tiềm năng
    "", // AB: Kết quả
    "", // AC: Lý do TD thất bại
    "", // AD: Kết quả bài Test / Screen CV
    "", // AE: Ngày HR PV
    "", // AF: Ngày PV vòng 1
    "", // AG: Ngày PV vòng 2
    "", // AH: Ngày gửi Offer
    "", // AI: Ngày bắt đầu
    "", // AJ: Ngày chính thức
    "", // AK: Note
    "", // AL: Vòng Rejected
    timestamp, // AM: Thời gian apply
  ];
}

/**
 * Extract năm từ ngày sinh
 * Hỗ trợ format: dd/mm/yyyy, mm/dd/yyyy, yyyy-mm-dd, hoặc chỉ năm
 */
function extractYear(dateStr) {
  if (!dateStr) return "";

  const str = dateStr.toString().trim();

  // Nếu là Date object
  if (dateStr instanceof Date) {
    return dateStr.getFullYear().toString();
  }

  // Thử parse các format phổ biến
  // Format: dd/mm/yyyy hoặc mm/dd/yyyy
  let match = str.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (match) {
    return match[3];
  }

  // Format: yyyy-mm-dd
  match = str.match(/(\d{4})-\d{1,2}-\d{1,2}/);
  if (match) {
    return match[1];
  }

  // Format: chỉ có 4 số (năm)
  match = str.match(/\d{4}/);
  if (match) {
    return match[0];
  }

  return str;
}

// ==================== TRIGGER HANDLERS ====================

/**
 * Hàm xử lý khi form được submit
 * Hàm này được gọi bởi onFormSubmit trigger
 */
function onFormSubmit(e) {
  try {
    const sheet = e.source.getActiveSheet();
    const spreadsheetId = e.source.getId();

    // Tìm config tương ứng với form này
    const formConfig = CONFIG.FORM_SHEETS.find(
      (f) => f.spreadsheetId === spreadsheetId,
    );

    if (!formConfig) {
      console.log("Form không được cấu hình: " + spreadsheetId);
      return;
    }

    // Lấy dữ liệu row mới
    const formRow = e.values;

    // Map và thêm vào datapool
    addToDatapool(formRow, formConfig.taUser);

    console.log("Đã sync thành công cho: " + formConfig.taUser);
  } catch (error) {
    console.error("Lỗi onFormSubmit: " + error.toString());
    // Có thể gửi email thông báo lỗi ở đây
  }
}

/**
 * Thêm dữ liệu vào sheet Datapool
 */
function addToDatapool(formRow, taUser) {
  // Mở sheet datapool
  const datapoolSS = SpreadsheetApp.openById(CONFIG.DATAPOOL_SPREADSHEET_ID);
  const datapoolSheet = datapoolSS.getSheetByName(CONFIG.DATAPOOL_SHEET_NAME);

  if (!datapoolSheet) {
    throw new Error("Không tìm thấy sheet: " + CONFIG.DATAPOOL_SHEET_NAME);
  }

  // Map dữ liệu
  const mappedRow = mapFormToDatapool(formRow, taUser);

  // Thêm vào hàng cuối
  datapoolSheet.appendRow(mappedRow);

  return true;
}

// ==================== MANUAL SYNC FUNCTIONS ====================

/**
 * Sync tất cả dữ liệu từ 1 form sheet (chạy thủ công)
 * Dùng khi muốn sync lại toàn bộ hoặc sync dữ liệu cũ
 */
function syncAllFromForm(formConfigIndex) {
  const formConfig = CONFIG.FORM_SHEETS[formConfigIndex];

  if (!formConfig) {
    throw new Error("Không tìm thấy form config index: " + formConfigIndex);
  }

  // Mở form spreadsheet
  const formSS = SpreadsheetApp.openById(formConfig.spreadsheetId);
  const formSheet = formSS.getSheetByName(formConfig.sheetName);

  if (!formSheet) {
    throw new Error("Không tìm thấy sheet: " + formConfig.sheetName);
  }

  // Lấy tất cả dữ liệu (bỏ header row)
  const data = formSheet.getDataRange().getValues();
  const rows = data.slice(1); // Bỏ header

  // Mở datapool
  const datapoolSS = SpreadsheetApp.openById(CONFIG.DATAPOOL_SPREADSHEET_ID);
  const datapoolSheet = datapoolSS.getSheetByName(CONFIG.DATAPOOL_SHEET_NAME);

  // Map và thêm từng row
  let count = 0;
  rows.forEach(function (row) {
    if (row[0]) {
      // Chỉ xử lý nếu có timestamp
      const mappedRow = mapFormToDatapool(row, formConfig.taUser);
      datapoolSheet.appendRow(mappedRow);
      count++;
    }
  });

  console.log("Đã sync " + count + " rows từ " + formConfig.taUser);
  SpreadsheetApp.getUi().alert(
    "Đã sync " + count + " rows từ " + formConfig.taUser,
  );
}

/**
 * Sync từ Form 1 (User 1)
 */
function syncFromForm1() {
  syncAllFromForm(0);
}

/**
 * Sync từ Form 2 (User 2)
 */
function syncFromForm2() {
  syncAllFromForm(1);
}

/**
 * Sync từ Form 3 (User 3)
 */
function syncFromForm3() {
  syncAllFromForm(2);
}

/**
 * Sync từ tất cả Forms
 */
function syncFromAllForms() {
  for (let i = 0; i < CONFIG.FORM_SHEETS.length; i++) {
    try {
      syncAllFromForm(i);
    } catch (error) {
      console.error("Lỗi sync form " + i + ": " + error.toString());
    }
  }
}

// ==================== SETUP FUNCTIONS ====================

/**
 * Tạo menu custom trong Google Sheets
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("📊 Form Sync")
    .addItem("Sync từ Form 1 (User 1)", "syncFromForm1")
    .addItem("Sync từ Form 2 (User 2)", "syncFromForm2")
    .addItem("Sync từ Form 3 (User 3)", "syncFromForm3")
    .addSeparator()
    .addItem("Sync tất cả Forms", "syncFromAllForms")
    .addSeparator()
    .addItem("Cài đặt Trigger tự động", "setupTriggers")
    .addItem("Xóa tất cả Triggers", "removeAllTriggers")
    .addToUi();
}

/**
 * Cài đặt trigger tự động cho các form
 * QUAN TRỌNG: Chạy hàm này 1 lần để setup trigger
 */
function setupTriggers() {
  // Xóa triggers cũ trước
  removeAllTriggers();

  // Tạo trigger cho mỗi form spreadsheet
  CONFIG.FORM_SHEETS.forEach(function (formConfig, index) {
    try {
      const formSS = SpreadsheetApp.openById(formConfig.spreadsheetId);

      ScriptApp.newTrigger("onFormSubmit")
        .forSpreadsheet(formSS)
        .onFormSubmit()
        .create();

      console.log("Đã tạo trigger cho Form " + (index + 1));
    } catch (error) {
      console.error(
        "Lỗi tạo trigger cho Form " + (index + 1) + ": " + error.toString(),
      );
    }
  });

  SpreadsheetApp.getUi().alert(
    "Đã cài đặt triggers cho " + CONFIG.FORM_SHEETS.length + " forms!",
  );
}

/**
 * Xóa tất cả triggers
 */
function removeAllTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function (trigger) {
    ScriptApp.deleteTrigger(trigger);
  });
  console.log("Đã xóa " + triggers.length + " triggers");
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Test mapping với dữ liệu mẫu
 */
function testMapping() {
  const sampleRow = [
    "03/02/2026 9:23:23", // Timestamp
    "Nhân viên bán hàng - Sales Advisor", // Position
    "Supersports", // Brand
    "Nguyễn Văn A", // Name
    "Nam", // Gender
    "25/02/1995", // Birth date
    "0935123123", // Phone
    "test@gmail.com", // Email
    "Quận 1, TP.HCM", // Address
    "Đã làm việc 2 năm tại ABC", // Experience
    "https://drive.google.com/cv.pdf", // CV
    "Group Facebook", // Source
  ];

  const result = mapFormToDatapool(sampleRow, "User 1");

  console.log("=== KẾT QUẢ MAPPING ===");
  console.log("Số cột: " + result.length);
  console.log("Thời gian (B): " + result[1]);
  console.log("Vị trí (C): " + result[2]);
  console.log("Source (D): " + result[3]);
  console.log("Họ tên (G): " + result[6]);
  console.log("Năm sinh (H): " + result[7]);
  console.log("Giới tính (I): " + result[8]);
  console.log("SĐT (J): " + result[9]);
  console.log("Email (K): " + result[10]);
  console.log("Nơi ở (L): " + result[11]);
  console.log("Brand (M): " + result[12]);
  console.log("TA User (N): " + result[13]);
  console.log("Kinh nghiệm (R): " + result[17]);
  console.log("Link CV (X): " + result[23]);
  console.log("Thời gian apply (AM): " + result[38]);

  return result;
}

/**
 * Kiểm tra kết nối đến các spreadsheets
 */
function testConnections() {
  const ui = SpreadsheetApp.getUi();
  let results = [];

  // Test datapool
  try {
    const datapoolSS = SpreadsheetApp.openById(CONFIG.DATAPOOL_SPREADSHEET_ID);
    const sheet = datapoolSS.getSheetByName(CONFIG.DATAPOOL_SHEET_NAME);
    results.push("✅ Datapool: OK - " + datapoolSS.getName());
  } catch (e) {
    results.push("❌ Datapool: FAILED - " + e.toString());
  }

  // Test forms
  CONFIG.FORM_SHEETS.forEach(function (formConfig, index) {
    try {
      const formSS = SpreadsheetApp.openById(formConfig.spreadsheetId);
      const sheet = formSS.getSheetByName(formConfig.sheetName);
      results.push(
        "✅ Form " +
          (index + 1) +
          " (" +
          formConfig.taUser +
          "): OK - " +
          formSS.getName(),
      );
    } catch (e) {
      results.push(
        "❌ Form " +
          (index + 1) +
          " (" +
          formConfig.taUser +
          "): FAILED - " +
          e.toString(),
      );
    }
  });

  ui.alert("Kết quả kiểm tra:\n\n" + results.join("\n"));
}
```

### Bước 3: Cấu hình Script

1. **Thay thế các ID trong CONFIG:**
   - `DATAPOOL_SPREADSHEET_ID`: ID của sheet CV Scan-Stores
   - `spreadsheetId` cho mỗi form: ID của Google Sheet chứa form responses

2. **Lấy Spreadsheet ID:**
   - Từ URL: `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit#gid=...`
   - ID là phần nằm giữa `/d/` và `/edit`

### Bước 4: Chạy Setup

1. Lưu script (Ctrl + S)
2. Chạy hàm `testConnections` để kiểm tra kết nối
3. Cấp quyền khi được yêu cầu
4. Chạy hàm `setupTriggers` để tự động tạo trigger

### Bước 5: Test

1. Chạy `testMapping` để kiểm tra mapping
2. Submit 1 form test
3. Kiểm tra xem dữ liệu có xuất hiện trong CV Scan-Stores không

---

## ⚠️ Lưu ý quan trọng

1. **Quyền truy cập:**
   - Script cần có quyền đọc Form Response sheets
   - Script cần có quyền ghi vào Datapool sheet

2. **Trigger:**
   - Mỗi lần chạy `setupTriggers` sẽ xóa triggers cũ và tạo mới
   - Có thể kiểm tra triggers tại: Extensions → Apps Script → Triggers (biểu tượng đồng hồ)

3. **Lỗi thường gặp:**
   - "You do not have permission": Cần share sheet với account đang chạy script
   - "Sheet not found": Kiểm tra lại tên sheet trong CONFIG

---

## 🔄 Chạy Manual Sync

Nếu cần sync lại dữ liệu cũ hoặc sync thủ công:

1. Mở sheet Datapool
2. Menu **📊 Form Sync** sẽ xuất hiện
3. Chọn sync từng form hoặc sync tất cả

---

## 📝 Custom Fields (Mở rộng)

Nếu cần thêm logic xử lý:

### Thêm Job Code tự động theo Brand

```javascript
function getJobCodeByBrand(brand) {
  const brandCodes = {
    'Supersports': 'SS',
    'Nike': 'NK',
    'Adidas': 'AD'
    // Thêm brand khác
  };
  return brandCodes[brand] || '';
}

// Trong mapFormToDatapool(), thay dòng Job code:
// '',  // E: Job code
// thành:
getJobCodeByBrand(brand),  // E: Job code
```

### Thêm Position ID theo Position

```javascript
function getPositionId(position) {
  const positionIds = {
    "Nhân viên bán hàng - Sales Advisor": "SA-001",
    "Quản lý cửa hàng - Store Manager": "SM-001",
    // Thêm position khác
  };
  return positionIds[position] || "";
}
```
