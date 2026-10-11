export function PolicyContent({ sections }: { sections: [string, string][] }) {
  return (
    <section className="bg-surface py-14 sm:py-18">
      <div className="site-shell max-w-3xl">
        <div className="mb-8 rounded-2xl border border-line bg-surface-soft p-4 text-sm leading-6 text-warning">
          <strong>Pre-launch notice:</strong> This policy reflects the current
          application design. It must be reviewed against final operations and
          applicable requirements before the store goes live.
        </div>
        <div className="space-y-9">
          {sections.map(([title, body]) => (
            <section key={title}>
              <h2 className="text-xl font-extrabold text-content">{title}</h2>
              <p className="mt-3 text-[15px] leading-7 text-secondary">{body}</p>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
