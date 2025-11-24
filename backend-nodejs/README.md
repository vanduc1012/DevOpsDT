# Cafe Management Backend - Node.js

Backend API cho hệ thống quản lý quán cafe, được xây dựng bằng Node.js và Express.js.

## Công Nghệ

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (MongoDB Atlas)
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Cài Đặt

### 1. Cài đặt dependencies
```bash
cd backend-nodejs
npm install
```

### 2. Cấu hình môi trường
Tạo file `.env` (đã có sẵn) hoặc chỉnh sửa các biến:
- `PORT` - Port server (mặc định: 8080)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key cho JWT
- `CORS_ORIGIN` - Frontend URL

### 3. Khởi động server
```bash
# Development mode (với nodemon - auto reload)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập

### Menu
- `GET /api/menu` - Lấy tất cả món
- `GET /api/menu/available` - Lấy món còn hàng
- `POST /api/menu` - Tạo món mới (Admin)
- `PUT /api/menu/:id` - Cập nhật món (Admin)
- `DELETE /api/menu/:id` - Xóa món (Admin)

### Tables
- `GET /api/tables` - Lấy tất cả bàn
- `GET /api/tables/available` - Lấy bàn trống
- `POST /api/tables` - Tạo bàn mới (Admin)
- `PUT /api/tables/:id` - Cập nhật bàn (Admin)
- `PATCH /api/tables/:id/status` - Cập nhật trạng thái (Admin)

### Orders
- `GET /api/orders` - Lấy tất cả order (Admin)
- `GET /api/orders/my-orders` - Lấy order của user
- `POST /api/orders` - Tạo order mới
- `PATCH /api/orders/:id/status` - Cập nhật trạng thái (Admin)

### Prices (Admin only)
- `GET /api/prices/history` - Lấy lịch sử giá
- `GET /api/prices/history/menu/:id` - Lấy lịch sử giá theo món
- `PUT /api/prices/menu/:id` - Cập nhật giá

### Promotions (Admin only)
- `GET /api/promotions` - Lấy tất cả khuyến mãi
- `GET /api/promotions/active` - Lấy khuyến mãi đang hoạt động
- `POST /api/promotions` - Tạo khuyến mãi
- `PUT /api/promotions/:id` - Cập nhật khuyến mãi
- `POST /api/promotions/:id/toggle` - Bật/tắt khuyến mãi

### Inventory (Admin only)
- `GET /api/inventory` - Lấy tất cả nguyên liệu
- `GET /api/inventory/low-stock` - Lấy nguyên liệu sắp hết
- `POST /api/inventory` - Tạo nguyên liệu
- `POST /api/inventory/:id/import` - Nhập kho
- `POST /api/inventory/:id/export` - Xuất kho
- `POST /api/inventory/:id/adjust` - Điều chỉnh kho
- `GET /api/inventory/transactions` - Lấy lịch sử giao dịch

### Reports (Admin only)
- `GET /api/reports/daily` - Báo cáo ngày
- `GET /api/reports/today` - Báo cáo hôm nay
- `GET /api/reports/monthly` - Báo cáo tháng

## Tài Khoản Mặc Định

Sau khi khởi động lần đầu, hệ thống sẽ tự động tạo:
- **Username**: `root`
- **Password**: `root123`
- **Role**: `ADMIN`

## Cấu Trúc Thư Mục

```
backend-nodejs/
├── config/          # Configuration files
├── middleware/      # Express middleware (auth, etc.)
├── models/         # Mongoose models
├── routes/         # API routes
├── utils/          # Utility functions
├── server.js       # Main server file
├── package.json    # Dependencies
└── .env           # Environment variables
```

## Lưu Ý

- Tất cả endpoints (trừ auth và public GET) yêu cầu authentication
- Endpoints admin yêu cầu role ADMIN
- JWT token được gửi trong header: `Authorization: Bearer <token>`

