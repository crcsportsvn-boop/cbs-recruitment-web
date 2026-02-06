/**
 * ============================================
 * FORM RESPONSE TO DATAPOOL SYNC SCRIPT v2
 * ============================================
 * Tự động chuyển dữ liệu từ Form Response sang Datapool
 *
 * HƯỚNG DẪN SỬ DỤNG:
 * 1. Mở sheet CV Scan (Datapool): https://docs.google.com/spreadsheets/d/1GvIdlI4VTa0h4UeRjh6YjKV_SmhOU8OSbwSGGlvGTRs
 * 2. Vào Extensions → Apps Script
 * 3. Xóa code mặc định, paste toàn bộ code này
 * 4. Lưu (Ctrl + S)
 * 5. Chạy hàm testConnections để kiểm tra
 * 6. Chạy hàm setupTriggers để cài đặt trigger tự động
 */

// ==================== CẤU HÌNH - ĐÃ ĐIỀN SẴN ====================

var CONFIG = {
  // Sheet Datapool (CV Scan-Stores)
  DATAPOOL_SPREADSHEET_ID: "1GvIdlI4VTa0h4UeRjh6YjKV_SmhOU8OSbwSGGlvGTRs",
  DATAPOOL_SHEET_NAME: "Datapool",

  // Danh sách Form Response Sheets
  FORM_SHEETS: [
    {
      spreadsheetId: "1RYqeq81E1WO8ceipByIoTKqwI8M7JuKkaFC-HqPpeIo",
      sheetName: "Answer list 1",
      taUser: "Mr. Vũ",
    },
    {
      spreadsheetId: "1IZHhL_crdWWLvFn8BnAa1mYV91sBHG2kpyI8w9U2dJQ",
      sheetName: "Answer list 2",
      taUser: "Ms. Cam",
    },
    {
      spreadsheetId: "1Djhf3woGjHuJqrvemmw9VQmmLi_XpuCUkwwOTqw-BmQ",
      sheetName: "Answer list 3",
      taUser: "Ms. Phương Anh",
    },
  ],
};

// ==================== MAPPING COLUMNS ====================

/**
 * Map dữ liệu từ form response sang datapool row
 * @param {Array} formRow - Dữ liệu 1 dòng từ form response
 * @param {string} taUser - TA User (User 1, 2, 3)
 * @returns {Array} - Dữ liệu đã map cho datapool (39 cột)
 */
function mapFormToDatapool(formRow, taUser) {
  // Kiểm tra formRow có hợp lệ không
  if (!formRow || !Array.isArray(formRow)) {
    Logger.log("Lỗi: formRow không hợp lệ");
    return null;
  }

  // Form columns (0-indexed)
  // A: Dấu thời gian, B: Vị trí, C: Nhãn hàng, D: Họ tên, E: Giới tính
  // F: Ngày sinh, G: SĐT, H: Email, I: Địa chỉ, J: Kinh nghiệm, K: CV, L: Nguồn

  var timestamp = formRow[0] ? formRow[0] : "";
  var position = formRow[1] ? formRow[1] : "";
  var brand = formRow[2] ? formRow[2] : "";
  var fullName = formRow[3] ? formRow[3] : "";
  var gender = formRow[4] ? formRow[4] : "";
  var birthDate = formRow[5] ? formRow[5] : "";
  var phone = formRow[6] ? formRow[6] : "";
  var email = formRow[7] ? formRow[7] : "";
  var address = formRow[8] ? formRow[8] : "";
  var experience = formRow[9] ? formRow[9] : "";
  var cvLink = formRow[10] ? formRow[10] : "";
  var source = formRow[11] ? formRow[11] : "";

  // Extract năm sinh từ ngày sinh
  var birthYear = extractYear(birthDate);

  // Format timestamp - cột B chỉ lấy dd/mm/yyyy
  var formattedTime = formatTimestampDate(timestamp);

  // Format timestamp ISO - cột AM format cho web app
  var formattedTimeISO = formatTimestampISO(timestamp);

  // Tạo row cho datapool (39 cột: A -> AM)
  return [
    "", // A: Điểm phù hợp
    formattedTime, // B: Thời gian
    position, // C: Vị trí ứng tuyển
    source, // D: Source
    "", // E: Job code
    "", // F: Position ID
    fullName, // G: Họ và Tên
    birthYear, // H: Năm sinh
    gender, // I: Giới tính
    formatPhone(phone), // J: Số điện thoại
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
    formattedTimeISO, // AM: Thời gian apply (ISO format)
  ];
}

/**
 * Extract năm từ ngày sinh
 */
function extractYear(dateStr) {
  if (!dateStr) return "";

  // Nếu là Date object
  if (dateStr instanceof Date) {
    return dateStr.getFullYear().toString();
  }

  var str = dateStr.toString().trim();

  // Format: dd/mm/yyyy hoặc mm/dd/yyyy
  var match = str.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
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

/**
 * Format timestamp thành dd/MM/yyyy (cho cột B - Thời gian)
 */
function formatTimestampDate(timestamp) {
  if (!timestamp) return "";

  if (timestamp instanceof Date) {
    return Utilities.formatDate(timestamp, "Asia/Ho_Chi_Minh", "dd/MM/yyyy");
  }

  // Nếu là string, thử parse
  var str = timestamp.toString().trim();

  // Format: dd/mm/yyyy HH:mm:ss -> lấy phần dd/mm/yyyy
  var match = str.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
  if (match) {
    return match[1];
  }

  return str;
}

/**
 * Format timestamp thành ISO format (cho cột AM - Thời gian apply)
 * Output: 2026-02-02T11:14:49.438Z
 */
function formatTimestampISO(timestamp) {
  if (!timestamp) return "";

  var date;

  if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    // Thử parse string thành Date
    date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      // Nếu không parse được, thử format dd/mm/yyyy HH:mm:ss
      var str = timestamp.toString().trim();
      var match = str.match(
        /(\d{1,2})\/(\d{1,2})\/(\d{4})\s*(\d{1,2}):(\d{2}):(\d{2})/,
      );
      if (match) {
        // match[1]=day, match[2]=month, match[3]=year, match[4]=hour, match[5]=min, match[6]=sec
        date = new Date(
          match[3],
          match[2] - 1,
          match[1],
          match[4],
          match[5],
          match[6],
        );
      } else {
        // Thử format dd/mm/yyyy
        match = str.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (match) {
          date = new Date(match[3], match[2] - 1, match[1]);
        } else {
          return str;
        }
      }
    }
  }

  // Convert to ISO string
  return date.toISOString();
}

/**
 * Format số điện thoại (đảm bảo có số 0 đầu)
 */
function formatPhone(phone) {
  if (!phone) return "";

  var str = phone.toString().trim();

  // Nếu bắt đầu bằng 84, thay bằng 0
  if (str.indexOf("84") === 0 && str.length > 9) {
    str = "0" + str.substring(2);
  }

  // Nếu không có số 0 đầu và có 9 số
  if (str.indexOf("0") !== 0 && str.length === 9) {
    str = "0" + str;
  }

  return str;
}

// ==================== TRIGGER HANDLERS ====================

/**
 * Hàm xử lý khi form được submit
 */
function onFormSubmit(e) {
  try {
    var spreadsheetId = e.source.getId();

    // Tìm config tương ứng với form này
    var formConfig = null;
    for (var i = 0; i < CONFIG.FORM_SHEETS.length; i++) {
      if (CONFIG.FORM_SHEETS[i].spreadsheetId === spreadsheetId) {
        formConfig = CONFIG.FORM_SHEETS[i];
        break;
      }
    }

    if (!formConfig) {
      Logger.log("Form không được cấu hình: " + spreadsheetId);
      return;
    }

    // Lấy dữ liệu row mới
    var formRow = e.values;

    // Kiểm tra dữ liệu có hợp lệ
    if (!formRow || formRow.length < 4) {
      Logger.log("Dữ liệu không hợp lệ");
      return;
    }

    // Map và thêm vào datapool
    var result = addToDatapool(formRow, formConfig.taUser);

    if (result) {
      Logger.log(
        "✅ Đã sync thành công cho: " + formConfig.taUser + " - " + formRow[3],
      );
    }
  } catch (error) {
    Logger.log("❌ Lỗi onFormSubmit: " + error.toString());
  }
}

/**
 * Thêm dữ liệu vào sheet Datapool
 */
function addToDatapool(formRow, taUser) {
  // Mở sheet datapool
  var datapoolSS = SpreadsheetApp.openById(CONFIG.DATAPOOL_SPREADSHEET_ID);
  var datapoolSheet = datapoolSS.getSheetByName(CONFIG.DATAPOOL_SHEET_NAME);

  if (!datapoolSheet) {
    throw new Error("Không tìm thấy sheet: " + CONFIG.DATAPOOL_SHEET_NAME);
  }

  // Kiểm tra trùng lặp (dựa vào SĐT + Email)
  var phone = formRow[6] ? formRow[6] : "";
  var email = formRow[7] ? formRow[7] : "";

  if (isDuplicate(datapoolSheet, phone, email)) {
    Logger.log("⚠️ Dữ liệu đã tồn tại, bỏ qua: " + phone + " - " + email);
    return false;
  }

  // Map dữ liệu
  var mappedRow = mapFormToDatapool(formRow, taUser);

  if (!mappedRow) {
    Logger.log("❌ Lỗi mapping dữ liệu");
    return false;
  }

  // Thêm vào hàng cuối
  datapoolSheet.appendRow(mappedRow);

  return true;
}

/**
 * Kiểm tra dữ liệu trùng lặp
 */
function isDuplicate(sheet, phone, email) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;

  // Chỉ kiểm tra 100 dòng cuối để tăng tốc độ
  var startRow = Math.max(2, lastRow - 100);
  var numRows = lastRow - startRow + 1;

  if (numRows <= 0) return false;

  var phoneCol = sheet.getRange(startRow, 10, numRows, 1).getValues();
  var emailCol = sheet.getRange(startRow, 11, numRows, 1).getValues();

  var formattedPhone = formatPhone(phone);
  var formattedEmail = email ? email.toString().toLowerCase().trim() : "";

  for (var i = 0; i < numRows; i++) {
    var existingPhone = formatPhone(phoneCol[i][0]);
    var existingEmail = emailCol[i][0]
      ? emailCol[i][0].toString().toLowerCase().trim()
      : "";

    if (existingPhone === formattedPhone && existingEmail === formattedEmail) {
      return true;
    }
  }

  return false;
}

// ==================== MANUAL SYNC FUNCTIONS ====================

/**
 * Sync tất cả dữ liệu từ 1 form sheet (chạy thủ công)
 */
function syncAllFromForm(formConfigIndex) {
  var formConfig = CONFIG.FORM_SHEETS[formConfigIndex];

  if (!formConfig) {
    throw new Error("Không tìm thấy form config index: " + formConfigIndex);
  }

  // Mở form spreadsheet
  var formSS = SpreadsheetApp.openById(formConfig.spreadsheetId);
  var formSheet = formSS.getSheetByName(formConfig.sheetName);

  if (!formSheet) {
    throw new Error("Không tìm thấy sheet: " + formConfig.sheetName);
  }

  // Lấy tất cả dữ liệu (bỏ header row)
  var data = formSheet.getDataRange().getValues();
  var rows = data.slice(1);

  // Mở datapool
  var datapoolSS = SpreadsheetApp.openById(CONFIG.DATAPOOL_SPREADSHEET_ID);
  var datapoolSheet = datapoolSS.getSheetByName(CONFIG.DATAPOOL_SHEET_NAME);

  if (!datapoolSheet) {
    throw new Error("Không tìm thấy sheet Datapool");
  }

  // Map và thêm từng row
  var count = 0;
  var skipped = 0;

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    if (row[0]) {
      var phone = row[6] ? row[6] : "";
      var email = row[7] ? row[7] : "";

      if (!isDuplicate(datapoolSheet, phone, email)) {
        var mappedRow = mapFormToDatapool(row, formConfig.taUser);
        if (mappedRow) {
          datapoolSheet.appendRow(mappedRow);
          count++;
        }
      } else {
        skipped++;
      }
    }
  }

  var message =
    "Đã sync " +
    count +
    " rows từ " +
    formConfig.taUser +
    " (Bỏ qua " +
    skipped +
    " rows trùng)";
  Logger.log(message);

  try {
    SpreadsheetApp.getUi().alert(message);
  } catch (e) {}

  return count;
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
  var totalCount = 0;
  for (var i = 0; i < CONFIG.FORM_SHEETS.length; i++) {
    try {
      totalCount += syncAllFromForm(i);
    } catch (error) {
      Logger.log("Lỗi sync form " + i + ": " + error.toString());
    }
  }
  Logger.log("Tổng cộng đã sync: " + totalCount + " rows");

  try {
    SpreadsheetApp.getUi().alert("Tổng cộng đã sync: " + totalCount + " rows");
  } catch (e) {}
}

// ==================== SETUP FUNCTIONS ====================

/**
 * Tạo menu custom trong Google Sheets
 */
function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu("📊 Form Sync")
      .addItem("🔄 Sync từ Form 1 (User 1)", "syncFromForm1")
      .addItem("🔄 Sync từ Form 2 (User 2)", "syncFromForm2")
      .addItem("🔄 Sync từ Form 3 (User 3)", "syncFromForm3")
      .addSeparator()
      .addItem("🔄 Sync tất cả Forms", "syncFromAllForms")
      .addSeparator()
      .addItem("⚙️ Cài đặt Trigger tự động", "setupTriggers")
      .addItem("🗑️ Xóa tất cả Triggers", "removeAllTriggers")
      .addSeparator()
      .addItem("🧪 Test kết nối", "testConnections")
      .addItem("🧪 Test mapping", "testMapping")
      .addToUi();
  } catch (e) {}
}

/**
 * Cài đặt trigger tự động cho các form
 */
function setupTriggers() {
  removeAllTriggers();

  var successCount = 0;
  var errors = [];

  for (var i = 0; i < CONFIG.FORM_SHEETS.length; i++) {
    var formConfig = CONFIG.FORM_SHEETS[i];
    try {
      var formSS = SpreadsheetApp.openById(formConfig.spreadsheetId);

      ScriptApp.newTrigger("onFormSubmit")
        .forSpreadsheet(formSS)
        .onFormSubmit()
        .create();

      Logger.log(
        "✅ Đã tạo trigger cho Form " +
          (i + 1) +
          " (" +
          formConfig.taUser +
          ")",
      );
      successCount++;
    } catch (error) {
      var errMsg = "Form " + (i + 1) + ": " + error.toString();
      Logger.log("❌ " + errMsg);
      errors.push(errMsg);
    }
  }

  var message =
    "✅ Đã cài đặt " +
    successCount +
    "/" +
    CONFIG.FORM_SHEETS.length +
    " triggers!";
  if (errors.length > 0) {
    message += "\n\n❌ Lỗi:\n" + errors.join("\n");
  }

  try {
    SpreadsheetApp.getUi().alert(message);
  } catch (e) {
    Logger.log(message);
  }
}

/**
 * Xóa tất cả triggers
 */
function removeAllTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
  Logger.log("🗑️ Đã xóa " + triggers.length + " triggers");
}

// ==================== TEST FUNCTIONS ====================

/**
 * Test mapping với dữ liệu mẫu - CHẠY HÀM NÀY ĐỂ TEST
 */
function testMapping() {
  Logger.log("=== BẮT ĐẦU TEST MAPPING ===");

  var sampleRow = [
    new Date(), // 0: Timestamp
    "Nhân viên bán hàng - Sales Advisor", // 1: Position
    "Supersports", // 2: Brand
    "Nguyễn Văn A", // 3: Name
    "Nam", // 4: Gender
    "25/02/1995", // 5: Birth date
    "0935123123", // 6: Phone
    "test@gmail.com", // 7: Email
    "Quận 1, TP.HCM", // 8: Address
    "Đã làm việc 2 năm tại ABC", // 9: Experience
    "https://drive.google.com/cv.pdf", // 10: CV
    "Group Facebook", // 11: Source
  ];

  Logger.log("Input row: " + JSON.stringify(sampleRow));

  var result = mapFormToDatapool(sampleRow, "User 1");

  if (!result) {
    Logger.log("❌ Mapping thất bại!");
    return;
  }

  Logger.log("");
  Logger.log("=== KẾT QUẢ MAPPING ===");
  Logger.log("Số cột output: " + result.length);
  Logger.log("");
  Logger.log("B - Thời gian: " + result[1]);
  Logger.log("C - Vị trí: " + result[2]);
  Logger.log("D - Source: " + result[3]);
  Logger.log("G - Họ tên: " + result[6]);
  Logger.log("H - Năm sinh: " + result[7]);
  Logger.log("I - Giới tính: " + result[8]);
  Logger.log("J - SĐT: " + result[9]);
  Logger.log("K - Email: " + result[10]);
  Logger.log("L - Nơi ở: " + result[11]);
  Logger.log("M - Brand: " + result[12]);
  Logger.log("N - TA User: " + result[13]);
  Logger.log("R - Kinh nghiệm: " + result[17]);
  Logger.log("X - Link CV: " + result[23]);
  Logger.log("AM - Thời gian apply: " + result[38]);

  Logger.log("");
  Logger.log("✅ Test mapping THÀNH CÔNG!");

  try {
    SpreadsheetApp.getUi().alert(
      "✅ Test mapping thành công!\n\nXem chi tiết: View → Execution log",
    );
  } catch (e) {}

  return result;
}

/**
 * Kiểm tra kết nối đến các spreadsheets - CHẠY HÀM NÀY TRƯỚC
 */
function testConnections() {
  Logger.log("=== BẮT ĐẦU KIỂM TRA KẾT NỐI ===");
  var results = [];

  // Test datapool
  try {
    var datapoolSS = SpreadsheetApp.openById(CONFIG.DATAPOOL_SPREADSHEET_ID);
    var sheet = datapoolSS.getSheetByName(CONFIG.DATAPOOL_SHEET_NAME);
    if (sheet) {
      var msg =
        "✅ Datapool: OK - " +
        datapoolSS.getName() +
        " (" +
        sheet.getLastRow() +
        " rows)";
      results.push(msg);
      Logger.log(msg);
    } else {
      var msg =
        '❌ Datapool: Sheet "' + CONFIG.DATAPOOL_SHEET_NAME + '" không tồn tại';
      results.push(msg);
      Logger.log(msg);
    }
  } catch (e) {
    var msg = "❌ Datapool: FAILED - " + e.toString();
    results.push(msg);
    Logger.log(msg);
  }

  results.push("");

  // Test forms
  for (var i = 0; i < CONFIG.FORM_SHEETS.length; i++) {
    var formConfig = CONFIG.FORM_SHEETS[i];
    try {
      var formSS = SpreadsheetApp.openById(formConfig.spreadsheetId);
      var sheet = formSS.getSheetByName(formConfig.sheetName);
      if (sheet) {
        var rowCount = sheet.getLastRow() - 1;
        var msg =
          "✅ Form " +
          (i + 1) +
          " (" +
          formConfig.taUser +
          "): OK - " +
          formSS.getName() +
          " (" +
          rowCount +
          " responses)";
        results.push(msg);
        Logger.log(msg);
      } else {
        var msg =
          "❌ Form " +
          (i + 1) +
          ': Sheet "' +
          formConfig.sheetName +
          '" không tồn tại';
        results.push(msg);
        Logger.log(msg);
      }
    } catch (e) {
      var msg =
        "❌ Form " +
        (i + 1) +
        " (" +
        formConfig.taUser +
        "): FAILED - " +
        e.toString();
      results.push(msg);
      Logger.log(msg);
    }
  }

  var message = "=== KẾT QUẢ KIỂM TRA ===\n\n" + results.join("\n");
  Logger.log("");
  Logger.log(message);

  try {
    SpreadsheetApp.getUi().alert(message);
  } catch (e) {}

  return results;
}
