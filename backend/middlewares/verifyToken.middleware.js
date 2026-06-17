import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

/**
 * Middleware: verifyToken
 * Bảo vệ các route private/nhạy cảm bằng cách giải mã và kiểm tra độ hợp lệ của JWT gửi kèm trong headers.
 * 
 * Cách sử dụng cho route private:
 *   router.get('/profile', verifyToken, getProfile);
 */
export const verifyToken = async (req, res, next) => {
  let token;

  // 1. Kiểm tra Token gửi kèm trong header Authorization dưới dạng 'Bearer <token>'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Tách lấy phần token mã hóa
      token = req.headers.authorization.split(' ')[1];

      // 2. Giải mã và verify token bằng khóa bí mật JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Truy vấn xem User có tồn tại trong hệ thống nữa không
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        res.status(401);
        return next(new Error('Tài khoản liên kết với token này không còn tồn tại trên hệ thống!'));
      }

      // 4. Kiểm tra tài khoản người dùng có bị khóa hay không
      if (currentUser.status === 'Banned') {
        res.status(403);
        return next(new Error('Tài khoản của bạn đã bị khóa, không thể truy cập tài nguyên!'));
      }

      // 5. Đính kèm thông tin user vào request object để các middleware/controller phía sau sử dụng
      req.user = currentUser;
      
      return next();
    } catch (error) {
      res.status(401); // 401 Unauthorized
      return next(new Error('Yêu cầu chưa được xác thực, Token đã hết hạn hoặc không hợp lệ!'));
    }
  }

  // Nếu không gửi kèm Token trong headers
  if (!token) {
    res.status(401);
    return next(new Error('Yêu cầu bị từ chối, không tìm thấy token xác thực trong request headers!'));
  }
};
export default verifyToken;
