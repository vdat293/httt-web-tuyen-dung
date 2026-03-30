import { useState, useEffect } from 'react';
import { applicationsAPI } from '../../api';
import Layout from '../../components/Layout';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';

const STEPS = ['pending', 'reviewed', 'interview', 'accepted'];
const STEP_LABELS = { pending: 'Nộp đơn', reviewed: 'Đã xem', interview: 'Phỏng vấn', accepted: 'Nhận việc' };

export default function CandidateApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    try { const { data } = await applicationsAPI.getAll(); setApplications(data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <Layout>
      <h1 className="section-title mb-5">Đơn ứng tuyển của tôi</h1>

      {loading ? <LoadingSkeleton type="list" count={3} /> : applications.length === 0 ? (
        <EmptyState icon="📋" title="Chưa có đơn" description="Tìm kiếm và ứng tuyển việc làm phù hợp." action={() => window.location.href = '/jobs'} actionLabel="Tìm việc" />
      ) : (
        <div className="space-y-3">
          {applications.map(app => {
            const stepIdx = app.status === 'rejected' ? -1 : STEPS.indexOf(app.status);
            const rejected = app.status === 'rejected';
            return (
              <div key={app._id} className="card p-5">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg border border-line bg-bgSection flex items-center justify-center flex-shrink-0 text-brand-500 font-bold text-sm">
                      {app.jobId?.title?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-heading truncate">{app.jobId?.title}</h3>
                      <p className="text-xs text-meta mt-0.5">{app.jobId?.location} · {app.jobId?.salary}</p>
                      <p className="text-xs text-meta mt-0.5">Nộp: {new Date(app.appliedAt).toLocaleDateString('vi-VN')}</p>
                      {app.cvUrl && <a href={app.cvUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline mt-0.5 inline-block">Xem CV</a>}
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>

                {/* Simple step progress */}
                <div className="mt-4 pt-3 border-t border-line">
                  <div className="flex items-center">
                    {STEPS.map((step, i) => {
                      const done = !rejected && stepIdx >= i;
                      const current = !rejected && stepIdx === i;
                      return (
                        <div key={step} className="flex items-center flex-1">
                          <div className="flex flex-col items-center">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              rejected ? 'bg-red-100 text-red-400' : done ? 'bg-brand-500 text-white' : 'bg-gray-200 text-meta'
                            } ${current ? 'ring-2 ring-brand-200' : ''}`}>
                              {done ? '✓' : i + 1}
                            </div>
                            <span className={`text-[10px] mt-1 ${done ? 'text-brand-500 font-medium' : 'text-meta'}`}>{STEP_LABELS[step]}</span>
                          </div>
                          {i < STEPS.length - 1 && (
                            <div className={`flex-1 h-px mx-1.5 ${!rejected && stepIdx > i ? 'bg-brand-500' : 'bg-gray-200'}`}></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {rejected && <p className="text-xs text-red-500 text-center mt-2">Đơn đã bị từ chối</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
