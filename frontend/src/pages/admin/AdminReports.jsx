import { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import AdminLayout from '../../components/AdminLayout';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const COLORS = ['#4F46E5', '#7C3AED', '#DB2777', '#D97706', '#059669', '#DC2626', '#0891B2', '#6366F1'];

export default function AdminReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getReports()
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout currentPage="reports"><div className="animate-pulse space-y-6"><div className="h-64 bg-gray-200 rounded-xl"></div><div className="h-64 bg-gray-200 rounded-xl"></div></div></AdminLayout>;

  const {
    usersByMonth = [],
    jobsByLocation = [],
    appsByStatus = [],
    topSkills = [],
    appsByMonth = [],
    jobsByType = [],
  } = data || {};

  const appsStatusData = appsByStatus.map((s) => ({
    name: STATUS_LABELS[s._id] || s._id,
    value: s.count,
  }));

  return (
    <AdminLayout currentPage="reports">
      <div className="flex items-center justify-between mb-5">
        <h1 className="section-title">Báo cáo & Thống kê</h1>
      </div>

      <div className="space-y-6">
        {/* Row 1: Users & Applications growth */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-5">
            <h3 className="font-semibold text-heading mb-4">Tăng trưởng người dùng (12 tháng)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={usersByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [v, 'Người dùng']} />
                <Line type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-heading mb-4">Đơn ứng tuyển theo tháng</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={appsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [v, 'Đơn']} />
                <Bar dataKey="count" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 2: Application status pie + Top skills */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-5">
            <h3 className="font-semibold text-heading mb-4">Trạng thái đơn ứng tuyển</h3>
            {appsStatusData.length === 0 ? (
              <p className="text-sm text-meta text-center py-12">Chưa có dữ liệu</p>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={appsStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {appsStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {appsStatusData.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                      <span className="text-sm text-body flex-1">{item.name}</span>
                      <span className="text-sm font-semibold text-heading">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-heading mb-4">Top kỹ năng được tuyển dụng nhiều nhất</h3>
            {topSkills.length === 0 ? (
              <p className="text-sm text-meta text-center py-12">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-2">
                {topSkills.map((item, i) => {
                  const max = topSkills[0]?.count || 1;
                  return (
                    <div key={item.skill} className="flex items-center gap-3">
                      <span className="w-5 text-right text-xs text-meta font-medium">{i + 1}</span>
                      <span className="text-sm text-body flex-1 truncate">{item.skill}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(item.count / max) * 100}%` }}></div>
                        </div>
                        <span className="text-xs font-medium text-heading w-6 text-right">{item.count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Row 3: Jobs by type + Top locations */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-5">
            <h3 className="font-semibold text-heading mb-4">Tin tuyển dụng theo loại hình</h3>
            {jobsByType.length === 0 ? (
              <p className="text-sm text-meta text-center py-12">Chưa có dữ liệu</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={jobsByType} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="_id" type="category" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#D97706" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-heading mb-4">Top địa điểm tuyển dụng</h3>
            {jobsByLocation.length === 0 ? (
              <p className="text-sm text-meta text-center py-12">Chưa có dữ liệu</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={jobsByLocation} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="_id" type="category" tick={{ fontSize: 10 }} width={90} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#059669" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

const STATUS_LABELS = {
  pending: 'Chờ duyệt',
  reviewed: 'Đã xem',
  interview: 'Phỏng vấn',
  accepted: 'Được nhận',
  rejected: 'Bị từ chối',
};
