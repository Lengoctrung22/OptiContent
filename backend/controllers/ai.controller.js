import { generateText, chatWithGemini } from '../services/gemini.service.js';

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
    const data = await generateText(prompt);
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
    const response = await chatWithGemini(message, history || []);
    res.status(200).json({
      success: true,
      response,
    });
  } catch (error) {
    next(error);
  }
};
