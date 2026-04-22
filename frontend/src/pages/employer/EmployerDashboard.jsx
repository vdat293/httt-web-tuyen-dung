import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { reportsAPI, jobsAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import StatusBadge from '../../components/StatusBadge';

export default function EmployerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [statsRes, jobsRes] = await Promise.all([
        reportsAPI.getStats(),
        jobsAPI.getMyJobs(),
      ]);
      setStats(statsRes.data);
      setRecentJobs(jobsRes.data.slice(0, 5));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <Layout>
      <LoadingSkeleton type="stats" />
      <div className="mt-6"><LoadingSkeleton type="list" count={4} /></div>
    </Layout>
  );

  const STATUS_CONFIG = {
    pending:   { label: 'Chờ duyệt', color: 'bg-amber-500',  bg: 'bg-amber-50',  text: 'text-amber-700' },
    reviewed:  { label: 'Đã xem',    color: 'bg-blue-500',   bg: 'bg-blue-50',   text: 'text-blue-700' },
    interview: { label: 'Phỏng vấn', color: 'bg-purple-500', bg: 'bg-purple-50', text: 'text-purple-700' },
    accepted:  { label: 'Nhận việc', color: 'bg-green-500',  bg: 'bg-green-50',  text: 'text-green-700' },
    rejected:  { label: 'Từ chối',   color: 'bg-red-500',    bg: 'bg-red-50',    text: 'text-red-700' },
  };

  const totalPipeline = stats?.statusBreakdown
    ? Object.values(stats.statusBreakdown).reduce((a, b) => a + b, 0)
    : 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Chào buổi sáng';
    if (h < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  return (
    <Layout>
      <div className="space-y-6">

        {/* ═══ Welcome Banner ═══ */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-500 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-1/2 w-40 h-40 bg-white/5 rounded-full translate-y-1/2"></div>
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {greeting()}, {user?.name?.split(' ').pop() || 'Nhà tuyển dụng'} 👋
            </h1>
            <p className="text-white/75 text-sm sm:text-base max-w-lg">
              Quản lý hoạt động tuyển dụng của bạn tại đây. Cập nhật tin đăng, theo dõi hồ sơ ứng viên và lên lịch phỏng vấn một cách hiệu quả.
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <button
                onClick={() => navigate('/employer/jobs/new')}
                className="px-5 py-2.5 bg-white text-brand-600 font-semibold rounded-xl text-sm hover:bg-brand-50 transition-all shadow-md active:scale-95"
              >
                + Đăng tin mới
              </button>
              <button
                onClick={() => navigate('/employer/applications')}
                className="px-5 py-2.5 bg-white/15 text-white font-semibold rounded-xl text-sm border border-white/25 hover:bg-white/25 transition-all active:scale-95"
              >
                Xem hồ sơ ứng viên
              </button>
            </div>
          </div>
        </div>

        {/* ═══ KPI Cards ═══ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Tin tuyển dụng',
              value: stats?.totalJobs || 0,
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ),
              iconBg: 'bg-brand-50', iconColor: 'text-brand-600',
              link: '/employer/jobs',
            },
            {
              label: 'Đơn ứng tuyển',
              value: stats?.totalApplications || 0,
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
              iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
              link: '/employer/applications',
            },
            {
              label: 'Phỏng vấn',
              value: stats?.statusBreakdown?.interview || 0,
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ),
              iconBg: 'bg-purple-50', iconColor: 'text-purple-600',
              link: '/employer/interviews',
            },
            {
              label: 'Tỷ lệ nhận việc',
              value: `${stats?.acceptedRate || 0}%`,
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              iconBg: 'bg-amber-50', iconColor: 'text-amber-600',
              link: '/employer/reports',
            },
          ].map((card) => (
            <Link
              key={card.label}
              to={card.link}
              className="bg-white rounded-xl border border-line p-5 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  {card.icon}
                </div>
                <svg className="w-4 h-4 text-gray-300 group-hover:text-brand-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-heading">{card.value}</p>
              <p className="text-xs text-meta mt-0.5">{card.label}</p>
            </Link>
          ))}
        </div>

        {/* ═══ Main Content Grid ═══ */}
        <div className="grid lg:grid-cols-5 gap-6">

          {/* Left: Pipeline + Recent Jobs */}
          <div className="lg:col-span-3 space-y-6">

            {/* Recruitment Pipeline */}
            {stats?.statusBreakdown && totalPipeline > 0 && (
              <div className="bg-white rounded-xl border border-line p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-6 bg-brand-500 rounded-full"></div>
                    <h2 className="text-base font-bold text-heading">Phễu tuyển dụng</h2>
                  </div>
                  <span className="text-xs text-meta bg-gray-100 px-2.5 py-1 rounded-full">
                    Tổng: {totalPipeline} đơn
                  </span>
                </div>

                {/* Pipeline visual bar */}
                <div className="flex rounded-full overflow-hidden h-3 mb-5 bg-gray-100">
                  {Object.entries(stats.statusBreakdown).map(([status, count]) => {
                    if (count === 0) return null;
                    const pct = (count / totalPipeline) * 100;
                    return (
                      <div
                        key={status}
                        className={`${STATUS_CONFIG[status]?.color || 'bg-gray-400'} transition-all`}
                        style={{ width: `${pct}%` }}
                        title={`${STATUS_CONFIG[status]?.label}: ${count}`}
                      />
                    );
                  })}
                </div>

                {/* Pipeline detail cards */}
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(stats.statusBreakdown).map(([status, count]) => {
                    const cfg = STATUS_CONFIG[status];
                    if (!cfg) return null;
                    const pct = totalPipeline > 0 ? ((count / totalPipeline) * 100).toFixed(0) : 0;
                    return (
                      <div key={status} className={`${cfg.bg} rounded-xl p-3 text-center`}>
                        <div className={`text-xl font-bold ${cfg.text}`}>{count}</div>
                        <div className="text-[10px] text-meta font-medium mt-0.5">{cfg.label}</div>
                        <div className="text-[10px] text-meta">{pct}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Jobs */}
            <div className="bg-white rounded-xl border border-line p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                  <h2 className="text-base font-bold text-heading">Tin tuyển dụng gần đây</h2>
                </div>
                <Link to="/employer/jobs" className="text-xs text-brand-600 font-semibold hover:text-brand-700 transition-colors">
                  Xem tất cả →
                </Link>
              </div>

              {recentJobs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="text-sm text-meta mb-3">Bạn chưa có tin tuyển dụng nào</p>
                  <button onClick={() => navigate('/employer/jobs/new')} className="btn-primary text-sm">
                    + Đăng tin đầu tiên
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentJobs.map(job => (
                    <Link
                      key={job._id}
                      to={`/employer/jobs/edit/${job._id}`}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 font-bold flex items-center justify-center flex-shrink-0 group-hover:bg-brand-100 transition-colors">
                        {job.title?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-heading truncate group-hover:text-brand-600 transition-colors">
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-meta">{job.location}</span>
                          <span className="text-xs text-meta">·</span>
                          <span className="text-xs text-meta">
                            {job.deadline
                              ? `Hạn: ${new Date(job.deadline).toLocaleDateString('vi-VN')}`
                              : 'Không thời hạn'}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={job.status} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-2 space-y-6">

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-line p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                <h2 className="text-base font-bold text-heading">Thao tác nhanh</h2>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: 'Đăng tin tuyển dụng', desc: 'Tạo tin mới để thu hút ứng viên', icon: '📝', to: '/employer/jobs/new' },
                  { label: 'Xem ứng viên', desc: 'Duyệt hồ sơ và phản hồi ứng viên', icon: '👥', to: '/employer/applications' },
                  { label: 'Lịch phỏng vấn', desc: 'Quản lý lịch hẹn phỏng vấn', icon: '📅', to: '/employer/interviews' },
                  { label: 'Hồ sơ công ty', desc: 'Cập nhật thông tin doanh nghiệp', icon: '🏢', to: '/employer/company-profile' },
                  { label: 'Xem báo cáo', desc: 'Thống kê hiệu quả tuyển dụng', icon: '📊', to: '/employer/reports' },
                ].map(action => (
                  <Link
                    key={action.label}
                    to={action.to}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-lg group-hover:bg-brand-50 group-hover:scale-105 transition-all">
                      {action.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-heading group-hover:text-brand-600 transition-colors">{action.label}</p>
                      <p className="text-xs text-meta">{action.desc}</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-brand-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>

            {/* Top Skills */}
            {stats?.topSkills?.length > 0 && (
              <div className="bg-white rounded-xl border border-line p-6">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                  <h2 className="text-base font-bold text-heading">Kỹ năng phổ biến</h2>
                </div>
                <p className="text-xs text-meta mb-4">Từ hồ sơ ứng viên đã nộp</p>
                <div className="space-y-3">
                  {stats.topSkills.slice(0, 6).map(({ skill, count }, idx) => {
                    const max = stats.topSkills[0]?.count || 1;
                    const pct = ((count / max) * 100).toFixed(0);
                    return (
                      <div key={skill}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-heading font-medium">{skill}</span>
                          <span className="text-xs text-meta">{count} ứng viên</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              background: idx === 0 ? '#00B14F' : idx === 1 ? '#3B82F6' : idx === 2 ? '#8B5CF6' : '#94A3B8',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Jobs by Location */}
            {stats?.jobsByLocation && Object.keys(stats.jobsByLocation).length > 0 && (
              <div className="bg-white rounded-xl border border-line p-6">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-1.5 h-6 bg-rose-500 rounded-full"></div>
                  <h2 className="text-base font-bold text-heading">Phân bổ theo địa điểm</h2>
                </div>
                <div className="space-y-3">
                  {Object.entries(stats.jobsByLocation).map(([loc, count]) => {
                    const max = Math.max(...Object.values(stats.jobsByLocation));
                    const pct = ((count / max) * 100).toFixed(0);
                    return (
                      <div key={loc} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-heading font-medium truncate">{loc}</span>
                            <span className="text-xs text-meta font-semibold">{count} tin</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div className="bg-rose-400 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
