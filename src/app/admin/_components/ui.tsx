import { DatabaseZap } from "lucide-react";

export function PageHeading({ title, description, action }: { eyebrow?: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="min-w-0"><h1 className="text-xl font-semibold tracking-tight text-content sm:text-2xl">{title}</h1><p className="mt-2 max-w-2xl text-[13px] leading-6 text-muted">{description}</p></div>
      {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
    </div>
  );
}

export function DemoNotice({ localRecords = false }: { localRecords?: boolean }) {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-warning-line bg-warning-soft p-4 text-sm leading-6 text-warning">
      <DatabaseZap className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <p><strong>Development preview — database not connected.</strong> Changes are disabled. {localRecords ? "Records shown below are browser-local development records from this browser only; they are not shared, server-backed orders." : "The information shown is read-only seed data and will be replaced after PostgreSQL is configured."}</p>
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return <div className="rounded-xl border border-dashed border-line-strong bg-surface px-5 py-14 text-center"><p className="font-bold text-content">{title}</p><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{body}</p></div>;
}

export const panelClass = "rounded-xl border border-line bg-surface shadow-[0_1px_2px_#0000000a]";
export const inputClass = "mt-1.5 h-10 w-full rounded-md border border-line-strong bg-surface px-3 text-sm outline-none transition focus:border-line-strong focus:ring-2 focus:ring-focus disabled:bg-surface-soft disabled:text-muted";
export const textareaClass = "mt-1.5 min-h-28 w-full rounded-md border border-line-strong bg-surface px-3 py-2.5 text-sm outline-none transition focus:border-line-strong focus:ring-2 focus:ring-focus disabled:bg-surface-soft disabled:text-muted";
export const buttonClass = "inline-flex min-h-11 items-center justify-center gap-2 border border-action bg-action px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-50";
