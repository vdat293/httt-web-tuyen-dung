import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useToast } from './Toast';
import logo from '../public/imgs/logo_genbygem.png';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { addToast } = useToast();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle session expired
  useEffect(() => {
    const handleSessionExpired = () => {
      if (location.pathname !== '/login') {
        addToast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'warning', 5000);
      }
    };
    window.addEventListener('session-expired', handleSessionExpired);
    return () => window.removeEventListener('session-expired', handleSessionExpired);
  }, [location.pathname, addToast]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center group
    ${isActive(path) 
      ? 'text-brand-600 bg-brand-50 font-semibold' 
      : 'text-gray-600 hover:text-brand-600 hover:bg-gray-50'
    }`;

  return (
    <nav 
      className={`sticky top-0 z-50 transition-all duration-300 border-b border-gray-100 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-0' : 'bg-white py-1'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[60px]">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img 
              src={logo} 
              alt="8386recruit Logo" 
              className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1.5 h-full">
            {!user ? (
              <>
                <Link to="/jobs" className={linkClass('/jobs')}>Việc làm</Link>
                <div className="w-px h-6 bg-gray-200 mx-3"></div>
                <Link to="/login" className="btn-ghost !py-2 !px-4 text-sm font-semibold hover:bg-gray-50 text-gray-700">Đăng nhập</Link>
                <Link to="/register" className="btn-primary !py-2 !px-5 text-sm shadow-sm hover:shadow-md transition-all ml-1">Đăng ký</Link>
              </>
            ) : (
              <>
                {user.role === 'employer' && (
                  <div className="flex space-x-1">
                    <Link to="/employer/dashboard" className={linkClass('/employer/dashboard')}>Dashboard</Link>
                    <Link to="/employer/jobs" className={linkClass('/employer/jobs')}>Tin tuyển dụng</Link>
                    <Link to="/employer/applications" className={linkClass('/employer/applications')}>Ứng viên</Link>
                    <Link to="/employer/interviews" className={linkClass('/employer/interviews')}>Phỏng vấn</Link>
                    <Link to="/employer/reports" className={linkClass('/employer/reports')}>Báo cáo</Link>
                    <Link to="/employer/company-profile" className={linkClass('/employer/company-profile')}>Hồ sơ</Link>
                  </div>
                )}
                {user.role === 'candidate' && (
                  <div className="flex space-x-1">
                    <Link to="/jobs" className={linkClass('/jobs')}>Tìm việc</Link>
                    <Link to="/candidate/applications" className={linkClass('/candidate/applications')}>Đã ứng tuyển</Link>
                    <Link to="/candidate/interviews" className={linkClass('/candidate/interviews')}>Phỏng vấn</Link>
                    <Link to="/candidate/saved-jobs" className={linkClass('/candidate/saved-jobs')}>Đã lưu</Link>
                  </div>
                )}
                
                <div className="w-px h-6 bg-gray-200 mx-3"></div>
                
                <div className="flex items-center gap-4 relative">
                  <NotificationDropdown />
                  
                  {/* User Dropdown */}
                  <div className="relative group cursor-pointer pl-2 border-l border-transparent hover:border-gray-100 transition-colors py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-100 to-brand-50 text-brand-600 flex items-center justify-center text-sm font-bold shadow-sm ring-2 ring-transparent group-hover:ring-brand-100 transition-all overflow-hidden">
                        {user.avatar || user.companyLogo ? (
                          <img
                            src={user.avatar || user.companyLogo}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user.name?.charAt(0)?.toUpperCase()
                        )}
                      </div>
                      <div className="hidden lg:flex flex-col">
                        <span className="text-sm font-semibold text-gray-800 leading-tight group-hover:text-brand-600 transition-colors">{user.name}</span>
                        <span className="text-xs text-gray-500 font-medium">{user.role === 'employer' ? 'Nhà tuyển dụng' : 'Ứng viên'}</span>
                      </div>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-brand-500 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {/* Dropdown Menu Panel */}
                    <div className="absolute right-0 top-full mt-0 w-60 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right translate-y-2 group-hover:translate-y-0 z-[100]">
                      <div className="p-3 border-b border-gray-50 flex flex-col">
                        <span className="text-sm font-bold text-gray-800 truncate">{user.name}</span>
                        <span className="text-[13px] text-gray-500 truncate">{user.email || (user.role === 'employer' ? 'Nhà tuyển dụng' : 'Ứng viên')}</span>
                      </div>
                      
                      <div className="p-2 flex flex-col gap-1">
                        {user.role === 'employer' ? (
                          <>
                            <Link to="/employer/dashboard" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg flex items-center gap-2.5 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                              Tổng quan
                            </Link>
                            <Link to="/employer/company-profile" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg flex items-center gap-2.5 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                              Hồ sơ công ty
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link to="/candidate/profile" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg flex items-center gap-2.5 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                              Hồ sơ cá nhân
                            </Link>
                            <Link to="/candidate/saved-jobs" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg flex items-center gap-2.5 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                              Việc làm đã lưu
                            </Link>
                          </>
                        )}
                      </div>
                      
                      <div className="p-2 border-t border-gray-50">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLogout();
                          }}
                          className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2.5 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile toggle button */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="md:hidden p-2.5 rounded-lg hover:bg-gray-50 text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-100 transition-all"
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="transition-transform duration-200" style={{ transform: menuOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Panel */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            menuOpen ? 'max-h-[500px] opacity-100 mb-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="pt-4 pb-2 border-t border-gray-100 flex flex-col gap-1.5">
            {!user ? (
              <>
                <Link to="/jobs" className={linkClass('/jobs')} onClick={() => setMenuOpen(false)}>Việc làm</Link>
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                  <Link to="/login" className="btn-outline !py-2.5 text-sm text-center" onClick={() => setMenuOpen(false)}>Đăng nhập</Link>
                  <Link to="/register" className="btn-primary !py-2.5 text-sm text-center shadow-sm" onClick={() => setMenuOpen(false)}>Đăng ký</Link>
                </div>
              </>
            ) : (
              <>
                {user.role === 'employer' && (
                  <div className="flex flex-col gap-1">
                    <Link to="/employer/dashboard" className={linkClass('/employer/dashboard')} onClick={() => setMenuOpen(false)}>Dashboard</Link>
                    <Link to="/employer/jobs" className={linkClass('/employer/jobs')} onClick={() => setMenuOpen(false)}>Tin tuyển dụng</Link>
                    <Link to="/employer/applications" className={linkClass('/employer/applications')} onClick={() => setMenuOpen(false)}>Ứng viên</Link>
                    <Link to="/employer/interviews" className={linkClass('/employer/interviews')} onClick={() => setMenuOpen(false)}>Phỏng vấn</Link>
                    <Link to="/employer/reports" className={linkClass('/employer/reports')} onClick={() => setMenuOpen(false)}>Báo cáo</Link>
                    <Link to="/employer/company-profile" className={linkClass('/employer/company-profile')} onClick={() => setMenuOpen(false)}>Hồ sơ công ty</Link>
                  </div>
                )}
                {user.role === 'candidate' && (
                  <div className="flex flex-col gap-1">
                    <Link to="/jobs" className={linkClass('/jobs')} onClick={() => setMenuOpen(false)}>Tìm việc</Link>
                    <Link to="/candidate/applications" className={linkClass('/candidate/applications')} onClick={() => setMenuOpen(false)}>Đơn ứng tuyển</Link>
                    <Link to="/candidate/interviews" className={linkClass('/candidate/interviews')} onClick={() => setMenuOpen(false)}>Phỏng vấn</Link>
                    <Link to="/candidate/saved-jobs" className={linkClass('/candidate/saved-jobs')} onClick={() => setMenuOpen(false)}>Việc đã lưu</Link>
                  </div>
                )}
                
                {/* Mobile User Footer */}
                <div className="flex items-center justify-between border-t border-gray-100 mt-4 pt-4 bg-gray-50/50 -mx-4 px-4 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-sm font-bold shadow-sm overflow-hidden border-2 border-white">
                      {user.avatar || user.companyLogo ? (
                        <img
                          src={user.avatar || user.companyLogo}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user.name?.charAt(0)?.toUpperCase()
                      )}
                    </div>
                    <div>
                      <span className="block text-sm font-semibold text-gray-800">{user.name}</span>
                      <span className="block text-xs text-gray-500 mt-0.5">{user.role === 'employer' ? 'Nhà tuyển dụng' : 'Ứng viên'}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }} 
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 font-medium hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Thoát
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
