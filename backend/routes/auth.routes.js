import express from 'express';
import { register, login, googleLogin } from '../controllers/auth.controller.js';

const router = express.Router();

// Định tuyến API Đăng ký tài khoản mới
router.post('/register', register);

// Định tuyến API Đăng nhập hệ thống
router.post('/login', login);

// Định tuyến API Đăng nhập/Đăng ký nhanh bằng Google
router.post('/google', googleLogin);

export default router;
