import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { applicationsAPI, jobsAPI, interviewsAPI } from '../../api';
import { useToast } from '../../components/Toast';
import Layout from '../../components/Layout';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';

const STATUS_LABELS = { pending: 'Chờ duyệt', reviewed: 'Đã xem', interview: 'Phỏng vấn', accepted: 'Nhận', rejected: 'Từ chối' };

export default function EmployerApplications() {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({ jobId: searchParams.get('jobId') || '', status: '', skills: '' });
  const [showInterviewForm, setShowInterviewForm] = useState(null);
  const { addToast } = useToast();

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    try {
      const [a, j] = await Promise.all([
        applicationsAPI.getAll({ jobId: filters.jobId || undefined, status: filters.status || undefined, skills: filters.skills || undefined }),
        jobsAPI.getMyJobs(),
      ]);
      setApplications(a.data); setJobs(j.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, [filters]);

  const handleStatus = async (id, status) => {
    try { await applicationsAPI.updateStatus(id, status); addToast(`${STATUS_LABELS[status]}`); loadData(); }
    catch (err) { addToast(err.response?.data?.message || 'Lỗi', 'error'); }
  };

  const handleViewCV = async (app) => {
    if (app.status === 'pending') {
      try {
        await applicationsAPI.updateStatus(app._id, 'reviewed');
        setApplications((prev) => 
          prev.map((a) => a._id === app._id ? { ...a, status: 'reviewed' } : a)
        );
      } catch (err) {
        console.error('Failed to auto-update status to reviewed:', err);
      }
    }
  };

  const handleInterview = async (appId, e) => {
    e.preventDefault();
    const f = e.target;
    const scheduledAt = `${f.date.value}T${f.time.value}`;
    try {
      await interviewsAPI.create({ applicationId: appId, scheduledAt, location: f.location.value, note: f.note.value });
      setShowInterviewForm(null); addToast('Đã lên lịch phỏng vấn'); loadData();
    } catch (err) { addToast(err.response?.data?.message || 'Lỗi', 'error'); }
  };

  return (
    <Layout>
      <h1 className="section-title mb-5">Hồ sơ ứng viên</h1>

      <div className="card p-4 mb-5 flex flex-wrap gap-3">
        <select value={filters.jobId} onChange={e => setFilters({...filters, jobId: e.target.value})} className="input-field !w-auto text-sm">
          <option value="">Tất cả tin</option>
          {jobs.map(j => <option key={j._id} value={j._id}>{j.title}</option>)}
        </select>
        <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="input-field !w-auto text-sm">
          <option value="">Tất cả trạng thái</option>
          {Object.entries(STATUS_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input placeholder="Lọc kỹ năng..." value={filters.skills} onChange={e => setFilters({...filters, skills: e.target.value})} className="input-field !w-auto text-sm" />
      </div>

      {loading ? <LoadingSkeleton type="list" count={4} /> : applications.length === 0 ? (
        <EmptyState title="Không có hồ sơ" description="Chưa có ứng viên nào hoặc không khớp bộ lọc." />
      ) : (
        <div className="space-y-3">
          {applications.map(app => (
            <div key={app._id} className="card p-5">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  {app.candidateId?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-semibold text-heading">{app.candidateId?.name}</h3>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="text-xs text-meta">{app.candidateId?.email} · {app.candidateId?.phone}</p>
                  <p className="text-xs text-brand-500 font-medium mt-0.5">{app.jobId?.title} — {app.jobId?.location}</p>
                  {app.cvUrl && (
                    <a 
                      href={app.cvUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      onClick={() => handleViewCV(app)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-600 hover:text-brand-700 bg-brand-50/80 hover:bg-brand-100 px-2.5 py-1 rounded transition-all mt-2 group"
                    >
                      <span>Xem CV</span>
                      <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                  )}
                </div>
              </div>

              {(app.parsedCV?.skills?.length > 0 || app.parsedCV?.experience || app.parsedCV?.education) && (
                <div className="mt-3 p-3 bg-bgSection rounded-lg border border-line text-xs">
                  <span className="font-semibold text-meta uppercase tracking-wide">AI phân tích</span>
                  {app.parsedCV?.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">{app.parsedCV.skills.map(s => <span key={s} className="tag tag-green">{s}</span>)}</div>
                  )}
                  {app.parsedCV?.experience && <p className="text-body mt-1">KN: {app.parsedCV.experience}</p>}
                  {app.parsedCV?.education && <p className="text-body">HV: {app.parsedCV.education}</p>}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-line">
                <button 
                  onClick={() => setShowInterviewForm(app._id)} 
                  disabled={app.status === 'rejected' || app.status === 'accepted' || app.status === 'interview'}
                  className={`text-sm py-1.5 px-5 rounded-lg font-semibold transition-all active:scale-95 ${
                    app.status === 'interview' || app.status === 'rejected' || app.status === 'accepted'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                      : 'btn-primary'
                  }`}
                >
                  {app.status === 'interview' ? 'Đã hẹn phỏng vấn' : 'Lên lịch PV'}
                </button>
                <button 
                  onClick={() => handleStatus(app._id, 'rejected')}
                  disabled={app.status === 'rejected' || app.status === 'accepted'}
                  className={`px-4 py-1.5 border rounded-lg text-sm font-medium transition-all active:scale-95 ${
                    app.status === 'rejected'
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                      : 'border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300'
                  } ${(app.status === 'accepted' || app.status === 'interview') ? 'hidden' : ''}`}
                >
                  {app.status === 'rejected' ? 'Đã từ chối' : 'Từ chối'}
                </button>
              </div>

              {showInterviewForm === app._id && (
                <form onSubmit={e => handleInterview(app._id, e)} className="mt-3 p-4 bg-bgSection rounded-lg border border-line space-y-2 animate-fade-in">
                  <p className="text-sm font-semibold text-heading">Lên lịch phỏng vấn</p>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="flex gap-3 sm:col-span-2">
                      <div className="flex-[2]">
                        <label className="block text-[11px] font-bold text-meta uppercase tracking-wider mb-1">Ngày phỏng vấn</label>
                        <input type="date" name="date" className="input-field text-sm" required />
                      </div>
                      <div className="flex-[1]">
                        <label className="block text-[11px] font-bold text-meta uppercase tracking-wider mb-1">Giờ hẹn</label>
                        <input type="time" name="time" className="input-field text-sm" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-meta uppercase tracking-wider mb-1">Địa điểm / Link</label>
                      <input name="location" placeholder="Số nhà, Tên đường... hoặc Link Meet" className="input-field text-sm" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="block text-[11px] font-bold text-meta uppercase tracking-wider mb-1">Lời nhắn ứng viên</label>
                    <textarea name="note" placeholder="Nội dung cần chuẩn bị, trang phục..." className="input-field text-sm h-16 resize-none"></textarea>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="btn-primary text-sm !py-1.5">Xác nhận</button>
                    <button type="button" onClick={() => setShowInterviewForm(null)} className="btn-ghost text-sm border border-line !py-1.5">Hủy</button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
