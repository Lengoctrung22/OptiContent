import express from 'express';
import { getUserProfile, updateUserProfile, changeUserPassword } from '../controllers/user.controller.js';
import verifyToken from '../middlewares/verifyToken.middleware.js';

const router = express.Router();

// Tất cả các tuyến định tuyến bên dưới đều yêu cầu xác thực bằng token JWT
router.use(verifyToken);

// Lấy thông tin hồ sơ người dùng
router.get('/profile', getUserProfile);

// Cập nhật thông tin hồ sơ
router.put('/profile', updateUserProfile);

// Thay đổi mật khẩu tài khoản
router.put('/password', changeUserPassword);

export default router;
