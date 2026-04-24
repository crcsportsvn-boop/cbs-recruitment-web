# Hướng dẫn Relaunch Phiên bản Hoàn thiện (Launch Guide)

Tài liệu này hướng dẫn cách khôi phục lại phiên bản code **5a447ca** (phiên bản đã tối ưu Kanban, Job Status Filter và sửa các lỗi hiển thị) khi bạn sẵn sàng cho ngày Launching chính thức.

## Thông tin các phiên bản hiện tại
1. **Nhánh `main` (Hiện tại)**: Đã quay về commit `bb5c101` theo yêu cầu của bạn để chạy trên Vercel.
2. **Nhánh `prod-stable-v1`**: Lưu trữ toàn bộ code hoàn thiện nhất (bao gồm các tính năng Job Status Filter, thu nhỏ nút, fix lỗi hiển thị, v.v.) tại commit `5a447ca`.

---

## Cách khôi phục lại phiên bản 5a447ca để Launching

Khi bạn muốn đưa phiên bản hoàn thiện lên lại Vercel (nhánh main), hãy thực hiện các lệnh sau tại terminal:

### Cách 1: Ghi đè nhánh main bằng phiên bản hoàn thiện (Khuyên dùng)
Lệnh này sẽ đưa toàn bộ code từ nhánh lưu trữ sang nhánh chính để Vercel tự động deploy.

```bash
# 1. Chuyển về nhánh main
git checkout main

# 2. Ghi đè code từ nhánh prod-stable-v1 vào main
git reset --hard prod-stable-v1

# 3. Đẩy code lên GitHub để Vercel cập nhật
git push origin main --force
```

### Cách 2: Chuyển hướng Deployment trên Vercel (Nếu không muốn dùng terminal)
1. Truy cập vào trang quản trị của dự án trên **Vercel Dashboard**.
2. Vào phần **Settings** -> **Git**.
3. Thay đổi **Production Branch** từ `main` thành `prod-stable-v1`.
4. Vercel sẽ tự động build và deploy từ nhánh này cho các lần sau.

---

## Lưu ý quan trọng
- Nhánh `prod-stable-v1` đã được bảo lưu an toàn trên GitHub, bạn không bao giờ lo bị mất code ở version này.
- Khi làm việc tiếp trên nhánh `main`, nếu bạn có thêm thay đổi mới, hãy nhớ rằng việc `reset --hard` ở Cách 1 sẽ xóa các thay đổi đó để quay về đúng bản Launching.

---
*Dành cho: dinhsang031*
*Ngày tạo: 17/03/2026*
