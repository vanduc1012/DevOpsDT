# Thông Tin Database

## Vị Trí Database

Database hiện tại đang được lưu trữ trên **MongoDB Atlas** (Cloud Database), không phải trên máy tính local của bạn.

### Thông Tin Kết Nối

- **Loại**: MongoDB Atlas (Cloud)
- **Cluster**: `cluster0.d29cy3o.mongodb.net`
- **Database Name**: `cafe_db`
- **Username**: `vanduc1022`
- **Connection String**: 
  ```
  mongodb+srv://vanduc1022:vanduc123321@cluster0.d29cy3o.mongodb.net/cafe_db?retryWrites=true&w=majority
  ```

## Cách Truy Cập Database

### 1. Truy Cập Qua MongoDB Atlas Website
1. Truy cập: https://www.mongodb.com/cloud/atlas
2. Đăng nhập với tài khoản MongoDB Atlas
3. Chọn cluster `cluster0`
4. Click "Browse Collections" để xem dữ liệu

### 2. Truy Cập Qua MongoDB Compass (Desktop App)
1. Tải MongoDB Compass: https://www.mongodb.com/try/download/compass
2. Cài đặt và mở ứng dụng
3. Dán connection string vào:
   ```
   mongodb+srv://vanduc1022:vanduc123321@cluster0.d29cy3o.mongodb.net/cafe_db
   ```
4. Click "Connect"

### 3. Truy Cập Qua MongoDB Shell (mongosh)
```bash
# Cài đặt MongoDB Shell (nếu chưa có)
# Windows: https://www.mongodb.com/try/download/shell

# Kết nối
mongosh "mongodb+srv://vanduc1022:vanduc123321@cluster0.d29cy3o.mongodb.net/cafe_db"

# Sau khi kết nối, có thể dùng các lệnh:
show dbs                    # Xem danh sách databases
use cafe_db                 # Chọn database
show collections            # Xem danh sách collections
db.users.find()             # Xem tất cả users
db.menu_items.find()        # Xem tất cả menu items
```

## Các Collections (Bảng) Trong Database

Database `cafe_db` chứa các collections sau:

1. **users** - Người dùng (admin, customer)
2. **menu_items** - Món ăn/đồ uống
3. **cafe_tables** - Bàn
4. **orders** - Đơn hàng
5. **ingredients** - Nguyên liệu
6. **price_history** - Lịch sử thay đổi giá
7. **promotions** - Chương trình khuyến mãi
8. **stock_transactions** - Lịch sử nhập/xuất kho

## Thay Đổi Database (Nếu Muốn)

### Chuyển Sang MongoDB Local

Nếu muốn chuyển sang MongoDB local (chạy trên máy tính của bạn):

1. **Cài đặt MongoDB Community Server**:
   - Windows: https://www.mongodb.com/try/download/community
   - Sau khi cài, MongoDB sẽ chạy trên `localhost:27017`

2. **Cập nhật connection string trong `.env`**:
   ```env
   MONGODB_URI=mongodb://localhost:27017/cafe_db
   ```

3. **Khởi động lại backend**:
   ```bash
   npm run dev
   ```

### Tạo Database Mới Trên Atlas

Nếu muốn tạo database mới trên MongoDB Atlas:

1. Đăng nhập MongoDB Atlas
2. Tạo cluster mới (nếu cần)
3. Lấy connection string mới
4. Cập nhật trong file `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/new_database_name
   ```

## Lưu Ý

- ⚠️ **Bảo mật**: Connection string chứa username và password, không nên commit vào Git
- ✅ **Backup**: MongoDB Atlas tự động backup dữ liệu
- ✅ **Truy cập từ mọi nơi**: Vì là cloud database, bạn có thể truy cập từ bất kỳ đâu
- ⚠️ **Giới hạn**: MongoDB Atlas free tier có giới hạn storage và bandwidth

## Kiểm Tra Kết Nối

Để kiểm tra xem backend có kết nối được database không:

1. Khởi động backend
2. Xem logs, tìm dòng: `✅ MongoDB connected successfully`
3. Nếu thấy lỗi, kiểm tra:
   - Connection string đúng chưa
   - IP address có được whitelist trong Atlas chưa
   - Username/password đúng chưa


