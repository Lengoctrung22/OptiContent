import React, { useState } from 'react';
import { User, Sparkles, Link, Save, Check, Key, Image as ImageIcon } from 'lucide-react';

const Settings = ({ userProfile, setUserProfile }) => {
  const [activeTab, setActiveTab] = useState('account');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [displayName, setDisplayName] = useState(userProfile?.name || 'Nguyễn Văn Trọng');
  const [email, setEmail] = useState(userProfile?.email || 'trongnv@gmail.com');
  const [brandVoiceText, setBrandVoiceText] = useState(
    'Cung cấp thông tin trực diện, chính xác và có góc nhìn chuyên sâu. Tránh sử dụng các từ ngữ quá sáo rỗng hoặc quá hoa mỹ.'
  );

  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Integrations toggles
  const [wpConnected, setWpConnected] = useState(true);
  const [fbConnected, setFbConnected] = useState(false);

  // Default avatar image if not set
  const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E";

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Giả lập lưu vào DB
    setTimeout(() => {
      setIsSaving(false);
      setSavedSuccess(true);
      // Cập nhật lên cấp cao hơn
      if (setUserProfile) {
        setUserProfile(prev => ({
          ...prev,
          name: displayName,
          email: email
        }));
      }
      setTimeout(() => setSavedSuccess(false), 2500);
    }, 800);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Convert to base64 to store in local state/localStorage
    const reader = new FileReader();
    reader.onloadend = () => {
      if (setUserProfile) {
        setUserProfile(prev => ({
          ...prev,
          avatar: reader.result
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu mới và xác nhận mật khẩu không khớp!');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải chứa ít nhất 6 ký tự!');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="settings-layout fade-in">
      {/* Settings Navigation Sidebar */}
      <div className="settings-tabs">
        <button
          className={`settings-tab-btn ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          <User size={16} />
          Thông tin tài khoản
        </button>

        <button
          className={`settings-tab-btn ${activeTab === 'brandvoice' ? 'active' : ''}`}
          onClick={() => setActiveTab('brandvoice')}
        >
          <Sparkles size={16} />
          Văn phong thương hiệu
        </button>

        <button
          className={`settings-tab-btn ${activeTab === 'integrations' ? 'active' : ''}`}
          onClick={() => setActiveTab('integrations')}
        >
          <Link size={16} />
          Liên kết ứng dụng
        </button>
      </div>

      {/* Settings Content Panel */}
      <div className="settings-panel">
        {activeTab === 'account' && (
          <div className="fade-in">
            <h3>Hồ sơ cá nhân</h3>
            
            {/* Avatar Uploader Section */}
            <div className="avatar-section">
              <img 
                src={userProfile?.avatar || defaultAvatar} 
                alt="Avatar" 
                className="avatar-preview"
              />
              <div className="avatar-upload-btn">
                <span style={{ fontSize: '13px', fontWeight: '600' }}>Ảnh đại diện</span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Hỗ trợ JPG, PNG (tối đa 2MB)</span>
                <label className="avatar-upload-label">
                  <input 
                    type="file" 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={handleAvatarChange}
                  />
                  Thay đổi ảnh
                </label>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="settings-form" style={{ marginBottom: '40px' }}>
              <div className="form-group">
                <label>Họ và tên</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Địa chỉ Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="generate-button" style={{ alignSelf: 'flex-start', padding: '10px 24px' }} disabled={isSaving}>
                {isSaving ? 'Đang lưu...' : savedSuccess ? 'Đã cập nhật!' : 'Cập nhật hồ sơ'}
              </button>
            </form>

            <h3 style={{ borderTop: '1px solid #f1f5f9', paddingTop: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={18} /> Đổi mật khẩu tài khoản
            </h3>
            
            <form onSubmit={handleChangePassword} className="settings-form" style={{ marginTop: '16px' }}>
              <div className="form-group">
                <label>Mật khẩu hiện tại</label>
                <input 
                  type="password" 
                  placeholder="Nhập mật khẩu hiện tại"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Mật khẩu mới</label>
                <input 
                  type="password" 
                  placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Xác nhận mật khẩu mới</label>
                <input 
                  type="password" 
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {passwordError && (
                <div style={{ color: 'var(--danger)', fontSize: '13px', fontWeight: '500' }}>
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div style={{ color: 'var(--success)', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={16} /> Thay đổi mật khẩu thành công!
                </div>
              )}

              <button type="submit" className="generate-button" style={{ alignSelf: 'flex-start', padding: '10px 24px' }} disabled={isSaving}>
                {isSaving ? 'Đang xử lý...' : 'Đổi mật khẩu'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'brandvoice' && (
          <div className="fade-in">
            <h3>Đào tạo Brand Voice riêng của bạn</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
              Hãy dán 2-3 bài viết cũ hoặc mô tả cách viết nội dung đặc trưng của bạn vào đây. AI sẽ phân tích cấu trúc câu, từ ngữ chuyên dụng và văn phong đặc thù để tự động áp dụng cho các bài viết Workspace của bạn khi chọn tone giọng "Custom Brand Voice".
            </p>
            
            <form onSubmit={handleSaveSettings} className="settings-form" style={{ maxWidth: '100%' }}>
              <div className="form-group">
                <label>Bài mẫu hoặc mô tả Văn phong</label>
                <textarea 
                  rows={8}
                  value={brandVoiceText}
                  onChange={(e) => setBrandVoiceText(e.target.value)}
                  placeholder="Mô tả phong cách viết hoặc dán nội dung mẫu tại đây..."
                  style={{ resize: 'vertical' }}
                  required
                />
              </div>

              <button type="submit" className="generate-button" style={{ alignSelf: 'flex-start', padding: '10px 24px' }} disabled={isSaving}>
                {isSaving ? 'Đang đào tạo...' : savedSuccess ? 'Đã lưu cấu hình!' : 'Lưu & Phân tích văn phong'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="fade-in">
            <h3>Tích hợp & Đồng bộ</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>
              Kết nối trực tiếp OptiContent với website WordPress hoặc trang Fanpage Facebook của bạn để có thể trực tiếp xuất bản bài viết chỉ với 1 click.
            </p>

            <div className="integrations-list">
              {/* WordPress */}
              <div className="integration-item">
                <div className="integration-brand">
                  <div className="integration-logo" style={{ color: '#21759b', fontWeight: 'bold', fontSize: '20px' }}>
                    W
                  </div>
                  <div className="integration-name">
                    <h5>Website WordPress</h5>
                    <p>{wpConnected ? 'Đã kết nối với trongnv.com' : 'Chưa được liên kết'}</p>
                  </div>
                </div>

                <label className="switch-control">
                  <input 
                    type="checkbox" 
                    checked={wpConnected}
                    onChange={(e) => setWpConnected(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              {/* Facebook Fanpage */}
              <div className="integration-item">
                <div className="integration-brand">
                  <div className="integration-logo" style={{ color: '#1877f2', fontWeight: 'bold', fontSize: '20px' }}>
                    f
                  </div>
                  <div className="integration-name">
                    <h5>Trang Facebook Fanpage</h5>
                    <p>{fbConnected ? 'Đã kết nối với OptiContent Fanpage' : 'Chưa được liên kết'}</p>
                  </div>
                </div>

                <label className="switch-control">
                  <input 
                    type="checkbox" 
                    checked={fbConnected}
                    onChange={(e) => setFbConnected(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
