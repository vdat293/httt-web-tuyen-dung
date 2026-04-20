import { useState, useEffect, useRef } from 'react';
import { profileAPI } from '../../api';
import Layout from '../../components/Layout';
import { useToast } from '../../components/Toast';

const EXPERIENCE_OPTIONS = [
  'Chưa có kinh nghiệm',
  'Dưới 1 năm',
  '1 năm',
  '2 năm',
  '3 năm',
  '4 năm',
  '5 năm',
  'Trên 5 năm',
];

export default function CandidateProfile() {
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const resumeInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    avatar: '',
    skills: [],
    experience: '',
    education: '',
    bio: '',
    resumeUrl: '',
  });
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const { data } = await profileAPI.get();
      setForm({
        name: data.name || '',
        phone: data.phone || '',
        avatar: data.avatar || '',
        skills: data.skills || [],
        experience: data.experience || '',
        education: data.education || '',
        bio: data.bio || '',
        resumeUrl: data.resumeUrl || '',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const { data } = await profileAPI.uploadAvatar(fd);
      setForm((prev) => ({ ...prev, avatar: data.avatar }));
      addToast('Cập nhật avatar thành công', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Upload avatar thất bại', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleResumeChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(ext)) {
      return addToast('Chỉ chấp nhận file PDF hoặc Word (.doc, .docx)', 'error');
    }
    if (file.size > 5 * 1024 * 1024) {
      return addToast('Kích thước file tối đa là 5MB', 'error');
    }

    setUploadingResume(true);
    try {
      const fd = new FormData();
      fd.append('resume', file);
      const { data } = await profileAPI.uploadResume(fd);
      setForm((prev) => ({ ...prev, resumeUrl: data.resumeUrl }));
      addToast('Tải lên CV thành công!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Tải lên CV thất bại', 'error');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed || form.skills.includes(trimmed)) return;
    setForm((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
    setSkillInput('');
  };

  const handleRemoveSkill = (skill) => {
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await profileAPI.update(form);
      // Update localStorage user
      const stored = localStorage.getItem('user');
      if (stored) {
        const user = JSON.parse(stored);
        localStorage.setItem('user', JSON.stringify({ ...user, name: data.name, avatar: data.avatar }));
      }
      addToast('Cập nhật hồ sơ thành công', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Cập nhật thất bại', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-5">
        <h1 className="section-title">Hồ sơ cá nhân</h1>

        {/* Avatar */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-heading mb-4">Ảnh đại diện</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-brand-100 overflow-hidden flex items-center justify-center border-2 border-line">
                {form.avatar ? (
                  <img src={form.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-brand-500 font-bold text-2xl">
                    {form.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                )}
              </div>
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="btn-outline !py-1.5 !px-4 text-sm"
              >
                Đổi ảnh
              </button>
              <p className="text-xs text-meta mt-1">JPG, PNG, GIF — tối đa 5MB</p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-heading">Thông tin cơ bản</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-meta mb-1.5">Họ tên</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input"
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-meta mb-1.5">Số điện thoại</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="input"
                placeholder="0xxx xxx xxx"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-meta mb-1.5">Giới thiệu bản thân</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              className="input resize-none"
              placeholder="Mô tả ngắn về bản thân..."
            />
          </div>
        </div>

        {/* Skills */}
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-heading">Kỹ năng</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {form.skills.map((skill) => (
              <span
                key={skill}
                className="tag tag-blue flex items-center gap-1 pr-1"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-1 w-4 h-4 rounded-full bg-blue-200 text-blue-700 hover:bg-blue-300 flex items-center justify-center text-[10px] font-bold leading-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
              className="input flex-1"
              placeholder="Nhập kỹ năng và nhấn Enter (ví dụ: JavaScript, React...)"
            />
            <button type="button" onClick={handleAddSkill} className="btn-outline !py-2 !px-4 text-sm">
              Thêm
            </button>
          </div>
        </div>

        {/* Experience & Education */}
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-heading">Kinh nghiệm &amp; Học vấn</h2>
          <div>
            <label className="block text-xs font-medium text-meta mb-1.5">Kinh nghiệm làm việc</label>
            <select
              name="experience"
              value={form.experience}
              onChange={handleChange}
              className="input"
            >
              <option value="">Chọn mức kinh nghiệm</option>
              {EXPERIENCE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-meta mb-1.5">Học vấn</label>
            <input
              name="education"
              value={form.education}
              onChange={handleChange}
              className="input"
              placeholder="Ví dụ: Đại học Bách Khoa, chuyên ngành CNTT"
            />
          </div>
        </div>

        {/* Resume */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-heading mb-4">CV / Sơ yếu lý lịch</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                ref={resumeInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => resumeInputRef.current?.click()}
                disabled={uploadingResume}
                className="btn-primary !py-2 !px-5 text-sm flex items-center gap-2"
              >
                {uploadingResume ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                )}
                {form.resumeUrl ? 'Tải lên bản CV khác' : 'Tải lên CV (PDF, DOC)'}
              </button>
              <p className="text-xs text-meta">Định dạng PDF, Word — tối đa 5MB</p>
            </div>

            {form.resumeUrl && (
              <div className="flex items-center gap-3 p-3 bg-bgSection rounded-lg border border-line">
                <div className="w-10 h-10 rounded bg-white border border-line flex items-center justify-center text-brand-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-heading truncate">CV hiện tại</p>
                  <p className="text-[11px] text-meta truncate">{form.resumeUrl.split('-').pop()}</p>
                </div>
                <a
                  href={form.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost !py-1 !px-3 text-[11px]"
                >
                  Xem chi tiết
                </a>
              </div>
            )}

            {!form.resumeUrl && (
              <div className="p-4 border-2 border-dashed border-line rounded-lg text-center bg-bgLight">
                <p className="text-xs text-meta">Bạn chưa có CV trong hồ sơ. Hãy tải lên để có thể ứng tuyển nhanh chóng.</p>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary min-w-[140px]">
            {saving ? 'Đang lưu...' : 'Lưu hồ sơ'}
          </button>
        </div>
      </form>
    </Layout>
  );
}
