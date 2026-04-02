import { useState, useEffect, useRef } from 'react';
import { profileAPI } from '../../api';
import Layout from '../../components/Layout';
import { useToast } from '../../components/Toast';

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await profileAPI.update({
        name: form.name,
        phone: form.phone,
        companyName: form.companyName,
        companyLogo: form.companyLogo,
        companySize: form.companySize,
        industry: form.industry,
        website: form.website,
        description: form.description,
      });
      // Sync localStorage
      const stored = localStorage.getItem('user');
      if (stored) {
        const user = JSON.parse(stored);
        localStorage.setItem('user', JSON.stringify({
          ...user,
          name: data.name,
          companyLogo: data.companyLogo,
        }));
      }
      addToast('Cập nhật hồ sơ công ty thành công', 'success');
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
          <div className="h-40 bg-gray-200 rounded-lg"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-5">
        <h1 className="section-title">Hồ sơ công ty</h1>

        {/* Logo */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-heading mb-4">Logo công ty</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-xl bg-white border-2 border-line overflow-hidden flex items-center justify-center">
                {form.companyLogo ? (
                  <img src={form.companyLogo} alt="Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <span className="text-brand-500 font-bold text-2xl">
                    {form.companyName?.charAt(0)?.toUpperCase() || form.name?.charAt(0)?.toUpperCase() || 'C'}
                  </span>
                )}
              </div>
              {uploadingLogo && (
                <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingLogo}
                className="btn-outline !py-1.5 !px-4 text-sm"
              >
                Đổi logo
              </button>
              <p className="text-xs text-meta mt-1">JPG, PNG, GIF — tối đa 5MB</p>
            </div>
          </div>
        </div>

        {/* Company Info */}
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-heading">Thông tin công ty</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-meta mb-1.5">Tên công ty</label>
              <input
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                className="input"
                placeholder="Công ty TNHH ABC"
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
            <div>
              <label className="block text-xs font-medium text-meta mb-1.5">Quy mô công ty</label>
              <select
                name="companySize"
                value={form.companySize}
                onChange={handleChange}
                className="input"
              >
                <option value="">Chọn quy mô</option>
                {COMPANY_SIZES.map((size) => (
                  <option key={size} value={size}>{size} nhân viên</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-meta mb-1.5">Ngành nghề</label>
              <input
                name="industry"
                value={form.industry}
                onChange={handleChange}
                className="input"
                placeholder="Công nghệ thông tin"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-meta mb-1.5">Website</label>
              <input
                name="website"
                value={form.website}
                onChange={handleChange}
                className="input"
                placeholder="https://example.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-meta mb-1.5">Giới thiệu công ty</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="input resize-none"
              placeholder="Mô tả về công ty, lĩnh vực hoạt động, văn hóa công ty..."
            />
          </div>
        </div>

        {/* Contact Person */}
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-heading">Người liên hệ</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-meta mb-1.5">Tên người liên hệ</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input"
                placeholder="Nguyễn Văn A"
              />
            </div>
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
