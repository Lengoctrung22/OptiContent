import api from './api.js';

/**
 * Gửi tin nhắn chat tới AI (kèm lịch sử hội thoại)
 * @param {string} message - Tin nhắn mới
 * @param {Array} history - Lịch sử chat
 * @returns {Promise<Object>}
 */
export const sendChatMessage = async (message, history = []) => {
  const response = await api.post('/ai/chat', { message, history });
  return response.data; // Trả về dạng { success: true, response: "..." }
};

/**
 * Gửi prompt yêu cầu sinh văn bản một lần
 * @param {string} prompt - Câu lệnh
 * @returns {Promise<Object>}
 */
export const generateContent = async (prompt) => {
  const response = await api.post('/ai/generate', { prompt });
  return response.data; // Trả về dạng { success: true, data: "..." }
};
