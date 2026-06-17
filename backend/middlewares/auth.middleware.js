import jwt from 'jsonwebtoken';

/**
 * Middleware bảo vệ các route yêu cầu người dùng phải đăng nhập
 */
const protect = async (req, res, next) => {
  let token;

  // Kiểm tra token gửi kèm trong header Authorization dưới dạng 'Bearer <token>'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Giải mã token bằng JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Gán thông tin user (ví dụ: id, email) vào request object
      req.user = decoded;
      
      return next();
    } catch (error) {
      res.status(401);
      return next(new Error('Yêu cầu không được xác thực, Token bị lỗi hoặc đã hết hạn!'));
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error('Yêu cầu bị từ chối, không tìm thấy token xác thực!'));
  }
};

export default protect;
