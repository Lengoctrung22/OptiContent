import express from 'express';
import { handleGenerateText, handleChat } from '../controllers/ai.controller.js';
// import protect from '../middlewares/auth.middleware.js'; // Bật lên nếu muốn giới hạn chỉ cho user đã đăng nhập gọi AI

const router = express.Router();

// Route cho việc sinh text thông thường (Ví dụ: viết email, tóm tắt...)
router.post('/generate', handleGenerateText);

// Route cho việc trò chuyện hội thoại có ghi nhớ lịch sử chat
router.post('/chat', handleChat);

export default router;
