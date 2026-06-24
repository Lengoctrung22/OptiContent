const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});

// Bắt lỗi kết nối
proxy.on('error', (err, req, res) => {
  res.writeHead(500, {
    'Content-Type': 'text/plain; charset=utf-8',
  });
  res.end('Đã xảy ra lỗi kết nối với máy chủ Frontend. Hãy đảm bảo bạn đã khởi chạy "npm run dev" trong thư mục frontend (cổng 5173).');
});

const server = http.createServer((req, res) => {
  const host = req.headers.host || '';
  
  if (host.includes('admin.opticontent.local') || host.includes('app.opticontent.local')) {
    // Proxy cả 2 domain về cùng cổng 5173 của Vite
    proxy.web(req, res, { target: 'http://localhost:5173' });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Không tìm thấy trang. Vui lòng truy cập qua đường dẫn: http://admin.opticontent.local hoặc http://app.opticontent.local');
  }
});

// Hỗ trợ WebSockets cho Hot Module Replacement (HMR) của Vite
server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head, { target: 'http://localhost:5173' });
});

const PORT = 80;
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const FALLBACK_PORT = 8080;
    server.listen(FALLBACK_PORT, () => {
      console.log(`\n⚠️  Cổng 80 đã bị chiếm dụng bởi ứng dụng khác (IIS, Skype, v.v.).`);
      console.log(`🔄  Đang chạy Proxy Server thay thế trên cổng: ${FALLBACK_PORT}`);
      console.log(`👉 Truy cập Admin: http://admin.opticontent.local:${FALLBACK_PORT}`);
      console.log(`👉 Truy cập User: http://app.opticontent.local:${FALLBACK_PORT}\n`);
    });
  } else {
    console.error('Lỗi khởi động Proxy:', err);
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 Proxy Server đang chạy thành công trên cổng ${PORT}!`);
  console.log(`👉 Truy cập Admin: http://admin.opticontent.local`);
  console.log(`👉 Truy cập User: http://app.opticontent.local\n`);
});
