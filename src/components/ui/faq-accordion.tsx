import { ChevronDown, HelpCircle } from "lucide-react";
import type { ReactNode } from "react";

export type FaqItem = {
  question: string;
  answer: string | ReactNode;
};

type FaqAccordionProps = {
  faqs: FaqItem[];
  title?: string;
  description?: string;
  eyebrow?: string;
  className?: string;
  headingLevel?: "h2" | "h3";
  id?: string;
};

export function FaqAccordion({
  faqs,
  title,
  description,
  eyebrow = "Frequently Asked Questions",
  className = "",
  headingLevel = "h2",
  id = "faq",
}: FaqAccordionProps) {
  if (!faqs || faqs.length === 0) return null;

  const HeadingTag = headingLevel;

  return (
    <section className={`border-t border-line bg-surface py-12 sm:py-16 ${className}`} id={id}>
      <div className="site-shell max-w-4xl">
        {(title || eyebrow) && (
          <div className="mb-8 text-center sm:text-left">
            {eyebrow && (
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-action mb-1">
                <HelpCircle className="size-4" />
                {eyebrow}
              </span>
            )}
            {title && (
              <HeadingTag className="font-serif text-2xl sm:text-3xl font-extrabold text-content">
                {title}
              </HeadingTag>
            )}
            {description && (
              <p className="mt-1 text-xs sm:text-sm text-secondary">
                {description}
              </p>
            )}
          </div>
        )}

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group rounded-2xl border border-line bg-surface-soft p-5 transition hover:border-line-strong open:bg-surface open:shadow-xs"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-content text-sm sm:text-base marker:hidden">
                <span>{faq.question}</span>
                <span className="ml-2 flex size-6 shrink-0 items-center justify-center rounded-full bg-surface transition group-open:rotate-180 border border-line text-muted">
                  <ChevronDown className="size-4" />
                </span>
              </summary>
              <div className="mt-3.5 border-t border-line/60 pt-3.5 text-xs sm:text-sm leading-relaxed text-secondary">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
