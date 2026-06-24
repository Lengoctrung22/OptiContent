import mongoose from 'mongoose';

/**
 * Schema: Cấu hình hệ thống (SystemConfig)
 * Lưu trữ cấu hình động của hệ thống (API key, System Prompt...)
 * để admin có thể thay đổi ngay trên giao diện mà không cần restart server.
 */
const systemConfigSchema = new mongoose.Schema(
  {
    // Từ khóa cấu hình (VD: geminiKey, openaiKey, langchainPrompt)
    key: {
      type: String,
      required: [true, 'Từ khóa cấu hình là bắt buộc'],
      unique: true,
      trim: true,
      index: true,
    },

    // Giá trị cấu hình
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Giá trị cấu hình là bắt buộc'],
    },

    // Mô tả mục đích của cấu hình
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const SystemConfig = mongoose.model('SystemConfig', systemConfigSchema);
export default SystemConfig;
