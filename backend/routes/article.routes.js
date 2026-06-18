import express from 'express';
import {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  toggleShareArticle,
  getPublicArticleById,
} from '../controllers/article.controller.js';
import verifyToken from '../middlewares/verifyToken.middleware.js';

const router = express.Router();

// Tuyến định tuyến công khai (Public) - Không cần token xác thực
router.get('/public/:id', getPublicArticleById);

// Tất cả các tuyến định tuyến bên dưới đều cần xác thực bằng JWT Token
router.use(verifyToken);

router.route('/')
  .post(createArticle)
  .get(getArticles);

router.patch('/:id/share', toggleShareArticle);

router.route('/:id')
  .get(getArticleById)
  .put(updateArticle)
  .delete(deleteArticle);

export default router;
