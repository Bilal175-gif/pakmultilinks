import Link from "next/link";

export function PageHero({ eyebrow, title, description, breadcrumb }: { eyebrow: string; title: string; description: string; breadcrumb?: string }) {
  return <section className="page-hero border-b border-line bg-canvas py-12 sm:py-16"><div className="site-shell"><nav className="mb-7 flex items-center gap-2 text-xs font-semibold text-muted" aria-label="Breadcrumb"><Link href="/" className="hover:text-accent hover:underline">Home</Link><span aria-hidden="true">/</span><span aria-current="page">{breadcrumb ?? title}</span></nav><p className="eyebrow">{eyebrow}</p><h1 className="balance mt-4 max-w-4xl font-serif text-3xl font-normal tracking-tight text-content sm:text-5xl">{title}</h1><p className="pretty mt-5 max-w-2xl text-sm leading-7 text-accent sm:text-base">{description}</p></div></section>;
}
