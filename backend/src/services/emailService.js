const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    // Nếu chưa cấu hình email trong .env, tiến hành log ra console để test (Mocking)
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('\n--- MOCK SENDING EMAIL ---');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`HTML: \n${html}`);
      console.log('--------------------------\n');
      return true;
    }

    const transporter = createTransporter();
    const mailOptions = {
      from: `"Recruitment App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };
    
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    return false; // Không ném lỗi để app không bị crash nếu cấu hình email sai
  }
};

const templates = {
  verifyEmail: (user, otp) => ({
    subject: 'Xác thực địa chỉ email',
    html: `
      <h2>Xin chào ${user.name},</h2>
      <p>Cảm ơn bạn đã tham gia nền tảng của chúng tôi. Mã OTP xác thực email của bạn là:</p>
      <h3 style="color: blue; letter-spacing: 5px; font-size: 24px;">${otp}</h3>
      <p>Mã này có hiệu lực trong vòng 10 phút.</p>
    `
  }),
  resetPassword: (user, otp) => ({
    subject: 'Yêu cầu đặt lại mật khẩu',
    html: `
      <h2>Xin chào ${user.name},</h2>
      <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu từ bạn. Mã OTP để đặt lại mật khẩu của bạn là:</p>
      <h3 style="color: red; letter-spacing: 5px; font-size: 24px;">${otp}</h3>
      <p>Mã này có hiệu lực trong vòng 10 phút. Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
    `
  }),
  interviewReminder: (interview, candidate, job) => ({
    subject: `Nhắc nhở lịch phỏng vấn: ${job.title}`,
    html: `
      <h2>Xin chào ${candidate.name},</h2>
      <p>Chúng tôi xin nhắc lại về lịch phỏng vấn sắp tới cho vị trí <strong>${job.title}</strong>.</p>
      <p><strong>Thời gian:</strong> ${new Date(interview.scheduledDate).toLocaleString('vi-VN')}</p>
      <p><strong>Vui lòng kiểm tra lại hệ thống để xem chi tiết địa điểm hoặc đường dẫn (link) họp trực tuyến.</strong></p>
      <p>Chúc bạn phỏng vấn thành công!</p>
    `
  })
};

module.exports = {
  sendEmail,
  templates
};
