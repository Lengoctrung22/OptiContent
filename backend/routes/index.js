import express from 'express';
import aiRoutes from './ai.routes.js';
// import authRoutes from './auth.routes.js'; // Sẽ thêm khi viết thêm auth controller

const router = express.Router();

/**
 * Route kiểm tra sức khỏe hệ thống (Health Check)
 */
router.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Backend server hoạt động bình thường!',
    timestamp: new Date().toISOString()
  });
});

// Gắn các nhánh định tuyến phụ
router.use('/ai', aiRoutes);
// router.use('/auth', authRoutes);

export default router;
