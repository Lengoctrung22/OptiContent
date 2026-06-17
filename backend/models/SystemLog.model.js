import mongoose from 'mongoose';

/**
 * Schema: Nhật ký hệ thống (SystemLog)
 * Ghi lại toàn bộ sự kiện quan trọng của hệ thống: lỗi API,
 * cảnh báo vượt hạn mức, kết nối DB, và các hoạt động admin.
 * Dùng để hiển thị trong Terminal Logs trên trang Admin.
 */
const systemLogSchema = new mongoose.Schema(
  {
    // Mức độ nghiêm trọng của log
    type: {
      type: String,
      enum: ['INFO', 'WARNING', 'ERROR'],
      required: true,
      index: true,
    },

    // Nội dung chi tiết sự kiện
    message: {
      type: String,
      required: [true, 'Nội dung log là bắt buộc'],
    },

    // Nguồn gốc sự kiện (module / service nào phát sinh)
    source: {
      type: String,
      enum: ['api-gateway', 'database', 'gemini-ai', 'auth', 'billing', 'wordpress', 'system'],
      default: 'system',
    },

    // Người dùng liên quan (nếu có)
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Email người dùng liên quan (snapshot để tra cứu nhanh)
    relatedEmail: {
      type: String,
      default: '',
    },

    // Metadata bổ sung (stack trace, request info, etc.)
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Đã đọc/xử lý bởi Admin chưa
    isResolved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Index: TTL (Time-To-Live) — tự động xóa log sau 90 ngày
 * để tránh phình dung lượng cơ sở dữ liệu.
 */
systemLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

/**
 * Static: Ghi log nhanh từ bất kỳ đâu trong hệ thống
 */
systemLogSchema.statics.log = async function (type, message, options = {}) {
  return this.create({
    type,
    message,
    source: options.source || 'system',
    relatedUser: options.userId || null,
    relatedEmail: options.email || '',
    metadata: options.metadata || {},
  });
};

const SystemLog = mongoose.model('SystemLog', systemLogSchema);
export default SystemLog;
