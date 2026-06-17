import mongoose from 'mongoose';

/**
 * Schema: Gói cước dịch vụ (Plan)
 * Định nghĩa các gói SaaS với giới hạn sử dụng,
 * mức giá hàng tháng và quyền hạn tương ứng.
 */
const planSchema = new mongoose.Schema(
  {
    // Tên hiển thị của gói cước
    name: {
      type: String,
      required: [true, 'Tên gói cước là bắt buộc'],
      trim: true,
      unique: true,
    },

    // Mã định danh nội bộ (dùng trong code logic)
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      enum: ['free', 'creator', 'agency'],
    },

    // Giá hàng tháng (VNĐ) — 0 cho gói miễn phí
    priceMonthly: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Giá không được âm'],
    },

    // Chuỗi hiển thị giá cho frontend (VD: "199,000đ / tháng")
    priceDisplay: {
      type: String,
      default: '0đ',
    },

    // Giới hạn số từ được phép tạo mỗi tháng (-1 = không giới hạn)
    wordLimit: {
      type: Number,
      required: true,
      default: 10000,
    },

    // Chuỗi hiển thị giới hạn từ cho frontend
    wordLimitDisplay: {
      type: String,
      default: '10,000 từ / tháng',
    },

    // Giới hạn số ảnh AI được tạo mỗi tháng (-1 = không giới hạn)
    imageLimit: {
      type: Number,
      required: true,
      default: 5,
    },

    // Chuỗi hiển thị giới hạn ảnh cho frontend
    imageLimitDisplay: {
      type: String,
      default: '5 ảnh',
    },

    // Tổng số người dùng đang sử dụng gói này (cập nhật realtime)
    usersCount: {
      type: Number,
      default: 0,
    },

    // Gói có đang hoạt động cho phép người dùng đăng ký không
    isActive: {
      type: Boolean,
      default: true,
    },

    // Danh sách tính năng nổi bật (để hiển thị trên trang Pricing)
    features: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Plan = mongoose.model('Plan', planSchema);
export default Plan;
