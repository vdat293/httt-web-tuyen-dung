import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobsAPI } from '../api';
import Layout from '../components/Layout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ title: '', location: '' });

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const { data } = await jobsAPI.getAll({});
      setJobs(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await jobsAPI.getAll(filters);
      setJobs(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <>
      {/* Hero Section - TopCV style green gradient */}
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

          {/* Search Bar - TopCV style */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg p-1.5 flex flex-col sm:flex-row gap-2 shadow-lg">
              <div className="flex-1 flex items-center gap-2 px-3">
                <svg className="w-4 h-4 text-meta flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Vị trí tuyển dụng, tên công ty..."
                  value={filters.title}
                  onChange={(e) => setFilters({ ...filters, title: e.target.value })}
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
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="flex-1 py-2.5 outline-none text-sm text-heading placeholder:text-meta"
                />
              </div>
              <button type="submit" className="btn-primary !rounded-md !px-6 sm:!px-8">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Tìm kiếm
              </button>
            </div>
          </form>

          {/* Stats bar */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 mt-8 text-white/80 text-sm">
            <div className="text-center">
              <span className="text-xl sm:text-2xl font-bold text-white block">{jobs.length}</span>
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

      {/* Job Listings */}
      <Layout>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="section-title">Việc làm tốt nhất</h2>
            <p className="text-sm text-meta mt-0.5">
              {loading ? 'Đang tải...' : `${jobs.length} việc làm được tìm thấy`}
            </p>
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton type="card" count={6} />
        ) : jobs.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="Không tìm thấy kết quả"
            description="Thử thay đổi từ khóa tìm kiếm để tìm việc làm phù hợp."
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <Link
                key={job._id}
                to={`/jobs/${job._id}`}
                className="card p-4 block group transition-shadow duration-200 hover:shadow-card-hover"
              >
                <div className="flex gap-3">
                  {/* Company Logo Container */}
                  <div className="w-12 h-12 rounded-lg border border-line bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {job.employerId?.companyLogo ? (
                      <img 
                        src={job.employerId.companyLogo} 
                        alt={job.employerId?.name || 'Company Logo'} 
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <span className="text-brand-500 font-bold text-sm">
                        {job.employerId?.name?.charAt(0)?.toUpperCase() || 'C'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-heading group-hover:text-brand-500 transition-colors line-clamp-2 leading-snug">
                      {job.title}
                    </h3>
                    <p className="text-xs text-meta mt-0.5 truncate">{job.employerId?.name}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="tag tag-green">{job.salary || 'Thỏa thuận'}</span>
                  <span className="tag tag-gray">{job.location}</span>
                </div>
                {job.skills && job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {job.skills.slice(0, 3).map((skill) => (
                      <span key={skill} className="text-xs text-meta bg-bgSection px-2 py-0.5 rounded">
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 3 && (
                      <span className="text-xs text-meta">+{job.skills.length - 3}</span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </Layout>
    </>
  );
}
