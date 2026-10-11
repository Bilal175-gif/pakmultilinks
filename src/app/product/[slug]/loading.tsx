export default function ProductLoading() {
  return (
    <div className="animate-pulse bg-surface-soft px-4 py-10" role="status" aria-label="Loading product">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 h-5 w-72 rounded bg-surface-soft" />
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-square rounded-3xl bg-surface-soft" />
          <div className="py-4">
            <div className="h-7 w-32 rounded-full bg-surface-soft" />
            <div className="mt-5 h-12 w-4/5 rounded bg-surface-soft" />
            <div className="mt-4 h-6 w-full rounded bg-surface-soft" />
            <div className="mt-10 h-72 rounded-3xl bg-surface-soft" />
          </div>
        </div>
      </div>
      <span className="sr-only">Loading product details</span>
    </div>
  );
}
