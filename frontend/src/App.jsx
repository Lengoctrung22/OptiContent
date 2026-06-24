import { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  PenTool, 
  Settings as SettingsIcon, 
  User, 
  Zap,
  BookOpen,
  LogOut,
  ShieldAlert,
  CreditCard,
  Bot
} from 'lucide-react';

import Dashboard from './pages/Dashboard.jsx';
import Workspace from './pages/Workspace.jsx';
import History from './pages/History.jsx';
import Settings from './pages/Settings.jsx';
import Auth from './pages/Auth.jsx';
import Admin from './pages/Admin.jsx';
import ShareView from './pages/ShareView.jsx';
import Pricing from './pages/Pricing.jsx';
import ChatAI from './pages/ChatAI.jsx';
import api from './services/api.js';


function App() {
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [workspaceDefaults, setWorkspaceDefaults] = useState(null);
  const [activeArticle, setActiveArticle] = useState(null);

  // Bản nháp của Workspace: giữ lại nội dung soạn thảo khi chuyển trang
  const [workspaceDraft, setWorkspaceDraft] = useState({
    topic: '',
    keywords: '',
    platform: 'Blog',
    tone: 'Professional',
    editorContent: '',
    currentArticleId: '',
    isShared: false,
  });
  
  // Trạng thái chia sẻ công khai qua URL
  const [shareId] = useState(() => {
    const path = window.location.pathname;
    if (path.startsWith('/share/')) {
      return path.split('/share/')[1];
    }
    return '';
  });

  // Trạng thái đặt lại mật khẩu (khi user click link từ email)
  const [resetToken] = useState(() => {
    const path = window.location.pathname;
    if (path.startsWith('/reset-password/')) {
      return path.split('/reset-password/')[1];
    }
    return '';
  });

  // Trạng thái đăng nhập
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('opticontent_auth') === 'true';
  });

  // Quản lý trạng thái hồ sơ người dùng (avatar và tên hiển thị)
  const [userProfile, setUserProfile] = useState(() => {
    const saved = sessionStorage.getItem('opticontent_profile');
    return saved ? JSON.parse(saved) : { name: 'Nguyễn Văn Trọng', email: 'trongnv@gmail.com', avatar: '' };
  });

  // Quản lý danh sách bài viết từ Backend
  const [historyList, setHistoryList] = useState([]);

  // Hàm tải lại thông tin hồ sơ người dùng từ server (đầy đủ plan & usage)
  const reloadUserProfile = useCallback(async () => {
    if (!isAuthenticated || shareId) return;
    try {
      const response = await api.get('/users/profile');
      if (response.data && response.data.success) {
        const profileData = response.data.data;
        const updated = {
          id: profileData.id,
          name: profileData.fullName,
          email: profileData.email,
          avatar: profileData.avatar || '',
          role: profileData.role,
          status: profileData.status,
          brandVoice: profileData.brandVoice || '',
          integrations: profileData.integrations || { wordpress: { connected: false }, facebook: { connected: false } },
          currentPlan: profileData.currentPlan || null,
          monthlyUsage: profileData.monthlyUsage || { wordsUsed: 0, imagesUsed: 0 }
        };
        setUserProfile(updated);
        sessionStorage.setItem('opticontent_profile', JSON.stringify(updated));
      }
    } catch (err) {
      console.error('Lỗi khi tải hồ sơ người dùng:', err);
    }
  }, [isAuthenticated, shareId]);

  // Tải dữ liệu từ Backend API
  useEffect(() => {
    const initData = async () => {
      const fetchArticles = async () => {
        if (!isAuthenticated || shareId) return;
        try {
          const response = await api.get('/articles');
          if (response.data && response.data.success) {
            const articles = response.data.data.map(art => ({
              ...art,
              id: art._id
            }));
            setHistoryList(articles);
          }
        } catch (err) {
          console.error('Lỗi khi tải danh sách bài viết từ server:', err);
        }
      };

      await fetchArticles();
      await reloadUserProfile();
    };

    initData();
  }, [isAuthenticated, shareId, reloadUserProfile]);

  // Lưu cấu hình hồ sơ khi thay đổi
  useEffect(() => {
    sessionStorage.setItem('opticontent_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Xử lý đăng nhập thành công
  const handleLogin = (user) => {
    setUserProfile(user);
    setIsAuthenticated(true);
    sessionStorage.setItem('opticontent_auth', 'true');
    sessionStorage.setItem('opticontent_profile', JSON.stringify(user));
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('opticontent_auth');
    sessionStorage.removeItem('opticontent_profile');
    sessionStorage.removeItem('token');
    setWorkspaceDraft({ topic: '', keywords: '', platform: 'Blog', tone: 'Professional', editorContent: '', currentArticleId: '', isShared: false });
  };

  // Hàm Lưu bài viết lên Backend
  const handleSaveArticle = async (newArticle) => {
    try {
      let response;
      const isMongoId = newArticle.id && newArticle.id.length === 24 && /^[0-9a-fA-F]+$/.test(newArticle.id);

      const payload = {
        title: newArticle.title,
        content: newArticle.content,
        platform: newArticle.platform,
        tone: newArticle.tone,
        keywords: newArticle.keywords,
        hasImage: newArticle.hasImage,
        imageUrl: newArticle.imageUrl || '',
        seoMeta: newArticle.seoMeta || { seoTitle: '', metaDescription: '' },
        isShared: newArticle.isShared || false
      };

      if (isMongoId) {
        // Cập nhật bài viết hiện tại
        response = await api.put(`/articles/${newArticle.id}`, payload);
      } else {
        // Tạo bài viết hoàn toàn mới
        response = await api.post('/articles', payload);
      }

      if (response.data && response.data.success) {
        const savedArt = {
          ...response.data.data,
          id: response.data.data._id
        };

        setHistoryList(prev => {
          const exists = prev.some(item => item.id === savedArt.id);
          if (exists) {
            return prev.map(item => item.id === savedArt.id ? savedArt : item);
          } else {
            return [savedArt, ...prev];
          }
        });

        return savedArt;
      }
    } catch (err) {
      console.error('Lỗi khi lưu bài viết lên server:', err);
      alert('Không thể lưu bài viết lên hệ thống. Vui lòng kiểm tra kết nối mạng!');
      throw err;
    }
  };

  // Hàm Xóa bài viết
  const handleDeleteArticle = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này khỏi thư viện?')) {
      try {
        const response = await api.delete(`/articles/${id}`);
        if (response.data && response.data.success) {
          setHistoryList(prev => prev.filter(item => item.id !== id));
        }
      } catch (err) {
        console.error('Lỗi khi xóa bài viết trên server:', err);
        alert('Không thể xóa bài viết. Vui lòng thử lại!');
      }
    }
  };

  // Hàm chuyển đổi trạng thái chia sẻ bài viết từ Thư viện
  const handleToggleShareInList = async (id) => {
    try {
      const response = await api.patch(`/articles/${id}/share`);
      if (response.data && response.data.success) {
        setHistoryList(prev => prev.map(item => item.id === id ? {
          ...item,
          isShared: response.data.data.isShared
        } : item));
      }
    } catch (err) {
      console.error('Lỗi khi thay đổi trạng thái chia sẻ:', err);
      alert('Không thể thay đổi trạng thái chia sẻ bài viết.');
    }
  };

  // Hàm chọn bài viết để sửa ngược lại trong Workspace
  const handleEditArticle = (article) => {
    setActiveArticle(article);
    setWorkspaceDefaults(null);
    // Xóa bản nháp cũ để Workspace hiển thị đúng bài viết đang chỉnh sửa
    setWorkspaceDraft({
      topic: article.title || '',
      keywords: article.keywords || '',
      platform: article.platform || 'Blog',
      tone: article.tone || 'Professional',
      editorContent: '',
      currentArticleId: article.id || '',
      isShared: article.isShared || false,
    });
  };

  const clearActiveArticle = () => {
    setActiveArticle(null);
  };

  const getScreenTitle = () => {
    switch (activeScreen) {
      case 'dashboard': return 'Bảng điều khiển';
      case 'workspace': return 'Phòng làm việc (Editor)';
      case 'history': return 'Thư viện bài viết';
      case 'chatai': return 'Trợ lý AI Chat';
      case 'settings': return 'Cài đặt';
      case 'admin': return 'Quản trị hệ thống';
      case 'pricing': return 'Gói dịch vụ & Thanh toán';
      default: return 'OptiContent';
    }
  };

  // Nếu là liên kết chia sẻ công khai, hiển thị trực tiếp chế độ đọc (Reader Mode)
  if (shareId) {
    return <ShareView articleId={shareId} />;
  }

  // Nếu là liên kết đặt lại mật khẩu, luôn hiển thị form reset password
  if (resetToken) {
    return <Auth onLogin={handleLogin} resetToken={resetToken} />;
  }

  // Nếu chưa đăng nhập, chỉ render màn hình Auth
  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div className="sidebar-logo">
            <Zap size={22} className="logo-icon" />
            <h1>OptiContent</h1>
          </div>
          
          <nav className="sidebar-menu">
            <button 
              className={`menu-item ${activeScreen === 'dashboard' ? 'active' : ''}`}
              onClick={() => {
                setActiveScreen('dashboard');
                setWorkspaceDefaults(null);
                setActiveArticle(null);
              }}
            >
              <LayoutDashboard size={18} />
              Bảng điều khiển
            </button>

            <button 
              className={`menu-item ${activeScreen === 'workspace' ? 'active' : ''}`}
              onClick={() => {
                setActiveScreen('workspace');
                setWorkspaceDefaults(null);
                // Không xóa activeArticle ở đây để giữ lại bản nháp đang soạn
              }}
            >
              <PenTool size={18} />
              Phòng soạn thảo
            </button>

            <button 
              className={`menu-item ${activeScreen === 'history' ? 'active' : ''}`}
              onClick={() => {
                setActiveScreen('history');
                setWorkspaceDefaults(null);
                setActiveArticle(null);
              }}
            >
              <BookOpen size={18} />
              Thư viện bài viết
            </button>

            <button 
              className={`menu-item ${activeScreen === 'chatai' ? 'active' : ''}`}
              onClick={() => {
                setActiveScreen('chatai');
                setWorkspaceDefaults(null);
                setActiveArticle(null);
              }}
            >
              <Bot size={18} />
              Trợ lý AI Chat
            </button>

            {(userProfile.role === 'Admin' || userProfile.email === 'admin@opticontent.com' || userProfile.email === 'trongnv@gmail.com') && (
              <button 
                className={`menu-item ${activeScreen === 'admin' ? 'active' : ''}`}
                style={{ fontWeight: '600' }}
                onClick={() => {
                  setActiveScreen('admin');
                  setWorkspaceDefaults(null);
                  setActiveArticle(null);
                }}
              >
                <ShieldAlert size={18} />
                Quản trị hệ thống
              </button>
            )}

            <button 
              className={`menu-item ${activeScreen === 'pricing' ? 'active' : ''}`}
              onClick={() => {
                setActiveScreen('pricing');
                setWorkspaceDefaults(null);
                setActiveArticle(null);
              }}
            >
              <CreditCard size={18} style={{ color: '#fbbf24' }} />
              Nâng cấp gói cước
            </button>

            <button 
              className={`menu-item ${activeScreen === 'settings' ? 'active' : ''}`}
              onClick={() => {
                setActiveScreen('settings');
                setWorkspaceDefaults(null);
                setActiveArticle(null);
              }}
            >
              <SettingsIcon size={18} />
              Cài đặt
            </button>
          </nav>
        </div>

        <div>
          <button 
            className="menu-item"
            style={{ 
              width: '100%', 
              textAlign: 'left', 
              color: '#ef4444', 
              border: 'none', 
              background: 'none',
              marginTop: '20px',
              cursor: 'pointer'
            }}
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
          
          <div className="sidebar-footer" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginTop: '12px' }}>
            <p>OptiContent v1.0.0</p>
            <p>© 2026 AI Engine Powered</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="content-area">
        {/* Header */}
        <header className="main-header">
          <h2>{getScreenTitle()}</h2>
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className="premium-upgrade-badge"
              style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                color: '#0f172a',
                border: 'none',
                borderRadius: '20px',
                padding: '6px 14px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)',
                transition: 'transform 0.2s ease'
              }}
              onClick={() => setActiveScreen('pricing')}
            >
              <Zap size={10} fill="#0f172a" />
              {userProfile.currentPlan?.name || 'Gói Miễn Phí'}
            </button>

            <div className="user-badge" style={{ gap: '10px', padding: '4px 12px 4px 6px' }}>
              {userProfile.avatar ? (
                <img 
                  src={userProfile.avatar} 
                  alt="User avatar" 
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={14} style={{ color: 'var(--primary)' }} />
                </div>
              )}
              <span style={{ fontWeight: '600' }}>{userProfile.name}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Screen Page */}
        <div className="screen-wrapper">
          {activeScreen === 'dashboard' && (
            <Dashboard 
              setActiveScreen={setActiveScreen}
              setWorkspaceDefaults={setWorkspaceDefaults}
              historyList={historyList}
            />
          )}

          {activeScreen === 'workspace' && (
            <Workspace 
              onSaveArticle={handleSaveArticle}
              defaultValues={workspaceDefaults}
              activeArticle={activeArticle}
              clearActiveArticle={clearActiveArticle}
              workspaceDraft={workspaceDraft}
              setWorkspaceDraft={setWorkspaceDraft}
            />
          )}

          {activeScreen === 'history' && (
            <History 
              historyList={historyList}
              onDeleteArticle={handleDeleteArticle}
              onEditArticle={handleEditArticle}
              onToggleShare={handleToggleShareInList}
              setActiveScreen={setActiveScreen}
            />
          )}

          {activeScreen === 'settings' && (
            <Settings 
              userProfile={userProfile}
              setUserProfile={setUserProfile}
            />
          )}

          {activeScreen === 'pricing' && (
            <Pricing 
              userProfile={userProfile}
              reloadUserProfile={reloadUserProfile}
            />
          )}

          {activeScreen === 'admin' && (
            <Admin />
          )}

          {activeScreen === 'chatai' && (
            <ChatAI />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
