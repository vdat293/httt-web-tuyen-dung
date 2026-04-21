import { useState, useEffect } from 'react';
import { interviewsAPI } from '../../api';
import { useToast } from '../../components/Toast';
import Layout from '../../components/Layout';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';

export default function EmployerInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    try { const { data } = await interviewsAPI.getAll(); setInterviews(data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleUpdate = async (id, updates) => {
    try { await interviewsAPI.update(id, updates); addToast('Đã cập nhật'); loadData(); }
    catch (err) { addToast(err.response?.data?.message || 'Lỗi', 'error'); }
  };

  const fmtDate = d => new Date(d).toLocaleString('vi-VN', { dateStyle: 'full', timeStyle: 'short' });

  return (
    <Layout>
      <h1 className="section-title mb-5">Lịch phỏng vấn</h1>

      {loading ? <LoadingSkeleton type="list" count={3} /> : interviews.length === 0 ? (
        <EmptyState icon="📅" title="Không có lịch phỏng vấn" description="Lên lịch PV từ trang quản lý hồ sơ ứng viên." />
      ) : (
        <div className="space-y-3">
          {interviews.map(iv => (
            <div key={iv._id} className="card p-5">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  {iv.applicationId?.candidateId?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <h3 className="text-sm font-semibold text-heading">{iv.applicationId?.candidateId?.name}</h3>
                    <StatusBadge status={iv.status} />
                    {iv.result && <StatusBadge status={iv.result} />}
                  </div>
                  <p className="text-xs text-meta">{iv.applicationId?.candidateId?.email}</p>
                  <p className="text-xs text-brand-500 font-medium mt-0.5">{iv.applicationId?.jobId?.title}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-body">
                    <span>📅 {fmtDate(iv.scheduledAt)}</span>
                    {iv.location && <span>📍 {iv.location}</span>}
                  </div>
                  {iv.note && <p className="text-xs text-meta mt-1.5 bg-bgSection p-2 rounded">📝 {iv.note}</p>}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-line">
                {iv.status === 'scheduled' && (
                  <select defaultValue="" onChange={e => { if (e.target.value) handleUpdate(iv._id, { status: e.target.value }); }} className="input-field !w-auto !py-1.5 text-sm">
                    <option value="">Cập nhật...</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="cancelled">Hủy</option>
                  </select>
                )}
                {iv.status === 'completed' && !iv.result && (
                  <>
                    <button onClick={() => handleUpdate(iv._id, { status: 'completed', result: 'passed' })} className="btn-primary text-sm !py-1.5 !bg-green-500 hover:!bg-green-600">Đạt</button>
                    <button onClick={() => handleUpdate(iv._id, { status: 'completed', result: 'failed' })} className="text-sm font-medium px-4 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors">Không đạt</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
