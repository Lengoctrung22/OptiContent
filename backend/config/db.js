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
    console.error(`[Database FATAL] Không thể kết nối tới MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
