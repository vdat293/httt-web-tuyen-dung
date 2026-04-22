import { useState, useEffect, useRef, useMemo } from 'react';
import { profileAPI } from '../../api';
import Layout from '../../components/Layout';
import { useToast } from '../../components/Toast';

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

const INDUSTRIES = [
  'Công nghệ thông tin',
  'Tài chính / Ngân hàng',
  'Bán lẻ / Thương mại điện tử',
  'Sản xuất / Chế biến',
  'Giáo dục / Đào tạo',
  'Y tế / Dược phẩm',
  'Bất động sản / Xây dựng',
  'Truyền thông / Marketing',
  'Logistics / Vận tải',
  'Khách sạn / Nhà hàng',
];

export default function CompanyProfile() {
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    companyName: '',
    companyLogo: '',
    companySize: '',
    industry: '',
    website: '',
    description: '',
  });

  const completion = useMemo(() => {
    const fields = [form.companyName, form.phone, form.companyLogo, form.companySize, form.industry, form.website, form.description, form.name];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [form]);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const { data } = await profileAPI.get();
      setForm({
        name: data.name || '',
        phone: data.phone || '',
        companyName: data.companyName || '',
        companyLogo: data.companyLogo || '',
        companySize: data.companySize || '',
        industry: data.industry || '',
        website: data.website || '',
        description: data.description || '',
      });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const { data } = await profileAPI.uploadAvatar(fd);
      setForm((prev) => ({ ...prev, companyLogo: data.avatar }));
      addToast('Cập nhật logo thành công', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Upload logo thất bại', 'error');
    } finally { setUploadingLogo(false); }
  };

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await profileAPI.update({ ...form });
      const stored = localStorage.getItem('user');
      if (stored) {
        const user = JSON.parse(stored);
        localStorage.setItem('user', JSON.stringify({ ...user, name: data.name, companyLogo: data.companyLogo }));
      }
      addToast('Cập nhật hồ sơ công ty thành công', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Cập nhật thất bại', 'error');
    } finally { setSaving(false); }
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

  const displayName = form.companyName || form.name || 'Công ty';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <Layout>
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto pb-24">

        {/* ═══ Hero Card ═══ */}
        <div style={{
          background: 'linear-gradient(135deg, #063d1e 0%, #0a5c2f 30%, #00B14F 70%, #00c853 100%)',
          borderRadius: '20px',
          overflow: 'hidden',
          marginBottom: '28px',
          position: 'relative',
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }}></div>
          <div style={{ position: 'absolute', bottom: '-30px', left: '20%', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }}></div>

          <div style={{ padding: '40px 36px 0 36px', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              {/* Logo */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: '88px', height: '88px',
                  borderRadius: '18px',
                  background: '#fff',
                  border: '4px solid rgba(255,255,255,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                }}>
                  {form.companyLogo ? (
                    <img src={form.companyLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }} />
                  ) : (
                    <span style={{ fontSize: '32px', fontWeight: 800, color: '#00B14F' }}>{initial}</span>
                  )}
                  {uploadingLogo && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo}
                  style={{
                    position: 'absolute', bottom: '-4px', right: '-4px',
                    width: '30px', height: '30px', borderRadius: '50%',
                    background: '#fff', border: '2px solid #e5e7eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    transition: 'all 0.2s',
                  }}
                  className="hover:bg-brand-50 hover:border-brand-300"
                  title="Đổi logo công ty"
                >
                  <svg style={{ width: '14px', height: '14px', color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName}
                </h1>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>Nhà tuyển dụng</p>
              </div>

              {/* Completion ring */}
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ position: 'relative', width: '56px', height: '56px' }}>
                  <svg style={{ width: '56px', height: '56px', transform: 'rotate(-90deg)' }} viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                    <circle
                      cx="28" cy="28" r="22" fill="none"
                      stroke={completion >= 80 ? '#86efac' : completion >= 50 ? '#fde047' : '#fca5a5'}
                      strokeWidth="4" strokeLinecap="round"
                      strokeDasharray={`${(completion / 100) * 138.2} 138.2`}
                      style={{ transition: 'stroke-dasharray 0.6s ease' }}
                    />
                  </svg>
                  <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                    {completion}%
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap' }}>Hoàn thành</span>
              </div>
            </div>
          </div>

          {/* Bottom stats bar */}
          <div style={{
            marginTop: '24px',
            padding: '14px 36px',
            background: 'rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', gap: '32px',
            fontSize: '13px', color: 'rgba(255,255,255,0.75)',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
              </svg>
              {form.industry || 'Chưa chọn ngành'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
              </svg>
              {form.companySize ? `${form.companySize} nhân viên` : 'Chưa cập nhật quy mô'}
            </span>
            {form.website && (
              <a href={form.website} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.75)', textDecoration: 'none' }}>
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                </svg>
                {form.website}
              </a>
            )}
          </div>
        </div>

        {/* ═══ Single-column layout ═══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Company Info Section */}
          <div className="bg-white rounded-xl border border-line overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 24px', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>Thông tin công ty</h2>
                <p style={{ fontSize: '12px', color: '#9ca3af' }}>Thông tin cơ bản về doanh nghiệp</p>
              </div>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Tên công ty</label>
                  <input name="companyName" value={form.companyName} onChange={handleChange} className="input-field" placeholder="Công ty TNHH ABC" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Số điện thoại</label>
                  <input name="phone" value={form.phone} onChange={handleChange} className="input-field" placeholder="0xxx xxx xxx" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Ngành nghề</label>
                  <select name="industry" value={form.industry} onChange={handleChange} className="input-field">
                    <option value="">Chọn ngành nghề</option>
                    {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Quy mô công ty</label>
                  <select name="companySize" value={form.companySize} onChange={handleChange} className="input-field">
                    <option value="">Chọn quy mô</option>
                    {COMPANY_SIZES.map(size => <option key={size} value={size}>{size} nhân viên</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Website</label>
                <input name="website" value={form.website} onChange={handleChange} className="input-field" placeholder="https://example.com" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Giới thiệu công ty</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  className="input-field"
                  style={{ resize: 'none' }}
                  placeholder="Mô tả về công ty, lĩnh vực hoạt động, văn hóa công ty..."
                />
                <p style={{ fontSize: '11px', color: '#d1d5db', textAlign: 'right', marginTop: '4px' }}>{form.description.length}/1000 ký tự</p>
              </div>
            </div>
          </div>

          {/* Contact Person */}
          <div className="bg-white rounded-xl border border-line overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 24px', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fffbeb', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>Người liên hệ</h2>
                <p style={{ fontSize: '12px', color: '#9ca3af' }}>Thông tin người đại diện công ty</p>
              </div>
            </div>
            <div style={{ padding: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Tên người liên hệ</label>
              <input name="name" value={form.name} onChange={handleChange} className="input-field" style={{ maxWidth: '400px' }} placeholder="Nguyễn Văn A" />
            </div>
          </div>
        </div>

        {/* ═══ Sticky Submit Bar ═══ */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(8px)',
          borderTop: '1px solid #e5e7eb',
          padding: '14px 0',
          zIndex: 50,
        }}>
          <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: completion >= 80 ? '#22c55e' : completion >= 50 ? '#f59e0b' : '#ef4444',
              }}></div>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>
                {completion >= 80 ? 'Hồ sơ đã đầy đủ' : completion >= 50 ? 'Hồ sơ cần bổ sung thêm' : 'Hồ sơ chưa hoàn thiện'}
              </span>
              <span style={{
                fontSize: '12px', fontWeight: 600, padding: '2px 8px', borderRadius: '100px',
                background: completion >= 80 ? '#f0fdf4' : completion >= 50 ? '#fffbeb' : '#fef2f2',
                color: completion >= 80 ? '#16a34a' : completion >= 50 ? '#d97706' : '#dc2626',
              }}>
                {completion}%
              </span>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
              style={{ padding: '10px 32px', boxShadow: '0 2px 10px rgba(0,177,79,0.25)' }}
            >
              {saving ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang lưu...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
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
