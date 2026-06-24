import React, { useState, useEffect } from 'react';
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
  CreditCard,
  Copy,
  Info
} from 'lucide-react';
import api from '../services/api';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // States
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWords: 0,
    totalRevenue: 0,
    apiCost: 0
  });

  const [health, setHealth] = useState({
    gateway: 'OK',
    database: { status: 'CHECKING', ping: 'N/A' },
    gemini: { status: 'CHECKING' },
    email: { status: 'CHECKING', message: '' }
  });

  const [usersList, setUsersList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [billingPlans, setBillingPlans] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [systemKeys, setSystemKeys] = useState({
    geminiKey: '',
    openaiKey: '',
    langchainPrompt: ''
  });
  
  const [systemLogs, setSystemLogs] = useState([]);

  // Modals / Overlay states
  const [tempPasswordInfo, setTempPasswordInfo] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);

  // Load data based on active tab
  useEffect(() => {
    fetchTabData();
  }, [activeTab]);

  // Load users separately when searchTerm changes (with debounce/trigger)
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [searchTerm]);

  const fetchTabData = async () => {
    setError(null);
    setSuccessMsg(null);
    try {
      if (activeTab === 'overview') {
        setIsLoading(true);
        const statsRes = await api.get('/admin/stats');
        setStats(statsRes.data.data);
        
        const healthRes = await api.get('/admin/health');
        setHealth(healthRes.data.data);

        const logsRes = await api.get('/admin/logs');
        setSystemLogs(logsRes.data.data);
        setIsLoading(false);
      } else if (activeTab === 'users') {
        await fetchUsers();
      } else if (activeTab === 'billing') {
        setIsLoading(true);
        const plansRes = await api.get('/admin/plans');
        setBillingPlans(plansRes.data.data);
        
        const txsRes = await api.get('/admin/transactions');
        setTransactions(txsRes.data.data);
        setIsLoading(false);
      } else if (activeTab === 'settings') {
        setIsLoading(true);
        const settingsRes = await api.get('/admin/settings');
        setSystemKeys({
          geminiKey: settingsRes.data.data.geminiKey || '',
          openaiKey: settingsRes.data.data.openaiKey || '',
          langchainPrompt: settingsRes.data.data.langchainPrompt || ''
        });

        const logsRes = await api.get('/admin/logs');
        setSystemLogs(logsRes.data.data);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('[Admin Fetch Error]', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu từ server!');
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users', { params: { search: searchTerm } });
      setUsersList(res.data.data);
    } catch (err) {
      console.error('[Fetch Users Error]', err);
      setError('Lỗi tải danh sách người dùng!');
    }
  };

  // Actions
  const toggleUserStatus = async (userId) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/status`);
      setUsersList(usersList.map(u => u._id === userId ? { ...u, status: res.data.data.status } : u));
      showSuccess(`Đã thay đổi trạng thái tài khoản thành công!`);
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể thay đổi trạng thái người dùng!');
    }
  };


  const handleResetPassword = async (userId, email) => {
    try {
      const res = await api.post(`/admin/users/${userId}/reset-password`);
      setTempPasswordInfo({
        email: email,
        password: res.data.data.temporaryPassword
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể cấp lại mật khẩu!');
    }
  };

  const handleSavePlan = async () => {
    if (!editingPlan) return;
    try {
      if (editingPlan.isNew) {
        if (!editingPlan.name || !editingPlan.slug) {
          alert('Vui lòng nhập đầy đủ Tên gói cước và Slug!');
          return;
        }
        const res = await api.post('/admin/plans', editingPlan);
        setBillingPlans([...billingPlans, res.data.data]);
        setEditingPlan(null);
        showSuccess('Thêm gói cước mới thành công!');
      } else {
        const res = await api.put(`/admin/plans/${editingPlan._id}`, editingPlan);
        setBillingPlans(billingPlans.map(p => p._id === editingPlan._id ? res.data.data : p));
        setEditingPlan(null);
        showSuccess('Cập nhật cấu hình gói cước thành công!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi lưu gói cước!');
    }
  };

  const handleSaveSettings = async (type) => {
    try {
      const payload = {};
      if (type === 'gemini') payload.geminiKey = systemKeys.geminiKey;
      if (type === 'openai') payload.openaiKey = systemKeys.openaiKey;
      if (type === 'prompt') payload.langchainPrompt = systemKeys.langchainPrompt;

      await api.put('/admin/settings', payload);
      showSuccess('Cập nhật cấu hình thành công!');
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi lưu cấu hình hệ thống!');
    }
  };

  const refreshLogs = async () => {
    try {
      const res = await api.get('/admin/logs');
      setSystemLogs(res.data.data);
      showSuccess('Đã làm mới danh sách nhật ký!');
    } catch (err) {
      alert('Không thể tải nhật ký hệ thống!');
    }
  };

  const clearLogs = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa toàn bộ log hệ thống? Hành động này không thể hoàn tác.')) return;
    try {
      await api.delete('/admin/logs');
      setSystemLogs([]);
      showSuccess('Đã xóa toàn bộ nhật ký hệ thống!');
    } catch (err) {
      alert('Lỗi xóa nhật ký hệ thống!');
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg(null);
    }, 4000);
  };

  const handleCopyPassword = () => {
    if (tempPasswordInfo) {
      navigator.clipboard.writeText(tempPasswordInfo.password);
      alert('Đã sao chép mật khẩu tạm thời vào clipboard!');
    }
  };

  return (
    <div className="admin-dashboard-container">
      {/* Dynamic style tag for overlay modals */}
      <style>{`
        .temp-password-modal-backdrop, .plan-edit-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.2s ease-out;
        }
        .temp-password-modal, .plan-edit-modal {
          background: #ffffff;
          border-radius: 16px;
          padding: 30px;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          animation: scaleUp 0.2s ease-out;
        }
        .temp-password-modal h3, .plan-edit-modal h3 {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .temp-password-code {
          background: #f1f5f9;
          border: 1px dashed #cbd5e1;
          color: var(--accent);
          font-family: monospace;
          font-size: 22px;
          font-weight: bold;
          text-align: center;
          padding: 12px;
          border-radius: 8px;
          margin: 16px 0;
          letter-spacing: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }
        .copy-pw-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          display: flex;
          align-items: center;
        }
        .copy-pw-btn:hover {
          color: var(--accent);
        }
        .modal-note {
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 20px;
        }
        .modal-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 14px;
        }
        .modal-form-group label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
        }
        .modal-form-group input {
          padding: 10px 12px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-size: 14px;
          outline: none;
        }
        .modal-form-group input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 20px;
        }
        .role-select-admin {
          padding: 6px 10px;
          border-radius: 6px;
          border: 1px solid var(--border-color);
          background-color: #ffffff;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
          outline: none;
          cursor: pointer;
        }
        .role-badge-static {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background-color: #f1f5f9;
          color: #475569;
        }
        .role-badge-static.admin {
          background-color: #fee2e2;
          color: #ef4444;
          border: 1px solid #fca5a5;
        }
        .role-badge-static.creator {
          background-color: #e0f2fe;
          color: #0284c7;
          border: 1px solid #7dd3fc;
        }
        .role-badge-static.agency {
          background-color: #f3e8ff;
          color: #7c3aed;
          border: 1px solid #d8b4fe;
        }
        .role-badge-static.user {
          background-color: #f1f5f9;
          color: #475569;
          border: 1px solid #cbd5e1;
        }
        .admin-toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: var(--bg-sidebar);
          color: #ffffff;
          padding: 12px 24px;
          border-radius: 8px;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);
          font-size: 13px;
          font-weight: 500;
          z-index: 99999;
          animation: slideInUp 0.3s ease-out;
          display: flex;
          align-items: center;
          gap: 8px;
          border-left: 4px solid var(--success);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Success Notification Toast */}
      {successMsg && (
        <div className="admin-toast">
          <CheckCircle size={16} className="text-green" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Temp Password Overlay Modal */}
      {tempPasswordInfo && (
        <div className="temp-password-modal-backdrop">
          <div className="temp-password-modal">
            <h3>🔑 Đã Cấp Lại Mật Khẩu Tạm Temporarily</h3>
            <p className="modal-note">Mật khẩu tạm thời cho tài khoản <strong>{tempPasswordInfo.email}</strong> là:</p>
            <div className="temp-password-code">
              <span>{tempPasswordInfo.password}</span>
              <button className="copy-pw-btn" onClick={handleCopyPassword} title="Sao chép mật khẩu">
                <Copy size={18} />
              </button>
            </div>
            <p className="modal-note">* Vui lòng sao chép và gửi mật khẩu tạm thời này cho khách hàng. Họ cần đăng nhập và thay đổi mật khẩu ngay lập tức.</p>
            <div className="modal-actions">
              <button className="primary-btn-admin" onClick={() => setTempPasswordInfo(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Edit Modal */}
      {editingPlan && (
        <div className="plan-edit-modal-backdrop">
          <div className="plan-edit-modal" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>{editingPlan.isNew ? '🆕 Thêm Gói Cước Mới' : `⚙️ Cấu Hình Gói Cước: ${editingPlan.name}`}</h3>
            
            <div className="modal-form-group">
              <label>Tên gói cước</label>
              <input 
                type="text" 
                value={editingPlan.name} 
                onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
              />
            </div>

            {editingPlan.isNew && (
              <div className="modal-form-group">
                <label>Slug định danh (Duy nhất, viết liền không dấu, VD: custom-premium)</label>
                <input 
                  type="text" 
                  placeholder="VD: premium-plus"
                  value={editingPlan.slug || ''} 
                  onChange={(e) => setEditingPlan({ ...editingPlan, slug: e.target.value })}
                />
              </div>
            )}

            <div className="modal-form-group">
              <label>Giá tiền hàng tháng (VNĐ)</label>
              <input 
                type="number" 
                value={editingPlan.priceMonthly} 
                onChange={(e) => setEditingPlan({ ...editingPlan, priceMonthly: Number(e.target.value) })}
              />
            </div>
            <div className="modal-form-group">
              <label>Chuỗi hiển thị giá (VD: 199,000đ / tháng)</label>
              <input 
                type="text" 
                value={editingPlan.priceDisplay} 
                onChange={(e) => setEditingPlan({ ...editingPlan, priceDisplay: e.target.value })}
              />
            </div>
            <div className="modal-form-group">
              <label>Giới hạn số từ hàng tháng</label>
              <input 
                type="number" 
                value={editingPlan.wordLimit} 
                onChange={(e) => setEditingPlan({ ...editingPlan, wordLimit: Number(e.target.value) })}
              />
            </div>
            <div className="modal-form-group">
              <label>Chuỗi hiển thị số từ (VD: 100,000 từ / tháng)</label>
              <input 
                type="text" 
                value={editingPlan.wordLimitDisplay} 
                onChange={(e) => setEditingPlan({ ...editingPlan, wordLimitDisplay: e.target.value })}
              />
            </div>
            <div className="modal-form-group">
              <label>Giới hạn tạo ảnh AI hàng tháng</label>
              <input 
                type="number" 
                value={editingPlan.imageLimit} 
                onChange={(e) => setEditingPlan({ ...editingPlan, imageLimit: Number(e.target.value) })}
              />
            </div>
            <div className="modal-form-group">
              <label>Chuỗi hiển thị số ảnh (VD: 100 ảnh / tháng)</label>
              <input 
                type="text" 
                value={editingPlan.imageLimitDisplay} 
                onChange={(e) => setEditingPlan({ ...editingPlan, imageLimitDisplay: e.target.value })}
              />
            </div>
            <div className="modal-form-group">
              <label>Các tính năng (Phân cách bằng dấu phẩy)</label>
              <input 
                type="text" 
                placeholder="VD: Bản nháp SEO, AI Chat hỗ trợ, Xuất bài viết WordPress"
                value={editingPlan.features ? editingPlan.features.join(', ') : ''} 
                onChange={(e) => setEditingPlan({ ...editingPlan, features: e.target.value.split(',').map(f => f.trim()) })}
              />
            </div>

            <div className="modal-actions">
              <button className="secondary-btn-admin" onClick={() => setEditingPlan(null)}>Hủy</button>
              <button className="primary-btn-admin" onClick={handleSavePlan}>Lưu Cấu Hình</button>
            </div>
          </div>
        </div>
      )}

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
        {error && (
          <div className="alert-history-item error" style={{ margin: '16px', display: 'flex', gap: '8px', padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px' }}>
            <AlertCircle size={18} />
            <span><strong>Lỗi hệ thống:</strong> {error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="editor-empty" style={{ minHeight: '300px' }}>
            <RefreshCw size={36} className="animate-spin text-muted" style={{ animation: 'spin 1.5s linear infinite' }} />
            <h3>Đang tải dữ liệu hệ thống...</h3>
            <p>Vui lòng đợi giây lát trong khi chúng tôi kết nối tới máy chủ.</p>
          </div>
        ) : (
          <>
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="admin-overview-tab">
                <div className="stats-grid">
                  <div className="stat-card-admin">
                    <div className="stat-card-header">
                      <span className="stat-title">Tổng Người Dùng</span>
                      <div className="stat-icon-wrapper user-bg"><Users size={20} /></div>
                    </div>
                    <div className="stat-value">{stats.totalUsers.toLocaleString()}</div>
                    <div className="stat-desc text-green">Được lưu trữ an toàn trong DB</div>
                  </div>

                  <div className="stat-card-admin">
                    <div className="stat-card-header">
                      <span className="stat-title">API Words Đã Tạo</span>
                      <div className="stat-icon-wrapper api-bg"><Activity size={20} /></div>
                    </div>
                    <div className="stat-value">{stats.totalWords.toLocaleString()}</div>
                    <div className="stat-desc text-muted">Tổng tích lũy từ các tài khoản</div>
                  </div>

                  <div className="stat-card-admin">
                    <div className="stat-card-header">
                      <span className="stat-title">Doanh thu ước tính</span>
                      <div className="stat-icon-wrapper revenue-bg"><DollarSign size={20} /></div>
                    </div>
                    <div className="stat-value">{stats.totalRevenue.toLocaleString()} đ</div>
                    <div className="stat-desc text-green">Từ các hóa đơn thành công</div>
                  </div>

                  <div className="stat-card-admin">
                    <div className="stat-card-header">
                      <span className="stat-title">Chi phí API ước tính</span>
                      <div className="stat-icon-wrapper cost-bg"><Key size={20} /></div>
                    </div>
                    <div className="stat-value">{stats.apiCost.toLocaleString()} đ</div>
                    <div className="stat-desc text-red">Chiếm ~{(stats.totalRevenue > 0 ? ((stats.apiCost / stats.totalRevenue) * 100).toFixed(1) : 0)}% doanh thu</div>
                  </div>
                </div>

                <div className="admin-overview-details">
                  <div className="system-health-panel">
                    <h3>Trạng thái dịch vụ (System Health)</h3>
                    <div className="health-metrics-list">
                      <div className="health-item">
                        <span className="health-label">API Gateway:</span>
                        <span className={`health-status-badge ${health.gateway === 'OK' ? 'success' : 'danger'}`}>
                          {health.gateway === 'OK' ? 'Hoạt động bình thường' : 'Lỗi kết nối'}
                        </span>
                      </div>
                      <div className="health-item">
                        <span className="health-label">Database (MongoDB):</span>
                        <span className={`health-status-badge ${health.database.status === 'OK' ? 'success' : 'danger'}`}>
                          {health.database.status === 'OK' ? `Kết nối tốt (Ping: ${health.database.ping})` : 'Mất kết nối!'}
                        </span>
                      </div>
                      <div className="health-item">
                        <span className="health-label">Gemini AI Model:</span>
                        <span className={`health-status-badge ${health.gemini.status === 'OK' ? 'success' : 'danger'}`}>
                          {health.gemini.status === 'OK' ? 'Sẵn sàng (API Key hợp lệ)' : 'Chưa cấu hình API Key!'}
                        </span>
                      </div>
                      <div className="health-item">
                        <span className="health-label">Cổng gửi Mail:</span>
                        <span className={`health-status-badge ${health.email.status === 'OK' ? 'success' : 'warning'}`}>
                          {health.email.status === 'OK' ? 'Sẵn sàng' : 'Chưa thiết lập SMTP'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="recent-system-alerts">
                    <h3>Hoạt động & Nhật ký mới nhất</h3>
                    <div className="alerts-history-list">
                      {systemLogs.slice(0, 4).map((log, index) => (
                        <div className={`alert-history-item ${log.type.toLowerCase()}`} key={log._id || index}>
                          <Info size={16} />
                          <span>[{new Date(log.createdAt).toLocaleTimeString()}] {log.message}</span>
                        </div>
                      ))}
                      {systemLogs.length === 0 && (
                        <div className="alert-history-item info">
                          <span>Chưa có nhật ký hoạt động nào ghi nhận.</span>
                        </div>
                      )}
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
                        <th>Họ và Tên</th>
                        <th>Email</th>
                        <th>Vai trò (Role)</th>
                        <th>API Words Đã Dùng</th>
                        <th>Trạng thái</th>
                        <th>Ngày tham gia</th>
                        <th style={{ textAlign: 'right' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.length > 0 ? (
                        usersList.map(user => (
                          <tr key={user._id}>
                            <td><strong>{user.name}</strong></td>
                            <td>{user.email}</td>
                            <td>
                              <span className={`role-badge-static ${user.role.toLowerCase()}`}>
                                {user.role}
                              </span>
                            </td>
                            <td>{(user.monthlyUsage?.wordsUsed || 0).toLocaleString()} từ</td>
                            <td>
                              <span className={`status-badge-admin ${user.isOnline ? 'online' : 'offline'}`}>
                                {user.isOnline ? 'online' : 'offline'}
                              </span>
                            </td>
                            <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                            <td style={{ textAlign: 'right' }}>
                              <div className="admin-actions-cell">
                                <button 
                                  className="action-btn-mini edit-btn"
                                  onClick={() => handleResetPassword(user._id, user.email)}
                                  title="Cấp mật khẩu tạm thời"
                                >
                                  Cấp mật khẩu
                                </button>
                                <button 
                                  className={`action-btn-mini ${user.status === 'Active' ? 'ban-btn' : 'unban-btn'}`}
                                  onClick={() => toggleUserStatus(user._id)}
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
                          <td colSpan="7" className="no-data-cell">Không tìm thấy người dùng phù hợp.</td>
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
                  <button 
                    className="primary-btn-admin"
                    onClick={() => setEditingPlan({
                      name: '',
                      slug: '',
                      priceMonthly: 0,
                      priceDisplay: '',
                      wordLimit: 0,
                      wordLimitDisplay: '',
                      imageLimit: 0,
                      imageLimitDisplay: '',
                      features: [],
                      isNew: true
                    })}
                  >
                    <Plus size={16} /> Thêm Gói Mới
                  </button>
                </div>

                <div className="plans-grid">
                  {billingPlans.map(plan => (
                    <div className="plan-admin-card" key={plan._id}>
                      <div className="plan-header-admin">
                        <h4>{plan.name}</h4>
                        <span className="plan-badge-users">{plan.usersCount} users</span>
                      </div>
                      <div className="plan-price-large">{plan.priceDisplay}</div>
                      
                      <div className="plan-limits-list">
                        <div className="limit-item">
                          <strong>Hạn mức từ:</strong> {plan.wordLimitDisplay}
                        </div>
                        <div className="limit-item">
                          <strong>Tạo ảnh AI:</strong> {plan.imageLimitDisplay}
                        </div>
                      </div>
                      
                      <div className="plan-actions-admin">
                        <button className="plan-btn edit" onClick={() => setEditingPlan({ ...plan })}>Cấu hình gói</button>
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
                        {transactions.length > 0 ? (
                          transactions.map(tx => (
                            <tr key={tx._id}>
                              <td className="code-font">{tx.transactionCode}</td>
                              <td>{tx.user?.name || tx.user?.email || 'N/A'} ({tx.user?.email || 'Chưa rõ email'})</td>
                              <td>{tx.planName}</td>
                              <td>{tx.amount.toLocaleString()} đ</td>
                              <td>{tx.paymentMethod}</td>
                              <td>{new Date(tx.createdAt).toLocaleString('vi-VN')}</td>
                              <td>
                                <span className={`status-badge-admin ${tx.status === 'success' ? 'active' : 'pending'}`}>
                                  {tx.status === 'success' ? 'Thành công' : tx.status === 'pending' ? 'Chờ thanh toán' : 'Thất bại'}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="no-data-cell">Chưa có giao dịch thanh toán nào được thực hiện.</td>
                          </tr>
                        )}
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
                          placeholder="Nhập Google Gemini API key..."
                          value={systemKeys.geminiKey}
                          onChange={(e) => setSystemKeys({ ...systemKeys, geminiKey: e.target.value })}
                        />
                        <button className="secondary-btn-admin" onClick={() => handleSaveSettings('gemini')}>Lưu Key</button>
                      </div>
                      <span className="input-help-text">Dùng để kích hoạt Gemini 2.5-flash thực hiện sinh nội dung.</span>
                    </div>

                    <div className="admin-form-group">
                      <label>OpenAI DALL-E/GPT API Key (Dự phòng)</label>
                      <div className="input-button-row">
                        <input 
                          type="password" 
                          placeholder="Nhập OpenAI API key..."
                          value={systemKeys.openaiKey}
                          onChange={(e) => setSystemKeys({ ...systemKeys, openaiKey: e.target.value })}
                        />
                        <button className="secondary-btn-admin" onClick={() => handleSaveSettings('openai')}>Lưu Key</button>
                      </div>
                      <span className="input-help-text">Dùng để dự phòng mô hình tạo nội dung và tạo hình ảnh AI nâng cao.</span>
                    </div>
                  </div>
                </div>

                <div className="settings-section-block" style={{ marginTop: '30px' }}>
                  <h3>Cấu hình Prompts hệ thống chính</h3>
                  <div className="admin-form-group">
                    <label>System instructions Prompt (SEO Engine)</label>
                    <textarea 
                      rows={6}
                      value={systemKeys.langchainPrompt}
                      onChange={(e) => setSystemKeys({ ...systemKeys, langchainPrompt: e.target.value })}
                      style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '13px', lineHeight: '1.6', outline: 'none', fontFamily: 'inherit' }}
                    />
                    <button className="primary-btn-admin" style={{ marginTop: '10px', width: 'max-content' }} onClick={() => handleSaveSettings('prompt')}>
                      Lưu Cấu Hình Prompt
                    </button>
                  </div>
                </div>

                {/* LIVE SYSTEM LOGS TERMINAL */}
                <div className="logs-terminal-block" style={{ marginTop: '30px' }}>
                  <div className="terminal-header">
                    <div className="terminal-buttons">
                      <span className="dot red" onClick={clearLogs} title="Xóa logs DB" style={{ cursor: 'pointer' }}></span>
                      <span className="dot yellow"></span>
                      <span className="dot green"></span>
                    </div>
                    <div className="terminal-title">
                      <Terminal size={14} /> Live System Logs (Real-time DB Logs monitoring)
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="refresh-logs-btn" onClick={refreshLogs}>
                        <RefreshCw size={12} /> Làm mới
                      </button>
                      <button className="refresh-logs-btn" style={{ borderColor: '#ef4444', color: '#f87171' }} onClick={clearLogs}>
                        <Trash2 size={12} /> Xóa Logs
                      </button>
                    </div>
                  </div>
                  <div className="terminal-body">
                    {systemLogs.map((log, index) => (
                      <div className="terminal-line" key={log._id || index}>
                        <span className="log-time">[{new Date(log.createdAt).toLocaleString()}]</span>
                        <span className={`log-type ${log.type.toLowerCase()}`}>[{log.type}]</span>
                        <span className="log-msg">{log.message}</span>
                      </div>
                    ))}
                    {systemLogs.length === 0 && (
                      <div className="terminal-line" style={{ color: '#64748b', fontStyle: 'italic' }}>
                        Không có log hệ thống nào.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;
