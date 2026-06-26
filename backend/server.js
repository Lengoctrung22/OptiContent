import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import mainRouter from './routes/index.js';
import errorHandler from './middlewares/error.middleware.js';

// Tải cấu hình từ các biến môi trường
dotenv.config();

// Kết nối tới cơ sở dữ liệu MongoDB và khởi chạy các tác vụ khôi phục giao dịch
connectDB().then(async () => {
  try {
    const { processPendingTransactionsOnStartup } = await import('./controllers/payment.controller.js');
    await processPendingTransactionsOnStartup();
  } catch (err) {
    console.error('[Server] Không thể chạy tác vụ khôi phục giao dịch khi khởi động:', err.message);
  }
});

const app = express();

// Thiết lập các middleware chung
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Hỗ trợ tải ảnh đại diện dạng base64 dung lượng lớn
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Log request khi đang chạy ở chế độ phát triển
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Định nghĩa tiền tố API v1
app.use('/api/v1', mainRouter);

// Bắt lỗi các API Router không tồn tại (404 Not Found)
app.use((req, res, next) => {
  res.status(404);
  const error = new Error(`Đường dẫn API không khả dụng - ${req.originalUrl}`);
  next(error);
});

// Middleware xử lý lỗi toàn cục
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Server] Đang chạy trên cổng ${PORT} ở chế độ ${process.env.NODE_ENV || 'development'}`);
});
