import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../api';
import AdminLayout from '../../components/AdminLayout';
import { useSocket } from '../../contexts/SocketContext';

export default function OTPManagement() {
  const { socket } = useSocket();
  const [otps, setOtps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [emailFilter, setEmailFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchOTPs = useCallback(async () => {
    try {
      if (otps.length === 0) setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        email: emailFilter || undefined,
        type: typeFilter || undefined,
      };
      const { data } = await adminAPI.getOTPs(params);
      setOtps(data.otps);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to fetch OTPs', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, emailFilter, typeFilter, otps.length]);

  useEffect(() => {
    fetchOTPs();
  }, [fetchOTPs]);

  useEffect(() => {
    if (!socket) return;
    
    // Khi có sự kiện new_otp từ server, ta tìm nạp lại danh sách
    const handleNewOTP = () => {
      fetchOTPs();
    };

    socket.on('new_otp', handleNewOTP);
    return () => {
      socket.off('new_otp', handleNewOTP);
    };
  }, [socket, fetchOTPs]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOTPs();
  };

  return (
    <AdminLayout currentPage="Mã OTP">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-heading">Quản lý Mã OTP</h1>
      </div>

      <div className="card p-4 sm:p-6 shadow-sm border border-line mb-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm theo email..."
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              className="input-field w-full"
            />
          </div>
          <div className="w-full sm:w-48 border border-line rounded-lg overflow-hidden bg-white">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full h-full px-4 py-2.5 outline-none bg-transparent"
            >
              <option value="">Tất cả loại OTP</option>
              <option value="verifyEmail">Xác thực Email</option>
              <option value="resetPassword">Đặt lại Mật khẩu</option>
            </select>
          </div>
          <button type="submit" className="btn-primary">
            Tìm kiếm
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-line overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-line text-meta">
              <tr>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Mã OTP</th>
                <th className="p-4 font-semibold">Loại</th>
                <th className="p-4 font-semibold">Ngày tạo</th>
                <th className="p-4 font-semibold">Hết hạn sau</th>
                <th className="p-4 font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line align-top">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-meta">
                    Đang tải...
                  </td>
                </tr>
              ) : otps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-meta">
                    Không tìm thấy dữ liệu OTP nào
                  </td>
                </tr>
              ) : (
                otps.map((otpRow) => {
                  const now = new Date();
                  const expire = new Date(otpRow.expiresAt);
                  const isExpired = now > expire;
                  let statusLabel = '';
                  let statusClass = '';
                  
                  if (otpRow.isUsed) {
                    statusLabel = 'Đã sử dụng';
                    statusClass = 'bg-blue-100 text-blue-700';
                  } else if (isExpired) {
                    statusLabel = 'Hết hạn';
                    statusClass = 'bg-red-100 text-red-700';
                  } else {
                    statusLabel = 'Chưa sử dụng';
                    statusClass = 'bg-green-100 text-green-700';
                  }

                  return (
                    <tr key={otpRow._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium">{otpRow.email}</td>
                      <td className="p-4 font-mono font-bold tracking-widest text-brand-600">{otpRow.otp}</td>
                      <td className="p-4">
                        {otpRow.type === 'verifyEmail' ? 'Xác thực Email' : 'Lấy lại MK'}
                      </td>
                      <td className="p-4">
                        {new Date(otpRow.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="p-4 text-meta">
                        {isExpired ? 'Đã hết hạn' : Math.ceil((expire - now) / 60000) + ' phút'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusClass}`}>
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-line flex justify-end">
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-line rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Trước
              </button>
              <span className="px-3 py-1.5 text-sm text-meta">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 border border-line rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
