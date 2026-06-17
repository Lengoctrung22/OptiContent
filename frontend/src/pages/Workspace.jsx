import React, { useState, useRef, useEffect } from 'react';
import { generateContent } from '../services/ai.service.js';
import { 
  Sparkles, 
  Copy, 
  Save, 
  Globe, 
  FileText, 
  Check, 
  Loader2, 
  MessageSquare,
  Wand2
} from 'lucide-react';

const Workspace = ({ onSaveArticle, defaultValues = null, activeArticle = null, clearActiveArticle }) => {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [platform, setPlatform] = useState('Blog');
  const [tone, setTone] = useState('Professional');
  
  // Toggles
  const [needOutline, setNeedOutline] = useState(false);
  const [needSEO, setNeedSEO] = useState(false);
  const [needImage, setNeedImage] = useState(false);
  
  // Editor state
  const [editorContent, setEditorContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(''); // 'saved', 'saving', ''
  const [copied, setCopied] = useState(false);
  
  // Text Selection floating menu
  const [selectedText, setSelectedText] = useState('');
  const [menuCoords, setMenuCoords] = useState({ x: 0, y: 0 });
  const textareaRef = useRef(null);

  // Apply default values from dashboard quick link
  useEffect(() => {
    if (defaultValues) {
      if (defaultValues.platform) setPlatform(defaultValues.platform);
    }
  }, [defaultValues]);

  // Load article if editing from Library
  useEffect(() => {
    if (activeArticle) {
      setTopic(activeArticle.title || '');
      setKeywords(activeArticle.keywords || '');
      setPlatform(activeArticle.platform || 'Blog');
      setTone(activeArticle.tone || 'Professional');
      setEditorContent(activeArticle.content || '');
    }
  }, [activeArticle]);

  // Clean active article on unmount
  useEffect(() => {
    return () => {
      if (clearActiveArticle) clearActiveArticle();
    };
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    setSaveStatus('');
    
    // Construct rich prompt
    let prompt = `Hãy viết một bài viết cho nền tảng ${platform} về chủ đề: "${topic}".\n`;
    if (keywords.trim()) {
      prompt += `Yêu cầu chèn các từ khóa sau một cách tự nhiên: ${keywords}.\n`;
    }
    prompt += `Giọng văn (Tone of voice) yêu cầu: ${tone}.\n`;
    
    if (needOutline) {
      prompt += `Yêu cầu bổ sung thêm phần Dàn ý bài viết chi tiết ở phần đầu.\n`;
    }
    if (needSEO) {
      prompt += `Yêu cầu viết thêm thẻ tiêu đề SEO Title (dưới 60 ký tự) và thẻ Meta Description (dưới 160 ký tự) ở cuối bài.\n`;
    }
    if (needImage) {
      prompt += `Yêu cầu mô tả chi tiết 1 prompt gợi ý để vẽ ảnh minh họa phù hợp cho bài viết này (sử dụng DALL-E/Midjourney).\n`;
    }

    try {
      const response = await generateContent(prompt);
      if (response.success && response.data) {
        setEditorContent(response.data);
      } else {
        alert('Không nhận được dữ liệu từ AI. Vui lòng thử lại!');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Có lỗi xảy ra khi kết nối với máy chủ AI. Hãy kiểm tra khóa API của bạn.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Coppy to clipboard
  const handleCopy = async () => {
    if (!editorContent) return;
    try {
      await navigator.clipboard.writeText(editorContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Save to Library
  const handleSave = () => {
    if (!editorContent.trim()) return;
    setIsSaving(true);
    setSaveStatus('saving');

    // Mẹo nhỏ: lấy dòng đầu tiên làm tiêu đề nếu không có chủ đề
    const articleTitle = topic.trim() || editorContent.split('\n')[0].replace(/[#*]/g, '').trim().substring(0, 50) || 'Bài viết mới';
    
    setTimeout(() => {
      onSaveArticle({
        id: activeArticle?.id || Date.now().toString(),
        title: articleTitle,
        content: editorContent,
        platform,
        tone,
        keywords,
        hasImage: needImage || activeArticle?.hasImage || false,
        createdAt: activeArticle?.createdAt || new Date().toISOString()
      });
      setIsSaving(false);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 3000);
    }, 800);
  };

  // Text selection listener
  const handleTextSelection = (e) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start !== end) {
      const selected = textarea.value.substring(start, end);
      setSelectedText(selected);
      
      // Định vị menu nổi ở góc phải của con trỏ chuột
      setMenuCoords({
        x: Math.min(e.clientX, window.innerWidth - 300),
        y: e.clientY - 45
      });
    } else {
      setSelectedText('');
    }
  };

  // Handle selected text action (Rewrite, Expand, etc.)
  const handleSelectionAction = async (action) => {
    if (!selectedText.trim()) return;
    
    setIsGenerating(true);
    setSelectedText('');

    let actionPrompt = '';
    switch (action) {
      case 'rewrite':
        actionPrompt = `Hãy viết lại đoạn văn sau để mượt mà và tự nhiên hơn: "${selectedText}". Chỉ trả về đoạn văn mới sau khi viết lại, không giải thích gì thêm.`;
        break;
      case 'expand':
        actionPrompt = `Hãy viết dài thêm và bổ sung chi tiết cho đoạn văn sau: "${selectedText}". Chỉ trả về phần văn bản mở rộng, không giải thích gì thêm.`;
        break;
      case 'summarize':
        actionPrompt = `Hãy tóm tắt ngắn gọn đoạn văn sau: "${selectedText}". Chỉ trả về đoạn tóm tắt, không giải thích gì thêm.`;
        break;
      case 'fix':
        actionPrompt = `Hãy sửa lỗi chính tả và ngữ pháp trong đoạn văn sau: "${selectedText}". Chỉ trả về đoạn văn chính xác sau khi sửa, không giải thích gì thêm.`;
        break;
      default:
        return;
    }

    try {
      const response = await generateContent(actionPrompt);
      if (response.success && response.data) {
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const originalText = textarea.value;
        
        const before = originalText.substring(0, start);
        const after = originalText.substring(end);
        
        const newContent = before + response.data.trim() + after;
        setEditorContent(newContent);
      }
    } catch (error) {
      console.error('Error modifying text selection:', error);
      alert('Có lỗi xảy ra khi xử lý đoạn văn bôi đen.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Mock publish directly
  const handlePublish = (target) => {
    alert(`Đăng bài viết thành công trực tiếp lên trang ${target}!`);
  };

  return (
    <div className="workspace-grid fade-in">
      {/* Left Column Form */}
      <div className="workspace-sidebar">
        <h3 style={{ fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} /> Cấu hình bài viết
        </h3>
        
        <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label>Chủ đề bài viết</label>
            <input 
              type="text" 
              placeholder="VD: Lợi ích của việc uống nước buổi sáng" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Từ khóa mục tiêu</label>
            <input 
              type="text" 
              placeholder="VD: sức khỏe, nước lọc, uống nước đúng cách" 
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Nền tảng xuất bản</label>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
              <option value="Blog">Blog Post (SEO)</option>
              <option value="Facebook">Mạng xã hội (Facebook/LinkedIn)</option>
              <option value="Email">Email Marketing</option>
            </select>
          </div>

          <div className="form-group">
            <label>Giọng văn (Tone)</label>
            <select value={tone} onChange={(e) => setTone(e.target.value)}>
              <option value="Professional">Chuyên nghiệp / Uy tín</option>
              <option value="Casual">Thân thiện / Gần gũi</option>
              <option value="Humor">Hài hước / Dí dỏm</option>
              <option value="Custom Brand Voice">Giọng văn thương hiệu riêng</option>
            </select>
          </div>

          <div className="form-row-switch">
            <div className="switch-group">
              <div className="switch-label">
                <span className="switch-title">Lập dàn ý bài viết</span>
                <span className="switch-desc">Tạo dàn ý đề cương chi tiết</span>
              </div>
              <label className="switch-control">
                <input 
                  type="checkbox" 
                  checked={needOutline}
                  onChange={(e) => setNeedOutline(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="switch-group">
              <div className="switch-label">
                <span className="switch-title">Tối ưu hóa SEO</span>
                <span className="switch-desc">Tự động thêm SEO Title & Meta</span>
              </div>
              <label className="switch-control">
                <input 
                  type="checkbox" 
                  checked={needSEO}
                  onChange={(e) => setNeedSEO(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="switch-group">
              <div className="switch-label">
                <span className="switch-title">Tạo ảnh minh họa</span>
                <span className="switch-desc">Mô tả prompt vẽ ảnh bằng AI</span>
              </div>
              <label className="switch-control">
                <input 
                  type="checkbox" 
                  checked={needImage}
                  onChange={(e) => setNeedImage(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            className="generate-button"
            disabled={isGenerating || !topic.trim()}
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="spinner" /> Đang soạn thảo...
              </>
            ) : (
              <>
                <Wand2 size={16} /> Tạo nội dung AI
              </>
            )}
          </button>
        </form>
      </div>

      {/* Right Column Editor */}
      <div className="workspace-editor-container">
        {/* Editor Top Toolbar */}
        <div className="editor-header">
          <div className="editor-title">
            <FileText size={18} style={{ color: 'var(--text-secondary)' }} />
            <span style={{ fontSize: '14px', fontWeight: '600' }}>Khung soạn thảo</span>
            {saveStatus === 'saved' && (
              <span className="editor-status fade-in">
                <span className="editor-status-dot"></span> Đã lưu
              </span>
            )}
            {saveStatus === 'saving' && (
              <span className="editor-status fade-in">
                <span className="editor-status-dot saving"></span> Đang lưu...
              </span>
            )}
          </div>

          <div className="editor-actions">
            <button 
              className="btn-secondary" 
              onClick={handleCopy}
              disabled={!editorContent}
              title="Sao chép toàn bộ"
            >
              {copied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
              {copied ? 'Đã sao chép' : 'Sao chép'}
            </button>

            <button 
              className="btn-secondary" 
              onClick={handleSave}
              disabled={isSaving || !editorContent}
              title="Lưu vào Thư viện"
            >
              <Save size={14} />
              Lưu thư viện
            </button>

            <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)', margin: '0 4px' }} />

            <button 
              className="btn-primary" 
              onClick={() => handlePublish(platform === 'Blog' ? 'WordPress' : 'Facebook Fanpage')}
              disabled={!editorContent}
              title="Đăng lên WordPress/Facebook"
            >
              <Globe size={14} />
              Đăng trực tiếp
            </button>
          </div>
        </div>

        {/* Editor Writing Area */}
        <div className="editor-body">
          {isGenerating && !editorContent ? (
            <div className="editor-empty">
              <Loader2 size={40} className="spinner" style={{ color: 'var(--accent)' }} />
              <h3>AI đang viết bài...</h3>
              <p>Mất khoảng vài giây để Gemini thu thập dữ liệu và thiết lập dàn ý bài viết chuẩn xác cho bạn.</p>
            </div>
          ) : !editorContent ? (
            <div className="editor-empty">
              <MessageSquare size={40} style={{ color: 'var(--text-muted)' }} />
              <h3>Bàn làm việc trống</h3>
              <p>Hãy điền cấu hình chủ đề bên cột trái và bấm <b>Tạo nội dung AI</b> để bắt đầu sáng tạo nội dung của bạn.</p>
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              className="editor-textarea"
              value={editorContent}
              onChange={(e) => setEditorContent(e.target.value)}
              onMouseUp={handleTextSelection}
              placeholder="Nhập hoặc chỉnh sửa văn bản của bạn tại đây..."
            />
          )}

          {/* Floating Contextual Menu for Selected Text */}
          {selectedText && (
            <div 
              className="floating-menu fade-in"
              style={{ top: `${menuCoords.y}px`, left: `${menuCoords.x}px` }}
              onMouseDown={(e) => e.preventDefault()} // Ngăn chặn mất focus/selection
            >
              <button onClick={() => handleSelectionAction('rewrite')}>Viết lại</button>
              <button onClick={() => handleSelectionAction('expand')}>Mở rộng</button>
              <button onClick={() => handleSelectionAction('summarize')}>Tóm tắt</button>
              <button onClick={() => handleSelectionAction('fix')}>Sửa lỗi</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Workspace;
