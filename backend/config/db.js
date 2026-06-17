import mongoose from 'mongoose';

/**
 * Kết nối tới cơ sở dữ liệu MongoDB
 */
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/opticontent';
    const conn = await mongoose.connect(uri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Warning] Chưa thể kết nối tới MongoDB: ${error.message}`);
    console.log('[Database Info] API Server vẫn tiếp tục chạy không có DB.');
  }
};

export default connectDB;
