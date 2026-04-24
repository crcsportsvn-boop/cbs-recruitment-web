# Store Form Sync System - Google Apps Script

## Tổng quan

Hệ thống tự động sync dữ liệu từ Google Form (Store Recruitment) sang Datapool spreadsheet.

## Cấu hình

| Thông tin | Giá trị |
|-----------|---------|
| **Datapool Spreadsheet ID** | `1GvIdlI4VTa0h4UeRjh6YjKV_SmhOU8OSbwSGGlvGTRs` |
| **Datapool Sheet Name** | `Datapool` |
| **Form Spreadsheet ID** | `16uDqoibxkD94w70OOvva6iFnT6BOQlQ-3M8UZMCLx2I` |
| **Form Sheet Name** | `Câu trả lời biểu mẫu 1` |
| **Datapool URL** | [Link](https://docs.google.com/spreadsheets/d/1GvIdlI4VTa0h4UeRjh6YjKV_SmhOU8OSbwSGGlvGTRs/edit?gid=955935264#gid=955935264) |
| **Form Source URL** | [Link](https://docs.google.com/spreadsheets/d/16uDqoibxkD94w70OOvva6iFnT6BOQlQ-3M8UZMCLx2I/edit?resourcekey=&gid=1686153037#gid=1686153037) |

## Mapping: Form → Datapool (39 cột)

| Datapool Col | Index | Nội dung | Form Source Index |
|--------------|-------|----------|-------------------|
| A | 0 | Điểm phù hợp | _(trống)_ |
| B | 1 | Thời gian (dd/MM/yyyy) | 0 (Timestamp) |
| C | 2 | Vị trí ứng tuyển | 1 (Position) |
| D | 3 | Source | 11 (Source) |
| E | 4 | Job code | _(trống)_ |
| F | 5 | Position ID | _(trống)_ |
| G | 6 | Họ và Tên | 5 (Full Name) |
| H | 7 | Năm sinh | 7 (Birth Date → extract year) |
| I | 8 | Giới tính | 6 (Gender) |
| J | 9 | Số điện thoại | 8 (Phone) |
| K | 10 | Email | 9 (Email) |
| L | 11 | Nơi ở | 3 (Region) |
| M | 12 | Brand | 2 (Brand) |
| N | 13 | TA User | 13 (PIC) hoặc taUser default |
| O | 14 | Ngành tốt nghiệp | _(trống)_ |
| P | 15 | Năm tốt nghiệp | _(trống)_ |
| Q | 16 | Khu vực ứng tuyển | 4 (Exact Address) |
| R | 17 | Lịch sử làm việc | 10 (Experience) |
| S | 18 | Task công việc | _(trống)_ |
| T | 19 | Kỹ năng | _(trống)_ |
| U | 20 | Chứng chỉ | _(trống)_ |
| V | 21 | Tóm tắt | _(trống)_ |
| W | 22 | Sự phù hợp | _(trống)_ |
| X | 23 | Link Hồ sơ | 12 (CV Link) |
| Y | 24 | TA duyệt nội dung | _(trống)_ |
| Z | 25 | Ghi chú (Store Interview) | 14 (Store Interview) |
| AA | 26 | CV Tiềm năng | _(trống)_ |
| AB | 27 | Kết quả (Status) | 16 (Status) |
| AC | 28 | Lý do TD thất bại | _(trống)_ |
| AD | 29 | Kết quả bài Test | _(trống)_ |
| AE | 30 | Ngày HR PV | _(trống)_ |
| AF | 31 | Ngày PV vòng 1 | 15 (Interview Date) |
| AG | 32 | Ngày PV vòng 2 | _(trống)_ |
| AH | 33 | Ngày gửi Offer | _(trống)_ |
| AI | 34 | Ngày bắt đầu | _(trống)_ |
| AJ | 35 | Ngày chính thức | _(trống)_ |
| AK | 36 | Note | _(trống)_ |
| AL | 37 | Vòng Rejected | _(trống)_ |
| AM | 38 | Thời gian apply (yyyy-MM-dd HH:mm:ss) | 0 (Timestamp) |

## Incident Log

### 2026-03-31: CONFIG bị thiếu → Dữ liệu không sync từ 18/03

- **Lỗi**: `ReferenceError: CONFIG is not defined` trong `onFormSubmit`
- **Nguyên nhân**: Block `CONFIG` bị xóa/mất khỏi script
- **Ảnh hưởng**: Dữ liệu từ 18/03/2026 đến 31/03/2026 không được sync vào Datapool
- **Fix**: Thêm lại block `CONFIG` + chạy `syncMissingData()` để khôi phục
- **Trạng thái**: ✅ Đã fix

---

## Source Code

### Config

```javascript
// ==================== CẤU HÌNH ====================
const CONFIG = {
  DATAPOOL_SPREADSHEET_ID: "1GvIdlI4VTa0h4UeRjh6YjKV_SmhOU8OSbwSGGlvGTRs",
  DATAPOOL_SHEET_NAME: "Datapool",

  FORM_SHEETS: [
    {
      spreadsheetId: "16uDqoibxkD94w70OOvva6iFnT6BOQlQ-3M8UZMCLx2I",
      sheetName: "Câu trả lời biểu mẫu 1",
      taUser: "Store", // TA User mặc định khi PIC trống
    },
  ],
};
```

### Mapping Functions

```javascript
/**
 * Map dữ liệu từ form response sang datapool row
 * @param {Array} formRow - Dữ liệu 1 dòng từ form response
 * @param {string} taUser - TA User cấu hình
 * @returns {Array} - Dữ liệu đã map cho datapool (39 cột)
 */
function mapFormToDatapool(formRow, taUser) {
  const rawTimestamp = formRow[0] || "";
  const position = formRow[1] || "";
  const brand = formRow[2] || "";
  const region = formRow[3] || "";
  const exactAddress = formRow[4] || "";
  const fullName = formRow[5] || "";
  const gender = formRow[6] || "";
  const birthDate = formRow[7] || "";
  let phone = formRow[8] !== undefined ? String(formRow[8]) : "";
  const email = formRow[9] || "";
  const experience = formRow[10] || "";
  const source = formRow[11] || "";
  const cvLink = formRow[12] || "";
  const pic = formRow[13] || "";
  const storeInterview = formRow[14] || "";
  const interviewDate = formRow[15] || "";
  const status = formRow[16] || "";

  // Xử lý định dạng số điện thoại
  phone = phone.replace(/^'/, "").trim();

  const address = exactAddress;
  const finalTaUser = pic ? pic : taUser;
  const birthYear = extractYear(birthDate);

  let dateObj = new Date(rawTimestamp);

  if (isNaN(dateObj.getTime()) && rawTimestamp) {
    const parts = rawTimestamp.split(/[\s/:]+/);
    if (parts.length >= 3) {
      dateObj = new Date(
        parts[2],
        parts[1] - 1,
        parts[0],
        parts[3] || 0,
        parts[4] || 0,
        parts[5] || 0,
      );
    }
  }

  let colB_Time = rawTimestamp;
  let colAM_Time = rawTimestamp;

  if (!isNaN(dateObj.getTime())) {
    const timeZone = Session.getScriptTimeZone();
    colB_Time = Utilities.formatDate(dateObj, timeZone, "dd/MM/yyyy");
    colAM_Time = Utilities.formatDate(dateObj, timeZone, "yyyy-MM-dd HH:mm:ss");
  }

  return [
    "",             // A: Điểm phù hợp
    colB_Time,      // B: Thời gian
    position,       // C: Vị trí ứng tuyển
    source,         // D: Source
    "",             // E: Job code
    "",             // F: Position ID
    fullName,       // G: Họ và Tên
    birthYear,      // H: Năm sinh
    gender,         // I: Giới tính
    phone,          // J: Số điện thoại
    email,          // K: Email
    region,         // L: Nơi ở
    brand,          // M: Brand
    finalTaUser,    // N: TA User
    "",             // O: Ngành tốt nghiệp
    "",             // P: Năm tốt nghiệp
    address,        // Q: Khu vực ứng tuyển
    experience,     // R: Lịch sử làm việc
    "",             // S: Task công việc
    "",             // T: Kỹ năng
    "",             // U: Chứng chỉ
    "",             // V: Tóm tắt
    "",             // W: Sự phù hợp
    cvLink,         // X: Link Hồ sơ
    "",             // Y: TA duyệt nội dung
    storeInterview, // Z: Ghi chú
    "",             // AA: CV Tiềm năng
    status,         // AB: Kết quả
    "",             // AC: Lý do TD thất bại
    "",             // AD: Kết quả bài Test / Screen CV
    "",             // AE: Ngày HR PV
    interviewDate,  // AF: Ngày PV vòng 1
    "",             // AG: Ngày PV vòng 2
    "",             // AH: Ngày gửi Offer
    "",             // AI: Ngày bắt đầu
    "",             // AJ: Ngày chính thức
    "",             // AK: Note
    "",             // AL: Vòng Rejected
    colAM_Time,     // AM: Thời gian apply
  ];
}

/**
 * Extract năm từ ngày sinh
 * Hỗ trợ format: dd/mm/yyyy, mm/dd/yyyy, yyyy-mm-dd, hoặc chỉ năm
 */
function extractYear(dateStr) {
  if (!dateStr) return "";

  const str = dateStr.toString().trim();

  if (dateStr instanceof Date) {
    return dateStr.getFullYear().toString();
  }

  let match = str.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (match) return match[3];

  match = str.match(/(\d{4})-\d{1,2}-\d{1,2}/);
  if (match) return match[1];

  match = str.match(/\d{4}/);
  if (match) return match[0];

  return str;
}
```

### Trigger Handlers

```javascript
/**
 * Hàm xử lý khi form được submit (gọi bởi onFormSubmit trigger)
 */
function onFormSubmit(e) {
  try {
    const sheet = e.source.getActiveSheet();
    const spreadsheetId = e.source.getId();

    const formConfig = CONFIG.FORM_SHEETS.find(
      (f) => f.spreadsheetId === spreadsheetId,
    );

    if (!formConfig) {
      console.log("Form không được cấu hình: " + spreadsheetId);
      return;
    }

    const formRow = e.values;
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
  const datapoolSS = SpreadsheetApp.openById(CONFIG.DATAPOOL_SPREADSHEET_ID);
  const datapoolSheet = datapoolSS.getSheetByName(CONFIG.DATAPOOL_SHEET_NAME);

  if (!datapoolSheet) {
    throw new Error("Không tìm thấy sheet: " + CONFIG.DATAPOOL_SHEET_NAME);
  }

  const mappedRow = mapFormToDatapool(formRow, taUser);
  datapoolSheet.appendRow(mappedRow);
  return true;
}
```

### Manual Sync Functions

```javascript
/**
 * Sync tất cả dữ liệu từ 1 form sheet (chạy thủ công)
 */
function syncAllFromForm(formConfigIndex) {
  const formConfig = CONFIG.FORM_SHEETS[formConfigIndex];

  if (!formConfig) {
    throw new Error("Không tìm thấy form config index: " + formConfigIndex);
  }

  const formSS = SpreadsheetApp.openById(formConfig.spreadsheetId);
  const formSheet = formSS.getSheetByName(formConfig.sheetName);

  if (!formSheet) {
    throw new Error("Không tìm thấy sheet: " + formConfig.sheetName);
  }

  const data = formSheet.getDataRange().getValues();
  const rows = data.slice(1);

  const datapoolSS = SpreadsheetApp.openById(CONFIG.DATAPOOL_SPREADSHEET_ID);
  const datapoolSheet = datapoolSS.getSheetByName(CONFIG.DATAPOOL_SHEET_NAME);

  let count = 0;
  rows.forEach(function (row) {
    if (row[0]) {
      const mappedRow = mapFormToDatapool(row, formConfig.taUser);
      datapoolSheet.appendRow(mappedRow);
      count++;
    }
  });

  console.log("Đã sync " + count + " rows từ " + formConfig.taUser);
}

function syncFromForm1() {
  syncAllFromForm(0);
}

function syncFromAllForms() {
  for (let i = 0; i < CONFIG.FORM_SHEETS.length; i++) {
    try {
      syncAllFromForm(i);
    } catch (error) {
      console.error("Lỗi sync form " + i + ": " + error.toString());
    }
  }
}
```

### Recovery Function (Sync Missing Data)

```javascript
/**
 * Sync dữ liệu bị thiếu từ một ngày cụ thể đến nay
 * Tự động tránh duplicate bằng cách check timestamp trong cột AM
 *
 * Sử dụng: Thay đổi cutoffDate nếu cần sync từ ngày khác
 */
function syncMissingData() {
  const cutoffDate = new Date(2026, 2, 18); // 18/03/2026

  CONFIG.FORM_SHEETS.forEach(function (formConfig, index) {
    try {
      const formSS = SpreadsheetApp.openById(formConfig.spreadsheetId);
      const formSheet = formSS.getSheetByName(formConfig.sheetName);

      if (!formSheet) {
        console.error("Không tìm thấy sheet: " + formConfig.sheetName);
        return;
      }

      const data = formSheet.getDataRange().getValues();
      const rows = data.slice(1);

      const datapoolSS = SpreadsheetApp.openById(CONFIG.DATAPOOL_SPREADSHEET_ID);
      const datapoolSheet = datapoolSS.getSheetByName(CONFIG.DATAPOOL_SHEET_NAME);

      // Lấy timestamps đã có để tránh duplicate
      const existingData = datapoolSheet.getDataRange().getValues();
      const existingTimestamps = new Set();
      existingData.forEach(function (row) {
        if (row[38]) existingTimestamps.add(String(row[38]).trim());
      });

      let count = 0;
      const batchRows = [];

      rows.forEach(function (row) {
        if (!row[0]) return;

        let rowDate;
        const rawTimestamp = row[0];

        if (rawTimestamp instanceof Date) {
          rowDate = rawTimestamp;
        } else {
          rowDate = new Date(rawTimestamp);
          if (isNaN(rowDate.getTime())) {
            const parts = String(rawTimestamp).split(/[\s/:]+/);
            if (parts.length >= 3) {
              rowDate = new Date(
                parts[2],
                parts[1] - 1,
                parts[0],
                parts[3] || 0,
                parts[4] || 0,
                parts[5] || 0,
              );
            }
          }
        }

        if (!rowDate || isNaN(rowDate.getTime()) || rowDate < cutoffDate) return;

        const timeZone = Session.getScriptTimeZone();
        const formattedTime = Utilities.formatDate(
          rowDate,
          timeZone,
          "yyyy-MM-dd HH:mm:ss",
        );

        if (existingTimestamps.has(formattedTime)) {
          console.log("Skip duplicate: " + formattedTime);
          return;
        }

        const mappedRow = mapFormToDatapool(row, formConfig.taUser);
        batchRows.push(mappedRow);
        count++;
      });

      // Batch write (nhanh hơn appendRow từng dòng)
      if (batchRows.length > 0) {
        datapoolSheet
          .getRange(
            datapoolSheet.getLastRow() + 1,
            1,
            batchRows.length,
            batchRows[0].length,
          )
          .setValues(batchRows);
      }

      console.log(
        "Form " +
          (index + 1) +
          " (" +
          formConfig.taUser +
          "): Đã sync " +
          count +
          " rows bị thiếu",
      );
    } catch (error) {
      console.error(
        "Lỗi sync form " + (index + 1) + ": " + error.toString(),
      );
    }
  });
}
```

### Setup & Utility Functions

```javascript
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

function setupTriggers() {
  removeAllTriggers();

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

  console.log(
    "Đã cài đặt triggers cho " + CONFIG.FORM_SHEETS.length + " forms!",
  );
}

function removeAllTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function (trigger) {
    ScriptApp.deleteTrigger(trigger);
  });
  console.log("Đã xóa " + triggers.length + " triggers");
}

function testMapping() {
  const sampleRow = [
    "03/02/2026 9:23:23",
    "Nhân viên bán hàng",
    "Supersports",
    "Hồ Chí Minh",
    "Quận 1",
    "Nguyễn Văn A",
    "Nam",
    "25/02/1995",
    "0935123123",
    "test@gmail.com",
    "Đã làm việc 2 năm",
    "Facebook",
    "https://drive.google.com/cv.pdf",
    "HR Minh",
    "Cửa hàng Q1",
    "15/03/2026 14:00",
    "Đậu",
  ];

  const result = mapFormToDatapool(sampleRow, "User 1");

  console.log("=== KẾT QUẢ MAPPING ===");
  console.log("Số cột trả về: " + result.length + " (yêu cầu 39)");
  console.log("Họ tên (G): " + result[6]);
  console.log("SĐT (J): " + result[9]);
  console.log("Nơi ở (L): " + result[11]);
  console.log("TA User (N): " + result[13]);
  console.log("Khu vực (Q): " + result[16]);
  console.log("Ghi chú/Store Interview (Z): " + result[25]);
  console.log("Kết quả/Status (AB): " + result[27]);
  console.log("Lịch Interview (AF): " + result[31]);

  return result;
}

function testConnections() {
  let results = [];

  try {
    const datapoolSS = SpreadsheetApp.openById(CONFIG.DATAPOOL_SPREADSHEET_ID);
    const sheet = datapoolSS.getSheetByName(CONFIG.DATAPOOL_SHEET_NAME);
    results.push("✅ Datapool: OK - " + datapoolSS.getName());
  } catch (e) {
    results.push("❌ Datapool: FAILED - " + e.toString());
  }

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
