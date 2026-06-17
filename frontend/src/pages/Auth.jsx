import React, { useState } from 'react';
import { Zap, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';

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

    // Giả lập xác thực người dùng
    setTimeout(() => {
      setLoading(false);
      if (isLogin) {
        // Mô phỏng đăng nhập thành công
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
        // Mô phỏng đăng ký thành công -> Chuyển sang đăng nhập
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
    <div className="auth-container">
      <div className="auth-card">
        {/* Logo Brand */}
        <div className="auth-logo">
          <Zap size={28} className="logo-icon" />
          <h2>OptiContent</h2>
          <p>Nền tảng sáng tạo nội dung tối ưu bằng AI</p>
        </div>

        {/* Tab Headers */}
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

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error-alert">{error}</div>}

          {!isLogin && (
            <div className="auth-form-group">
              <label>Họ và tên</label>
              <div className="auth-input-wrapper">
                <User size={16} className="auth-input-icon" />
                <input 
                  type="text" 
                  placeholder="Nhập họ và tên của bạn" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

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
              <>
                <span>{isLogin ? 'Đăng nhập tài khoản' : 'Đăng ký ngay'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Divider & Social Signin */}
        <div className="auth-divider">
          <span>Hoặc tiếp tục bằng</span>
        </div>

        <div className="social-login-grid">
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
            Google
          </button>

          <button 
            type="button" 
            className="social-btn"
            onClick={() => onLogin({ name: 'Github User', email: 'github@github.com', avatar: '' })}
          >
            <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24">
              <path fill="#24292F" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            GitHub
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
