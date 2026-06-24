import { useState, useEffect } from 'react';
import api from '../services/api';
import { Zap, Copy, FileText, Calendar, User, Check, AlertCircle } from 'lucide-react';
import { downloadAsWord } from '../utils/exporters';

const ShareView = ({ articleId }) => {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(() => !!articleId);
  const [error, setError] = useState(() => !articleId ? 'Đường dẫn bài viết không hợp lệ.' : null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!articleId) return;

    let cancelled = false;
    const fetchPublicArticle = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/articles/public/${articleId}`);
        if (cancelled) return;
        if (response.data && response.data.success) {
          setArticle(response.data.data);
        } else {
          setError('Không thể tải bài viết này.');
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Lỗi tải bài viết chia sẻ:', err);
        setError(err.response?.data?.message || 'Bài viết không tồn tại hoặc đã bị tắt chế độ chia sẻ công khai.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPublicArticle();
    return () => { cancelled = true; };
  }, [articleId]);

  const handleCopyContent = () => {
    if (!article) return;
    
    // Tạo phần tử tạm thời để lấy văn bản thuần túy
    const tempElement = document.createElement('div');
    tempElement.innerHTML = article.content;
    const textToCopy = tempElement.innerText || tempElement.textContent || '';
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadWord = () => {
    if (!article) return;
    downloadAsWord(article.title, article.content);
  };

  if (loading) {
    return (
      <div className="share-view-loading" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'system-ui, sans-serif',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <div className="spinner" style={{
          width: '40px',
          height: '40px',
          border: '4px solid #cbd5e1',
          borderTop: '4px solid var(--primary, #2563eb)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Đang tải bài viết...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="share-view-error" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'system-ui, sans-serif',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        padding: '20px',
        textAlign: 'center'
      }}>
        <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '16px' }} />
        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
          Không thể truy cập bài viết
        </h3>
        <p style={{ color: '#64748b', maxWidth: '400px', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
          {error}
        </p>
        <a href="/" style={{
          padding: '10px 20px',
          backgroundColor: '#2563eb',
          color: '#ffffff',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: '600',
          fontSize: '14px',
          boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
        }}>
          Đi tới OptiContent
        </a>
      </div>
    );
  }

  return (
    <div className="share-page-wrapper" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      fontFamily: 'system-ui, sans-serif',
      color: '#1e293b',
      paddingBottom: '60px'
    }}>
      {/* Header Bar */}
      <header className="share-header" style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '12px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
      }}>
        <div className="share-header-content" style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div className="logo-section" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={20} style={{ color: '#2563eb' }} />
            <span style={{ fontWeight: '800', fontSize: '18px', color: '#0f172a' }}>OptiContent</span>
            <span style={{ 
              fontSize: '11px', 
              fontWeight: '600', 
              backgroundColor: '#eff6ff', 
              color: '#2563eb', 
              padding: '2px 8px', 
              borderRadius: '9999px',
              border: '1px solid #bfdbfe'
            }}>Reader</span>
          </div>

          <div className="action-buttons" style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={handleCopyContent}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {copied ? <Check size={14} style={{ color: '#16a34a' }} /> : <Copy size={14} />}
              {copied ? 'Đã sao chép' : 'Sao chép văn bản'}
            </button>

            <button 
              onClick={handleDownloadWord}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
              }}
            >
              <FileText size={14} />
              Tải file Word (.doc)
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="share-main-container" style={{
        maxWidth: '800px',
        margin: '40px auto 0 auto',
        padding: '0 20px'
      }}>
        <article style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '40px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
        }}>
          {/* Platform Tag */}
          <div style={{ marginBottom: '16px' }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#2563eb',
              backgroundColor: '#eff6ff',
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid #dbeafe'
            }}>
              {article.platform || 'Blog Post'}
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: '32px',
            fontWeight: '800',
            lineHeight: '1.25',
            color: '#0f172a',
            marginBottom: '20px'
          }}>
            {article.title}
          </h1>

          {/* Metadata Block */}
          <div className="article-meta" style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            paddingBottom: '24px',
            borderBottom: '1px solid #f1f5f9',
            marginBottom: '32px',
            color: '#64748b',
            fontSize: '13px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={14} />
              <span>Người viết: <strong>{article.user?.name || 'Thành viên OptiContent'}</strong></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} />
              <span>{new Date(article.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} />
              <span>{article.stats?.wordCount || 0} từ / {article.stats?.characterCount || 0} ký tự</span>
            </div>
          </div>

          {/* Rich Content Area */}
          <div 
            className="ql-editor" 
            style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#334155',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              padding: 0
            }}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>
      </main>
    </div>
  );
};

export default ShareView;
