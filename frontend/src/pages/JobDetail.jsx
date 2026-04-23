import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobsAPI, applicationsAPI } from '../api';
import SaveJobButton from '../components/SaveJobButton';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useToast } from '../components/Toast';
import Layout from '../components/Layout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';

function formatSalary(salary) {
  if (!salary) return 'Thỏa thuận';
  if (typeof salary === 'string') return salary;
  if (salary.min === 0 && salary.max === 0) return 'Thỏa thuận';
  const fmt = (n) => (n >= 1000000 ? `${(n / 1000000).toFixed(0)}M` : n);
  if (salary.max > 0) return `${fmt(salary.min)} - ${fmt(salary.max)}`;
  return `Từ ${fmt(salary.min)}`;
}

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const { addToast } = useToast();
  const [job, setJob] = useState(null);
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [file, setFile] = useState(null);
  const [unavailable, setUnavailable] = useState(false);
  const [unavailableReason, setUnavailableReason] = useState('');

  useEffect(() => { 
    window.scrollTo(0, 0);
    loadJob(); 
  }, [id]);

  useEffect(() => {
    if (socket && id) {
      socket.emit('join_job', id);
      
      const handleUnavailable = (data) => {
        if (data.jobId === id) {
          setUnavailable(true);
          setUnavailableReason(data.reason || 'Bài tuyển dụng này hiện không còn khả dụng');
          addToast(data.reason || 'Bài tuyển dụng đã bị khóa bởi admin', 'warning');
        }
      };

      const handleStatusUpdated = (data) => {
        if (data.jobId === id) {
          if (data.status === 'open') {
            setUnavailable(false);
            loadJob();
          } else if (data.status === 'suspended' || data.status === 'rejected' || data.status === 'deleted') {
            setUnavailable(true);
            setUnavailableReason(data.reason || 'Bài tuyển dụng này hiện không còn khả dụng');
          }
        }
      };

      socket.on('job_unavailable', handleUnavailable);
      socket.on('job_status_updated', handleStatusUpdated);

      return () => {
        socket.emit('leave_job', id);
        socket.off('job_unavailable', handleUnavailable);
        socket.off('job_status_updated', handleStatusUpdated);
      };
    }
  }, [socket, id]);

  const loadJob = async () => {
    try {
      const { data } = await jobsAPI.getById(id);
      setJob(data);
      if (user?.role === 'candidate') checkApplied();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const checkApplied = async () => {
    try {
      const { data } = await applicationsAPI.getAll({ jobId: id });
      setApplied(data.some((a) => a.candidateId._id === user._id));
    } catch (err) { console.error(err); }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      const formData = new FormData();
      formData.append('jobId', id);
      if (file) formData.append('cv', file);
      await applicationsAPI.create(formData);
      addToast('Ứng tuyển thành công!', 'success');
      setApplied(true);
    } catch (err) {
      addToast(err.response?.data?.message || 'Ứng tuyển thất bại', 'error');
    } finally { setApplying(false); }
  };

  if (loading) return <Layout><LoadingSkeleton type="detail" /></Layout>;
  
  if (!job || unavailable) return (
    <Layout>
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="flex flex-col items-center">
          <EmptyState 
            title={unavailable ? "Bài tuyển dụng không khả dụng" : "Không tìm thấy tin tuyển dụng"}
            description={unavailable ? unavailableReason : "Tin tuyển dụng này có thể đã bị gỡ hoặc không tồn tại trên hệ thống."}
          />
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button 
              onClick={() => navigate('/')} 
              className="btn-ghost px-8 py-2.5 rounded-xl border border-line hover:bg-bgLight transition-all active:scale-95"
            >
              Về trang chủ
            </button>
            <button 
              onClick={() => navigate('/jobs')} 
              className="btn-primary px-8 py-2.5 rounded-xl shadow-lg shadow-brand-200 hover:shadow-brand-300 transition-all active:scale-95"
            >
              Xem việc làm khác
            </button>
          </div>
        </div>

        {unavailable && (
          <div className="mt-12 p-5 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">Chi tiết trạng thái</h4>
              <p className="text-sm text-amber-800 mt-0.5">
                Vì lý do an toàn và tuân thủ quy định, bài đăng này đã được hệ thống tạm dừng hiển thị. 
                Nếu bạn đã ứng tuyển, thông tin của bạn vẫn được lưu trữ an toàn.
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="grid lg:grid-cols-3 gap-6 pb-24 lg:pb-0">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header Card */}
          <div className="card p-6">
            <div className="flex gap-4 mb-5">
              <div className="w-14 h-14 rounded-lg border border-line bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
                {job.employerId?.companyLogo ? (
                  <img src={job.employerId.companyLogo} alt={job.employerId?.name || 'Logo'} className="w-full h-full object-contain p-1" />
                ) : (
                  <span className="text-brand-500 font-bold text-xl">
                    {job.employerId?.name?.charAt(0)?.toUpperCase() || 'C'}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="text-xl font-bold text-heading">{job.title}</h1>
                    <p className="text-sm text-meta mt-0.5">{job.employerId?.name}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <SaveJobButton jobId={job._id} />
                    <StatusBadge status={job.status} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-bgSection rounded-lg px-3 py-2.5">
                <div className="text-xs text-meta">Địa điểm</div>
                <div className="text-sm font-medium text-heading mt-0.5">{job.location}</div>
              </div>
              <div className="bg-bgSection rounded-lg px-3 py-2.5">
                <div className="text-xs text-meta">Mức lương</div>
                <div className="text-sm font-medium text-brand-500 mt-0.5">{formatSalary(job.salary)}</div>
              </div>
              <div className="bg-bgSection rounded-lg px-3 py-2.5">
                <div className="text-xs text-meta">Loại hình</div>
                <div className="text-sm font-medium text-heading mt-0.5">{job.jobType}</div>
              </div>
              <div className="bg-bgSection rounded-lg px-3 py-2.5">
                <div className="text-xs text-meta">Ứng viên</div>
                <div className="text-sm font-medium text-heading mt-0.5">{job.applicationCount || 0} đơn</div>
              </div>
            </div>
          </div>

          {/* Full Job Details */}
          <div className="card p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-brand-500 rounded-sm"></div>
              <h2 className="text-lg font-bold text-heading">Chi tiết tin tuyển dụng</h2>
            </div>
            
            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <div>
                <h3 className="text-[15px] font-semibold text-heading mb-2.5">Kỹ năng chuyên môn</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span key={skill} className="tag tag-gray !bg-gray-100 !text-heading">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-[15px] font-semibold text-heading mb-2.5">Mô tả công việc</h3>
              <p className="text-sm text-body whitespace-pre-line leading-relaxed">{job.description}</p>
            </div>

            {/* Requirements */}
            <div>
              <h3 className="text-[15px] font-semibold text-heading mb-2.5">Yêu cầu ứng viên</h3>
              <p className="text-sm text-body whitespace-pre-line leading-relaxed">{job.requirements}</p>
            </div>

            {/* Benefits */}
            {job.benefits && (
              <div>
                <h3 className="text-[15px] font-semibold text-heading mb-2.5">Quyền lợi</h3>
                <p className="text-sm text-body whitespace-pre-line leading-relaxed">{job.benefits}</p>
              </div>
            )}
          </div>

          {/* Related Jobs */}
          {job.relatedJobs && job.relatedJobs.length > 0 && (
            <div className="card p-5 mt-6">
              <h2 className="text-lg font-bold text-heading mb-4">Việc làm liên quan</h2>
              <div className="space-y-3">
                {job.relatedJobs.map((relatedJob) => (
                  <Link
                    key={relatedJob._id}
                    to={`/jobs/${relatedJob._id}`}
                    className="flex gap-4 p-3 rounded-lg border border-line hover:bg-bgLight transition-colors group"
                  >
                    <div className="w-12 h-12 rounded bg-white border border-line flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {relatedJob.employerId?.companyLogo ? (
                        <img src={relatedJob.employerId.companyLogo} alt={relatedJob.employerId?.name || 'Logo'} className="w-full h-full object-contain p-1" />
                      ) : (
                        <span className="text-brand-500 font-bold text-sm">
                          {relatedJob.employerId?.name?.charAt(0)?.toUpperCase() || 'C'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-heading group-hover:text-brand-500 transition-colors truncate">
                        {relatedJob.title}
                      </h3>
                      <p className="text-xs text-meta mt-1 truncate">{relatedJob.employerId?.name}</p>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        <span className="text-xs font-semibold text-brand-500">{formatSalary(relatedJob.salary)}</span>
                        <span className="text-xs text-meta">• {relatedJob.location}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => navigate(-1)} className="btn-ghost text-sm mt-4">← Quay lại</button>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">
            {user?.role === 'candidate' && job.status === 'open' && (
              <div className="card p-5">
                {applied ? (
                  <div className="text-center py-2">
                    <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-brand-600">Đã ứng tuyển</p>
                    <p className="text-xs text-meta mt-1">Bạn đã nộp đơn cho vị trí này</p>
                  </div>
                ) : (
                  <form onSubmit={handleApply}>
                    <h3 className="font-semibold text-heading mb-3">Ứng tuyển ngay</h3>
                    
                    {user?.resumeUrl && !file && (
                      <div className="mb-4 p-3 bg-brand-50 rounded-lg border border-brand-100">
                        <div className="flex items-center gap-2 text-brand-700 mb-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs font-semibold">Sẵn sàng ứng tuyển</span>
                        </div>
                        <p className="text-[11px] text-brand-600 leading-tight">
                          Hệ thống sẽ sử dụng CV từ hồ sơ của bạn. Bạn vẫn có thể tải lên file mới bên dưới nếu muốn thay đổi.
                        </p>
                      </div>
                    )}

                    {!user?.resumeUrl && !file && (
                      <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-100">
                        <div className="flex items-center gap-2 text-red-700 mb-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span className="text-xs font-semibold">Thiếu thông tin</span>
                        </div>
                        <p className="text-[11px] text-red-600 leading-tight">
                          Vui lòng chọn file CV hoặc cập nhật hồ sơ cá nhân để nộp đơn ứng tuyển.
                        </p>
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="block text-xs font-medium text-meta mb-1.5">
                        {file ? 'File đã chọn' : 'Tải lên CV mới (Ưu tiên)'}
                      </label>
                      <input
                        type="file"
                        id="cv-upload"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="hidden"
                      />
                      <label 
                        htmlFor="cv-upload"
                        className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-line rounded-lg cursor-pointer hover:bg-bgLight transition-colors"
                      >
                        {file ? (
                          <div className="text-center">
                            <p className="text-xs font-medium text-brand-600 truncate max-w-[200px]">{file.name}</p>
                            <p className="text-[10px] text-meta">{(file.size/1024/1024).toFixed(1)} MB • Nhấp để thay đổi</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <svg className="w-8 h-8 text-meta mb-2 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-xs font-medium text-heading">Chọn tệp CV</p>
                            <p className="text-[10px] text-meta">PDF, DOC, DOCX (Tối đa 5MB)</p>
                          </div>
                        )}
                      </label>
                    </div>

                    <button 
                      type="submit" 
                      disabled={applying || (!file && !user?.resumeUrl)} 
                      className={`btn-primary w-full ${(!file && !user?.resumeUrl) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {applying ? 'Đang gửi...' : 'Nộp đơn ứng tuyển'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {!user && (
              <div className="card p-5 text-center">
                <p className="text-sm text-meta mb-3">Đăng nhập để ứng tuyển</p>
                <button onClick={() => navigate('/login')} className="btn-primary w-full text-sm">Đăng nhập</button>
              </div>
            )}

            <div className="card p-5">
              <h3 className="text-sm font-semibold text-heading mb-3">Thông tin</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-meta">Ngày đăng</span>
                  <span className="text-heading font-medium">{job.createdAt ? new Date(job.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-meta">Loại hình</span>
                  <span className="text-heading font-medium">{job.jobType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-meta">Hạn nộp hồ sơ</span>
                  <span className="text-heading font-medium">
                    {job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : 'Không thời hạn'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-meta">Trạng thái</span>
                  <StatusBadge status={job.status} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Bar for Mobile candidates */}
      {user?.role === 'candidate' && job.status === 'open' && !applied && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-line p-4 z-50 flex gap-3 shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">
          <div className="flex-1">
             <button 
               onClick={() => document.getElementById('cv-upload')?.click()}
               className="btn-primary w-full h-12 text-sm font-bold shadow-lg shadow-brand-100"
             >
               Ứng tuyển ngay
             </button>
          </div>
          <div className="flex-shrink-0">
             <SaveJobButton jobId={job._id} className="h-12 w-12 flex items-center justify-center rounded-xl bg-gray-50 border border-line" />
          </div>
        </div>
      )}
    </Layout>
  );
}
