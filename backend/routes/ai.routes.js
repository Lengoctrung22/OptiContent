import express from 'express';
import { handleGenerateText, handleChat, handleGenerateFromDocument } from '../controllers/ai.controller.js';
import verifyToken from '../middlewares/verifyToken.middleware.js';
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

// Tất cả các tuyến định tuyến bên dưới đều yêu cầu xác thực bằng token JWT
router.use(verifyToken);

// Route cho việc sinh text thông thường (Ví dụ: viết email, tóm tắt...)
router.post('/generate', handleGenerateText);

// Route cho việc sinh text dựa theo tài liệu đính kèm
router.post('/generate-from-document', upload.single('document'), handleGenerateFromDocument);

// Route cho việc trò chuyện hội thoại có ghi nhớ lịch sử chat
router.post('/chat', handleChat);

export default router;
