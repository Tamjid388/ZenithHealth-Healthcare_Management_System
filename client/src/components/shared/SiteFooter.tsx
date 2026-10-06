import Link from "next/link";

import Container from "@/components/layout/Container";
import SiteLogo from "@/components/shared/SiteLogo";

const footerLinks = [
  { href: "/consultation", label: "Consultation" },
  { href: "/medicines", label: "Medicines" },
  { href: "/diagnostics", label: "Diagnostics" },
  { href: "/health-plans", label: "Health Plans" },
  { href: "/ngos", label: "NGOs" },
] as const;

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-zh-blue-deep text-zh-foam">
      <Container width="wide">
        <div className="grid gap-10 py-[clamp(2.5rem,5vw,3.5rem)] md:grid-cols-12 md:items-start">
          <div className="max-w-sm space-y-4 md:col-span-5">
            <SiteLogo inverted />
            <p className="max-w-[42ch] text-[0.9375rem] leading-relaxed text-zh-foam/75">
              Care coordination built for clearer appointments, records, and
              follow-through — one calm trail from visit to next step.
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-6 gap-y-3 text-[0.9375rem] sm:grid-cols-3 md:col-span-7 md:justify-items-end"
          >
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="w-fit rounded-md text-zh-foam/75 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 py-6 text-[0.8125rem] text-zh-foam/60 sm:flex-row sm:items-center sm:justify-between">
          <p>Zenith Health — care that stays organized.</p>
          <p>Your records stay available whenever you need them.</p>
        </div>
      </Container>
    </footer>
  );
}
