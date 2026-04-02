# Plan 04: Admin Panel

## Mục tiêu
Trang quản trị hệ thống dành cho Admin quản lý toàn bộ hoạt động của nền tảng tuyển dụng.

---

## Backend

### 1. Model `Admin.js` (dùng chung User.js với role: 'admin')
- Giữ nguyên User model, thêm role: `['candidate', 'employer', 'admin']`

### 2. Middleware `middleware/adminOnly.js`
```js
// Chỉ cho phép role='admin' truy cập
if (req.user.role !== 'admin')
  return res.status(403).json({ message: 'Admin only' })
```

### 3. Admin Controllers

**`adminController.js`:**
```js
// Dashboard tổng quan
getDashboard()       // Tổng số user, job, application, interview

// Quản lý user
getUsers(query)      // Danh sách user (filter: role, search)
updateUser(id, data) // Cập nhật trạng thái user (khóa/mở)
deleteUser(id)       // Xóa user

// Quản lý job
getAllJobs(query)     // Tất cả job (filter: status, employer)
approveJob(id)       // Duyệt job
rejectJob(id, reason)// Từ chối job

// Quản lý báo cáo
getReports()         // Thống kê nâng cao
```

### 4. API Routes
```
GET  /api/admin/dashboard
GET  /api/admin/users
PUT  /api/admin/users/:id
DELETE /api/admin/users/:id
GET  /api/admin/jobs
PUT  /api/admin/jobs/:id/approve
PUT  /api/admin/jobs/:id/reject
GET  /api/admin/reports
```

---

## Frontend

### 1. Layout `components/AdminLayout.jsx`
- Sidebar điều hướng admin
- Header với avatar admin
- Các section: Dashboard, Users, Jobs, Reports

### 2. Trang `pages/admin/AdminDashboard.jsx` — `/admin`
- Thống kê tổng quan (cards: user, jobs, applications, interviews)
- Biểu đồ: số job theo tháng, số ứng viên theo tháng
- Top công ty đăng nhiều job nhất
- Job chờ duyệt gần đây

### 3. Trang `pages/admin/AdminUsers.jsx` — `/admin/users`
- Bảng danh sách user (phân trang)
- Filter: role, trạng thái
- Search theo email/tên
- Hành động: khóa/mở tài khoản, xóa

### 4. Trang `pages/admin/AdminJobs.jsx` — `/admin/jobs`
- Bảng tất cả job (phân trang)
- Filter: đã duyệt/chưa duyệt/bị từ chối
- Hành động: duyệt, từ chối, xóa

### 5. Trang `pages/admin/AdminReports.jsx` — `/admin/reports`
- Biểu đồ thống kê nâng cao (Recharts)
- Tỷ lệ ứng viên theo ngành
- Xu hướng tuyển dụng theo thời gian

### 6. Route Protection
- Redirect `/admin/*` về `/login` nếu không phải admin

---

## Files cần tạo / sửa

| File | Hành động |
|------|-----------|
| `backend/src/middleware/adminOnly.js` | Tạo mới |
| `backend/src/controllers/adminController.js` | Tạo mới |
| `backend/src/routes/admin.js` | Tạo mới |
| `backend/src/index.js` | Đăng ký route |
| `frontend/src/components/AdminLayout.jsx` | Tạo mới |
| `frontend/src/pages/admin/AdminDashboard.jsx` | Tạo mới |
| `frontend/src/pages/admin/AdminUsers.jsx` | Tạo mới |
| `frontend/src/pages/admin/AdminJobs.jsx` | Tạo mới |
| `frontend/src/pages/admin/AdminReports.jsx` | Tạo mới |
| `frontend/src/App.jsx` | Thêm route + AdminLayout |
| `frontend/src/api/index.js` | Thêm admin API |

---

## Thứ tự triển khai
1. Tạo adminOnly middleware
2. Viết adminController
3. Thêm route backend
4. Tạo AdminLayout
5. Tạo AdminDashboard
6. Tạo AdminUsers
7. Tạo AdminJobs
8. Tạo AdminReports
9. Cập nhật App.jsx router + protection
