import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobsAPI } from '../api';
import Layout from '../components/Layout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import JobCard from '../components/JobCard';
import bannerGreen from '../assets/banner-green.png';
import bannerDark from '../assets/banner-dark.png';
import bannerTop from '../assets/banner-top.png';

// ─── Dữ liệu ngành nghề & từ khóa gợi ý (TopCV style) ────────────────────
const JOB_CATEGORIES = [
  { name: 'Kinh doanh/Bán hàng', keywords: ['Nhân viên kinh doanh', 'Nhân viên bán hàng', 'Nhân viên tư vấn', 'Sales Admin', 'Sales Online', 'Sales Manager'] },
  { name: 'Marketing/PR/Quảng cáo', keywords: ['Content Marketing', 'Digital Marketing', 'SEO Specialist', 'Social Media', 'Graphic Designer', 'Brand Manager'] },
  { name: 'Chăm sóc khách hàng (Customer Service)', keywords: ['Chăm sóc khách hàng', 'Telesales', 'Trực page'] },
  { name: 'Nhân sự/Hành chính/Pháp chế', keywords: ['HR Manager', 'Tuyển dụng', 'Hành chính văn phòng', 'Thư ký', 'Lễ tân', 'C&B Specialist'] },
  { name: 'Công nghệ Thông tin', keywords: ['Lập trình viên', 'Frontend Developer', 'Backend Developer', 'Fullstack Developer', 'DevOps Engineer', 'Mobile Developer', 'QA/Tester'] },
  { name: 'Lao động phổ thông', keywords: ['Giao hàng', 'Bảo vệ', 'Tạp vụ'] },
  { name: 'Tài chính/Ngân hàng/Bảo hiểm', keywords: ['Tín dụng', 'Giao dịch viên', 'Đại lý bảo hiểm'] },
  { name: 'Bất động sản', keywords: ['Môi giới bất động sản', 'Chuyên viên tư vấn'] },
  { name: 'Xây dựng', keywords: ['Kỹ sư xây dựng', 'Giám sát thi công', 'Họa viên kiến trúc'] },
  { name: 'Kế toán/Kiểm toán/Thuế', keywords: ['Kế toán tổng hợp', 'Kế toán thuế', 'Kế toán trưởng', 'Kiểm toán viên'] },
  { name: 'Sản xuất', keywords: ['Kỹ sư sản xuất', 'QA/QC', 'Quản đốc'] },
  { name: 'Giáo dục/Đào tạo', keywords: ['Giáo viên', 'Trợ giảng', 'Quản lý đào tạo'] },
  { name: 'Bán lẻ/Dịch vụ đời sống', keywords: ['Cửa hàng trưởng', 'Nhân viên cửa hàng'] },
  { name: 'Phim và truyền hình/Báo chí/Xuất bản', keywords: ['Phóng viên', 'Biên tập viên', 'Quay phim'] },
  { name: 'Điện/Điện tử/Viễn thông', keywords: ['Kỹ sư điện', 'Thiết kế mạch', 'Bảo trì'] },
  { name: 'Logistics/Thu mua/Kho/Vận tải', keywords: ['Xuất nhập khẩu', 'Quản lý kho', 'Purchasing'] },
  { name: 'Tư vấn chuyên môn', keywords: ['Cố vấn', 'Chuyên gia'] },
  { name: 'Dược/Y tế/Sức khoẻ/Công nghệ sinh học', keywords: ['Dược sĩ', 'Điều dưỡng', 'Bác sĩ'] },
  { name: 'Thiết kế', keywords: ['UI/UX Designer', 'Graphic Designer', 'Product Designer', 'Motion Designer', '3D Artist', 'Video Editor'] },
  { name: 'Nhà hàng/Khách sạn/Du lịch', keywords: ['Quản lý nhà hàng', 'Lễ tân khách sạn', 'Hướng dẫn viên'] },
  { name: 'Năng lượng/Môi trường/Nông nghiệp', keywords: ['Kỹ sư nông nghiệp', 'Kỹ sư môi trường'] },
  { name: 'Tài xế', keywords: ['Tài xế xe tải', 'Tài xế công nghệ'] },
  { name: 'Biên phiên dịch', keywords: ['Phiên dịch tiếng Nhật', 'Biên dịch tiếng Anh'] },
  { name: 'Luật', keywords: ['Luật sư', 'Pháp chế', 'Trợ lý luật sư'] },
  { name: 'Nhóm nghề khác', keywords: ['Các ngành nghề khác'] }
];

const POPULAR_KEYWORDS = [
  'ReactJS', 'Java', 'Python', 'NodeJS', 'Spring Boot', 'Lập trình viên', 'Data Engineer', 'DevOps',
];

const LOCATIONS = [
  'Tất cả địa điểm',
  'Hà Nội',
  'Hồ Chí Minh',
  'Đà Nẵng',
  'Bình Dương',
  'Cần Thơ',
  'Hải Phòng',
  'Khác',
];

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ title: '', location: '', category: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const navigate = useNavigate();

  // ─── Dropdown states ───────────────────────────────────────────────
  const [showCategoryPanel, setShowCategoryPanel] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const [showSearchLocDropdown, setShowSearchLocDropdown] = useState(false);
  const [showFilterLocDropdown, setShowFilterLocDropdown] = useState(false);
  const [showSearchCategoryDropdown, setShowSearchCategoryDropdown] = useState(false);
  const [sidebarPage, setSidebarPage] = useState(1);
  const searchBoxRef = useRef(null);
  const searchLocRef = useRef(null);
  const filterLocRef = useRef(null);
  const searchCategoryRef = useRef(null);
  const panelTimeoutRef = useRef(null);

  useEffect(() => { loadJobs(page); }, [page]);

  // Close panels on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowCategoryPanel(false);
      }
      if (searchLocRef.current && !searchLocRef.current.contains(e.target)) {
        setShowSearchLocDropdown(false);
      }
      if (filterLocRef.current && !filterLocRef.current.contains(e.target)) {
        setShowFilterLocDropdown(false);
      }
      if (searchCategoryRef.current && !searchCategoryRef.current.contains(e.target)) {
        setShowSearchCategoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadJobs = async (currentPage) => {
    setLoading(true);
    try {
      const { data } = await jobsAPI.getAll({ 
        page: currentPage, 
        limit: 9,
        q: filters.title || undefined,
        location: filters.location || undefined,
        category: filters.category || undefined
      });
      if (data && data.jobs) {
        setJobs(data.jobs);
        setTotalPages(data.totalPages);
        setTotalJobs(data.total);
      } else {
        setJobs(Array.isArray(data) ? data : []);
        setTotalJobs(Array.isArray(data) ? data.length : 0);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    setPage(1);
    loadJobs(1);
  }, [filters]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (filters.title) params.set('q', filters.title);
    if (filters.location && filters.location !== 'Tất cả địa điểm') params.set('location', filters.location);
    if (filters.category && filters.category !== 'Tất cả ngành nghề') params.set('category', filters.category);
    navigate(`/jobs?${params.toString()}`);
  };

  const handleKeywordClick = (keyword) => {
    setFilters({ ...filters, title: keyword });
    setShowCategoryPanel(false);
    const params = new URLSearchParams();
    params.set('q', keyword);
    if (filters.location && filters.location !== 'Tất cả địa điểm') params.set('location', filters.location);
    if (filters.category && filters.category !== 'Tất cả ngành nghề') params.set('category', filters.category);
    navigate(`/jobs?${params.toString()}`);
  };

  const handleLocationSelect = (loc) => {
    setFilters({ ...filters, location: loc === 'Tất cả địa điểm' ? '' : loc });
    setShowSearchLocDropdown(false);
    setShowFilterLocDropdown(false);
  };

  const handleCategorySelect = (cat) => {
    const newCategory = cat === 'Tất cả ngành nghề' ? '' : cat;
    setFilters({ ...filters, category: newCategory });
    setShowSearchCategoryDropdown(false);
    
    // Auto submit search like TopCV
    const params = new URLSearchParams();
    if (filters.title) params.set('q', filters.title);
    if (filters.location && filters.location !== 'Tất cả địa điểm') params.set('location', filters.location);
    if (newCategory) params.set('category', newCategory);
    navigate(`/jobs?${params.toString()}`);
  };

  const handleSearchInputFocus = () => {
    clearTimeout(panelTimeoutRef.current);
    setShowCategoryPanel(true);
  };

  const handlePanelMouseLeave = () => {
    panelTimeoutRef.current = setTimeout(() => {
      setShowCategoryPanel(false);
    }, 300);
  };

  const handlePanelMouseEnter = () => {
    clearTimeout(panelTimeoutRef.current);
  };

  const ITEMS_PER_PAGE = 6;
  const totalSidebarPages = Math.ceil(JOB_CATEGORIES.length / ITEMS_PER_PAGE);
  const currentSidebarCategories = JOB_CATEGORIES.slice(
    (sidebarPage - 1) * ITEMS_PER_PAGE,
    sidebarPage * ITEMS_PER_PAGE
  );

  return (
    <>
      {/* ═══════════ Hero Section ═══════════ */}
      <div className="hero-search-section">
        {/* Background decorations */}
        <div className="hero-bg-decor">
          <div className="hero-circle hero-circle-1"></div>
          <div className="hero-circle hero-circle-2"></div>
          <div className="hero-circle hero-circle-3"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2">
            Tìm việc làm, Tuyển dụng hiệu quả
          </h1>
          <p className="text-sm sm:text-base text-white/70 text-center mb-8 max-w-lg mx-auto">
            Kết nối hàng nghìn nhà tuyển dụng và ứng viên. Tích hợp AI phân tích CV tự động.
          </p>

          {/* ═══════ Search Bar & Content ═══════ */}
          <div className="max-w-5xl lg:max-w-6xl mx-auto relative" ref={searchBoxRef}>
            <form onSubmit={handleSearch}>
              <div className="search-bar-wrapper">
                {/* Keyword Input */}
                <div className="search-input-group search-input-keyword">
                  <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Vị trí tuyển dụng, tên công ty..."
                    value={filters.title}
                    onChange={(e) => setFilters({ ...filters, title: e.target.value })}
                    onFocus={handleSearchInputFocus}
                    className="search-input"
                    autoComplete="off"
                  />
                </div>

                {/* Category Input removed to match required layout */}

                {/* Location Input */}
                <div className="search-input-group search-input-location" ref={searchLocRef}>
                  <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <button
                    type="button"
                    onClick={() => setShowSearchLocDropdown(!showSearchLocDropdown)}
                    className="search-input search-location-btn"
                  >
                    <span>{filters.location || 'Địa điểm'}</span>
                    <svg className="location-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: showSearchLocDropdown ? 'rotate(180deg)' : 'rotate(0)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Location Dropdown */}
                  {showSearchLocDropdown && (
                    <div className="location-dropdown">
                      {LOCATIONS.map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => handleLocationSelect(loc)}
                          className={`location-option ${(filters.location === loc || (!filters.location && loc === 'Tất cả địa điểm')) ? 'active' : ''}`}
                        >
                          {loc === 'Tất cả địa điểm' && (
                            <svg className="w-4 h-4 mr-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          {loc}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search Button */}
                <button type="submit" className="search-submit-btn">
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Tìm kiếm
                </button>
              </div>
            </form>

            {/* ═══════ Category Panel (Dropdown) ═══════ */}
            {/* Suggestion panel removed upon request */}
          </div>

            {/* ═══════ Hero Content (Sidebar + Banners) ═══════ */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-3">
              <div className="hidden lg:flex flex-col bg-white rounded-xl shadow-sm text-heading overflow-hidden border border-line h-[300px]">
                <div className="flex flex-col py-1.5 overflow-y-auto scrollbar-hide flex-1">
                  {currentSidebarCategories.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => handleCategorySelect(cat.name)}
                      className="flex items-center justify-between px-4 py-[10px] text-[13.5px] hover:bg-gray-50 hover:text-brand-500 transition-colors group"
                    >
                      <span className="font-medium truncate text-left">{cat.name}</span>
                      <svg className="w-3.5 h-3.5 opacity-30 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
                {/* Pagination Footer */}
                <div className="mt-auto border-t border-line flex items-center justify-between px-4 py-3 bg-white shrink-0">
                  <span className="text-[13px] text-meta font-medium">{sidebarPage}/{totalSidebarPages}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSidebarPage(p => Math.max(1, p - 1))}
                      disabled={sidebarPage === 1}
                      className="w-7 h-7 rounded-full border border-line flex items-center justify-center text-meta hover:bg-gray-50 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button 
                      onClick={() => setSidebarPage(p => Math.min(totalSidebarPages, p + 1))}
                      disabled={sidebarPage === totalSidebarPages}
                      className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-colors ${sidebarPage === totalSidebarPages ? 'border border-line text-meta disabled:opacity-30 disabled:cursor-not-allowed' : 'border border-brand-500 text-brand-500 hover:bg-brand-50'}`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Banners Area */}
              <div className="col-span-1 lg:col-span-3 flex flex-col gap-4 h-[300px]">
                {/* Main Dark Banner */}
                <div className="flex-1 rounded-xl overflow-hidden relative shadow-sm cursor-pointer group">
                  <img 
                    src={bannerTop} 
                    alt="Tiếp lợi thế, nối thành công" 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
                </div>

                {/* Market Stats Banner */}
                <div className="shrink-0 bg-gradient-to-r from-brand-600 to-brand-500 rounded-xl px-5 py-4 border border-white/20 shadow-sm text-white flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-black/10 p-2.5 rounded-lg shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="font-semibold text-[15px]">Thị trường việc làm hôm nay</h3>
                        <span className="text-[12px] text-white/80 bg-black/10 px-2 py-0.5 rounded-full">17/04/2026</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-[13.5px]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-white/90">Việc làm đang tuyển</span>
                          <span className="font-bold text-[15px]">{totalJobs > 0 ? (totalJobs * 15).toLocaleString() : '64.876'}</span>
                          <svg className="w-3.5 h-3.5 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        </div>
                        <div className="w-px h-3.5 bg-white/30 hidden sm:block"></div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-white/90">Việc làm mới hôm nay</span>
                          <span className="font-bold text-[15px]">5.078</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>

      {/* ═══════════ Filter Navigation Bar ═══════════ */}
      <div className="filter-nav-container category-filter-navigation-home-desktop-container sticky top-14 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="filter-nav-content">
            <div className="filter-nav-left">
              <div className="filter-nav-label">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25" />
                </svg>
                <span>Lọc theo:</span>
                
                {/* Inline Location Select */}
                <div className="relative" ref={filterLocRef}>
                  <button 
                    onClick={() => setShowFilterLocDropdown(!showFilterLocDropdown)}
                    className="flex items-center gap-1 font-semibold text-heading hover:text-brand-500 transition-colors"
                  >
                    Địa điểm
                    <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${showFilterLocDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showFilterLocDropdown && (
                    <div className="location-dropdown">
                      {LOCATIONS.map((loc) => (
                        <button
                          key={loc}
                          onClick={() => handleLocationSelect(loc)}
                          className={`location-option ${(filters.location === loc || (!filters.location && loc === 'Tất cả địa điểm')) ? 'active' : ''}`}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="w-px h-5 bg-line mx-2 hidden sm:block"></div>

              {/* Scrollable Tags */}
              <div className="filter-nav-scroll">
                <button 
                  onClick={() => setFilters({ ...filters, location: '' })}
                  className={`filter-tag ${!filters.location ? 'active' : ''}`}
                >
                  Ngẫu Nhiên
                </button>
                {['Hà Nội', 'Hồ Chí Minh', 'Hải Phòng', 'Cần Thơ', 'Đà Nẵng', 'Bình Dương'].map(tag => (
                  <button 
                    key={tag}
                    onClick={() => setFilters({ ...filters, location: tag })}
                    className={`filter-tag ${filters.location === tag ? 'active' : ''}`}
                  >
                    {tag === 'Hồ Chí Minh' ? 'TP. Hồ Chí Minh' : tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-nav-right hidden lg:block">
              <Link to="/jobs" className="view-all-link">
                Xem tất cả
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ Job Listings ═══════════ */}
      <Layout>
        <div className="best-jobs-header">
          <h2 className="best-jobs-title">Việc làm tốt nhất</h2>
          <div className="best-jobs-badge">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 10V3L4 14H11V21L20 10H13Z" />
            </svg>
            <span>Đề xuất bởi TOPPY AI</span>
          </div>
        </div>
        
        <p className="text-sm text-meta -mt-3 mb-6">
          {loading ? 'Đang tải...' : `${totalJobs > 0 ? totalJobs : jobs.length} việc làm phù hợp đang chờ bạn`}
        </p>

        {loading ? (
          <LoadingSkeleton type="card" count={6} />
        ) : jobs.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="Không tìm thấy kết quả"
            description="Thử thay đổi từ khóa tìm kiếm để tìm việc làm phù hợp."
          />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-ghost !px-3 !py-1.5 disabled:opacity-40"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 text-sm font-medium rounded-lg transition-colors ${
                          page === p ? 'bg-brand-500 text-white' : 'text-meta hover:bg-gray-100'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  }
                  if (p === page - 2 || p === page + 2) {
                    return <span key={p} className="px-2 py-1.5 text-sm text-meta">...</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-ghost !px-3 !py-1.5 disabled:opacity-40"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </Layout>
    </>
  );
}
