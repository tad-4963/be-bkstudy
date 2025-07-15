// Import các module cần thiết
import path from 'path'; // Xử lý đường dẫn tệp
import { fileURLToPath } from 'url'; // Chuyển đổi URL thành đường dẫn tệp

// Tạo biến __filename và __dirname (ES Module không hỗ trợ trực tiếp như CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tiếp tục import các thư viện cần thiết
import nodemailer from 'nodemailer'; // Gửi email
import dotenv from 'dotenv'; // Đọc biến môi trường từ file .env
import fs from 'fs'; // Đọc file hệ thống
import handlebars from 'handlebars'; // Template engine cho HTML email

// Tải các biến môi trường từ .env
dotenv.config();

// Cấu hình transporter để gửi email qua Gmail SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // SMTP server của Gmail
  port: 465, // Port bảo mật SSL
  secure: true, // true nếu dùng port 465
  auth: {
    user: process.env.MAIL_ACCOUNT, // Email gửi
    pass: process.env.MAIL_PASSWORD, // Mật khẩu ứng dụng (không phải mật khẩu Gmail thường)
  },
});

// Hàm gửi email đặt lại mật khẩu
export const sendEmailResetPassword = async (email, token) => {
  try {
    // Tạo đường dẫn reset mật khẩu chứa token
    const resetPasswordLink = `${process.env.CLIENT_URL}/account/recovery/reset-password?email=${encodeURIComponent(email)}&verify_token=${token}`;
    
    // Đọc nội dung file HTML template
    const sourceHtml = fs.readFileSync(
      path.resolve(__dirname, "../templateEmails/resetPassword.html"), 
      { encoding: "utf8" }
    );

    // Biên dịch template bằng handlebars
    const template = handlebars.compile(sourceHtml);

    // Tạo context để render vào template
    const context = {
      otpCode: token, // Mã xác thực OTP (token)
      resetLink: resetPasswordLink, // Đường link khôi phục mật khẩu
    };

    // Tạo HTML hoàn chỉnh từ template và dữ liệu context
    const resetPasswordHtml = template(context);

    // Cấu hình thông tin email
    const mailOptions = {
      from: process.env.MAIL_ACCOUNT, // Địa chỉ gửi
      to: email, // Địa chỉ người nhận
      subject: "Đặt lại mật khẩu", // Tiêu đề email
      text: "Đặt lại mật khẩu của bạn", // Nội dung fallback dạng text
      html: resetPasswordHtml, // Nội dung HTML render từ template
    };

    // Gửi email bằng transporter
    await transporter.sendMail(mailOptions);
  } catch (error) {
    // Nếu có lỗi, log ra và ném ra exception để xử lý phía ngoài
    console.error('Lỗi khi gửi email:', error);
    throw new Error('Không thể gửi email reset password.');
  }
};
