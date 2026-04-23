export default function EmptyState({ icon, title, description, onAction, actionText }) {
  const renderIcon = () => {
    if (!icon) return (
      <svg className="w-8 h-8 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    );
    return icon;
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div className="w-20 h-20 rounded-3xl bg-brand-50 flex items-center justify-center mb-6 shadow-sm">
        {renderIcon()}
      </div>
      <h3 className="text-xl font-bold text-heading mb-2">{title || 'Không có dữ liệu'}</h3>
      <p className="text-sm text-meta text-center max-w-md mb-8">{description || 'Chưa có nội dung nào để hiển thị.'}</p>
      
      {onAction && (
        <button 
          onClick={onAction} 
          className="btn-primary px-8 py-2.5 rounded-xl shadow-lg shadow-brand-200 hover:shadow-brand-300 transition-all active:scale-95"
        >
          {actionText || 'Bắt đầu ngay'}
        </button>
      )}
    </div>
  );
}
