import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, Factory, GraduationCap, HeartPulse, Hotel, Landmark, ShoppingBag, Utensils } from "lucide-react";
import { CommerceShell } from "@/components/commerce/commerce-shell";
import { company } from "@/lib/company";

export const metadata: Metadata = {
  title: "Corporate Hygiene Supplies in Lahore",
  description: "Request wholesale tissue, washroom and hygiene supplies by carton for offices, institutions and commercial facilities in Lahore.",
  alternates: { canonical: "/corporate-orders" },
};

const industries = [
  [Building2, "Offices"],
  [HeartPulse, "Hospitals"],
  [Utensils, "Restaurants"],
  [Hotel, "Hotels"],
  [GraduationCap, "Schools"],
  [Factory, "Factories"],
  [ShoppingBag, "Shopping centres"],
  [Landmark, "Commercial buildings"],
] as const;

export default function CorporateOrdersPage() {
  return (
    <CommerceShell title="Corporate Orders">
      <section className="overflow-hidden rounded-3xl bg-action text-white">
        <div className="grid lg:grid-cols-[1.1fr_.9fr]">
          <div className="p-7 sm:p-10 lg:p-12 flex flex-col justify-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Workplace & Bulk Supplies</h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/request-quote"
                className="commerce-button commerce-button-inverse inline-flex items-center gap-2 rounded-xl bg-surface px-5 py-3 text-sm font-bold text-accent hover:bg-accent-soft"
              >
                Request corporate quote <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <a
                href={`tel:${company.phoneHref}`}
                className="commerce-button commerce-button-outline-light rounded-xl border border-focus px-5 py-3 text-sm font-semibold text-white hover:bg-action"
              >
                Call {company.phone}
              </a>
            </div>
          </div>
          <div className="bg-action/80 p-7 sm:p-10 lg:p-12">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-200">
              Industries Served
            </h3>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {industries.map(([Icon, label]) => (
                <div key={label} className="rounded-2xl border border-focus bg-action/20 p-4">
                  <Icon aria-hidden="true" className="size-5 text-emerald-200" />
                  <span className="mt-3 block text-sm font-semibold">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        {[
          ['1', 'Tell us what you need'],
          ['2', 'Requirements review'],
          ['3', 'Receive a quotation'],
        ].map(([step, title]) => (
          <article key={step} className="rounded-3xl border border-line bg-surface p-6 shadow-sm">
            <span className="grid size-10 place-items-center rounded-xl bg-accent-soft font-bold text-accent">
              {step}
            </span>
            <h2 className="mt-5 text-lg font-bold text-content">{title}</h2>
          </article>
        ))}
      </section>
    </CommerceShell>
  );
}

export const revalidate = 3600;
