import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../api';

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
    <div className="min-h-screen bg-bgLight flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in card p-6 sm:p-8">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-2xl font-bold text-brand-500">8386recruit</span>
          </Link>
          <h1 className="text-xl font-bold text-heading">Xác thực tài khoản</h1>
          <p className="text-sm text-meta mt-2">Vui lòng nhập mã OTP đã được gửi đến email <strong>{email}</strong></p>
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
          <div className="form-group">
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

          <button type="submit" disabled={loading || otp.length < 6} className="btn-primary w-full mt-2">
            {loading ? 'Đang xác thực...' : 'Xác thực'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-meta">
          Chưa nhận được mã?{' '}
          <button type="button" onClick={handleResend} className="text-brand-500 font-semibold hover:text-brand-600">
            Gửi lại
          </button>
        </p>
      </div>
    </div>
  );
}
