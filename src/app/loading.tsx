export default function Loading() {
  return <div className="site-shell py-16" aria-live="polite" aria-label="Loading content"><div className="h-4 w-28 animate-pulse rounded-full bg-surface-soft" /><div className="mt-5 h-12 max-w-xl animate-pulse rounded-2xl bg-surface-soft" /><div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-96 animate-pulse rounded-3xl border border-line bg-surface" />)}</div></div>;
}
