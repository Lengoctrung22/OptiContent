import mongoose from 'mongoose';

/**
 * Schema: Giao dịch thanh toán (Transaction)
 * Lưu trữ lịch sử thanh toán khi người dùng nâng cấp gói cước,
 * bao gồm thông tin cổng thanh toán, số tiền và trạng thái giao dịch.
 */
const transactionSchema = new mongoose.Schema(
  {
    // Mã giao dịch hiển thị (VD: TXN-77821)
    transactionCode: {
      type: String,
      required: true,
      unique: true,
    },

    // Người thực hiện thanh toán (Reference tới User)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Gói cước đã nâng cấp (Reference tới Plan)
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
    },

    // Tên gói cước (snapshot tại thời điểm giao dịch để tránh mất dữ liệu khi plan thay đổi)
    planName: {
      type: String,
      required: true,
    },

    // Số tiền thanh toán (VNĐ)
    amount: {
      type: Number,
      required: [true, 'Số tiền giao dịch là bắt buộc'],
      min: [0, 'Số tiền không được âm'],
    },

    // Cổng thanh toán sử dụng
    paymentMethod: {
      type: String,
      enum: ['MoMo QR', 'Chuyển khoản VietQR', 'ZaloPay', 'VNPay', 'Stripe'],
      required: true,
    },

    // Trạng thái giao dịch
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
    },

    // Thời hạn gói cước bắt đầu và kết thúc
    subscriptionPeriod: {
      startDate: { type: Date, default: Date.now },
      endDate: { type: Date, required: true },
    },

    // Ghi chú nội bộ (Admin note)
    note: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Static: Tự động sinh mã giao dịch duy nhất
 */
transactionSchema.statics.generateTransactionCode = async function () {
  const lastTx = await this.findOne().sort({ createdAt: -1 }).select('transactionCode');
  let nextNum = 77801;
  if (lastTx && lastTx.transactionCode) {
    const parts = lastTx.transactionCode.split('-');
    if (parts.length >= 2) {
      const num = parseInt(parts[1], 10);
      if (!isNaN(num)) {
        nextNum = num + 1;
      }
    }
  }
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TXN-${nextNum}-${randomSuffix}`;
};

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
