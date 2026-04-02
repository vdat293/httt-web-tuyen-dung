import { useState, useEffect } from 'react';
import { notificationsAPI } from '../api';
import { useSocket } from '../contexts/SocketContext';
import { useToast } from '../components/Toast';
import Layout from '../components/Layout';

const TYPE_CONFIG = {
  application_received: { icon: '📥', color: 'text-blue-500 bg-blue-50', label: 'Đơn ứng tuyển' },
  application_status_changed: { icon: '🔄', color: 'text-orange-500 bg-orange-50', label: 'Cập nhật' },
  interview_scheduled: { icon: '📅', color: 'text-purple-500 bg-purple-50', label: 'Phỏng vấn' },
  interview_reminder: { icon: '⏰', color: 'text-yellow-500 bg-yellow-50', label: 'Nhắc nhở' },
  job_approved: { icon: '✅', color: 'text-green-500 bg-green-50', label: 'Duyệt tin' },
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [markingAll, setMarkingAll] = useState(false);
  const { setUnread } = useSocket();
  const { addToast } = useToast();

  useEffect(() => { loadNotifications(); }, [filter, page]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (filter === 'unread') params.isRead = 'false';
      const { data } = await notificationsAPI.getAll(params);
      setNotifications(data.notifications || []);
      setTotalPages(data.totalPages || 1);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const handleMarkRead = async (id) => {
    try {
      const { data } = await notificationsAPI.markRead(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? data : n));
    } catch (_) {}
  };

  const handleDelete = async (id) => {
    try {
      await notificationsAPI.delete(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      addToast('Đã xóa thông báo', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Xóa thất bại', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await notificationsAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnread(0);
      addToast('Đã đánh dấu tất cả đã đọc', 'success');
    } catch (err) {
      addToast('Thất bại', 'error');
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="section-title">Thông báo</h1>
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll || !notifications.some((n) => !n.isRead)}
            className="btn-outline !py-1.5 !px-4 text-sm disabled:opacity-50"
          >
            {markingAll ? 'Đang xử lý...' : 'Đánh dấu đã đọc tất cả'}
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-4 bg-bgSection rounded-lg p-1 w-fit">
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'unread', label: 'Chưa đọc' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setFilter(tab.key); setPage(1); }}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-white text-heading shadow-sm'
                  : 'text-meta hover:text-heading'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-white animate-pulse"></div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="card p-12 text-center">
            <span className="text-5xl">🔔</span>
            <h3 className="font-semibold text-heading mt-4">
              {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Không có thông báo nào'}
            </h3>
            <p className="text-sm text-meta mt-1">
              {filter === 'unread' ? 'Tất cả thông báo đã được đọc.' : 'Bạn sẽ nhận thông báo khi có cập nhật.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => {
              const config = TYPE_CONFIG[n.type] || { icon: '🔔', color: 'text-gray-500 bg-gray-50' };
              return (
                <div
                  key={n._id}
                  className={`card p-4 flex gap-3 items-start transition-all ${
                    !n.isRead ? 'border-l-4 border-l-brand-500' : ''
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${config.color}`}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`text-sm leading-snug ${!n.isRead ? 'font-semibold text-heading' : 'text-body'}`}>
                          {n.title}
                        </p>
                        <p className="text-sm text-meta mt-0.5 whitespace-pre-line">{n.message}</p>
                        <p className="text-xs text-meta mt-2">{formatDate(n.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!n.isRead && (
                          <button
                            onClick={() => handleMarkRead(n._id)}
                            title="Đánh dấu đã đọc"
                            className="p-1.5 rounded-md text-meta hover:text-brand-500 hover:bg-brand-50 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(n._id)}
                          title="Xóa thông báo"
                          className="p-1.5 rounded-md text-meta hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-outline !py-1.5 !px-3 text-sm disabled:opacity-40"
            >
              ←
            </button>
            <span className="px-3 py-1.5 text-sm text-meta">
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-outline !py-1.5 !px-3 text-sm disabled:opacity-40"
            >
              →
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
