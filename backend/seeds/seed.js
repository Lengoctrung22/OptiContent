import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User, Plan, SystemLog } from '../models/index.js';

dotenv.config();

/**
 * Script khởi tạo dữ liệu mẫu (Seed Data)
 * Chạy lệnh: node backend/seeds/seed.js
 *
 * Script này sẽ:
 * 1. Tạo 3 gói cước mặc định (Free, Creator, Agency)
 * 2. Tạo tài khoản Admin mặc định
 * 3. Tạo vài tài khoản người dùng mẫu
 * 4. Ghi log khởi tạo hệ thống
 */

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/opticontent';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Đã kết nối MongoDB thành công.');

    // =============================================
    // 1. TẠO CÁC GÓI CƯỚC MẶC ĐỊNH
    // =============================================
    await Plan.deleteMany({});
    console.log('[Seed] Đã xóa dữ liệu gói cước cũ.');

    const plans = await Plan.insertMany([
      {
        name: 'Gói Miễn Phí (Free)',
        slug: 'free',
        priceMonthly: 0,
        priceDisplay: '0đ',
        wordLimit: 10000,
        wordLimitDisplay: '10,000 từ / tháng',
        imageLimit: 5,
        imageLimitDisplay: '5 ảnh',
        usersCount: 0,
        features: [
          'Tạo tối đa 10,000 từ / tháng',
          'Tối đa 5 ảnh AI / tháng',
          'Trợ lý AI Chat cơ bản',
          'Lưu trữ 20 bài viết',
        ],
      },
      {
        name: 'Gói Nhà Sáng Tạo (Creator)',
        slug: 'creator',
        priceMonthly: 199000,
        priceDisplay: '199,000đ / tháng',
        wordLimit: 100000,
        wordLimitDisplay: '100,000 từ / tháng',
        imageLimit: 100,
        imageLimitDisplay: '100 ảnh',
        usersCount: 0,
        features: [
          'Tạo tối đa 100,000 từ / tháng',
          'Tối đa 100 ảnh AI / tháng',
          'Trợ lý AI Chat nâng cao',
          'Lưu trữ không giới hạn bài viết',
          'Tối ưu SEO tự động',
          'Xuất bản trực tiếp WordPress',
        ],
      },
      {
        name: 'Gói Đại Lý (Agency)',
        slug: 'agency',
        priceMonthly: 499000,
        priceDisplay: '499,000đ / tháng',
        wordLimit: -1,
        wordLimitDisplay: 'Không giới hạn',
        imageLimit: -1,
        imageLimitDisplay: 'Không giới hạn',
        usersCount: 0,
        features: [
          'Không giới hạn số từ',
          'Không giới hạn ảnh AI',
          'Trợ lý AI Chat Pro',
          'Brand Voice tùy chỉnh',
          'Xuất bản đa nền tảng',
          'API Access trực tiếp',
          'Hỗ trợ kỹ thuật ưu tiên',
        ],
      },
    ]);

    const freePlan = plans.find((p) => p.slug === 'free');
    console.log(`[Seed] Đã tạo ${plans.length} gói cước thành công.`);

    // =============================================
    // 2. TẠO TÀI KHOẢN ADMIN VÀ NGƯỜI DÙNG MẪU
    // =============================================
    await User.deleteMany({});
    console.log('[Seed] Đã xóa dữ liệu người dùng cũ.');

    const users = [
      {
        name: 'Admin OptiContent',
        email: 'admin@opticontent.com',
        password: 'admin123',
        role: 'Admin',
        status: 'Active',
        currentPlan: null,
      },
      {
        name: 'Nguyễn Văn Trọng',
        email: 'trongnv@gmail.com',
        password: '123456',
        role: 'User',
        status: 'Active',
        currentPlan: freePlan._id,
        monthlyUsage: { wordsUsed: 14200, imagesUsed: 3, resetDate: new Date() },
      },
      {
        name: 'Trần Thị Mai',
        email: 'maitt@gmail.com',
        password: '123456',
        role: 'User',
        status: 'Active',
        currentPlan: freePlan._id,
        monthlyUsage: { wordsUsed: 38900, imagesUsed: 5, resetDate: new Date() },
      },
      {
        name: 'Phạm Minh Hoàng',
        email: 'hoangpm@gmail.com',
        password: '123456',
        role: 'Creator',
        status: 'Active',
        currentPlan: plans.find((p) => p.slug === 'creator')._id,
        monthlyUsage: { wordsUsed: 85200, imagesUsed: 42, resetDate: new Date() },
      },
      {
        name: 'Hoàng Anh Đức',
        email: 'ducha@gmail.com',
        password: '123456',
        role: 'Agency',
        status: 'Active',
        currentPlan: plans.find((p) => p.slug === 'agency')._id,
        monthlyUsage: { wordsUsed: 198200, imagesUsed: 88, resetDate: new Date() },
      },
    ];

    for (const userData of users) {
      await User.create(userData);
    }
    console.log(`[Seed] Đã tạo ${users.length} tài khoản người dùng thành công.`);

    // =============================================
    // 3. GHI LOG KHỞI TẠO HỆ THỐNG
    // =============================================
    await SystemLog.deleteMany({});
    await SystemLog.insertMany([
      { type: 'INFO', message: 'Hệ thống khởi tạo seed data thành công.', source: 'system' },
      { type: 'INFO', message: 'Gemini-2.5-flash session initialized.', source: 'gemini-ai' },
      { type: 'INFO', message: 'Database seeded. All collections ready.', source: 'database' },
    ]);
    console.log('[Seed] Đã ghi log hệ thống khởi tạo.');

    // =============================================
    // HOÀN TẤT
    // =============================================
    console.log('\n✅ [Seed] Khởi tạo dữ liệu mẫu hoàn tất!');
    console.log('   - 3 Gói cước (Free / Creator / Agency)');
    console.log('   - 5 Tài khoản (1 Admin + 4 Users)');
    console.log('   - 3 Log hệ thống');
    console.log('\n📧 Tài khoản Admin: admin@opticontent.com / admin123');
    console.log('📧 Tài khoản User:  trongnv@gmail.com / 123456\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();
