import { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import AdminLayout from '../../components/AdminLayout';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { Link } from 'react-router-dom';

const STAT_CARDS = [
  { key: 'totalUsers', label: 'Tổng người dùng', icon: '👥', color: 'bg-blue-50 text-blue-500' },
  { key: 'totalCandidates', label: 'Ứng viên', icon: '🎓', color: 'bg-purple-50 text-purple-500' },
  { key: 'totalEmployers', label: 'Nhà tuyển dụng', icon: '🏢', color: 'bg-green-50 text-green-500' },
  { key: 'totalJobs', label: 'Tin tuyển dụng', icon: '📋', color: 'bg-orange-50 text-orange-500' },
  { key: 'totalApplications', label: 'Đơn ứng tuyển', icon: '📨', color: 'bg-pink-50 text-pink-500' },
  { key: 'totalInterviews', label: 'Phỏng vấn', icon: '📅', color: 'bg-indigo-50 text-indigo-500' },
];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard().then(({ data }) => setData(data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout currentPage="Dashboard"><LoadingSkeleton type="stats" /></AdminLayout>;

  const { stats, statusBreakdown, recentPendingJobs, topEmployers } = data || {};

  return (
    <AdminLayout currentPage="Dashboard">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {STAT_CARDS.map(({ key, label, icon, color }) => (
          <div key={key} className="card p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${color}`}>{icon}</div>
              <div>
                <p className="text-2xl font-bold text-heading">{stats?.[key] ?? 0}</p>
                <p className="text-xs text-meta">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending jobs alert */}
      {(stats?.pendingJobs ?? 0) > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-yellow-800">Có {stats.pendingJobs} tin tuyển dụng chờ duyệt</p>
              <p className="text-xs text-yellow-600">Xem và phê duyệt trong trang Tin tuyển dụng</p>
            </div>
          </div>
          <Link to="/admin/jobs?status=pending" className="btn-primary !py-1.5 !px-4 text-sm">
            Duyệt ngay
          </Link>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Application status breakdown */}
        <div className="card p-5">
          <h3 className="font-semibold text-heading mb-4">Trạng thái đơn ứng tuyển</h3>
          <div className="space-y-3">
            {[
              { label: 'Đang chờ', key: 'pending', color: 'bg-yellow-400' },
              { label: 'Đã xem', key: 'reviewed', color: 'bg-blue-400' },
              { label: 'Phỏng vấn', key: 'interview', color: 'bg-purple-400' },
              { label: 'Được nhận', key: 'accepted', color: 'bg-green-400' },
              { label: 'Bị từ chối', key: 'rejected', color: 'bg-red-400' },
            ].map(({ label, key, color }) => {
              const count = statusBreakdown?.[key] ?? 0;
              const total = Object.values(statusBreakdown || {}).reduce((a, b) => a + b, 0);
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-body">{label}</span>
                    <span className="font-medium text-heading">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top employers */}
        <div className="card p-5">
          <h3 className="font-semibold text-heading mb-4">Top công ty tuyển dụng nhiều nhất</h3>
          {!topEmployers?.length ? (
            <p className="text-sm text-meta text-center py-6">Chưa có dữ liệu</p>
          ) : (
            <div className="space-y-3">
              {topEmployers.map((emp, i) => (
                <div key={emp._id} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-meta w-5">{i + 1}</span>
                  <div className="w-8 h-8 rounded-lg bg-brand-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {emp.companyLogo
                      ? <img src={emp.companyLogo} alt={emp.name} className="w-full h-full object-contain" />
                      : <span className="text-brand-600 font-bold text-xs">{emp.name?.charAt(0)}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-heading truncate">{emp.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-brand-500">{emp.jobCount} tin</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent pending jobs */}
      {recentPendingJobs?.length > 0 && (
        <div className="card p-5 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-heading">Tin chờ duyệt gần đây</h3>
            <Link to="/admin/jobs?status=pending" className="text-sm text-brand-500 hover:text-brand-700">Xem tất cả →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-meta font-medium pb-2">Tin tuyển dụng</th>
                  <th className="text-left text-meta font-medium pb-2">Công ty</th>
                  <th className="text-left text-meta font-medium pb-2">Ngày đăng</th>
                </tr>
              </thead>
              <tbody>
                {recentPendingJobs.map((job) => (
                  <tr key={job._id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 font-medium text-heading">{job.title}</td>
                    <td className="py-2.5 text-meta">{job.employerId?.name}</td>
                    <td className="py-2.5 text-meta">{new Date(job.createdAt).toLocaleDateString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
