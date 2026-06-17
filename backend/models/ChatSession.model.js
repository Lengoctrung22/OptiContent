import mongoose from 'mongoose';

/**
 * Schema: Phiên trò chuyện AI (ChatSession)
 * Lưu trữ toàn bộ lịch sử hội thoại giữa người dùng và Gemini AI.
 * Mỗi phiên (session) chứa một mảng các tin nhắn theo thứ tự thời gian.
 */
const messageSchema = new mongoose.Schema(
  {
    // Vai trò người gửi tin nhắn
    role: {
      type: String,
      enum: ['user', 'model'],
      required: true,
    },

    // Nội dung tin nhắn (hỗ trợ Markdown)
    content: {
      type: String,
      required: true,
    },

    // Thời gian gửi tin nhắn
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const chatSessionSchema = new mongoose.Schema(
  {
    // Người sở hữu phiên chat (Reference tới User)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Tiêu đề phiên chat (tự động lấy từ tin nhắn đầu tiên)
    title: {
      type: String,
      default: 'Cuộc trò chuyện mới',
      trim: true,
      maxlength: [150, 'Tiêu đề phiên chat không được vượt quá 150 ký tự'],
    },

    // Danh sách tin nhắn trong phiên chat
    messages: {
      type: [messageSchema],
      default: [],
    },

    // Tổng số token đã tiêu thụ trong phiên này
    totalTokens: {
      type: Number,
      default: 0,
    },

    // Trạng thái phiên chat
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
export default ChatSession;
