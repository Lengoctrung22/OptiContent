import nodemailer from 'nodemailer';

/**
 * Service: Gửi Email qua SMTP
 * Sử dụng Nodemailer để gửi email khôi phục mật khẩu và thông báo hệ thống.
 */

/**
 * Gửi email thông qua cấu hình SMTP từ biến môi trường
 * @param {Object} options - Cấu hình email
 * @param {string} options.to - Địa chỉ email người nhận
 * @param {string} options.subject - Tiêu đề email
 * @param {string} options.html - Nội dung HTML của email
 */
const sendEmail = async ({ to, subject, html }) => {
  // Tạo transporter SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true cho port 465, false cho các port khác
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Cấu hình nội dung email
  const mailOptions = {
    from: process.env.EMAIL_FROM || `OptiContent <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  // Gửi email
  const info = await transporter.sendMail(mailOptions);
  console.log(`[Email] Đã gửi email thành công tới ${to} - MessageID: ${info.messageId}`);
  
  return info;
};

/**
 * Tạo template HTML email đặt lại mật khẩu
 * @param {string} userName - Tên người dùng
 * @param {string} resetUrl - URL đặt lại mật khẩu
 * @returns {string} - HTML template
 */
export const getResetPasswordEmailTemplate = (userName, resetUrl) => {
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="520" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 40px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">
                ⚡ OptiContent
              </h1>
              <p style="color: #94a3b8; font-size: 13px; margin: 8px 0 0 0;">
                Đặt Lại Mật Khẩu Tài Khoản
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 0 0 12px 0;">
                Xin chào ${userName || 'bạn'},
              </h2>
              <p style="color: #334155; font-size: 14px; line-height: 1.7; margin: 0 0 24px 0;">
                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản OptiContent của bạn. 
                Nhấn nút bên dưới để tạo mật khẩu mới:
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding: 8px 0 24px 0;">
                    <a href="${resetUrl}" target="_blank" 
                       style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; 
                              font-size: 14px; font-weight: 600; padding: 14px 36px; border-radius: 8px;
                              box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);">
                      🔑 Đặt Lại Mật Khẩu
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Warning -->
              <div style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">
                <p style="color: #92400e; font-size: 12px; margin: 0; line-height: 1.5;">
                  ⚠️ <strong>Lưu ý:</strong> Link này chỉ có hiệu lực trong <strong>15 phút</strong>. 
                  Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
                </p>
              </div>

              <!-- Fallback URL -->
              <p style="color: #64748b; font-size: 11px; line-height: 1.5; margin: 0; word-break: break-all;">
                Nếu nút không hoạt động, hãy copy và dán link sau vào trình duyệt:<br>
                <a href="${resetUrl}" style="color: #4f46e5; text-decoration: none;">${resetUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 40px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="color: #94a3b8; font-size: 11px; margin: 0; line-height: 1.5;">
                © 2026 OptiContent — Nền tảng sáng tạo nội dung AI<br>
                Email này được gửi tự động, vui lòng không trả lời.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export default sendEmail;
