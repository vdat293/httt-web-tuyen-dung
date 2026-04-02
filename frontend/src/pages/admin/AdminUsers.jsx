import { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import AdminLayout from '../../components/AdminLayout';
import { useToast } from '../../components/Toast';

const ROLE_LABELS = { candidate: 'Ứng viên', employer: 'Nhà tuyển dụng', admin: 'Admin' };
const ROLE_BADGE = {
  candidate: 'tag-blue',
  employer: 'tag-green',
  admin: 'tag-red',
};

export default function AdminUsers() {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [toggling, setToggling] = useState(null);

  const limit = 15;

  useEffect(() => { loadUsers(); }, [page, roleFilter, search]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (roleFilter) params.role = roleFilter;
      if (search.trim()) params.search = search.trim();
      const { data } = await adminAPI.getUsers(params);
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const handleToggleActive = async (user) => {
    setToggling(user._id);
    try {
      await adminAPI.updateUser(user._id, { isActive: !user.isActive });
      setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, isActive: !u.isActive } : u));
      addToast(`${user.isActive ? 'Đã vô hiệu hóa' : 'Đã kích hoạt'} tài khoản ${user.name}`, 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Thất bại', 'error');
    } finally { setToggling(null); }
  };

  const handleDelete = async (user) => {
    if (!confirm(`Xóa tài khoản "${user.name}"? Hành động này sẽ xóa tất cả dữ liệu liên quan.`)) return;
    setDeleting(user._id);
    try {
      await adminAPI.deleteUser(user._id);
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
      addToast('Đã xóa tài khoản', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Xóa thất bại', 'error');
    } finally { setDeleting(null); }
  };

  return (
    <AdminLayout currentPage="users">
      <div className="flex items-center justify-between mb-5">
        <h1 className="section-title">Quản lý người dùng</h1>
        <span className="text-sm text-meta">{total} người dùng</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm theo tên, email..."
            className="input"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="input w-auto"
        >
          <option value="">Tất cả vai trò</option>
          <option value="candidate">Ứng viên</option>
          <option value="employer">Nhà tuyển dụng</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-bgSection">
                <th className="text-left text-meta font-medium px-4 py-3">Người dùng</th>
                <th className="text-left text-meta font-medium px-4 py-3">Vai trò</th>
                <th className="text-left text-meta font-medium px-4 py-3">Trạng thái</th>
                <th className="text-left text-meta font-medium px-4 py-3">Ngày tạo</th>
                <th className="text-right text-meta font-medium px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="px-4 py-3"><div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse ml-auto"></div></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-meta">Không có người dùng nào</td>
                </tr>
              ) : users.map((user) => (
                <tr key={user._id} className="border-b border-gray-50 hover:bg-bgLight transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden">
                        {user.avatar || user.companyLogo
                          ? <img src={user.avatar || user.companyLogo} alt="" className="w-full h-full object-cover" />
                          : user.name?.charAt(0)?.toUpperCase()
                        }
                      </div>
                      <div>
                        <p className="font-medium text-heading">{user.name}</p>
                        <p className="text-xs text-meta">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`tag ${ROLE_BADGE[user.role] || 'tag-gray'}`}>
                      {ROLE_LABELS[user.role] || user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`tag ${user.isActive === false ? 'tag-red' : 'tag-green'}`}>
                      {user.isActive === false ? 'Đã khóa' : 'Hoạt động'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-meta">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleToggleActive(user)}
                        disabled={toggling === user._id || user.role === 'admin'}
                        title={user.isActive ? 'Khóa tài khoản' : 'Mở khóa'}
                        className="p-1.5 rounded-md text-meta hover:text-orange-500 hover:bg-orange-50 disabled:opacity-40 transition-colors"
                      >
                        {user.isActive === false ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        disabled={deleting === user._id || user.role === 'admin'}
                        title="Xóa tài khoản"
                        className="p-1.5 rounded-md text-meta hover:text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-meta">Trang {page} / {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-outline !py-1 !px-3 text-xs disabled:opacity-40">
                ←
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="btn-outline !py-1 !px-3 text-xs disabled:opacity-40">
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
