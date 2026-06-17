import React, { useState } from 'react';
import { Zap, Mail, Lock, User, ArrowRight, Eye, EyeOff, CheckCircle2, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (isLogin) {
        if (email.trim() && password.trim()) {
          onLogin({
            name: email.split('@')[0] === 'trongnv' ? 'Nguyễn Văn Trọng' : email.split('@')[0],
            email: email,
            avatar: ''
          });
        } else {
          setError('Vui lòng điền đầy đủ email và mật khẩu.');
        }
      } else {
        if (name.trim() && email.trim() && password.trim()) {
          alert('Đăng ký tài khoản thành công! Hãy đăng nhập bằng tài khoản mới.');
          setIsLogin(true);
          setName('');
          setPassword('');
        } else {
          setError('Vui lòng nhập đầy đủ tất cả thông tin yêu cầu.');
        }
      }
    }, 1200);
  };

  return (
    <div className="auth-page-container">
      <div className="auth-split-box">
        {/* Left Column: Visual/Marketing Panel */}
        <div className="auth-info-panel">
          <div className="auth-info-content">
            <div className="info-brand">
              <Zap size={32} className="info-brand-icon" />
              <h1>OptiContent</h1>
            </div>
            
            <h2 className="info-headline">Sáng Tạo Nội Dung Bứt Phá Với Trí Tuệ Nhân Tạo</h2>
            <p className="info-subheadline">
              Giải pháp tối ưu hóa bài viết blog, nội dung mạng xã hội và email marketing bằng AI thế hệ mới.
            </p>

            <div className="info-features-list">
              <div className="info-feature-item">
                <div className="feature-icon-wrapper">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4>Tạo bài viết thần tốc</h4>
                  <p>Lên dàn ý, nháp nội dung đầy đủ và hoàn thiện bài viết chỉ trong 30 giây.</p>
                </div>
              </div>

              <div className="info-feature-item">
                <div className="feature-icon-wrapper">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h4>Chuẩn SEO vượt trội</h4>
                  <p>Tự động phân tích từ khóa, tối ưu mật độ giúp bài viết leo top tìm kiếm dễ dàng.</p>
                </div>
              </div>

              <div className="info-feature-item">
                <div className="feature-icon-wrapper">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4>Độc bản Brand Voice</h4>
                  <p>Huấn luyện AI theo phong cách viết cá nhân để tạo nên nội dung đặc trưng riêng biệt.</p>
                </div>
              </div>
            </div>

            <div className="info-footer-text">
              Đã có hơn 1,200+ creators và marketer tin dùng OptiContent hằng ngày.
            </div>
          </div>
        </div>

        {/* Right Column: Form Panel */}
        <div className="auth-form-panel">
          <div className="auth-form-container">
            {/* Header */}
            <div className="form-header fade-in-key" key={isLogin ? 'login-header' : 'register-header'}>
              <h2>{isLogin ? 'Chào mừng quay trở lại!' : 'Bắt đầu dùng thử miễn phí'}</h2>
              <p>{isLogin ? 'Đăng nhập để tiếp tục sáng tạo cùng AI.' : 'Tạo tài khoản và bắt đầu viết bài chuyên nghiệp.'}</p>
            </div>

            {/* Switch Tabs */}
            <div className="auth-tabs">
              <button 
                className={`auth-tab-btn ${isLogin ? 'active' : ''}`}
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                }}
              >
                Đăng nhập
              </button>
              <button 
                className={`auth-tab-btn ${!isLogin ? 'active' : ''}`}
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
              >
                Đăng ký
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="auth-form">
              {error && <div className="auth-error-alert">{error}</div>}

              <div className={`auth-form-group animate-field ${isLogin ? 'hidden' : ''}`}>
                <label>Họ và tên</label>
                <div className="auth-input-wrapper">
                  <User size={16} className="auth-input-icon" />
                  <input 
                    type="text" 
                    placeholder="Nhập họ và tên của bạn" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              </div>

              <div className="auth-form-group">
                <label>Địa chỉ Email</label>
                <div className="auth-input-wrapper">
                  <Mail size={16} className="auth-input-icon" />
                  <input 
                    type="email" 
                    placeholder="ten@viethoat.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-form-group">
                <div className="password-label-row">
                  <label>Mật khẩu</label>
                  {isLogin && (
                    <a href="#forgot" className="forgot-link" onClick={() => alert('Chức năng khôi phục mật khẩu đang được phát triển.')}>
                      Quên mật khẩu?
                    </a>
                  )}
                </div>
                <div className="auth-input-wrapper">
                  <Lock size={16} className="auth-input-icon" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? (
                  <span className="spinner-border">Đang xử lý...</span>
                ) : (
                  <div className="fade-in-key" key={isLogin ? 'btn-login' : 'btn-register'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
                    <span>{isLogin ? 'Đăng nhập tài khoản' : 'Đăng ký ngay'}</span>
                    <ArrowRight size={16} />
                  </div>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="auth-divider">
              <span>Hoặc tiếp tục bằng</span>
            </div>

            {/* Google Button */}
            <div className="social-login-grid" style={{ gridTemplateColumns: '1fr' }}>
              <button 
                type="button" 
                className="social-btn"
                onClick={() => onLogin({ name: 'Google User', email: 'google@gmail.com', avatar: '' })}
              >
                <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.39 3.65 1.5 7.5l3.86 3C6.27 7.59 8.92 5.04 12 5.04z"/>
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.27H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.76 2.91c2.2-2.02 3.67-5 3.67-8.73z"/>
                  <path fill="#FBBC05" d="M5.36 14.5c-.25-.75-.39-1.55-.39-2.5s.14-1.75.39-2.5L1.5 6.5C.54 8.21 0 10.05 0 12s.54 3.79 1.5 5.5l3.86-3z"/>
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.76-2.91c-1.1.74-2.52 1.18-4.2 1.18-3.08 0-5.73-2.55-6.64-5.46L1.5 16.5C3.39 20.35 7.35 23 12 23z"/>
                </svg>
                Tiếp tục với Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
