import { generateText, chatWithGemini } from '../services/gemini.service.js';
import { User } from '../models/index.js';
import { extractTextFromBuffer } from '../services/parser.service.js';

/**
 * Kiểm tra và đặt lại hạn mức sử dụng hàng tháng của người dùng nếu sang tháng mới
 */
const checkAndResetMonthlyUsage = (user) => {
  const now = new Date();
  const resetDate = new Date(user.monthlyUsage.resetDate || Date.now());
  
  if (
    now.getMonth() !== resetDate.getMonth() ||
    now.getFullYear() !== resetDate.getFullYear()
  ) {
    user.monthlyUsage.wordsUsed = 0;
    user.monthlyUsage.imagesUsed = 0;
    user.monthlyUsage.resetDate = now;
  }
};

/**
 * Xử lý yêu cầu tạo văn bản một lần từ prompt
 */
export const handleGenerateText = async (req, res, next) => {
  const { prompt } = req.body;

  if (!prompt) {
    res.status(400);
    return next(new Error('Nội dung yêu cầu (prompt) không được để trống!'));
  }

  try {
    const user = await User.findById(req.user.id).populate('currentPlan');
    if (!user) {
      res.status(404);
      return next(new Error('Không tìm thấy tài khoản người dùng!'));
    }

    checkAndResetMonthlyUsage(user);

    const limit = user.role === 'Admin' ? -1 : (user.currentPlan ? user.currentPlan.wordLimit : 10000);
    if (limit !== -1 && user.monthlyUsage.wordsUsed >= limit) {
      res.status(429);
      return next(new Error(`Bạn đã vượt quá giới hạn từ của tháng hiện tại (${user.monthlyUsage.wordsUsed}/${limit} từ). Vui lòng nâng cấp gói cước!`));
    }

    const data = await generateText(prompt);

    const generatedWords = data.split(/\s+/).filter(Boolean).length;
    user.monthlyUsage.wordsUsed += generatedWords;
    await user.save();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Xử lý yêu cầu chat duy trì lịch sử hội thoại
 */
export const handleChat = async (req, res, next) => {
  const { message, history } = req.body;

  if (!message) {
    res.status(400);
    return next(new Error('Nội dung tin nhắn (message) không được để trống!'));
  }

  try {
    const user = await User.findById(req.user.id).populate('currentPlan');
    if (!user) {
      res.status(404);
      return next(new Error('Không tìm thấy tài khoản người dùng!'));
    }

    checkAndResetMonthlyUsage(user);

    const limit = user.role === 'Admin' ? -1 : (user.currentPlan ? user.currentPlan.wordLimit : 10000);
    if (limit !== -1 && user.monthlyUsage.wordsUsed >= limit) {
      res.status(429);
      return next(new Error(`Bạn đã vượt quá giới hạn từ của tháng hiện tại (${user.monthlyUsage.wordsUsed}/${limit} từ). Vui lòng nâng cấp gói cước!`));
    }

    const response = await chatWithGemini(message, history || []);

    const generatedWords = response.split(/\s+/).filter(Boolean).length;
    user.monthlyUsage.wordsUsed += generatedWords;
    await user.save();

    res.status(200).json({
      success: true,
      response,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Xử lý yêu cầu tạo văn bản dựa theo file tài liệu đính kèm
 */
export const handleGenerateFromDocument = async (req, res, next) => {
  const { topic, keywords, platform, tone, needOutline, needSEO, needImage } = req.body;
  const file = req.file;

  if (!file) {
    res.status(400);
    return next(new Error('Vui lòng tải lên tài liệu tham khảo!'));
  }

  if (!topic) {
    res.status(400);
    return next(new Error('Chủ đề viết bài không được để trống!'));
  }

  try {
    const user = await User.findById(req.user.id).populate('currentPlan');
    if (!user) {
      res.status(404);
      return next(new Error('Không tìm thấy tài khoản người dùng!'));
    }

    checkAndResetMonthlyUsage(user);

    const limit = user.role === 'Admin' ? -1 : (user.currentPlan ? user.currentPlan.wordLimit : 10000);
    if (limit !== -1 && user.monthlyUsage.wordsUsed >= limit) {
      res.status(429);
      return next(new Error(`Bạn đã vượt quá giới hạn từ của tháng hiện tại (${user.monthlyUsage.wordsUsed}/${limit} từ). Vui lòng nâng cấp gói cước!`));
    }

    // Trích xuất văn bản từ buffer của tệp tải lên
    const docText = await extractTextFromBuffer(file.buffer, file.originalname);
    
    // Giới hạn context trích xuất (khoảng 35.000 ký tự) để tránh quá tải dung lượng token
    const contextText = docText.substring(0, 35000);

    // Xây dựng prompt kèm ngữ cảnh tài liệu
    let prompt = `Hãy viết một bài viết cho nền tảng ${platform} về chủ đề: "${topic}".\n\n`;
    prompt += `Dưới đây là phần NỘI DUNG TÀI LIỆU THAM KHẢO được cung cấp bởi người dùng (hãy bám sát tài liệu này để viết bài):\n`;
    prompt += `-----\n${contextText}\n-----\n\n`;
    
    if (keywords && keywords.trim()) {
      prompt += `Yêu cầu chèn các từ khóa sau một cách tự nhiên: ${keywords}.\n`;
    }
    prompt += `Giọng văn (Tone of voice) yêu cầu: ${tone}.\n`;
    
    if (needOutline === 'true' || needOutline === true) {
      prompt += `Yêu cầu bổ sung thêm phần Dàn ý bài viết chi tiết ở phần đầu.\n`;
    }
    if (needSEO === 'true' || needSEO === true) {
      prompt += `Yêu cầu viết thêm thẻ tiêu đề SEO Title (dưới 60 ký tự) và thẻ Meta Description (dưới 160 ký tự) ở cuối bài.\n`;
    }
    if (needImage === 'true' || needImage === true) {
      prompt += `Yêu cầu mô tả chi tiết 1 prompt gợi ý để vẽ ảnh minh họa phù hợp cho bài viết này (sử dụng DALL-E/Midjourney).\n`;
    }

    prompt += `\nLƯU Ý QUAN TRỌNG: Chỉ sử dụng thông tin chính thống có trong tài liệu tham khảo được cung cấp ở trên. Không tự ý bịa đặt thông tin nằm ngoài phạm vi tài liệu.`;

    const data = await generateText(prompt);

    const generatedWords = data.split(/\s+/).filter(Boolean).length;
    user.monthlyUsage.wordsUsed += generatedWords;
    await user.save();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

