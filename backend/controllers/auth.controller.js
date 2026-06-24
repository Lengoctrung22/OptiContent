import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, Plan } from '../models/index.js';
import sendEmail, { getResetPasswordEmailTemplate } from '../services/email.service.js';

/**
 * Tạo token JWT để xác thực phiên làm việc của người dùng
 * @param {string} id - ID người dùng
 * @param {string} role - Vai trò của người dùng
 * @returns {string} - JWT Token signed
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Hạn dùng token trong 30 ngày
  });
};

/**
 * @desc    Đăng ký tài khoản người dùng mới
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  const { fullName, email, password } = req.body;

  // 1. Kiểm tra đầu vào bắt buộc
  if (!fullName || !email || !password) {
    res.status(400);
    return next(new Error('Vui lòng điền đầy đủ các thông tin: fullName, email, password!'));
  }

  // 2. Kiểm tra định dạng Email
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    return next(new Error('Định dạng email không hợp lệ!'));
  }

  // 3. Kiểm tra độ dài mật khẩu (tối thiểu 8 ký tự)
  if (password.length < 8) {
    res.status(400);
    return next(new Error('Mật khẩu phải chứa ít nhất 8 ký tự!'));
  }

  try {
    // 4. Kiểm tra email đã tồn tại trong hệ thống chưa
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(409); // 409 Conflict (Email đã được sử dụng)
      return next(new Error('Địa chỉ email này đã được sử dụng đăng ký tài khoản!'));
    }

    // 5. Gán gói cước Free mặc định cho tài khoản mới đăng ký
    const freePlan = await Plan.findOne({ slug: 'free' });
    const currentPlanId = freePlan ? freePlan._id : null;

    // 6. Tạo người dùng mới trong DB (Mật khẩu tự động hash qua pre-save hook của Mongoose)
    const user = await User.create({
      name: fullName,
      email,
      password,
      currentPlan: currentPlanId,
    });

    if (user) {
      // Trả về dữ liệu thành công kèm JWT Token
      res.status(201).json({
        success: true,
        message: 'Đăng ký tài khoản thành công!',
        token: generateToken(user._id, user.role),
        user: {
          id: user._id,
          fullName: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          currentPlan: user.currentPlan,
          avatar: user.avatar || '',
        },
      });
    } else {
      res.status(400);
      return next(new Error('Dữ liệu tài khoản không hợp lệ!'));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Đăng nhập hệ thống và cấp khóa JWT
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Kiểm tra đầu vào bắt buộc
  if (!email || !password) {
    res.status(400);
    return next(new Error('Vui lòng cung cấp đầy đủ email và password!'));
  }

  try {
    // 2. Tìm người dùng bằng email và chọn thêm trường password (vì trường password được select: false mặc định)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      res.status(401); // 401 Unauthorized
      return next(new Error('Email hoặc mật khẩu không chính xác!'));
    }

    // 3. Kiểm tra xem tài khoản có bị khóa (Banned) hay không
    if (user.status === 'Banned') {
      res.status(403); // 403 Forbidden
      return next(new Error('Tài khoản này đã bị khóa do vi phạm chính sách hệ thống!'));
    }

    // 4. So khớp mật khẩu đã hash
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      return next(new Error('Email hoặc mật khẩu không chính xác!'));
    }

    // Cập nhật hoạt động cuối cùng
    user.lastActive = new Date();
    await user.save({ validateBeforeSave: false });

    // 5. Trả về token và hồ sơ người dùng
    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        fullName: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        currentPlan: user.currentPlan,
        avatar: user.avatar || '',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Đăng nhập hoặc đăng ký nhanh thông qua Google
 * @route   POST /api/v1/auth/google
 * @access  Public
 */
export const googleLogin = async (req, res, next) => {
  const { email, name, googleId, avatar } = req.body;

  // 1. Kiểm tra đầu vào tối thiểu
  if (!email || !googleId) {
    res.status(400);
    return next(new Error('Vui lòng cung cấp email và googleId từ Google!'));
  }

  try {
    // 2. Tìm người dùng bằng googleId hoặc email trong hệ thống
    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    });

    if (user) {
      // Nếu tài khoản bị khóa (Banned)
      if (user.status === 'Banned') {
        res.status(403);
        return next(new Error('Tài khoản này đã bị khóa do vi phạm chính sách hệ thống!'));
      }

      // Cập nhật thông tin nếu cần (Ví dụ: chưa liên kết googleId hoặc cập nhật avatar mới)
      let needsSave = false;
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        needsSave = true;
      }
      if (avatar && user.avatar !== avatar) {
        user.avatar = avatar;
        needsSave = true;
      }
      if (name && user.name !== name && user.name.startsWith('Google User')) {
        user.name = name;
        needsSave = true;
      }

      // Cập nhật thông tin và trạng thái online
      user.lastActive = new Date();
      await user.save({ validateBeforeSave: false });
    } else {
      // 3. Nếu chưa tồn tại, tự động đăng ký tài khoản mới bằng thông tin Google
      const freePlan = await Plan.findOne({ slug: 'free' });
      const currentPlanId = freePlan ? freePlan._id : null;

      // Sinh mật khẩu ngẫu nhiên có độ bảo mật cao vì đăng nhập qua Google không dùng mật khẩu này
      const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);

      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password: randomPassword, // pre-save hook sẽ tự động hash
        googleId,
        authProvider: 'google',
        avatar: avatar || '',
        currentPlan: currentPlanId,
        lastActive: new Date(),
      });
    }

    // 4. Cấp mã thông báo JWT đăng nhập thành công
    res.status(200).json({
      success: true,
      message: 'Đăng nhập bằng Google thành công!',
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        fullName: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        currentPlan: user.currentPlan,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Yêu cầu đặt lại mật khẩu - Gửi email chứa link reset
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  // 1. Kiểm tra đầu vào
  if (!email) {
    res.status(400);
    return next(new Error('Vui lòng cung cấp địa chỉ email!'));
  }

  try {
    // 2. Tìm người dùng bằng email
    const user = await User.findOne({ email });

    if (!user) {
      // Trả về thông báo giống nhau cho cả 2 trường hợp để bảo mật (chống enum attack)
      return res.status(200).json({
        success: true,
        message: 'Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.',
      });
    }

    // 3. Kiểm tra nếu người dùng đăng ký bằng Google (không có mật khẩu local)
    if (user.authProvider === 'google' && !user.password) {
      return res.status(200).json({
        success: true,
        message: 'Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.',
      });
    }

    // 4. Tạo token đặt lại mật khẩu
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // 5. Tạo URL reset password cho frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    // 6. Gửi email
    try {
      const emailHtml = getResetPasswordEmailTemplate(user.name, resetUrl);
      
      await sendEmail({
        to: user.email,
        subject: '🔑 Đặt lại mật khẩu OptiContent',
        html: emailHtml,
      });

      res.status(200).json({
        success: true,
        message: 'Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.',
      });
    } catch (emailError) {
      console.error('[Auth] Lỗi gửi email reset password:', emailError.message);

      // Ở chế độ phát triển (development), in link ra console để dễ dàng kiểm thử mà không cần cấu hình SMTP thật
      if (process.env.NODE_ENV === 'development') {
        console.log('\n==================================================');
        console.log('[DEV MODE] THÔNG TIN ĐẶT LẠI MẬT KHẨU:');
        console.log(`Email nhận: ${user.email}`);
        console.log(`Đường dẫn khôi phục: ${resetUrl}`);
        console.log('==================================================\n');

        return res.status(200).json({
          success: true,
          message: '[Chế độ Dev] Gửi email thất bại nhưng link khôi phục đã được in ra console của Server Backend!',
          devResetUrl: resetUrl
        });
      }

      // Nếu gửi email thất bại trong production, xóa token đã lưu trong DB
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save({ validateBeforeSave: false });

      res.status(500);
      return next(new Error('Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau!'));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Đặt lại mật khẩu mới bằng token từ email
 * @route   POST /api/v1/auth/reset-password/:token
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
  const { password, confirmPassword } = req.body;

  // 1. Kiểm tra đầu vào
  if (!password || !confirmPassword) {
    res.status(400);
    return next(new Error('Vui lòng nhập mật khẩu mới và xác nhận mật khẩu!'));
  }

  if (password !== confirmPassword) {
    res.status(400);
    return next(new Error('Mật khẩu xác nhận không khớp!'));
  }

  if (password.length < 8) {
    res.status(400);
    return next(new Error('Mật khẩu mới phải chứa ít nhất 8 ký tự!'));
  }

  try {
    // 2. Hash token từ URL để so khớp với token đã lưu trong DB
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // 3. Tìm user có token khớp VÀ chưa hết hạn
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      return next(new Error('Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn!'));
    }

    // 4. Cập nhật mật khẩu mới (pre-save hook sẽ tự động hash bằng bcrypt)
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    // 5. Trả về thành công
    res.status(200).json({
      success: true,
      message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.',
    });
  } catch (error) {
    next(error);
  }
};
