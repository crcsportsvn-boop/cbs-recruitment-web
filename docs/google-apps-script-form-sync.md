# Google Apps Script - Tự động sync Form Response sang Datapool Store

## 📋 Mục tiêu

Tự động chuyển dữ liệu từ bảng câu hỏi Google Form sang sheet "CV Scan-Stores" khi có response mới.

## 🏗️ Cấu trúc

### Input (Form Response - 17 cột)

| Cột | Tên trường |
| --- | --- |
| A | Dấu thời gian |
| B | Vị trí bạn muốn ứng tuyển |
| C | Nhãn hàng bạn muốn ứng tuyển là gì |
| D | Khu vực ứng tuyển: |
| E | Địa chỉ cụ thể (Theo VNeID) |
| F | Họ và tên (Ghi rõ có dấu, ví dụ: Nguyễn Văn A) |
| G | Giới tính |
| H | Ngày tháng năm sinh |
| I | Số điện thoại (Có dấu phẩy trước số 0, ví dụ: '0784467356) |
| J | Địa chỉ Email |
| K | Kinh nghiệm làm việc (Ghi cụ thể. Nếu chưa có kinh nghiệm, điền "Không") |
| L | Bạn thấy thông tin tuyển dụng ở đâu? |
| M | CV của bạn (Ưu tiên có CV) |
| N | PIC (Lưu ý: Nếu cập nhật sau, trigger onFormSubmit sẽ lấy giá trị rỗng. Nên dùng Manual Sync) |
| O | Store Interview |
| P | Lịch interview |
| Q | Status |

> **💡 Trả lời câu hỏi: Khi user input (cho cột N, O, P, Q) thì trả về đâu trong file đích?**
> - **Cột N (PIC)**: Sẽ ghi đè vào cột **N (TA User)** trên bảng CV Scan-Stores.
> - **Cột O (Store Interview)**: Sẽ map vào cột **Z (Ghi chú)**.
> - **Cột P (Lịch interview)**: Sẽ map vào cột **AF (Ngày PV vòng 1)**.
> - **Cột Q (Status)**: Sẽ map vào cột **AB (Kết quả)**.
> - **Lưu ý quan trọng**: Do các cột N, O, P, Q được điền LẠI SAU trên form excel (nghĩa là không điền vào form lúc gửi lần đầu), hàm `onFormSubmit` sẽ chụp lấy các cột này là ô trống ngay khi thí sinh nhấn Gửi Form. Để cập nhật được dữ liệu này vào Datapool sau khi có người điền tay vào cột N-Q, bạn cần sử dụng tính năng **Sync từ Form (Manual Sync)** trên thanh Menu `📊 Form Sync`.

### Output (CV Scan-Stores - 38 cột)

| Cột | Tên trường                   | Mapping từ Form                                   |
| --- | ---------------------------- | ------------------------------------------------- |
| A   | Điểm phù hợp                 | (để trống)                                        |
| B   | Thời gian                    | Dấu thời gian (A)                                 |
| C   | Vị trí ứng tuyển             | Vị trí bạn muốn ứng tuyển (B)                     |
| D   | Source                       | Bạn thấy thông tin tuyển dụng ở đâu? (L)          |
| E   | Job code                     | (để trống)                                        |
| F   | Position ID                  | (để trống)                                        |
| G   | Họ và Tên                    | Họ và tên (F)                                     |
| H   | Năm sinh                     | Extract năm từ Ngày sinh (H)                      |
| I   | Giới tính                    | Giới tính (G)                                     |
| J   | Số điện thoại                | Số điện thoại (I)                                 |
| K   | Email                        | Địa chỉ Email (J)                                 |
| L   | Nơi ở                        | Địa chỉ cụ thể (E) + Khu vực (D)                  |
| M   | Brand                        | Nhãn hàng bạn muốn ứng tuyển (C)                  |
| N   | TA User                      | Lấy theo PIC (N). Nếu rỗng, lấy TA User cấu hình  |
| O   | Ngành tốt nghiệp             | (để trống)                                        |
| P   | Năm tốt nghiệp               | (để trống)                                        |
| Q   | Loại tốt nghiệp              | (để trống)                                        |
| R   | Lịch sử làm việc             | Kinh nghiệm làm việc (K)                          |
| S   | Task công việc               | (để trống)                                        |
| T   | Kỹ năng                      | (để trống)                                        |
| U   | Chứng chỉ                    | (để trống)                                        |
| V   | Tóm tắt                      | (để trống)                                        |
| W   | Sự phù hợp                   | (để trống)                                        |
| X   | Link Hồ sơ                   | CV của bạn (M)                                    |
| Y   | TA duyệt nội dung            | (để trống)                                        |
| Z   | Ghi chú                      | Store Interview (O)                               |
| AA  | CV Tiềm năng                 | (để trống)                                        |
| AB  | Kết quả                      | Status (Q)                                        |
| AC  | Lý do TD thất bại            | (để trống)                                        |
| AD  | Kết quả bài Test / Screen CV | (để trống)                                        |
| AE  | Ngày HR PV                   | (để trống)                                        |
| AF  | Ngày PV vòng 1               | Lịch interview (P)                                |
| AG  | Ngày PV vòng 2               | (để trống)                                        |
| AH  | Ngày gửi Offer               | (để trống)                                        |
| AI  | Ngày bắt đầu                 | (để trống)                                        |
| AJ  | Ngày chính thức              | (để trống)                                        |
| AK  | Note                         | (để trống)                                        |
| AL  | Vòng Rejected                | (để trống)                                        |
| AM  | Thời gian apply              | Dấu thời gian (A)                                 |

---

## 🚀 Hướng dẫn từng bước

### Bước 1: Mở Google Apps Script

1. Mở Google Sheet chứa **CV Scan-Stores** (Datapool đích)
2. Vào menu **Extensions (Tiện ích mở rộng)** → **Apps Script**
3. Xóa code mặc định và paste code bên dưới vào file `Code.gs`.

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
  DATAPOOL_SPREADSHEET_ID: "YOUR_DATAPOOL_SPREADSHEET_ID", // TODO: Thay bằng ID thực
  DATAPOOL_SHEET_NAME: "CV Scan-Stores",

  // Danh sách Form Response Sheets (thêm/bớt theo nhu cầu)
  FORM_SHEETS: [
    {
      spreadsheetId: "16uDqoibxkD94w70OOvva6iFnT6BOQlQ-3M8UZMCLx2I",
      sheetName: "Câu trả lời biểu mẫu 1", // Tên sheet chứa form responses
      taUser: "User 1",
    },
    // Bạn có thể copy/paste cấu hình bên dưới để thêm nhiều sheet
    // {
    //   spreadsheetId: "YOUR_FORM_SPREADSHEET_ID_2", 
    //   sheetName: "Câu trả lời biểu mẫu 1",
    //   taUser: "User 2",
    // },
  ],
};

// ==================== MAPPING COLUMNS ====================

/**
 * Map dữ liệu từ form response sang datapool row
 * @param {Array} formRow - Dữ liệu 1 dòng từ form response
 * @param {string} taUser - TA User cấu hình
 * @returns {Array} - Dữ liệu đã map cho datapool (38 cột)
 */
function mapFormToDatapool(formRow, taUser) {
  // Form columns (0-indexed theo cấu trúc 17 cột)
  const timestamp = formRow[0] || "";      // A: Dấu thời gian
  const position = formRow[1] || "";       // B: Vị trí bạn muốn ứng tuyển
  const brand = formRow[2] || "";          // C: Nhãn hàng
  const region = formRow[3] || "";         // D: Khu vực ứng tuyển
  const exactAddress = formRow[4] || "";   // E: Địa chỉ cụ thể
  const fullName = formRow[5] || "";       // F: Họ và tên
  const gender = formRow[6] || "";         // G: Giới tính
  const birthDate = formRow[7] || "";      // H: Ngày tháng năm sinh
  const phone = formRow[8] || "";          // I: Số điện thoại
  const email = formRow[9] || "";          // J: Địa chỉ Email
  const experience = formRow[10] || "";    // K: Kinh nghiệm làm việc
  const source = formRow[11] || "";        // L: Trông tin tuyển dụng ở đâu
  const cvLink = formRow[12] || "";        // M: CV
  const pic = formRow[13] || "";           // N: PIC
  const storeInterview = formRow[14] || "";// O: Store Interview
  const interviewDate = formRow[15] || ""; // P: Lịch interview
  const status = formRow[16] || "";        // Q: Status

  // Gộp thông tin địa chỉ
  const address = exactAddress ? exactAddress + (region ? " - " + region : "") : region;
  
  // PIC (Nếu có ghi đè trên form thì lấy, nếu không lấy cấu hình mặc định)
  const finalTaUser = pic ? pic : taUser;

  // Extract năm sinh từ ngày sinh 
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
    finalTaUser, // N: TA User
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
    storeInterview, // Z: Ghi chú
    "", // AA: CV Tiềm năng
    status, // AB: Kết quả
    "", // AC: Lý do TD thất bại
    "", // AD: Kết quả bài Test / Screen CV
    "", // AE: Ngày HR PV
    interviewDate, // AF: Ngày PV vòng 1
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
 * Dùng khi muốn sync lại toàn bộ, hoặc sync dữ liệu sau khi điền tay vào các cột N-Q
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
    .addItem("Sync từ Form 1", "syncFromForm1")
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
 * Test mapping với dữ liệu mẫu (17 cột)
 */
function testMapping() {
  const sampleRow = [
    "03/02/2026 9:23:23", // A: Timestamp
    "Nhân viên bán hàng", // B: Position
    "Supersports", // C: Brand
    "Hồ Chí Minh", // D: Khu vực
    "Quận 1", // E: Địa chỉ cụ thể
    "Nguyễn Văn A", // F: Name
    "Nam", // G: Gender
    "25/02/1995", // H: Birth date
    "0935123123", // I: Phone
    "test@gmail.com", // J: Email
    "Đã làm việc 2 năm", // K: Experience
    "Facebook", // L: Source
    "https://drive.google.com/cv.pdf", // M: CV
    "HR Minh", // N: PIC
    "Cửa hàng Q1", // O: Store Interview
    "15/03/2026 14:00", // P: Lịch interview
    "Đậu", // Q: Status
  ];

  const result = mapFormToDatapool(sampleRow, "User 1");

  console.log("=== KẾT QUẢ MAPPING ===");
  console.log("Số cột trả về: " + result.length + " (yêu cầu 38)");
  console.log("Họ tên (G): " + result[6]);
  console.log("SĐT (J): " + result[9]);
  console.log("Nơi ở (L): " + result[11]);
  console.log("TA User (N): " + result[13]);
  console.log("Ghi chú/Store Interview (Z): " + result[25]);
  console.log("Kết quả/Status (AB): " + result[27]);
  console.log("Lịch Interview (AF): " + result[31]);

  return result;
}

/**
 * Kiểm tra kết nối đến các spreadsheets
 */
function testConnections() {
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

  console.log("=== KẾT QUẢ KIỂM TRA KẾT NỐI ===");
  console.log(results.join("\n"));
  return results;
}
```

### Bước 3: Cấu hình Script

1. **Thay thế các ID trong CONFIG:**
   - `DATAPOOL_SPREADSHEET_ID`: Bạn cần điền ID của sheet Datapool (CV Scan-Stores).
   - `spreadsheetId` của Form mặc định đã được điền là `16uDqoibxkD94w70OOvva6iFnT6BOQlQ-3M8UZMCLx2I`.
   - `sheetName`: Đã để sẵn là `Câu trả lời biểu mẫu 1`.

### Bước 4: Chạy Setup

1. Lưu script (nhấn biểu tượng Lưu hoặc Ctrl + S)
2. Chạy thử hàm `testConnections` (bằng cách chọn trên thanh menu xổ xuống ở tab Google Apps Script) để kiểm tra kết nối với cả Datapool và Form hiện tại.
3. Cấp quyền ứng dụng khi được yêu cầu.
4. Chạy hàm `setupTriggers` để tự động tạo trigger, cho phép đồng bộ tự động mỗi khi có người Submit form.

### Bước 5: Test

1. Chạy hàm `testMapping` trong editor, mở Log thực thi xem các giá trị (địa chỉ, số điện thoại, trạng thái) có được cắt ráp đúng vị trí không.
2. Gửi thử 1 mẫu Submit trên form.
3. Qua sheet **CV Scan-Stores** xem dữ liệu có xuất hiện không.

---

## ⚠️ Lưu ý quan trọng

1. **Quyền truy cập:**
   - Account thiết lập script này cần có Full quyền Edit ở cả Datapool và Form sheet.
2. **Trigger (Cò nổ):**
   - Sự kiện `onFormSubmit` (submit form) chỉ chụp snapshot dữ liệu **TẠI THỜI ĐIỂM NGƯỜI DÙNG NHẤN SUBMIT**.
   - Điều này nghĩa là nếu có form được điền thêm (Cột N, O, P, Q) được cập nhật bằng tay VÀO SAU ĐÓ trên form, dữ liệu tại Datapool **sẽ không tự động thay đổi theo**.
3. **Cách khắc phục cho cột N, O, P, Q:**
   - Sau khi bạn update thủ công trạng thái ở form nguồn, hãy vào Datapool, trên thanh Menu ở trên cùng có chữ **📊 Form Sync** -> Chọn **Sync từ Form 1**. 
   - Lúc này script sẽ chạy qua tất cả các record trên Form và cập nhật lại bản vá đầy đủ sang Datapool.
