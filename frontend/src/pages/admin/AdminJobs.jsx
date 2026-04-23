import { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import AdminLayout from '../../components/AdminLayout';
import { useToast } from '../../components/Toast';
import { useSocket } from '../../contexts/SocketContext';

const STATUS_CONFIG = {
  pending: { label: 'Chờ duyệt', tag: 'tag-yellow' },
  open: { label: 'Đã duyệt', tag: 'tag-green' },
  closed: { label: 'Đã đóng', tag: 'tag-gray' },
  rejected: { label: 'Bị từ chối', tag: 'tag-red' },
  suspended: { label: 'Đã bị khóa', tag: 'tag-blue' },
};

function formatSalary(salary) {
  if (!salary) return 'Thỏa thuận';
  if (salary.min === 0 && salary.max === 0) return 'Thỏa thuận';
  const fmt = (n) => (n >= 1000000 ? `${(n / 1000000).toFixed(0)}M` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : n);
  if (salary.max > 0) return `${fmt(salary.min)} - ${fmt(salary.max)}`;
  return `Từ ${fmt(salary.min)}`;
}

export default function AdminJobs() {
  const { addToast } = useToast();
  const { socket } = useSocket();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal] = useState(null); // job id being rejected
  const [lockModal, setLockModal] = useState(null); // job being locked

  const limit = 15;

  useEffect(() => {
    if (!socket) return;

    const handleJobUpdate = () => {
      const params = { page, limit };
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();
      loadJobs(params);
    };

    socket.on('job_status_updated', handleJobUpdate);
    return () => socket.off('job_status_updated', handleJobUpdate);
  }, [socket, page, statusFilter, search]);

  useEffect(() => {
    const params = { page, limit };
    if (statusFilter) params.status = statusFilter;
    if (search.trim()) params.search = search.trim();
    loadJobs(params);
  }, [page, statusFilter, search]);

  const loadJobs = async (params) => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getJobs(params);
      setJobs(data.jobs);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const handleApprove = async (job) => {
    setActionLoading(job._id);
    try {
      await adminAPI.approveJob(job._id);
      setJobs((prev) => prev.map((j) => j._id === job._id ? { ...j, status: 'open' } : j));
      addToast('Đã duyệt tin tuyển dụng', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Thất bại', 'error');
    } finally { setActionLoading(null); }
  };

  const handleReject = async (jobId, reason) => {
    setActionLoading(jobId);
    try {
      await adminAPI.rejectJob(jobId, reason);
      setJobs((prev) => prev.map((j) => j._id === jobId ? { ...j, status: 'rejected', rejectReason: reason } : j));
      setRejectModal(null);
      addToast('Đã từ chối tin tuyển dụng', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Thất bại', 'error');
    } finally { setActionLoading(null); }
  };

  const handleLock = async (jobId, reason) => {
    setActionLoading(jobId);
    try {
      await adminAPI.lockJob(jobId, reason);
      const isCurrentlySuspended = jobs.find(j => j._id === jobId)?.status === 'suspended';
      setJobs((prev) => prev.map((j) => j._id === jobId ? { ...j, status: isCurrentlySuspended ? 'open' : 'suspended' } : j));
      setLockModal(null);
      addToast(isCurrentlySuspended ? 'Đã mở khóa tin tuyển dụng' : 'Đã khóa tin tuyển dụng', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Thất bại', 'error');
    } finally { setActionLoading(null); }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Bạn có chắc chắn muốn XÓA bài đăng này? Hành động này không thể hoàn tác.')) return;
    setActionLoading(jobId);
    try {
      await adminAPI.deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      addToast('Đã xóa tin tuyển dụng thành công', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Thất bại', 'error');
    } finally { setActionLoading(null); }
  };

  return (
    <AdminLayout currentPage="jobs">
      <div className="flex items-center justify-between mb-5">
        <h1 className="section-title">Quản lý tin tuyển dụng</h1>
        <span className="text-sm text-meta">{total} tin tuyển dụng</span>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col gap-4 mb-5">
        <div className="flex items-center gap-1 border-b border-gray-200">
          {[
            { id: '', label: 'Tất cả' },
            { id: 'pending', label: 'Chờ duyệt' },
            { id: 'open', label: 'Đã duyệt' },
            { id: 'rejected', label: 'Bị từ chối' },
            { id: 'closed', label: 'Đã đóng' },
            { id: 'suspended', label: 'Bị khóa' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setStatusFilter(tab.id); setPage(1); }}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                statusFilter === tab.id
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-meta hover:text-body hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Tìm theo tiêu đề, địa điểm..."
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-bgSection">
                <th className="text-left text-meta font-medium px-4 py-3">Tin tuyển dụng</th>
                <th className="text-left text-meta font-medium px-4 py-3">Công ty</th>
                <th className="text-left text-meta font-medium px-4 py-3">Lương</th>
                <th className="text-left text-meta font-medium px-4 py-3">Trạng thái</th>
                <th className="text-left text-meta font-medium px-4 py-3">Ngày đăng</th>
                <th className="text-right text-meta font-medium px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="px-4 py-3"><div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse ml-auto"></div></td>
                  </tr>
                ))
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-meta">Không có tin tuyển dụng nào</td>
                </tr>
              ) : jobs.map((job) => (
                <tr key={job._id} className="border-b border-gray-50 hover:bg-bgLight transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-heading line-clamp-1">{job.title}</p>
                      <p className="text-xs text-meta mt-0.5">{job.location} · {job.jobType}</p>
                      {job.rejectReason && (
                        <p className="text-xs text-red-500 mt-0.5">Lý do từ chối: {job.rejectReason}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-brand-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {job.employerId?.companyLogo
                          ? <img src={job.employerId.companyLogo} alt="" className="w-full h-full object-contain" />
                          : <span className="text-brand-600 font-bold text-xs">{job.employerId?.name?.charAt(0)}</span>
                        }
                      </div>
                      <span className="text-body text-xs truncate">{job.employerId?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-meta text-xs">{formatSalary(job.salary)}</td>
                  <td className="px-4 py-3">
                    <span className={`tag ${STATUS_CONFIG[job.status]?.tag || 'tag-gray'}`}>
                      {STATUS_CONFIG[job.status]?.label || job.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-meta text-xs">
                    {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {job.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(job)}
                            disabled={actionLoading === job._id}
                            className="px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50 transition-colors"
                          >
                            {actionLoading === job._id ? '...' : 'Duyệt'}
                          </button>
                          <button
                            onClick={() => setRejectModal(job._id)}
                            className="px-2 py-1 rounded text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                      <a
                        href={`/jobs/${job._id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-md text-meta hover:text-brand-500 hover:bg-brand-50 transition-colors"
                        title="Xem chi tiết"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </a>
                      
                      {job.status === 'open' && (
                        <button
                          onClick={() => setLockModal(job._id)}
                          className="p-1.5 rounded-md text-orange-500 hover:bg-orange-50 transition-colors"
                          title="Khóa bài đăng"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </button>
                      )}

                      {job.status === 'suspended' && (
                        <button
                          onClick={() => handleLock(job._id, '')}
                          className="p-1.5 rounded-md text-green-500 hover:bg-green-50 transition-colors"
                          title="Mở khóa bài đăng"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                          </svg>
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteJob(job._id)}
                        className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                        title="Xóa bài đăng"
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
                className="btn-outline !py-1 !px-3 text-xs disabled:opacity-40">←</button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="btn-outline !py-1 !px-3 text-xs disabled:opacity-40">→</button>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <RejectModal
          jobId={rejectModal}
          onClose={() => setRejectModal(null)}
          onConfirm={handleReject}
        />
      )}
      {lockModal && (
        <LockModal
          jobId={lockModal}
          onClose={() => setLockModal(null)}
          onConfirm={handleLock}
        />
      )}
    </AdminLayout>
  );
}

function RejectModal({ jobId, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold text-heading mb-4">Từ chối tin tuyển dụng</h3>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Lý do từ chối (không bắt buộc)"
          rows={3}
          className="input resize-none w-full mb-4"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-outline !py-2 !px-4 text-sm">Hủy</button>
          <button onClick={() => onConfirm(jobId, reason)} className="btn-primary !py-2 !px-4 text-sm bg-red-500 hover:bg-red-600">
            Từ chối
          </button>
        </div>
      </div>
    </div>
  );
}

function LockModal({ jobId, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold text-heading mb-4">Khóa bài đăng tuyển dụng</h3>
        <p className="text-sm text-meta mb-4">Bài đăng này sẽ không được hiển thị công khai. Nhà tuyển dụng sẽ nhận được thông báo khóa.</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Lý do khóa (VD: Vi phạm nội dung, Spam...)"
          rows={3}
          className="input resize-none w-full mb-4"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-outline !py-2 !px-4 text-sm">Hủy</button>
          <button onClick={() => onConfirm(jobId, reason)} className="btn-primary !py-2 !px-4 text-sm bg-orange-500 hover:bg-orange-600">
            Khóa ngay
          </button>
        </div>
      </div>
    </div>
  );
}
