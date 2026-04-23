import { useState, useEffect } from 'react';
import { interviewsAPI } from '../../api';
import Layout from '../../components/Layout';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { useSocket } from '../../contexts/SocketContext';

export default function CandidateInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (notif) => {
      if (['interview_scheduled', 'application_status_changed'].includes(notif.type)) {
        loadData();
      }
    };

    socket.on('new_notification', handleNotification);
    return () => socket.off('new_notification', handleNotification);
  }, [socket]);
  const loadData = async () => {
    try { const { data } = await interviewsAPI.getAll(); setInterviews(data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fmtDate = d => new Date(d).toLocaleString('vi-VN', { dateStyle: 'full', timeStyle: 'short' });

  const getCountdown = (d) => {
    const diff = new Date(d) - new Date();
    if (diff <= 0) return null;
    const days = Math.floor(diff / 86400000);
    const hrs = Math.floor((diff % 86400000) / 3600000);
    return days > 0 ? `${days} ngày ${hrs} giờ` : `${hrs} giờ ${Math.floor((diff % 3600000) / 60000)} phút`;
  };

  return (
    <Layout>
      <h1 className="section-title mb-5">Lịch phỏng vấn</h1>

      {loading ? <LoadingSkeleton type="list" count={3} /> : interviews.length === 0 ? (
        <EmptyState icon="📅" title="Không có lịch" description="Khi nhà tuyển dụng lên lịch, bạn sẽ thấy tại đây." />
      ) : (
        <div className="space-y-3">
          {interviews.map(iv => {
            const countdown = iv.status === 'scheduled' ? getCountdown(iv.scheduledAt) : null;
            return (
              <div key={iv._id} className={`card p-5 ${countdown ? 'border-brand-200' : ''}`}>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg border border-line bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {iv.applicationId?.jobId?.employerId?.companyLogo ? (
                      <img 
                        src={iv.applicationId.jobId.employerId.companyLogo} 
                        alt={iv.applicationId.jobId.employerId.name || 'Company'} 
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <span className="text-brand-500 font-bold text-sm">
                        {iv.applicationId?.jobId?.title?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <h3 className="text-sm font-semibold text-heading">{iv.applicationId?.jobId?.title}</h3>
                      <StatusBadge status={iv.status} />
                    </div>
                    <p className="text-xs text-brand-600 font-medium mb-1">{iv.applicationId?.jobId?.employerId?.name}</p>
                    <p className="text-xs text-body mt-1.5">📅 {fmtDate(iv.scheduledAt)}</p>
                    {iv.location && <p className="text-xs text-meta mt-0.5">📍 {iv.location}</p>}
                    {countdown && (
                      <p className="text-xs font-semibold text-brand-500 mt-1.5 bg-brand-50 inline-block px-2 py-0.5 rounded">
                        ⏰ Còn {countdown}
                      </p>
                    )}
                    {iv.note && <p className="text-xs text-meta mt-1.5 bg-bgSection p-2 rounded">📝 {iv.note}</p>}
                  </div>
                  {iv.result && (
                    <div className={`text-center px-3 py-2 rounded-lg h-fit ${iv.result === 'passed' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      <span className={`text-xs font-bold ${iv.result === 'passed' ? 'text-green-600' : 'text-red-600'}`}>
                        {iv.result === 'passed' ? 'ĐẠT' : 'KHÔNG ĐẠT'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
