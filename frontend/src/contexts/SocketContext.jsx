import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setUnreadCount(0);
      }
      return;
    }

    const token = localStorage.getItem('token');
    const socketInstance = io(import.meta.env.VITE_API_URL || '', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('🔌 [Socket] Connected');
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 [Socket] Disconnected');
    });

    socketInstance.on('new_notification', (notification) => {
      console.log('🔔 [Socket] New notification:', notification);
      setUnreadCount((prev) => prev + 1);
    });

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
