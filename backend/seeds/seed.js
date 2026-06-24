import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User, Plan, SystemLog, Transaction, SystemConfig } from '../models/index.js';

dotenv.config();

/**
 * Script khởi tạo dữ liệu mẫu (Seed Data) - CHẾ ĐỘ AN TOÀN
 * Chạy lệnh: node backend/seeds/seed.js
 *
 * Script này sẽ KHÔNG xóa dữ liệu hiện có. Nó chỉ:
 * 1. Tạo/cập nhật 3 gói cước mặc định (Free, Creator, Agency) nếu chưa có
 * 2. Tạo tài khoản Admin mặc định nếu chưa có
 * 3. Tạo vài tài khoản người dùng mẫu nếu chưa có
 * 4. Tạo giao dịch, cấu hình, log mẫu nếu collection đang trống
 *
 * ⚠️  Nếu muốn XÓA TOÀN BỘ và tạo lại từ đầu, chạy:
 *     node backend/seeds/seed.js --force
 */

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/opticontent';
const IS_FORCE_RESET = process.argv.includes('--force');

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Đã kết nối MongoDB thành công.');

    if (IS_FORCE_RESET) {
      console.log('\n⚠️  CHẾ ĐỘ --force: Sẽ XÓA TOÀN BỘ dữ liệu và tạo lại từ đầu!\n');
      await Plan.deleteMany({});
      await User.deleteMany({});
      await Transaction.deleteMany({});
      await SystemConfig.deleteMany({});
      await SystemLog.deleteMany({});
      console.log('[Seed] Đã xóa toàn bộ dữ liệu cũ.');
    } else {
      console.log('\n✅ CHẾ ĐỘ AN TOÀN: Chỉ thêm dữ liệu mẫu nếu chưa tồn tại. Dữ liệu hiện có được giữ nguyên.\n');
    }

    // =============================================
    // 1. TẠO/CẬP NHẬT CÁC GÓI CƯỚC MẶC ĐỊNH
    // =============================================
    const planDefaults = [
      {
        name: 'Gói Miễn Phí (Free)',
        slug: 'free',
        priceMonthly: 0,
        priceDisplay: '0đ',
        wordLimit: 10000,
        wordLimitDisplay: '10,000 từ / tháng',
        imageLimit: 5,
        imageLimitDisplay: '5 ảnh',
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
    ];

    let plansCreated = 0;
    let plansSkipped = 0;
    for (const planData of planDefaults) {
      const existing = await Plan.findOne({ slug: planData.slug });
      if (!existing) {
        await Plan.create(planData);
        plansCreated++;
      } else {
        plansSkipped++;
      }
    }
    console.log(`[Seed] Gói cước: ${plansCreated} tạo mới, ${plansSkipped} đã tồn tại (giữ nguyên).`);

    // Lấy lại plan từ DB để dùng cho các bước tiếp theo
    const freePlan = await Plan.findOne({ slug: 'free' });
    const creatorPlan = await Plan.findOne({ slug: 'creator' });
    const agencyPlan = await Plan.findOne({ slug: 'agency' });

    // =============================================
    // 2. TẠO TÀI KHOẢN ADMIN VÀ NGƯỜI DÙNG MẪU (NẾU CHƯA CÓ)
    // =============================================
    const userDefaults = [
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
        password: '12345678',
        role: 'User',
        status: 'Active',
        currentPlan: freePlan?._id,
        monthlyUsage: { wordsUsed: 0, imagesUsed: 3, resetDate: new Date() },
      },
      {
        name: 'Trần Thị Mai',
        email: 'maitt@gmail.com',
        password: '12345678',
        role: 'User',
        status: 'Active',
        currentPlan: freePlan?._id,
        monthlyUsage: { wordsUsed: 38900, imagesUsed: 5, resetDate: new Date() },
      },
      {
        name: 'Phạm Minh Hoàng',
        email: 'hoangpm@gmail.com',
        password: '12345678',
        role: 'Creator',
        status: 'Active',
        currentPlan: creatorPlan?._id,
        monthlyUsage: { wordsUsed: 85200, imagesUsed: 42, resetDate: new Date() },
      },
      {
        name: 'Hoàng Anh Đức',
        email: 'ducha@gmail.com',
        password: '12345678',
        role: 'Agency',
        status: 'Active',
        currentPlan: agencyPlan?._id,
        monthlyUsage: { wordsUsed: 198200, imagesUsed: 88, resetDate: new Date() },
      },
    ];

    let usersCreated = 0;
    let usersSkipped = 0;
    const createdUsers = [];
    for (const userData of userDefaults) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const u = await User.create(userData);
        createdUsers.push(u);
        usersCreated++;
      } else {
        createdUsers.push(existingUser);
        usersSkipped++;
      }
    }
    console.log(`[Seed] Tài khoản: ${usersCreated} tạo mới, ${usersSkipped} đã tồn tại (giữ nguyên).`);

    // =============================================
    // 3. TẠO CÁC GIAO DỊCH THANH TOÁN MẪU (CHỈ KHI COLLECTION TRỐNG)
    // =============================================
    const transactionCount = await Transaction.countDocuments();
    if (transactionCount === 0) {
      const userTrong = createdUsers.find(u => u.email === 'trongnv@gmail.com');
      const userHoang = createdUsers.find(u => u.email === 'hoangpm@gmail.com');
      const userDuc = createdUsers.find(u => u.email === 'ducha@gmail.com');

      const transactionsToCreate = [];

      if (userTrong && creatorPlan) {
        transactionsToCreate.push({
          transactionCode: 'TXN-77818',
          user: userTrong._id,
          plan: creatorPlan._id,
          planName: creatorPlan.name,
          amount: creatorPlan.priceMonthly,
          paymentMethod: 'MoMo QR',
          status: 'success',
          subscriptionPeriod: {
            startDate: new Date(Date.now() - 5 * 24 * 3600 * 1000),
            endDate: new Date(Date.now() + 25 * 24 * 3600 * 1000),
          },
        });
      }

      if (userHoang && creatorPlan) {
        transactionsToCreate.push({
          transactionCode: 'TXN-77821',
          user: userHoang._id,
          plan: creatorPlan._id,
          planName: creatorPlan.name,
          amount: creatorPlan.priceMonthly,
          paymentMethod: 'MoMo QR',
          status: 'success',
          subscriptionPeriod: {
            startDate: new Date(Date.now() - 3 * 24 * 3600 * 1000),
            endDate: new Date(Date.now() + 27 * 24 * 3600 * 1000),
          },
        });
      }

      if (userDuc && agencyPlan) {
        transactionsToCreate.push({
          transactionCode: 'TXN-77819',
          user: userDuc._id,
          plan: agencyPlan._id,
          planName: agencyPlan.name,
          amount: agencyPlan.priceMonthly,
          paymentMethod: 'Chuyển khoản VietQR',
          status: 'success',
          subscriptionPeriod: {
            startDate: new Date(Date.now() - 4 * 24 * 3600 * 1000),
            endDate: new Date(Date.now() + 26 * 24 * 3600 * 1000),
          },
        });
      }

      if (transactionsToCreate.length > 0) {
        await Transaction.insertMany(transactionsToCreate);
      }
      console.log(`[Seed] Giao dịch: ${transactionsToCreate.length} giao dịch mẫu được tạo.`);
    } else {
      console.log(`[Seed] Giao dịch: Đã có ${transactionCount} giao dịch, bỏ qua.`);
    }

    // =============================================
    // 4. TẠO CẤU HÌNH HỆ THỐNG MẪU (CHỈ KHI COLLECTION TRỐNG)
    // =============================================
    const configCount = await SystemConfig.countDocuments();
    if (configCount === 0) {
      await SystemConfig.insertMany([
        {
          key: 'geminiKey',
          value: process.env.GEMINI_API_KEY || '',
          description: 'Google Gemini API Key dùng để sinh nội dung và chat.',
        },
        {
          key: 'openaiKey',
          value: '',
          description: 'OpenAI API Key (Dự phòng cho DALL-E tạo ảnh).',
        },
        {
          key: 'langchainPrompt',
          value: 'Bạn là một trợ lý AI viết nội dung tối ưu SEO chuyên nghiệp. Nhiệm vụ của bạn là tạo bài viết có giọng điệu phù hợp, mạch lạc và tự nhiên theo yêu cầu của người dùng...',
          description: 'Prompt chỉ thị hệ thống chính cho động cơ SEO AI Engine.',
        },
      ]);
      console.log('[Seed] Cấu hình hệ thống: 3 config mẫu được tạo.');
    } else {
      console.log(`[Seed] Cấu hình hệ thống: Đã có ${configCount} config, bỏ qua.`);
    }

    // =============================================
    // 5. GHI LOG KHỞI TẠO HỆ THỐNG (CHỈ KHI COLLECTION TRỐNG)
    // =============================================
    const logCount = await SystemLog.countDocuments();
    if (logCount === 0) {
      await SystemLog.insertMany([
        { type: 'INFO', message: 'Hệ thống khởi tạo seed data thành công.', source: 'system' },
        { type: 'INFO', message: 'Gemini-2.5-flash session initialized.', source: 'gemini-ai' },
        { type: 'INFO', message: 'Database seeded. All collections ready.', source: 'database' },
      ]);
      console.log('[Seed] Log hệ thống: 3 log khởi tạo được tạo.');
    } else {
      console.log(`[Seed] Log hệ thống: Đã có ${logCount} log, bỏ qua.`);
    }

    // =============================================
    // HOÀN TẤT
    // =============================================
    console.log('\n✅ [Seed] Khởi tạo dữ liệu hoàn tất!');
    console.log('   Dữ liệu hiện có trong database được BẢO TOÀN.');
    console.log('   Chỉ dữ liệu mẫu còn thiếu mới được thêm vào.\n');
    console.log('📧 Tài khoản Admin: admin@opticontent.com / admin123');
    console.log('📧 Tài khoản User:  trongnv@gmail.com / 12345678\n');
    console.log('💡 Để reset toàn bộ, chạy: node backend/seeds/seed.js --force\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();
