# 📄 Hướng Dẫn Cài Đặt Chức Năng Export Báo Cáo

## 📦 Cài Đặt Dependencies

Để sử dụng chức năng export PDF và Excel, bạn cần cài đặt các thư viện sau:

```bash
cd frontend
npm install jspdf jspdf-autotable xlsx
```

Hoặc nếu đã có trong `package.json`, chỉ cần:

```bash
cd frontend
npm install
```

## ✅ Các Tính Năng Đã Triển Khai

### 1. **Export PDF**
- Xuất báo cáo doanh thu dạng PDF
- Bao gồm thông tin tổng hợp (tổng đơn, khách, doanh thu, trạng thái đơn)
- Có header, footer với số trang
- Tên file: `BaoCao_YYYYMMDD.pdf` (ngày) hoặc `BaoCao_Thang_YYYYMM.pdf` (tháng)

### 2. **Export Excel**
- Xuất báo cáo doanh thu dạng Excel (.xlsx)
- Sheet 1: Tổng hợp báo cáo
- Sheet 2: Chi tiết đơn hàng (nếu có)
- Tên file: `BaoCao_YYYYMMDD.xlsx` (ngày) hoặc `BaoCao_Thang_YYYYMM.xlsx` (tháng)

### 3. **Cải Thiện Backend**
- API trả về thêm thông tin: `completedOrders`, `pendingOrders`, `cancelledOrders`
- Hỗ trợ tham số `includeOrders=true` để lấy danh sách đơn hàng chi tiết
- Populate thông tin user trong đơn hàng

## 🎯 Cách Sử Dụng

1. **Truy cập trang Báo Cáo** (Admin only):
   - Đăng nhập với tài khoản Admin
   - Vào menu "Báo cáo" hoặc `/admin/reports`

2. **Chọn loại báo cáo**:
   - Theo ngày: Chọn ngày cụ thể
   - Theo tháng: Chọn tháng/năm

3. **Xuất báo cáo**:
   - Click nút **"📄 Xuất PDF"** để xuất PDF
   - Click nút **"📊 Xuất Excel"** để xuất Excel
   - File sẽ tự động tải về

## 📋 Nội Dung Báo Cáo

### PDF/Excel bao gồm:
- **Tiêu đề**: BÁO CÁO DOANH THU
- **Thông tin**: Loại báo cáo (ngày/tháng), ngày xuất
- **Tổng hợp**:
  - Tổng số đơn hàng
  - Tổng số khách
  - Tổng doanh thu
  - Đơn hoàn thành
  - Đơn đang chờ
  - Đơn đã hủy

### Excel thêm:
- **Sheet 2 - Chi tiết đơn hàng**:
  - Mã đơn
  - Ngày đặt
  - Khách hàng
  - Số lượng món
  - Tổng tiền
  - Trạng thái

## 🔧 Cấu Trúc Files

```
frontend/
├── src/
│   ├── utils/
│   │   └── exportUtils.js      # Functions export PDF/Excel
│   ├── pages/
│   │   └── Reports.jsx         # Trang báo cáo với nút export
│   └── api/
│       └── services.js          # Service gọi API (đã cập nhật)

backend-nodejs/
└── routes/
    └── reports.js               # API reports (đã cải thiện)
```

## 🐛 Xử Lý Lỗi

Nếu gặp lỗi khi export:
1. **Kiểm tra dependencies**: Đảm bảo đã cài đặt `jspdf`, `jspdf-autotable`, `xlsx`
2. **Kiểm tra console**: Xem lỗi trong Developer Tools (F12)
3. **Kiểm tra dữ liệu**: Đảm bảo có dữ liệu báo cáo trước khi export

## 💡 Lưu Ý

- Export Excel sẽ bao gồm chi tiết đơn hàng nếu backend trả về
- File PDF/Excel sẽ tự động tải về thư mục Downloads
- Tên file tự động theo ngày/tháng được chọn
- Format tiền tệ: VNĐ với dấu phẩy ngăn cách hàng nghìn

## 🚀 Tính Năng Mở Rộng (Có thể thêm sau)

- Export danh sách đơn hàng riêng
- Export báo cáo kho
- Tự động gửi email báo cáo
- Export với template tùy chỉnh
- Export nhiều báo cáo cùng lúc

