const steps = [
  {
    number: "01",
    title: "Tell us what you need",
    description: "Start with a consultation, test, medicine refill, or plan.",
  },
  {
    number: "02",
    title: "Keep records together",
    description: "Appointments, results, and prescriptions stay in one trail.",
  },
  {
    number: "03",
    title: "Follow through clearly",
    description: "See next steps early so care never stalls between visits.",
  },
] as const;

export default function HomePath() {
  return (
    <section className="bg-zh-sand px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="font-heading text-4xl tracking-tight text-zh-teal-deep sm:text-5xl">
            A quieter way through care
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-zh-ink/70">
            Three simple moves. No dashboards before you need them.
          </p>
        </div>

        <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((step) => (
            <li key={step.number} className="space-y-3">
              <p className="font-heading text-sm tracking-[0.2em] text-zh-teal">
                {step.number}
              </p>
              <h3 className="font-heading text-2xl text-zh-ink">{step.title}</h3>
              <p className="max-w-xs text-base leading-relaxed text-zh-ink/65">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
