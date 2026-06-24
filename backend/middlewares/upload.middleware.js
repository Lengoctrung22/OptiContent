import multer from 'multer';
import path from 'path';

// Cấu hình lưu trữ trong bộ nhớ đệm (Memory Storage) thay vì lưu tệp trực tiếp lên đĩa cứng máy chủ
const storage = multer.memoryStorage();

// Hàm lọc các định dạng tệp tải lên
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.txt', '.pdf', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Định dạng tệp không được hỗ trợ! Chỉ chấp nhận tệp .txt, .pdf, .docx'), false);
  }
};

// Khởi tạo multer với các cấu hình tương ứng
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn kích thước tệp tối đa 10MB
  fileFilter: fileFilter
});

export default upload;
