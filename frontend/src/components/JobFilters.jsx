import { useState } from 'react';

const JOB_TYPES = [
  { value: '', label: 'Tất cả loại công việc' },
  { value: 'full-time', label: 'Toàn thời gian' },
  { value: 'part-time', label: 'Bán thời gian' },
  { value: 'contract', label: 'Hợp đồng' },
  { value: 'internship', label: 'Thực tập' },
  { value: 'remote', label: 'Từ xa' },
];

const EXPERIENCE_LEVELS = [
  { value: '', label: 'Tất cả cấp bậc' },
  { value: 'intern', label: 'Intern' },
  { value: 'fresher', label: 'Fresher' },
  { value: 'junior', label: 'Junior' },
  { value: 'senior', label: 'Senior' },
  { value: 'manager', label: 'Manager' },
];

const SALARY_RANGES = [
  { value: '', label: 'Tất cả mức lương' },
  { value: '0,5000000', label: 'Dưới 5 triệu' },
  { value: '5000000,10000000', label: '5 - 10 triệu' },
  { value: '10000000,20000000', label: '10 - 20 triệu' },
  { value: '20000000,35000000', label: '20 - 35 triệu' },
  { value: '35000000,999999999', label: 'Trên 35 triệu' },
];

const SORT_OPTIONS = [
  { value: 'createdAt,desc', label: 'Mới nhất' },
  { value: 'createdAt,asc', label: 'Cũ nhất' },
  { value: 'salary.min,desc', label: 'Lương cao → thấp' },
  { value: 'salary.min,asc', label: 'Lương thấp → cao' },
  { value: 'views,desc', label: 'Lượt xem nhiều' },
];

export default function JobFilters({ filters, onChange, onSort }) {
  const [localSalaryRange, setLocalSalaryRange] = useState('');

  const handleSalaryChange = (val) => {
    setLocalSalaryRange(val);
    if (!val) {
      onChange({ ...filters, salaryMin: '', salaryMax: '' });
    } else {
      const [min, max] = val.split(',');
      onChange({ ...filters, salaryMin: min, salaryMax: max });
    }
  };

  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const handleReset = () => {
    onChange({ q: filters.q || '', location: '', jobType: '', experience: '', salaryMin: '', salaryMax: '', skills: '' });
    setLocalSalaryRange('');
  };

  return (
    <aside className="w-full space-y-6">

      {/* Location */}
      <div className="card p-4">
        <label className="block text-xs font-semibold text-heading uppercase tracking-wide mb-2">
          Địa điểm
        </label>
        <input
          type="text"
          value={filters.location || ''}
          onChange={(e) => handleChange('location', e.target.value)}
          placeholder="VD: Hồ Chí Minh, Hà Nội..."
          className="input-field !text-sm !py-2"
        />
      </div>

      {/* Job Type */}
      <div className="card p-4">
        <label className="block text-xs font-semibold text-heading uppercase tracking-wide mb-2">
          Loại công việc
        </label>
        <div className="space-y-1.5">
          {JOB_TYPES.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="jobType"
                value={opt.value}
                checked={filters.jobType === opt.value}
                onChange={() => handleChange('jobType', opt.value)}
                className="accent-brand-500 w-3.5 h-3.5"
              />
              <span className="text-sm text-meta group-hover:text-heading transition-colors">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="card p-4">
        <label className="block text-xs font-semibold text-heading uppercase tracking-wide mb-2">
          Cấp bậc
        </label>
        <div className="space-y-1.5">
          {EXPERIENCE_LEVELS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="experience"
                value={opt.value}
                checked={filters.experience === opt.value}
                onChange={() => handleChange('experience', opt.value)}
                className="accent-brand-500 w-3.5 h-3.5"
              />
              <span className="text-sm text-meta group-hover:text-heading transition-colors">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Salary Range */}
      <div className="card p-4">
        <label className="block text-xs font-semibold text-heading uppercase tracking-wide mb-2">
          Mức lương
        </label>
        <select
          value={localSalaryRange}
          onChange={(e) => handleSalaryChange(e.target.value)}
          className="input-field !text-sm !py-2"
        >
          {SALARY_RANGES.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Sort */}
      <div className="card p-4">
        <label className="block text-xs font-semibold text-heading uppercase tracking-wide mb-2">
          Sắp xếp
        </label>
        <select
          value={`${filters.sort || 'createdAt'},${filters.order || 'desc'}`}
          onChange={(e) => {
            const [sort, order] = e.target.value.split(',');
            onSort({ sort, order });
          }}
          className="input-field !text-sm !py-2"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Reset */}
      <button
        onClick={handleReset}
        className="btn-ghost w-full justify-center text-sm"
      >
        Đặt lại bộ lọc
      </button>
    </aside>
  );
}
