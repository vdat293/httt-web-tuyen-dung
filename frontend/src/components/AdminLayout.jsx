import { useState } from 'react';
import { Link } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Người dùng', path: '/admin/users' },
  { label: 'Tin tuyển dụng', path: '/admin/jobs' },
  { label: 'Báo cáo', path: '/admin/reports' },
  { label: 'Mã OTP', path: '/admin/otps' },
];

export default function AdminLayout({ children, currentPage = 'Dashboard' }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/admin') return currentPage === 'Dashboard';
    return currentPage === path.split('/')[2];
  };

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-5 border-b border-gray-100 bg-white">
        <span className="text-brand-600 font-bold text-lg tracking-tight">Admin Panel</span>
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden p-1 text-gray-500 hover:bg-gray-100 rounded-md"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(item.path)
                ? 'bg-brand-50 text-brand-600 font-semibold'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {item.path === '/admin' && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            )}
            {item.path === '/admin/users' && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
            {item.path === '/admin/jobs' && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            )}
            {item.path === '/admin/reports' && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            )}
            {item.path === '/admin/otps' && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-100 bg-white">
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Quay về trang chính
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-bgLight flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col flex-shrink-0 sticky top-0 h-screen">
        <NavContent />
      </aside>

      {/* Sidebar for Mobile (Drawer) */}
      <div 
        className={`fixed inset-0 z-[110] lg:hidden transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
        
        {/* Panel */}
        <aside 
          className={`absolute left-0 top-0 bottom-0 w-72 bg-white flex flex-col transition-transform duration-300 shadow-2xl ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <NavContent />
        </aside>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 sticky top-0 z-[100]">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="font-bold text-gray-900 tracking-tight sm:text-lg">{currentPage}</h2>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <NotificationDropdown />
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs ring-2 ring-white">
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
