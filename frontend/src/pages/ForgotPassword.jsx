import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api';
import logo from '../public/imgs/logo_genbygem.png';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setSuccess(true);
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi yêu cầu');
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
            <span className="text-white font-bold text-lg tracking-wide">Bảo mật tài khoản</span>
          </div>

          <div className="w-full flex flex-col gap-4">
            <div className="skeleton-line !mb-0 w-full"></div>
            <div className="skeleton-line !mb-0 w-[70%]"></div>
            <div className="skeleton-line !mb-0 w-[40%]"></div>
          </div>
        </div>
      </div>

      {/* ═══ Right Form Panel ═══ */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-white">
        <div className="w-full max-w-[400px] animate-fade-in py-10">
          
          <div className="lg:hidden text-center mb-10">
            <Link to="/">
              <img src={logo} alt="8386recruit" className="h-12 w-auto mx-auto object-contain" />
            </Link>
          </div>

          <div className="mb-8">
            <Link to="/login" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-brand-600 gap-1 mb-6 group transition-colors">
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại đăng nhập
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Quên mật khẩu?</h1>
            <p className="text-sm text-gray-500">Chúng tôi sẽ giúp bạn lấy lại quyền truy cập vào tài khoản.</p>
          </div>

          {error && (
            <div className="bg-red-50/80 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-start gap-2.5 shadow-sm animate-fade-in">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="leading-relaxed">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50/80 border border-green-100 text-green-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-start gap-2.5 shadow-sm animate-fade-in">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="leading-relaxed">Đã gửi mã OTP thành công. Đang chuyển hướng...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="forgot-email" className="block text-sm font-semibold text-gray-700 mb-1.5">Địa chỉ Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors">
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3 px-4 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Đang xử lý...
                </>
              ) : (
                'Gửi mã xác nhận'
              )}
            </button>
          </form>

          <div className="mt-12 text-center text-sm">
            <p className="text-gray-500 mb-2">Bạn gặp sự cố khi khôi phục?</p>
            <a href="mailto:support@8386recruit.com" className="text-brand-600 font-bold hover:underline">Liên hệ bộ phận hỗ trợ</a>
          </div>
        </div>
      </div>
    </div>
  );
}
