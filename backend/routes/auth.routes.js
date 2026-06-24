import express from 'express';
import { register, login, googleLogin, forgotPassword, resetPassword } from '../controllers/auth.controller.js';

const router = express.Router();

// Định tuyến API Đăng ký tài khoản mới
router.post('/register', register);

// Định tuyến API Đăng nhập hệ thống
router.post('/login', login);

// Định tuyến API Đăng nhập/Đăng ký nhanh bằng Google
router.post('/google', googleLogin);

// Định tuyến API Quên mật khẩu - Gửi email chứa link reset
router.post('/forgot-password', forgotPassword);

// Định tuyến API Đặt lại mật khẩu bằng token
router.post('/reset-password/:token', resetPassword);

export default router;
