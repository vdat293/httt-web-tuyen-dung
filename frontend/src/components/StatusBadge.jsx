const BADGE_MAP = {
  pending: { label: 'Chờ duyệt', cls: 'tag-yellow' },
  reviewed: { label: 'Đã xem', cls: 'tag-blue' },
  interview: { label: 'Phỏng vấn', cls: 'tag-purple' },
  accepted: { label: 'Nhận việc', cls: 'tag-green' },
  rejected: { label: 'Từ chối', cls: 'tag-red' },
  scheduled: { label: 'Đã lên lịch', cls: 'tag-blue' },
  completed: { label: 'Hoàn thành', cls: 'tag-green' },
  cancelled: { label: 'Đã hủy', cls: 'tag-red' },
  passed: { label: 'Đạt', cls: 'tag-green' },
  failed: { label: 'Không đạt', cls: 'tag-red' },
  open: { label: 'Đang tuyển', cls: 'tag-green' },
  closed: { label: 'Đã đóng', cls: 'tag-gray' },
};

export default function StatusBadge({ status, label }) {
  const info = BADGE_MAP[status] || { label: status, cls: 'tag-gray' };
  return (
    <span className={`tag ${info.cls}`}>
      {label || info.label}
    </span>
  );
}
