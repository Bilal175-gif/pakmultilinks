import type { ReactNode } from "react";

export function CommerceShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="commerce-page min-h-[65vh] bg-canvas py-10 sm:py-14">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 max-w-3xl">
          {eyebrow ? (
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-accent">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="font-serif text-3xl font-normal tracking-tight text-content sm:text-4xl">{title}</h1>
          {description ? <p className="mt-3 text-base leading-7 text-secondary">{description}</p> : null}
        </header>
        {children}
      </div>
    </div>
  );
}
