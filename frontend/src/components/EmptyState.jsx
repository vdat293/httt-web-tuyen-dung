export default function EmptyState({ icon, title, description, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4 text-3xl">
        {icon || '📋'}
      </div>
      <h3 className="text-lg font-semibold text-heading mb-1">{title || 'Không có dữ liệu'}</h3>
      <p className="text-sm text-meta text-center max-w-sm mb-5">{description || 'Chưa có nội dung nào để hiển thị.'}</p>
      {action && (
        <button onClick={action} className="btn-primary text-sm">
          {actionLabel || 'Bắt đầu'}
        </button>
      )}
    </div>
  );
}
