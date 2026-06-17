import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/ai.service';
import { Send, Bot, User, Trash2, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ChatAI = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Cuộn xuống cuối khung chat mỗi khi có tin nhắn mới hoặc đang load
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Thêm tin nhắn của User vào danh sách tin nhắn hiện tại
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Chuyển đổi lịch sử sang đúng format mà Backend Gemini Service yêu cầu
      const apiHistory = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      // Gọi API gửi lên Backend Express
      const response = await sendChatMessage(userMessage, apiHistory);
      
      // Thêm câu trả lời của AI vào list
      setMessages(prev => [...prev, { role: 'model', content: response.response }]);
    } catch (error) {
      console.error('[Chat Error]', error);
      setMessages(prev => [
        ...prev, 
        { 
          role: 'model', 
          content: '❌ Đã xảy ra lỗi khi kết nối với AI. Vui lòng kiểm tra lại kết nối mạng hoặc API Key cấu hình ở Server!' 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm('Bạn có muốn xóa toàn bộ lịch sử trò chuyện này không?')) {
      setMessages([]);
    }
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="header-info">
          <div className="icon-wrapper">
            <Sparkles size={20} className="sparkles-icon" />
          </div>
          <div>
            <h2>Gemini AI Assistant</h2>
            <p>Trợ lý ảo thông minh MERN Stack</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button className="clear-btn" onClick={clearChat} title="Xóa lịch sử chat">
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="messages-list">
        {messages.length === 0 ? (
          <div className="welcome-screen">
            <div className="bot-logo-wrapper">
              <Bot size={48} className="bot-welcome-icon" />
            </div>
            <h3>Xin chào! Tôi là Trợ lý AI</h3>
            <p>Tôi có thể giải đáp thắc mắc, tóm tắt tài liệu hoặc lập trình cùng bạn. Hãy thử hỏi:</p>
            <div className="suggested-prompts">
              <button onClick={() => setInput('Giải thích khái niệm cơ sở dữ liệu MongoDB cho người mới học')}>
                💡 Giải thích MongoDB
              </button>
              <button onClick={() => setInput('Hãy viết một đoạn mã Node.js Express cơ bản để phục vụ GET API')}>
                💻 Viết code Express cơ bản
              </button>
              <button onClick={() => setInput('Đưa ra 5 mẹo tối ưu hóa hiệu năng cho ứng dụng ReactJS')}>
                ⚡ Tối ưu hiệu năng React
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`message-item ${msg.role}`}>
              <div className="avatar">
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className="message-bubble">
                <div className="message-sender">
                  {msg.role === 'user' ? 'Bạn' : 'Gemini AI'}
                </div>
                <div className="message-content">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="message-item model typing">
            <div className="avatar">
              <Bot size={18} />
            </div>
            <div className="message-bubble">
              <div className="message-sender">Gemini AI</div>
              <div className="message-content loading-indicator">
                <Loader2 size={16} className="spinner" />
                <span>Đang xử lý thông tin...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form className="chat-input-form" onSubmit={handleSend}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập nội dung câu hỏi..."
          disabled={loading}
        />
        <button type="submit" disabled={!input.trim() || loading} className="send-btn">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatAI;
