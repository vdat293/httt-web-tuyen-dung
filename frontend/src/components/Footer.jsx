import { Link } from 'react-router-dom';
import logo from '../public/imgs/logo_genbygem.png';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200" style={{ backgroundColor: '#F0F2F5' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <img src={logo} alt="8386recruit Logo" className="h-12 w-auto object-contain" />
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Nền tảng tuyển dụng nhân sự thông minh. Kết nối nhà tuyển dụng và ứng viên tiềm năng với công nghệ AI phân tích CV.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="w-8 h-8 rounded-full bg-gray-200 hover:bg-blue-500 hover:text-white text-gray-500 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-200 hover:bg-blue-600 hover:text-white text-gray-500 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-200 hover:bg-blue-700 hover:text-white text-gray-500 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667h-3.554v-11.452h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zm-15.11-13.019c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019h-3.564v-11.452h3.564v11.452zm17.338-20.452h-21.338c-.985 0-1.782.797-1.782 1.782v20.436c0 .985.797 1.782 1.782 1.782h21.338c.986 0 1.782-.797 1.782-1.782v-20.436c0-.985-.796-1.782-1.782-1.782z"/></svg>
              </a>
            </div>
          </div>

          {/* Về chúng tôi */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">Về 8386recruit</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-sm text-gray-500 hover:text-brand-500 transition-colors">Giới thiệu</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-brand-500 transition-colors">Liên hệ</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-brand-500 transition-colors">Điều khoản dịch vụ</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-brand-500 transition-colors">Chính sách bảo mật</a></li>
            </ul>
          </div>

          {/* Dành cho ứng viên */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">Ứng viên</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-sm text-gray-500 hover:text-brand-500 transition-colors">Tạo CV Online</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-brand-500 transition-colors">Cẩm nang nghề nghiệp</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-brand-500 transition-colors">Tính lương Gross - Net</a></li>
            </ul>
          </div>

          {/* Dành cho nhà tuyển dụng */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">Nhà tuyển dụng</h4>
            <ul className="space-y-2.5">
              <li><Link to="/register" className="text-sm text-gray-500 hover:text-brand-500 transition-colors">Đăng tin tuyển dụng</Link></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-brand-500 transition-colors">Tìm kiếm ứng viên</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-brand-500 transition-colors">Giải pháp nhân sự</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-brand-500 transition-colors">Bảng giá dịch vụ</a></li>
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-200 mt-8 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                contact@8386recruit.vn
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                0123 456 789
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                TP. Hồ Chí Minh, Việt Nam
              </span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} 8386recruit. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
