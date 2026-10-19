import { Truck, Package, MessageCircle, ShieldCheck } from "lucide-react";

export function PerksStrip() {
  const perks = [
    {
      icon: Truck,
      title: "Fast Lahore Dispatch",
      subtitle: "Same-day delivery across Lahore",
      color: "text-emerald-700 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      badge: "Fast Delivery",
    },
    {
      icon: Package,
      title: "Direct Carton Rates",
      subtitle: "Wholesale prices with clear MOQs",
      color: "text-accent dark:text-emerald-400",
      bg: "bg-surface-soft dark:bg-surface-soft",
      badge: "Mill Rates",
    },
    {
      icon: MessageCircle,
      title: "Instant WhatsApp Desk",
      subtitle: "Direct support & bulk quotations",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      isLive: true,
      badge: "Online Now",
    },
    {
      icon: ShieldCheck,
      title: "100% Genuine Brands",
      subtitle: "Original sealed factory cartons",
      color: "text-amber-700 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      badge: "Verified",
    },
  ];

  return (
    <section className="border-b border-line/60 bg-surface/70 py-4 backdrop-blur-sm sm:py-6">
      <div className="site-shell">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-4">
          {perks.map((perk, idx) => {
            const Icon = perk.icon;
            return (
              <div
                key={perk.title}
                className={`shine-card group relative flex flex-col justify-between rounded-2xl border border-line/80 bg-surface p-3.5 shadow-2xs transition-all duration-300 hover:border-action/60 hover:shadow-md hover:-translate-y-1 animate-page-enter stagger-${idx + 1}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className={`grid size-9 sm:size-10 shrink-0 place-items-center rounded-xl ${perk.bg} ${perk.color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <Icon className="size-4 sm:size-5" />
                  </div>
                  {perk.isLive ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/80 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                      <span className="beacon-dot size-1.5" />
                      <span>{perk.badge}</span>
                    </span>
                  ) : (
                    <span className="rounded-full bg-surface-soft px-2 py-0.5 text-[10px] font-semibold text-muted">
                      {perk.badge}
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <h3 className="text-xs sm:text-sm font-extrabold text-content transition-colors group-hover:text-action line-clamp-1">
                    {perk.title}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-muted line-clamp-1">
                    {perk.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
