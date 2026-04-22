import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jobsAPI } from '../../api';
import { useToast } from '../../components/Toast';
import Layout from '../../components/Layout';

const JOB_CATEGORIES = [
  'Kinh doanh/Bán hàng', 'Marketing/PR/Quảng cáo', 'Chăm sóc khách hàng',
  'Nhân sự/Hành chính', 'Công nghệ Thông tin', 'Tài chính/Ngân hàng',
  'Kế toán/Kiểm toán', 'Xây dựng', 'Sản xuất', 'Giáo dục/Đào tạo',
  'Thiết kế', 'Nhà hàng/Khách sạn', 'Logistics/Chuỗi cung ứng',
  'Y tế/Dược', 'Luật/Pháp chế', 'Khác'
];

const EXPERIENCE_LEVELS = [
  { label: 'Chưa có kinh nghiệm', value: 'intern' },
  { label: 'Dưới 1 năm', value: 'fresher' },
  { label: '1 - 3 năm', value: 'junior' },
  { label: '3 - 5 năm', value: 'senior' },
  { label: 'Trên 5 năm', value: 'manager' },
];

const JOB_TYPES = [
  { label: 'Toàn thời gian', value: 'full-time' },
  { label: 'Bán thời gian', value: 'part-time' },
  { label: 'Hợp đồng', value: 'contract' },
  { label: 'Thực tập', value: 'internship' },
  { label: 'Từ xa', value: 'remote' },
];

export default function PostJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [form, setForm] = useState({
    title: '',
    category: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    jobType: 'full-time',
    experience: 'fresher',
    description: '',
    requirements: '',
    benefits: '',
    skills: '',
    deadline: '',
  });

  useEffect(() => {
    if (id) {
      fetchJobDetails();
    }
  }, [id]);

  const fetchJobDetails = async () => {
    setFetching(true);
    try {
      const { data } = await jobsAPI.getById(id);
      setForm({
        title: data.title,
        category: data.category || '',
        location: data.location,
        salaryMin: data.salary?.min || '',
        salaryMax: data.salary?.max || '',
        jobType: data.jobType,
        experience: data.experience,
        description: data.description,
        requirements: data.requirements,
        benefits: data.benefits || '',
        skills: data.skills?.join(', ') || '',
        deadline: data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : '',
      });
    } catch (err) {
      addToast('Không thể tải thông tin tin đăng', 'error');
      navigate('/employer/jobs');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...form,
        salary: {
          min: Number(form.salaryMin),
          max: Number(form.salaryMax),
        },
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        deadline: form.deadline || undefined,
      };
      
      delete payload.salaryMin;
      delete payload.salaryMax;

      if (id) {
        await jobsAPI.update(id, payload);
        addToast('Cập nhật tin tuyển dụng thành công');
      } else {
        await jobsAPI.create(payload);
        addToast('Đăng tin tuyển dụng thành công');
      }
      navigate('/employer/jobs');
    } catch (err) {
      addToast(err.response?.data?.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto pb-12">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate('/employer/jobs')}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-heading">
              {id ? 'Chỉnh sửa tin tuyển dụng' : 'Đăng tin tuyển dụng mới'}
            </h1>
            <p className="text-meta text-sm mt-1">Cung cấp thông tin chi tiết để thu hút ứng viên phù hợp nhất.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Thông tin cơ bản */}
          <div className="bg-white rounded-xl shadow-sm border border-line p-6">
            <h2 className="text-lg font-semibold text-heading mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-brand-500 rounded-full"></span>
              Thông tin cơ bản
            </h2>
            
            <div className="grid gap-6">
              <div className="form-group">
                <label className="label">Tiêu đề tin tuyển dụng *</label>
                <input 
                  type="text" 
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  className="input-field"
                  placeholder="Ví dụ: Nhân viên Marketing, Lập trình viên ReactJS..."
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="label">Ngành nghề *</label>
                  <select 
                    value={form.category}
                    onChange={e => setForm({...form, category: e.target.value})}
                    className="input-field"
                    required
                  >
                    <option value="">Chọn ngành nghề</option>
                    {JOB_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Địa điểm làm việc *</label>
                  <input 
                    type="text" 
                    value={form.location}
                    onChange={e => setForm({...form, location: e.target.value})}
                    className="input-field"
                    placeholder="Ví dụ: Hà Nội, TP. HCM..."
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="label">Mức lương (VNĐ)</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={form.salaryMin}
                      onChange={e => setForm({...form, salaryMin: e.target.value})}
                      className="input-field"
                      placeholder="Tối thiểu"
                    />
                    <span className="text-meta">−</span>
                    <input 
                      type="number" 
                      value={form.salaryMax}
                      onChange={e => setForm({...form, salaryMax: e.target.value})}
                      className="input-field"
                      placeholder="Tối đa"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">Hạn nộp hồ sơ</label>
                  <input 
                    type="date" 
                    value={form.deadline}
                    onChange={e => setForm({...form, deadline: e.target.value})}
                    className="input-field"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="label">Hình thức làm việc</label>
                  <select 
                    value={form.jobType}
                    onChange={e => setForm({...form, jobType: e.target.value})}
                    className="input-field"
                  >
                    {JOB_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Kinh nghiệm yêu cầu</label>
                  <select 
                    value={form.experience}
                    onChange={e => setForm({...form, experience: e.target.value})}
                    className="input-field"
                  >
                    {EXPERIENCE_LEVELS.map(exp => (
                      <option key={exp.value} value={exp.value}>{exp.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Chi tiết công việc */}
          <div className="bg-white rounded-xl shadow-sm border border-line p-6">
            <h2 className="text-lg font-semibold text-heading mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-brand-500 rounded-full"></span>
              Chi tiết công việc
            </h2>

            <div className="space-y-6">
              <div className="form-group">
                <label className="label">Mô tả công việc *</label>
                <textarea 
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="input-field h-40 resize-none"
                  placeholder="Mô tả các nhiệm vụ, trách nhiệm chính của vị trí này..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">Yêu cầu ứng viên *</label>
                <textarea 
                  value={form.requirements}
                  onChange={e => setForm({...form, requirements: e.target.value})}
                  className="input-field h-40 resize-none"
                  placeholder="Yêu cầu về kỹ năng, bằng cấp, thái độ..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">Quyền lợi</label>
                <textarea 
                  value={form.benefits}
                  onChange={e => setForm({...form, benefits: e.target.value})}
                  className="input-field h-40 resize-none"
                  placeholder="Chế độ lương thưởng, bảo hiểm, môi trường làm việc..."
                />
              </div>

              <div className="form-group">
                <label className="label">Kỹ năng (cách nhau bởi dấu phẩy)</label>
                <input 
                  type="text" 
                  value={form.skills}
                  onChange={e => setForm({...form, skills: e.target.value})}
                  className="input-field"
                  placeholder="Ví dụ: ReactJS, Teamwork, English..."
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4">
            <button 
              type="button" 
              onClick={() => navigate('/employer/jobs')}
              className="btn-ghost !px-8 border border-line"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary !px-12 shadow-lg shadow-brand-200"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang xử lý...
                </div>
              ) : (id ? 'Lưu thay đổi' : 'Đăng tin')}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
