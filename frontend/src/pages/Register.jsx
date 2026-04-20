import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'candidate' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await register(form);
      navigate('/verify-email', { state: { email: form.email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bgLight flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-2xl font-bold text-brand-500">8386recruit</span>
          </Link>
        </div>

        <div className="card p-6 sm:p-8 relative">
          <Link 
            to="/" 
            className="absolute top-6 left-6 sm:top-8 sm:left-8 text-sm text-meta hover:text-brand-500 font-medium transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </Link>
          <h1 className="text-xl font-bold text-heading text-center mb-1">Tạo tài khoản</h1>
          <p className="text-sm text-meta text-center mb-6">Đăng ký miễn phí và bắt đầu ngay</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div className="flex rounded-lg border border-line overflow-hidden mb-5">
            <button
              type="button"
              onClick={() => setForm({ ...form, role: 'candidate' })}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                form.role === 'candidate'
                  ? 'bg-brand-500 text-white'
                  : 'bg-white text-body hover:bg-gray-50'
              }`}
            >
              Ứng viên
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, role: 'employer' })}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors border-l border-line ${
                form.role === 'employer'
                  ? 'bg-brand-500 text-white'
                  : 'bg-white text-body hover:bg-gray-50'
              }`}
            >
              Nhà tuyển dụng
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Họ tên</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
                placeholder="Nguyễn Văn A"
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
                placeholder="email@example.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pr-10"
                  placeholder="Tối thiểu 6 ký tự"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-meta hover:text-heading text-sm"
                >
                  {showPassword ? 'Ẩn' : 'Hiện'}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Số điện thoại <span className="text-meta font-normal">(tùy chọn)</span></label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-field"
                placeholder="0123 456 789"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
          </form>

          <p className="text-center mt-5 text-sm text-meta">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-brand-500 font-semibold hover:text-brand-600">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
