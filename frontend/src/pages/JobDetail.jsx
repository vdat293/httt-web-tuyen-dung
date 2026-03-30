import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobsAPI, applicationsAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import Layout from '../components/Layout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import StatusBadge from '../components/StatusBadge';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [job, setJob] = useState(null);
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => { 
    window.scrollTo(0, 0);
    loadJob(); 
  }, [id]);

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
  if (!job) return (
    <Layout>
      <div className="text-center py-16">
        <p className="text-meta mb-4">Không tìm thấy tin tuyển dụng</p>
        <button onClick={() => navigate('/')} className="btn-primary text-sm">← Quay lại</button>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="grid lg:grid-cols-3 gap-6">
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
                  <StatusBadge status={job.status} />
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
                <div className="text-sm font-medium text-brand-500 mt-0.5">{job.salary || 'Thỏa thuận'}</div>
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
                        <span className="text-xs font-semibold text-brand-500">{relatedJob.salary}</span>
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
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-meta mb-1.5">Upload CV (PDF, DOC) — tối đa 5MB</label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="w-full text-sm text-body file:mr-3 file:py-2 file:px-4 file:rounded-md file:border file:border-line file:text-sm file:font-medium file:bg-bgSection file:text-heading hover:file:bg-gray-200 file:cursor-pointer file:transition-colors"
                      />
                      {file && <p className="text-xs text-meta mt-1">{file.name} ({(file.size/1024/1024).toFixed(1)} MB)</p>}
                    </div>
                    <button type="submit" disabled={applying} className="btn-primary w-full">
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
                  <span className="text-meta">Trạng thái</span>
                  <StatusBadge status={job.status} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
