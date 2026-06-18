import { Article } from '../models/index.js';

/**
 * @desc    Tạo bài viết mới
 * @route   POST /api/v1/articles
 * @access  Private
 */
export const createArticle = async (req, res, next) => {
  const {
    title,
    content,
    platform,
    tone,
    keywords,
    originalPrompt,
    hasImage,
    imageUrl,
    seoMeta,
  } = req.body;

  if (!title || !content) {
    res.status(400);
    return next(new Error('Tiêu đề và nội dung bài viết không được để trống!'));
  }

  try {
    const article = await Article.create({
      user: req.user._id,
      title,
      content,
      platform: platform || 'Blog',
      tone: tone || 'Professional',
      keywords: keywords || '',
      originalPrompt: originalPrompt || '',
      hasImage: hasImage || false,
      imageUrl: imageUrl || '',
      seoMeta: seoMeta || { seoTitle: '', metaDescription: '' },
    });

    res.status(201).json({
      success: true,
      message: 'Tạo bài viết thành công!',
      data: article,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Lấy danh sách tất cả bài viết của user hiện tại
 * @route   GET /api/v1/articles
 * @access  Private
 */
export const getArticles = async (req, res, next) => {
  try {
    const articles = await Article.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: articles.length,
      data: articles,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Lấy chi tiết một bài viết theo ID
 * @route   GET /api/v1/articles/:id
 * @access  Private
 */
export const getArticleById = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      res.status(404);
      return next(new Error('Không tìm thấy bài viết yêu cầu!'));
    }

    // Kiểm tra quyền sở hữu
    if (article.user.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Bạn không có quyền truy cập bài viết này!'));
    }

    res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cập nhật bài viết theo ID
 * @route   PUT /api/v1/articles/:id
 * @access  Private
 */
export const updateArticle = async (req, res, next) => {
  const {
    title,
    content,
    platform,
    tone,
    keywords,
    originalPrompt,
    hasImage,
    imageUrl,
    seoMeta,
    publishStatus,
    publishedTo,
    publishedAt,
    isShared,
  } = req.body;

  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      res.status(404);
      return next(new Error('Không tìm thấy bài viết để cập nhật!'));
    }

    // Kiểm tra quyền sở hữu
    if (article.user.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Bạn không có quyền chỉnh sửa bài viết này!'));
    }

    // Cập nhật các trường dữ liệu
    if (title !== undefined) article.title = title;
    if (content !== undefined) article.content = content;
    if (platform !== undefined) article.platform = platform;
    if (tone !== undefined) article.tone = tone;
    if (keywords !== undefined) article.keywords = keywords;
    if (originalPrompt !== undefined) article.originalPrompt = originalPrompt;
    if (hasImage !== undefined) article.hasImage = hasImage;
    if (imageUrl !== undefined) article.imageUrl = imageUrl;
    if (seoMeta !== undefined) article.seoMeta = seoMeta;
    if (publishStatus !== undefined) article.publishStatus = publishStatus;
    if (publishedTo !== undefined) article.publishedTo = publishedTo;
    if (publishedAt !== undefined) article.publishedAt = publishedAt;
    if (isShared !== undefined) article.isShared = isShared;

    // Lưu bài viết (kích hoạt pre-save hook tính số lượng từ/ký tự)
    await article.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật bài viết thành công!',
      data: article,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Xóa bài viết theo ID
 * @route   DELETE /api/v1/articles/:id
 * @access  Private
 */
export const deleteArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      res.status(404);
      return next(new Error('Không tìm thấy bài viết để xóa!'));
    }

    // Kiểm tra quyền sở hữu
    if (article.user.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Bạn không có quyền xóa bài viết này!'));
    }

    await article.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Xóa bài viết thành công!',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Bật/tắt trạng thái chia sẻ công khai bài viết
 * @route   PATCH /api/v1/articles/:id/share
 * @access  Private
 */
export const toggleShareArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      res.status(404);
      return next(new Error('Không tìm thấy bài viết để thay đổi trạng thái chia sẻ!'));
    }

    // Kiểm tra quyền sở hữu
    if (article.user.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Bạn không có quyền quản lý chia sẻ bài viết này!'));
    }

    article.isShared = !article.isShared;
    await article.save();

    res.status(200).json({
      success: true,
      message: `Đã ${article.isShared ? 'bật' : 'tắt'} chế độ chia sẻ công khai!`,
      data: article
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Lấy thông tin bài viết công khai (không cần xác thực)
 * @route   GET /api/v1/articles/public/:id
 * @access  Public
 */
export const getPublicArticleById = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('user', 'name avatar'); // Lấy thông tin cơ bản của người viết

    if (!article) {
      res.status(404);
      return next(new Error('Không tìm thấy bài viết yêu cầu hoặc bài viết đã bị xóa!'));
    }

    // Kiểm tra xem bài viết có được chia sẻ công khai không
    if (!article.isShared) {
      res.status(403);
      return next(new Error('Bài viết này không được chia sẻ công khai hoặc đã bị tắt chia sẻ!'));
    }

    res.status(200).json({
      success: true,
      data: article
    });
  } catch (error) {
    next(error);
  }
};
