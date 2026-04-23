import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { reportsAPI, jobsAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';

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

        {/* ═══ Welcome Banner - Hidden on Mobile ═══ */}
        <div className="hidden sm:block bg-gradient-to-r from-brand-600 to-brand-500 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-brand-100">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-1/2 w-40 h-40 bg-white/5 rounded-full translate-y-1/2"></div>
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {greeting()}, {user?.name?.split(' ').pop() || 'Nhà tuyển dụng'}
            </h1>
            <p className="text-white/75 text-sm sm:text-base max-w-lg font-medium">
              Chào mừng bạn trở lại. Chúc bạn một ngày làm việc hiệu quả và sớm tìm được những ứng viên tài năng nhất.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={() => navigate('/employer/jobs/new')}
                className="px-6 py-2.5 bg-white text-brand-600 font-bold rounded-xl text-sm hover:bg-white hover:scale-[1.02] transition-all shadow-md active:scale-95"
              >
                + Đăng tin mới
              </button>
              <button
                onClick={() => navigate('/employer/applications')}
                className="px-6 py-2.5 bg-white/15 text-white font-bold rounded-xl text-sm border border-white/25 hover:bg-white/20 transition-all active:scale-95"
              >
                Hồ sơ ứng viên
              </button>
            </div>
          </div>
        </div>

        {/* ═══ KPI Cards ═══ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <p className="text-2xl font-bold text-heading leading-tight">{card.value}</p>
              <p className="text-[11px] font-bold text-meta uppercase tracking-wider mt-1">{card.label}</p>
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
                    <div className="w-1 h-5 bg-brand-500 rounded-full"></div>
                    <h2 className="text-base font-bold text-heading">Quy trình tuyển dụng</h2>
                  </div>
                  <span className="text-[10px] font-bold text-meta bg-bgSection px-2 py-1 rounded-md uppercase tracking-wider">
                    {totalPipeline} hồ sơ
                  </span>
                </div>

                <div className="flex rounded-full overflow-hidden h-2.5 mb-6 bg-gray-100">
                  {Object.entries(stats.statusBreakdown).map(([status, count]) => {
                    if (count === 0) return null;
                    const pct = (count / totalPipeline) * 100;
                    return (
                      <div
                        key={status}
                        className={`${STATUS_CONFIG[status]?.color || 'bg-gray-400'} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    );
                  })}
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(stats.statusBreakdown).map(([status, count]) => {
                    const cfg = STATUS_CONFIG[status];
                    if (!cfg) return null;
                    const pct = totalPipeline > 0 ? ((count / totalPipeline) * 100).toFixed(0) : 0;
                    return (
                      <div key={status} className={`${cfg.bg} rounded-xl p-3 text-center transition-transform hover:scale-[1.02]`}>
                        <div className={`text-xl font-extrabold ${cfg.text}`}>{count}</div>
                        <div className="text-[10px] text-meta font-bold mt-0.5 uppercase tracking-tighter truncate">{cfg.label}</div>
                        <div className="text-[9px] text-meta font-medium">{pct}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Jobs */}
            <div className="bg-white rounded-xl border border-line p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                  <h2 className="text-base font-bold text-heading">Đăng tuyển gần đây</h2>
                </div>
                <Link to="/employer/jobs" className="text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors uppercase tracking-wider">
                  Tất cả tin →
                </Link>
              </div>

              {recentJobs.length === 0 ? (
                <EmptyState
                  title="Chưa có tin tuyển dụng"
                  description="Bắt đầu đăng tuyển để tìm kiếm nhân tài cho doanh nghiệp."
                  action={() => navigate('/employer/jobs/new')}
                  actionLabel="Đăng tin ngay"
                />
              ) : (
                <div className="divide-y divide-line/60">
                  {recentJobs.map(job => (
                    <Link
                      key={job._id}
                      to={`/employer/jobs/edit/${job._id}`}
                      className="flex items-center gap-4 py-4 first:pt-0 last:pb-0 hover:px-2 hover:bg-bgSection rounded-xl transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 font-bold flex items-center justify-center flex-shrink-0 group-hover:bg-brand-100 transition-colors">
                        {job.title?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-heading truncate group-hover:text-brand-600 transition-colors">
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-medium text-meta">{job.location}</span>
                          <span className="text-line">·</span>
                          <span className="text-[11px] font-medium text-meta">
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
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-1 h-5 bg-amber-500 rounded-full"></div>
                <h2 className="text-base font-bold text-heading">Tiện ích</h2>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Đăng tin tuyển dụng', desc: 'Tạo tin mới để thu hút ứng viên', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>, to: '/employer/jobs/new' },
                  { label: 'Quản lý hồ sơ', desc: 'Duyệt và phản hồi ứng viên', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, to: '/employer/applications' },
                  { label: 'Lịch phỏng vấn', desc: 'Sắp xếp thời gian gặp mặt', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, to: '/employer/interviews' },
                  { label: 'Thông tin công ty', desc: 'Quản lý thương hiệu nhà tuyển dụng', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>, to: '/employer/company-profile' },
                  { label: 'Báo cáo hiệu quả', desc: 'Dữ liệu chuyển đổi tuyển dụng', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>, to: '/employer/reports' },
                ].map(action => (
                  <Link
                    key={action.label}
                    to={action.to}
                    className="flex items-center gap-4 p-4 border border-line/60 rounded-xl hover:border-brand-300 hover:shadow-sm transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-bgSection flex items-center justify-center text-meta group-hover:bg-brand-50 group-hover:text-brand-600 transition-all shadow-sm">
                      {action.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-heading group-hover:text-brand-600 transition-colors uppercase tracking-tight">{action.label}</p>
                      <p className="text-[11px] text-meta font-medium">{action.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Top Skills */}
            {stats?.topSkills?.length > 0 && (
              <div className="bg-white rounded-xl border border-line p-6">
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="w-1 h-5 bg-purple-500 rounded-full"></div>
                  <h2 className="text-base font-bold text-heading">Kỹ năng mục tiêu</h2>
                </div>
                <div className="space-y-4">
                  {stats.topSkills.slice(0, 5).map(({ skill, count }, idx) => {
                    const max = stats.topSkills[0]?.count || 1;
                    const pct = ((count / max) * 100).toFixed(0);
                    return (
                      <div key={skill}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-heading">{skill}</span>
                          <span className="text-[11px] font-bold text-meta">{count}</span>
                        </div>
                        <div className="w-full bg-bgSection rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
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
          </div>
        </div>
      </div>
    </Layout>
  );
}
