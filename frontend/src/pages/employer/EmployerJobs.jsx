import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobsAPI } from '../../api';
import { useToast } from '../../components/Toast';
import Layout from '../../components/Layout';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';

export default function EmployerJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { addToast } = useToast();
  const [form, setForm] = useState({ title: '', description: '', requirements: '', salaryMin: '', salaryMax: '', location: '', jobType: 'full-time', skills: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { loadJobs(); }, []);
  const loadJobs = async () => {
    try { const { data } = await jobsAPI.getMyJobs(); setJobs(data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        ...form, 
        salary: { 
          min: Number(form.salaryMin), 
          max: Number(form.salaryMax) 
        },
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean) 
      };
      delete payload.salaryMin;
      delete payload.salaryMax;

      if (editingId) { await jobsAPI.update(editingId, payload); addToast('Cập nhật thành công'); }
      else { await jobsAPI.create(payload); addToast('Tạo tin thành công'); }
      setShowForm(false); setEditingId(null);
      setForm({ title: '', description: '', requirements: '', salaryMin: '', salaryMax: '', location: '', jobType: 'full-time', skills: '' });
      loadJobs();
    } catch (err) { addToast(err.response?.data?.message || 'Lỗi', 'error'); }
  };

  const handleEdit = (job) => {
    setEditingId(job._id);
    setForm({ 
      title: job.title, 
      description: job.description, 
      requirements: job.requirements, 
      salaryMin: job.salary?.min || '', 
      salaryMax: job.salary?.max || '', 
      location: job.location, 
      jobType: job.jobType, 
      skills: job.skills?.join(', ') || '' 
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa tin này?')) return;
    try { await jobsAPI.delete(id); addToast('Đã xóa'); loadJobs(); }
    catch (err) { addToast(err.response?.data?.message || 'Lỗi', 'error'); }
  };

  const handleToggle = async (job) => {
    try {
      await jobsAPI.update(job._id, { status: job.status === 'open' ? 'closed' : 'open' });
      addToast(job.status === 'open' ? 'Đã đóng tin' : 'Đã mở tin');
      loadJobs();
    } catch (err) { addToast(err.response?.data?.message || 'Lỗi', 'error'); }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-5">
        <h1 className="section-title">Tin tuyển dụng</h1>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ title: '', description: '', requirements: '', salaryMin: '', salaryMax: '', location: '', jobType: 'full-time', skills: '' }); }} className="btn-primary text-sm">
          + Tạo tin mới
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-heading">{editingId ? 'Sửa tin' : 'Tạo tin mới'}</h2>
              <button onClick={() => setShowForm(false)} className="text-meta hover:text-heading text-lg">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="form-group !mb-0">
                  <label>Tiêu đề *</label>
                  <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field" required />
                </div>
                <div className="form-group !mb-0">
                  <label>Địa điểm *</label>
                  <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="input-field" required />
                </div>
                <div className="form-group !mb-0">
                  <label>Lương tối thiểu (VNĐ)</label>
                  <input type="number" value={form.salaryMin} onChange={e => setForm({...form, salaryMin: e.target.value})} className="input-field" placeholder="Ví dụ: 10000000" />
                </div>
                <div className="form-group !mb-0">
                  <label>Lương tối đa (VNĐ)</label>
                  <input type="number" value={form.salaryMax} onChange={e => setForm({...form, salaryMax: e.target.value})} className="input-field" placeholder="Ví dụ: 20000000" />
                </div>
                <div className="form-group !mb-0">
                  <label>Loại hình</label>
                  <select value={form.jobType} onChange={e => setForm({...form, jobType: e.target.value})} className="input-field">
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>
              </div>
              <div className="form-group !mb-0">
                <label>Kỹ năng (cách nhau dấu phẩy)</label>
                <input value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} className="input-field" placeholder="React, Node.js, MongoDB" />
              </div>
              <div className="form-group !mb-0">
                <label>Mô tả *</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field h-24 resize-none" required />
              </div>
              <div className="form-group !mb-0">
                <label>Yêu cầu *</label>
                <textarea value={form.requirements} onChange={e => setForm({...form, requirements: e.target.value})} className="input-field h-24 resize-none" required />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1">{editingId ? 'Lưu' : 'Đăng tin'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost border border-line flex-shrink-0">Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <LoadingSkeleton type="list" count={4} /> : jobs.length === 0 ? (
        <EmptyState icon="📋" title="Chưa có tin tuyển dụng" description="Tạo tin tuyển dụng để tìm ứng viên phù hợp." action={() => setShowForm(true)} actionLabel="+ Tạo tin" />
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job._id} className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow">
              <div className="w-10 h-10 rounded-lg border border-line bg-bgSection flex items-center justify-center flex-shrink-0 text-brand-500 font-bold text-sm">
                {job.title?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-heading truncate">{job.title}</h3>
                <p className="text-xs text-meta mt-0.5">
                  {job.location} · {job.jobType} · {job.salary ? `${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()} VNĐ` : 'Thỏa thuận'}
                </p>
                {job.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {job.skills.slice(0, 4).map(s => <span key={s} className="text-xs bg-bgSection text-meta px-1.5 py-0.5 rounded">{s}</span>)}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => handleToggle(job)}><StatusBadge status={job.status} /></button>
                <button onClick={() => handleEdit(job)} className="text-xs text-brand-500 hover:text-brand-600 font-medium px-2 py-1 rounded hover:bg-brand-50 transition-colors">Sửa</button>
                <button onClick={() => handleDelete(job._id)} className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors">Xóa</button>
                <Link to={`/employer/applications?jobId=${job._id}`} className="text-xs text-blue-500 hover:text-blue-600 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors">Ứng viên</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
