import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";

import { ctaContent } from "@/components/features/home/homeContent";
import HomeSection from "@/components/features/home/HomeSection";
import Reveal from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";

export default function HomeCta() {
  return (
    <HomeSection
      aria-labelledby="home-cta-heading"
      className="bg-white pb-[clamp(3.5rem,7vw,5.5rem)]"
    >
      <Reveal>
        <div className="grid overflow-hidden rounded-3xl ring-1 ring-zh-blue-deep/10 lg:grid-cols-5">
          {/* Hours: supporting info, calm surface. Spans 2 of 5. */}
          <div className="bg-zh-mist px-[clamp(1.5rem,3vw,3rem)] py-[clamp(2rem,4vw,3rem)] lg:col-span-2">
            <p className="inline-flex items-center gap-2 text-[0.8125rem] font-semibold tracking-[0.16em] text-zh-blue uppercase">
              <Clock3 className="size-4" aria-hidden="true" />
              Availability
            </p>
            <h2 className="mt-3 font-heading text-[clamp(1.375rem,1.15rem+1.2vw,1.875rem)] leading-tight tracking-tight text-balance text-zh-blue-deep">
              {ctaContent.hoursTitle}
            </h2>
            <p className="mt-3 max-w-[48ch] text-[0.9375rem] leading-relaxed text-zh-ink/70">
              {ctaContent.hoursBody}
            </p>
            <dl className="mt-8">
              {ctaContent.hours.map((row) => (
                <div
                  key={row.label}
                  className="flex flex-col gap-1 border-b border-zh-blue-deep/10 py-4 first:pt-0 last:border-b-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                >
                  <dt className="text-sm font-semibold text-zh-ink">
                    {row.label}
                  </dt>
                  <dd className="text-sm text-zh-ink/65 sm:text-right">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Action panel: primary CTA, deep surface. Spans 3 of 5. */}
          <div className="relative bg-zh-blue-deep px-[clamp(1.5rem,3vw,3rem)] py-[clamp(2rem,4vw,3rem)] text-white lg:col-span-3">
            {/* Quiet topographic rhythm: a single hairline grid, no blobs. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:2.75rem_2.75rem] [mask-image:radial-gradient(ellipse_70%_80%_at_30%_20%,black,transparent)]"
            />
            <div className="relative">
              <p className="text-[0.8125rem] font-semibold tracking-[0.16em] text-zh-foam/80 uppercase">
                {ctaContent.panelEyebrow}
              </p>
              <h2
                id="home-cta-heading"
                className="mt-3 max-w-[22ch] font-heading text-[clamp(1.75rem,1.3rem+2.4vw,2.75rem)] leading-[1.05] tracking-tight text-balance"
              >
                {ctaContent.panelTitle}
              </h2>
              <p className="mt-4 max-w-[52ch] text-[clamp(0.9375rem,0.9rem+0.3vw,1.0625rem)] leading-relaxed text-zh-foam/85">
                {ctaContent.panelBody}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Link
                  href={ctaContent.primary.href}
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="lg"
                    className="group h-12 w-full rounded-xl bg-white px-6 text-base text-zh-blue-deep transition-all hover:bg-zh-foam active:scale-[0.98] sm:w-auto"
                  >
                    {ctaContent.primary.label}
                    <ArrowRight
                      className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Button>
                </Link>
                <Link
                  href={ctaContent.secondary.href}
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 w-full rounded-xl border-white/35 bg-transparent px-6 text-base text-white transition-colors hover:bg-white/10 hover:text-white active:scale-[0.98] sm:w-auto"
                  >
                    {ctaContent.secondary.label}
                  </Button>
                </Link>
              </div>
              <p className="mt-6 text-sm text-zh-foam/70">
                Start with a visit — keep everything else on the same trail.
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </HomeSection>
  );
}
