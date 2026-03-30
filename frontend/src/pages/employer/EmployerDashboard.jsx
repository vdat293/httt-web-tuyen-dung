import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportsAPI } from '../../api';
import Layout from '../../components/Layout';
import LoadingSkeleton from '../../components/LoadingSkeleton';

export default function EmployerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try { const { data } = await reportsAPI.getStats(); setStats(data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return <Layout><LoadingSkeleton type="stats" /><div className="mt-4"><LoadingSkeleton type="list" count={3} /></div></Layout>;

  const cards = [
    { label: 'Tin tuyển dụng', value: stats?.totalJobs || 0, color: 'text-brand-500' },
    { label: 'Đơn ứng tuyển', value: stats?.totalApplications || 0, color: 'text-blue-500' },
    { label: 'Ứng viên', value: stats?.totalCandidates || 0, color: 'text-purple-500' },
    { label: 'Tỷ lệ nhận', value: `${stats?.acceptedRate || 0}%`, color: 'text-amber-500' },
  ];

  const STATUS_VN = { pending: 'Chờ duyệt', reviewed: 'Đã xem', interview: 'Phỏng vấn', accepted: 'Nhận việc', rejected: 'Từ chối' };

  return (
    <Layout>
      <h1 className="section-title mb-5">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {cards.map((card) => (
          <div key={card.label} className="card p-5">
            <p className="text-xs text-meta mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {stats?.statusBreakdown && (
        <div className="card p-5 mb-4">
          <h2 className="text-sm font-semibold text-heading mb-3">Trạng thái đơn ứng tuyển</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {Object.entries(stats.statusBreakdown).map(([status, count]) => (
              <div key={status} className="text-center py-2.5 bg-bgSection rounded-lg">
                <div className="text-lg font-bold text-heading">{count}</div>
                <div className="text-xs text-meta">{STATUS_VN[status] || status}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats?.topSkills?.length > 0 && (
        <div className="card p-5 mb-4">
          <h2 className="text-sm font-semibold text-heading mb-3">Top kỹ năng</h2>
          <div className="flex flex-wrap gap-2">
            {stats.topSkills.map(({ skill, count }) => (
              <span key={skill} className="tag tag-green">{skill} ({count})</span>
            ))}
          </div>
        </div>
      )}

      {stats?.jobsByLocation && Object.keys(stats.jobsByLocation).length > 0 && (
        <div className="card p-5 mb-4">
          <h2 className="text-sm font-semibold text-heading mb-3">Theo địa điểm</h2>
          <div className="space-y-2">
            {Object.entries(stats.jobsByLocation).map(([loc, count]) => {
              const max = Math.max(...Object.values(stats.jobsByLocation));
              return (
                <div key={loc} className="flex items-center gap-3">
                  <span className="w-28 text-sm text-body truncate">{loc}</span>
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

      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <Link to="/employer/jobs" className="card p-5 text-center hover:shadow-card-hover transition-shadow group">
          <p className="text-sm font-semibold text-heading group-hover:text-brand-500 transition-colors">Quản lý tin tuyển dụng →</p>
        </Link>
        <Link to="/employer/applications" className="card p-5 text-center hover:shadow-card-hover transition-shadow group">
          <p className="text-sm font-semibold text-heading group-hover:text-brand-500 transition-colors">Xem hồ sơ ứng viên →</p>
        </Link>
      </div>
    </Layout>
  );
}
