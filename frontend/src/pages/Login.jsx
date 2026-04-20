import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../public/imgs/logo_genbygem.png';

export default function Login() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // ─── Kiểm tra nếu vừa bị hết phiên ─────────────────────────────────────
  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      window.history.replaceState({}, '', '/login');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      navigate(data.user.role === 'employer' ? '/employer/dashboard' : '/jobs');
    } catch (err) {
      if (err.response?.data?.needsVerification) {
        navigate('/verify-email', { state: { email: err.response.data.email } });
      } else {
        setError(err.response?.data?.message || 'Đăng nhập thất bại');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ═══ Left Brand Panel ═══ */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] relative overflow-hidden flex-col justify-between"
        style={{ background: 'linear-gradient(160deg, #063d1e 0%, #0a5c2f 30%, #00B14F 70%, #00c853 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-[500px] h-[500px] rounded-full bg-white/[0.04] -top-40 -right-40" style={{ animation: 'float 14s ease-in-out infinite' }}></div>
          <div className="absolute w-[300px] h-[300px] rounded-full bg-white/[0.06] bottom-20 -left-20" style={{ animation: 'float 10s ease-in-out infinite reverse' }}></div>
          <div className="absolute w-[200px] h-[200px] rounded-full bg-white/[0.03] top-1/3 left-1/3" style={{ animation: 'float 16s ease-in-out infinite 3s' }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-10 xl:p-14 flex flex-col h-full justify-center">
          {/* Logo */}
          <Link to="/" className="mb-12 inline-block self-start">
            <img src={logo} alt="8386recruit" className="h-12 w-auto object-contain brightness-0 invert drop-shadow-lg" />
          </Link>

          {/* Hero text */}
          <div className="max-w-md">
            <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-5">
              Tìm việc mơ ước,<br />
              Bắt đầu từ đây.
            </h2>
            <p className="text-white/70 text-base leading-relaxed mb-10">
              Kết nối hàng ngàn ứng viên với nhà tuyển dụng hàng đầu. Đăng nhập để khám phá cơ hội nghề nghiệp phù hợp với bạn.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-10 mt-auto pb-4">
            <div>
              <div className="text-2xl font-bold text-white">1,000+</div>
              <div className="text-white/60 text-sm mt-1">Việc làm</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-white/60 text-sm mt-1">Công ty</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">10,000+</div>
              <div className="text-white/60 text-sm mt-1">Ứng viên</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Right Form Panel ═══ */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-gray-50/70">
        <div className="w-full max-w-[400px] animate-fade-in">
          
          {/* Mobile-only logo (visible on small screens where left panel is hidden) */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-block">
              <img src={logo} alt="8386recruit" className="h-12 w-auto object-contain" />
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-brand-600 gap-1 mb-6 group transition-colors">
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại trang chủ
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Đăng nhập</h1>
            <p className="text-sm text-gray-500">Chào mừng bạn quay trở lại! Vui lòng nhập thông tin để tiếp tục.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50/80 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-start gap-2.5 animate-fade-in">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors">
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none hover:border-gray-300"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors">
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none hover:border-gray-300"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? (
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <Link to="/forgot-password" className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline transition-colors">
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            {/* Submit */}
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-3 px-4 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-1"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                <>
                  Đăng nhập
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider + Register link */}
          <div className="relative mt-8 mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center"><span className="bg-gray-50/70 px-3 text-xs text-gray-400 uppercase tracking-wider font-medium">hoặc</span></div>
          </div>

          <Link 
            to="/register" 
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white border-2 border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50/30 transition-all duration-200"
          >
            Tạo tài khoản mới
          </Link>

          <p className="text-center text-xs text-gray-400 mt-8">
            Bằng việc đăng nhập, bạn đồng ý với <a href="#" className="underline hover:text-gray-500">Điều khoản</a> và <a href="#" className="underline hover:text-gray-500">Chính sách bảo mật</a> của chúng tôi.
          </p>
        </div>
      </div>
    </div>
  );
}
