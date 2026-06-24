import { useState, useEffect, useRef } from 'react';

export const useSpeechSynthesis = () => {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1.0); // Tốc độ đọc mặc định: 1.0x

  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const utteranceRef = useRef(null);

  // Lấy danh sách giọng đọc từ trình duyệt
  const loadVoices = () => {
    if (!synthRef.current) return;
    const allVoices = synthRef.current.getVoices();
    setVoices(allVoices);

    // Tìm giọng Tiếng Việt ưu tiên
    const viVoice = allVoices.find(voice => voice.lang.includes('vi') || voice.lang.includes('VI'));
    // Nếu không có, tìm giọng Tiếng Anh hoặc lấy giọng đầu tiên
    const defaultVoice = viVoice || allVoices.find(voice => voice.lang.includes('en')) || allVoices[0];
    setSelectedVoice(defaultVoice);
  };

  useEffect(() => {
    if (!synthRef.current) return;

    const synth = synthRef.current; // Capture ref value for cleanup
    loadVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }

    // Cleanup: Dừng phát khi unmount component
    return () => {
      synth.cancel();
    };
  }, []);

  // Hàm chuyển đổi văn bản từ HTML sang text thuần
  const cleanHtml = (html) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Hàm bắt đầu đọc
  const speak = (htmlText) => {
    if (!synthRef.current) return;

    // Dừng âm thanh cũ nếu có
    synthRef.current.cancel();

    const plainText = cleanHtml(htmlText).trim();
    if (!plainText) return;

    // Tạo đối tượng SpeechSynthesisUtterance mới
    const utterance = new SpeechSynthesisUtterance(plainText);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = rate;

    // Thiết lập các sự kiện phản hồi từ API đọc
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.error('SpeechSynthesis error:', e);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  // Hàm tạm dừng đọc
  const pause = () => {
    if (synthRef.current && synthRef.current.speaking && !synthRef.current.paused) {
      synthRef.current.pause();
      setIsPaused(true);
    }
  };

  // Hàm tiếp tục đọc
  const resume = () => {
    if (synthRef.current && synthRef.current.paused) {
      synthRef.current.resume();
      setIsPaused(false);
    }
  };

  // Hàm dừng hẳn
  const stop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  return {
    voices,
    selectedVoice,
    setSelectedVoice,
    isSpeaking,
    isPaused,
    rate,
    setRate,
    speak,
    pause,
    resume,
    stop,
  };
};
