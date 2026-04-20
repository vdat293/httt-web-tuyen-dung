import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api';
import logo from '../public/imgs/logo_genbygem.png';

export default function ResetPassword() {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      if (otp.length < 6) return setError('Vui lòng nhập đủ 6 số OTP');
      setStep(2);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      return setError('Mật khẩu nhập lại không khớp');
    }
    if (newPassword.length < 6) {
      return setError('Mật khẩu mới phải có nhất 6 ký tự');
    }
    
    setLoading(true);
    try {
      const { data } = await authAPI.resetPassword({ email, otp, newPassword });
      setSuccess(data.message || 'Đặt lại mật khẩu thành công. Đang chuyển hướng...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể đặt lại mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ═══ Left Brand Panel ═══ */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] relative overflow-hidden flex-col justify-center text-white p-10 xl:p-14"
        style={{ background: 'linear-gradient(160deg, #063d1e 0%, #0a5c2f 30%, #00B14F 70%, #00c853 100%)' }}
      >
        <div className="relative z-10 text-center lg:text-left">
          <Link to="/" className="inline-block mb-10">
            <img src={logo} alt="8386recruit" className="h-12 w-auto brightness-0 invert" />
          </Link>
          <h2 className="text-4xl font-bold leading-tight mb-4">Mật khẩu mới.</h2>
          <p className="text-white/70 text-lg max-w-md">Vui lòng hoàn tất quá trình thiết lập mật khẩu mới để bảo mật tài khoản của bạn.</p>
        </div>
      </div>

      {/* ═══ Right Form Panel ═══ */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-gray-50/70">
        <div className="w-full max-w-[400px] animate-fade-in py-10">
          
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{step === 1 ? 'Xác thực OTP' : 'Mật khẩu mới'}</h1>
            <p className="text-sm text-gray-500">
              {step === 1 ? `Nhập mã 6 chữ số đã được gửi tới ${email}` : 'Vui lòng nhập và xác nhận mật khẩu mới của bạn.'}
            </p>
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
            {step === 1 ? (
              <div className="animate-fade-in">
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
            ) : (
              <div className="animate-fade-in space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu mới</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                    placeholder="Tối thiểu 6 ký tự"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Xác nhận mật khẩu</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                    placeholder="Nhập lại mật khẩu mới"
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="show-pass" 
                    className="rounded text-brand-500 focus:ring-brand-500 h-4 w-4" 
                    onChange={(e) => setShowPassword(e.target.checked)}
                  />
                  <label htmlFor="show-pass" className="text-sm text-gray-600 cursor-pointer">Hiển thị mật khẩu</label>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (step === 1 && otp.length < 6)}
              className="w-full py-3 px-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Đang xử lý...
                </>
              ) : (
                step === 1 ? 'Tiếp tục' : 'Đặt lại mật khẩu'
              )}
            </button>
            
            {step === 2 && (
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="w-full text-sm text-gray-500 hover:text-gray-700 font-semibold"
              >
                Quay lại bước nhập OTP
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
