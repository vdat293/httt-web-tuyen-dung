import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobsAPI } from '../api';
import Layout from '../components/Layout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import JobCard from '../components/JobCard';
import bannerImg from '../public/imgs/tiep-loi-the-banner.png';

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

const SALARY_RANGES = [
  { label: 'Tất cả mức lương', min: 0, max: 0 },
  { label: 'Dưới 10 triệu', min: 0, max: 10000000 },
  { label: '10 - 20 triệu', min: 10000000, max: 20000000 },
  { label: '20 - 30 triệu', min: 20000000, max: 30000000 },
  { label: 'Trên 30 triệu', min: 30000000, max: 999999999 },
  { label: 'Thỏa thuận', min: -1, max: -1 },
];

const EXPERIENCE_LEVELS = [
  { label: 'Tất cả kinh nghiệm', value: '' },
  { label: 'Chưa có kinh nghiệm', value: 'intern' },
  { label: 'Dưới 1 năm', value: 'fresher' },
  { label: '1 - 3 năm', value: 'junior' },
  { label: '3 - 5 năm', value: 'senior' },
  { label: 'Trên 5 năm', value: 'manager' },
];

const FILTER_TYPES = [
  { id: 'location', label: 'Địa điểm' },
  { id: 'salary', label: 'Mức lương' },
  { id: 'experience', label: 'Kinh nghiệm' },
  { id: 'category', label: 'Ngành nghề' },
];

function formatSalary(salary) {
  if (!salary) return 'Thỏa thuận';
  if (typeof salary === 'string') return salary;
  if (salary.min === 0 && salary.max === 0) return 'Thỏa thuận';
  const fmt = (n) => (n >= 1000000 ? `${(n / 1000000).toFixed(0)}M` : n);
  if (salary.max > 0) return `${fmt(salary.min)} - ${fmt(salary.max)}`;
  return `Từ ${fmt(salary.min)}`;
}

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ 
    title: '', 
    location: '', 
    category: '', 
    salaryMin: 0, 
    salaryMax: 0, 
    experience: '' 
  });
  const [activeFilterType, setActiveFilterType] = useState('location');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const navigate = useNavigate();

  // ─── Dropdown states ───────────────────────────────────────────────
  const [showCategoryPanel, setShowCategoryPanel] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const [showSearchLocDropdown, setShowSearchLocDropdown] = useState(false);
  const [showFilterTypeDropdown, setShowFilterTypeDropdown] = useState(false);
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
        setShowFilterTypeDropdown(false);
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
        category: filters.category || undefined,
        salaryMin: filters.salaryMin > 0 ? filters.salaryMin : (filters.salaryMin === -1 ? -1 : undefined),
        salaryMax: filters.salaryMax > 0 ? filters.salaryMax : (filters.salaryMax === -1 ? -1 : undefined),
        experience: filters.experience || undefined
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
    setFilters({ 
      ...filters, 
      location: loc === 'Tất cả địa điểm' || loc === 'Ngẫu Nhiên' ? '' : loc,
      category: '', experience: '', salaryMin: 0, salaryMax: 0 
    });
    setShowSearchLocDropdown(false);
    setShowFilterTypeDropdown(false);
  };

  const handleSalarySelect = (range) => {
    setFilters({ 
      ...filters, 
      salaryMin: range.min, 
      salaryMax: range.max,
      category: '', experience: '', location: ''
    });
  };

  const handleExperienceSelect = (exp) => {
    setFilters({ 
      ...filters, 
      experience: exp.value,
      category: '', salaryMin: 0, salaryMax: 0, location: ''
    });
  };

  const handleCategorySelect = (cat) => {
    const newCategory = cat === 'Tất cả ngành nghề' ? '' : cat;
    setFilters({ 
      ...filters, 
      category: newCategory,
      experience: '', salaryMin: 0, salaryMax: 0, location: ''
    });
    setShowSearchCategoryDropdown(false);
    
    // Auto submit search like TopCV if using categories
    if (activeFilterType === 'category') return; // Don't navigate if just filtering on home
    
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

            {/* ═══════ Search Suggestion Panel (Dropdown) ═══════ */}
            {showCategoryPanel && (
              <div
                className={`search-suggestion-panel ${filters.title ? 'autocomplete-mode' : ''}`}
                onMouseEnter={handlePanelMouseEnter}
                onMouseLeave={handlePanelMouseLeave}
              >
                {!filters.title ? (
                  <>
                    {/* Left - Popular Keywords */}
                    <div className="suggestion-keywords">
                      <p className="keywords-label">
                        <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Từ khóa phổ biến
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

                    {/* Right - Suggested Jobs */}
                    <div className="suggestion-jobs">
                      <p className="keywords-label">
                        <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Việc làm có thể bạn quan tâm
                      </p>
                      <div className="suggestion-jobs-list mt-3">
                        {jobs.slice(0, 5).map(job => (
                          <div
                            key={job._id}
                            className="suggestion-job-card"
                            onClick={() => navigate(`/jobs/${job._id}`)}
                          >
                            <div className="suggestion-job-logo">
                              {job.employerId?.companyLogo ? (
                                <img src={job.employerId.companyLogo} alt={job.employerId?.name || 'Company'} />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-brand-500 bg-brand-50 rounded text-lg">
                                  {job.employerId?.name?.charAt(0) || 'C'}
                                </div>
                              )}
                            </div>
                            <div className="suggestion-job-info">
                              <h4 className="suggestion-job-title">{job.title}</h4>
                              <p className="suggestion-job-company">{job.employerId?.name}</p>
                              <div className="suggestion-job-salary">{formatSalary(job.salary)}</div>
                            </div>
                          </div>
                        ))}
                        {jobs.length === 0 && !loading && (
                          <p className="text-sm text-meta italic">Không có đề xuất nào</p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="autocomplete-list">
                    {/* Autocomplete Results matching filters.title */}
                    {(() => {
                      const lowerTitle = filters.title.toLowerCase();
                      
                      // 1. Find matching categories/keywords
                      const matchingKeywords = [];
                      JOB_CATEGORIES.forEach(cat => {
                        if (cat.name.toLowerCase().includes(lowerTitle) && !matchingKeywords.includes(cat.name)) matchingKeywords.push(cat.name);
                        cat.keywords.forEach(kw => {
                          if (kw.toLowerCase().includes(lowerTitle) && !matchingKeywords.includes(kw)) matchingKeywords.push(kw);
                        });
                      });

                      // 2. Find matching jobs
                      const matchingJobs = jobs.filter(job => 
                        job.title.toLowerCase().includes(lowerTitle) || 
                        job.employerId?.name?.toLowerCase().includes(lowerTitle)
                      );

                      if (matchingKeywords.length === 0 && matchingJobs.length === 0) {
                        return (
                          <div className="px-5 py-4 text-sm text-meta text-center border-t border-line">
                            Tìm việc làm liên quan tới "{filters.title}"
                          </div>
                        );
                      }

                      return (
                        <>
                          {matchingKeywords.length > 0 && (
                            <div className="px-5 py-2 text-[11px] font-semibold text-meta uppercase tracking-wider bg-gray-50">
                              Tìm kiếm phổ biến
                            </div>
                          )}
                          {matchingKeywords.slice(0, 3).map(kw => (
                            <div 
                              key={kw} 
                              className="autocomplete-item"
                              onClick={() => handleKeywordClick(kw)}
                            >
                              <div className="autocomplete-icon">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                              </div>
                              <div className="autocomplete-content">
                                <div className="autocomplete-title">{kw}</div>
                              </div>
                            </div>
                          ))}

                          {matchingJobs.length > 0 && (
                            <div className="px-5 py-2 text-[11px] font-semibold text-meta uppercase tracking-wider bg-gray-50 mt-2 border-t border-line">
                              Việc làm & Công ty
                            </div>
                          )}
                          {matchingJobs.slice(0, 5).map(job => (
                            <div 
                              key={job._id} 
                              className="autocomplete-item"
                              onClick={() => {
                                setShowCategoryPanel(false);
                                navigate(`/jobs/${job._id}`);
                              }}
                            >
                              <div className="autocomplete-icon">
                                {job.employerId?.companyLogo ? (
                                  <img src={job.employerId.companyLogo} alt={job.employerId?.name || 'Company'} />
                                ) : (
                                  <span className="font-bold">{job.employerId?.name?.charAt(0) || 'C'}</span>
                                )}
                              </div>
                              <div className="autocomplete-content">
                                <div className="autocomplete-title">{job.title}</div>
                                <div className="autocomplete-meta">
                                  <span>{job.employerId?.name}</span>
                                  <span>•</span>
                                  <span className="text-brand-600 font-medium">{formatSalary(job.salary)}</span>
                                </div>
                              </div>
                            </div>
                          ))}

                          <div 
                            className="px-5 py-3 text-brand-500 font-medium text-sm text-center border-t border-line hover:bg-brand-50 cursor-pointer mt-2 transition-colors"
                            onClick={() => handleKeywordClick(filters.title)}
                          >
                            Xem tất cả kết quả cho "{filters.title}" →
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
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
                {/* Main Image Banner */}
                <div className="flex-1 rounded-xl overflow-hidden relative border border-line shadow-sm">
                  <img 
                    src={bannerImg} 
                    alt="Tiếp lợi thế, Nối thành công" 
                    className="w-full h-full object-cover"
                  />
                  {/* Optional: Overlay content if needed, but the image already has text */}
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
                
                {/* Primary Filter Type Select */}
                <div className="relative" ref={filterLocRef}>
                  <button 
                    onClick={() => setShowFilterTypeDropdown(!showFilterTypeDropdown)}
                    className="flex items-center gap-1 font-semibold text-brand-500 hover:text-brand-600 transition-colors bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-100"
                  >
                    {FILTER_TYPES.find(t => t.id === activeFilterType)?.label}
                    <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${showFilterTypeDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showFilterTypeDropdown && (
                    <div className="location-dropdown">
                      {FILTER_TYPES.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => {
                            if (activeFilterType !== type.id) {
                              setActiveFilterType(type.id);
                              setFilters(prev => ({
                                ...prev,
                                experience: '',
                                salaryMin: 0,
                                salaryMax: 0,
                                category: '',
                                // location is shared with search bar, but if we switch tabs, it usually means we start a new quick search dimension
                                location: type.id === 'location' ? prev.location : ''
                              }));
                            }
                            setShowFilterTypeDropdown(false);
                          }}
                          className={`location-option ${activeFilterType === type.id ? 'active' : ''}`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{type.label}</span>
                            {activeFilterType === type.id && (
                              <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="w-px h-5 bg-line mx-2 hidden sm:block"></div>

              {/* Dynamic Scrollable Tags */}
              <div className="filter-nav-scroll">
                {activeFilterType === 'location' && (
                  <>
                    <button 
                      onClick={() => handleLocationSelect('Ngẫu Nhiên')}
                      className={`filter-tag ${!filters.location ? 'active' : ''}`}
                    >
                      Ngẫu Nhiên
                    </button>
                    {['Hà Nội', 'Hồ Chí Minh', 'Hải Phòng', 'Cần Thơ', 'Đà Nẵng', 'Bình Dương'].map(tag => (
                      <button 
                        key={tag}
                        onClick={() => handleLocationSelect(tag)}
                        className={`filter-tag ${filters.location === tag ? 'active' : ''}`}
                      >
                        {tag === 'Hồ Chí Minh' ? 'TP. Hồ Chí Minh' : tag}
                      </button>
                    ))}
                  </>
                )}

                {activeFilterType === 'salary' && (
                  SALARY_RANGES.map(range => (
                    <button 
                      key={range.label}
                      onClick={() => handleSalarySelect(range)}
                      className={`filter-tag ${filters.salaryMin === range.min && filters.salaryMax === range.max ? 'active' : ''}`}
                    >
                      {range.label}
                    </button>
                  ))
                )}

                {activeFilterType === 'experience' && (
                  EXPERIENCE_LEVELS.map(exp => (
                    <button 
                      key={exp.label}
                      onClick={() => handleExperienceSelect(exp)}
                      className={`filter-tag ${filters.experience === exp.value ? 'active' : ''}`}
                    >
                      {exp.label}
                    </button>
                  ))
                )}

                {activeFilterType === 'category' && (
                  <>
                    <button 
                      onClick={() => handleCategorySelect('Tất cả ngành nghề')}
                      className={`filter-tag ${!filters.category ? 'active' : ''}`}
                    >
                      Tất cả
                    </button>
                    {JOB_CATEGORIES.slice(0, 8).map(cat => (
                      <button 
                        key={cat.name}
                        onClick={() => handleCategorySelect(cat.name)}
                        className={`filter-tag ${filters.category === cat.name ? 'active' : ''}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </>
                )}
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
