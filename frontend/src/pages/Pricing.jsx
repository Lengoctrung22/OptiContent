import { useState, useEffect, useCallback } from 'react';
import { 
  Zap, 
  Check, 
  AlertCircle, 
  CreditCard, 
  History, 
  QrCode, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  ArrowRight,
  Info
} from 'lucide-react';
import api from '../services/api';

const defaultFreePlan = {
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
};

const Pricing = ({ userProfile, reloadUserProfile }) => {
  const [activeTab, setActiveTab] = useState('plans'); // plans | history
  const [plans, setPlans] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  // Checkout flow states
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Chuyển khoản VietQR'); // Chuyển khoản VietQR | MoMo QR | Stripe
  const [pendingTransaction, setPendingTransaction] = useState(null);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  
  // Card input states (Stripe)
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // Tự động kiểm tra trạng thái thanh toán khi có giao dịch đang chờ (Auto-polling)
  useEffect(() => {
    let intervalId = null;

    if (checkoutModalOpen && pendingTransaction && !verificationSuccess && !isVerifying) {
      const checkStatus = async () => {
        try {
          const response = await api.get(`/payments/status/${pendingTransaction.transactionCode}`);
          if (response.data && response.data.success) {
            if (response.data.status === 'success') {
              clearInterval(intervalId);
              setVerificationSuccess(true);
              if (reloadUserProfile) {
                await reloadUserProfile();
              }
              // Tự động đóng modal sau 2.5 giây
              setTimeout(() => {
                setCheckoutModalOpen(false);
                setPendingTransaction(null);
                setSelectedPlan(null);
                setVerificationSuccess(false);
                setActiveTab('plans');
              }, 2500);
            }
          }
        } catch (error) {
          console.error('Lỗi khi tự động kiểm tra trạng thái giao dịch:', error);
        }
      };

      // Chạy polling mỗi 2 giây
      intervalId = setInterval(checkStatus, 2000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [checkoutModalOpen, pendingTransaction, verificationSuccess, isVerifying, reloadUserProfile]);

  // Fetch plans
  useEffect(() => {
    const fetchPlans = async () => {
      setLoadingPlans(true);
      try {
        const response = await api.get('/payments/plans');
        if (response.data && response.data.success) {
          setPlans(response.data.data);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách gói cước:', error);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  // Fetch transactions history
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const response = await api.get('/payments/transactions');
      if (response.data && response.data.success) {
        setTransactions(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử giao dịch:', error);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      if (activeTab === 'history') {
        await fetchHistory();
      }
    };
    load();
  }, [activeTab, fetchHistory]);

  const currentPlanObj = userProfile?.currentPlan || defaultFreePlan;
  const wordLimit = currentPlanObj.wordLimit || 10000;
  const imageLimit = currentPlanObj.imageLimit || 5;
  const wordsUsed = userProfile?.monthlyUsage?.wordsUsed || 0;
  const imagesUsed = userProfile?.monthlyUsage?.imagesUsed || 0;

  const wordPercent = wordLimit === -1 ? 0 : Math.min(100, Math.round((wordsUsed / wordLimit) * 100));
  const imagePercent = imageLimit === -1 ? 0 : Math.min(100, Math.round((imagesUsed / imageLimit) * 100));

  // Handle upgrade click (initial checkout transaction)
  const handleUpgradeClick = async (plan) => {
    setSelectedPlan(plan);
    setIsProcessingCheckout(true);
    setCheckoutModalOpen(true);
    setVerificationSuccess(false);

    try {
      const response = await api.post('/payments/checkout', {
        planId: plan._id,
        paymentMethod: paymentMethod
      });
      if (response.data && response.data.success) {
        setPendingTransaction(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi khởi tạo thanh toán:', error);
      alert('Không thể khởi tạo giao dịch thanh toán. Vui lòng thử lại sau!');
      handleCloseModal();
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  // Handle payment method change during checkout
  const handleMethodChange = async (method) => {
    if (!selectedPlan) return;
    setPaymentMethod(method);
    setIsProcessingCheckout(true);
    try {
      const response = await api.post('/payments/checkout', {
        planId: selectedPlan._id,
        paymentMethod: method
      });
      if (response.data && response.data.success) {
        setPendingTransaction(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi đổi phương thức thanh toán:', error);
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  // Confirm simulated payment complete
  const handleConfirmPayment = async () => {
    if (!pendingTransaction) return;
    setIsVerifying(true);

    try {
      // Gọi API verify ở backend để xác nhận chuyển khoản thành công và nâng cấp user
      const response = await api.post('/payments/verify', {
        transactionCode: pendingTransaction.transactionCode
      });

      if (response.data && response.data.success) {
        setVerificationSuccess(true);
        // Tải lại profile toàn cục
        if (reloadUserProfile) {
          await reloadUserProfile();
        }
        // Đóng modal sau 2.5s
        setTimeout(() => {
          setCheckoutModalOpen(false);
          setPendingTransaction(null);
          setSelectedPlan(null);
          setVerificationSuccess(false);
          setActiveTab('plans'); // Quay về tab plans
        }, 2500);
      }
    } catch (error) {
      console.error('Lỗi xác thực thanh toán:', error);
      alert(error.response?.data?.message || 'Xác thực thanh toán thất bại. Vui lòng thử lại!');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCloseModal = () => {
    setCheckoutModalOpen(false);
    setPendingTransaction(null);
    setSelectedPlan(null);
    setVerificationSuccess(false);
  };

  // Get status color tag
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'success': return 'badge-success';
      case 'pending': return 'badge-pending';
      case 'failed': return 'badge-failed';
      default: return 'badge-default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'success': return 'Thành công';
      case 'pending': return 'Chờ thanh toán';
      case 'failed': return 'Thất bại';
      case 'refunded': return 'Đã hoàn tiền';
      default: return status;
    }
  };

  return (
    <div className="pricing-container fade-in">
      {/* Top Tabs */}
      <div className="pricing-tabs">
        <button 
          className={`pricing-tab-btn ${activeTab === 'plans' ? 'active' : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          <Zap size={16} />
          Gói cước & Hạn mức
        </button>
        <button 
          className={`pricing-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <History size={16} />
          Lịch sử thanh toán
        </button>
      </div>

      {activeTab === 'plans' && (
        <>
          {/* Current Limit Usage Card */}
          <div className="usage-card">
            <div className="usage-card-header">
              <div>
                <span className="usage-tag">Hạn mức hiện tại</span>
                <h3 className="usage-plan-name">{currentPlanObj.name}</h3>
              </div>
              <div className="usage-status-badge">
                <Sparkles size={14} style={{ color: 'var(--accent)' }} />
                <span>{userProfile.role} Account</span>
              </div>
            </div>

            <div className="usage-progress-grid">
              {/* Word Limit */}
              <div className="progress-group">
                <div className="progress-labels">
                  <span>Số từ đã tạo (tháng này)</span>
                  <span className="progress-value">
                    <strong>{wordsUsed.toLocaleString()}</strong> / {wordLimit === -1 ? 'Không giới hạn' : `${wordLimit.toLocaleString()} từ`}
                  </span>
                </div>
                {wordLimit !== -1 ? (
                  <div className="progress-bar-bg">
                    <div 
                      className={`progress-bar-fill ${wordPercent > 85 ? 'warning' : ''}`} 
                      style={{ width: `${wordPercent}%` }}
                    ></div>
                  </div>
                ) : (
                  <div className="progress-bar-bg unlimited">
                    <div className="progress-bar-fill" style={{ width: '100%' }}></div>
                  </div>
                )}
                {wordLimit !== -1 && (
                  <span className="progress-sub">Đã dùng {wordPercent}% hạn mức từ cho phép.</span>
                )}
              </div>

              {/* Image Limit */}
              <div className="progress-group">
                <div className="progress-labels">
                  <span>Số ảnh AI đã vẽ</span>
                  <span className="progress-value">
                    <strong>{imagesUsed}</strong> / {imageLimit === -1 ? 'Không giới hạn' : `${imageLimit} ảnh`}
                  </span>
                </div>
                {imageLimit !== -1 ? (
                  <div className="progress-bar-bg">
                    <div 
                      className={`progress-bar-fill accent ${imagePercent > 85 ? 'warning' : ''}`} 
                      style={{ width: `${imagePercent}%` }}
                    ></div>
                  </div>
                ) : (
                  <div className="progress-bar-bg unlimited">
                    <div className="progress-bar-fill accent" style={{ width: '100%' }}></div>
                  </div>
                )}
                {imageLimit !== -1 && (
                  <span className="progress-sub">Đã dùng {imagePercent}% hạn mức ảnh cho phép.</span>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Section Title */}
          <div className="section-title-wrapper">
            <h2>Nâng cấp tài khoản của bạn</h2>
            <p>Chọn gói cước phù hợp nhất với nhu cầu sáng tạo và phát triển nội dung của bạn.</p>
          </div>

          {/* Plans Grid */}
          {loadingPlans ? (
            <div className="plans-loading">
              <RefreshCw size={32} className="spin-icon" />
              <p>Đang tải danh sách các gói cước...</p>
            </div>
          ) : (
            <div className="plans-grid">
              {plans.map((plan) => {
                const isCurrent = currentPlanObj.slug === plan.slug;
                const isFree = plan.priceMonthly === 0;

                return (
                  <div key={plan._id} className={`plan-card ${plan.slug === 'creator' ? 'popular' : ''} ${isCurrent ? 'current' : ''}`}>
                    {plan.slug === 'creator' && <div className="plan-badge">Phổ biến nhất</div>}
                    
                    <div className="plan-card-header">
                      <h4 className="plan-name">{plan.name}</h4>
                      <div className="plan-price-box">
                        <span className="plan-price">{plan.priceDisplay}</span>
                      </div>
                      <p className="plan-limits-desc">
                        Giới hạn: {plan.wordLimitDisplay} &bull; {plan.imageLimitDisplay}
                      </p>
                    </div>

                    <div className="plan-features">
                      <h5>Tính năng bao gồm:</h5>
                      <ul>
                        {plan.features.map((feat, idx) => (
                          <li key={idx}>
                            <Check size={14} className="feature-check-icon" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="plan-action">
                      {isCurrent ? (
                        <button className="plan-btn current-btn" disabled>
                          Gói hiện tại của bạn
                        </button>
                      ) : isFree ? (
                        <button className="plan-btn" onClick={() => handleUpgradeClick(plan)}>
                          Đăng ký gói miễn phí
                        </button>
                      ) : (
                        <button className="plan-btn primary-btn" onClick={() => handleUpgradeClick(plan)}>
                          Nâng cấp ngay <ArrowRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeTab === 'history' && (
        <div className="history-section">
          <div className="section-title-wrapper" style={{ margin: '0 0 20px 0', textAlign: 'left' }}>
            <h3>Lịch sử hóa đơn thanh toán</h3>
            <p>Danh sách các giao dịch đăng ký gói cước và nâng cấp tài khoản của bạn.</p>
          </div>

          {loadingHistory ? (
            <div className="plans-loading">
              <RefreshCw size={24} className="spin-icon" />
              <p>Đang tải lịch sử giao dịch...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="no-transactions">
              <Info size={32} style={{ color: 'var(--text-muted)' }} />
              <p>Bạn chưa thực hiện bất kỳ giao dịch thanh toán nào trên hệ thống.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="transaction-table">
                <thead>
                  <tr>
                    <th>Mã giao dịch</th>
                    <th>Gói cước</th>
                    <th>Số tiền</th>
                    <th>Cổng thanh toán</th>
                    <th>Ngày giao dịch</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx._id}>
                      <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{tx.transactionCode}</td>
                      <td>{tx.planName}</td>
                      <td style={{ fontWeight: '600' }}>{tx.amount.toLocaleString()} VNĐ</td>
                      <td>{tx.paymentMethod}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                        {new Date(tx.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(tx.status)}`}>
                          {getStatusText(tx.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutModalOpen && selectedPlan && (
        <div className="modal-overlay">
          <div className="checkout-modal-container fade-in">
            {verificationSuccess ? (
              // Success Screen Inside Modal
              <div className="success-screen">
                <div className="success-circle">
                  <CheckCircle2 size={64} className="success-icon" />
                </div>
                <h3>Nâng cấp thành công!</h3>
                <p>Cảm ơn bạn đã lựa chọn <strong>{selectedPlan.name}</strong>.</p>
                <div className="success-details-card">
                  <div className="detail-row">
                    <span>Hạn mức mới:</span>
                    <strong>{selectedPlan.wordLimitDisplay}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Hóa đơn:</span>
                    <strong>{selectedPlan.priceDisplay}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Mã GD:</span>
                    <strong style={{ color: 'var(--accent)' }}>{pendingTransaction?.transactionCode}</strong>
                  </div>
                </div>
                <span className="success-redirect-tip">Hệ thống đang đồng bộ và chuyển hướng...</span>
              </div>
            ) : (
              // Payment Selection & Content Screen
              <>
                <div className="modal-header-box">
                  <h3>Thanh toán: {selectedPlan.name}</h3>
                  <button className="modal-close-btn" onClick={handleCloseModal}>×</button>
                </div>

                <div className="checkout-modal-body">
                  {/* Payment Details Overview */}
                  <div className="payment-overview">
                    <div className="overview-item">
                      <span>Gói nâng cấp:</span>
                      <strong className="text-primary">{selectedPlan.name}</strong>
                    </div>
                    <div className="overview-item">
                      <span>Số tiền thanh toán:</span>
                      <strong className="payment-price">{selectedPlan.priceDisplay}</strong>
                    </div>
                    {pendingTransaction && (
                      <div className="overview-item">
                        <span>Mã giao dịch:</span>
                        <strong className="txn-code">{pendingTransaction.transactionCode}</strong>
                      </div>
                    )}
                  </div>

                  {/* Payment Method Selector */}
                  <div className="checkout-tabs">
                    <button 
                      className={`checkout-tab ${paymentMethod === 'Chuyển khoản VietQR' ? 'active' : ''}`}
                      onClick={() => handleMethodChange('Chuyển khoản VietQR')}
                    >
                      <QrCode size={16} />
                      VietQR
                    </button>
                    <button 
                      className={`checkout-tab ${paymentMethod === 'MoMo QR' ? 'active' : ''}`}
                      onClick={() => handleMethodChange('MoMo QR')}
                    >
                      <span style={{ fontWeight: 'bold', fontSize: '12px' }}>M</span>
                      MoMo QR
                    </button>
                    <button 
                      className={`checkout-tab ${paymentMethod === 'Stripe' ? 'active' : ''}`}
                      onClick={() => handleMethodChange('Stripe')}
                    >
                      <CreditCard size={16} />
                      Thẻ Stripe
                    </button>
                  </div>

                  {/* Payment Method Contents */}
                  <div className="checkout-content-area">
                    {isProcessingCheckout ? (
                      <div className="method-loading">
                        <RefreshCw size={24} className="spin-icon" />
                        <p>Đang chuẩn bị thông tin giao dịch...</p>
                      </div>
                    ) : (
                      <>
                        {paymentMethod === 'Chuyển khoản VietQR' && pendingTransaction && (
                          <div className="vietqr-payment-box fade-in">
                            <div className="qr-image-wrapper">
                              {/* Sinh ảnh QR động qua API VietQR */}
                              <img 
                                src={`https://img.vietqr.io/image/MB-0383186835-qr_only.png?amount=${selectedPlan.priceMonthly}&addInfo=${pendingTransaction.transactionCode}&accountName=CONG%20TY%20OPTICONTENT%20HQ`} 
                                alt="VietQR Code" 
                                className="qr-image"
                              />
                              <div className="qr-overlay-brand">VietQR Chuyển khoản nhanh</div>
                            </div>
                            
                            <div className="bank-details-card">
                              <div className="detail-item">
                                <span className="label">Ngân hàng thụ hưởng:</span>
                                <span className="val">MB Bank (Ngân hàng Quân Đội)</span>
                              </div>
                              <div className="detail-item">
                                <span className="label">Số tài khoản:</span>
                                <span className="val highlighted">0383186835</span>
                              </div>
                              <div className="detail-item">
                                <span className="label">Tên tài khoản:</span>
                                <span className="val">CONG TY OPTICONTENT HQ</span>
                              </div>
                              <div className="detail-item">
                                <span className="label">Số tiền:</span>
                                <span className="val highlighted">{(selectedPlan.priceMonthly).toLocaleString()} VNĐ</span>
                              </div>
                              <div className="detail-item">
                                <span className="label">Nội dung chuyển khoản (Memo):</span>
                                <span className="val memo-val">{pendingTransaction.transactionCode}</span>
                              </div>
                            </div>
                            
                            <div className="warning-notice" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)', color: '#065f46', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                              <RefreshCw size={14} className="spin-icon" style={{ color: '#10b981' }} />
                              <span>Hệ thống đang chờ thanh toán và sẽ tự động kích hoạt gói cước ngay khi nhận được tiền...</span>
                            </div>

                            <div className="warning-notice" style={{ marginTop: '12px' }}>
                              <AlertCircle size={14} style={{ color: '#b45309' }} />
                              <span>Chú ý: Bạn cần ghi chính xác <strong>Mã giao dịch</strong> trong nội dung chuyển khoản để hệ thống tự động đối khớp.</span>
                            </div>
                          </div>
                        )}

                        {paymentMethod === 'MoMo QR' && pendingTransaction && (
                          <div className="momo-payment-box fade-in">
                            <div className="momo-qr-wrapper">
                              {/* QR Momo giả lập */}
                              <div className="mock-momo-qr">
                                <QrCode size={120} style={{ color: '#d24180' }} />
                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#d24180', marginTop: '10px' }}>VÍ MOMO</span>
                              </div>
                            </div>
                            
                            <div className="bank-details-card momo-theme">
                              <div className="detail-item">
                                <span className="label">Số điện thoại MoMo:</span>
                                <span className="val highlighted">0987654321</span>
                              </div>
                              <div className="detail-item">
                                <span className="label">Chủ tài khoản:</span>
                                <span className="val">Nguyễn Văn Trọng</span>
                              </div>
                              <div className="detail-item">
                                <span className="label">Số tiền:</span>
                                <span className="val">{(selectedPlan.priceMonthly).toLocaleString()} VNĐ</span>
                              </div>
                              <div className="detail-item">
                                <span className="label">Lời nhắn (Memo):</span>
                                <span className="val memo-val">{pendingTransaction.transactionCode}</span>
                              </div>
                            </div>

                            <div className="warning-notice" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)', color: '#065f46', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                              <RefreshCw size={14} className="spin-icon" style={{ color: '#10b981' }} />
                              <span>Hệ thống đang chờ thanh toán MoMo và sẽ tự động kích hoạt gói cước...</span>
                            </div>
                          </div>
                        )}

                        {paymentMethod === 'Stripe' && (
                          <div className="stripe-payment-box fade-in">
                            <h5 className="stripe-title">Thanh toán bằng thẻ Visa/Mastercard</h5>
                            
                            <div className="stripe-form">
                              <div className="form-group">
                                <label className="stripe-label">Tên chủ thẻ</label>
                                <input 
                                  type="text" 
                                  placeholder="NGUYEN VAN TRONG" 
                                  className="stripe-input"
                                  value={cardName}
                                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                                />
                              </div>
                              
                              <div className="form-group">
                                <label className="stripe-label">Số thẻ</label>
                                <div className="input-with-icon">
                                  <CreditCard size={16} className="input-icon" />
                                  <input 
                                    type="text" 
                                    placeholder="4242 4242 4242 4242" 
                                    className="stripe-input has-icon"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                  />
                                </div>
                              </div>
                              
                              <div className="stripe-row">
                                <div className="form-group" style={{ flex: 1 }}>
                                  <label className="stripe-label">Hạn dùng (MM/YY)</label>
                                  <input 
                                    type="text" 
                                    placeholder="12/28" 
                                    className="stripe-input"
                                    value={cardExpiry}
                                    onChange={(e) => setCardExpiry(e.target.value)}
                                  />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                  <label className="stripe-label">Mã bảo mật CVV</label>
                                  <input 
                                    type="password" 
                                    placeholder="***" 
                                    maxLength={3} 
                                    className="stripe-input"
                                    value={cardCvv}
                                    onChange={(e) => setCardCvv(e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="checkout-modal-footer">
                  <button 
                    className="btn-secondary" 
                    onClick={() => setCheckoutModalOpen(false)}
                    disabled={isVerifying}
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    className="btn-primary highlight-btn" 
                    onClick={handleConfirmPayment}
                    disabled={isVerifying || isProcessingCheckout || !pendingTransaction}
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw size={14} className="spin-icon" />
                        Đang xác minh chuyển khoản...
                      </>
                    ) : paymentMethod === 'Stripe' ? (
                      <>
                        Xác nhận Thanh toán Stripe
                        <ArrowRight size={14} />
                      </>
                    ) : (
                      <>
                        <RefreshCw size={14} className="spin-icon" style={{ marginRight: '6px' }} />
                        Chờ hệ thống tự nhận diện...
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Pricing;
