import { useState } from 'react';
import { 
  Search, 
  Edit, 
  Trash2, 
  Calendar, 
  FileText, 
  Share2, 
  Mail, 
  MessageSquare, 
  Globe, 
  Link, 
  Check, 
  FileCode 
} from 'lucide-react';
import { downloadAsWord, downloadAsMarkdown, downloadAsHtml } from '../utils/exporters';

// Static mock articles — defined once at module load to avoid impure Date.now() during render
const MOCK_ARTICLES = [
  {
    id: 'mock-blog-1',
    title: 'Tối ưu hóa SEO cho bài viết Blog năm 2026',
    content: 'Dưới đây là cẩm nang chi tiết về tối ưu hóa SEO cho bài viết Blog. Chúng tôi sẽ hướng dẫn bạn cách viết bài chuẩn SEO, tối ưu tiêu đề, mô tả và mật độ từ khóa giúp website của bạn tăng hạng vượt trội trên Google Tìm kiếm mà không tốn chi phí quảng cáo...',
    platform: 'Blog',
    isShared: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'mock-email-1',
    title: 'Chiến dịch Email Marketing ra mắt sản phẩm mới',
    content: 'Chào bạn, chúng tôi vô cùng phấn khởi được giới thiệu dòng sản phẩm OptiContent đột phá. Đây là công cụ đắc lực giúp tự động hóa quy trình sáng tạo nội dung của doanh nghiệp, giúp tăng tỷ lệ chuyển đổi khách hàng tiềm năng lên đến 200%...',
    platform: 'Email',
    isShared: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const History = ({ historyList = [], onDeleteArticle, onEditArticle, onToggleShare, setActiveScreen }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [copiedId, setCopiedId] = useState('');
  
  // Quản lý trạng thái bài viết mô phỏng
  const [deletedMockIds, setDeletedMockIds] = useState([]);
  const [toggledMockIds, setToggledMockIds] = useState({});

  const mockArticles = MOCK_ARTICLES;

  // Lọc bài viết thực tế
  const filteredArticles = historyList.filter(article => {
    const matchesSearch = article.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || article.platform === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Lọc bài viết mô phỏng
  const filteredMockArticles = mockArticles.filter(article => {
    const matchesSearch = article.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || article.platform === activeFilter;
    const notDeleted = !deletedMockIds.includes(article.id);
    return matchesSearch && matchesFilter && notDeleted;
  });

  // Kết hợp bài viết thực tế và bài viết mô phỏng có tương tác
  const displayedArticles = [
    ...filteredArticles,
    ...filteredMockArticles.map(art => ({
      ...art,
      isShared: toggledMockIds[art.id] !== undefined ? toggledMockIds[art.id] : art.isShared
    }))
  ];

  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'blog': return <FileText size={14} />;
      case 'facebook': return <Share2 size={14} />;
      case 'email': return <Mail size={14} />;
      default: return <FileText size={14} />;
    }
  };

  const handleEditClick = (article) => {
    if (article.id.startsWith('mock-')) {
      // Edit mock articles as a new article copy in the workspace editor
      onEditArticle({
        ...article,
        id: ''
      });
    } else {
      onEditArticle(article);
    }
    setActiveScreen('workspace');
  };

  const handleDelete = (id) => {
    if (id.startsWith('mock-')) {
      setDeletedMockIds(prev => [...prev, id]);
    } else {
      onDeleteArticle(id);
    }
  };

  const handleToggleShareClick = (id) => {
    if (id.startsWith('mock-')) {
      setToggledMockIds(prev => ({
        ...prev,
        [id]: prev[id] !== undefined ? !prev[id] : !mockArticles.find(a => a.id === id).isShared
      }));
    } else {
      onToggleShare(id);
    }
  };

  const handleCopyLink = (e, id) => {
    e.stopPropagation();
    const shareLink = `${window.location.origin}/share/${id}`;
    navigator.clipboard.writeText(shareLink);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  return (
    <div className="fade-in">
      {/* Search and Filters Row */}
      <div className="search-filter-row">
        <div className="search-box">
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Tìm kiếm bài viết, chủ đề..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filters">
          {['All', 'Blog', 'Facebook', 'Email'].map((filter) => (
            <button
              key={filter}
              className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter === 'All' ? 'Tất cả' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      {displayedArticles.length === 0 ? (
        <div className="editor-empty" style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '60px' }}>
          <MessageSquare size={48} style={{ color: 'var(--text-muted)' }} />
          <h3>Không tìm thấy bài viết nào</h3>
          <p>
            {searchQuery || activeFilter !== 'All' 
              ? 'Không có kết quả khớp với tìm kiếm hoặc bộ lọc hiện tại của bạn. Thử đổi từ khóa khác.'
              : 'Thư viện bài viết của bạn đang trống. Hãy vào Workspace để sinh nội dung mới.'}
          </p>
        </div>
      ) : (
        <div className="history-grid">
          {displayedArticles.map((article) => {
            // Loại bỏ thẻ HTML và ký tự Markdown để lấy preview snippet sạch sẽ
            const cleanContent = article.content?.replace(/<[^>]*>/g, '').replace(/[#*]/g, '').trim() || '';
            const snippet = cleanContent.substring(0, 120) + (cleanContent.length > 120 ? '...' : '');
            
            return (
              <div key={article.id} className="history-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div className="card-header">
                    <span className={`activity-tag ${article.platform?.toLowerCase() || 'blog'}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {getPlatformIcon(article.platform)}
                      <span>{article.platform || 'Blog'}</span>
                    </span>
                    <button 
                      className="card-delete-btn" 
                      onClick={() => handleDelete(article.id)}
                      title="Xóa bài viết"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <h4 className="card-title">{article.title}</h4>
                  <p className="card-snippet">{snippet}</p>
                </div>

                <div>
                  {/* Thanh chia sẻ công khai */}
                  <div className="card-share-bar" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    margin: '18px 0',
                    fontSize: '13px'
                  }}>
                    <div 
                      onClick={() => handleToggleShareClick(article.id)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        cursor: 'pointer',
                        fontWeight: '600',
                        color: article.isShared ? '#16a34a' : '#64748b'
                      }}
                      title="Bấm để bật/tắt chia sẻ công khai"
                    >
                      <Globe size={14} />
                      <span>{article.isShared ? 'Đang chia sẻ' : 'Chưa chia sẻ'}</span>
                    </div>

                    {article.isShared && (
                      <button
                        onClick={(e) => handleCopyLink(e, article.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent, #4f46e5)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: '600',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          transition: 'background 0.2s'
                        }}
                      >
                        {copiedId === article.id ? <Check size={12} style={{ color: '#16a34a' }} /> : <Link size={12} />}
                        <span>{copiedId === article.id ? 'Đã copy' : 'Lấy link'}</span>
                      </button>
                    )}
                  </div>

                  <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="card-meta">
                      <Calendar size={12} style={{ color: 'var(--text-muted)' }} />
                      <span className="card-date">
                        {new Date(article.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {/* Nút tải nhanh */}
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          onClick={() => downloadAsWord(article.title, article.content)}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#2563eb',
                            transition: 'all 0.2s'
                          }}
                          title="Tải Word (.doc)"
                        >
                          <FileText size={13} />
                        </button>
                        <button 
                          onClick={() => downloadAsMarkdown(article.title, article.content)}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#475569',
                            transition: 'all 0.2s'
                          }}
                          title="Tải Markdown (.md)"
                        >
                          <FileCode size={13} />
                        </button>
                        <button 
                          onClick={() => downloadAsHtml(article.title, article.content)}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#10b981',
                            transition: 'all 0.2s'
                          }}
                          title="Tải HTML (.html)"
                        >
                          <Globe size={13} />
                        </button>
                      </div>

                      <button 
                        className="btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => handleEditClick(article)}
                      >
                        <Edit size={12} />
                        Sửa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;
