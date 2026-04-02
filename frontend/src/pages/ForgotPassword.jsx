import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api';

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
    <div className="min-h-screen bg-bgLight flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in card p-6 sm:p-8">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-2xl font-bold text-brand-500">8386recruit</span>
          </Link>
          <h1 className="text-xl font-bold text-heading">Quên mật khẩu</h1>
          <p className="text-sm text-meta mt-2">Nhập email của bạn để nhận mã OTP đặt lại mật khẩu</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-2.5 rounded-lg mb-4 text-sm">
            Đã gửi mã OTP thành công. Đang chuyển hướng...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="Nhập email của bạn"
              required
            />
          </div>

          <button type="submit" disabled={loading || !email} className="btn-primary w-full mt-2">
            {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-meta">
          Nhớ mật khẩu?{' '}
          <Link to="/login" className="text-brand-500 font-semibold hover:text-brand-600">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
