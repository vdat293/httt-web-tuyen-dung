import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notificationsAPI } from '../api';
import { useSocket } from '../contexts/SocketContext';
import { useToast } from './Toast';

const TYPE_CONFIG = {
  application_received: { icon: '📥', color: 'text-blue-500 bg-blue-50', label: 'Đơn ứng tuyển' },
  application_status_changed: { icon: '🔄', color: 'text-orange-500 bg-orange-50', label: 'Cập nhật' },
  interview_scheduled: { icon: '📅', color: 'text-purple-500 bg-purple-50', label: 'Phỏng vấn' },
  interview_reminder: { icon: '⏰', color: 'text-yellow-500 bg-yellow-50', label: 'Nhắc nhở' },
  job_approved: { icon: '✅', color: 'text-green-500 bg-green-50', label: 'Duyệt tin' },
  job_rejected: { icon: '❌', color: 'text-red-500 bg-red-50', label: 'Từ chối tin' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  return `${days} ngày trước`;
}

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { setUnread, decrementUnread } = useSocket();
  const { addToast } = useToast();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await notificationsAPI.getAll({ limit: 10 });
      setNotifications(data.notifications || data);
    } catch (_) {}
    finally { setLoading(false); }
  };

  // Real-time update when dropdown opens
  useEffect(() => {
    if (open) loadNotifications();
  }, [open]);

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await notificationsAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      // Đặt về 0 vì đã đọc hết tất cả
      setUnread(0);
    } catch (err) {
      addToast('Không thể đánh dấu đã đọc', 'error');
    } finally {
      setMarkingAll(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => n._id === id ? { ...n, isRead: true } : n)
      );
      decrementUnread();
    } catch (_) {}
  };

  const handleNotificationClick = async (notification) => {
    // Mark read + navigate based on type
    if (!notification.isRead) await handleMarkRead(notification._id);

    const { type, data } = notification;
    setOpen(false);

    if (type === 'application_received' && data?.jobId) {
      navigate(`/employer/applications?job=${data.jobId}`);
    } else if (type === 'application_status_changed' && data?.applicationId) {
      navigate(`/candidate/applications`);
    } else if (type === 'interview_scheduled' && data?.interviewId) {
      navigate(`/candidate/interviews`);
    } else {
      navigate('/notifications');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-200/60 hover:text-brand-500 transition-colors"
        title="Thông báo"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <NotificationBadge />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-[100] animate-fade-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-heading text-sm">Thông báo</h3>
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll || !notifications.some((n) => !n.isRead)}
              className="text-xs text-brand-500 hover:text-brand-700 font-medium disabled:text-meta disabled:cursor-default transition-colors"
            >
              {markingAll ? 'Đang xử lý...' : 'Đánh dấu đã đọc'}
            </button>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-meta text-sm">Đang tải...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <span className="text-3xl">🔔</span>
                <p className="text-sm text-meta mt-2">Không có thông báo nào</p>
              </div>
            ) : (
              notifications.map((n) => {
                const config = TYPE_CONFIG[n.type] || { icon: '🔔', color: 'text-gray-500 bg-gray-50' };
                return (
                  <button
                    key={n._id}
                    onClick={() => handleNotificationClick(n)}
                    className={`w-full flex gap-3 px-4 py-3 hover:bg-bgLight transition-colors text-left border-b border-gray-50 last:border-0 ${
                      !n.isRead ? 'bg-brand-50/40' : ''
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-base ${config.color}`}>
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm leading-snug ${!n.isRead ? 'font-semibold text-heading' : 'text-body'}`}>
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-1"></span>
                        )}
                      </div>
                      <p className="text-xs text-meta mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[11px] text-meta mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-gray-100 bg-bgLight text-center">
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs text-brand-500 hover:text-brand-700 font-medium"
            >
              Xem tất cả thông báo →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// Separate small component so it can use context
function NotificationBadge() {
  const { unreadCount } = useSocket();
  if (unreadCount <= 0) return null;
  return (
    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm">
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
}
