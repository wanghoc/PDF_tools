# PDF Tools — Hướng dẫn sử dụng (Tiếng Việt)

PDF Tools là bộ công cụ PDF chạy trên nền web. Phần lớn tính năng xử lý ngay trên trình duyệt của bạn (không tải file lên server), giúp nhanh và riêng tư.

## Tính năng

- Ghép PDF: Kết hợp nhiều tệp PDF thành một
- Chia PDF: Chia theo khoảng trang và tải về từng tệp
- PDF → Ảnh: Xuất trang PDF thành ảnh (PNG/JPEG/WebP) theo DPI/chất lượng
- Ảnh → PDF: Tạo PDF từ ảnh với khổ giấy/định hướng/lề
- Nén PDF: Giao diện mẫu (có thể bật nén thật ở backend)

## Yêu cầu

- Node.js ≥ 18
- npm (hoặc yarn)

## Cài đặt

```bash
# Tại thư mục dự án
cd backend && npm install
cd ../frontend && npm install
```

## Chạy hệ thống

Cách 1: Chạy riêng từng dịch vụ (khuyến nghị để tránh trùng cổng)

```bash
# Terminal 1 (Backend):
cd backend
npm run dev   # hoặc npm start
# Backend tại http://localhost:5000

# Terminal 2 (Frontend):
cd frontend
npm run dev
# Frontend tại http://localhost:3000
```

Cách 2: Chạy cùng lúc (cần `concurrently`)

```bash
npm run dev
```

Lưu ý: Tránh để backend đang chạy sẵn rồi lại chạy `dev:backend` lần nữa → sẽ báo lỗi EADDRINUSE (cổng 5000 đã dùng).

## Cấu trúc dự án

```
PDF_converter/
├── backend/                 # Express server (bảo mật, CORS, upload, health)
│   ├── server.js
│   └── package.json
├── frontend/                # Ứng dụng React + Vite + TypeScript
│   ├── src/
│   │   ├── pages/           # Ghép/Chia/PDF↔Ảnh/Nén (UI)
│   │   ├── components/      # Header, Footer
│   │   └── App.tsx, main.tsx
│   └── package.json
├── README.md                # Hướng dẫn (tiếng Anh)
├── README.vi.md             # Hướng dẫn (tiếng Việt)
└── ARCHITECTURE.md          # Kiến trúc & vận hành (tiếng Anh)
```

## Cách hoạt động (tóm tắt)

- Trình duyệt: `pdf-lib`, `pdfjs-dist` để xử lý PDF/Ảnh trực tiếp ⇒ nhanh, riêng tư
- Backend: `/api/health` và nền tảng cho tác vụ máy chủ (ví dụ nén PDF thật)

## Khắc phục sự cố

- Cổng 5000 đang dùng (EADDRINUSE): tắt tiến trình backend cũ hoặc đổi `PORT`
- Lỗi worker PDF: giữ nguyên import worker `pdfjs-dist` trong `PDFToImage.tsx`
- Tệp lớn gây lỗi bộ nhớ trên trình duyệt: giảm DPI/chất lượng hoặc chia nhỏ PDF trước

## Liên hệ

- GitHub: https://github.com/wanghoc
- Facebook: https://www.facebook.com/wanghoctrieu

## Giấy phép

MIT
