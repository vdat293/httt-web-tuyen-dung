export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-bgLight">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </div>
    </div>
  );
}
