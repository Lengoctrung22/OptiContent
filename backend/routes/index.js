import express from 'express';
import aiRoutes from './ai.routes.js';
import authRoutes from './auth.routes.js';
import articleRoutes from './article.routes.js';

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

export default router;
