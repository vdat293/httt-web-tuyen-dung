import { useState, useEffect, useRef, useMemo } from 'react';
import { profileAPI } from '../../api';
import Layout from '../../components/Layout';
import { useToast } from '../../components/Toast';

const EXP_OPTIONS = [
  'Chưa có kinh nghiệm', 'Dưới 1 năm', '1 năm', '2 năm',
  '3 năm', '4 năm', '5 năm', 'Trên 5 năm',
];

const SKILL_SUGGESTIONS = [
  'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'TypeScript',
  'SQL', 'MongoDB', 'Git', 'Docker', 'AWS', 'CSS/HTML',
  'Vue.js', 'Angular', 'PHP', 'C#', '.NET', 'Flutter',
];

export default function CandidateProfile() {
  const { addToast } = useToast();
  const avatarRef = useRef(null);
  const resumeRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [form, setForm] = useState({
    name: '', phone: '', avatar: '', skills: [],
    experience: '', education: '', bio: '', resumeUrl: '',
  });
  const [skillInput, setSkillInput] = useState('');

  const completion = useMemo(() => {
    const f = [form.name, form.phone, form.avatar, form.skills.length > 0, form.experience, form.education, form.bio, form.resumeUrl];
    return Math.round((f.filter(Boolean).length / f.length) * 100);
  }, [form]);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const { data } = await profileAPI.get();
      setForm({
        name: data.name || '', phone: data.phone || '', avatar: data.avatar || '',
        skills: data.skills || [], experience: data.experience || '',
        education: data.education || '', bio: data.bio || '', resumeUrl: data.resumeUrl || '',
      });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const fd = new FormData(); fd.append('avatar', file);
      const { data } = await profileAPI.uploadAvatar(fd);
      setForm(p => ({ ...p, avatar: data.avatar }));
      // Update local storage
      const stored = localStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        localStorage.setItem('user', JSON.stringify({ ...u, avatar: data.avatar }));
      }
      addToast('Cập nhật ảnh đại diện thành công', 'success');
    } catch (err) { addToast(err.response?.data?.message || 'Lỗi', 'error'); }
    finally { setUploadingAvatar(false); }
  };

  const handleResume = async (file) => {
    if (!file) return;
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.pdf', '.doc', '.docx'].includes(ext)) return addToast('Chỉ chấp nhận PDF/Word', 'error');
    if (file.size > 5 * 1024 * 1024) return addToast('Tối đa 5MB', 'error');
    setUploadingResume(true);
    try {
      const fd = new FormData(); fd.append('resume', file);
      const { data } = await profileAPI.uploadResume(fd);
      setForm(p => ({ ...p, resumeUrl: data.resumeUrl }));
      addToast('Tải CV thành công!', 'success');
    } catch (err) { addToast(err.response?.data?.message || 'Lỗi', 'error'); }
    finally { setUploadingResume(false); }
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || form.skills.includes(s)) return;
    setForm(p => ({ ...p, skills: [...p.skills, s] }));
    setSkillInput('');
  };

  const toggleSkill = (s) => {
    setForm(p => ({ ...p, skills: p.skills.includes(s) ? p.skills.filter(x => x !== s) : [...p.skills, s] }));
  };

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await profileAPI.update(form);
      const stored = localStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        localStorage.setItem('user', JSON.stringify({ ...u, name: data.name, avatar: data.avatar }));
      }
      addToast('Cập nhật hồ sơ cá nhân thành công!', 'success');
    } catch (err) { addToast(err.response?.data?.message || 'Lỗi', 'error'); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto animate-pulse space-y-6">
          <div className="h-48 bg-gray-200 rounded-2xl"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
        </div>
      </Layout>
    );
  }

  const initial = form.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <Layout>
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto pb-24">

        {/* ═══ Hero Card ═══ */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)',
          borderRadius: '20px',
          overflow: 'hidden',
          marginBottom: '28px',
          position: 'relative',
          padding: '40px 36px 40px 36px',
        }}>
          {/* Decorative elements */}
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }}></div>
          <div style={{ position: 'absolute', bottom: '-20px', left: '10%', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '28px', position: 'relative', zIndex: 1 }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: '100px', height: '100px',
                borderRadius: '50%',
                background: '#fff',
                border: '4px solid rgba(255,255,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              }}>
                {form.avatar ? (
                  <img src={form.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '36px', fontWeight: 800, color: '#3b82f6' }}>{initial}</span>
                )}
                {uploadingAvatar && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => avatarRef.current?.click()}
                disabled={uploadingAvatar}
                style={{
                  position: 'absolute', bottom: '4px', right: '4px',
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: '#fff', border: '1.5px solid #e5e7eb',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  transition: 'all 0.2s',
                }}
                className="hover:scale-110 active:scale-95"
                title="Thay đổi ảnh đại diện"
              >
                <svg style={{ width: '16px', height: '16px', color: '#64748b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </div>

            {/* Title Info */}
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>{form.name || 'Hồ sơ cá nhân'}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '100px' }}>
                  Ứng viên
                </span>
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {form.phone || 'Chưa cập nhật SĐT'}
                </span>
              </div>
            </div>

            {/* Completion */}
            <div style={{ flexShrink: 0, textAlign: 'center' }}>
              <div style={{ position: 'relative', width: '64px', height: '64px', margin: '0 auto 8px' }}>
                <svg style={{ width: '64px', height: '64px', transform: 'rotate(-90deg)' }} viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                  <circle
                    cx="32" cy="32" r="28" fill="none"
                    stroke={completion >= 80 ? '#4ade80' : completion >= 50 ? '#fbbf24' : '#f87171'}
                    strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${(completion / 100) * 175.9} 175.9`}
                    style={{ transition: 'stroke-dasharray 1s ease' }}
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 800, color: '#fff' }}>
                  {completion}%
                </div>
              </div>
              <p style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Hoàn thiện</p>
            </div>
          </div>
        </div>

        {/* ═══ Single Column Sections ═══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Section: Thông tin cá nhân */}
          <div className="bg-white rounded-xl border border-line overflow-hidden shadow-sm">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 24px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecf2ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>Thông tin cá nhân</h2>
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>Dùng để hiển thị cho nhà tuyển dụng</p>
              </div>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Họ tên <span style={{ color: '#ef4444' }}>*</span></label>
                  <input name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="Nguyễn Văn A" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Số điện thoại</label>
                  <input name="phone" value={form.phone} onChange={handleChange} className="input-field" placeholder="0xxx xxx xxx" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Giới thiệu bản thân</label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={4}
                  className="input-field"
                  style={{ resize: 'none' }}
                  placeholder="Mô tả ngắn gọn về bản thân, mục tiêu nghề nghiệp..."
                />
                <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right', marginTop: '6px' }}>{form.bio.length}/500 ký tự</div>
              </div>
            </div>
          </div>

          {/* Section: Kỹ năng chuyên môn */}
          <div className="bg-white rounded-xl border border-line overflow-hidden shadow-sm">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 24px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>Kỹ năng chuyên môn</h2>
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>Giúp nhà tuyển dụng tìm thấy bạn dễ dàng hơn</p>
              </div>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {form.skills.map(s => (
                  <div key={s} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px', borderRadius: '8px',
                    background: '#f1f5f9', color: '#334155',
                    fontSize: '13px', fontWeight: 500,
                  }}>
                    {s}
                    <button type="button" onClick={() => toggleSkill(s)} style={{ color: '#94a3b8', hover: { color: '#ef4444' } }} className="hover:text-red-500">
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" /></svg>
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); }}}
                  className="input-field"
                  placeholder="Nhập kỹ năng và nhấn Enter (VD: Java, Marketing...)"
                />
                <button type="button" onClick={addSkill} style={{
                  padding: '0 20px', borderRadius: '10px',
                  background: '#f1f5f9', color: '#475569',
                  fontWeight: 600, fontSize: '13px',
                }} className="hover:bg-gray-200">
                  Thêm
                </button>
              </div>

              <div style={{ marginTop: '20px' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '10px' }}>💡 Gợi ý cho bạn:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {SKILL_SUGGESTIONS.map(s => (
                    <button
                      key={s} type="button" onClick={() => toggleSkill(s)}
                      style={{
                        padding: '6px 12px', borderRadius: '8px',
                        fontSize: '12px', fontWeight: 500,
                        border: '1px solid',
                        borderColor: form.skills.includes(s) ? '#8b5cf6' : '#e2e8f0',
                        background: form.skills.includes(s) ? '#f5f3ff' : '#fff',
                        color: form.skills.includes(s) ? '#8b5cf6' : '#64748b',
                        transition: 'all 0.2s',
                      }}
                    >
                      {form.skills.includes(s) ? '✓ ' : '+ '} {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Kinh nghiệm & Học vấn */}
          <div className="bg-white rounded-xl border border-line overflow-hidden shadow-sm">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 24px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>Kinh nghiệm & Học vấn</h2>
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>Giúp nhà tuyển dụng hiểu rõ về năng lực của bạn</p>
              </div>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '12px' }}>Kinh nghiệm làm việc</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {EXP_OPTIONS.map(o => (
                    <button
                      key={o} type="button" onClick={() => setForm(p => ({ ...p, experience: o }))}
                      style={{
                        padding: '10px 16px', borderRadius: '10px',
                        fontSize: '13px', fontWeight: 500,
                        border: '1.5px solid',
                        borderColor: form.experience === o ? '#d97706' : '#e2e8f0',
                        background: form.experience === o ? '#fffbeb' : '#fff',
                        color: form.experience === o ? '#d97706' : '#64748b',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                      }}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Học vấn cao nhất</label>
                <input name="education" value={form.education} onChange={handleChange} className="input-field" placeholder="VD: Đại học Bách Khoa - Chuyên ngành CNTT" />
              </div>
            </div>
          </div>

          {/* Section: CV / Hồ sơ */}
          <div className="bg-white rounded-xl border border-line overflow-hidden shadow-sm">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 24px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>CV / Hồ sơ đính kèm</h2>
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>Ít nhất một bản CV để có thể ứng tuyển</p>
              </div>
            </div>
            <div style={{ padding: '24px' }}>
              {form.resumeUrl && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '16px 20px', borderRadius: '12px',
                  background: '#f8fafc', border: '1px solid #e2e8f0',
                  marginBottom: '20px',
                }}>
                  <div style={{ fontSize: '32px' }}>📄</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>Hồ sơ hiện tại</p>
                    <p style={{ fontSize: '12px', color: '#64748b' }}>Đã được tải lên hệ thống</p>
                  </div>
                  <a href={form.resumeUrl} target="_blank" rel="noreferrer" style={{
                    padding: '8px 16px', borderRadius: '8px',
                    background: '#fff', border: '1px solid #e2e8f0',
                    color: '#3b82f6', fontSize: '13px', fontWeight: 600,
                  }}>
                    Xem CV ↗
                  </a>
                </div>
              )}

              <input ref={resumeRef} type="file" accept=".pdf,.doc,.docx" onChange={e => handleResume(e.target.files[0])} className="hidden" />
              <div
                onDragEnter={e => { e.preventDefault(); setDragOver(true); }}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleResume(e.dataTransfer.files[0]); }}
                onClick={() => !uploadingResume && resumeRef.current?.click()}
                style={{
                  border: '2px dashed',
                  borderColor: dragOver ? '#3b82f6' : '#cbd5e1',
                  background: dragOver ? '#eff6ff' : '#fafafa',
                  borderRadius: '16px',
                  padding: '40px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {uploadingResume ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#64748b' }}>Đang tải tập tin lên...</p>
                  </div>
                ) : (
                  <>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <svg style={{ width: '24px', height: '24px', color: '#94a3b8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      {form.resumeUrl ? 'Cập nhật bản CV khác' : 'Tải lên CV của bạn'}
                    </p>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>Kéo thả file vào đây hoặc bấm để chọn</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      {['PDF', 'DOC', 'DOCX'].map(ext => (
                        <span key={ext} style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', padding: '2px 8px', border: '1px solid #e2e8f0', borderRadius: '4px' }}>{ext}</span>
                      ))}
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', padding: '2px 8px', background: '#f1f5f9', borderRadius: '4px' }}>Tối đa 5MB</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Sticky Footer ═══ */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid #e2e8f0',
          padding: '14px 0',
          zIndex: 50,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.03)',
        }}>
          <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '12px', height: '12px', borderRadius: '50%',
                background: completion >= 80 ? '#22c55e' : completion >= 50 ? '#f59e0b' : '#ef4444',
                boxShadow: `0 0 10px ${completion >= 80 ? '#22c55e66' : completion >= 50 ? '#f59e0b66' : '#ef444466'}`
              }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Hồ sơ: {completion}%</span>
                <span style={{
                  fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '100px',
                  background: completion >= 80 ? '#f0fdf4' : completion >= 50 ? '#fffbeb' : '#fef2f2',
                  color: completion >= 80 ? '#16a34a' : completion >= 50 ? '#d97706' : '#dc2626',
                }}>
                  {completion >= 80 ? 'Rất tốt' : completion >= 50 ? 'Cần cải thiện' : 'Chưa hoàn thiện'}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
              style={{
                padding: '10px 36px',
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
              }}
            >
              {saving ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang lưu...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                   </svg>
                   Lưu hồ sơ
                </span>
              )}
            </button>
          </div>
        </div>
      </form>
    </Layout>
  );
}
