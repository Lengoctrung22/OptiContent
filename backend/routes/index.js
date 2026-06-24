import express from 'express';
import aiRoutes from './ai.routes.js';
import authRoutes from './auth.routes.js';
import articleRoutes from './article.routes.js';
import userRoutes from './user.routes.js';
import adminRoutes from './admin.routes.js';
import paymentRoutes from './payment.routes.js';

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
router.use('/auth', authRoutes);
router.use('/articles', articleRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/payments', paymentRoutes);

export default router;
