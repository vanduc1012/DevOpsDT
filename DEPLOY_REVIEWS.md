# 🚀 Hướng Dẫn Deploy Chức Năng Reviews Lên Server AWS

## ⚠️ Vấn Đề Hiện Tại

Backend đang chạy trên AWS EC2 nhưng **chưa có code reviews mới**. Cần deploy code mới lên server.

## 📋 Các Bước Deploy

### Cách 1: Deploy Qua SSH (Khuyến nghị)

1. **Kết nối SSH vào server:**
```bash
ssh -i your-key.pem ubuntu@ec2-3-27-83-177.ap-southeast-2.compute.amazonaws.com
```

2. **Di chuyển đến thư mục backend:**
```bash
cd /path/to/backend-nodejs
# Hoặc nếu dùng git:
cd ~/DevOpsDT/backend-nodejs
```

3. **Pull code mới từ GitHub:**
```bash
git pull origin main
```

4. **Cài đặt dependencies (nếu có thay đổi):**
```bash
npm install
```

5. **Restart backend:**
```bash
# Nếu dùng PM2:
pm2 restart backend
# hoặc
pm2 restart all

# Nếu dùng systemd:
sudo systemctl restart backend

# Nếu chạy trực tiếp:
# Dừng process cũ (Ctrl+C hoặc kill)
npm run dev
```

### Cách 2: Deploy Qua Git (Nếu server có auto-deploy)

1. **Commit và push code lên GitHub:**
```bash
git add .
git commit -m "Add review system"
git push origin main
```

2. **Server sẽ tự động pull và restart** (nếu có webhook/CI/CD setup)

### Cách 3: Copy Files Thủ Công

1. **Copy files lên server:**
```bash
# Từ máy local
scp -i your-key.pem backend-nodejs/models/Review.js ubuntu@ec2-3-27-83-177.ap-southeast-2.compute.amazonaws.com:/path/to/backend-nodejs/models/
scp -i your-key.pem backend-nodejs/routes/reviews.js ubuntu@ec2-3-27-83-177.ap-southeast-2.compute.amazonaws.com:/path/to/backend-nodejs/routes/
scp -i your-key.pem backend-nodejs/models/MenuItem.js ubuntu@ec2-3-27-83-177.ap-southeast-2.compute.amazonaws.com:/path/to/backend-nodejs/models/
scp -i your-key.pem backend-nodejs/server.js ubuntu@ec2-3-27-83-177.ap-southeast-2.compute.amazonaws.com:/path/to/backend-nodejs/
```

2. **SSH vào server và restart:**
```bash
ssh -i your-key.pem ubuntu@ec2-3-27-83-177.ap-southeast-2.compute.amazonaws.com
cd /path/to/backend-nodejs
pm2 restart backend
```

## ✅ Kiểm Tra Sau Khi Deploy

1. **Test API endpoint:**
```bash
curl http://ec2-3-27-83-177.ap-southeast-2.compute.amazonaws.com:8080/api/reviews
```

2. **Kiểm tra logs:**
```bash
# Nếu dùng PM2:
pm2 logs backend

# Hoặc xem log file:
tail -f /path/to/backend-nodejs/logs/app.log
```

3. **Test từ browser:**
- Mở: `http://ec2-3-27-83-177.ap-southeast-2.compute.amazonaws.com:8080/api/health`
- Phải trả về: `{"status":"UP"}`

## 🔍 Debug Nếu Vẫn Lỗi

1. **Kiểm tra route có được load không:**
```bash
# SSH vào server
# Xem file server.js có dòng này không:
grep "reviewRoutes" /path/to/backend-nodejs/server.js
```

2. **Kiểm tra file có tồn tại không:**
```bash
ls -la /path/to/backend-nodejs/routes/reviews.js
ls -la /path/to/backend-nodejs/models/Review.js
```

3. **Kiểm tra lỗi khi start:**
```bash
# Xem console khi restart
pm2 logs backend --lines 50
```

## 📝 Files Cần Deploy

Đảm bảo các files sau được deploy:
- ✅ `backend-nodejs/models/Review.js` (mới)
- ✅ `backend-nodejs/routes/reviews.js` (mới)
- ✅ `backend-nodejs/models/MenuItem.js` (đã cập nhật)
- ✅ `backend-nodejs/server.js` (đã cập nhật)

## 🎯 Quick Fix (Nếu cần test ngay)

Nếu không thể deploy ngay, bạn có thể test local bằng cách:
1. Chạy backend local: `cd backend-nodejs && npm run dev`
2. Đổi API URL trong `frontend/src/api/axios.js` thành `http://localhost:8080`
3. Test lại chức năng review

Sau khi deploy xong, đổi lại API URL về server AWS.

