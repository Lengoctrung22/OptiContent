import mongoose from 'mongoose';

/**
 * Schema: Bài viết (Article)
 * Lưu trữ toàn bộ nội dung bài viết do người dùng tạo thông qua AI,
 * bao gồm cấu hình prompt, nội dung kết quả và trạng thái xuất bản.
 */
const articleSchema = new mongoose.Schema(
  {
    // Người sở hữu bài viết (Reference tới User)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Tiêu đề / Chủ đề bài viết
    title: {
      type: String,
      required: [true, 'Tiêu đề bài viết là bắt buộc'],
      trim: true,
      maxlength: [200, 'Tiêu đề không được vượt quá 200 ký tự'],
    },

    // Nội dung chính của bài viết (Markdown/Plain text từ AI)
    content: {
      type: String,
      required: [true, 'Nội dung bài viết không được để trống'],
    },

    // Nền tảng xuất bản mục tiêu
    platform: {
      type: String,
      enum: ['Blog', 'Facebook', 'Email'],
      default: 'Blog',
    },

    // Giọng văn (Tone of Voice)
    tone: {
      type: String,
      enum: ['Professional', 'Casual', 'Humor', 'Custom Brand Voice'],
      default: 'Professional',
    },

    // Từ khóa mục tiêu SEO
    keywords: {
      type: String,
      default: '',
      trim: true,
    },

    // Prompt gốc đã gửi cho AI (để tái tạo hoặc debug)
    originalPrompt: {
      type: String,
      default: '',
    },

    // Có bao gồm prompt tạo ảnh minh họa hay không
    hasImage: {
      type: Boolean,
      default: false,
    },

    // URL ảnh minh họa (nếu đã sinh bằng DALL-E / Midjourney)
    imageUrl: {
      type: String,
      default: '',
    },

    // Thống kê bài viết
    stats: {
      wordCount: { type: Number, default: 0 },
      characterCount: { type: Number, default: 0 },
    },

    // Metadata SEO (nếu người dùng bật tùy chọn SEO)
    seoMeta: {
      seoTitle: { type: String, default: '' },        // Dưới 60 ký tự
      metaDescription: { type: String, default: '' },  // Dưới 160 ký tự
    },

    // Trạng thái xuất bản
    publishStatus: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },

    // Nền tảng đã xuất bản thành công (WordPress, Facebook...)
    publishedTo: {
      type: String,
      default: '',
    },

    // Thời gian xuất bản
    publishedAt: {
      type: Date,
      default: null,
    },

    // Trạng thái chia sẻ liên kết công khai (Public link sharing)
    isShared: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Middleware: Tự động tính số từ và số ký tự trước khi lưu
 */
articleSchema.pre('save', function (next) {
  if (this.isModified('content') && this.content) {
    // Loại bỏ các thẻ HTML để tính toán số lượng từ thực tế chính xác hơn
    const plainText = this.content.replace(/<[^>]*>/g, ' ');
    this.stats.wordCount = plainText.split(/\s+/).filter(Boolean).length;
    this.stats.characterCount = plainText.replace(/\s+/g, '').length;
  }
  next();
});

/**
 * Index: Hỗ trợ tìm kiếm full-text theo tiêu đề và nội dung
 */
articleSchema.index({ title: 'text', content: 'text' });

const Article = mongoose.model('Article', articleSchema);
export default Article;
