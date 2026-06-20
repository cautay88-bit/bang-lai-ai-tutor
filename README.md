# AI Tutor — Ôn thi bằng lái xe B2

Ứng dụng web/PWA với **600 câu hỏi**, **sa hình**, **AI tutor**, **đăng nhập cloud** và **deploy online**.

## Tính năng

- **600 câu** theo 6 chương (file `public/data/bank-600.json`)
- **14+ sa hình** SVG kiểu đề thi (nhìn từ trên, xe màu, vạch đường)
- AI Tutor (OpenAI/Gemini), thi giả lập, theo dõi điểm yếu
- Đăng nhập + đồng bộ tiến độ cloud
- PWA — cài lên điện thoại

## Chạy local

```bash
cd bang-lai-ai-tutor
npm run build    # sinh 600 cau + sa hinh SVG
npm start        # http://localhost:3000
```

## 1. Import 600 câu hỏi

### Tự động (đã có sẵn)
```bash
node scripts/build-600-questions.js
```
Tạo `public/data/bank-600.json` — 100 câu/chương.

### Import từ CSV (bộ câu chính thức)
Chuẩn bị file CSV với header:
```
id,topicId,type,text,optionA,optionB,optionC,optionD,correct,explanation,image
```

```bash
node scripts/import-from-csv.js data/600-cau.csv
```

Xem mẫu: `data/sample-import.csv`

## 2. Sa hình

```bash
node scripts/build-sahinh-svg.js
```

Tạo 12 hình SVG trong `public/images/sa-hinh/`:
ngã tư, vạch sang đường, bùng binh, rẽ trái, đường ưu tiên, cầu hẹp, trường học, cao tốc, đường ray, dốc, xe cứu thương, đèn đỏ rẽ phải.

## 3. Deploy online

### Render (miễn phí)
1. Push code lên GitHub
2. [render.com](https://render.com) → New → Blueprint → chọn repo
3. File `render.yaml` tự cấu hình
4. URL dạng: `https://bang-lai-ai-tutor.onrender.com`

### Railway
1. [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Dùng `Dockerfile` hoặc `railway.toml`
3. Thêm volume cho `/app/data` (lưu user & tiến độ)

### Docker (VPS bất kỳ)
```bash
docker build -t bang-lai-tutor .
docker run -d -p 3000:3000 -v bang-lai-data:/app/data bang-lai-tutor
```

### Biến môi trường
| Biến | Mặc định | Mô tả |
|------|----------|--------|
| `PORT` | 3000 | Cổng server |
| `HOST` | 0.0.0.0 | Bind address |

## Cấu trúc

```
bang-lai-ai-tutor/
├── server.js
├── Dockerfile
├── render.yaml
├── railway.toml
├── package.json
├── scripts/
│   ├── build-600-questions.js
│   ├── build-sahinh-svg.js
│   └── import-from-csv.js
├── public/
│   ├── data/bank-600.json
│   ├── images/sa-hinh/
│   └── js/
└── data/          # user & tiến độ (runtime)
```

## Sau khi deploy

1. Mở URL trên điện thoại
2. Tab **Tài khoản** → đăng ký
3. **Thêm vào màn hình chính** (PWA)
4. Ôn tập 600 câu mọi lúc!
