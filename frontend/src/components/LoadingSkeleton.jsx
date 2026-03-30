export default function LoadingSkeleton({ type = 'card', count = 3 }) {
  if (type === 'card') {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card p-4">
            <div className="flex gap-3">
              <div className="skeleton w-12 h-12 rounded-lg flex-shrink-0"></div>
              <div className="flex-1">
                <div className="skeleton h-4 w-4/5 mb-2"></div>
                <div className="skeleton h-3.5 w-3/5 mb-3"></div>
                <div className="flex gap-2">
                  <div className="skeleton h-5 w-16 rounded"></div>
                  <div className="skeleton h-5 w-14 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'stats') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5">
            <div className="skeleton h-4 w-20 mb-3"></div>
            <div className="skeleton h-8 w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'detail') {
    return (
      <div className="card p-6">
        <div className="flex gap-4 mb-6">
          <div className="skeleton w-14 h-14 rounded-lg"></div>
          <div className="flex-1">
            <div className="skeleton h-6 w-3/5 mb-2"></div>
            <div className="skeleton h-4 w-2/5"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-11 rounded-lg"></div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="skeleton h-4 w-full"></div>
          <div className="skeleton h-4 w-5/6"></div>
          <div className="skeleton h-4 w-4/6"></div>
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card p-4">
            <div className="flex gap-3">
              <div className="skeleton w-10 h-10 rounded-lg"></div>
              <div className="flex-1">
                <div className="skeleton h-4 w-3/5 mb-2"></div>
                <div className="skeleton h-3.5 w-2/5"></div>
              </div>
              <div className="skeleton h-6 w-16 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
