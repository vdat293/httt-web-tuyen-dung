# Ứng dụng Web Quản lý Tuyển dụng Nhân sự

Ứng dụng kết nối **nhà tuyển dụng** và **ứng viên**, tích hợp LLM (Google Gemini) để parse CV tự động.

## Tech Stack

- **Frontend**: React (Vite) + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **CV Parsing**: Google Gemini 1.5 Flash
- **Auth**: JWT + bcrypt

## Tính năng

### Nhà tuyển dụng
- Đăng ký / Đăng nhập
- Tạo, sửa, xóa tin tuyển dụng
- Xem danh sách ứng viên ứng tuyển
- Parse CV tự động (trích xuất skills, experience, education)
- Lọc ứng viên theo kỹ năng
- Cập nhật trạng thái hồ sơ (Duyệt/Loại)
- Lên lịch phỏng vấn
- Cập nhật kết quả phỏng vấn
- Xem báo cáo thống kê

### Ứng viên
- Đăng ký / Đăng nhập
- Tìm kiếm việc làm theo tên, địa điểm
- Ứng tuyển (upload CV + parse tự động)
- Theo dõi đơn ứng tuyển
- Xem lịch phỏng vấn & kết quả

## Cấu trúc thư mục

```
recruitment-app/
├── backend/
│   ├── src/
│   │   ├── config/         # Kết nối DB
│   │   ├── controllers/    # Logic xử lý
│   │   ├── middleware/     # Auth, upload, error
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # API routes
│   │   ├── services/      # LLM CV parsing
│   │   ├── index.js       # Entry point
│   │   └── seed.js        # Mock data
│   └── uploads/           # File CV tạm
├── frontend/
│   └── src/
│       ├── api/           # Gọi API
│       ├── components/    # UI components
│       ├── contexts/      # Auth context
│       ├── hooks/         # Custom hooks
│       ├── pages/         # Trang chính
│       ├── App.jsx        # Router
│       └── main.jsx
└── README.md
```

## Hướng dẫn cài đặt

### 1. Yêu cầu

- Node.js 18+
- MongoDB (local hoặc Atlas)
- Gemini API Key (miễn phí, limit cao - đăng ký tại aistudio.google.com)

### 2. Backend

```bash
cd backend
cp .env.example .env
# Chỉnh sửa .env:
#   MONGO_URI=mongodb://localhost:27017/recruitment_db
#   JWT_SECRET=your_secret_key
#   GEMINI_API_KEY=your_gemini_key

npm install
npm run dev       # Chạy dev server (port 5000)
npm run seed      # Tạo dữ liệu mẫu
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev       # Chạy dev server (port 3000)
```

### 4. Mở trình duyệt

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## Tài khoản test (sau khi chạy seed)

| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| Nhà tuyển dụng | employer@example.com | password123 |
| Ứng viên 1 | candidate1@example.com | password123 |
| Ứng viên 2 | candidate2@example.com | password123 |

## API Endpoints

### Auth
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập → JWT
- `GET /api/auth/me` - Lấy thông tin user

### Jobs
- `GET /api/jobs` - Danh sách tin (filter: title, location, skills)
- `GET /api/jobs/:id` - Chi tiết tin
- `POST /api/jobs` - Tạo tin (employer)
- `PUT /api/jobs/:id` - Sửa tin (employer)
- `DELETE /api/jobs/:id` - Xóa tin (employer)
- `GET /api/jobs/my-jobs` - Tin của employer hiện tại

### Applications
- `GET /api/applications` - DS ứng viên
- `POST /api/applications` - Nộp đơn + upload CV + parse
- `PUT /api/applications/:id/status` - Cập nhật trạng thái

### Interviews
- `GET /api/interviews` - DS lịch phỏng vấn
- `POST /api/interviews` - Tạo lịch (employer)
- `PUT /api/interviews/:id` - Cập nhật lịch/kết quả

### Reports
- `GET /api/reports/stats` - Thống kê tổng quan
- `GET /api/reports/jobs/:id` - Thống kê theo tin
