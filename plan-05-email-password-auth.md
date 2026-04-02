# Plan 05: Email Service & Auth Nâng cao

## Mục tiêu
- Gửi email tự động cho các sự kiện quan trọng (xác thực email, đặt lại mật khẩu, nhắc lịch phỏng vấn)
- Hệ thống xác thực tài khoản qua email
- Quên mật khẩu / Đặt lại mật khẩu
- Tạo thêm một trang OTP trong admin panel để nhận các OTP này

---

## Backend

### 1. Service `services/emailService.js`
```js
// Dùng nodemailer + SMTP (Gmail / SendGrid / Mailgun)
const sendEmail = async ({ to, subject, html }) => { ... }

const templates = {
  verifyEmail(user, token) { ... },
  resetPassword(user, token) { ... },
  interviewReminder(interview) { ... },
  applicationStatusChanged(application) { ... }
}
```

### 2. Model `User.js` — bổ sung
```js
emailVerified: { type: Boolean, default: false }
verificationToken: String
resetPasswordToken: String
resetPasswordExpires: Date
```

### 3. Auth Controllers — cập nhật

**`authController.js`:**
```js
// Đăng ký
register(req, res) {
  // Tạo user → gửi email xác thực
  const token = generateVerifyToken(user._id)
  await sendEmail({ to: user.email, template: 'verifyEmail', token })
  // Trả về { message: 'Vui lòng xác thực email' }
}

// Xác thực email
verifyEmail(req, res) {
  // Kiểm tra token → user.emailVerified = true
}

// Quên mật khẩu
forgotPassword(req, res) {
  // Tìm user theo email → gửi link reset
  const token = generateResetToken()
  await sendEmail({ to: user.email, template: 'resetPassword', token })
}

// Đặt lại mật khẩu
resetPassword(req, res) {
  // Kiểm tra token → cập nhật password
}
```

### 4. API Routes mới
```
POST /api/auth/register    → gửi email xác thực
GET  /api/auth/verify-email/:token
POST /api/auth/forgot-password
POST /api/auth/reset-password/:token
```

### 5. Cron Job — Nhắc lịch phỏng vấn
```js
// Chạy mỗi giờ: tìm interview trong 24h tới → gửi email nhắc nhở
cron.schedule('0 * * * *', async () => { ... })
```

---

## Frontend

### 1. Trang `pages/VerifyEmail.jsx` — `/verify-email`
- Hiển thị sau khi đăng ký thành công
- Thông báo "Đã gửi email xác thực"

### 2. Trang `pages/ForgotPassword.jsx` — `/forgot-password`
- Form nhập email
- Gửi yêu cầu reset

### 3. Trang `pages/ResetPassword.jsx` — `/reset-password/:token`
- Form đặt lại mật khẩu mới
- Validate password match

### 4. Cập nhật `pages/Login.jsx`
- Nếu email chưa xác thực → hiển thị thông báo
- Thêm link "Quên mật khẩu"

### 5. Cập nhật `pages/Register.jsx`
- Sau khi đăng ký → redirect `/verify-email`

### 6. Cập nhật Auth Context
- Kiểm tra `emailVerified` khi login

### 7. Cập nhật Admin Panel
- Tạo thêm một trang OTP để danh sách/tra cứu các mã OTP được hệ thống tạo ra để nhận trực tiếp từ admin panel

---

## Files cần tạo / sửa

| File | Hành động |
|------|-----------|
| `backend/src/models/User.js` | Cập nhật schema |
| `backend/src/services/emailService.js` | Tạo mới |
| `backend/src/controllers/authController.js` | Cập nhật |
| `backend/src/routes/auth.js` | Cập nhật |
| `backend/src/index.js` | Thêm cron job |
| `backend/.env.example` | Thêm email vars |
| `frontend/src/pages/VerifyEmail.jsx` | Tạo mới |
| `frontend/src/pages/ForgotPassword.jsx` | Tạo mới |
| `frontend/src/pages/ResetPassword.jsx` | Tạo mới |
| `frontend/src/pages/Login.jsx` | Cập nhật |
| `frontend/src/pages/Register.jsx` | Cập nhật |
| `frontend/src/pages/Admin/OTPManagement.jsx` (ví dụ) | Tạo mới |
| `frontend/src/api/index.js` | Thêm auth API |
| `frontend/src/App.jsx` | Thêm route |

---

## Thứ tự triển khai
1. Cài đặt nodemailer
2. Viết emailService + templates
3. Cập nhật User model + authController
4. Thêm route backend
5. Tạo ForgotPassword page
6. Tạo ResetPassword page
7. Tạo VerifyEmail page
8. Cập nhật Login + Register pages
9. Tạo thêm trang OTP trong Admin Panel
10. Thêm cron job nhắc phỏng vấn
