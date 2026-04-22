import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../public/imgs/logo_genbygem.png';
import loginBanner from '../public/imgs/login-banner.png';

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
      <div className="hidden lg:flex lg:w-[33%] xl:w-[33%] relative overflow-hidden flex-col justify-center items-center background">
        
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
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-white">
        <div className="w-full max-w-[400px] animate-fade-in">

          {/* Mobile-only logo */}
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
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

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
                  className="w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
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
                <Link to="/forgot-password" self-start className="text-xs font-medium text-brand-600 hover:text-brand-700">
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-1"
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="relative mt-8 mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400 uppercase font-medium">hoặc</span></div>
          </div>

          <Link
            to="/register"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white border-2 border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:border-brand-500 hover:text-brand-600 transition-all"
          >
            Tạo tài khoản mới
          </Link>

          <p className="text-center text-xs text-gray-400 mt-8">
            Bằng việc đăng nhập, bạn đồng ý với Điều khoản và Chính sách của chúng tôi.
          </p>
        </div>
      </div>
    </div>
  );
}
