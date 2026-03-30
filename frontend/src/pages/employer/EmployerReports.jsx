import { useState, useEffect } from 'react';
import { reportsAPI, jobsAPI } from '../../api';
import Layout from '../../components/Layout';
import LoadingSkeleton from '../../components/LoadingSkeleton';

const STATUS_VN = { pending: 'Chờ duyệt', reviewed: 'Đã xem', interview: 'Phỏng vấn', accepted: 'Nhận', rejected: 'Từ chối' };

export default function EmployerReports() {
  const [stats, setStats] = useState(null);
  const [jobStats, setJobStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState('');

  useEffect(() => { loadStats(); loadJobStats(); }, []);
  const loadStats = async () => {
    try { const { data } = await reportsAPI.getStats(); setStats(data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  const loadJobStats = async () => {
    try {
      const { data } = await jobsAPI.getMyJobs();
      const s = await Promise.all(data.map(async job => { const { data } = await reportsAPI.getJobStats(job._id); return { job, ...data }; }));
      setJobStats(s);
    } catch (err) { console.error(err); }
  };
  const handleJobChange = async (jobId) => {
    setSelectedJob(jobId);
    if (!jobId) { loadStats(); return; }
    try { const { data } = await reportsAPI.getJobStats(jobId); setStats(data); }
    catch (err) { console.error(err); }
  };

  if (loading) return <Layout><LoadingSkeleton type="stats" /><div className="mt-4"><LoadingSkeleton type="list" count={3} /></div></Layout>;

  return (
    <Layout>
      <div className="flex items-center justify-between mb-5">
        <h1 className="section-title">Báo cáo</h1>
        <select value={selectedJob} onChange={e => handleJobChange(e.target.value)} className="input-field !w-auto text-sm">
          <option value="">Tất cả</option>
          {jobStats.map(({ job }) => <option key={job._id} value={job._id}>{job.title}</option>)}
        </select>
      </div>

      {stats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            <div className="card p-5">
              <p className="text-xs text-meta mb-1">{selectedJob ? 'Đơn ứng tuyển' : 'Tin tuyển dụng'}</p>
              <p className="text-2xl font-bold text-brand-500">{stats.totalJobs || stats.totalApplications || 0}</p>
            </div>
            {selectedJob && stats.totalApplications != null && (
              <div className="card p-5">
                <p className="text-xs text-meta mb-1">Tổng đơn</p>
                <p className="text-2xl font-bold text-blue-500">{stats.totalApplications}</p>
              </div>
            )}
            {stats.totalInterviews != null && (
              <div className="card p-5">
                <p className="text-xs text-meta mb-1">Phỏng vấn</p>
                <p className="text-2xl font-bold text-purple-500">{stats.totalInterviews}</p>
              </div>
            )}
          </div>

          {stats.statusBreakdown && (
            <div className="card p-5 mb-4">
              <h2 className="text-sm font-semibold text-heading mb-3">Phân bổ trạng thái</h2>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {Object.entries(stats.statusBreakdown).map(([s, c]) => (
                  <div key={s} className="text-center py-2.5 bg-bgSection rounded-lg">
                    <div className="text-lg font-bold text-heading">{c}</div>
                    <div className="text-xs text-meta">{STATUS_VN[s] || s}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.topSkills?.length > 0 && (
            <div className="card p-5 mb-4">
              <h2 className="text-sm font-semibold text-heading mb-3">Top kỹ năng</h2>
              <div className="space-y-2">
                {stats.topSkills.map(({ skill, count }) => {
                  const max = stats.topSkills[0]?.count || 1;
                  return (
                    <div key={skill} className="flex items-center gap-3">
                      <span className="w-24 text-sm text-body truncate">{skill}</span>
                      <div className="flex-1 bg-bgSection rounded-full h-2">
                        <div className="bg-brand-500 h-2 rounded-full transition-all" style={{ width: `${(count/max*100)}%` }}></div>
                      </div>
                      <span className="text-sm font-semibold text-heading w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {!selectedJob && jobStats.length > 0 && (
        <div className="card overflow-hidden">
          <div className="p-5 pb-0">
            <h2 className="text-sm font-semibold text-heading mb-3">Thống kê theo tin</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="table-clean">
              <thead>
                <tr>
                  <th>Tin</th><th className="text-center">Tổng</th><th className="text-center">Chờ</th><th className="text-center">PV</th><th className="text-center">Nhận</th><th className="text-center">Từ chối</th>
                </tr>
              </thead>
              <tbody>
                {jobStats.map(({ job, totalApplications, statusBreakdown }) => (
                  <tr key={job._id}>
                    <td className="font-medium text-heading">{job.title}</td>
                    <td className="text-center font-semibold text-brand-500">{totalApplications}</td>
                    <td className="text-center">{statusBreakdown?.pending || 0}</td>
                    <td className="text-center">{statusBreakdown?.interview || 0}</td>
                    <td className="text-center text-green-600 font-medium">{statusBreakdown?.accepted || 0}</td>
                    <td className="text-center text-red-500 font-medium">{statusBreakdown?.rejected || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}
