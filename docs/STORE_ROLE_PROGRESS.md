# Store Role Implementation - Work in Progress

## Ngày cập nhật: 2026-02-02

---

## ✅ Đã hoàn thành

### 1. API Routes đã cập nhật cho Store:

| Endpoint                      | File                                 | Trạng thái                               |
| ----------------------------- | ------------------------------------ | ---------------------------------------- |
| `GET /api/candidates`         | `app/api/candidates/route.ts`        | ✅ Hỗ trợ dual-source (HO/ST)            |
| `POST /api/candidates/update` | `app/api/candidates/update/route.ts` | ✅ Route đúng sheet dựa vào `dataSource` |
| `POST /api/upload`            | `app/api/upload/route.ts`            | ✅ Route đúng folder/sheet dựa vào role  |
| `GET /api/jobs`               | `app/api/jobs/route.ts`              | ✅ Fetch từ cả 2 sheets cho Manager      |
| `POST /api/jobs`              | `app/api/jobs/route.ts`              | ✅ Kiểm tra cả 2 sheets trước khi update |
| `POST /api/jobs/stop`         | `app/api/jobs/stop/route.ts`         | ✅ Kiểm tra role để route đúng sheet     |

### 2. Frontend Components:

| Component                    | Trạng thái                              |
| ---------------------------- | --------------------------------------- |
| `components/Reports.tsx`     | ✅ Sử dụng `dataSource` để filter group |
| `components/KanbanBoard.tsx` | ✅ Có Source Filter và Badge            |

### 3. Environment Variables (đã có hardcoded fallback):

```env
GOOGLE_SHEET_ID_ST=1GvIdlI4VTa0h4UeRjh6YjKV_SmhOU8OSbwSGGlvGTRs
GOOGLE_DRIVE_INPUT_FOLDER_ID_ST=1SDb4cW8taRLfJ2uxClijyYysJI6l3SSk
```

---

## ⚠️ Việc cần làm thủ công

### 1. Xóa dữ liệu sai trong HO sheet:

- **File:** HO Google Sheet (`191CzArhWOeyCeRPHlhSbibMG-q_qfW3k2YUCPLvG06w`)
- **Sheet:** `Jobs`
- **Hành động:** Xóa các dòng job của Store đã ghi nhầm vào đây (ví dụ: job 456)

### 2. Tạo cấu trúc sheet "Job" trong Store file:

- **File:** Store Google Sheet (`1GvIdlI4VTa0h4UeRjh6YjKV_SmhOU8OSbwSGGlvGTRs`)
- **Sheet name:** `Job` (không phải "Jobs")
- **Cấu trúc cột:**

| Cột | Tên         | Mô tả                                  |
| --- | ----------- | -------------------------------------- |
| A   | Position ID | ID vị trí                              |
| B   | JobCode     | Mã job (quan trọng - dùng để tìm kiếm) |
| C   | Title       | Tên vị trí                             |
| D   | Group       | "Store"                                |
| E   | Status      | "Hiring" hoặc "Stopped"                |
| F   | StopDate    | Ngày dừng (ISO format)                 |
| G   | Reason      | Lý do dừng                             |

---

## 🔄 Việc còn dang dở

### 1. Test lại Stop Recruitment với ST_Recruiter:

- Sau khi xóa job 456 khỏi HO sheet
- Đăng nhập với tài khoản ST_Recruiter
- Click "Stop Recruitment" cho job Store
- Kiểm tra log xem có ghi vào Store sheet không

### 2. Kiểm tra Report View:

- Đăng nhập ST_Recruiter
- Xem Reports có filter "Store" mặc định không
- Kiểm tra CV của Store có được đếm đúng không

### 3. Components chưa cập nhật cho Store:

- [ ] `DatapoolTable.tsx` - Thêm Source column và filter
- [ ] Các dialog/form khác nếu có

---

## 📝 Debug Logs để kiểm tra

Khi test, xem Vercel Function Logs cho các request sau:

1. **POST /api/jobs/stop** - Xem:

   ```
   User role: ST_Recruiter
   Found in Store: true/false
   Decision: Create NEW in Store
   Writing to: Job in 1GvIdlI4VTa...
   ```

2. **GET /api/candidates** - Xem:
   ```
   📊 Fetching candidates for role: ST_Recruiter
   ```

---

## 🗂️ File quan trọng

- **Walkthrough:** `c:\Users\ns20372840\.gemini\antigravity\brain\8e099b46-cf41-4869-a021-ec044e7e085b\walkthrough.md`
- **Project Context:** `c:\Users\ns20372840\.gemini\antigravity\scratch\cbs-recruitment-web\.agent\PROJECT_CONTEXT.md`

---

## 🐛 Lỗi đã phát hiện và sửa

1. ❌ `/api/jobs/stop` chỉ dùng HO sheet → ✅ Đã thêm dual-sheet check + role routing
2. ❌ `SPREADSHEET_ID_ST` fallback rỗng → ✅ Đã thêm hardcoded fallback
3. ❌ Reports filter dùng `jobCode.startsWith("ST")` → ✅ Đã đổi sang dùng `dataSource`

---

## 📅 Tiếp theo (cho ngày mai)

1. Hoàn tất test với tài khoản ST_Recruiter thực
2. Xác nhận dữ liệu ghi đúng sheet
3. Cập nhật DatapoolTable.tsx nếu cần
4. Xóa debug logging sau khi xác nhận hoạt động
5. Commit final và cập nhật documentation
