# Khắc Phục Lỗi: Frontend Tự Động Thoát Ra Trang Đăng Nhập

## Vấn Đề
Khi sử dụng bất kỳ chức năng nào, frontend tự động redirect về trang đăng nhập.

## Nguyên Nhân
1. **Token cũ từ Java backend**: Nếu bạn đã đăng nhập với Java backend trước đó, token đó không hợp lệ với Node.js backend (secret key khác)
2. **Token hết hạn**: Token đã hết hạn
3. **Token không được gửi**: Frontend không gửi token trong request

## Giải Pháp

### Bước 1: Đăng Nhập Lại
**QUAN TRỌNG**: Sau khi chuyển từ Java sang Node.js backend, bạn **PHẢI đăng nhập lại**.

1. Mở browser
2. Vào trang đăng nhập: `http://localhost:3000/login`
3. Đăng nhập với:
   - Username: `root`
   - Password: `root123`

### Bước 2: Kiểm Tra Token
Mở Browser Console (F12) và chạy:
```javascript
// Kiểm tra token
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
```

Nếu cả hai đều `null` → Bạn chưa đăng nhập, cần đăng nhập lại.

### Bước 3: Xóa Token Cũ (Nếu Cần)
Nếu vẫn gặp vấn đề, xóa token cũ:
```javascript
localStorage.removeItem('token');
localStorage.removeItem('user');
// Sau đó refresh trang và đăng nhập lại
```

### Bước 4: Kiểm Tra Backend Logs
Khi gọi API, kiểm tra backend logs:
- Nếu thấy `❌ JWT verification failed` → Token không hợp lệ, cần đăng nhập lại
- Nếu thấy `⚠️ No valid Authorization header` → Token không được gửi từ frontend

## Debug

### Kiểm Tra Network Tab
1. Mở DevTools (F12) → Network
2. Thử sử dụng một chức năng
3. Tìm request bị lỗi 401
4. Kiểm tra Headers:
   - Phải có: `Authorization: Bearer <token>`
   - Nếu không có → Token không được gửi

### Kiểm Tra Console
Trong Browser Console, bạn sẽ thấy:
- `⚠️ Authentication error:` → Có lỗi authentication
- `🔄 Redirecting to login` → Đang redirect về login

## Lưu Ý

- **Mỗi lần chuyển backend** (Java → Node.js hoặc ngược lại), bạn cần **đăng nhập lại**
- Token từ backend này **KHÔNG** hoạt động với backend kia
- Nếu backend Node.js khởi động lại, token vẫn hợp lệ (nếu chưa hết hạn)

## Test Authentication

Sau khi đăng nhập, test bằng cách:
```javascript
// Trong Browser Console
fetch('http://localhost:8080/api/menu', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => console.log('✅ Auth OK:', data))
.catch(err => console.error('❌ Auth Failed:', err));
```

Nếu thấy `✅ Auth OK` → Authentication hoạt động bình thường.

