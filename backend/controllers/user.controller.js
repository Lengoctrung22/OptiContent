import { User } from '../models/index.js';

/**
 * @desc    Lấy thông tin hồ sơ người dùng hiện tại
 * @route   GET /api/v1/users/profile
 * @access  Private
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('currentPlan');
    if (!user) {
      res.status(404);
      return next(new Error('Không tìm thấy thông tin người dùng!'));
    }
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        fullName: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        brandVoice: user.brandVoice,
        integrations: user.integrations,
        monthlyUsage: user.monthlyUsage,
        currentPlan: user.currentPlan
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cập nhật thông tin hồ sơ người dùng
 * @route   PUT /api/v1/users/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res, next) => {
  const { name, email, avatar, integrations, brandVoice } = req.body;

  if (!name) {
    res.status(400);
    return next(new Error('Họ và tên không được để trống!'));
  }

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      return next(new Error('Không tìm thấy thông tin người dùng!'));
    }

    // Nếu thay đổi email, cần kiểm tra trùng lặp email với tài khoản khác
    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        res.status(400);
        return next(new Error('Định dạng email mới không hợp lệ!'));
      }

      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        res.status(409);
        return next(new Error('Địa chỉ email mới này đã được sử dụng bởi tài khoản khác!'));
      }
      user.email = email.toLowerCase();
    }

    user.name = name;
    if (avatar !== undefined) {
      user.avatar = avatar;
    }
    if (integrations !== undefined) {
      user.integrations = integrations;
    }
    if (brandVoice !== undefined) {
      user.brandVoice = brandVoice;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin hồ sơ thành công!',
      data: {
        id: user._id,
        fullName: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        integrations: user.integrations,
        brandVoice: user.brandVoice
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Đổi mật khẩu người dùng
 * @route   PUT /api/v1/users/password
 * @access  Private
 */
export const changeUserPassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    return next(new Error('Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới!'));
  }

  if (newPassword.length < 8) {
    res.status(400);
    return next(new Error('Mật khẩu mới phải chứa ít nhất 8 ký tự!'));
  }

  try {
    // Phải select thêm password vì mặc định password có select: false
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      res.status(404);
      return next(new Error('Không tìm thấy thông tin người dùng!'));
    }

    // So khớp mật khẩu hiện tại
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      res.status(400);
      return next(new Error('Mật khẩu hiện tại không chính xác!'));
    }

    // Cập nhật mật khẩu mới (sẽ được tự động hash qua pre-save hook của schema)
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Thay đổi mật khẩu tài khoản thành công!'
    });
  } catch (error) {
    next(error);
  }
};
