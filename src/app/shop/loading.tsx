export default function ShopLoading() {
  return (
    <div className="animate-pulse bg-surface-soft" aria-label="Loading products" role="status">
      <div className="h-64 border-b border-line bg-surface-soft" />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[270px_minmax(0,1fr)] lg:px-8">
        <div className="hidden h-[500px] rounded-2xl bg-surface-soft lg:block" />
        <div>
          <div className="mb-6 h-16 rounded-2xl bg-surface-soft" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="h-[460px] rounded-3xl bg-surface-soft" />
            ))}
          </div>
        </div>
      </div>
      <span className="sr-only">Loading product catalog</span>
    </div>
  );
}
