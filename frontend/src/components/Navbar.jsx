import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
      isActive(path) ? 'text-brand-500 bg-brand-50' : 'text-body hover:text-brand-500'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-lg font-bold text-brand-500 hidden sm:block">RecruitPro</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {!user ? (
              <>
                <Link to="/" className={linkClass('/')}>Việc làm</Link>
                <div className="w-px h-5 bg-border mx-2"></div>
                <Link to="/login" className="btn-outline !py-1.5 !px-4 text-sm">Đăng nhập</Link>
                <Link to="/register" className="btn-primary !py-1.5 !px-4 text-sm ml-2">Đăng ký</Link>
              </>
            ) : (
              <>
                {user.role === 'employer' && (
                  <>
                    <Link to="/employer/dashboard" className={linkClass('/employer/dashboard')}>Dashboard</Link>
                    <Link to="/employer/jobs" className={linkClass('/employer/jobs')}>Tin tuyển dụng</Link>
                    <Link to="/employer/applications" className={linkClass('/employer/applications')}>Ứng viên</Link>
                    <Link to="/employer/interviews" className={linkClass('/employer/interviews')}>Phỏng vấn</Link>
                    <Link to="/employer/reports" className={linkClass('/employer/reports')}>Báo cáo</Link>
                  </>
                )}
                {user.role === 'candidate' && (
                  <>
                    <Link to="/jobs" className={linkClass('/jobs')}>Tìm việc</Link>
                    <Link to="/candidate/applications" className={linkClass('/candidate/applications')}>Đơn ứng tuyển</Link>
                    <Link to="/candidate/interviews" className={linkClass('/candidate/interviews')}>Phỏng vấn</Link>
                  </>
                )}
                <div className="w-px h-5 bg-border mx-2"></div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-sm font-semibold">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-heading hidden lg:block">{user.name}</span>
                  <button onClick={handleLogout} className="text-sm text-meta hover:text-red-500 transition-colors ml-1">
                    Đăng xuất
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-md hover:bg-gray-100">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-line animate-fade-in">
            <div className="flex flex-col gap-1">
              {!user ? (
                <>
                  <Link to="/" className={linkClass('/')} onClick={() => setMenuOpen(false)}>Việc làm</Link>
                  <div className="flex gap-2 mt-2">
                    <Link to="/login" className="btn-outline !py-2 flex-1 text-sm text-center" onClick={() => setMenuOpen(false)}>Đăng nhập</Link>
                    <Link to="/register" className="btn-primary !py-2 flex-1 text-sm text-center" onClick={() => setMenuOpen(false)}>Đăng ký</Link>
                  </div>
                </>
              ) : (
                <>
                  {user.role === 'employer' && (
                    <>
                      <Link to="/employer/dashboard" className={linkClass('/employer/dashboard')} onClick={() => setMenuOpen(false)}>Dashboard</Link>
                      <Link to="/employer/jobs" className={linkClass('/employer/jobs')} onClick={() => setMenuOpen(false)}>Tin tuyển dụng</Link>
                      <Link to="/employer/applications" className={linkClass('/employer/applications')} onClick={() => setMenuOpen(false)}>Ứng viên</Link>
                      <Link to="/employer/interviews" className={linkClass('/employer/interviews')} onClick={() => setMenuOpen(false)}>Phỏng vấn</Link>
                      <Link to="/employer/reports" className={linkClass('/employer/reports')} onClick={() => setMenuOpen(false)}>Báo cáo</Link>
                    </>
                  )}
                  {user.role === 'candidate' && (
                    <>
                      <Link to="/jobs" className={linkClass('/jobs')} onClick={() => setMenuOpen(false)}>Tìm việc</Link>
                      <Link to="/candidate/applications" className={linkClass('/candidate/applications')} onClick={() => setMenuOpen(false)}>Đơn ứng tuyển</Link>
                      <Link to="/candidate/interviews" className={linkClass('/candidate/interviews')} onClick={() => setMenuOpen(false)}>Phỏng vấn</Link>
                    </>
                  )}
                  <div className="flex items-center justify-between border-t border-line mt-2 pt-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-sm font-semibold">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-heading">{user.name}</span>
                    </div>
                    <button onClick={handleLogout} className="text-sm text-red-500 font-medium">Đăng xuất</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
