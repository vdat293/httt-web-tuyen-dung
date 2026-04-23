import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { notificationsAPI } from '../api';
import { useToast } from '../components/Toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Luôn cho phép kết nối Socket ngay cả khi là khách để nhận thông báo công cộng (ví dụ: bài đăng bị khóa)
    const token = localStorage.getItem('accessToken');
    const socketInstance = io(import.meta.env.VITE_API_URL || '', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('🔌 [Socket] Connected as', user ? `user ${user._id}` : 'guest');
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 [Socket] Disconnected');
    });

    // Các sự kiện chỉ dành cho người dùng đã đăng nhập
    if (user) {
      // Lấy số thông báo chưa đọc ban đầu
      notificationsAPI.getUnreadCount()
        .then(({ data }) => setUnreadCount(data.count || 0))
        .catch(() => {});

      socketInstance.on('new_notification', (notification) => {
        console.log('🔔 [Socket] New notification:', notification);
        setUnreadCount((prev) => prev + 1);
        addToast(notification.title, 'info');
      });
    }

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  const incrementUnread = () => setUnreadCount((prev) => prev + 1);
  const setUnread = (count) => setUnreadCount(count);
  const decrementUnread = () => setUnreadCount((prev) => Math.max(0, prev - 1));

  return (
    <SocketContext.Provider value={{ socket, unreadCount, incrementUnread, setUnread, decrementUnread }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};
