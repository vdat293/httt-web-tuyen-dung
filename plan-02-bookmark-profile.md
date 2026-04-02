# Plan 02: Bookmark & Quản lý Hồ sơ

## Mục tiêu
- Ứng viên lưu việc làm yêu thích
- Ứng viên cập nhật hồ sơ cá nhân (thông tin, avatar, kỹ năng)
- Nhà tuyển dụng cập nhật hồ sơ công ty (logo, mô tả, địa chỉ)

---

## Backend

### 1. Model `SavedJob.js` (mới)
```js
{
  user: ObjectId (ref: User),
  job: ObjectId (ref: Job),
  savedAt: { type: Date, default: Date.now }
}
// unique: [user, job]
```

### 2. Model `User.js` — bổ sung fields
```js
{
  // candidate
  phone: String,
  avatar: String,
  skills: [String],
  experience: String,
  education: String,
  bio: String,
  resumeUrl: String,

  // employer
  companyName: String,
  companyLogo: String,
  companySize: String,
  industry: String,
  website: String,
  description: String
}
```

### 3. API Routes

**Bookmark:**
- `GET /api/saved-jobs` — Danh sách job đã lưu (ứng viên)
- `POST /api/saved-jobs/:jobId` — Lưu job
- `DELETE /api/saved-jobs/:jobId` — Bỏ lưu
- `GET /api/jobs/:id/is-saved` — Kiểm tra đã lưu chưa

**Profile:**
- `GET /api/profile` — Lấy thông tin profile
- `PUT /api/profile` — Cập nhật profile
- `POST /api/profile/avatar` — Upload avatar (Multer)
- `PUT /api/profile/password` — Đổi mật khẩu

### 4. Controllers & Routes
- `controllers/savedJobController.js`
- `controllers/profileController.js`
- `routes/savedJobs.js`
- `routes/profile.js`

---

## Frontend

### 1. Trang `pages/candidate/CandidateSavedJobs.jsx` — `/saved-jobs`
- Danh sách job đã lưu (dùng lại JobCard)
- Nút bỏ lưu trên mỗi card

### 2. Trang `pages/candidate/CandidateProfile.jsx` — `/profile`
- Form cập nhật thông tin cá nhân
- Upload avatar
- Danh sách kỹ năng (tag input)
- Preview resume

### 3. Trang `pages/employer/CompanyProfile.jsx` — `/company-profile`
- Form cập nhật thông tin công ty
- Upload logo công ty

### 4. Component `components/SaveJobButton.jsx`
- Nút bookmark (toggle), dùng lại ở JobCard và JobDetail

### 5. Cập nhật API `frontend/src/api/index.js`
```js
getSavedJobs(), saveJob(id), unsaveJob(id)
getProfile(), updateProfile(data), uploadAvatar(file)
updatePassword(oldPw, newPw)
```

---

## Files cần tạo / sửa

| File | Hành động |
|------|-----------|
| `backend/src/models/SavedJob.js` | Tạo mới |
| `backend/src/models/User.js` | Cập nhật schema |
| `backend/src/controllers/savedJobController.js` | Tạo mới |
| `backend/src/controllers/profileController.js` | Tạo mới |
| `backend/src/routes/savedJobs.js` | Tạo mới |
| `backend/src/routes/profile.js` | Tạo mới |
| `backend/src/index.js` | Đăng ký route mới |
| `frontend/src/pages/candidate/CandidateSavedJobs.jsx` | Tạo mới |
| `frontend/src/pages/candidate/CandidateProfile.jsx` | Tạo mới |
| `frontend/src/pages/employer/CompanyProfile.jsx` | Tạo mới |
| `frontend/src/components/SaveJobButton.jsx` | Tạo mới |
| `frontend/src/api/index.js` | Cập nhật |
| `frontend/src/App.jsx` | Thêm route |
| `frontend/src/components/Navbar.jsx` | Thêm menu profile |

---

## Thứ tự triển khai
1. Tạo SavedJob model
2. Cập nhật User model
3. Viết savedJobController + profileController
4. Thêm route backend
5. Tạo SaveJobButton component
6. Tạo CandidateSavedJobs page
7. Tạo CandidateProfile page
8. Tạo CompanyProfile page
9. Cập nhật App.jsx + Navbar
