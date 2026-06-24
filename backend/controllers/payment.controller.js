import { Plan, Transaction, User, SystemLog } from '../models/index.js';

/**
 * @desc    Lấy danh sách các gói cước đang hoạt động
 * @route   GET /api/v1/payments/plans
 * @access  Private
 */
export const getPlans = async (req, res, next) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ priceMonthly: 1 });
    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function để xử lý khi giao dịch thành công (nâng cấp gói cước, đồng bộ vai trò, reset hạn mức, ghi log)
 */
const processPaymentSuccess = async (transactionCode) => {
  const transaction = await Transaction.findOne({ transactionCode }).populate('plan');
  if (!transaction) return null;
  if (transaction.status === 'success') return { transaction, user: await User.findById(transaction.user) };

  // 1. Cập nhật trạng thái giao dịch
  transaction.status = 'success';
  await transaction.save();

  // 2. Tìm người dùng và nâng cấp hạn mức gói cước
  const user = await User.findById(transaction.user);
  if (!user) {
    throw new Error('Người dùng thực hiện giao dịch không tồn tại!');
  }

  if (!transaction.plan) {
    throw new Error('Gói cước liên kết với giao dịch không tồn tại hoặc đã bị xóa!');
  }

  user.currentPlan = transaction.plan._id;
  
  // Đồng bộ vai trò (Role) của người dùng tương ứng với gói cước vừa đăng ký (trừ khi là Admin)
  if (user.role !== 'Admin') {
    const planSlug = transaction.plan.slug;
    if (planSlug === 'free') {
      user.role = 'User';
    } else if (planSlug === 'creator') {
      user.role = 'Creator';
    } else if (planSlug === 'agency') {
      user.role = 'Agency';
    }
  }

  // Reset hạn mức sử dụng hàng tháng của người dùng
  user.monthlyUsage = {
    wordsUsed: 0,
    imagesUsed: 0,
    resetDate: new Date(),
  };

  await user.save();

  // 3. Ghi nhận log hệ thống
  await SystemLog.create({
    type: 'INFO',
    message: `[Tự động] Người dùng ${user.email} đã thanh toán thành công gói ${transaction.planName} (${transaction.amount.toLocaleString()}đ) qua ${transaction.paymentMethod}`,
    source: 'billing',
    relatedEmail: user.email,
  });

  return { transaction, user };
};

/**
 * @desc    Tạo yêu cầu thanh toán (Transaction pending)
 * @route   POST /api/v1/payments/checkout
 * @access  Private
 */
export const createTransaction = async (req, res, next) => {
  const { planId, paymentMethod } = req.body;

  if (!planId || !paymentMethod) {
    res.status(400);
    return next(new Error('Vui lòng cung cấp gói cước và phương thức thanh toán!'));
  }

  try {
    const plan = await Plan.findById(planId);
    if (!plan) {
      res.status(404);
      return next(new Error('Gói cước không tồn tại hoặc đã bị ẩn!'));
    }

    // Tự động sinh mã giao dịch duy nhất
    const transactionCode = await Transaction.generateTransactionCode();

    // Thiết lập thời hạn 30 ngày cho gói cước
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30);

    const transaction = await Transaction.create({
      transactionCode,
      user: req.user._id,
      plan: plan._id,
      planName: plan.name,
      amount: plan.priceMonthly,
      paymentMethod,
      status: 'pending',
      subscriptionPeriod: {
        startDate,
        endDate,
      },
    });

    // GIẢ LẬP: Sau khi tạo giao dịch 6 giây, hệ thống thanh toán tự động (VietQR/Momo) báo có tiền.
    // Backend sẽ tự động xử lý khớp lệnh giống như nhận webhook thật.
    setTimeout(async () => {
      try {
        console.log(`[Auto-Payment] Bắt đầu tự động duyệt giao dịch ${transactionCode}...`);
        await processPaymentSuccess(transactionCode);
      } catch (err) {
        console.error('Lỗi tự động duyệt giao dịch giả lập:', err);
      }
    }, 6000);

    res.status(201).json({
      success: true,
      message: 'Khởi tạo giao dịch thanh toán thành công!',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Xác thực và hoàn tất thanh toán (Giả lập cập nhật trạng thái giao dịch)
 * @route   POST /api/v1/payments/verify
 * @access  Private
 */
export const verifyPayment = async (req, res, next) => {
  const { transactionCode } = req.body;

  if (!transactionCode) {
    res.status(400);
    return next(new Error('Vui lòng cung cấp mã giao dịch để xác thực!'));
  }

  try {
    const transaction = await Transaction.findOne({ transactionCode }).populate('plan');
    if (!transaction) {
      res.status(404);
      return next(new Error('Không tìm thấy giao dịch với mã tương ứng!'));
    }

    const result = await processPaymentSuccess(transactionCode);
    if (!result) {
      res.status(500);
      return next(new Error('Không thể xử lý giao dịch!'));
    }

    res.status(200).json({
      success: true,
      message: 'Xác thực thanh toán thành công! Gói cước của bạn đã được kích hoạt.',
      data: {
        transaction: result.transaction,
        userProfile: {
          id: result.user._id,
          fullName: result.user.name,
          email: result.user.email,
          avatar: result.user.avatar,
          role: result.user.role,
          status: result.user.status,
          brandVoice: result.user.brandVoice,
          integrations: result.user.integrations,
          currentPlan: result.transaction.plan,
          monthlyUsage: result.user.monthlyUsage,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Lấy trạng thái hiện tại của một giao dịch cụ thể (Phục vụ cho việc Auto-polling ở Frontend)
 * @route   GET /api/v1/payments/status/:transactionCode
 * @access  Private
 */
export const getTransactionStatus = async (req, res, next) => {
  const { transactionCode } = req.params;

  try {
    const transaction = await Transaction.findOne({ transactionCode, user: req.user._id });
    if (!transaction) {
      res.status(404);
      return next(new Error('Không tìm thấy giao dịch!'));
    }

    res.status(200).json({
      success: true,
      status: transaction.status,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Lấy lịch sử giao dịch cá nhân của người dùng
 * @route   GET /api/v1/payments/transactions
 * @access  Private
 */
export const getMyTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .populate('plan', 'name priceMonthly wordLimitDisplay')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};
