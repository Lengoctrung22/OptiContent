import express from 'express';
import {
  getAdminStats,
  getSystemHealth,
  getUsers,
  updateUserRole,
  toggleUserStatus,
  resetUserPassword,
  getPlans,
  updatePlan,
  createPlan,
  getTransactions,
  getSettings,
  updateSettings,
  getSystemLogs,
  clearSystemLogs,
} from '../controllers/admin.controller.js';
import { verifyToken, isAdmin } from '../middlewares/verifyToken.middleware.js';

const router = express.Router();

// Bắt buộc đăng nhập và phải có vai trò Admin đối với tất cả các tuyến định tuyến bên dưới
router.use(verifyToken);
router.use(isAdmin);

// 1. Thống kê & Sức khỏe hệ thống
router.get('/stats', getAdminStats);
router.get('/health', getSystemHealth);

// 2. Quản lý người dùng
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', toggleUserStatus);
router.post('/users/:id/reset-password', resetUserPassword);

// 3. Quản lý gói cước
router.get('/plans', getPlans);
router.post('/plans', createPlan);
router.put('/plans/:id', updatePlan);

// 4. Lịch sử giao dịch thanh toán
router.get('/transactions', getTransactions);

// 5. Cấu hình hệ thống động
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// 6. Terminal System Logs
router.get('/logs', getSystemLogs);
router.delete('/logs', clearSystemLogs);

export default router;
