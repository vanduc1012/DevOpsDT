# Hệ Thống Quản Lý Quán Cafe

## Công Nghệ Sử Dụng
- **Backend**: Spring Boot 3.x
- **Frontend**: React 18
- **Database**: PostgreSQL 15
- **Container**: Docker & Docker Compose

## Tính Năng

### Quản Lý Người Dùng
- Đăng ký tài khoản (vai trò mặc định: USER)
- Đăng nhập
- Root user mặc định (username: root, password: root123)

### Quản Lý Menu (Admin)
- Thêm/Sửa/Xóa sản phẩm
- Quản lý giá và mô tả

### Quản Lý Bàn (Admin)
- Tạo/Sửa/Xóa bàn
- Trạng thái: AVAILABLE, OCCUPIED, PAID

### Đặt Bàn (User)
- Xem danh sách bàn trống
- Đặt bàn và order món
- Chọn số lượng món

### Quản Lý Order (Admin)
- Xem tất cả order theo bàn
- Cập nhật trạng thái bàn

### Báo Cáo (Admin)
- Tổng số khách trong ngày
- Tổng doanh thu trong ngày

## Cài Đặt & Chạy

### Yêu Cầu
- Docker Desktop
- Docker Compose

### Khởi Động Hệ Thống
```bash
docker-compose up -d
```

### Truy Cập
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Database: localhost:5432

### Tài Khoản Mặc Định
- **Root User**: 
  - Username: `root`
  - Password: `root123`
  - Role: ADMIN

### Dừng Hệ Thống
```bash
docker-compose down
```

### Xóa Dữ Liệu
```bash
docker-compose down -v
```

## Cấu Trúc Project
```
web_cafe/
├── backend/           # Spring Boot Application
├── frontend/          # React Application
└── docker-compose.yml # Docker configuration
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Đăng ký
- POST `/api/auth/login` - Đăng nhập

### Menu (Admin)
- GET `/api/menu` - Lấy danh sách menu
- POST `/api/menu` - Tạo món mới
- PUT `/api/menu/{id}` - Cập nhật món
- DELETE `/api/menu/{id}` - Xóa món

### Tables (Admin)
- GET `/api/tables` - Lấy danh sách bàn
- POST `/api/tables` - Tạo bàn mới
- PUT `/api/tables/{id}` - Cập nhật bàn
- DELETE `/api/tables/{id}` - Xóa bàn

### Orders
- GET `/api/orders` - Lấy danh sách order
- POST `/api/orders` - Tạo order mới
- PUT `/api/orders/{id}/status` - Cập nhật trạng thái

### Reports (Admin)
- GET `/api/reports/daily` - Báo cáo ngày
