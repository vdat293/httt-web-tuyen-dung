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

  const handleInterview = async (appId, e) => {
    e.preventDefault();
    const f = e.target;
    try {
      await interviewsAPI.create({ applicationId: appId, scheduledAt: f.scheduledAt.value, location: f.location.value, note: f.note.value });
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
        <EmptyState icon="👥" title="Không có hồ sơ" description="Chưa có ứng viên nào hoặc không khớp bộ lọc." />
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
                  {app.cvUrl && <a href={app.cvUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline mt-1 inline-block">Xem CV</a>}
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

              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-line">
                <select value={app.status} onChange={e => handleStatus(app._id, e.target.value)} className="input-field !w-auto !py-1.5 text-sm">
                  {Object.entries(STATUS_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <button onClick={() => setShowInterviewForm(app._id)} className="btn-primary text-sm !py-1.5">Lên lịch PV</button>
              </div>

              {showInterviewForm === app._id && (
                <form onSubmit={e => handleInterview(app._id, e)} className="mt-3 p-4 bg-bgSection rounded-lg border border-line space-y-2 animate-fade-in">
                  <p className="text-sm font-semibold text-heading">Lên lịch phỏng vấn</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <input type="datetime-local" name="scheduledAt" className="input-field text-sm" required />
                    <input name="location" placeholder="Địa điểm / Link" className="input-field text-sm" />
                  </div>
                  <textarea name="note" placeholder="Ghi chú" className="input-field text-sm h-14 resize-none"></textarea>
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
