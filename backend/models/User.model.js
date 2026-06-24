import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Schema: Người dùng (User)
 * Lưu trữ thông tin tài khoản, hồ sơ cá nhân và quyền hạn của người dùng.
 */
const userSchema = new mongoose.Schema(
  {
    // Họ và tên hiển thị
    name: {
      type: String,
      required: [true, 'Họ và tên là bắt buộc'],
      trim: true,
      maxlength: [100, 'Họ và tên không được vượt quá 100 ký tự'],
    },

    // Địa chỉ email (duy nhất, dùng để đăng nhập)
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Địa chỉ email không hợp lệ'],
    },

    // Mật khẩu đã mã hóa (bcrypt hash)
    password: {
      type: String,
      required: [true, 'Mật khẩu là bắt buộc'],
      minlength: [8, 'Mật khẩu phải chứa ít nhất 8 ký tự'],
      select: false, // Không trả về password khi query mặc định
    },

    // Ảnh đại diện (URL từ Cloudinary hoặc chuỗi Base64)
    avatar: {
      type: String,
      default: '',
    },

    // Vai trò / Quyền hạn người dùng trong hệ thống
    role: {
      type: String,
      enum: ['User', 'Creator', 'Agency', 'Admin'],
      default: 'User',
    },

    // Trạng thái tài khoản
    status: {
      type: String,
      enum: ['Active', 'Banned'],
      default: 'Active',
    },

    // Thời điểm hoạt động cuối cùng
    lastActive: {
      type: Date,
      default: Date.now,
    },

    // Liên kết tới gói cước đang sử dụng
    currentPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      default: null,
    },

    // Tổng số từ (tokens) đã sử dụng trong tháng hiện tại
    monthlyUsage: {
      wordsUsed: { type: Number, default: 0 },
      imagesUsed: { type: Number, default: 0 },
      resetDate: { type: Date, default: Date.now },
    },

    // Phương thức đăng nhập
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },

    // Google OAuth ID (nếu đăng nhập bằng Google)
    googleId: {
      type: String,
      default: null,
    },

    // Văn phong thương hiệu cá nhân (Brand Voice)
    brandVoice: {
      type: String,
      default: '',
      maxlength: [5000, 'Nội dung Brand Voice không được vượt quá 5000 ký tự'],
    },

    // Liên kết tích hợp bên ngoài
    integrations: {
      wordpress: {
        connected: { type: Boolean, default: false },
        siteUrl: { type: String, default: '' },
        authToken: { type: String, default: '' },
      },
      facebook: {
        connected: { type: Boolean, default: false },
        pageId: { type: String, default: '' },
        accessToken: { type: String, default: '' },
      },
    },

    // Token đặt lại mật khẩu (SHA256 hash)
    resetPasswordToken: {
      type: String,
      default: null,
    },

    // Thời hạn hiệu lực của token đặt lại mật khẩu
    resetPasswordExpire: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Tự động tạo createdAt và updatedAt
  }
);

/**
 * Middleware: Tự động mã hóa mật khẩu trước khi lưu vào DB
 */
userSchema.pre('save', async function (next) {
  // Chỉ hash khi password bị thay đổi (tạo mới hoặc đổi mật khẩu)
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Method: So sánh mật khẩu nhập vào với mật khẩu đã mã hóa trong DB
 * @param {string} enteredPassword - Mật khẩu người dùng nhập vào
 * @returns {Promise<boolean>}
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Method: Tạo token đặt lại mật khẩu (Reset Password Token)
 * Token gốc (chưa hash) được gửi qua email cho người dùng
 * Token đã hash (SHA256) được lưu vào DB để so khớp sau này
 * @returns {string} - Token gốc chưa hash
 */
userSchema.methods.getResetPasswordToken = function () {
  // Tạo token ngẫu nhiên 32 bytes
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash token bằng SHA256 trước khi lưu vào DB
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Đặt thời hạn hiệu lực 15 phút
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);
export default User;
