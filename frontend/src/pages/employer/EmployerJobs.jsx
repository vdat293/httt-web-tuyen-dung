import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobsAPI } from '../../api';
import { useToast } from '../../components/Toast';
import Layout from '../../components/Layout';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { useSocket } from '../../contexts/SocketContext';

export default function EmployerJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    const handleJobUpdate = () => loadJobs();
    socket.on('job_status_updated', handleJobUpdate);
    return () => socket.off('job_status_updated', handleJobUpdate);
  }, [socket]);

  useEffect(() => { loadJobs(); }, []);
  const loadJobs = async () => {
    try { const { data } = await jobsAPI.getMyJobs(); setJobs(data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tin tuyển dụng này?')) return;
    try { 
      await jobsAPI.delete(id); 
      addToast('Đã xóa tin tuyển dụng thành công'); 
      loadJobs(); 
    } catch (err) { 
      addToast(err.response?.data?.message || 'Có lỗi xảy ra', 'error'); 
    }
  };

  const handleToggle = async (job) => {
    try {
      await jobsAPI.update(job._id, { status: job.status === 'open' ? 'closed' : 'open' });
      addToast(job.status === 'open' ? 'Đã đóng tin tuyển dụng' : 'Đã mở tin tuyển dụng');
      loadJobs();
    } catch (err) { 
      addToast(err.response?.data?.message || 'Có lỗi xảy ra', 'error'); 
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Không thời hạn';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-heading">Quản lý tin tuyển dụng</h1>
          <p className="text-meta text-sm mt-1">Danh sách các tin tuyển dụng bạn đã đăng trên hệ thống.</p>
        </div>
        <button 
          onClick={() => navigate('/employer/jobs/new')} 
          className="btn-primary !py-2.5 !px-6 text-sm shadow-lg shadow-brand-100 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Đăng tin mới
        </button>
      </div>

      {loading ? <LoadingSkeleton type="list" count={4} /> : jobs.length === 0 ? (
        <EmptyState 
          title="Bạn chưa có tin tuyển dụng nào" 
          description="Hãy đăng tin tuyển dụng đầu tiên của bạn để bắt đầu tìm kiếm những ứng viên tiềm năng nhất." 
          action={() => navigate('/employer/jobs/new')} 
          actionLabel="+ Đăng tin ngay" 
        />
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <div key={job._id} className="bg-white rounded-xl border border-line p-5 flex flex-col md:flex-row md:items-center gap-4 hover:shadow-md transition-all group">
              <div className="w-14 h-14 rounded-xl border border-line bg-gray-50 flex items-center justify-center flex-shrink-0 text-brand-600 font-bold text-xl group-hover:bg-brand-50 transition-colors">
                {job.title?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5">
                  <h3 className="text-lg font-bold text-heading truncate mb-0">{job.title}</h3>
                  <button onClick={() => handleToggle(job)} className="flex-shrink-0 flex items-center">
                    <StatusBadge status={job.status} />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-meta">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {job.location}
                  </span>
                  {job.deadline ? (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Hạn nộp: {new Date(job.deadline).toLocaleDateString('vi-VN')}
                    </span>
                  ) : (
                    <span className="text-xs text-brand-600 font-medium flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Không thời hạn
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-brand-600 font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {job.salary ? `${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()} VNĐ` : 'Thỏa thuận'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 border-t md:border-t-0 md:border-l border-line pt-4 md:pt-0 md:pl-4">
                <button 
                  onClick={() => navigate(`/employer/jobs/edit/${job._id}`)} 
                  className="p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                  title="Sửa tin"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <Link 
                  to={`/employer/applications?jobId=${job._id}`} 
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                >
                  Ứng viên
                </Link>
                <button 
                  onClick={() => handleDelete(job._id)} 
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Xóa tin"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
