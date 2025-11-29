# Hướng Dẫn Commit và Push lên GitHub

## Cách 1: Sử dụng Script Batch (Đơn giản nhất)

1. Mở File Explorer và điều hướng đến thư mục `DevOpsDT`
2. Double-click vào file `COMMIT-AND-PUSH.bat`
3. Script sẽ tự động:
   - Add tất cả các file đã thay đổi
   - Commit với message "update"
   - Push lên GitHub

## Cách 2: Sử dụng PowerShell

1. Mở PowerShell trong thư mục `DevOpsDT`
2. Chạy lệnh:
   ```powershell
   .\auto-commit.ps1
   ```

## Cách 3: Chạy thủ công

Mở terminal trong thư mục `DevOpsDT` và chạy các lệnh sau:

```bash
# Add tất cả file
git add .

# Commit với message "update"
git commit -m "update"

# Kiểm tra remote (nếu chưa có thì thêm)
git remote get-url origin
# Nếu chưa có, chạy:
# git remote add origin https://github.com/vanduc1012/DevOpsDT.git

# Push lên GitHub
git push -u origin main
```

## Lưu ý

- Nếu lần đầu push, có thể cần pull trước:
  ```bash
  git pull origin main --allow-unrelated-histories
  ```

- Đảm bảo bạn đã cấu hình GitHub credentials (username/password hoặc token)

