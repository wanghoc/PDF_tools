# PDF Tools — Kiến trúc & Vận hành (Tiếng Việt)

## Tổng quan

- Frontend: React + Vite + TypeScript, xử lý PDF/Ảnh ngay trên trình duyệt bằng `pdf-lib` và `pdfjs-dist`.
- Backend: Node.js + Express (Helmet, CORS, Rate limit, Multer, Pino). Cung cấp health check và nền tảng mở rộng cho các tác vụ nặng (nén PDF thực).

## Sơ đồ cấu trúc

```
Frontend (Vite + React + TS)
  ├─ Merge/Split/Image/PDF tools (client-side)
  └─ UI (Header, Footer, Pages)

Backend (Express)
  ├─ /api/health
  ├─ /api/upload (cơ sở cho jobs)
  └─ /api/jobs (sườn), /api/download (sườn)
```

## Luồng xử lý

- Ghép PDF: đọc các File (ArrayBuffer) → `PDFDocument.load` → `copyPages` → `save` → tải xuống.
- Chia PDF: chọn page indices theo phạm vi → `copyPages` → `save` từng tệp → tự động tải.
- PDF → Ảnh: `pdfjs-dist` render theo DPI/format/quality → `canvas.toBlob` → tải ảnh.
- Ảnh → PDF: `embedJpg/embedPng` hoặc chuyển GIF/WEBP sang PNG bằng canvas → fit vào trang theo lề/khổ giấy.

## Vận hành

- Phát triển:
  - Frontend: `cd frontend && npm run dev` (http://localhost:3000)
  - Backend: `cd backend && npm run dev` hoặc `npm start` (http://localhost:5000)
- Build: `cd frontend && npm run build` → ra `frontend/dist`

## Bảo mật & Giới hạn

- Helmet, CORS, Rate limit
- Multer kiểm tra loại/kích thước tệp (50MB, tối đa 10 tệp)

## Mở rộng (gợi ý)

- Nén PDF thật: backend route gọi Ghostscript/pdfcpu
- Hàng đợi: Redis + BullMQ cho tác vụ dài
- Lưu trữ/Tải xuống an toàn: URL ký số + S3/GCS
- Xác thực/Quota: JWT hoặc API key

## Sự cố thường gặp

- Trùng cổng 5000: dừng backend cũ hoặc đổi `PORT`
- Worker PDF lỗi: đảm bảo import worker của `pdfjs-dist` vẫn đúng
- Thiết bị yếu: hạ DPI/chất lượng, chia nhỏ tài liệu

## Liên hệ

- GitHub: https://github.com/wanghoc
- Facebook: https://www.facebook.com/wanghoctrieu
