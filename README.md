# Serenity Hotel — Demo website

Demo giao diện khách sạn (phong cách tối giản, tham khảo Aman), **6 trang + đặt phòng**, **VI / EN**.

## Xem demo trên máy

Trang cần **local server** (trình duyệt chặn tải file JSON khi mở trực tiếp `file://`).

### Cách 1 — Python (nếu đã cài)

```bash
cd hotel-demo
python -m http.server 8080
```

Mở: http://localhost:8080/vi/index.html

### Cách 2 — VS Code / Cursor

Cài extension **Live Server**, chuột phải `vi/index.html` → **Open with Live Server**.

### Cách 3 — Node (nếu đã cài)

```bash
npx serve hotel-demo -p 8080
```

## Cấu trúc

| Thư mục / file | Mục đích |
|----------------|----------|
| `vi/`, `en/` | 6 trang + booking mỗi ngôn ngữ |
| `content/vi.json`, `en.json` | Toàn bộ chữ, giá, đường dẫn ảnh |
| `images/` | **Bạn upload ảnh vào đây** (xem `images/README.md`) |
| `assets/` | CSS + JavaScript |

## Trang có sẵn

1. Trang chủ — `vi/index.html`
2. Phòng — `rooms.html`
3. Ẩm thực — `dining.html`
4. Trải nghiệm — `experiences.html`
5. Về chúng tôi — `about.html`
6. Liên hệ — `contact.html`
7. Đặt phòng — `booking.html` (form demo, chưa gửi email)

## Thay ảnh của bạn (3 bước)

1. Chuẩn bị ảnh JPG (xem kích thước trong `images/README.md`).
2. Copy vào đúng thư mục, ví dụ: `images/home/hero.jpg`.
3. Refresh trình duyệt — ảnh của bạn thay ảnh Unsplash.

Không cần sửa HTML.

## Đổi tên khách sạn, giá, mô tả

Mở `content/vi.json` và `content/en.json`, sửa các trường trong `site`, `rooms`, `dining`, v.v.

## Bước tiếp theo (khi bạn sẵn sàng)

- Gắn **Directus** (admin upload ảnh trên web, không cần copy file tay).
- Đưa lên **VPS** + tên miền + form booking gửi email thật.

---

*Đây là bản demo giai đoạn 1. Nút "Demo" góc màn hình sẽ gỡ khi lên production.*
"# hotel-demo" 
