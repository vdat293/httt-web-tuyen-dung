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
        localStorage.setItem('user', JSON.stringify({ ...u, name: data.name }));
      }
      addToast('Cập nhật hồ sơ cá nhân thành công!', 'success');
    } catch (err) { addToast(err.response?.data?.message || 'Lỗi', 'error'); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto animate-pulse space-y-6 px-4 sm:px-0">
          <div className="h-48 sm:h-56 bg-gray-200 rounded-2xl"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
        </div>
      </Layout>
    );
  }

  const initial = form.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <Layout>
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto pb-24 px-4 sm:px-0">

        {/* ═══ Hero Card ═══ */}
        <div className="relative overflow-hidden mb-8 p-6 sm:p-10 rounded-2xl bg-gradient-to-br from-blue-900 via-blue-600 to-blue-400">
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10"></div>
          <div className="absolute -bottom-5 left-10 w-24 h-24 rounded-full bg-white/5"></div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 text-center sm:text-left">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white border-4 border-white/30 flex items-center justify-center overflow-hidden shadow-xl">
                {form.avatar ? (
                  <img src={form.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-extrabold text-blue-500">{initial}</span>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => avatarRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
                title="Thay đổi ảnh đại diện"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </div>

            {/* Title Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 truncate">
                {form.name || 'Hồ sơ cá nhân'}
              </h1>
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3">
                <span className="px-3 py-1 bg-white/15 text-white/90 text-sm font-semibold rounded-full border border-white/10">
                  Ứng viên
                </span>
                <span className="flex items-center gap-1.5 text-sm text-white/80">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {form.phone || 'Chưa cập nhật SĐT'}
                </span>
              </div>
            </div>

            {/* Completion */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-2">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                  <circle
                    cx="32" cy="32" r="28" fill="none"
                    stroke={completion >= 80 ? '#4ade80' : completion >= 50 ? '#fbbf24' : '#f87171'}
                    strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${(completion / 100) * 175.9} 175.9`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-sm sm:text-base font-extrabold text-white">
                  {completion}%
                </div>
              </div>
              <p className="text-[11px] font-bold text-white/80 uppercase tracking-wider">Hoàn thiện</p>
            </div>
          </div>
        </div>

        {/* ═══ Main Form Sections ═══ */}
        <div className="flex flex-col gap-6">

          {/* Section: Thông tin cá nhân */}
          <div className="bg-white rounded-xl border border-line overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-gray-800">Thông tin cá nhân</h2>
                <p className="text-[11px] text-gray-500 font-medium">Dùng để hiển thị cho nhà tuyển dụng</p>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group mb-0">
                  <label className="text-xs font-bold text-gray-600 uppercase mb-2 block">Họ tên <span className="text-red-500">*</span></label>
                  <input name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="Nguyễn Văn A" required />
                </div>
                <div className="form-group mb-0">
                  <label className="text-xs font-bold text-gray-600 uppercase mb-2 block">Số điện thoại</label>
                  <input name="phone" value={form.phone} onChange={handleChange} className="input-field" placeholder="0xxx xxx xxx" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-gray-600 uppercase mb-2 block">Giới thiệu bản thân</label>
                  <span className="text-[11px] text-gray-400 font-medium block mb-1.5 flex justify-between">
                    Mô tả ngắn gọn về bản thân, mục tiêu nghề nghiệp...
                    <span className={form.bio.length > 450 ? 'text-red-500' : ''}>{form.bio.length}/500</span>
                  </span>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    rows={4}
                    className="input-field resize-none"
                    placeholder="VD: Tôi là một lập trình viên nhiệt huyết với 2 năm kinh nghiệm..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Kỹ năng chuyên môn */}
          <div className="bg-white rounded-xl border border-line overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
              <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-gray-800">Kỹ năng chuyên môn</h2>
                <p className="text-[11px] text-gray-500 font-medium">Giúp nhà tuyển dụng tìm thấy bạn dễ dàng hơn</p>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-4 text-[13px]">
                {form.skills.map(s => (
                  <div key={s} className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 font-medium border border-gray-200 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600">
                    {s}
                    <button type="button" onClick={() => toggleSkill(s)} className="text-gray-400 group-hover:text-red-500 transition-colors">
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3" strokeLinecap="round" /></svg>
                    </button>
                  </div>
                ))}
                {form.skills.length === 0 && <p className="text-sm text-gray-400 italic py-1 text-center w-full">Chưa có kỹ năng nào được thêm...</p>}
              </div>

              <div className="flex gap-2">
                <input
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); }}}
                  className="input-field"
                  placeholder="Nhập kỹ năng mới..."
                />
                <button 
                  type="button" 
                  onClick={addSkill} 
                  className="px-6 rounded-xl bg-gray-100 text-gray-600 font-bold text-[13px] transition-colors hover:bg-gray-200 whitespace-nowrap"
                >
                  Thêm
                </button>
              </div>

              <div className="mt-6">
                <p className="text-xs font-bold text-gray-600 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                  💡 Gợi ý kỹ năng:
                </p>
                <div className="flex flex-wrap gap-2">
                  {SKILL_SUGGESTIONS.map(s => {
                    const selected = form.skills.includes(s);
                    return (
                      <button
                        key={s} type="button" onClick={() => toggleSkill(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          selected 
                            ? 'border-purple-200 bg-purple-50 text-purple-600 shadow-sm' 
                            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {selected ? '✓ ' : '+ '} {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Kinh nghiệm & Học vấn */}
          <div className="bg-white rounded-xl border border-line overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
              <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-gray-800">Kinh nghiệm & Học vấn</h2>
                <p className="text-[11px] text-gray-500 font-medium">Làm nổi bật nền tảng chuyên môn của bạn</p>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase mb-3 block">Kinh nghiệm làm việc</label>
                  <div className="flex flex-wrap gap-2">
                    {EXP_OPTIONS.map(o => {
                      const active = form.experience === o;
                      return (
                        <button
                          key={o} type="button" onClick={() => setForm(p => ({ ...p, experience: o }))}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                            active 
                              ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm grow sm:grow-0' 
                              : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 grow sm:grow-0'
                          }`}
                        >
                          {o}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="form-group mb-0">
                  <label className="text-xs font-bold text-gray-600 uppercase mb-2 block">Học vấn cao nhất</label>
                  <input name="education" value={form.education} onChange={handleChange} className="input-field" placeholder="VD: Đại học Bách Khoa - Chuyên ngành CNTT" />
                </div>
              </div>
            </div>
          </div>

          {/* Section: CV / Hồ sơ */}
          <div className="bg-white rounded-xl border border-line overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
              <div className="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-gray-800">CV / Hồ sơ đính kèm</h2>
                <p className="text-[11px] text-gray-500 font-medium">Tải lên bản CV chuyên nghiệp nhất (PDF/Word)</p>
              </div>
            </div>
            <div className="p-6">
              {form.resumeUrl && (
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 mb-5 text-sm">
                  <div className="text-3xl">📄</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 truncate text-[15px]">Hồ sơ hiện tại</p>
                    <p className="text-[11px] text-gray-500 font-medium">Bản tài liệu đã lưu trên hệ thống</p>
                  </div>
                  <a href={form.resumeUrl} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-blue-600 font-bold text-xs hover:shadow-sm transition-all whitespace-nowrap">
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
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
                  dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100'
                }`}
              >
                {uploadingResume ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-gray-600">Đang chuẩn bị hồ sơ...</p>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mx-auto mb-4 border border-gray-100">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-[15px] font-bold text-gray-800 mb-1">
                      {form.resumeUrl ? 'Cập nhật bản hồ sơ mới' : 'Tải lên CV của bạn'}
                    </p>
                    <p className="text-xs text-gray-500 font-medium mb-4">Kéo thả file vào đây hoặc click để chọn tệp</p>
                    <div className="flex justify-center gap-2">
                       {['PDF', 'DOC', 'DOCX'].map(ext => (
                         <span key={ext} className="text-[10px] font-bold text-gray-400 px-2.5 py-1 bg-white border border-gray-200 rounded uppercase">{ext}</span>
                       ))}
                       <span className="text-[10px] font-bold text-gray-700 px-2.5 py-1 bg-gray-200 rounded uppercase">Max 5MB</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Sticky Footer ═══ */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 py-4 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`hidden sm:block w-3 h-3 rounded-full ${
                completion >= 80 ? 'bg-green-500 shadow-green-200 shadow-[0_0_8px]' : completion >= 50 ? 'bg-orange-500' : 'bg-red-500'
              }`}></div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2">
                <span className="text-sm font-bold text-gray-700">Hoàn thiện {completion}%</span>
                <span className={`w-fit px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-tight ${
                  completion >= 80 ? 'bg-green-50 text-green-600' : completion >= 50 ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                }`}>
                  {completion >= 80 ? 'Xuất sắc' : completion >= 50 ? 'Khá tốt' : 'Cần bổ sung'}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-8 sm:px-12 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-extrabold rounded-xl shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:scale-100 text-[13px]"
            >
              {saving ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang xử lý...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                   </svg>
                   <span>Lưu cập nhật</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </form>
    </Layout>
  );
}
