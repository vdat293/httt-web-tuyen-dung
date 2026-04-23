import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { jobsAPI } from '../api';
import JobCard from '../components/JobCard';
import JobFilters from '../components/JobFilters';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';

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

function formatSalary(salary) {
  if (!salary) return 'Thỏa thuận';
  if (typeof salary === 'string') return salary;
  if (salary.min === 0 && salary.max === 0) return 'Thỏa thuận';
  const fmt = (n) => (n >= 1000000 ? `${(n / 1000000).toFixed(0)}M` : n);
  if (salary.max > 0) return `${fmt(salary.min)} - ${fmt(salary.max)}`;
  return `Từ ${fmt(salary.min)}`;
}


const DEFAULT_FILTERS = {
  q: '',
  location: '',
  jobType: '',
  experience: '',
  salaryMin: '',
  salaryMax: '',
  skills: '',
  sort: 'createdAt',
  order: 'desc',
  page: 1,
  limit: 12,
};

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Init filters from URL query params
  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    q: searchParams.get('q') || '',
    location: searchParams.get('location') || '',
    jobType: searchParams.get('jobType') || '',
    experience: searchParams.get('experience') || '',
    salaryMin: searchParams.get('salaryMin') || '',
    salaryMax: searchParams.get('salaryMax') || '',
    skills: searchParams.get('skills') || '',
    sort: searchParams.get('sort') || 'createdAt',
    order: searchParams.get('order') || 'desc',
    page: Number(searchParams.get('page')) || 1,
    limit: 12,
  }));

  // ─── Dropdown states (New) ─────────────────────────────────────────
  const [showCategoryPanel, setShowCategoryPanel] = useState(false);
  const [showSearchLocDropdown, setShowSearchLocDropdown] = useState(false);
  const searchBoxRef = useRef(null);
  const searchLocRef = useRef(null);
  const panelTimeoutRef = useRef(null);


  // ─── Interaction Logic (New) ──────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowCategoryPanel(false);
      }
      if (searchLocRef.current && !searchLocRef.current.contains(e.target)) {
        setShowSearchLocDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeywordClick = (keyword) => {
    setFilters(prev => ({ ...prev, q: keyword, page: 1 }));
    setShowCategoryPanel(false);
    // updateURL is called by the debounce useEffect automatically when filters.q changes
  };

  const handleLocationSelect = (loc) => {
    setFilters(prev => ({ 
      ...prev, 
      location: loc === 'Tất cả địa điểm' ? '' : loc,
      page: 1 
    }));
    setShowSearchLocDropdown(false);
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

  const fetchJobs = useCallback(async (f) => {

    setLoading(true);
    try {
      const params = { ...f };
      // Clean empty params
      Object.keys(params).forEach((k) => {
        if (params[k] === '' || params[k] === null || params[k] === undefined) {
          delete params[k];
        }
      });
      const { data } = await jobsAPI.searchJobs(params);
      setJobs(data.jobs || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync filters with URL params whenever they change
  useEffect(() => {
    const newFilters = {
      ...DEFAULT_FILTERS,
      q: searchParams.get('q') || '',
      location: searchParams.get('location') || '',
      jobType: searchParams.get('jobType') || '',
      experience: searchParams.get('experience') || '',
      salaryMin: searchParams.get('salaryMin') || '',
      salaryMax: searchParams.get('salaryMax') || '',
      skills: searchParams.get('skills') || '',
      sort: searchParams.get('sort') || 'createdAt',
      order: searchParams.get('order') || 'desc',
      page: Number(searchParams.get('page')) || 1,
    };
    setFilters(newFilters);
    fetchJobs(newFilters);
  }, [searchParams, fetchJobs]);

  const updateURL = (newFilters) => {
    const params = new URLSearchParams();
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key] && newFilters[key] !== DEFAULT_FILTERS[key]) {
        params.set(key, newFilters[key]);
      }
    });
    navigate(`/jobs?${params.toString()}`, { replace: true });
  };

  const handleSearch = () => {
    updateURL({ ...filters, page: 1 });
  };

  const handleFilterChange = (newFilters) => {
    // Determine what changed by comparing with current filters
    const isTextChange = 
      (newFilters.q !== undefined && newFilters.q !== filters.q) || 
      (newFilters.location !== undefined && newFilters.location !== filters.location) || 
      (newFilters.skills !== undefined && newFilters.skills !== filters.skills);

    setFilters(newFilters);
    
    if (!isTextChange) {
      updateURL({ ...newFilters, page: 1 });
    }
  };

  const handleSort = ({ sort, order }) => {
    const updated = { ...filters, sort, order, page: 1 };
    setFilters(updated);
    updateURL(updated);
  };

  const handlePageChange = (page) => {
    const updated = { ...filters, page };
    setFilters(updated);
    updateURL(updated);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Debounce real-time search for text inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentQ = searchParams.get('q') || '';
      const currentLoc = searchParams.get('location') || '';
      const currentSkills = searchParams.get('skills') || '';
      
      if (
        filters.q !== currentQ || 
        filters.location !== currentLoc || 
        filters.skills !== currentSkills
      ) {
        updateURL({ ...filters, page: 1 });
      }
    }, 400); // Giảm xuống 400ms để cảm giác nhanh hơn

    return () => clearTimeout(timer);
  }, [filters.q, filters.location, filters.skills]);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= filters.page - 1 && i <= filters.page + 1)
    ) {
      pageNumbers.push(i);
    } else if (i === filters.page - 2 || i === filters.page + 2) {
      pageNumbers.push('...');
    }
  }

  return (
    <>
      {/* Hero */}
      <div className="hero-search-section">
        {/* Background decorations */}
        <div className="hero-bg-decor">
          <div className="hero-circle hero-circle-1"></div>
          <div className="hero-circle hero-circle-2"></div>
          <div className="hero-circle hero-circle-3"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 relative z-50">
          <h1 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2">
            Tìm việc làm, Tuyển dụng hiệu quả
          </h1>
          <p className="text-sm sm:text-base text-white/70 text-center mb-8 max-w-lg mx-auto">
            Kết nối hàng nghìn nhà tuyển dụng và ứng viên. Tích hợp AI phân tích CV tự động.
          </p>

          {/* ═══════ Search Bar & Content ═══════ */}
          <div className="max-w-5xl lg:max-w-6xl w-full mx-auto relative" ref={searchBoxRef}>
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="w-full">
              <div className="search-bar-wrapper">
                {/* Keyword Input */}
                <div className="search-input-group search-input-keyword">
                  <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Vị trí tuyển dụng, tên công ty..."
                    value={filters.q}
                    onChange={(e) => setFilters({ ...filters, q: e.target.value })}
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
                <button type="button" onClick={handleSearch} className="search-submit-btn">
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
                className={`search-suggestion-panel ${filters.q ? 'autocomplete-mode' : ''}`}
                onMouseEnter={handlePanelMouseEnter}
                onMouseLeave={handlePanelMouseLeave}
              >
                {!filters.q ? (
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
                    {(() => {
                      const lowerTitle = filters.q.toLowerCase();
                      const matchingKeywords = [];
                      JOB_CATEGORIES.forEach(cat => {
                        if (cat.name.toLowerCase().includes(lowerTitle) && !matchingKeywords.includes(cat.name)) matchingKeywords.push(cat.name);
                        cat.keywords.forEach(kw => {
                          if (kw.toLowerCase().includes(lowerTitle) && !matchingKeywords.includes(kw)) matchingKeywords.push(kw);
                        });
                      });

                      const matchingJobs = jobs.filter(job => 
                        job.title.toLowerCase().includes(lowerTitle) || 
                        job.employerId?.name?.toLowerCase().includes(lowerTitle)
                      );

                      if (matchingKeywords.length === 0 && matchingJobs.length === 0) {
                        return (
                          <div className="px-5 py-4 text-sm text-meta text-center border-t border-line">
                            Tìm việc làm liên quan tới "{filters.q}"
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
                            onClick={() => handleKeywordClick(filters.q)}
                          >
                            Xem tất cả kết quả cho "{filters.q}" →
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="sticky top-20">
              <h2 className="text-sm font-semibold text-heading mb-3">Bộ lọc</h2>
              <JobFilters filters={filters} onChange={handleFilterChange} onSort={handleSort} />
            </div>
          </div>

          {/* Job Listings */}
          <div className="flex-1 min-w-0">
            {/* Result header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-heading">
                  {loading ? 'Đang tải...' : `${total} việc làm`}
                </h2>
                {filters.q && (
                  <p className="text-xs text-meta mt-0.5">
                    Kết quả cho "{filters.q}"
                  </p>
                )}
              </div>
            </div>

            {loading ? (
              <LoadingSkeleton type="card" count={6} />
            ) : jobs.length === 0 ? (
              <EmptyState
                icon="🔍"
                title="Không tìm thấy kết quả"
                description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để tìm việc làm phù hợp."
              />
            ) : (
              <>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {jobs.map((job) => (
                    <JobCard key={job._id} job={job} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-8">
                    <button
                      onClick={() => handlePageChange(Math.max(1, filters.page - 1))}
                      disabled={filters.page === 1}
                      className="btn-ghost !px-3 !py-1.5 disabled:opacity-40"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {pageNumbers.map((page, idx) =>
                      page === '...' ? (
                        <span key={`ellipsis-${idx}`} className="px-2 py-1.5 text-sm text-meta">...</span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-9 h-9 text-sm font-medium rounded-lg transition-colors ${
                            filters.page === page
                              ? 'bg-brand-500 text-white'
                              : 'text-meta hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}

                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, filters.page + 1))}
                      disabled={filters.page === totalPages}
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
          </div>
        </div>
      </div>
    </>
  );
}
