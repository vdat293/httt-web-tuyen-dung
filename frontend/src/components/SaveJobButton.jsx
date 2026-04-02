import { useState, useEffect } from 'react';
import { savedJobsAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';

export default function SaveJobButton({ jobId, className = '' }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'candidate') return;
    const checkSaved = async () => {
      try {
        const { data } = await savedJobsAPI.isSaved(jobId);
        setSaved(data.saved);
      } catch (_) {}
    };
    checkSaved();
  }, [jobId, user]);

  const toggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      addToast('Vui lòng đăng nhập để lưu tin', 'error');
      return;
    }
    setLoading(true);
    try {
      if (saved) {
        await savedJobsAPI.unsave(jobId);
        setSaved(false);
        addToast('Đã bỏ lưu tin tuyển dụng', 'success');
      } else {
        await savedJobsAPI.save(jobId);
        setSaved(true);
        addToast('Đã lưu tin tuyển dụng', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={saved ? 'Bỏ lưu' : 'Lưu tin'}
      className={`p-2 rounded-lg transition-all duration-200 ${
        saved
          ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
          : 'text-gray-400 bg-gray-50 hover:text-yellow-500 hover:bg-yellow-50'
      } ${className}`}
    >
      <svg
        className={`w-5 h-5 transition-transform ${loading ? 'opacity-50' : ''}`}
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
    </button>
  );
}
