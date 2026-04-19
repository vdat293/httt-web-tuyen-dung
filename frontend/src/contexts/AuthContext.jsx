import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  // ─── Khởi tạo từ localStorage ─────────────────────────────────────────────
  useEffect(() => {
    const storedUser  = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');
    if (storedUser && accessToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // ─── Lắng nghe sự kiện session hết hạn ───────────────────────────────────
  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      setSessionExpired(true);
      // Chuyển hướng về trang login với thông báo
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
    };
    window.addEventListener('session-expired', handleSessionExpired);
    return () => window.removeEventListener('session-expired', handleSessionExpired);
  }, []);

  // ─── Login ───────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    setSessionExpired(false);
    return data;
  };

  // ─── Register ─────────────────────────────────────────────────────────────
  const register = async (userData) => {
    const { data } = await authAPI.register(userData);
    return data;
  };

  // ─── Verify Email & Auto Login ──────────────────────────────────────────
  const verifyEmailLogin = async (email, otp) => {
    const { data } = await authAPI.verifyEmail({ email, otp });
    if (data.accessToken && data.user) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setSessionExpired(false);
    }
    return data;
  };

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch {
      // Luôn xóa local state dù API có lỗi
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      setSessionExpired(false);
    }
  }, []);

  // ─── Cập nhật user (sau profile update) ──────────────────────────────────
  const updateUser = (updatedData) => {
    const current = JSON.parse(localStorage.getItem('user') || '{}');
    const merged = { ...current, ...updatedData };
    localStorage.setItem('user', JSON.stringify(merged));
    setUser(merged);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        sessionExpired,
        login,
        register,
        verifyEmailLogin,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
