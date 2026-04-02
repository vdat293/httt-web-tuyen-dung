import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api';

export default function ResetPassword() {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
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
      return setError('Mật khẩu mới phải có ít nhất 6 ký tự');
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
    <div className="min-h-screen bg-bgLight flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in card p-6 sm:p-8">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-2xl font-bold text-brand-500">8386recruit</span>
          </Link>
          <h1 className="text-xl font-bold text-heading">Tạo mật khẩu mới</h1>
          <p className="text-sm text-meta mt-2">Vui lòng nhập mã OTP và mật khẩu mới</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-2.5 rounded-lg mb-4 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {step === 1 ? (
            <div className="form-group animate-fade-in">
              <label>Mã OTP (6 số)</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="input-field text-center text-tracking-widest text-lg font-mono font-bold"
                placeholder="------"
                maxLength={6}
                required
              />
            </div>
          ) : (
            <div className="animate-fade-in space-y-4">
              <div className="form-group mb-0">
                <label>Mật khẩu mới</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field"
                  placeholder="Tối thiểu 6 ký tự"
                  required
                />
              </div>
              
              <div className="form-group mb-0">
                <label>Xác nhận mật khẩu</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder="Nhập lại mật khẩu mới"
                  required
                />
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-6">
            {step === 1 ? 'Tiếp tục' : (loading ? 'Đang xử lý...' : 'Lưu mật khẩu')}
          </button>
          
          {step === 2 && (
            <button 
              type="button" 
              onClick={() => setStep(1)} 
              className="mt-4 w-full text-sm text-meta hover:text-heading"
            >
              Quay lại bước nhập OTP
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
