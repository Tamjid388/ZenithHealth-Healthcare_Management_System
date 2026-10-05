import Link from "next/link";

import { ctaContent } from "@/components/features/home/homeContent";
import HomeSection from "@/components/features/home/HomeSection";
import { Button } from "@/components/ui/button";

export default function HomeCta() {
  return (
    <HomeSection
      aria-labelledby="home-cta-heading"
      className="bg-white pb-20"
      innerClassName="overflow-hidden rounded-2xl ring-1 ring-zh-blue-deep/10"
    >
      <div className="flex flex-col-reverse lg:grid lg:grid-cols-2">
        <div className="bg-zh-mist px-6 py-10 sm:px-10 sm:py-12 lg:px-12">
          <h2
            id="home-hours-heading"
            className="font-heading text-2xl tracking-tight text-zh-blue-deep sm:text-3xl"
          >
            {ctaContent.hoursTitle}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-zh-ink/70 sm:text-base">
            {ctaContent.hoursBody}
          </p>
          <dl className="mt-8 space-y-4">
            {ctaContent.hours.map((row) => (
              <div
                key={row.label}
                className="flex flex-col gap-1 border-b border-zh-blue-deep/10 pb-4 last:border-b-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
              >
                <dt className="text-sm font-medium text-zh-ink">{row.label}</dt>
                <dd className="text-sm text-zh-ink/65 sm:text-right">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="bg-zh-blue-deep px-6 py-10 text-white sm:px-10 sm:py-12 lg:px-12">
          <p className="text-sm font-medium tracking-[0.18em] text-zh-foam/80 uppercase">
            {ctaContent.panelEyebrow}
          </p>
          <h2
            id="home-cta-heading"
            className="mt-3 font-heading text-3xl tracking-tight sm:text-4xl"
          >
            {ctaContent.panelTitle}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-zh-foam/85 sm:text-base">
            {ctaContent.panelBody}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href={ctaContent.primary.href} className="w-full sm:w-auto">
              <Button
                size="lg"
                className="h-11 w-full rounded-xl bg-white px-5 text-zh-blue-deep hover:bg-zh-foam sm:w-auto"
              >
                {ctaContent.primary.label}
              </Button>
            </Link>
            <Link href={ctaContent.secondary.href} className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="h-11 w-full rounded-xl border-white/35 bg-transparent px-5 text-white hover:bg-white/10 hover:text-white sm:w-auto"
              >
                {ctaContent.secondary.label}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </HomeSection>
  );
}
