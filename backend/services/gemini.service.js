import { GoogleGenAI } from '@google/genai';
import { SystemConfig, SystemLog } from '../models/index.js';

/**
 * Hàm phụ trợ lấy client GoogleGenAI và System Instructions Prompt động từ DB
 */
const getGeminiConfig = async () => {
  const keyConfig = await SystemConfig.findOne({ key: 'geminiKey' });
  const promptConfig = await SystemConfig.findOne({ key: 'langchainPrompt' });

  const apiKey = keyConfig?.value || process.env.GEMINI_API_KEY || '';
  const systemInstruction = promptConfig?.value || '';

  if (!apiKey) {
    throw new Error('Google Gemini API Key chưa được cấu hình trên hệ thống!');
  }

  const ai = new GoogleGenAI({ apiKey });
  return { ai, systemInstruction };
};

/**
 * Hàm phụ trợ giới hạn thời gian chạy của Promise
 */
const promiseTimeout = (promise, ms) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Yêu cầu gửi tới Gemini API bị quá hạn thời gian xử lý (${ms / 1000} giây)!`));
    }, ms);
  });
  return Promise.race([
    promise.then((res) => {
      clearTimeout(timeoutId);
      return res;
    }),
    timeoutPromise
  ]);
};

/**
 * Tạo nội dung văn bản một lần từ một prompt
 * @param {string} prompt - Yêu cầu gửi tới AI
 * @returns {Promise<string>} - Nội dung phản hồi từ AI
 */
export const generateText = async (prompt) => {
  try {
    const { ai, systemInstruction } = await getGeminiConfig();

    const responsePromise = ai.models.generateContent({
      model: 'gemini-2.5-flash', // Model tối ưu và tốc độ cao nhất hiện tại
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || undefined,
      },
    });

    // Giới hạn thời gian gọi API trong 120 giây (tài liệu lớn cần thời gian xử lý lâu hơn)
    const response = await promiseTimeout(responsePromise, 120000);

    // Ghi log hoạt động sinh văn bản thành công (không chặn tiến trình chính)
    SystemLog.log('INFO', `Sinh nội dung AI thành công cho prompt: "${prompt.substring(0, 60)}..."`, {
      source: 'gemini-ai',
    }).catch(err => console.error('[SystemLog Error]', err.message));

    return response.text;
  } catch (error) {
    console.error('[Gemini Service Error] generateText failed:', error);
    
    // Ghi log lỗi vào DB (không chặn tiến trình chính)
    SystemLog.log('ERROR', `Lỗi Gemini API sinh văn bản: ${error.message}`, {
      source: 'gemini-ai',
    }).catch(err => console.error('[SystemLog Error]', err.message));
    
    throw new Error(`Lỗi sinh nội dung từ Gemini API: ${error.message}`);
  }
};

/**
 * Trò chuyện với Gemini có giữ lịch sử cuộc hội thoại
 * @param {string} message - Tin nhắn mới nhất của người dùng
 * @param {Array} history - Lịch sử trò chuyện cũ
 * @returns {Promise<string>} - Nội dung trả lời từ AI
 */
export const chatWithGemini = async (message, history = []) => {
  try {
    const { ai, systemInstruction } = await getGeminiConfig();

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: history,
      config: {
        systemInstruction: systemInstruction || undefined,
      },
    });

    const responsePromise = chat.sendMessage({ message });

    // Giới hạn thời gian gọi API trong 30 giây
    const response = await promiseTimeout(responsePromise, 30000);

    // Ghi log hoạt động chat thành công (không chặn tiến trình chính)
    SystemLog.log('INFO', `Hội thoại AI thành công: "${message.substring(0, 60)}..."`, {
      source: 'gemini-ai',
    }).catch(err => console.error('[SystemLog Error]', err.message));

    return response.text;
  } catch (error) {
    console.error('[Gemini Service Error] chatWithGemini failed:', error);
    
    // Ghi log lỗi vào DB (không chặn tiến trình chính)
    SystemLog.log('ERROR', `Lỗi Gemini API Hội thoại: ${error.message}`, {
      source: 'gemini-ai',
    }).catch(err => console.error('[SystemLog Error]', err.message));
    
    throw new Error(`Lỗi hội thoại với Gemini API: ${error.message}`);
  }
};

