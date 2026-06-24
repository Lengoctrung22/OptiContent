import { useState } from 'react';
import { Zap, Mail, Lock, User, ArrowRight, Eye, EyeOff, CheckCircle2, Sparkles, TrendingUp, ShieldCheck, ArrowLeft, KeyRound, MailCheck } from 'lucide-react';
import api from '../services/api.js';

const Auth = ({ onLogin, resetToken }) => {
  // authView: 'login' | 'register' | 'forgot' | 'reset'
  const [authView, setAuthView] = useState(resetToken ? 'reset' : 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [devResetUrl, setDevResetUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const isLogin = authView === 'login';
  const isRegister = authView === 'register';
  const isForgot = authView === 'forgot';
  const isReset = authView === 'reset';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        // Gọi API Đăng nhập thực tế
        const response = await api.post('/auth/login', { email, password });
        
        if (response.data && response.data.success) {
          // Lưu JWT token vào sessionStorage
          sessionStorage.setItem('token', response.data.token);
          
          // Chuyển đổi trạng thái đăng nhập cho App.jsx
          onLogin({
            name: response.data.user.fullName,
            email: response.data.user.email,
            avatar: response.data.user.avatar || '',
            role: response.data.user.role,
          });
        }
      } else if (isRegister) {
        // Gọi API Đăng ký tài khoản thực tế
        const response = await api.post('/auth/register', { 
          fullName: name, 
          email, 
          password 
        });

        if (response.data && response.data.success) {
          alert('Đăng ký tài khoản thành công! Hãy đăng nhập bằng tài khoản mới của bạn.');
          setAuthView('login');
          setName('');
          setPassword('');
        }
      } else if (isForgot) {
        // Gọi API Quên mật khẩu
        const response = await api.post('/auth/forgot-password', { email });

        if (response.data && response.data.success) {
          setSuccessMessage(response.data.message);
          if (response.data.devResetUrl) {
            setDevResetUrl(response.data.devResetUrl);
          }
          setEmail('');
        }
      } else if (isReset) {
        // Gọi API Đặt lại mật khẩu
        if (password !== confirmPassword) {
          setError('Mật khẩu xác nhận không khớp!');
          setLoading(false);
          return;
        }

        if (password.length < 8) {
          setError('Mật khẩu mới phải chứa ít nhất 8 ký tự!');
          setLoading(false);
          return;
        }

        const response = await api.post(`/auth/reset-password/${resetToken}`, {
          password,
          confirmPassword,
        });

        if (response.data && response.data.success) {
          setSuccessMessage(response.data.message);
          setPassword('');
          setConfirmPassword('');
          // Sau 3 giây chuyển về trang đăng nhập
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
        }
      }
    } catch (err) {
      // Hiển thị thông báo lỗi chi tiết từ backend trả về
      const errorMsg = err.response?.data?.message || 'Kết nối đến máy chủ thất bại!';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginMock = async () => {
    setError('');
    setLoading(true);
    try {
      // Tạo mock dữ liệu Google OAuth giống như khi dùng Google SDK thành công
      const mockGooglePayload = {
        email: `google_user_${Math.floor(Math.random() * 10000)}@gmail.com`,
        name: `Google User ${Math.floor(Math.random() * 100)}`,
        googleId: `g_${Math.random().toString(36).substring(2, 11)}`,
        avatar: '',
      };
      
      const response = await api.post('/auth/google', mockGooglePayload);
      
      if (response.data && response.data.success) {
        sessionStorage.setItem('token', response.data.token);
        onLogin({
          name: response.data.user.fullName,
          email: response.data.user.email,
          avatar: response.data.user.avatar || '',
          role: response.data.user.role,
        });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Lỗi khi đăng nhập bằng Google!';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Hàm helper để render tiêu đề và mô tả cho từng view
  const getViewHeader = () => {
    switch (authView) {
      case 'login':
        return { title: 'Chào mừng quay trở lại!', desc: 'Đăng nhập để tiếp tục sáng tạo cùng AI.' };
      case 'register':
        return { title: 'Bắt đầu dùng thử miễn phí', desc: 'Tạo tài khoản và bắt đầu viết bài chuyên nghiệp.' };
      case 'forgot':
        return { title: 'Quên mật khẩu?', desc: 'Nhập email đăng ký để nhận link đặt lại mật khẩu.' };
      case 'reset':
        return { title: 'Đặt lại mật khẩu', desc: 'Nhập mật khẩu mới cho tài khoản của bạn.' };
      default:
        return { title: '', desc: '' };
    }
  };

  const viewHeader = getViewHeader();

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
            <div className="form-header fade-in-key" key={`${authView}-header`}>
              {(isForgot || isReset) && (
                <div className="auth-view-icon-wrapper">
                  {isForgot ? <MailCheck size={28} /> : <KeyRound size={28} />}
                </div>
              )}
              <h2>{viewHeader.title}</h2>
              <p>{viewHeader.desc}</p>
            </div>

            {/* Switch Tabs - Chỉ hiển thị cho Login/Register */}
            {(isLogin || isRegister) && (
              <div className="auth-tabs">
                <button 
                  className={`auth-tab-btn ${isLogin ? 'active' : ''}`}
                  onClick={() => {
                    setAuthView('login');
                    setError('');
                    setSuccessMessage('');
                    setDevResetUrl('');
                  }}
                >
                  Đăng nhập
                </button>
                <button 
                  className={`auth-tab-btn ${isRegister ? 'active' : ''}`}
                  onClick={() => {
                    setAuthView('register');
                    setError('');
                    setSuccessMessage('');
                    setDevResetUrl('');
                  }}
                >
                  Đăng ký
                </button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="auth-form">
              {error && <div className="auth-error-alert">{error}</div>}
              {successMessage && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  <div className="auth-success-alert">
                    <CheckCircle2 size={16} />
                    <span>{successMessage}</span>
                  </div>
                  {devResetUrl && (
                    <div className="auth-dev-link-box" style={{
                      padding: '12px',
                      backgroundColor: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#1e40af',
                      wordBreak: 'break-all',
                      textAlign: 'left'
                    }}>
                      <strong>[DEV MODE] Đường dẫn đặt lại mật khẩu:</strong>
                      <br />
                      <a 
                        href={devResetUrl.replace('5173', window.location.port || '5173').replace('5174', window.location.port || '5173')} 
                        style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 'bold', display: 'inline-block', marginTop: '6px' }}
                      >
                        Nhấp vào đây để đặt lại mật khẩu ngay
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* === VIEW: LOGIN / REGISTER === */}
              {(isLogin || isRegister) && (
                <>
                  <div className={`auth-form-group animate-field ${isLogin ? 'hidden' : ''}`}>
                    <label>Họ và tên</label>
                    <div className="auth-input-wrapper">
                      <User size={16} className="auth-input-icon" />
                      <input 
                        type="text" 
                        placeholder="Nhập họ và tên của bạn" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required={isRegister}
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
                        <a 
                          href="#forgot" 
                          className="forgot-link" 
                          onClick={(e) => {
                            e.preventDefault();
                            setAuthView('forgot');
                            setError('');
                            setSuccessMessage('');
                            setDevResetUrl('');
                            setEmail('');
                          }}
                        >
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
                </>
              )}

              {/* === VIEW: FORGOT PASSWORD === */}
              {isForgot && !successMessage && (
                <div className="fade-in-key" key="forgot-form">
                  <div className="auth-form-group" style={{ marginBottom: '20px' }}>
                    <label>Địa chỉ Email</label>
                    <div className="auth-input-wrapper">
                      <Mail size={16} className="auth-input-icon" />
                      <input 
                        type="email" 
                        placeholder="Nhập email đã đăng ký" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? (
                      <span className="spinner-border">Đang gửi...</span>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
                        <Mail size={16} />
                        <span>Gửi link khôi phục</span>
                      </div>
                    )}
                  </button>
                </div>
              )}

              {/* === VIEW: RESET PASSWORD === */}
              {isReset && !successMessage && (
                <div className="fade-in-key" key="reset-form">
                  <div className="auth-form-group" style={{ marginBottom: '18px' }}>
                    <label>Mật khẩu mới</label>
                    <div className="auth-input-wrapper">
                      <Lock size={16} className="auth-input-icon" />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Tối thiểu 8 ký tự" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoFocus
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

                  <div className="auth-form-group" style={{ marginBottom: '20px' }}>
                    <label>Xác nhận mật khẩu</label>
                    <div className="auth-input-wrapper">
                      <Lock size={16} className="auth-input-icon" />
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        placeholder="Nhập lại mật khẩu mới" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button 
                        type="button" 
                        className="password-toggle-btn"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Password strength indicator */}
                  {password && (
                    <div className="password-strength-bar">
                      <div 
                        className={`strength-fill ${
                          password.length >= 12 ? 'strong' : 
                          password.length >= 8 ? 'medium' : 'weak'
                        }`}
                      />
                      <span className="strength-label">
                        {password.length < 8 ? 'Yếu — cần ít nhất 8 ký tự' : 
                         password.length < 12 ? 'Trung bình' : 'Mạnh'}
                      </span>
                    </div>
                  )}

                  <button type="submit" className="auth-submit-btn" disabled={loading} style={{ marginTop: '8px' }}>
                    {loading ? (
                      <span className="spinner-border">Đang xử lý...</span>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
                        <KeyRound size={16} />
                        <span>Đặt lại mật khẩu</span>
                      </div>
                    )}
                  </button>
                </div>
              )}
            </form>

            {/* Back to login link - for forgot & reset views */}
            {(isForgot || isReset) && (
              <div className="back-to-login-wrapper">
                <button 
                  type="button"
                  className="back-to-login-btn"
                  onClick={() => {
                    if (isReset) {
                      window.location.href = '/';
                    } else {
                      setAuthView('login');
                      setError('');
                      setSuccessMessage('');
                      setDevResetUrl('');
                      setEmail('');
                      setPassword('');
                      setConfirmPassword('');
                    }
                  }}
                >
                  <ArrowLeft size={14} />
                  <span>Quay lại đăng nhập</span>
                </button>
              </div>
            )}

            {/* Divider - Chỉ hiển thị cho Login/Register */}
            {(isLogin || isRegister) && (
              <>
                <div className="auth-divider">
                  <span>Hoặc tiếp tục bằng</span>
                </div>

                {/* Google Button */}
                <div className="social-login-grid" style={{ gridTemplateColumns: '1fr' }}>
                  <button 
                    type="button" 
                    className="social-btn"
                    onClick={handleGoogleLoginMock}
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
