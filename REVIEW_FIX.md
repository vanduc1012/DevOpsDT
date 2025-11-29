# 🔧 Hướng Dẫn Sửa Lỗi "Not Found" Khi Submit Review

## Nguyên nhân lỗi

Lỗi "Not Found" xảy ra khi:
1. **Backend chưa restart** sau khi thêm route mới
2. **Route chưa được load** đúng cách
3. **API endpoint không đúng**

## Cách khắc phục

### Bước 1: Kiểm tra Backend có đang chạy không

```bash
cd backend-nodejs
npm run dev
```

Hoặc nếu dùng Docker:
```bash
docker-compose restart backend
```

### Bước 2: Kiểm tra Route đã được đăng ký

Mở file `backend-nodejs/server.js` và đảm bảo có dòng:
```javascript
const reviewRoutes = require('./routes/reviews');
app.use('/api/reviews', reviewRoutes);
```

### Bước 3: Kiểm tra API endpoint

Mở browser và truy cập:
```
http://localhost:8080/api/health
```

Nếu trả về `{"status":"UP"}`, backend đang chạy.

### Bước 4: Test API Review

Mở browser console (F12) và kiểm tra:
- Xem có lỗi gì trong Network tab không
- Kiểm tra request URL có đúng `/api/reviews` không
- Kiểm tra response status code

### Bước 5: Kiểm tra Token

Đảm bảo bạn đã đăng nhập và có token trong localStorage:
```javascript
localStorage.getItem('token')
```

## Debug Steps

1. **Mở Developer Tools (F12)**
2. **Vào tab Network**
3. **Thử submit review lại**
4. **Xem request details:**
   - URL: Phải là `http://your-backend-url/api/reviews`
   - Method: POST
   - Headers: Phải có `Authorization: Bearer <token>`
   - Status: Nếu là 404, route chưa được đăng ký

## Nếu vẫn lỗi

1. **Kiểm tra backend logs** xem có lỗi gì không
2. **Restart backend** hoàn toàn
3. **Kiểm tra MongoDB connection**
4. **Kiểm tra file `routes/reviews.js` có lỗi syntax không**

## Test thủ công

Bạn có thể test API bằng cách gọi trực tiếp:

```javascript
// Trong browser console
fetch('http://localhost:8080/api/reviews', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  },
  body: JSON.stringify({
    menuItemId: 'YOUR_MENU_ITEM_ID',
    rating: 5,
    comment: 'Test review'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

Nếu vẫn lỗi, hãy kiểm tra:
- Backend có đang chạy không
- Route có được đăng ký đúng không
- Token có hợp lệ không

