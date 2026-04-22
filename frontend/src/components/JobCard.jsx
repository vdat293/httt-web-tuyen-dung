import { Link } from 'react-router-dom';
import SaveJobButton from './SaveJobButton';

const JOB_TYPE_LABELS = {
  'full-time': 'Toàn thời gian',
  'part-time': 'Bán thời gian',
  'contract': 'Hợp đồng',
  'internship': 'Thực tập',
  'remote': 'Từ xa',
};

const EXPERIENCE_LABELS = {
  intern: 'Intern',
  fresher: 'Fresher',
  junior: 'Junior',
  senior: 'Senior',
  manager: 'Manager',
};

function formatSalary(salary) {
  if (!salary) return 'Thỏa thuận';
  if (typeof salary === 'string') return salary;
  if (salary.min === 0 && salary.max === 0) return 'Thỏa thuận';
  const fmt = (n) => (n >= 1000000 ? `${(n / 1000000).toFixed(0)}M` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : n);
  if (salary.max > 0) return `${fmt(salary.min)} - ${fmt(salary.max)}`;
  return `Từ ${fmt(salary.min)}`;
}

export default function JobCard({ job }) {
  const employer = job.employerId;

  return (
    <Link
      to={`/jobs/${job._id}`}
      className="card p-4 block group transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 relative"
    >
      {/* Save button — positioned top-right of card */}
      <div className="absolute top-3 right-3 z-10">
        <SaveJobButton jobId={job._id} />
      </div>

      <div className="flex gap-3">
        {/* Company Logo */}
        <div className="w-12 h-12 rounded-lg border border-line bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
          {employer?.companyLogo ? (
            <img
              src={employer.companyLogo}
              alt={employer?.name || 'Company Logo'}
              className="w-full h-full object-contain p-1"
            />
          ) : (
            <span className="text-brand-500 font-bold text-sm">
              {employer?.name?.charAt(0)?.toUpperCase() || 'C'}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-heading group-hover:text-brand-500 transition-colors line-clamp-2 leading-snug">
            {job.title}
          </h3>
          <p className="text-xs text-meta mt-0.5 truncate">{employer?.name}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <span className="tag tag-green">{formatSalary(job.salary)}</span>
        <span className="tag tag-gray">{job.location}</span>
        {job.jobType && (
          <span className="tag tag-blue">{JOB_TYPE_LABELS[job.jobType] || job.jobType}</span>
        )}
      </div>

      {job.skills && job.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {job.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="text-xs text-meta bg-bgSection px-2 py-0.5 rounded"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 3 && (
            <span className="text-xs text-meta">+{job.skills.length - 3}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-line">
        <div className="flex items-center gap-3">
          {job.experience && (
            <span className="text-xs text-meta flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              {EXPERIENCE_LABELS[job.experience] || job.experience}
            </span>
          )}
          {job.deadline ? (
            <span className="text-xs text-meta flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Hạn: {new Date(job.deadline).toLocaleDateString('vi-VN')}
            </span>
          ) : (
            <span className="text-xs text-brand-600 font-medium flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Không thời hạn
            </span>
          )}
        </div>
        {job.views != null && (
          <span className="text-xs text-meta ml-auto flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {job.views}
          </span>
        )}
      </div>
    </Link>
  );
}
