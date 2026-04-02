# Plan 03: Thông báo & Real-time

## Mục tiêu
- Hệ thống thông báo trong app cho ứng viên & nhà tuyển dụng
- Thông báo real-time khi có sự kiện (trạng thái ứng tuyển, lịch phỏng vấn, tin nhắn mới)

---

## Backend

### 1. Model `Notification.js`
```js
{
  user: ObjectId (ref: User),
  type: [
    'application_received',
    'application_status_changed',
    'interview_scheduled',
    'interview_reminder',
    'new_message',
    'job_approved'
  ],
  title: String,
  message: String,
  data: Mixed,          // { jobId, applicationId, interviewId, ... }
  isRead: { type: Boolean, default: false },
  createdAt: Date
}
```

### 2. Trigger thông báo ở các controller

**applicationController.js:**
```js
// Khi ứng viên nộp đơn → thông báo cho employer
createNotification({
  user: job.employer,
  type: 'application_received',
  title: 'Đơn ứng tuyển mới',
  message: `${candidate.name} đã ứng tuyển ${job.title}`,
  data: { jobId, applicationId }
})
```

**interviewController.js:**
```js
// Khi lên lịch phỏng vấn → thông báo cho candidate
createNotification({
  user: candidate,
  type: 'interview_scheduled',
  title: 'Lịch phỏng vấn mới',
  message: `Bạn có lịch phỏng vấn ${job.title} vào ${time}`,
  data: { interviewId }
})
```

### 3. API Routes

- `GET /api/notifications` — Danh sách thông báo (phân trang, filter isRead)
- `PUT /api/notifications/:id/read` — Đánh dấu đã đọc 1 thông báo
- `PUT /api/notifications/read-all` — Đánh dấu đã đọc tất cả
- `DELETE /api/notifications/:id` — Xóa thông báo
- `GET /api/notifications/unread-count` — Số thông báo chưa đọc

### 4. Real-time (Socket.io)
```js
// Khi tạo notification → emit socket
io.to(userId).emit('new_notification', notification)
```

---

## Frontend

### 1. Socket Context `contexts/SocketContext.jsx`
- Kết nối Socket.io khi đăng nhập
- Lắng nghe sự kiện `new_notification`
- Cập nhật số badge thông báo

### 2. Component `components/NotificationDropdown.jsx`
- Dropdown trên Navbar (icon chuông + badge số)
- Danh sách thông báo gần đây
- Click → điều hướng + đánh dấu đã đọc

### 3. Trang `pages/Notifications.jsx` — `/notifications`
- Toàn bộ danh sách thông báo
- Filter: Tất cả / Chưa đọc
- Phân trang
- Nút "Đánh dấu đã đọc tất cả"

### 4. Cập nhật Pages có liên quan
- `JobDetail.jsx` — bookmark button (Plan 02)
- `CandidateApplications.jsx` — thông báo khi có cập nhật
- `EmployerInterviews.jsx` — thông báo khi tạo interview

---

## Files cần tạo / sửa

| File | Hành động |
|------|-----------|
| `backend/src/models/Notification.js` | Tạo mới |
| `backend/src/controllers/notificationController.js` | Tạo mới |
| `backend/src/routes/notifications.js` | Tạo mới |
| `backend/src/index.js` | Socket.io setup + notification triggers |
| `frontend/src/contexts/SocketContext.jsx` | Tạo mới |
| `frontend/src/components/NotificationDropdown.jsx` | Tạo mới |
| `frontend/src/pages/Notifications.jsx` | Tạo mới |
| `frontend/src/App.jsx` | Thêm route |
| `frontend/src/api/index.js` | Thêm notification API |

---

## Thứ tự triển khai
1. Tạo Notification model
2. Viết notificationController + routes
3. Cập nhật application/interview controller (thêm trigger)
4. Cài đặt Socket.io backend + frontend
5. Tạo SocketContext
6. Tạo NotificationDropdown component
7. Tạo Notifications page
8. Cập nhật Navbar
