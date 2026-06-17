# OptiContent - MERN Stack & Gemini AI Boilerplate

Dự án này là cấu trúc chuẩn dành cho ứng dụng MERN Stack (MongoDB, Express, React, Node) tích hợp Google Gemini AI API.

## 🚀 Hướng dẫn khởi chạy nhanh

### 1. Cài đặt các thư viện (Dependencies)
Chạy lệnh duy nhất ở thư mục gốc để tự động cài đặt dependencies cho cả Root, Backend và Frontend:
```bash
npm run install-all
```

### 2. Cấu hình biến môi trường
- Vào thư mục `/backend` tạo tệp `.env` từ `.env.example` và cập nhật thông tin:
  - `MONGO_URI`: Địa chỉ kết nối MongoDB của bạn.
  - `GEMINI_API_KEY`: API Key lấy từ Google AI Studio.
  - `JWT_SECRET`: Khóa bí mật dùng để mã hóa JSON Web Token.
- Vào thư mục `/frontend` tạo tệp `.env` từ `.env.example` và cập nhật thông tin (nếu cần).

### 3. Chạy dự án ở chế độ Phát triển (Development)
Chạy lệnh sau ở thư mục gốc để chạy đồng thời cả Backend (Express) và Frontend (Vite):
```bash
npm run dev
```

Server backend sẽ khởi chạy tại: `http://localhost:5000`
Frontend React sẽ chạy tại: `http://localhost:5173` (hoặc cổng tiếp theo trống)
