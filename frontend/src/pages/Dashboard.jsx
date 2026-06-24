
import { PenTool, Share2, Mail, FileText, Image as ImageIcon, Sparkles, Clock } from 'lucide-react';

const Dashboard = ({ setActiveScreen, setWorkspaceDefaults, historyList = [] }) => {
  // Tính toán số liệu thống kê thực tế từ lịch sử lưu trữ
  const totalArticles = historyList.length;
  const totalWords = historyList.reduce((acc, item) => acc + (item.content?.split(/\s+/).length || 0), 0);
  // Đếm số lượng ảnh được tích hợp
  const totalImages = historyList.filter(item => item.hasImage).length;

  // Lấy 3 bài viết gần đây nhất
  const recentArticles = historyList.slice(0, 3);

  const handleQuickAction = (platform) => {
    setWorkspaceDefaults({ platform });
    setActiveScreen('workspace');
  };

  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'blog': return <FileText size={16} />;
      case 'facebook': return <Share2 size={16} />;
      case 'email': return <Mail size={16} />;
      default: return <PenTool size={16} />;
    }
  };

  return (
    <div className="fade-in">
      {/* Welcome Banner */}
      <div className="dashboard-welcome">
        <h3>Chào mừng quay trở lại, Tác giả!</h3>
        <p>Hôm nay bạn muốn sáng tạo nội dung gì? Hãy chọn công cụ nhanh hoặc bắt đầu viết trong phòng làm việc.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Sparkles size={24} />
          </div>
          <div className="stat-info">
            <h4>Số từ đã tạo</h4>
            <p>{totalWords.toLocaleString()}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FileText size={24} />
          </div>
          <div className="stat-info">
            <h4>Bài viết đã lưu</h4>
            <p>{totalArticles}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <ImageIcon size={24} />
          </div>
          <div className="stat-info">
            <h4>Ảnh đã tạo</h4>
            <p>{totalImages}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3>Lối tắt viết nhanh</h3>
        <div className="actions-grid">
          <div className="action-card" onClick={() => handleQuickAction('Blog')}>
            <div className="icon-box">
              <FileText size={20} />
            </div>
            <h4>Bài viết Blog SEO</h4>
            <p>Tạo dàn ý và viết bài blog chuẩn SEO với phân bổ từ khóa tự động.</p>
          </div>

          <div className="action-card" onClick={() => handleQuickAction('Facebook')}>
            <div className="icon-box">
              <Share2 size={20} />
            </div>
            <h4>Mạng xã hội (Facebook)</h4>
            <p>Thu hút người xem với nội dung lôi cuốn, thẻ hashtag và kêu gọi hành động.</p>
          </div>

          <div className="action-card" onClick={() => handleQuickAction('Email')}>
            <div className="icon-box">
              <Mail size={20} />
            </div>
            <h4>Email Marketing</h4>
            <p>Viết email chào hàng, chăm sóc khách hàng hoặc xin nghỉ phép chuyên nghiệp.</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity-section">
        <h3>Hoạt động gần đây</h3>
        {recentArticles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
            Chưa có hoạt động tạo bài viết nào gần đây. Hãy bắt đầu viết bài viết đầu tiên của bạn!
          </div>
        ) : (
          <div className="activity-list">
            {recentArticles.map((article) => (
              <div key={article.id} className="activity-item">
                <div className="activity-main">
                  <span className={`activity-tag ${article.platform?.toLowerCase() || 'blog'}`}>
                    {article.platform || 'Blog'}
                  </span>
                  <div className="activity-details">
                    <h5>{article.title}</h5>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      {getPlatformIcon(article.platform)}
                      <span>Giọng văn: {article.tone}</span>
                      <span>•</span>
                      <span>{article.content?.split(/\s+/).length || 0} từ</span>
                    </p>
                  </div>
                </div>
                <div className="activity-time">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={12} />
                    <span>{new Date(article.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
