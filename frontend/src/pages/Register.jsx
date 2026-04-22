import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../public/imgs/logo_genbygem.png';
import loginBanner from '../public/imgs/login-banner.png';

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
      await register(form);
      navigate('/verify-email', { state: { email: form.email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ═══ Left Brand Panel ═══ */}
      <div className="hidden lg:flex lg:w-[33%] xl:w-[33%] h-screen sticky top-0 relative overflow-hidden flex-col justify-center items-center background">
        
        {/* Layer 2: Grid */}
        <div className="absolute inset-0 grid-pattern pointer-events-none opacity-50"></div>

        {/* Layer 3: Glass Panel */}
        <div className="relative z-10 w-[80%] max-w-[340px] p-10 glass-panel flex flex-col justify-center shadow-2xl">
          
          {/* Layer 4: Glow Elements & Identifier */}
          <div className="flex items-center gap-4 mb-8">
            <div className="glow-node flex-shrink-0"></div>
            <span className="text-white font-bold text-lg tracking-wide">Ứng viên #8386</span>
          </div>

          {/* Skeleton Loaders */}
          <div className="w-full flex flex-col gap-4">
            <div className="skeleton-line !mb-0 w-full"></div>
            <div className="skeleton-line !mb-0 w-[70%]"></div>
            <div className="skeleton-line !mb-0 w-[40%]"></div>
          </div>
          
        </div>
        
      </div>

      {/* ═══ Right Form Panel ═══ */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-white">

        <div className="w-full max-w-[450px] animate-fade-in py-10">
          
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <Link to="/">
              <img src={logo} alt="8386recruit" className="h-12 w-auto mx-auto object-contain" />
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Tạo tài khoản mới</h1>
            <p className="text-sm text-gray-500">Bắt đầu hành trình tìm kiếm sự nghiệp của bạn ngay hôm nay.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm animate-fade-in">
              {error}
            </div>
          )}

          {/* Role Selection Tabs */}
          <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
            <button
              onClick={() => setForm({ ...form, role: 'candidate' })}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                form.role === 'candidate' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Tôi là ứng viên
            </button>
            <button
              onClick={() => setForm({ ...form, role: 'employer' })}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                form.role === 'employer' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Tôi là nhà tuyển dụng
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className={`grid grid-cols-1 ${form.role === 'employer' ? 'gap-0' : 'sm:grid-cols-2 gap-4'}`}>
              <div className={form.role === 'employer' ? 'mb-4' : ''}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {form.role === 'employer' ? 'Họ tên người liên hệ' : 'Họ tên'}
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                  placeholder={form.role === 'employer' ? "VD: Nguyễn Văn A" : "Nguyễn Văn A"}
                  required
                />
              </div>

              {form.role === 'employer' && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên công ty</label>
                  <input
                    type="text"
                    value={form.companyName || ''}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                    placeholder="VD: Cty TNHH Giải Pháp Công Nghệ"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số điện thoại</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                  placeholder="09xx xxx xxx"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                placeholder="example@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none pr-12"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Bằng việc nhấn Đăng ký, bạn đồng ý với <a href="#" className="text-brand-600 font-semibold hover:underline">Điều khoản</a> và <a href="#" className="text-brand-600 font-semibold hover:underline">Chính sách bảo mật</a> của 8386recruit.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Đang xử lý...
                </>
              ) : (
                'Đăng ký ngay'
              )}
            </button>
          </form>

          {/* Prompt to Login - VERY CLEAR NOW */}
          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600 mb-4">Bạn đã từng sử dụng 8386recruit?</p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-white border-2 border-gray-200 text-brand-600 font-bold rounded-xl hover:border-brand-500 hover:bg-brand-50 transition-all shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Quay lại Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
