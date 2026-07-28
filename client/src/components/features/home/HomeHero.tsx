import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function HomeHero() {
  return (
    <section className="relative isolate min-h-[calc(100svh-4rem)] overflow-hidden bg-zh-teal-deep text-white">
      <Image
        src="/images/hero-care.jpg"
        alt="Clinician reviewing care details with a patient"
        fill
        priority
        sizes="100vw"
        className="home-hero-kenburns object-cover object-center"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-r from-zh-teal-deep via-zh-teal-deep/80 to-zh-teal-deep/25"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-zh-teal-deep/70 via-transparent to-zh-teal-deep/30"
      />

      <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl flex-col justify-end px-4 pb-16 pt-24 sm:px-6 sm:pb-20 md:justify-center md:pb-24">
        <div className="max-w-xl space-y-6">
          <p className="home-reveal font-heading text-5xl leading-[0.95] tracking-tight text-white sm:text-6xl md:text-7xl">
            Zenith Health
          </p>

          <h1 className="home-reveal home-reveal-delay-1 max-w-lg text-2xl font-medium leading-snug text-zh-foam sm:text-3xl">
            Care that stays organized from visit to follow-up.
          </h1>

          <p className="home-reveal home-reveal-delay-2 max-w-md text-base leading-relaxed text-white/80 sm:text-lg">
            Book consultations, manage records, and keep every next step visible
            in one calm place.
          </p>

          <div className="home-reveal home-reveal-delay-3 flex flex-wrap items-center gap-3 pt-2">
            <Link href="/consultation">
              <Button
                size="lg"
                className="h-11 rounded-xl bg-white px-5 text-zh-teal-deep hover:bg-zh-foam"
              >
                Book a consultation
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="lg"
                variant="outline"
                className="h-11 rounded-xl border-white/40 bg-transparent px-5 text-white hover:bg-white/10 hover:text-white"
              >
                Create account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
