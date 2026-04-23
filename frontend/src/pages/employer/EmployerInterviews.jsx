import { useState, useEffect, useMemo } from 'react';
import { interviewsAPI } from '../../api';
import { useToast } from '../../components/Toast';
import Layout from '../../components/Layout';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';

// ─── Minimalist SVG Icons ─────────────────────────────────────────────────────
const Icons = {
  Calendar: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
  ),
  Clock: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  Wait: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
  ),
  Cancel: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
  ),
  List: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
  ),
  Warning: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
  ),
  Bell: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
  ),
  Mail: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
  ),
  Phone: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
  ),
  Location: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  ),
  Edit: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
  ),
  Chat: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
  )
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDateShort = (d) =>
  new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

const fmtTime = (d) =>
  new Date(d).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

const isToday = (d) => {
  const now = new Date();
  const date = new Date(d);
  return now.toDateString() === date.toDateString();
};

const getCountdown = (d) => {
  const now = new Date();
  const target = new Date(d);
  const diffMs = target - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return { text: 'Hôm nay', type: 'today' };
  if (diffDays > 0) return { text: `Còn ${diffDays} ngày`, type: 'upcoming' };
  return { text: `Quá ${Math.abs(diffDays)} ngày`, type: 'overdue' };
};

const toInputDate = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};
const toInputTime = (d) => {
  const dt = new Date(d);
  return `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
};

// ─── Tabs & Sorting ──────────────────────────────────────────────────────────
const TABS = [
  { key: 'all', label: 'Tất cả', icon: <Icons.List /> },
  { key: 'upcoming', label: 'Sắp tới', icon: <Icons.Clock /> },
  { key: 'needs_eval', label: 'Chờ đánh giá', icon: <Icons.Wait /> },
  { key: 'done', label: 'Hoàn thành', icon: <Icons.Check /> },
  { key: 'cancelled', label: 'Đã hủy', icon: <Icons.Cancel /> },
];

const filterByTab = (interviews, tab) => {
  switch (tab) {
    case 'upcoming': return interviews.filter(iv => iv.status === 'scheduled');
    case 'needs_eval': return interviews.filter(iv => iv.status === 'completed' && !iv.result);
    case 'done': return interviews.filter(iv => iv.status === 'completed' && iv.result);
    case 'cancelled': return interviews.filter(iv => iv.status === 'cancelled');
    default: return interviews;
  }
};

const smartSort = (interviews) => {
  return [...interviews].sort((a, b) => {
    const priority = { scheduled: 0, completed: 1, cancelled: 2 };
    const pa = priority[a.status] ?? 99;
    const pb = priority[b.status] ?? 99;
    if (pa !== pb) return pa - pb;
    return a.status === 'scheduled' 
      ? new Date(a.scheduledAt) - new Date(b.scheduledAt) 
      : new Date(b.scheduledAt) - new Date(a.scheduledAt);
  });
};

// ─── Modals ───────────────────────────────────────────────────────────────────
function ModalWrapper({ open, onCancel, children, maxWidth = 'max-w-md' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onCancel} />
      <div className={`relative bg-white rounded-[2rem] shadow-2xl border border-white/20 w-full ${maxWidth} animate-slide-up overflow-hidden`}>
        {children}
      </div>
    </div>
  );
}

function ConfirmModal({ open, title, message, confirmLabel, confirmClass, onConfirm, onCancel }) {
  return (
    <ModalWrapper open={open} onCancel={onCancel}>
      <div className="p-8 text-center">
        <h3 className="text-xl font-bold text-heading mb-2">{title}</h3>
        <p className="text-sm text-meta leading-relaxed mb-8 px-4">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 px-5 rounded-xl font-bold text-sm text-body bg-bgSection hover:bg-gray-200 transition-colors">
            Hủy bỏ
          </button>
          <button onClick={onConfirm} className={`flex-1 py-3 px-5 rounded-xl font-bold text-sm text-white transition-transform active:scale-95 ${confirmClass || 'bg-brand-600 shadow-lg shadow-brand-100'}`}>
            {confirmLabel || 'Xác nhận'}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

function EvaluationModal({ iv, onSave, onCancel }) {
  const [evaluation, setEvaluation] = useState('');
  if (!iv) return null;

  return (
    <ModalWrapper open={!!iv} onCancel={onCancel} maxWidth="max-w-xl">
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-bold text-heading flex items-center gap-2"><Icons.Chat /> Đánh giá ứng viên</h4>
          <button onClick={onCancel} className="p-2 hover:bg-bgSection rounded-full text-meta transition-colors"><Icons.Cancel /></button>
        </div>
        <textarea
          value={evaluation}
          onChange={(e) => setEvaluation(e.target.value)}
          placeholder="Bạn đánh giá ứng viên này thế nào sau buổi phỏng vấn?"
          className="w-full bg-bgSection border-0 p-5 rounded-2xl text-sm h-40 focus:ring-2 focus:ring-brand-100 outline-none resize-none"
        />
        <div className="grid grid-cols-2 gap-4 pb-2">
          <button onClick={() => onSave(iv._id, { status: 'completed', result: 'passed', evaluation })} className="bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 flex items-center justify-center gap-2">
            <Icons.Check /><span>Đạt - Gửi Offer</span>
          </button>
          <button onClick={() => onSave(iv._id, { status: 'completed', result: 'failed', evaluation })} className="bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 shadow-lg shadow-red-100 flex items-center justify-center gap-2">
            <Icons.Cancel /><span>Từ chối</span>
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EmployerInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [evaluatingIv, setEvaluatingIv] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const { addToast } = useToast();

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    try {
      const { data } = await interviewsAPI.getAll();
      setInterviews(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleUpdate = async (id, updates) => {
    try {
      await interviewsAPI.update(id, updates);
      addToast('Cập nhật thành công');
      loadData();
      setEditingId(null);
      setEvaluatingIv(null);
      setConfirm(null);
    } catch (err) {
      addToast(err.response?.data?.message || 'Lỗi hệ thống', 'error');
    }
  };

  const filtered = useMemo(() => smartSort(filterByTab(interviews, activeTab)), [interviews, activeTab]);
  const tabCounts = useMemo(() => ({
    all: interviews.length,
    upcoming: interviews.filter(iv => iv.status === 'scheduled').length,
    needs_eval: interviews.filter(iv => iv.status === 'completed' && !iv.result).length,
    done: interviews.filter(iv => iv.status === 'completed' && iv.result).length,
    cancelled: interviews.filter(iv => iv.status === 'cancelled').length,
  }), [interviews]);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8 px-2">
        <h1 className="text-2xl font-black text-heading">Lịch phỏng vấn</h1>
      </div>

      {/* ═══ Tabs: Horizontal Scroll on Mobile ═══ */}
      {!loading && interviews.length > 0 && (
        <div className="flex items-center gap-3 mb-8 border-b border-line pb-4 overflow-x-auto scrollbar-hide px-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.key ? 'bg-brand-600 text-white shadow-lg shadow-brand-100' : 'text-meta hover:bg-brand-50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-white/20' : 'bg-bgSection text-meta'}`}>
                {tabCounts[tab.key]}
              </span>
            </button>
          ))}
        </div>
      )}

      {loading ? <LoadingSkeleton type="list" count={3} /> : filtered.length === 0 ? (
        <EmptyState title="Không có dữ liệu" description="Danh sách phỏng vấn đang trống ở mục này." />
      ) : (
        <div className="grid gap-6 px-1 sm:px-0">
          {filtered.map((iv) => {
            const countdown = iv.status === 'scheduled' ? getCountdown(iv.scheduledAt) : null;
            const candidate = iv.applicationId?.candidateId;
            const job = iv.applicationId?.jobId;

            return (
              <div key={iv._id} className="bg-white rounded-3xl p-5 sm:p-6 border border-line/60 shadow-sm relative transition-all hover:shadow-md overflow-hidden">
                <div className="flex flex-col sm:flex-row gap-5 sm:gap-6">
                  
                  {/* Avatar + Top Info (Mobile Header) */}
                  <div className="flex items-center gap-4 sm:items-start sm:flex-col sm:gap-4 flex-shrink-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center text-xl font-black flex-shrink-0">
                      {candidate?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="sm:hidden flex-1 min-w-0">
                      <h3 className="text-base font-bold text-heading truncate">{candidate?.name}</h3>
                      <p className="text-[11px] font-black text-brand-600 uppercase tracking-widest truncate">{job?.title}</p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="hidden sm:block mb-4">
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <h3 className="text-base font-bold text-heading">{candidate?.name}</h3>
                        <div className="flex gap-2">
                          <StatusBadge status={iv.status} />
                          {iv.result && <StatusBadge status={iv.result} />}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-meta font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-1.5"><Icons.Mail /> {candidate?.email}</div>
                        {candidate?.phone && <div className="flex items-center gap-1.5"><Icons.Phone /> {candidate.phone}</div>}
                      </div>
                    </div>

                    <div className="sm:hidden flex flex-wrap gap-2 mb-4">
                       <StatusBadge status={iv.status} />
                       {iv.result && <StatusBadge status={iv.result} />}
                       <div className="w-full flex flex-col gap-1 mt-1 text-[10px] text-meta font-bold uppercase tracking-tight">
                         <div className="flex items-center gap-1.5 truncate"><Icons.Mail /> {candidate?.email}</div>
                         {candidate?.phone && <div className="flex items-center gap-1.5"><Icons.Phone /> {candidate.phone}</div>}
                       </div>
                    </div>

                    <p className="hidden sm:block text-xs font-black text-brand-600 uppercase tracking-widest mb-4">{job?.title}</p>

                    {/* Interview Details */}
                    <div className="flex flex-col md:flex-row md:items-center gap-y-3 gap-x-6 mb-5 text-xs font-bold text-body">
                      <div className="flex items-center gap-2 group">
                        <span className="p-2 bg-gray-50 rounded-xl text-meta group-hover:bg-brand-50 transition-colors"><Icons.Calendar /></span>
                        <div className="flex items-center gap-2">
                          <span>{fmtDateShort(iv.scheduledAt)}</span>
                          <span className="text-line">|</span>
                          <span>{fmtTime(iv.scheduledAt)}</span>
                        </div>
                        {countdown && (
                          <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full ${countdown.type === 'overdue' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            {countdown.text}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 group">
                        <span className="p-2 bg-gray-50 rounded-xl text-meta group-hover:bg-blue-50 transition-colors"><Icons.Location /></span>
                        <span className="line-clamp-1">{iv.location || 'Chưa cập nhật địa điểm'}</span>
                      </div>
                    </div>

                    {/* Message / Evaluation Area */}
                    <div className="bg-gray-50/70 rounded-2xl p-4 sm:p-5 space-y-4">
                      {iv.note && (
                        <div>
                          <p className="text-[10px] font-black text-meta uppercase tracking-widest mb-1.5 opacity-60">Tin nhắn đã gửi:</p>
                          <p className="text-[13px] font-medium text-body italic leading-relaxed">"{iv.note}"</p>
                        </div>
                      )}
                      {iv.evaluation && (
                        <div className="pt-3 border-t border-gray-200/50">
                          <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1.5 opacity-70 flex items-center gap-1.5">
                            <Icons.Chat /> Nhận xét phỏng vấn:
                          </p>
                          <p className="text-sm font-bold text-purple-900 leading-relaxed">{iv.evaluation}</p>
                        </div>
                      )}
                      {!iv.note && !iv.evaluation && (
                        <p className="text-[11px] text-meta italic">Không có tin nhắn kèm theo.</p>
                      )}
                    </div>
                  </div>

                  {/* Actions Column/Row */}
                  <div className="w-full sm:w-48 flex flex-col sm:pt-1 sm:border-l border-gray-100 sm:pl-6 gap-3">
                    {iv.status === 'scheduled' && (
                      <div className="grid grid-cols-1 gap-2">
                        <button onClick={() => setConfirm({ title: 'Hoàn thành PV', message: `Xác nhận buổi phỏng vấn này đã kết thúc?`, confirmLabel: 'Hoàn thành', onConfirm: () => handleUpdate(iv._id, { status: 'completed' }) })} className="w-full py-3 bg-green-600 text-white rounded-xl font-black text-[10px] uppercase transition-all hover:bg-green-700 flex items-center justify-center gap-2 shadow-sm">
                          <Icons.Check /> Hoàn thành
                        </button>
                        <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
                          <button onClick={() => setEditingId(editingId === iv._id ? null : iv._id)} className="py-2.5 bg-white border border-line text-body rounded-xl font-bold text-[10px] uppercase hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-all flex items-center justify-center gap-2">
                            <Icons.Edit /> Dời lịch
                          </button>
                          <button onClick={() => setConfirm({ title: 'Hủy lịch hẹn', message: 'Bạn chắc chắn muốn hủy lịch này?', confirmLabel: 'Hủy lịch', confirmClass: 'bg-red-600', onConfirm: () => handleUpdate(iv._id, { status: 'cancelled' }) })} className="py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-[10px] uppercase hover:bg-red-100 transition-all flex items-center justify-center gap-2">
                            <Icons.Cancel /> Hủy lịch
                          </button>
                        </div>
                      </div>
                    )}
                    {iv.status === 'completed' && !iv.result && (
                      <button onClick={() => setEvaluatingIv(iv)} className="w-full py-3.5 bg-brand-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-brand-100 flex items-center justify-center gap-2 active:scale-95 transition-all">
                         <Icons.Edit /> Đánh giá kết quả
                      </button>
                    )}
                  </div>
                </div>

                {editingId === iv._id && (
                  <div className="animate-slide-up bg-bgSection/30 rounded-2xl mt-6 p-4 sm:p-6 border border-line/40">
                    <EditForm iv={iv} onSave={handleUpdate} onCancel={() => setEditingId(null)} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal open={!!confirm} {...confirm} onCancel={() => setConfirm(null)} />
      <EvaluationModal iv={evaluatingIv} onSave={handleUpdate} onCancel={() => setEvaluatingIv(null)} />
    </Layout>
  );
}

function EditForm({ iv, onSave, onCancel }) {
  const [form, setForm] = useState({ date: toInputDate(iv.scheduledAt), time: toInputTime(iv.scheduledAt), location: iv.location || '', note: iv.note || '' });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(iv._id, { scheduledAt: `${form.date}T${form.time}`, location: form.location, note: form.note }); }} className="mt-6 p-6 bg-bgSection/40 rounded-2xl border border-dashed border-line space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-field !rounded-xl font-bold text-sm" required />
        <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="input-field !rounded-xl font-bold text-sm" required />
      </div>
      <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-field !rounded-xl text-sm" placeholder="Địa điểm..." />
      <div className="flex gap-3"><button type="submit" className="px-6 py-2 bg-heading text-white rounded-xl font-bold text-xs uppercase opacity-90">Lưu lịch</button><button type="button" onClick={onCancel} className="px-6 py-2 bg-bgSection text-body rounded-xl font-bold text-xs uppercase">Hủy</button></div>
    </form>
  );
}
