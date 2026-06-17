import ai from '../config/gemini.js';

/**
 * Tạo nội dung văn bản một lần từ một prompt
 * @param {string} prompt - Yêu cầu gửi tới AI
 * @returns {Promise<string>} - Nội dung phản hồi từ AI
 */
export const generateText = async (prompt) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Model tối ưu và tốc độ cao nhất hiện tại
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error('[Gemini Service Error] generateText failed:', error);
    throw new Error(`Lỗi sinh nội dung từ Gemini API: ${error.message}`);
  }
};

/**
 * Trò chuyện với Gemini có giữ lịch sử cuộc hội thoại
 * @param {string} message - Tin nhắn mới nhất của người dùng
 * @param {Array} history - Lịch sử trò chuyện cũ dạng [{ role: 'user'|'model', parts: [{ text: '...' }] }]
 * @returns {Promise<string>} - Nội dung trả lời từ AI
 */
export const chatWithGemini = async (message, history = []) => {
  try {
    // Khởi tạo chat session với lịch sử hội thoại truyền lên
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: history,
    });

    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error('[Gemini Service Error] chatWithGemini failed:', error);
    throw new Error(`Lỗi hội thoại với Gemini API: ${error.message}`);
  }
};
