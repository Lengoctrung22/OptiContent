import React, { useState } from 'react';
import { User, Sparkles, Link, Save, Check } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [displayName, setDisplayName] = useState('Nguyễn Văn Trọng');
  const [email, setEmail] = useState('trongnv@gmail.com');
  const [brandVoiceText, setBrandVoiceText] = useState(
    'Cung cấp thông tin trực diện, chính xác và có góc nhìn chuyên sâu. Tránh sử dụng các từ ngữ quá sáo rỗng hoặc quá hoa mỹ.'
  );

  // Integrations toggles
  const [wpConnected, setWpConnected] = useState(true);
  const [fbConnected, setFbConnected] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
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
            <form onSubmit={handleSaveSettings} className="settings-form">
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

              <div className="form-group">
                <label>Mật khẩu hiện tại</label>
                <input type="password" placeholder="••••••••" disabled />
              </div>

              <button type="submit" className="generate-button" style={{ alignSelf: 'flex-start', padding: '10px 24px' }} disabled={isSaving}>
                {isSaving ? 'Đang lưu...' : savedSuccess ? 'Đã lưu thành công!' : 'Cập nhật hồ sơ'}
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
