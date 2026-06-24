import { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { marked } from 'marked';

// Cấu hình marked: bật breaks để mỗi dấu xuống dòng (\n) tạo thẻ <br>,
// và gfm để hỗ trợ cú pháp GitHub-Flavored Markdown (danh sách, bảng, v.v.)
marked.setOptions({
  breaks: true,
  gfm: true,
});

import { generateContent, generateFromDocument } from '../services/ai.service.js';

import api from '../services/api.js';
import { downloadAsWord, downloadAsMarkdown, downloadAsHtml } from '../utils/exporters.js';
import { useSpeechSynthesis } from '../utils/useSpeechSynthesis.js';
import { 
  Sparkles, 
  Copy, 
  Save, 
  Globe, 
  FileText, 
  Check, 
  Loader2, 

  Wand2,
  Share2,
  Download,
  Link,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Send,
  MessageSquare,
  Trash2,
  Plus
} from 'lucide-react';

const Workspace = ({ onSaveArticle, defaultValues = null, activeArticle = null, clearActiveArticle, workspaceDraft, setWorkspaceDraft }) => {
  const {
    voices,
    selectedVoice,
    setSelectedVoice,
    isSpeaking,
    isPaused,
    speak,
    pause,
    resume,
    stop,
  } = useSpeechSynthesis();

  const [topic, setTopic] = useState(workspaceDraft?.topic || '');
  const [keywords, setKeywords] = useState(workspaceDraft?.keywords || '');
  const [platform, setPlatform] = useState(workspaceDraft?.platform || 'Blog');
  const [tone, setTone] = useState(workspaceDraft?.tone || 'Professional');
  
  // Toggles
  const [needOutline, setNeedOutline] = useState(false);
  const [needSEO, setNeedSEO] = useState(false);
  const [needImage, setNeedImage] = useState(false);
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['.txt', '.pdf', '.docx'];
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!allowedTypes.includes(ext)) {
        alert('Chỉ chấp nhận file .txt, .pdf hoặc .docx');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('Dung lượng file không được vượt quá 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Editor state
  const [editorContent, setEditorContent] = useState(workspaceDraft?.editorContent || '');
  const [currentArticleId, setCurrentArticleId] = useState(workspaceDraft?.currentArticleId || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(''); // 'saved', 'saving', ''
  const [copied, setCopied] = useState(false);
  
  // Trạng thái chia sẻ và tải file
  const [isShared, setIsShared] = useState(workspaceDraft?.isShared || false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Text Selection floating menu
  const [selectedText, setSelectedText] = useState('');
  const [menuCoords, setMenuCoords] = useState({ x: 0, y: 0 });
  
  const quillRef = useRef(null);
  const selectionRangeRef = useRef(null);

  // Sidebar Chat states
  const [showChatSidebar, setShowChatSidebar] = useState(workspaceDraft?.showChatSidebar || false);
  const [chatMessages, setChatMessages] = useState(workspaceDraft?.chatMessages || []);
  const [chatInput, setChatInput] = useState('');
  const [isChatGenerating, setIsChatGenerating] = useState(false);
  const [useContext, setUseContext] = useState(true);

  // Đồng bộ bản nháp liên tục để luôn có dữ liệu mới nhất khi unmount
  const draftRef = useRef({ topic, keywords, platform, tone, editorContent, currentArticleId, isShared, showChatSidebar, chatMessages });
  useEffect(() => {
    draftRef.current = { topic, keywords, platform, tone, editorContent, currentArticleId, isShared, showChatSidebar, chatMessages };
  }, [topic, keywords, platform, tone, editorContent, currentArticleId, isShared, showChatSidebar, chatMessages]);

  // Lưu bản nháp thực tế khi unmount (sử dụng ref để luôn có giá trị mới nhất)
  useEffect(() => {
    return () => {
      if (setWorkspaceDraft) {
        setWorkspaceDraft(draftRef.current);
      }
    };
  }, [setWorkspaceDraft]);

  // Apply default values from dashboard quick link (render-time sync — React-recommended pattern)
  const [prevDefaultValues, setPrevDefaultValues] = useState(defaultValues);
  if (defaultValues !== prevDefaultValues) {
    setPrevDefaultValues(defaultValues);
    if (defaultValues?.platform) setPlatform(defaultValues.platform);
  }

  // Load article if editing from Library (render-time sync — avoids cascading-render antipattern)
  const [prevActiveArticle, setPrevActiveArticle] = useState(activeArticle);
  if (activeArticle !== prevActiveArticle) {
    setPrevActiveArticle(activeArticle);
    if (activeArticle) {
      setTopic(activeArticle.title || '');
      setKeywords(activeArticle.keywords || '');
      setPlatform(activeArticle.platform || 'Blog');
      setTone(activeArticle.tone || 'Professional');
      setIsShared(activeArticle.isShared || false);
      
      const rawContent = activeArticle.content || '';
      const contentHtml = rawContent.trim().startsWith('<') ? rawContent : marked.parse(rawContent);
      setEditorContent(contentHtml);
      setCurrentArticleId(activeArticle.id || '');
    }
    // Không xóa nội dung khi activeArticle là null — giữ lại bản nháp đang soạn
  }


  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    setSaveStatus('');

    try {
      let response;

      if (selectedFile) {
        // Gửi kèm file qua FormData
        const formData = new FormData();
        formData.append('document', selectedFile);
        formData.append('topic', topic);
        formData.append('keywords', keywords);
        formData.append('platform', platform);
        formData.append('tone', tone);
        formData.append('needOutline', needOutline);
        formData.append('needSEO', needSEO);
        formData.append('needImage', needImage);

        response = await generateFromDocument(formData);
      } else {
        // Xây dựng prompt thông thường
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

        response = await generateContent(prompt);
      }

      if (response.success && response.data) {
        const htmlContent = marked.parse(response.data);
        setEditorContent(htmlContent);
      } else {
        alert('Không nhận được dữ liệu từ AI. Vui lòng thử lại!');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi kết nối với máy chủ AI. Hãy kiểm tra khóa API của bạn.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy plain text to clipboard
  const handleCopy = async () => {
    if (!editorContent) return;
    try {
      // Chuyển đổi mã HTML thành văn bản thuần trước khi copy
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = editorContent;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Save to Database
  const handleSave = async () => {
    if (!editorContent.trim()) return;
    setIsSaving(true);
    setSaveStatus('saving');

    // Mẹo nhỏ: lấy dòng đầu tiên làm tiêu đề nếu không có chủ đề
    let articleTitle = topic.trim();
    if (!articleTitle) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = editorContent;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      articleTitle = plainText.split('\n')[0].trim().substring(0, 50) || 'Bài viết mới';
    }
    
    try {
      const savedArt = await onSaveArticle({
        id: currentArticleId || '',
        title: articleTitle,
        content: editorContent, // Lưu trực tiếp mã HTML phong phú
        platform,
        tone,
        keywords,
        hasImage: needImage || activeArticle?.hasImage || false,
        isShared: isShared
      });
      
      if (savedArt) {
        setCurrentArticleId(savedArt.id);
      }
      setSaveStatus('saved');
    } catch (error) {
      console.error('Failed to save article:', error);
      alert('Có lỗi xảy ra khi lưu bài viết.');
      setSaveStatus('');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  // Thay đổi chế độ chia sẻ bài viết công khai
  const handleToggleShare = async () => {
    if (!currentArticleId) {
      setIsShared(!isShared);
      return;
    }

    try {
      const response = await api.patch(`/articles/${currentArticleId}/share`);
      if (response.data && response.data.success) {
        setIsShared(response.data.data.isShared);
      }
    } catch (err) {
      console.error('Lỗi thay đổi trạng thái chia sẻ:', err);
      alert(err.response?.data?.message || 'Không thể thay đổi trạng thái chia sẻ. Vui lòng thử lại!');
    }
  };

  // Sao chép liên kết chia sẻ công khai
  const handleCopyShareLink = () => {
    if (!currentArticleId) {
      alert('Vui lòng lưu bài viết vào thư viện trước để tạo liên kết chia sẻ!');
      return;
    }
    const shareLink = `${window.location.origin}/share/${currentArticleId}`;
    navigator.clipboard.writeText(shareLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Lắng nghe sự kiện bôi đen văn bản trong Quill
  const handleMouseUp = (e) => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    
    // Đợi 50ms để selection được cập nhật đầy đủ trong Quill
    setTimeout(() => {
      const range = editor.getSelection();
      if (range && range.length > 0) {
        const selected = editor.getText(range.index, range.length);
        if (selected.trim()) {
          setSelectedText(selected);
          selectionRangeRef.current = range;
          setMenuCoords({
            x: Math.min(e.clientX, window.innerWidth - 300),
            y: e.clientY - 45
          });
        }
      } else {
        setSelectedText('');
        selectionRangeRef.current = null;
      }
    }, 50);
  };

  // Xử lý các thao tác bôi đen chữ gửi prompt AI
  const handleSelectionAction = async (action) => {
    if (!selectedText.trim()) return;
    
    setIsGenerating(true);
    const textToProcess = selectedText;
    setSelectedText('');

    let actionPrompt;
    switch (action) {
      case 'rewrite':
        actionPrompt = `Hãy viết lại đoạn văn sau để mượt mà và tự nhiên hơn: "${textToProcess}". Chỉ trả về đoạn văn mới sau khi viết lại, không giải thích gì thêm.`;
        break;
      case 'expand':
        actionPrompt = `Hãy viết dài thêm và bổ sung chi tiết cho đoạn văn sau: "${textToProcess}". Chỉ trả về phần văn bản mở rộng, không giải thích gì thêm.`;
        break;
      case 'summarize':
        actionPrompt = `Hãy tóm tắt ngắn gọn đoạn văn sau: "${textToProcess}". Chỉ trả về đoạn tóm tắt, không giải thích gì thêm.`;
        break;
      case 'fix':
        actionPrompt = `Hãy sửa lỗi chính tả và ngữ pháp trong đoạn văn sau: "${textToProcess}". Chỉ trả về đoạn văn chính xác sau khi sửa, không giải thích gì thêm.`;
        break;
      default:
        setIsGenerating(false);
        return;
    }

    try {
      const response = await generateContent(actionPrompt);
      if (response.success && response.data) {
        const editor = quillRef.current?.getEditor();
        const range = selectionRangeRef.current;
        if (editor && range) {
          editor.deleteText(range.index, range.length);
          editor.insertText(range.index, response.data.trim());
          setEditorContent(editor.root.innerHTML);
          selectionRangeRef.current = null;
        }
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

  // Sidebar Chat Helpers
  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatGenerating) return;

    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    const inputToSend = chatInput;
    setChatInput('');
    setIsChatGenerating(true);

    try {
      let finalPrompt = '';
      if (useContext && editorContent) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = editorContent;
        const plainText = tempDiv.textContent || tempDiv.innerText || '';
        finalPrompt = `Ngữ cảnh bài viết hiện tại:\n"""\n${plainText.substring(0, 8000)}\n"""\n\nYêu cầu hỗ trợ soạn thảo: ${inputToSend}`;
      } else {
        finalPrompt = inputToSend;
      }

      const response = await generateContent(finalPrompt);
      if (response.success && response.data) {
        setChatMessages(prev => [...prev, { role: 'model', content: response.data }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'model', content: 'Xin lỗi, không có phản hồi nào từ AI. Vui lòng thử lại!' }]);
      }
    } catch (err) {
      console.error('Lỗi khi trò chuyện với AI:', err);
      setChatMessages(prev => [...prev, { role: 'model', content: 'Có lỗi xảy ra khi kết nối tới máy chủ AI.' }]);
    } finally {
      setIsChatGenerating(false);
    }
  };

  const handleInsertToEditor = (text) => {
    const editor = quillRef.current?.getEditor();
    if (editor) {
      const range = editor.getSelection() || { index: editor.getLength() - 1, length: 0 };
      editor.insertText(range.index, text);
      editor.setSelection(range.index + text.length);
      setEditorContent(editor.root.innerHTML);
    } else {
      setEditorContent(prev => prev + `<p>${text.replace(/\n/g, '<br>')}</p>`);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lịch sử trò chuyện trong phiên này?')) {
      setChatMessages([]);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'clean']
    ],
  };

  return (
    <div className={`workspace-grid fade-in ${showChatSidebar ? 'has-chat-sidebar' : ''}`}>
      {/* Cột trái cấu hình */}
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

          {/* Khung tải tài liệu tham khảo */}
          <div className="form-group">
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Tài liệu tham khảo (Tùy chọn)</span>
              {selectedFile && (
                <button 
                  type="button" 
                  onClick={handleRemoveFile} 
                  style={{ color: '#ef4444', background: 'none', border: 'none', fontSize: '11px', cursor: 'pointer', fontWeight: '500' }}
                >
                  Gỡ bỏ
                </button>
              )}
            </label>
            
            {!selectedFile ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border-color, #e2e8f0)',
                  borderRadius: '8px',
                  padding: '12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#f8fafc',
                  transition: 'border-color 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary, #4f46e5)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color, #e2e8f0)'}
              >
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>
                  Nhấp để tải lên PDF, DOCX, TXT
                </span>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>Tối đa 10MB</span>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf,.docx,.txt" 
                  style={{ display: 'none' }} 
                />
              </div>
            ) : (
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#166534'
                }}
              >
                <FileText size={16} style={{ color: '#15803d', flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '500' }}>
                  {selectedFile.name}
                </span>
                <span style={{ fontSize: '10px', color: '#166534', opacity: 0.8, marginLeft: 'auto', flexShrink: 0 }}>
                  ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            )}
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

      {/* Cột phải trình soạn thảo */}
      <div className="workspace-editor-container">
        {/* Editor Top Toolbar */}
        <div className="editor-header">
          <div className="editor-title">
            <FileText size={18} style={{ color: 'var(--text-secondary)' }} />
            <span style={{ fontSize: '14px', fontWeight: '600' }}>Khung soạn thảo</span>
            {currentArticleId && (
              <span style={{ fontSize: '11px', color: '#4f46e5', backgroundColor: '#e0e7ff', padding: '3px 8px', borderRadius: '4px', marginLeft: '10px', fontWeight: '600', display: 'inline-flex', alignItems: 'center' }}>
                Đang chỉnh sửa
              </span>
            )}
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
            {currentArticleId && (
              <button 
                className="btn-secondary"
                style={{ borderColor: '#fecaca', color: '#ef4444' }}
                onClick={() => {
                  if (window.confirm('Bạn có chắc chắn muốn đóng chế độ chỉnh sửa và tạo bài viết mới?')) {
                    clearActiveArticle();
                    setCurrentArticleId('');
                    setEditorContent('');
                    setTopic('');
                    setKeywords('');
                    setIsShared(false);
                  }
                }}
                title="Đóng chế độ chỉnh sửa và tạo bài viết mới"
              >
                Tạo mới
              </button>
            )}

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
              title={currentArticleId ? "Cập nhật bài viết" : "Lưu vào Thư viện"}
              style={currentArticleId ? { backgroundColor: 'var(--primary)', color: '#ffffff', borderColor: 'var(--primary)' } : {}}
            >
              <Save size={14} />
              {currentArticleId ? 'Cập nhật' : 'Lưu bài'}
            </button>

            {/* Dropdown Tải xuống */}
            <div className="dropdown-container">
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowDownloadMenu(!showDownloadMenu);
                  setShowShareMenu(false);
                }}
                disabled={!editorContent}
                title="Tải bài viết về máy"
              >
                <Download size={14} />
                Tải về
              </button>
              {showDownloadMenu && (
                <div className="dropdown-menu-card">
                  <button 
                    className="dropdown-menu-item"
                    onClick={() => {
                      downloadAsWord(topic || 'Bai_viet', editorContent);
                      setShowDownloadMenu(false);
                    }}
                  >
                    <FileText size={14} />
                    Microsoft Word (.doc)
                  </button>
                  <button 
                    className="dropdown-menu-item"
                    onClick={() => {
                      downloadAsMarkdown(topic || 'Bai_viet', editorContent);
                      setShowDownloadMenu(false);
                    }}
                  >
                    <FileText size={14} />
                    Markdown (.md)
                  </button>
                  <button 
                    className="dropdown-menu-item"
                    onClick={() => {
                      downloadAsHtml(topic || 'Bai_viet', editorContent);
                      setShowDownloadMenu(false);
                    }}
                  >
                    <FileText size={14} />
                    HTML Website (.html)
                  </button>
                </div>
              )}
            </div>

            {/* Dropdown Chia sẻ */}
            <div className="dropdown-container">
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowShareMenu(!showShareMenu);
                  setShowDownloadMenu(false);
                }}
                disabled={!editorContent}
                title="Chia sẻ công khai bài viết"
              >
                <Share2 size={14} style={{ color: isShared ? 'var(--success)' : 'inherit' }} />
                Chia sẻ
              </button>
              {showShareMenu && (
                <div className="share-menu-card">
                  <div className="share-toggle-row">
                    <span className="share-header-title">Chia sẻ liên kết công khai</span>
                    <label className="switch-control" style={{ transform: 'scale(0.85)', margin: 0 }}>
                      <input 
                        type="checkbox" 
                        checked={isShared}
                        onChange={handleToggleShare}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  
                  {isShared ? (
                    currentArticleId ? (
                      <div className="share-link-box">
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Liên kết đọc công khai:</span>
                        <div className="share-link-input-group">
                          <input 
                            type="text" 
                            className="share-link-input"
                            readOnly 
                            value={`${window.location.origin}/share/${currentArticleId}`}
                            onClick={(e) => e.target.select()}
                          />
                          <button 
                            onClick={handleCopyShareLink}
                            style={{
                              padding: '4px 10px',
                              backgroundColor: 'var(--accent)',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: '90px'
                            }}
                          >
                            {copiedLink ? <Check size={11} style={{ marginRight: '3px' }} /> : <Link size={11} style={{ marginRight: '3px' }} />}
                            {copiedLink ? 'Đã sao chép' : 'Sao chép'}
                          </button>
                        </div>
                        <a 
                          href={`/share/${currentArticleId}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="share-view-link"
                          style={{ marginTop: '4px' }}
                        >
                          <Globe size={12} /> Xem trang công khai
                        </a>
                      </div>
                    ) : (
                      <p style={{ fontSize: '11px', color: '#ef4444', margin: 0, textAlign: 'center', padding: '10px 0' }}>
                        * Hãy bấm "Lưu thư viện" trước để lấy liên kết chia sẻ!
                      </p>
                    )
                  ) : (
                    <p style={{ fontSize: '12px', color: '#64748b', margin: 0, textAlign: 'center', padding: '10px 0' }}>
                      Bật chia sẻ công khai để cho phép người khác đọc bài viết này mà không cần tài khoản.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Bộ điều khiển Giọng đọc */}
            <div className="speech-controls-group">
              {isSpeaking ? (
                <>
                  <button
                    className="btn-secondary btn-speech active"
                    onClick={stop}
                    title="Dừng nghe bài viết"
                    type="button"
                  >
                    <VolumeX size={14} />
                    Dừng nghe
                  </button>
                  <button
                    className="btn-secondary btn-speech-icon"
                    onClick={isPaused ? resume : pause}
                    title={isPaused ? "Tiếp tục" : "Tạm dừng"}
                    type="button"
                  >
                    {isPaused ? <Play size={14} /> : <Pause size={14} />}
                  </button>
                </>
              ) : (
                <button
                  className="btn-secondary btn-speech"
                  onClick={() => speak(editorContent)}
                  disabled={!editorContent}
                  title="Nghe bài viết"
                  type="button"
                >
                  <Volume2 size={14} />
                  Nghe bài
                </button>
              )}

              {voices.length > 0 && (
                <div className="speech-dropdown-container">
                  <select
                    className="speech-voice-select"
                    value={selectedVoice?.name || ''}
                    onChange={(e) => {
                      const voice = voices.find(v => v.name === e.target.value);
                      if (voice) setSelectedVoice(voice);
                    }}
                    title="Chọn giọng đọc"
                  >
                    {voices.map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name.replace('Microsoft', '').replace('Google', '').trim()} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <button 
              type="button"
              className={`btn-secondary ${showChatSidebar ? 'active-chat-btn' : ''}`}
              onClick={() => setShowChatSidebar(!showChatSidebar)}
              title="Trợ lý AI Chat"
              style={showChatSidebar ? { backgroundColor: 'var(--accent-light)', color: 'var(--accent)', borderColor: 'var(--accent)' } : {}}
            >
              <Sparkles size={14} />
              <span>Trợ lý AI</span>
            </button>

            <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)', margin: '0 4px' }} />

            <button 
              className="btn-primary" 
              onClick={() => handlePublish(platform === 'Blog' ? 'WordPress' : 'Facebook Fanpage')}
              disabled={!editorContent}
              title="Đăng lên WordPress/Facebook"
            >
              <Globe size={14} />
              Đăng bài
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
          ) : (
            <div className="editor-wrapper-inner" onMouseUp={handleMouseUp} style={{ height: '100%' }}>
              <ReactQuill
                theme="snow"
                value={editorContent}
                onChange={setEditorContent}
                ref={quillRef}
                modules={modules}
                placeholder="Hãy nhập hoặc cấu hình chủ đề bên cột trái và bấm Tạo nội dung AI để bắt đầu..."
              />
            </div>
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

      {/* Sidebar Chat Panel */}
      {showChatSidebar && (
        <div className="workspace-chat-sidebar">
          <div className="sidebar-chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={16} style={{ color: 'var(--accent)' }} />
              <span style={{ fontWeight: '700', fontSize: '14px' }}>Trợ lý AI Chat</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={handleClearChat} 
                className="clear-chat-btn" 
                title="Xóa cuộc trò chuyện"
                disabled={chatMessages.length === 0}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <div className="sidebar-chat-messages">
            {chatMessages.length === 0 ? (
              <div className="sidebar-chat-empty">
                <Sparkles size={24} style={{ color: 'var(--accent)', marginBottom: '8px', animation: 'float-slow 3s infinite' }} />
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                  Trò chuyện với AI để nhận gợi ý, lên ý tưởng, hoặc chỉnh sửa nội dung bài viết.
                </p>
                <div className="sidebar-quick-prompts">
                  <button onClick={() => { setChatInput('Tóm tắt bài viết này giúp tôi'); }}>
                    📝 Tóm tắt bài viết
                  </button>
                  <button onClick={() => { setChatInput('Tìm và sửa lỗi chính tả trong bài viết'); }}>
                    🔍 Tìm lỗi chính tả
                  </button>
                  <button onClick={() => { setChatInput('Viết một mở bài hấp dẫn dựa trên chủ đề trên'); }}>
                    💡 Viết mở bài
                  </button>
                </div>
              </div>
            ) : (
              chatMessages.map((msg, index) => (
                <div key={index} className={`sidebar-msg-item ${msg.role}`}>
                  <div className="sidebar-msg-bubble">
                    <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{msg.content}</p>
                    {msg.role === 'model' && (
                      <button 
                        onClick={() => handleInsertToEditor(msg.content)}
                        className="sidebar-insert-btn"
                        title="Chèn nội dung này vào vị trí con trỏ trong trình soạn thảo"
                      >
                        <Plus size={12} />
                        <span>Chèn vào bài viết</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
            {isChatGenerating && (
              <div className="sidebar-msg-item model loading">
                <div className="sidebar-msg-bubble loading">
                  <Loader2 size={14} className="spinner" />
                  <span>AI đang suy nghĩ...</span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendChatMessage} className="sidebar-chat-input-form">
            <div className="context-checkbox-row">
              <label>
                <input 
                  type="checkbox" 
                  checked={useContext} 
                  onChange={(e) => setUseContext(e.target.checked)} 
                />
                <span>Gửi kèm ngữ cảnh bài viết</span>
              </label>
            </div>
            <div className="input-group-row">
              <input 
                type="text" 
                placeholder="Hỏi AI trợ giúp..." 
                value={chatInput} 
                onChange={(e) => setChatInput(e.target.value)} 
                disabled={isChatGenerating}
              />
              <button type="submit" disabled={!chatInput.trim() || isChatGenerating}>
                <Send size={14} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Workspace;
