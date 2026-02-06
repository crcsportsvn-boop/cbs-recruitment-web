# Store Recruitment Form Sync System

## 📋 Tổng quan hệ thống

Hệ thống đồng bộ dữ liệu ứng viên từ Google Forms vào Datapool trung tâm, phục vụ cho quy trình tuyển dụng Stores (cửa hàng).

### Kiến trúc

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Google Form   │     │   Google Form   │     │   Google Form   │
│   (Mr. Vũ)      │     │   (Ms. Cam)     │     │ (Ms. Phương Anh)│
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │ onFormSubmit          │ onFormSubmit          │ onFormSubmit
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │   Google Apps Script   │
                    │   (FormSyncScript)     │
                    └────────────┬───────────┘
                                 │
                                 │ appendRow()
                                 ▼
                    ┌────────────────────────┐
                    │   CV Scan-Stores       │
                    │   (Datapool Sheet)     │
                    └────────────────────────┘
                                 │
                                 │ API Integration
                                 ▼
                    ┌────────────────────────┐
                    │   CBS Recruitment      │
                    │   Web Application      │
                    └────────────────────────┘
```

---

## 📊 Data Sources (Google Forms)

### Form 1 - Mr. Vũ

- **Spreadsheet ID**: `1RYqeq81E1WO8ceipByIoTKqwI8M7JuKkaFC-HqPpeIo`
- **Sheet Name**: `Answer list 1`
- **Link**: https://docs.google.com/spreadsheets/d/1RYqeq81E1WO8ceipByIoTKqwI8M7JuKkaFC-HqPpeIo

### Form 2 - Ms. Cam

- **Spreadsheet ID**: `1IZHhL_crdWWLvFn8BnAa1mYV91sBHG2kpyI8w9U2dJQ`
- **Sheet Name**: `Answer list 2`
- **Link**: https://docs.google.com/spreadsheets/d/1IZHhL_crdWWLvFn8BnAa1mYV91sBHG2kpyI8w9U2dJQ

### Form 3 - Ms. Phương Anh

- **Spreadsheet ID**: `1Djhf3woGjHuJqrvemmw9VQmmLi_XpuCUkwwOTqw-BmQ`
- **Sheet Name**: `Answer list 3`
- **Link**: https://docs.google.com/spreadsheets/d/1Djhf3woGjHuJqrvemmw9VQmmLi_XpuCUkwwOTqw-BmQ

---

## 🗄️ Data Destination (Datapool)

### CV Scan-Stores

- **Spreadsheet ID**: `1GvIdlI4VTa0h4UeRjh6YjKV_SmhOU8OSbwSGGlvGTRs`
- **Sheet Name**: `Datapool`
- **Link**: https://docs.google.com/spreadsheets/d/1GvIdlI4VTa0h4UeRjh6YjKV_SmhOU8OSbwSGGlvGTRs

---

## 🔄 Data Mapping

### Input (Google Form - 12 cột)

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

### Output (Datapool - 39 cột)

| Cột  | Tên trường           | Mapping từ Form           | Format                                  |
| ---- | -------------------- | ------------------------- | --------------------------------------- |
| A    | Điểm phù hợp         | (để trống)                |                                         |
| B    | Thời gian            | Dấu thời gian             | `dd/MM/yyyy`                            |
| C    | Vị trí ứng tuyển     | Vị trí bạn muốn ứng tuyển |                                         |
| D    | Source               | Nguồn tuyển dụng          |                                         |
| E    | Job code             | (để trống)                |                                         |
| F    | Position ID          | (để trống)                |                                         |
| G    | Họ và Tên            | Họ và tên                 |                                         |
| H    | Năm sinh             | Extract từ Ngày sinh      | `yyyy`                                  |
| I    | Giới tính            | Giới tính                 |                                         |
| J    | Số điện thoại        | Số điện thoại             | Tự động thêm số 0                       |
| K    | Email                | Email                     |                                         |
| L    | Nơi ở                | Địa chỉ                   |                                         |
| M    | Brand                | Nhãn hàng                 |                                         |
| N    | TA User              | Từ config script          | `Mr. Vũ` / `Ms. Cam` / `Ms. Phương Anh` |
| O-Q  | Thông tin tốt nghiệp | (để trống)                |                                         |
| R    | Lịch sử làm việc     | Kinh nghiệm               |                                         |
| S-W  | Thông tin bổ sung    | (để trống)                |                                         |
| X    | Link Hồ sơ           | CV link                   |                                         |
| Y-AL | Tracking fields      | (để trống)                |                                         |
| AM   | Thời gian apply      | Dấu thời gian             | `2026-02-02T11:14:49.438Z` (ISO)        |

---

## ⚙️ Google Apps Script

### File Location

Script được lưu trong Apps Script của sheet Datapool:

- **Link**: https://script.google.com (mở từ Extensions → Apps Script trong Datapool sheet)

### Các hàm chính

| Hàm                                  | Mô tả                                    |
| ------------------------------------ | ---------------------------------------- |
| `onFormSubmit(e)`                    | Trigger tự động khi có form submit mới   |
| `mapFormToDatapool(formRow, taUser)` | Map dữ liệu từ form sang datapool format |
| `addToDatapool(formRow, taUser)`     | Thêm dữ liệu vào Datapool sheet          |
| `isDuplicate(sheet, phone, email)`   | Kiểm tra trùng lặp dựa trên SĐT + Email  |
| `syncFromForm1/2/3()`                | Sync thủ công từ từng form               |
| `syncFromAllForms()`                 | Sync tất cả forms                        |
| `setupTriggers()`                    | Cài đặt trigger tự động                  |
| `testConnections()`                  | Kiểm tra kết nối đến các sheets          |
| `testMapping()`                      | Test mapping với dữ liệu mẫu             |

### Triggers

Script sử dụng `onFormSubmit` trigger để tự động sync khi có response mới:

```javascript
ScriptApp.newTrigger("onFormSubmit")
  .forSpreadsheet(formSS)
  .onFormSubmit()
  .create();
```

---

## 🌐 Web Application API

### Base URL

```
https://cbs-recruitment-web.vercel.app/api
```

### Endpoints liên quan đến Stores

| Method | Endpoint               | Mô tả                         |
| ------ | ---------------------- | ----------------------------- |
| GET    | `/candidates?group=st` | Lấy danh sách ứng viên Stores |
| PATCH  | `/candidates/update`   | Cập nhật thông tin ứng viên   |
| GET    | `/jobs?group=st`       | Lấy danh sách job Stores      |
| POST   | `/jobs`                | Tạo job mới                   |

### Environment Variables

```env
SPREADSHEET_ID_ST=1GvIdlI4VTa0h4UeRjh6YjKV_SmhOU8OSbwSGGlvGTRs
SHEET_NAME_CV_SCAN_ST=Datapool
```

---

## 🔧 Maintenance

### Thêm Form mới

1. Mở Apps Script của Datapool sheet
2. Thêm config mới vào `CONFIG.FORM_SHEETS`:

```javascript
{
  spreadsheetId: 'NEW_SPREADSHEET_ID',
  sheetName: 'Answer list X',
  taUser: 'New TA Name'
}
```

3. Chạy `setupTriggers()` để cập nhật triggers

### Troubleshooting

| Vấn đề               | Giải pháp                                      |
| -------------------- | ---------------------------------------------- |
| Không sync tự động   | Kiểm tra triggers trong Apps Script → Triggers |
| Lỗi permission       | Share sheet với account chạy script            |
| Dữ liệu bị trùng     | Script tự động kiểm tra trùng SĐT + Email      |
| Sai format thời gian | Kiểm tra timezone trong script                 |

---

## 📅 Changelog

### 2026-02-03

- ✅ Tạo Google Apps Script sync form responses
- ✅ Cấu hình 3 forms với 3 TA Users
- ✅ Format thời gian: cột B (dd/MM/yyyy), cột AM (ISO format)
- ✅ Tích hợp với Datapool sheet
- ✅ Kiểm tra trùng lặp theo SĐT + Email

---

## 📁 Project Files

```
cbs-recruitment-web/
├── docs/
│   ├── FormSyncScript_v2.gs      # Google Apps Script (production)
│   ├── FormSyncScript.gs         # Google Apps Script (backup)
│   ├── google-apps-script-form-sync.md  # Hướng dẫn chi tiết
│   └── STORE-FORM-SYNC-SYSTEM.md # Document này
├── app/
│   └── api/
│       ├── candidates/           # API endpoints cho candidates
│       └── jobs/                 # API endpoints cho jobs
└── .env.example                  # Environment variables template
```
