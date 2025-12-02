# Hướng dẫn cập nhật sản phẩm "123" thành "Sữa chua"

## Cách 1: Qua giao diện (Khuyến nghị)

1. Đăng nhập với tài khoản Admin
2. Vào trang **Quản Lý Menu** (`/admin/menu`)
3. Tìm sản phẩm có tên **"123"**
4. Click nút **"Sửa"**
5. Trong form:
   - **Tên món**: Đổi thành `Sữa chua`
   - **URL hình ảnh**: Click vào nút `anhsuachua` trong danh sách "Ảnh có sẵn" (hoặc nhập `/images/anhsuachua.jpg`)
   - Xem preview ảnh hiển thị bên dưới
6. Click **"Lưu"**

## Cách 2: Chạy script tự động

Nếu bạn muốn tự động hóa, chạy script sau:

```bash
cd backend-nodejs
node scripts/updateProduct.js
```

Script sẽ tự động:
- Tìm sản phẩm có tên "123"
- Đổi tên thành "Sữa chua"
- Thêm imageUrl: `/images/anhsuachua.jpg`

## Lưu ý

- File ảnh `anhsuachua.jpg` đã có trong thư mục `frontend/public/images/`
- Sau khi cập nhật, ảnh sẽ hiển thị tự động trên trang menu

