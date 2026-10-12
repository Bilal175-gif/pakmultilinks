export default function AdminLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-48 rounded bg-surface-soft mb-2" />
      <div className="h-4 w-96 rounded bg-surface-soft mb-8" />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 mb-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-line bg-surface p-4 sm:p-5">
            <div className="h-4 w-24 rounded bg-surface-soft" />
            <div className="mt-4 h-8 w-16 rounded bg-surface-soft" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-line bg-surface p-5">
        <div className="h-4 w-32 rounded bg-surface-soft mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded bg-surface-soft mb-2" />
        ))}
      </div>
    </div>
  );
}
