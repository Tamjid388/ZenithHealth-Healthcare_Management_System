import Link from "next/link";

const footerLinks = [
  { href: "/consultation", label: "Consultation" },
  { href: "/medicines", label: "Medicines" },
  { href: "/diagnostics", label: "Diagnostics" },
  { href: "/health-plans", label: "Health Plans" },
  { href: "/ngos", label: "NGOs" },
] as const;

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-zh-teal-deep/10 bg-zh-teal-deep text-zh-foam">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-sm space-y-3">
          <p className="font-heading text-2xl tracking-tight text-white">
            Zenith Health
          </p>
          <p className="text-sm leading-relaxed text-zh-foam/80">
            Care coordination built for clearer appointments, records, and
            follow-through.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-zh-foam/80 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
