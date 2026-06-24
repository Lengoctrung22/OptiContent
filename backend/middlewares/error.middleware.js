/**
 * Middleware bắt lỗi tập trung cho toàn bộ ứng dụng Express
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  console.error('[Error Middleware Catch]:', err);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Đã xảy ra lỗi hệ thống!',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export default errorHandler;
