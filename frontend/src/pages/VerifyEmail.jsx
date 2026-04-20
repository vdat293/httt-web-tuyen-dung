import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../api';
import logo from '../public/imgs/logo_genbygem.png';

export default function VerifyEmail() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmailLogin } = useAuth();
  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp) return;
    setError('');
    setLoading(true);
    try {
      await verifyEmailLogin(email, otp);
      setSuccess('Xác thực thành công! Đang chuyển hướng...');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Mã OTP không hợp lệ');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    try {
      const { data } = await authAPI.resendVerifyEmail({ email });
      setSuccess(data.message || 'Đã gửi lại mã OTP');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi lại mã OTP');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ═══ Left Brand Panel ═══ */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] relative overflow-hidden flex-col justify-center text-white p-10 xl:p-14"
        style={{ background: 'linear-gradient(160deg, #063d1e 0%, #0a5c2f 30%, #00B14F 70%, #00c853 100%)' }}
      >
        <div className="relative z-10">
          <Link to="/" className="inline-block mb-10">
            <img src={logo} alt="8386recruit" className="h-12 w-auto brightness-0 invert" />
          </Link>
          <div className="max-w-md">
            <h2 className="text-4xl font-bold leading-tight mb-6">Xác thực tài khoản.</h2>
            <p className="text-white/70 text-lg leading-relaxed">Một bước cuối cùng để kích hoạt tài khoản của bạn. Vui lòng nhập mã OTP chúng tôi vừa gửi qua email.</p>
          </div>
        </div>
      </div>

      {/* ═══ Right Form Panel ═══ */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-gray-50/70">
        <div className="w-full max-w-[400px] animate-fade-in">
          
          <div className="lg:hidden text-center mb-8">
            <Link to="/">
              <img src={logo} alt="8386recruit" className="h-12 w-auto mx-auto object-contain" />
            </Link>
          </div>

          <div className="mb-8">
            <Link to="/login" className="inline-flex items-center text-sm font-semibold text-brand-600 hover:text-brand-700 gap-1 mb-6 group">
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại đăng nhập
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Nhập mã xác thực</h1>
            <p className="text-sm text-gray-500">Mã OTP gồm 6 chữ số đã được gửi tới email <span className="font-bold text-gray-700">{email}</span></p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-start gap-2 shadow-sm animate-fade-in">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-100 text-green-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-start gap-2 shadow-sm animate-fade-in">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">Mã OTP (6 số)</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-4 bg-white border border-gray-200 rounded-2xl text-3xl text-center font-bold tracking-[0.5em] focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full py-3 px-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Đang xác thực...
                </>
              ) : (
                'Xác thực ngay'
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <p className="text-gray-500">Bạn chưa nhận được mã?</p>
            <button
              type="button"
              onClick={handleResend}
              className="mt-2 text-brand-600 font-bold hover:underline py-1"
            >
              Gửi lại mã OTP mới
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
