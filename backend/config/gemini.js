import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.warn('[Warning] Khóa GEMINI_API_KEY chưa được cấu hình trong tệp .env');
}

// Khởi tạo đối tượng GoogleGenAI client với API Key tương ứng
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default ai;
