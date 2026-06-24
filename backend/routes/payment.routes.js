import express from 'express';
import { 
  getPlans, 
  createTransaction, 
  verifyPayment, 
  getMyTransactions,
  getTransactionStatus
} from '../controllers/payment.controller.js';
import verifyToken from '../middlewares/verifyToken.middleware.js';

const router = express.Router();

// Tất cả các tuyến định tuyến bên dưới đều yêu cầu xác thực bằng JWT Token
router.use(verifyToken);

// Lấy danh sách các gói cước đang hoạt động
router.get('/plans', getPlans);

// Tạo một hóa đơn/giao dịch chờ thanh toán
router.post('/checkout', createTransaction);

// Xác thực thanh toán giả lập để nâng cấp tài khoản
router.post('/verify', verifyPayment);

// Kiểm tra trạng thái giao dịch
router.get('/status/:transactionCode', getTransactionStatus);

// Lấy danh sách lịch sử giao dịch của chính người dùng đó
router.get('/transactions', getMyTransactions);

export default router;
