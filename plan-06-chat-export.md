# Plan 06: Chat & Export Dữ liệu

## Mục tiêu
- Nhắn tin trực tiếp giữa ứng viên và nhà tuyển dụng
- Xuất dữ liệu (CSV/Excel) cho nhà tuyển dụng quản lý ứng viên

---

## Backend

### 1. Model `Conversation.js`
```js
{
  participants: [ObjectId],   // [candidateId, employerId]
  job: ObjectId,               // job liên quan (optional)
  lastMessage: String,
  lastMessageAt: Date,
  createdAt: Date
}
```

### 2. Model `Message.js`
```js
{
  conversation: ObjectId,
  sender: ObjectId,
  content: String,
  isRead: { type: Boolean, default: false },
  createdAt: Date
}
```

### 3. Chat Controllers

**`chatController.js`:**
```js
getConversations(userId)        // Danh sách cuộc trò chuyện
getMessages(conversationId)     // Tin nhắn trong cuộc trò chuyện
sendMessage(conversationId, senderId, content)
markAsRead(conversationId, userId)
getOrCreateConversation(candidateId, employerId, jobId)
```

### 4. Chat Routes
```
GET  /api/conversations
POST /api/conversations
GET  /api/conversations/:id/messages
POST /api/messages
PUT  /api/conversations/:id/read
```

### 5. Export Service

**`services/exportService.js`:**
```js
exportApplications(jobId, format)  // CSV/Excel danh sách ứng viên
exportAllJobs(employerId, format)
```

---

## Frontend

### 1. Trang `pages/Chat.jsx` — `/chat`
- Sidebar: danh sách cuộc trò chuyện
- Main: khung chat với tin nhắn
- Input gửi tin nhắn

### 2. Trang `pages/employer/ExportData.jsx` — `/employer/export`
- Chọn loại: danh sách ứng viên / danh sách job
- Chọn job (nếu export ứng viên)
- Chọn định dạng: CSV / Excel
- Nút xuất file

### 3. Component `components/ChatBubble.jsx`
- Hiển thị tin nhắn (bên trái: người nhận, bên phải: người gửi)

### 4. Cập nhật `EmployerApplications.jsx`
- Thêm nút "Nhắn tin" và "Xuất CSV" trên mỗi ứng viên

---

## Files cần tạo / sửa

| File | Hành động |
|------|-----------|
| `backend/src/models/Conversation.js` | Tạo mới |
| `backend/src/models/Message.js` | Tạo mới |
| `backend/src/controllers/chatController.js` | Tạo mới |
| `backend/src/routes/chat.js` | Tạo mới |
| `backend/src/services/exportService.js` | Tạo mới |
| `backend/src/index.js` | Đăng ký route |
| `frontend/src/pages/Chat.jsx` | Tạo mới |
| `frontend/src/pages/employer/ExportData.jsx` | Tạo mới |
| `frontend/src/components/ChatBubble.jsx` | Tạo mới |
| `frontend/src/api/index.js` | Thêm chat + export API |
| `frontend/src/App.jsx` | Thêm route |

---

## Thứ tự triển khai
1. Tạo Conversation + Message models
2. Viết chatController + chat routes
3. Viết exportService
4. Thêm route backend
5. Tạo ChatBubble component
6. Tạo Chat page (sidebar + main)
7. Tạo ExportData page
8. Cập nhật EmployerApplications với nút chat/export
9. Cập nhật Navbar thêm icon Chat
