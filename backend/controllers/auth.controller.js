import jwt from 'jsonwebtoken';
import { User, Plan } from '../models/index.js';

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
      // Tự động cộng 1 vào số lượng user của gói cước tương ứng
      if (freePlan) {
        await Plan.findByIdAndUpdate(freePlan._id, { $inc: { usersCount: 1 } });
      }

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

      if (needsSave) {
        await user.save();
      }
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
      });

      // Cộng 1 vào số lượng user của gói Free
      if (freePlan) {
        await Plan.findByIdAndUpdate(freePlan._id, { $inc: { usersCount: 1 } });
      }
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
