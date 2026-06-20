# Thư mục ảnh — chỉ cần copy file vào đúng tên

Demo đang dùng **ảnh mẫu từ Unsplash**. Khi bạn có ảnh thật, **copy vào đúng đường dẫn** (giữ nguyên tên file). Trang web sẽ tự dùng ảnh của bạn thay cho ảnh mẫu.

## Cấu trúc thư mục

```
images/
├── home/
│   └── hero.jpg          ← Ảnh full màn trang chủ
├── rooms/
│   ├── hero.jpg
│   ├── deluxe.jpg
│   ├── suite.jpg
│   └── penthouse.jpg
├── dining/
│   ├── hero.jpg
│   ├── garden.jpg
│   └── skybar.jpg
├── experiences/
│   ├── hero.jpg
│   ├── spa.jpg
│   └── yoga.jpg
├── about/
│   ├── hero.jpg
│   └── story.jpg
├── contact/
│   └── hero.jpg
├── booking/
│   └── hero.jpg
└── brand/
    └── logo.svg          ← Logo (hoặc logo.png — sửa trong content/*.json)
```

## Gợi ý kích thước

| Loại | Kích thước gợi ý |
|------|------------------|
| Hero (full màn) | 1920×1080 hoặc 2400×1350, JPG 80–85% |
| Phòng / dining | 1200×1500 (tỷ lệ 4:5) hoặc 1600×1000 |
| Logo | SVG hoặc PNG nền trong suốt |

## Đổi text & thông tin khách sạn

Sửa file (không cần đụng HTML):

- Tiếng Việt: `content/vi.json`
- English: `content/en.json`

Trong đó có tên khách sạn, địa chỉ, mô tả phòng, giá, v.v.

## Lưu ý

- Tên file phải **trùng** với đường dẫn trong JSON (vd. `deluxe.jpg`).
- Nếu thiếu file ảnh, web vẫn hiển thị ảnh Unsplash tạm thời.
