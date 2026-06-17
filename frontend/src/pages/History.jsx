import React, { useState } from 'react';
import { Search, Edit, Trash2, Calendar, FileText, Share2, Mail, MessageSquare } from 'lucide-react';

const History = ({ historyList = [], onDeleteArticle, onEditArticle, setActiveScreen }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // Lọc bài viết theo ô tìm kiếm và nền tảng
  const filteredArticles = historyList.filter(article => {
    const matchesSearch = article.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.content?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === 'All' || article.platform === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'blog': return <FileText size={14} />;
      case 'facebook': return <Share2 size={14} />;
      case 'email': return <Mail size={14} />;
      default: return <FileText size={14} />;
    }
  };

  const handleEditClick = (article) => {
    onEditArticle(article);
    setActiveScreen('workspace');
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
      {filteredArticles.length === 0 ? (
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
          {filteredArticles.map((article) => {
            // Lấy 100 ký tự đầu làm preview snippet
            const snippet = article.content?.replace(/[#*]/g, '').trim().substring(0, 120) + '...';
            
            return (
              <div key={article.id} className="history-card">
                <div>
                  <div className="card-header">
                    <span className={`activity-tag ${article.platform?.toLowerCase() || 'blog'}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {getPlatformIcon(article.platform)}
                      <span>{article.platform || 'Blog'}</span>
                    </span>
                    <button 
                      className="card-delete-btn" 
                      onClick={() => onDeleteArticle(article.id)}
                      title="Xóa bài viết"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <h4 className="card-title">{article.title}</h4>
                  <p className="card-snippet">{snippet}</p>
                </div>

                <div className="card-footer">
                  <div className="card-meta">
                    <Calendar size={12} style={{ color: 'var(--text-muted)' }} />
                    <span className="card-date">
                      {new Date(article.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  
                  <button 
                    className="btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                    onClick={() => handleEditClick(article)}
                  >
                    <Edit size={12} />
                    Chỉnh sửa
                  </button>
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
