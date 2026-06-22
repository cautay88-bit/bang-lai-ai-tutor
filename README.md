# AI Tutor — Ôn thi bằng lái xe hạng B

Ứng dụng web/PWA với **600 câu hỏi chính thức** (Công văn 2262/CSGT-P5), **biển báo & sa hình**, **AI tutor**, **đăng nhập cloud** và **deploy online**.

## Tính năng

- **600 câu** chính thức theo 6 chương (180 / 25 / 58 / 37 / 185 / 115)
- **60 câu điểm liệt** (Phụ lục III)
- **Thi giả lập hạng B**: 30 câu / 20 phút / đạt 27/30 + không sai điểm liệt
- Ảnh biển báo & sa hình trích từ PDF gốc
- AI Tutor (OpenAI/Gemini), theo dõi điểm yếu
- PWA — cài lên điện thoại

## Chạy local

```bash
cd bang-lai-ai-tutor
npm start        # http://localhost:3000
```

## Import 600 câu từ PDF chính thức

Đặt file PDF tại `data/bo-600-official.pdf`, sau đó:

```bash
npm run import-pdf
```

Script `scripts/import-from-pdf.js` sẽ:
- Parse 600 câu hỏi + đáp án (gạch chân trong PDF)
- Gắn 60 câu điểm liệt
- Trích ảnh biển báo / sa hình vào `public/images/official/`
- Tạo `public/data/bank-600.json`

## Deploy online

### Render (miễn phí)
1. Push code lên GitHub
2. [render.com](https://render.com) → New → Blueprint → chọn repo
3. File `render.yaml` tự cấu hình

### Docker
```bash
docker build -t bang-lai-tutor .
docker run -d -p 3000:3000 -v bang-lai-data:/app/data bang-lai-tutor
```

## Cấu trúc

```
bang-lai-ai-tutor/
├── data/bo-600-official.pdf
├── scripts/import-from-pdf.js
├── public/data/bank-600.json
├── public/images/official/
└── public/js/
```

## Cấu trúc đề thi hạng B (2262)

| Phần | Số câu |
|------|--------|
| Chương I (quy tắc) | 8 |
| Điểm liệt | 1 |
| Chương II, III, IV | 1 + 1 + 1 |
| Chương V (biển báo) | 9 |
| Chương VI (sa hình) | 9 |
| **Tổng** | **30 câu / 20 phút** |

Điều kiện đạt: **≥ 27/30** và **không sai câu điểm liệt**.
