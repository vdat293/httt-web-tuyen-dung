import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobsAPI } from '../api';
import Layout from '../components/Layout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import JobCard from '../components/JobCard';

// ─── Dữ liệu ngành nghề & từ khóa gợi ý (TopCV style) ────────────────────
const JOB_CATEGORIES = [
  {
    name: 'Công nghệ thông tin',
    keywords: ['Lập trình viên', 'Frontend Developer', 'Backend Developer', 'Fullstack Developer', 'DevOps Engineer', 'Mobile Developer', 'QA/Tester'],
  },
  {
    name: 'Kinh doanh/Bán hàng',
    keywords: ['Nhân viên kinh doanh', 'Nhân viên bán hàng', 'Nhân viên tư vấn', 'Sales Admin', 'Sales Online', 'Sales Manager'],
  },
  {
    name: 'Marketing/PR/Quảng cáo',
    keywords: ['Content Marketing', 'Digital Marketing', 'SEO Specialist', 'Social Media', 'Graphic Designer', 'Brand Manager'],
  },
  {
    name: 'Nhân sự/Hành chính',
    keywords: ['HR Manager', 'Tuyển dụng', 'Hành chính văn phòng', 'Thư ký', 'Lễ tân', 'C&B Specialist'],
  },
  {
    name: 'Tài chính/Kế toán',
    keywords: ['Kế toán tổng hợp', 'Kế toán thuế', 'Kế toán trưởng', 'Tài chính doanh nghiệp', 'Kiểm toán', 'Business Analyst'],
  },
  {
    name: 'Thiết kế/Sáng tạo',
    keywords: ['UI/UX Designer', 'Graphic Designer', 'Motion Designer', 'Product Designer', '3D Artist', 'Video Editor'],
  },
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
  const [filters, setFilters] = useState({ title: '', location: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const navigate = useNavigate();

  // ─── Dropdown states ───────────────────────────────────────────────
  const [showCategoryPanel, setShowCategoryPanel] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const [showSearchLocDropdown, setShowSearchLocDropdown] = useState(false);
  const [showFilterLocDropdown, setShowFilterLocDropdown] = useState(false);
  const searchBoxRef = useRef(null);
  const searchLocRef = useRef(null);
  const filterLocRef = useRef(null);
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
        location: filters.location || undefined
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
    navigate(`/jobs?${params.toString()}`);
  };

  const handleKeywordClick = (keyword) => {
    setFilters({ ...filters, title: keyword });
    setShowCategoryPanel(false);
    const params = new URLSearchParams();
    params.set('q', keyword);
    if (filters.location && filters.location !== 'Tất cả địa điểm') params.set('location', filters.location);
    navigate(`/jobs?${params.toString()}`);
  };

  const handleLocationSelect = (loc) => {
    setFilters({ ...filters, location: loc === 'Tất cả địa điểm' ? '' : loc });
    setShowSearchLocDropdown(false);
    setShowFilterLocDropdown(false);
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

          {/* ═══════ Search Bar (TopCV Style) ═══════ */}
          <div className="max-w-4xl mx-auto relative" ref={searchBoxRef}>
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
            {showCategoryPanel && (
              <div
                className="category-panel"
                onMouseEnter={handlePanelMouseEnter}
                onMouseLeave={handlePanelMouseLeave}
              >
                {/* Left - Category List */}
                <div className="category-sidebar">
                  {JOB_CATEGORIES.map((cat, idx) => (
                    <button
                      key={cat.name}
                      type="button"
                      onMouseEnter={() => setActiveCategory(idx)}
                      onClick={() => handleKeywordClick(cat.name)}
                      className={`category-item ${activeCategory === idx ? 'active' : ''}`}
                    >
                      <span>{cat.name}</span>
                      <svg className="w-3.5 h-3.5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>

                {/* Right - Keywords */}
                <div className="category-keywords">
                  <div className="keywords-section">
                    <p className="keywords-label">
                      <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      Được tìm kiếm nhiều
                    </p>
                    <div className="keywords-tags">
                      {POPULAR_KEYWORDS.map((kw) => (
                        <button
                          key={kw}
                          type="button"
                          onClick={() => handleKeywordClick(kw)}
                          className="keyword-tag popular"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                          </svg>
                          {kw}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="keywords-divider"></div>

                  <div className="keywords-section">
                    <p className="keywords-label">
                      <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {JOB_CATEGORIES[activeCategory].name}
                    </p>
                    <div className="keywords-tags">
                      {JOB_CATEGORIES[activeCategory].keywords.map((kw) => (
                        <button
                          key={kw}
                          type="button"
                          onClick={() => handleKeywordClick(kw)}
                          className="keyword-tag"
                        >
                          {kw}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stats bar */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 mt-8 text-white/80 text-sm">
            <div className="text-center">
              <span className="text-xl sm:text-2xl font-bold text-white block">{totalJobs > 0 ? totalJobs : jobs.length}</span>
              <span className="text-xs">Việc làm</span>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="text-center">
              <span className="text-xl sm:text-2xl font-bold text-white block">500+</span>
              <span className="text-xs">Công ty</span>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="text-center">
              <span className="text-xl sm:text-2xl font-bold text-white block">AI</span>
              <span className="text-xs">Parse CV</span>
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
                {['Hà Nội', 'Thành phố Hồ Chí Minh', 'Miền Bắc', 'Miền Nam', 'Đà Nẵng', 'Bình Dương'].map(tag => (
                  <button 
                    key={tag}
                    onClick={() => setFilters({ ...filters, location: tag })}
                    className={`filter-tag ${filters.location === tag ? 'active' : ''}`}
                  >
                    {tag === 'Thành phố Hồ Chí Minh' ? 'TP. Hồ Chí Minh' : tag}
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
