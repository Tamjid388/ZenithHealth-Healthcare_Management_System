import Link from "next/link";
import {
  Activity,
  Building2,
  ClipboardPlus,
  HeartPulse,
  Pill,
  type LucideIcon,
} from "lucide-react";

type Service = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

const services: Service[] = [
  {
    href: "/consultation",
    title: "Consultation",
    description: "Find doctors and schedule visits with clear availability.",
    icon: HeartPulse,
  },
  {
    href: "/medicines",
    title: "Medicines",
    description: "Review prescriptions and keep treatment details close.",
    icon: Pill,
  },
  {
    href: "/diagnostics",
    title: "Diagnostics",
    description: "Track tests and results without hunting through files.",
    icon: Activity,
  },
  {
    href: "/health-plans",
    title: "Health Plans",
    description: "Choose coverage options that match your care needs.",
    icon: ClipboardPlus,
  },
  {
    href: "/ngos",
    title: "NGOs",
    description: "Discover community partners supporting accessible care.",
    icon: Building2,
  },
];

export default function HomeServices() {
  return (
    <section className="bg-zh-mist px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="font-heading text-4xl tracking-tight text-zh-teal-deep sm:text-5xl">
            Everything in one care path
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-zh-ink/70">
            Move between appointments, medicines, diagnostics, and support
            without losing context.
          </p>
        </div>

        <ul className="mt-12 divide-y divide-zh-teal-deep/10 border-y border-zh-teal-deep/10">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <li key={service.href}>
                <Link
                  href={service.href}
                  className="group grid gap-3 py-6 transition-colors hover:bg-zh-foam/50 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-8 sm:px-2"
                >
                  <span className="inline-flex size-11 items-center justify-center rounded-full bg-zh-foam text-zh-teal transition-transform duration-300 group-hover:scale-105">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>

                  <span>
                    <span className="block font-heading text-2xl text-zh-ink transition-colors group-hover:text-zh-teal">
                      {service.title}
                    </span>
                    <span className="mt-1 block max-w-xl text-sm leading-relaxed text-zh-ink/65 sm:text-base">
                      {service.description}
                    </span>
                  </span>

                  <span className="text-sm font-medium text-zh-teal transition-transform duration-300 group-hover:translate-x-1">
                    Explore →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
