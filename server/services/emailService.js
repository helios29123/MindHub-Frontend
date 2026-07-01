const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: process.env.SMTP_PORT || 2525,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

const sendVerificationEmail = async (to, verificationLink) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'MindHub <noreply@mindhub.example.com>',
    to,
    subject: 'Xác minh địa chỉ Email của bạn - MindHub',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #111827; text-align: center;">MindHub</h2>
        <p style="color: #374151; font-size: 16px;">Xin chào,</p>
        <p style="color: #374151; font-size: 16px;">Bạn vừa yêu cầu xác minh email cho tài khoản của mình. Vui lòng bấm nút bên dưới để hoàn tất:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="background-color: #8b5e3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Xác minh Email</a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">Liên kết sẽ hết hạn sau ${process.env.OTP_EXPIRES_IN_MINUTES || 5} phút.</p>
        <p style="color: #6b7280; font-size: 14px;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail
};
