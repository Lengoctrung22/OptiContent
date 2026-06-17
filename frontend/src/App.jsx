import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PenTool, 
  Database, 
  Settings as SettingsIcon, 
  User, 
  Zap,
  BookOpen,
  LogOut,
  ShieldAlert
} from 'lucide-react';

import Dashboard from './pages/Dashboard.jsx';
import Workspace from './pages/Workspace.jsx';
import History from './pages/History.jsx';
import Settings from './pages/Settings.jsx';
import Auth from './pages/Auth.jsx';
import Admin from './pages/Admin.jsx';

// Dữ liệu giả lập ban đầu để hiển thị đẹp mắt
const mockInitialArticles = [
  {
    id: 'mock-1',
    title: 'Top 5 Lợi Ích Của AI Trong Sáng Tạo Nội Dung Số',
    content: `# Top 5 Lợi Ích Của AI Trong Sáng Tạo Nội Dung Số\n\nTrí tuệ nhân tạo (AI) đang định hình lại cách chúng ta sáng tạo nội dung hàng ngày. Dưới đây là 5 lợi ích vượt trội:\n\n1. **Tốc độ vượt trội**: Tiết kiệm 80% thời gian nghiên cứu và lập dàn ý.\n2. **Tối ưu hóa SEO**: Tự động phân bổ từ khóa và phân tích thẻ meta để nâng hạng tìm kiếm Google.\n3. **Cải thiện văn phong**: Giọng điệu đa dạng, phù hợp cho cả blog chuyên sâu hay bài đăng mạng xã hội năng động.\n4. **Giải quyết bí ý tưởng**: Tạo hàng chục dàn ý bài viết chỉ với vài từ khóa chủ đề.\n5. **Tiết kiệm chi phí**: Tối ưu hóa hiệu suất làm việc của nhóm biên tập nội dung.`,
    platform: 'Blog',
    tone: 'Professional',
    keywords: 'AI sáng tạo nội dung, tối ưu SEO, viết bài tự động',
    hasImage: true,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString() // 1 ngày trước
  },
  {
    id: 'mock-2',
    title: 'Bí quyết thu hút triệu lượt xem trên Facebook năm 2026',
    content: `Cách viết bài viết mạng xã hội (Facebook/Instagram) lôi cuốn và giữ chân người đọc trong 3 giây đầu tiên:\n\n🔥 **1. TIÊU ĐỀ NỔI BẬT**: Sử dụng các từ ngữ kích thích tò mò hoặc số liệu gây sốc.\n\n📌 **2. ĐỘ DÀI VỪA PHẢI**: Viết ngắn gọn, tập trung và chia nhỏ thành các đoạn bằng emoji để dễ quét mắt.\n\n👉 **3. CALL TO ACTION (CTA) MẠNH MẼ**: Kêu gọi thả tim, bình luận góc nhìn của bản thân hoặc chia sẻ bài viết để lưu lại.\n\n#marketing #facebooktips #contentcreators`,
    platform: 'Facebook',
    tone: 'Casual',
    keywords: 'bài viết facebook, triệu view, viết content',
    hasImage: false,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString() // 3 giờ trước
  }
];

function App() {
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [workspaceDefaults, setWorkspaceDefaults] = useState(null);
  const [activeArticle, setActiveArticle] = useState(null);
  
  // Trạng thái đăng nhập
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('opticontent_auth') === 'true';
  });

  // Quản lý trạng thái hồ sơ người dùng (avatar và tên hiển thị)
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('opticontent_profile');
    return saved ? JSON.parse(saved) : { name: 'Nguyễn Văn Trọng', email: 'trongnv@gmail.com', avatar: '' };
  });

  // Quản lý danh sách bài viết từ localStorage
  const [historyList, setHistoryList] = useState([]);

  // Tải dữ liệu ban đầu
  useEffect(() => {
    const saved = localStorage.getItem('opticontent_articles');
    if (saved) {
      setHistoryList(JSON.parse(saved));
    } else {
      localStorage.setItem('opticontent_articles', JSON.stringify(mockInitialArticles));
      setHistoryList(mockInitialArticles);
    }
  }, []);

  // Lưu cấu hình hồ sơ khi thay đổi
  useEffect(() => {
    localStorage.setItem('opticontent_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Xử lý đăng nhập thành công
  const handleLogin = (user) => {
    setUserProfile(user);
    setIsAuthenticated(true);
    localStorage.setItem('opticontent_auth', 'true');
    localStorage.setItem('opticontent_profile', JSON.stringify(user));
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?')) {
      setIsAuthenticated(false);
      localStorage.removeItem('opticontent_auth');
      localStorage.removeItem('opticontent_profile');
      localStorage.removeItem('token');
    }
  };

  // Hàm Lưu bài viết
  const handleSaveArticle = (newArticle) => {
    let updatedList = [];
    const exists = historyList.some(item => item.id === newArticle.id);
    
    if (exists) {
      updatedList = historyList.map(item => item.id === newArticle.id ? newArticle : item);
    } else {
      updatedList = [newArticle, ...historyList];
    }
    
    setHistoryList(updatedList);
    localStorage.setItem('opticontent_articles', JSON.stringify(updatedList));
  };

  // Hàm Xóa bài viết
  const handleDeleteArticle = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này khỏi thư viện?')) {
      const updatedList = historyList.filter(item => item.id !== id);
      setHistoryList(updatedList);
      localStorage.setItem('opticontent_articles', JSON.stringify(updatedList));
    }
  };

  // Hàm chọn bài viết để sửa ngược lại trong Workspace
  const handleEditArticle = (article) => {
    setActiveArticle(article);
    setWorkspaceDefaults(null);
  };

  const clearActiveArticle = () => {
    setActiveArticle(null);
  };

  const getScreenTitle = () => {
    switch (activeScreen) {
      case 'dashboard': return 'Bảng điều khiển';
      case 'workspace': return 'Phòng làm việc (Editor)';
      case 'history': return 'Thư viện bài viết';
      case 'settings': return 'Cài đặt';
      case 'admin': return 'Quản trị hệ thống';
      default: return 'OptiContent';
    }
  };

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
                setActiveArticle(null);
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
          <div className="header-actions">
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
            />
          )}

          {activeScreen === 'history' && (
            <History 
              historyList={historyList}
              onDeleteArticle={handleDeleteArticle}
              onEditArticle={handleEditArticle}
              setActiveScreen={setActiveScreen}
            />
          )}

          {activeScreen === 'settings' && (
            <Settings 
              userProfile={userProfile}
              setUserProfile={setUserProfile}
            />
          )}

          {activeScreen === 'admin' && (
            <Admin />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
