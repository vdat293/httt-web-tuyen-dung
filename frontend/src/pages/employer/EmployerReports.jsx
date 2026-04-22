import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { reportsAPI, jobsAPI } from '../../api';
import Layout from '../../components/Layout';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import StatusBadge from '../../components/StatusBadge';

const STATUS_CONFIG = {
  pending:   { label: 'Chờ duyệt', color: '#f59e0b', bg: 'bg-amber-50',  text: 'text-amber-700',  barColor: '#f59e0b' },
  reviewed:  { label: 'Đã xem',    color: '#3b82f6', bg: 'bg-blue-50',   text: 'text-blue-700',   barColor: '#3b82f6' },
  interview: { label: 'Phỏng vấn', color: '#8b5cf6', bg: 'bg-purple-50', text: 'text-purple-700', barColor: '#8b5cf6' },
  accepted:  { label: 'Nhận việc', color: '#22c55e', bg: 'bg-green-50',  text: 'text-green-700',  barColor: '#22c55e' },
  rejected:  { label: 'Từ chối',   color: '#ef4444', bg: 'bg-red-50',    text: 'text-red-700',    barColor: '#ef4444' },
};

export default function EmployerReports() {
  const [stats, setStats] = useState(null);
  const [jobStats, setJobStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [statsRes, jobsRes] = await Promise.all([
        reportsAPI.getStats(),
        jobsAPI.getMyJobs(),
      ]);
      setStats(statsRes.data);

      const jobStatsPromises = jobsRes.data.map(async (job) => {
        try {
          const { data } = await reportsAPI.getJobStats(job._id);
          return { job, ...data };
        } catch {
          return { job, totalApplications: 0, statusBreakdown: {}, totalInterviews: 0, topSkills: [] };
        }
      });
      setJobStats(await Promise.all(jobStatsPromises));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleJobChange = async (jobId) => {
    setSelectedJob(jobId);
    if (!jobId) {
      try { const { data } = await reportsAPI.getStats(); setStats(data); } catch {}
      return;
    }
    try { const { data } = await reportsAPI.getJobStats(jobId); setStats(data); } catch {}
  };

  // Derived data
  const totalPipeline = useMemo(() => {
    return stats?.statusBreakdown
      ? Object.values(stats.statusBreakdown).reduce((a, b) => a + b, 0)
      : 0;
  }, [stats]);

  const conversionRate = useMemo(() => {
    if (!stats?.statusBreakdown || totalPipeline === 0) return 0;
    return ((stats.statusBreakdown.accepted || 0) / totalPipeline * 100).toFixed(1);
  }, [stats, totalPipeline]);

  const interviewRate = useMemo(() => {
    if (!stats?.statusBreakdown || totalPipeline === 0) return 0;
    return (((stats.statusBreakdown.interview || 0) + (stats.statusBreakdown.accepted || 0)) / totalPipeline * 100).toFixed(1);
  }, [stats, totalPipeline]);

  // Sort job stats by total applications
  const sortedJobStats = useMemo(() => {
    return [...jobStats].sort((a, b) => (b.totalApplications || 0) - (a.totalApplications || 0));
  }, [jobStats]);

  if (loading) return (
    <Layout>
      <LoadingSkeleton type="stats" />
      <div className="mt-6"><LoadingSkeleton type="list" count={4} /></div>
    </Layout>
  );

  return (
    <Layout>
      <div className="space-y-6">

        {/* ═══ Header ═══ */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-heading">Báo cáo tuyển dụng</h1>
            <p className="text-sm text-meta mt-1">Theo dõi hiệu quả tuyển dụng và phân tích dữ liệu ứng viên</p>
          </div>
          <select
            value={selectedJob}
            onChange={e => handleJobChange(e.target.value)}
            className="input-field !w-auto text-sm !py-2 !px-4 min-w-[200px]"
          >
            <option value="">📊 Tổng quan tất cả tin</option>
            {jobStats.map(({ job }) => (
              <option key={job._id} value={job._id}>📌 {job.title}</option>
            ))}
          </select>
        </div>

        {stats && (
          <>
            {/* ═══ Overview KPIs ═══ */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-line p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-xs text-meta">{selectedJob ? 'Tổng đơn ứng tuyển' : 'Tin tuyển dụng'}</span>
                </div>
                <p className="text-3xl font-bold text-heading">{selectedJob ? (stats.totalApplications || 0) : (stats.totalJobs || 0)}</p>
              </div>

              <div className="bg-white rounded-xl border border-line p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-xs text-meta">{selectedJob ? 'Phỏng vấn' : 'Tổng đơn ứng tuyển'}</span>
                </div>
                <p className="text-3xl font-bold text-heading">{selectedJob ? (stats.totalInterviews || 0) : (stats.totalApplications || 0)}</p>
              </div>

              <div className="bg-white rounded-xl border border-line p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <span className="text-xs text-meta">Tỉ lệ vào phỏng vấn</span>
                </div>
                <p className="text-3xl font-bold text-heading">{interviewRate}%</p>
              </div>

              <div className="bg-white rounded-xl border border-line p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-xs text-meta">Tỉ lệ nhận việc</span>
                </div>
                <p className="text-3xl font-bold text-heading">{conversionRate}%</p>
              </div>
            </div>

            {/* ═══ Main Grid ═══ */}
            <div className="grid lg:grid-cols-5 gap-6">

              {/* Left Column */}
              <div className="lg:col-span-3 space-y-6">

                {/* Recruitment Funnel */}
                {stats.statusBreakdown && totalPipeline > 0 && (
                  <div className="bg-white rounded-xl border border-line p-6">
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="w-1.5 h-6 bg-brand-500 rounded-full"></div>
                      <h2 className="text-base font-bold text-heading">Phễu tuyển dụng</h2>
                    </div>

                    {/* Horizontal funnel */}
                    <div className="space-y-3">
                      {Object.entries(stats.statusBreakdown).map(([status, count]) => {
                        const cfg = STATUS_CONFIG[status];
                        if (!cfg) return null;
                        const pct = totalPipeline > 0 ? ((count / totalPipeline) * 100).toFixed(1) : 0;
                        return (
                          <div key={status} className="flex items-center gap-3">
                            <div className="w-20 flex-shrink-0">
                              <span className={`text-sm font-medium ${cfg.text}`}>{cfg.label}</span>
                            </div>
                            <div className="flex-1">
                              <div className="w-full bg-gray-100 rounded-full h-7 relative overflow-hidden">
                                <div
                                  className="h-full rounded-full flex items-center transition-all duration-500"
                                  style={{
                                    width: `${Math.max(Number(pct), 2)}%`,
                                    background: cfg.barColor,
                                  }}
                                >
                                  {Number(pct) > 12 && (
                                    <span className="text-white text-xs font-bold px-3">{count}</span>
                                  )}
                                </div>
                                {Number(pct) <= 12 && (
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-heading ml-1">
                                    {count}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="w-12 text-right flex-shrink-0">
                              <span className="text-xs text-meta font-semibold">{pct}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Job Stats Table */}
                {!selectedJob && sortedJobStats.length > 0 && (
                  <div className="bg-white rounded-xl border border-line overflow-hidden">
                    <div className="p-6 pb-0">
                      <div className="flex items-center gap-2.5 mb-5">
                        <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                        <h2 className="text-base font-bold text-heading">Hiệu quả từng tin tuyển dụng</h2>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-y border-line">
                            <th className="px-6 py-3 text-left text-xs font-semibold text-meta uppercase tracking-wider">Vị trí tuyển dụng</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-meta uppercase tracking-wider">Tổng đơn</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-meta uppercase tracking-wider">Chờ duyệt</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-meta uppercase tracking-wider">Phỏng vấn</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-meta uppercase tracking-wider">Nhận việc</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-meta uppercase tracking-wider">Từ chối</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-meta uppercase tracking-wider">Tỷ lệ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                          {sortedJobStats.map(({ job, totalApplications, statusBreakdown }) => {
                            const rate = totalApplications > 0
                              ? (((statusBreakdown?.accepted || 0) / totalApplications) * 100).toFixed(0)
                              : 0;
                            return (
                              <tr key={job._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                  <Link to={`/employer/jobs/edit/${job._id}`} className="group flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                                      {job.title?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div>
                                      <span className="font-semibold text-heading group-hover:text-brand-600 transition-colors block truncate max-w-[200px]">
                                        {job.title}
                                      </span>
                                      <span className="text-xs text-meta">{job.location}</span>
                                    </div>
                                  </Link>
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <span className="font-bold text-heading">{totalApplications}</span>
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-semibold ${(statusBreakdown?.pending || 0) > 0 ? 'bg-amber-50 text-amber-700' : 'text-meta'}`}>
                                    {statusBreakdown?.pending || 0}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-semibold ${(statusBreakdown?.interview || 0) > 0 ? 'bg-purple-50 text-purple-700' : 'text-meta'}`}>
                                    {statusBreakdown?.interview || 0}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-semibold ${(statusBreakdown?.accepted || 0) > 0 ? 'bg-green-50 text-green-700' : 'text-meta'}`}>
                                    {statusBreakdown?.accepted || 0}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-semibold ${(statusBreakdown?.rejected || 0) > 0 ? 'bg-red-50 text-red-700' : 'text-meta'}`}>
                                    {statusBreakdown?.rejected || 0}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <div className="flex flex-col items-center gap-1">
                                    <span className={`text-xs font-bold ${Number(rate) >= 50 ? 'text-green-600' : Number(rate) > 0 ? 'text-amber-600' : 'text-meta'}`}>
                                      {rate}%
                                    </span>
                                    <div className="w-12 bg-gray-100 rounded-full h-1.5">
                                      <div
                                        className="h-1.5 rounded-full"
                                        style={{
                                          width: `${rate}%`,
                                          background: Number(rate) >= 50 ? '#22c55e' : Number(rate) > 0 ? '#f59e0b' : '#e5e7eb',
                                        }}
                                      />
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="lg:col-span-2 space-y-6">

                {/* Summary Insights */}
                <div className="bg-white rounded-xl border border-line p-6">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                    <h2 className="text-base font-bold text-heading">Tóm tắt hiệu quả</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-heading font-medium">Đơn chờ xử lý</span>
                        <span className="text-lg font-bold text-amber-600">{stats.statusBreakdown?.pending || 0}</span>
                      </div>
                      <p className="text-xs text-meta">
                        {(stats.statusBreakdown?.pending || 0) > 0
                          ? '⚠️ Bạn cần phản hồi các ứng viên đang chờ duyệt.'
                          : '✅ Tất cả đơn đã được xử lý.'}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-heading font-medium">Hiệu suất chuyển đổi</span>
                        <span className={`text-lg font-bold ${Number(conversionRate) >= 10 ? 'text-green-600' : 'text-meta'}`}>{conversionRate}%</span>
                      </div>
                      <p className="text-xs text-meta">
                        {Number(conversionRate) >= 20
                          ? '🎯 Tuyệt vời! Tỷ lệ chuyển đổi rất tốt.'
                          : Number(conversionRate) >= 10
                            ? '👍 Tỷ lệ chuyển đổi ở mức khá.'
                            : '💡 Hãy tối ưu mô tả công việc để thu hút ứng viên phù hợp hơn.'}
                      </p>
                    </div>
                    {!selectedJob && stats.totalJobs > 0 && (
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-heading font-medium">Trung bình đơn/tin</span>
                          <span className="text-lg font-bold text-blue-600">
                            {(stats.totalApplications / stats.totalJobs).toFixed(1)}
                          </span>
                        </div>
                        <p className="text-xs text-meta">
                          {(stats.totalApplications / stats.totalJobs) >= 5
                            ? '📈 Tin tuyển dụng đang thu hút tốt.'
                            : '📝 Hãy tối ưu tiêu đề và mô tả để tăng lượng ứng tuyển.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Top Skills */}
                {stats?.topSkills?.length > 0 && (
                  <div className="bg-white rounded-xl border border-line p-6">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                      <h2 className="text-base font-bold text-heading">Top kỹ năng ứng viên</h2>
                    </div>
                    <div className="space-y-3">
                      {stats.topSkills.slice(0, 8).map(({ skill, count }, idx) => {
                        const max = stats.topSkills[0]?.count || 1;
                        const pct = ((count / max) * 100).toFixed(0);
                        const colors = ['#00B14F', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6', '#6366F1'];
                        return (
                          <div key={skill} className="flex items-center gap-3">
                            <span className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center flex-shrink-0"
                              style={{ background: `${colors[idx]}15`, color: colors[idx] }}>
                              {idx + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-heading font-medium truncate">{skill}</span>
                                <span className="text-xs text-meta ml-2">{count}</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: colors[idx] }} />
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
          </>
        )}
      </div>
    </Layout>
  );
}
