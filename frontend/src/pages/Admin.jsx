import React, { useState } from 'react';
import { 
  Users, 
  Activity, 
  DollarSign, 
  Key, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Search, 
  Settings as SettingsIcon, 
  AlertCircle, 
  Plus, 
  Trash2, 
  CheckCircle,
  Database,
  RefreshCw,
  Terminal,
  CreditCard
} from 'lucide-react';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Trạng thái quản lý người dùng giả lập
  const [usersList, setUsersList] = useState([
    { id: 'usr-001', name: 'Nguyễn Văn Trọng', email: 'trongnv@gmail.com', role: 'User', status: 'Active', usage: 14200, joined: '10/05/2026' },
    { id: 'usr-002', name: 'Trần Thị Mai', email: 'maitt@gmail.com', role: 'User', status: 'Active', usage: 38900, joined: '12/05/2026' },
    { id: 'usr-003', name: 'Phạm Minh Hoàng', email: 'hoangpm@gmail.com', role: 'Creator', status: 'Active', usage: 85200, joined: '15/05/2026' },
    { id: 'usr-004', name: 'Lê Huy Tuấn', email: 'tuanlh@gmail.com', role: 'User', status: 'Banned', usage: 200, joined: '18/05/2026' },
    { id: 'usr-005', name: 'Hoàng Anh Đức', email: 'ducha@gmail.com', role: 'Agency', status: 'Active', usage: 198200, joined: '20/05/2026' }
  ]);
  const [searchTerm, setSearchTerm] = useState('');

  // Trạng thái quản lý các gói cước giới hạn
  const [billingPlans, setBillingPlans] = useState([
    { id: 'plan-1', name: 'Gói Miễn Phí (Free)', price: '0đ', wordLimit: '10,000 từ / tháng', imgLimit: '5 ảnh', usersCount: 890 },
    { id: 'plan-2', name: 'Gói Nhà Sáng Tạo (Creator)', price: '199,000đ / tháng', wordLimit: '100,000 từ / tháng', imgLimit: '100 ảnh', usersCount: 280 },
    { id: 'plan-3', name: 'Gói Đại Lý (Agency)', price: '499,000đ / tháng', wordLimit: 'Không giới hạn', imgLimit: 'Không giới hạn', usersCount: 75 }
  ]);

  // Trạng thái cấu hình hệ thống
  const [systemKeys, setSystemKeys] = useState({
    geminiKey: 'AIzaSyC**************************',
    openaiKey: 'sk-proj-*************************',
    langchainPrompt: 'Bạn là một trợ lý AI viết nội dung tối ưu SEO chuyên nghiệp. Nhiệm vụ của bạn là tạo bài viết có giọng điệu phù hợp, mạch lạc và tự nhiên theo yêu cầu của người dùng...'
  });
  
  // Terminal system logs
  const [systemLogs, setSystemLogs] = useState([
    { time: '14:50:22', type: 'INFO', msg: 'Gemini-1.5-pro session initialized for user hoangpm@gmail.com' },
    { time: '14:50:45', type: 'INFO', msg: 'System logs buffer flushed. DB connection healthy.' },
    { time: '14:51:02', type: 'WARNING', msg: 'API request threshold reached 85% limit for free plan usr-001' },
    { time: '14:51:10', type: 'ERROR', msg: 'WordPress syndication failed for user maitt@gmail.com: Invalid Auth token' },
    { time: '14:52:05', type: 'INFO', msg: 'Successfully generated outline for article id: mock-1' }
  ]);

  const toggleUserStatus = (userId) => {
    setUsersList(usersList.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'Active' ? 'Banned' : 'Active';
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleResetPassword = (email) => {
    alert(`Một link khôi phục mật khẩu tạm thời đã được gửi tới email ${email}.`);
  };

  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-dashboard-container">
      {/* Admin Tab Navigation */}
      <div className="admin-nav-tabs">
        <button 
          className={`admin-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Activity size={18} />
          <span>Tổng quan Admin</span>
        </button>
        
        <button 
          className={`admin-nav-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={18} />
          <span>Quản lý Người dùng</span>
        </button>

        <button 
          className={`admin-nav-btn ${activeTab === 'billing' ? 'active' : ''}`}
          onClick={() => setActiveTab('billing')}
        >
          <CreditCard size={18} />
          <span>Quản lý Gói cước</span>
        </button>

        <button 
          className={`admin-nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <SettingsIcon size={18} />
          <span>Cài đặt Hệ thống</span>
        </button>
      </div>

      {/* Content area */}
      <div className="admin-content-card">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="admin-overview-tab">
            <div className="stats-grid">
              <div className="stat-card-admin">
                <div className="stat-card-header">
                  <span className="stat-title">Tổng Người Dùng</span>
                  <div className="stat-icon-wrapper user-bg"><Users size={20} /></div>
                </div>
                <div className="stat-value">1,245</div>
                <div className="stat-desc text-green">▲ +12% tháng trước</div>
              </div>

              <div className="stat-card-admin">
                <div className="stat-card-header">
                  <span className="stat-title">Yêu cầu API đã dùng</span>
                  <div className="stat-icon-wrapper api-bg"><Activity size={20} /></div>
                </div>
                <div className="stat-value">345,182</div>
                <div className="stat-desc text-muted">Hạn mức tháng này: 500,000</div>
              </div>

              <div className="stat-card-admin">
                <div className="stat-card-header">
                  <span className="stat-title">Doanh thu ước tính</span>
                  <div className="stat-icon-wrapper revenue-bg"><DollarSign size={20} /></div>
                </div>
                <div className="stat-value">55,790,000 đ</div>
                <div className="stat-desc text-green">▲ +8.5% so với tuần trước</div>
              </div>

              <div className="stat-card-admin">
                <div className="stat-card-header">
                  <span className="stat-title">Chi phí API (Gemini/OpenAI)</span>
                  <div className="stat-icon-wrapper cost-bg"><Key size={20} /></div>
                </div>
                <div className="stat-value">2,840,000 đ</div>
                <div className="stat-desc text-red">▼ Chiếm ~5.1% doanh thu</div>
              </div>
            </div>

            {/* Performance charts / logs summary */}
            <div className="admin-overview-details">
              <div className="system-health-panel">
                <h3>Trạng thái dịch vụ nền (System Health)</h3>
                <div className="health-metrics-list">
                  <div className="health-item">
                    <span className="health-label">API Gateway:</span>
                    <span className="health-status-badge success">Hoạt động bình thường</span>
                  </div>
                  <div className="health-item">
                    <span className="health-label">Database (MongoDB Atlas):</span>
                    <span className="health-status-badge success">Kết nối tốt (Ping: 4ms)</span>
                  </div>
                  <div className="health-item">
                    <span className="health-label">Gemini AI Model:</span>
                    <span className="health-status-badge success">Sẵn sàng (Rate limit: OK)</span>
                  </div>
                  <div className="health-item">
                    <span className="health-label">Dịch vụ gửi Mail:</span>
                    <span className="health-status-badge warning">Đang bảo trì cổng SMTP phụ</span>
                  </div>
                </div>
              </div>

              <div className="recent-system-alerts">
                <h3>Cảnh báo hệ thống mới nhất</h3>
                <div className="alerts-history-list">
                  <div className="alert-history-item error">
                    <AlertCircle size={16} />
                    <span>[14:51:10] WordPress syndication failed for user maitt@gmail.com</span>
                  </div>
                  <div className="alert-history-item warning">
                    <AlertCircle size={16} />
                    <span>[14:51:02] Yêu cầu API chạm hạn mức 85% gói Free (usr-001)</span>
                  </div>
                  <div className="alert-history-item info">
                    <CheckCircle size={16} />
                    <span>[14:48:00] Sao lưu cơ sở dữ liệu hoàn tất thành công.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="admin-users-tab">
            <div className="admin-tab-header-row">
              <h3>Danh sách tài khoản khách hàng</h3>
              <div className="admin-search-wrapper">
                <Search size={16} className="search-icon-inside" />
                <input 
                  type="text" 
                  placeholder="Tìm theo tên hoặc email..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Họ và Tên</th>
                    <th>Email</th>
                    <th>Gói sử dụng</th>
                    <th>API Tokens đã dùng</th>
                    <th>Trạng thái</th>
                    <th>Ngày tham gia</th>
                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td className="code-font">{user.id}</td>
                        <td><strong>{user.name}</strong></td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge ${user.role.toLowerCase()}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{user.usage.toLocaleString()} từ</td>
                        <td>
                          <span className={`status-badge-admin ${user.status.toLowerCase()}`}>
                            {user.status === 'Active' ? 'Đang hoạt động' : 'Đang khóa'}
                          </span>
                        </td>
                        <td>{user.joined}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="admin-actions-cell">
                            <button 
                              className="action-btn-mini edit-btn"
                              onClick={() => handleResetPassword(user.email)}
                              title="Reset Password"
                            >
                              Cấp mật khẩu
                            </button>
                            <button 
                              className={`action-btn-mini ${user.status === 'Active' ? 'ban-btn' : 'unban-btn'}`}
                              onClick={() => toggleUserStatus(user.id)}
                              title={user.status === 'Active' ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
                            >
                              {user.status === 'Active' ? <Lock size={12} /> : <Unlock size={12} />}
                              {user.status === 'Active' ? ' Khóa' : ' Mở'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="no-data-cell">Không tìm thấy người dùng phù hợp.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: BILLING & SUBSCRIPTIONS */}
        {activeTab === 'billing' && (
          <div className="admin-billing-tab">
            <div className="admin-tab-header-row">
              <div>
                <h3>Quản lý gói cước ứng dụng (SaaS Plans)</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Cấu hình quyền hạn sử dụng, giới hạn API và mức giá hàng tháng.</p>
              </div>
              <button className="primary-btn-admin" onClick={() => alert('Chức năng thêm gói cước đang được phát triển.')}>
                <Plus size={16} /> Thêm Gói Mới
              </button>
            </div>

            <div className="plans-grid">
              {billingPlans.map(plan => (
                <div className="plan-admin-card" key={plan.id}>
                  <div className="plan-header-admin">
                    <h4>{plan.name}</h4>
                    <span className="plan-badge-users">{plan.usersCount} users</span>
                  </div>
                  <div className="plan-price-large">{plan.price}</div>
                  
                  <div className="plan-limits-list">
                    <div className="limit-item">
                      <strong>Hạn mức:</strong> {plan.wordLimit}
                    </div>
                    <div className="limit-item">
                      <strong>Tạo ảnh AI:</strong> {plan.imgLimit}
                    </div>
                  </div>
                  
                  <div className="plan-actions-admin">
                    <button className="plan-btn edit" onClick={() => alert(`Chỉnh sửa gói: ${plan.name}`)}>Cấu hình gói</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="recent-transactions-section" style={{ marginTop: '40px' }}>
              <h3>Lịch sử giao dịch thanh toán mới nhất</h3>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mã Giao Dịch</th>
                      <th>Khách Hàng</th>
                      <th>Gói nâng cấp</th>
                      <th>Số Tiền</th>
                      <th>Cổng thanh toán</th>
                      <th>Thời gian</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="code-font">TXN-77821</td>
                      <td>hoangpm@gmail.com</td>
                      <td>Gói Nhà Sáng Tạo (Creator)</td>
                      <td>199,000 đ</td>
                      <td>MoMo QR</td>
                      <td>16/06/2026 09:24</td>
                      <td><span className="status-badge-admin active">Thành công</span></td>
                    </tr>
                    <tr>
                      <td className="code-font">TXN-77819</td>
                      <td>ducha@gmail.com</td>
                      <td>Gói Đại Lý (Agency)</td>
                      <td>499,000 đ</td>
                      <td>Chuyển khoản VietQR</td>
                      <td>15/06/2026 18:12</td>
                      <td><span className="status-badge-admin active">Thành công</span></td>
                    </tr>
                    <tr>
                      <td className="code-font">TXN-77818</td>
                      <td>trongnv@gmail.com</td>
                      <td>Gói Nhà Sáng Tạo (Creator)</td>
                      <td>199,000 đ</td>
                      <td>MoMo QR</td>
                      <td>14/06/2026 11:05</td>
                      <td><span className="status-badge-admin active">Thành công</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SYSTEM SETTINGS */}
        {activeTab === 'settings' && (
          <div className="admin-settings-tab">
            <div className="settings-section-block">
              <h3>Quản lý khóa API (Credentials)</h3>
              <div className="form-grid-admin">
                <div className="admin-form-group">
                  <label>Google Gemini API Key</label>
                  <div className="input-button-row">
                    <input 
                      type="password" 
                      value={systemKeys.geminiKey}
                      onChange={(e) => setSystemKeys({ ...systemKeys, geminiKey: e.target.value })}
                    />
                    <button className="secondary-btn-admin" onClick={() => alert('Đã cập nhật Gemini API Key!')}>Lưu Key</button>
                  </div>
                  <span className="input-help-text">Dùng để kích hoạt Gemini Pro/Flash thực hiện sinh nội dung.</span>
                </div>

                <div className="admin-form-group">
                  <label>OpenAI DALL-E/GPT API Key (Dự phòng)</label>
                  <div className="input-button-row">
                    <input 
                      type="password" 
                      value={systemKeys.openaiKey}
                      onChange={(e) => setSystemKeys({ ...systemKeys, openaiKey: e.target.value })}
                    />
                    <button className="secondary-btn-admin" onClick={() => alert('Đã cập nhật OpenAI API Key!')}>Lưu Key</button>
                  </div>
                  <span className="input-help-text">Dùng để dự phòng mô hình tạo nội dung và tạo hình ảnh AI nâng cao.</span>
                </div>
              </div>
            </div>

            <div className="settings-section-block" style={{ marginTop: '30px' }}>
              <h3>Cấu hình LangChain & Prompt hệ thống chính</h3>
              <div className="admin-form-group">
                <label>System instructions Prompt (SEO Engine)</label>
                <textarea 
                  rows={4}
                  value={systemKeys.langchainPrompt}
                  onChange={(e) => setSystemKeys({ ...systemKeys, langchainPrompt: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '13px', lineHeight: '1.6' }}
                />
                <button className="primary-btn-admin" style={{ marginTop: '10px' }} onClick={() => alert('Đã cập nhật Prompt cấu hình hệ thống!')}>
                  Lưu Cấu Hình Prompt
                </button>
              </div>
            </div>

            {/* LIVE SYSTEM LOGS TERMINAL */}
            <div className="logs-terminal-block" style={{ marginTop: '30px' }}>
              <div className="terminal-header">
                <div className="terminal-buttons">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <div className="terminal-title">
                  <Terminal size={14} /> Live System Logs (Real-time monitoring)
                </div>
                <button className="refresh-logs-btn" onClick={() => {
                  setSystemLogs([
                    ...systemLogs,
                    { time: new Date().toLocaleTimeString(), type: 'INFO', msg: 'System integrity audit completed. All services active.' }
                  ]);
                }}>
                  <RefreshCw size={12} /> Làm mới
                </button>
              </div>
              <div className="terminal-body">
                {systemLogs.map((log, index) => (
                  <div className="terminal-line" key={index}>
                    <span className="log-time">[{log.time}]</span>
                    <span className={`log-type ${log.type.toLowerCase()}`}>[{log.type}]</span>
                    <span className="log-msg">{log.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Admin;
