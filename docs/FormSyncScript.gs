/**
 * ============================================
 * FORM RESPONSE TO DATAPOOL SYNC SCRIPT
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

const CONFIG = {
  // Sheet Datapool (CV Scan-Stores)
  DATAPOOL_SPREADSHEET_ID: '1GvIdlI4VTa0h4UeRjh6YjKV_SmhOU8OSbwSGGlvGTRs',
  DATAPOOL_SHEET_NAME: 'Datapool',
  
  // Danh sách Form Response Sheets
  FORM_SHEETS: [
    {
      spreadsheetId: '1RYqeq81E1WO8ceipByIoTKqwI8M7JuKkaFC-HqPpeIo',
      sheetName: 'Answer list 1',
      taUser: 'User 1'
    },
    {
      spreadsheetId: '1IZHhL_crdWWLvFn8BnAa1mYV91sBHG2kpyI8w9U2dJQ',
      sheetName: 'Answer list 2',
      taUser: 'User 2'
    },
    {
      spreadsheetId: '1Djhf3woGjHuJqrvemmw9VQmmLi_XpuCUkwwOTqw-BmQ',
      sheetName: 'Answer list 3',
      taUser: 'User 3'
    }
  ]
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
  // A: Dấu thời gian, B: Vị trí, C: Nhãn hàng, D: Họ tên, E: Giới tính
  // F: Ngày sinh, G: SĐT, H: Email, I: Địa chỉ, J: Kinh nghiệm, K: CV, L: Nguồn
  
  const timestamp = formRow[0] || '';           // A: Dấu thời gian
  const position = formRow[1] || '';             // B: Vị trí ứng tuyển
  const brand = formRow[2] || '';                // C: Nhãn hàng
  const fullName = formRow[3] || '';             // D: Họ và tên
  const gender = formRow[4] || '';               // E: Giới tính
  const birthDate = formRow[5] || '';            // F: Ngày sinh
  const phone = formRow[6] || '';                // G: Số điện thoại
  const email = formRow[7] || '';                // H: Email
  const address = formRow[8] || '';              // I: Địa chỉ
  const experience = formRow[9] || '';           // J: Kinh nghiệm
  const cvLink = formRow[10] || '';              // K: CV
  const source = formRow[11] || '';              // L: Nguồn tuyển dụng
  
  // Extract năm sinh từ ngày sinh
  const birthYear = extractYear(birthDate);
  
  // Format timestamp
  const formattedTime = formatTimestamp(timestamp);
  
  // Tạo row cho datapool (38 cột: A -> AL)
  // Cấu trúc: Điểm phù hợp, Thời gian, Vị trí ứng tuyển, Source, Job code, Position ID, 
  //           Họ và Tên, Năm sinh, Giới tính, Số điện thoại, Email, Nơi ở, Brand, TA User,
  //           Ngành tốt nghiệp, Năm tốt nghiệp, Loại tốt nghiệp, Lịch sử làm việc, Task công việc,
  //           Kỹ năng, Chứng chỉ, Tóm tắt, Sự phù hợp, Link Hồ sơ, TA duyệt nội dung, Ghi chú,
  //           CV Tiềm năng, Kết quả, Lý do TD thất bại, Kết quả bài Test / Screen CV,
  //           Ngày HR PV, Ngày PV vòng 1, Ngày PV vòng 2, Ngày gửi Offer, Ngày bắt đầu,
  //           Ngày chính thức, Note, Vòng Rejected, Thời gian apply
  
  return [
    '',                // A: Điểm phù hợp
    formattedTime,     // B: Thời gian
    position,          // C: Vị trí ứng tuyển
    source,            // D: Source
    '',                // E: Job code
    '',                // F: Position ID
    fullName,          // G: Họ và Tên
    birthYear,         // H: Năm sinh
    gender,            // I: Giới tính
    formatPhone(phone),// J: Số điện thoại
    email,             // K: Email
    address,           // L: Nơi ở
    brand,             // M: Brand
    taUser,            // N: TA User
    '',                // O: Ngành tốt nghiệp
    '',                // P: Năm tốt nghiệp
    '',                // Q: Loại tốt nghiệp
    experience,        // R: Lịch sử làm việc
    '',                // S: Task công việc
    '',                // T: Kỹ năng
    '',                // U: Chứng chỉ
    '',                // V: Tóm tắt
    '',                // W: Sự phù hợp
    cvLink,            // X: Link Hồ sơ
    '',                // Y: TA duyệt nội dung
    '',                // Z: Ghi chú
    '',                // AA: CV Tiềm năng
    '',                // AB: Kết quả
    '',                // AC: Lý do TD thất bại
    '',                // AD: Kết quả bài Test / Screen CV
    '',                // AE: Ngày HR PV
    '',                // AF: Ngày PV vòng 1
    '',                // AG: Ngày PV vòng 2
    '',                // AH: Ngày gửi Offer
    '',                // AI: Ngày bắt đầu
    '',                // AJ: Ngày chính thức
    '',                // AK: Note
    '',                // AL: Vòng Rejected
    formattedTime      // AM: Thời gian apply
  ];
}

/**
 * Extract năm từ ngày sinh
 * Hỗ trợ format: dd/mm/yyyy, mm/dd/yyyy, yyyy-mm-dd, hoặc chỉ năm
 */
function extractYear(dateStr) {
  if (!dateStr) return '';
  
  // Nếu là Date object
  if (dateStr instanceof Date) {
    return dateStr.getFullYear().toString();
  }
  
  const str = dateStr.toString().trim();
  
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

/**
 * Format timestamp thành chuỗi đọc được
 */
function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  
  if (timestamp instanceof Date) {
    return Utilities.formatDate(timestamp, 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss');
  }
  
  return timestamp.toString();
}

/**
 * Format số điện thoại (đảm bảo có số 0 đầu)
 */
function formatPhone(phone) {
  if (!phone) return '';
  
  let str = phone.toString().trim();
  
  // Nếu bắt đầu bằng 84, thay bằng 0
  if (str.startsWith('84') && str.length > 9) {
    str = '0' + str.substring(2);
  }
  
  // Nếu không có số 0 đầu và có 9 số
  if (!str.startsWith('0') && str.length === 9) {
    str = '0' + str;
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
    const spreadsheetId = e.source.getId();
    
    // Tìm config tương ứng với form này
    const formConfig = CONFIG.FORM_SHEETS.find(
      f => f.spreadsheetId === spreadsheetId
    );
    
    if (!formConfig) {
      console.log('Form không được cấu hình: ' + spreadsheetId);
      return;
    }
    
    // Lấy dữ liệu row mới
    const formRow = e.values;
    
    // Kiểm tra dữ liệu có hợp lệ
    if (!formRow || formRow.length < 4) {
      console.log('Dữ liệu không hợp lệ');
      return;
    }
    
    // Map và thêm vào datapool
    const result = addToDatapool(formRow, formConfig.taUser);
    
    if (result) {
      console.log('✅ Đã sync thành công cho: ' + formConfig.taUser + ' - ' + formRow[3]);
    }
    
  } catch (error) {
    console.error('❌ Lỗi onFormSubmit: ' + error.toString());
    // Gửi email thông báo lỗi (tùy chọn)
    // sendErrorEmail(error);
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
    throw new Error('Không tìm thấy sheet: ' + CONFIG.DATAPOOL_SHEET_NAME);
  }
  
  // Kiểm tra trùng lặp (dựa vào SĐT + Email + Thời gian)
  const phone = formRow[6] || '';
  const email = formRow[7] || '';
  const timestamp = formRow[0] || '';
  
  if (isDuplicate(datapoolSheet, phone, email, timestamp)) {
    console.log('⚠️ Dữ liệu đã tồn tại, bỏ qua: ' + phone + ' - ' + email);
    return false;
  }
  
  // Map dữ liệu
  const mappedRow = mapFormToDatapool(formRow, taUser);
  
  // Thêm vào hàng cuối
  datapoolSheet.appendRow(mappedRow);
  
  return true;
}

/**
 * Kiểm tra dữ liệu trùng lặp
 */
function isDuplicate(sheet, phone, email, timestamp) {
  // Lấy dữ liệu từ cột J (SĐT), K (Email), B (Thời gian)
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false; // Chỉ có header
  
  // Chỉ kiểm tra 100 dòng cuối để tăng tốc độ
  const startRow = Math.max(2, lastRow - 100);
  const numRows = lastRow - startRow + 1;
  
  const phoneCol = sheet.getRange(startRow, 10, numRows, 1).getValues(); // Cột J = 10
  const emailCol = sheet.getRange(startRow, 11, numRows, 1).getValues(); // Cột K = 11
  
  const formattedPhone = formatPhone(phone);
  const formattedEmail = email.toString().toLowerCase().trim();
  
  for (let i = 0; i < numRows; i++) {
    const existingPhone = formatPhone(phoneCol[i][0]);
    const existingEmail = emailCol[i][0].toString().toLowerCase().trim();
    
    // Trùng cả SĐT và Email
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
  const formConfig = CONFIG.FORM_SHEETS[formConfigIndex];
  
  if (!formConfig) {
    throw new Error('Không tìm thấy form config index: ' + formConfigIndex);
  }
  
  // Mở form spreadsheet
  const formSS = SpreadsheetApp.openById(formConfig.spreadsheetId);
  const formSheet = formSS.getSheetByName(formConfig.sheetName);
  
  if (!formSheet) {
    throw new Error('Không tìm thấy sheet: ' + formConfig.sheetName);
  }
  
  // Lấy tất cả dữ liệu (bỏ header row)
  const data = formSheet.getDataRange().getValues();
  const rows = data.slice(1); // Bỏ header
  
  // Mở datapool
  const datapoolSS = SpreadsheetApp.openById(CONFIG.DATAPOOL_SPREADSHEET_ID);
  const datapoolSheet = datapoolSS.getSheetByName(CONFIG.DATAPOOL_SHEET_NAME);
  
  // Map và thêm từng row
  let count = 0;
  let skipped = 0;
  
  rows.forEach(function(row) {
    if (row[0]) { // Chỉ xử lý nếu có timestamp
      const phone = row[6] || '';
      const email = row[7] || '';
      const timestamp = row[0] || '';
      
      if (!isDuplicate(datapoolSheet, phone, email, timestamp)) {
        const mappedRow = mapFormToDatapool(row, formConfig.taUser);
        datapoolSheet.appendRow(mappedRow);
        count++;
      } else {
        skipped++;
      }
    }
  });
  
  const message = 'Đã sync ' + count + ' rows từ ' + formConfig.taUser + 
                  ' (Bỏ qua ' + skipped + ' rows trùng)';
  console.log(message);
  
  try {
    SpreadsheetApp.getUi().alert(message);
  } catch (e) {
    // Nếu không có UI (chạy từ trigger)
  }
  
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
  let totalCount = 0;
  for (let i = 0; i < CONFIG.FORM_SHEETS.length; i++) {
    try {
      totalCount += syncAllFromForm(i);
    } catch (error) {
      console.error('Lỗi sync form ' + i + ': ' + error.toString());
    }
  }
  console.log('Tổng cộng đã sync: ' + totalCount + ' rows');
}

// ==================== SETUP FUNCTIONS ====================

/**
 * Tạo menu custom trong Google Sheets
 */
function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('📊 Form Sync')
      .addItem('🔄 Sync từ Form 1 (User 1)', 'syncFromForm1')
      .addItem('🔄 Sync từ Form 2 (User 2)', 'syncFromForm2')
      .addItem('🔄 Sync từ Form 3 (User 3)', 'syncFromForm3')
      .addSeparator()
      .addItem('🔄 Sync tất cả Forms', 'syncFromAllForms')
      .addSeparator()
      .addItem('⚙️ Cài đặt Trigger tự động', 'setupTriggers')
      .addItem('🗑️ Xóa tất cả Triggers', 'removeAllTriggers')
      .addSeparator()
      .addItem('🧪 Test kết nối', 'testConnections')
      .addItem('🧪 Test mapping', 'testMapping')
      .addToUi();
  } catch (e) {
    // Không có UI
  }
}

/**
 * Cài đặt trigger tự động cho các form
 * QUAN TRỌNG: Chạy hàm này 1 lần để setup trigger
 */
function setupTriggers() {
  // Xóa triggers cũ trước
  removeAllTriggers();
  
  let successCount = 0;
  let errors = [];
  
  // Tạo trigger cho mỗi form spreadsheet
  CONFIG.FORM_SHEETS.forEach(function(formConfig, index) {
    try {
      const formSS = SpreadsheetApp.openById(formConfig.spreadsheetId);
      
      ScriptApp.newTrigger('onFormSubmit')
        .forSpreadsheet(formSS)
        .onFormSubmit()
        .create();
      
      console.log('✅ Đã tạo trigger cho Form ' + (index + 1) + ' (' + formConfig.taUser + ')');
      successCount++;
    } catch (error) {
      const errMsg = 'Form ' + (index + 1) + ': ' + error.toString();
      console.error('❌ ' + errMsg);
      errors.push(errMsg);
    }
  });
  
  let message = '✅ Đã cài đặt ' + successCount + '/' + CONFIG.FORM_SHEETS.length + ' triggers!';
  if (errors.length > 0) {
    message += '\n\n❌ Lỗi:\n' + errors.join('\n');
  }
  
  try {
    SpreadsheetApp.getUi().alert(message);
  } catch (e) {
    console.log(message);
  }
}

/**
 * Xóa tất cả triggers
 */
function removeAllTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(trigger) {
    ScriptApp.deleteTrigger(trigger);
  });
  console.log('🗑️ Đã xóa ' + triggers.length + ' triggers');
}

// ==================== TEST FUNCTIONS ====================

/**
 * Test mapping với dữ liệu mẫu
 */
function testMapping() {
  const sampleRow = [
    new Date(),                                  // Timestamp
    'Nhân viên bán hàng - Sales Advisor',        // Position
    'Supersports',                               // Brand
    'Nguyễn Văn A',                              // Name
    'Nam',                                       // Gender
    '25/02/1995',                                // Birth date
    '0935123123',                                // Phone
    'test@gmail.com',                            // Email
    'Quận 1, TP.HCM',                            // Address
    'Đã làm việc 2 năm tại ABC',                 // Experience
    'https://drive.google.com/cv.pdf',           // CV
    'Group Facebook'                             // Source
  ];
  
  const result = mapFormToDatapool(sampleRow, 'User 1');
  
  console.log('=== KẾT QUẢ MAPPING ===');
  console.log('Số cột: ' + result.length);
  console.log('');
  console.log('B - Thời gian: ' + result[1]);
  console.log('C - Vị trí: ' + result[2]);
  console.log('D - Source: ' + result[3]);
  console.log('G - Họ tên: ' + result[6]);
  console.log('H - Năm sinh: ' + result[7]);
  console.log('I - Giới tính: ' + result[8]);
  console.log('J - SĐT: ' + result[9]);
  console.log('K - Email: ' + result[10]);
  console.log('L - Nơi ở: ' + result[11]);
  console.log('M - Brand: ' + result[12]);
  console.log('N - TA User: ' + result[13]);
  console.log('R - Kinh nghiệm: ' + result[17]);
  console.log('X - Link CV: ' + result[23]);
  console.log('AM - Thời gian apply: ' + result[38]);
  
  try {
    SpreadsheetApp.getUi().alert('✅ Test mapping thành công!\n\nXem chi tiết trong Logs (View → Logs)');
  } catch (e) {}
  
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
    if (sheet) {
      results.push('✅ Datapool: OK - ' + datapoolSS.getName() + ' (' + sheet.getLastRow() + ' rows)');
    } else {
      results.push('❌ Datapool: Sheet "' + CONFIG.DATAPOOL_SHEET_NAME + '" không tồn tại');
    }
  } catch (e) {
    results.push('❌ Datapool: FAILED - ' + e.toString());
  }
  
  results.push('');
  
  // Test forms
  CONFIG.FORM_SHEETS.forEach(function(formConfig, index) {
    try {
      const formSS = SpreadsheetApp.openById(formConfig.spreadsheetId);
      const sheet = formSS.getSheetByName(formConfig.sheetName);
      if (sheet) {
        results.push('✅ Form ' + (index + 1) + ' (' + formConfig.taUser + '): OK - ' + 
                     formSS.getName() + ' (' + (sheet.getLastRow() - 1) + ' responses)');
      } else {
        results.push('❌ Form ' + (index + 1) + ': Sheet "' + formConfig.sheetName + '" không tồn tại');
      }
    } catch (e) {
      results.push('❌ Form ' + (index + 1) + ' (' + formConfig.taUser + '): FAILED - ' + e.toString());
    }
  });
  
  const message = '=== KẾT QUẢ KIỂM TRA ===\n\n' + results.join('\n');
  console.log(message);
  
  try {
    SpreadsheetApp.getUi().alert(message);
  } catch (e) {}
  
  return results;
}

/**
 * Hiển thị hướng dẫn sử dụng
 */
function showHelp() {
  const help = `
=== HƯỚNG DẪN SỬ DỤNG ===

1. KIỂM TRA KẾT NỐI:
   - Chạy hàm testConnections()
   - Đảm bảo tất cả sheets đều OK

2. CÀI ĐẶT TRIGGER TỰ ĐỘNG:
   - Chạy hàm setupTriggers()
   - Từ giờ mỗi khi có form submit, dữ liệu sẽ tự động sync

3. SYNC THỦ CÔNG:
   - syncFromForm1() - Sync từ Answer list 1
   - syncFromForm2() - Sync từ Answer list 2
   - syncFromForm3() - Sync từ Answer list 3
   - syncFromAllForms() - Sync từ tất cả forms

4. XEM LOGS:
   - View → Logs (hoặc Ctrl + Enter)

5. LỖI THƯỜNG GẶP:
   - "Bad Request 400": Đăng xuất tất cả accounts, dùng Incognito
   - "Permission denied": Share sheets với account đang dùng
   - "Sheet not found": Kiểm tra tên sheet trong CONFIG
  `;
  
  console.log(help);
  
  try {
    SpreadsheetApp.getUi().alert(help);
  } catch (e) {}
}
