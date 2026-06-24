import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Plan, Transaction, SystemLog, SystemConfig, Article } from '../models/index.js';

/**
 * @desc    Lấy số liệu thống kê tổng quan hệ thống cho Admin
 * @route   GET /api/v1/admin/stats
 * @access  Private/Admin
 */
export const getAdminStats = async (req, res, next) => {
  try {
    // 1. Tổng số người dùng
    const totalUsers = await User.countDocuments();

    // 2. Tổng số từ đã sử dụng (tính tổng từ tất cả bài viết đã tạo)
    const wordStats = await Article.aggregate([
      { $group: { _id: null, totalWords: { $sum: '$stats.wordCount' } } }
    ]);
    const totalWords = wordStats[0]?.totalWords || 0;

    // 3. Doanh thu ước tính (tổng tiền các giao dịch thành công)
    const successfulTransactions = await Transaction.find({ status: 'success' }, 'amount');
    const totalRevenue = successfulTransactions.reduce((acc, tx) => acc + tx.amount, 0);

    // 4. Chi phí API ước tính (Giả sử 1000 từ tốn 8.5 VNĐ chi phí API Gemini/OpenAI)
    const apiCost = Math.round(totalWords * 8.5);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalWords,
        totalRevenue,
        apiCost,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Kiểm tra trạng thái (health) của các dịch vụ hệ thống
 * @route   GET /api/v1/admin/health
 * @access  Private/Admin
 */
export const getSystemHealth = async (req, res, next) => {
  try {
    // 1. Trạng thái kết nối Database (Mongoose)
    const dbStatus = mongoose.connection.readyState === 1 ? 'OK' : 'ERROR';
    const dbPing = dbStatus === 'OK' ? '4ms' : 'N/A';

    // 2. Trạng thái cấu hình Gemini AI
    const geminiConfig = await SystemConfig.findOne({ key: 'geminiKey' });
    const geminiKeyVal = geminiConfig?.value || process.env.GEMINI_API_KEY || '';
    const geminiStatus = geminiKeyVal && !geminiKeyVal.includes('*****') ? 'OK' : 'MISSING_KEY';

    // 3. Trạng thái Mail Service SMTP
    const smtpConfigured = 
      process.env.EMAIL_HOST && 
      process.env.EMAIL_USER && 
      process.env.EMAIL_PASS && 
      process.env.EMAIL_USER !== 'your-email@gmail.com';
    const mailStatus = smtpConfigured ? 'OK' : 'WARNING';

    res.status(200).json({
      success: true,
      data: {
        gateway: 'OK',
        database: {
          status: dbStatus,
          ping: dbPing,
        },
        gemini: {
          status: geminiStatus,
        },
        email: {
          status: mailStatus,
          message: mailStatus === 'OK' ? 'Sẵn sàng gửi mail' : 'Đang sử dụng cấu hình mặc định (chưa kích hoạt)',
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Lấy danh sách tất cả tài khoản người dùng
 * @route   GET /api/v1/admin/users
 * @access  Private/Admin
 */
export const getUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query = {
        $or: [
          { name: { $regex: escapedSearch, $options: 'i' } },
          { email: { $regex: escapedSearch, $options: 'i' } },
        ],
      };
    }

    const users = await User.find(query)
      .populate('currentPlan', 'name priceMonthly wordLimitDisplay')
      .sort({ createdAt: -1 })
      .lean();

    const usersWithOnlineStatus = users.map(user => {
      const isOnline = user.lastActive 
        ? (Date.now() - new Date(user.lastActive).getTime() < 3 * 60 * 1000) // Online if active in last 3 minutes
        : false;
      return {
        ...user,
        isOnline
      };
    });

    res.status(200).json({
      success: true,
      count: usersWithOnlineStatus.length,
      data: usersWithOnlineStatus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cập nhật vai trò (Role) của người dùng
 * @route   PATCH /api/v1/admin/users/:id/role
 * @access  Private/Admin
 */
export const updateUserRole = async (req, res, next) => {
  res.status(403);
  return next(new Error('Tính năng thay đổi vai trò người dùng thủ công đã bị vô hiệu hóa!'));
};

/**
 * @desc    Khóa/Mở khóa tài khoản người dùng (Ban/Unban)
 * @route   PATCH /api/v1/admin/users/:id/status
 * @access  Private/Admin
 */
export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      return next(new Error('Không tìm thấy người dùng!'));
    }

    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      return next(new Error('Bạn không thể tự khóa tài khoản của chính mình!'));
    }

    user.status = user.status === 'Active' ? 'Banned' : 'Active';
    await user.save();

    SystemLog.log(
      user.status === 'Banned' ? 'WARNING' : 'INFO',
      `Admin đã ${user.status === 'Banned' ? 'KHÓA' : 'MỞ KHÓA'} tài khoản ${user.email}`,
      {
        source: 'auth',
        userId: req.user._id,
        email: req.user.email
      }
    ).catch(err => console.error('[SystemLog Error]', err.message));

    res.status(200).json({
      success: true,
      message: `Đã ${user.status === 'Active' ? 'mở khóa' : 'khóa'} tài khoản thành công!`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cấp lại mật khẩu tạm thời cho người dùng
 * @route   POST /api/v1/admin/users/:id/reset-password
 * @access  Private/Admin
 */
export const resetUserPassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      return next(new Error('Không tìm thấy người dùng!'));
    }

    // Tạo mật khẩu ngẫu nhiên tạm thời (8 chữ số)
    const tempPassword = Math.floor(10000000 + Math.random() * 90000000).toString();
    
    // Gán trực tiếp vào user.password (pre-save hook của schema sẽ tự động hash mật khẩu này)
    user.password = tempPassword;
    await user.save();

    SystemLog.log('INFO', `Admin cấp lại mật khẩu tạm thời cho người dùng ${user.email}`, {
      source: 'auth',
      userId: req.user._id,
      email: req.user.email
    }).catch(err => console.error('[SystemLog Error]', err.message));

    res.status(200).json({
      success: true,
      message: `Cấp mật khẩu mới thành công cho ${user.email}`,
      data: {
        email: user.email,
        temporaryPassword: tempPassword
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Lấy danh sách các gói cước trong hệ thống
 * @route   GET /api/v1/admin/plans
 * @access  Private/Admin
 */
export const getPlans = async (req, res, next) => {
  try {
    // Đếm số lượng người dùng thực tế của mỗi gói cước bằng aggregate (Dynamic & Fast)
    const plans = await Plan.find().lean();
    const counts = await User.aggregate([
      { $match: { currentPlan: { $ne: null } } },
      { $group: { _id: '$currentPlan', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    counts.forEach(c => {
      countMap[c._id.toString()] = c.count;
    });

    const plansWithCounts = plans.map(plan => ({
      ...plan,
      usersCount: countMap[plan._id.toString()] || 0
    }));

    res.status(200).json({
      success: true,
      data: plansWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePlan = async (req, res, next) => {
  const { name, priceMonthly, priceDisplay, wordLimit, wordLimitDisplay, imageLimit, imageLimitDisplay, features } = req.body;

  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      res.status(404);
      return next(new Error('Không tìm thấy gói cước!'));
    }

    if (name !== undefined) plan.name = name;
    if (priceMonthly !== undefined) plan.priceMonthly = priceMonthly;
    if (priceDisplay !== undefined) plan.priceDisplay = priceDisplay;
    if (wordLimit !== undefined) plan.wordLimit = wordLimit;
    if (wordLimitDisplay !== undefined) plan.wordLimitDisplay = wordLimitDisplay;
    if (imageLimit !== undefined) plan.imageLimit = imageLimit;
    if (imageLimitDisplay !== undefined) plan.imageLimitDisplay = imageLimitDisplay;
    if (features !== undefined) plan.features = features;

    await plan.save();

    SystemLog.log('INFO', `Admin cập nhật cấu hình gói cước: ${plan.name}`, {
      source: 'billing',
      userId: req.user._id,
      email: req.user.email
    }).catch(err => console.error('[SystemLog Error]', err.message));

    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin gói cước thành công!',
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

export const createPlan = async (req, res, next) => {
  const { name, slug, priceMonthly, priceDisplay, wordLimit, wordLimitDisplay, imageLimit, imageLimitDisplay, features } = req.body;

  if (!name || !slug) {
    res.status(400);
    return next(new Error('Tên gói cước và slug là bắt buộc!'));
  }

  try {
    const planExists = await Plan.findOne({ slug });
    if (planExists) {
      res.status(400);
      return next(new Error('Gói cước với slug này đã tồn tại!'));
    }

    const plan = await Plan.create({
      name,
      slug,
      priceMonthly: priceMonthly || 0,
      priceDisplay: priceDisplay || '0đ',
      wordLimit: wordLimit || 0,
      wordLimitDisplay: wordLimitDisplay || '0 từ',
      imageLimit: imageLimit || 0,
      imageLimitDisplay: imageLimitDisplay || '0 ảnh',
      features: features || [],
      usersCount: 0
    });

    SystemLog.log('INFO', `Admin tạo gói cước mới: ${plan.name}`, {
      source: 'billing',
      userId: req.user._id,
      email: req.user.email
    }).catch(err => console.error('[SystemLog Error]', err.message));

    res.status(201).json({
      success: true,
      message: 'Tạo gói cước mới thành công!',
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * @desc    Lấy lịch sử giao dịch thanh toán
 * @route   GET /api/v1/admin/transactions
 * @access  Private/Admin
 */
export const getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find()
      .populate('user', 'name email')
      .populate('plan', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Lấy cấu hình hệ thống (API keys, System Prompt)
 * @route   GET /api/v1/admin/settings
 * @access  Private/Admin
 */
export const getSettings = async (req, res, next) => {
  try {
    const configs = await SystemConfig.find();
    // Chuyển danh sách thành Object key-value để frontend dễ sử dụng
    const settings = {};
    configs.forEach(config => {
      // Ẩn bớt API key để bảo mật ở phía client nếu là view bình thường,
      // tuy nhiên vì đây là trang Admin nên ta có thể trả về key dạng che giấu một phần hoặc đầy đủ.
      // Chúng ta sẽ trả về đầy đủ để admin có thể sửa và copy.
      settings[config.key] = config.value;
    });

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cập nhật cấu hình hệ thống
 * @route   PUT /api/v1/admin/settings
 * @access  Private/Admin
 */
export const updateSettings = async (req, res, next) => {
  const { geminiKey, openaiKey, langchainPrompt } = req.body;

  try {
    if (geminiKey !== undefined) {
      await SystemConfig.findOneAndUpdate(
        { key: 'geminiKey' },
        { value: geminiKey },
        { upsert: true }
      );
    }

    if (openaiKey !== undefined) {
      await SystemConfig.findOneAndUpdate(
        { key: 'openaiKey' },
        { value: openaiKey },
        { upsert: true }
      );
    }

    if (langchainPrompt !== undefined) {
      await SystemConfig.findOneAndUpdate(
        { key: 'langchainPrompt' },
        { value: langchainPrompt },
        { upsert: true }
      );
    }

    SystemLog.log('INFO', 'Admin đã thay đổi cấu hình hệ thống (API keys / System Prompt)', {
      source: 'system',
      userId: req.user._id,
      email: req.user.email
    }).catch(err => console.error('[SystemLog Error]', err.message));

    res.status(200).json({
      success: true,
      message: 'Cập nhật cấu hình hệ thống thành công!',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Lấy danh sách nhật ký hệ thống (System Logs) gần đây
 * @route   GET /api/v1/admin/logs
 * @access  Private/Admin
 */
export const getSystemLogs = async (req, res, next) => {
  try {
    const logs = await SystemLog.find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Xóa tất cả nhật ký hệ thống
 * @route   DELETE /api/v1/admin/logs
 * @access  Private/Admin
 */
export const clearSystemLogs = async (req, res, next) => {
  try {
    await SystemLog.deleteMany({});
    
    SystemLog.log('INFO', 'Admin đã xóa sạch nhật ký hệ thống', {
      source: 'system',
      userId: req.user._id,
      email: req.user.email
    }).catch(err => console.error('[SystemLog Error]', err.message));

    res.status(200).json({
      success: true,
      message: 'Đã xóa toàn bộ nhật ký hệ thống thành công!',
    });
  } catch (error) {
    next(error);
  }
};
