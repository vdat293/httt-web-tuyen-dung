import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { jobsAPI } from '../api';
import JobCard from '../components/JobCard';
import JobFilters from '../components/JobFilters';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';

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
    updateURL({ ...filters, ...newFilters, page: 1 });
  };

  const handleSort = ({ sort, order }) => {
    updateURL({ ...filters, sort, order, page: 1 });
  };

  const handlePageChange = (page) => {
    updateURL({ ...filters, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-brand-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-20 w-60 h-60 bg-white rounded-full translate-y-1/2"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2">
            Tìm việc làm, Tuyển dụng hiệu quả
          </h1>
          <p className="text-sm sm:text-base text-white/70 text-center mb-8 max-w-lg mx-auto">
            Kết nối hàng nghìn nhà tuyển dụng và ứng viên. Tích hợp AI phân tích CV tự động.
          </p>
          {/* Quick search bar */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg p-1.5 flex flex-col sm:flex-row gap-2 shadow-lg">
              <div className="flex-1 flex items-center gap-2 px-3">
                <svg className="w-4 h-4 text-meta flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Vị trí tuyển dụng, tên công ty..."
                  value={filters.q}
                  onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 py-2.5 outline-none text-sm text-heading placeholder:text-meta"
                />
              </div>
              <div className="sm:w-48 flex items-center gap-2 px-3 sm:border-l border-line">
                <svg className="w-4 h-4 text-meta flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Địa điểm..."
                  value={filters.location}
                  onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 py-2.5 outline-none text-sm text-heading placeholder:text-meta"
                />
              </div>
              <button
                onClick={handleSearch}
                className="btn-primary !rounded-md !px-6 sm:!px-8"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Tìm kiếm
              </button>
            </div>
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
