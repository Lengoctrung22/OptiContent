import mongoose from 'mongoose';

/**
 * Kết nối tới cơ sở dữ liệu MongoDB
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Không thể kết nối tới MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
