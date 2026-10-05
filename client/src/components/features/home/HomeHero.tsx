import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { HERO_IMAGE, heroContent } from "@/components/features/home/homeContent";
import HomeSection from "@/components/features/home/HomeSection";

export default function HomeHero() {
  return (
    <HomeSection
      aria-labelledby="home-hero-heading"
      className="overflow-hidden bg-zh-mist py-12 sm:py-16 lg:py-20"
    >
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="max-w-xl space-y-6">
          <p className="home-reveal text-sm font-medium tracking-[0.18em] text-zh-blue uppercase">
            {heroContent.eyebrow}
          </p>

          <h1
            id="home-hero-heading"
            className="home-reveal home-reveal-delay-1 font-heading text-4xl leading-[0.95] tracking-tight text-zh-blue-deep sm:text-5xl md:text-6xl lg:text-7xl"
          >
            {heroContent.title}
          </h1>

          <p className="home-reveal home-reveal-delay-2 max-w-lg text-xl font-medium leading-snug text-zh-ink sm:text-2xl">
            {heroContent.headline}
          </p>

          <p className="home-reveal home-reveal-delay-3 max-w-md text-base leading-relaxed text-zh-ink/70 sm:text-lg">
            {heroContent.body}
          </p>

          <div className="home-reveal home-reveal-delay-4 flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Link href={heroContent.primary.href} className="w-full sm:w-auto">
              <Button
                size="lg"
                className="h-11 w-full rounded-xl bg-zh-blue px-5 text-primary-foreground hover:bg-zh-blue-deep sm:w-auto"
              >
                {heroContent.primary.label}
              </Button>
            </Link>
            <Link href={heroContent.secondary.href} className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="h-11 w-full rounded-xl border-zh-blue-deep/20 bg-white px-5 text-zh-blue-deep hover:bg-zh-foam sm:w-auto"
              >
                {heroContent.secondary.label}
              </Button>
            </Link>
          </div>
        </div>

        <div className="home-reveal home-reveal-delay-2 relative aspect-[4/5] overflow-hidden rounded-2xl bg-zh-foam shadow-sm ring-1 ring-zh-blue-deep/10 sm:aspect-[5/4] lg:aspect-[4/5] lg:min-h-[28rem]">
          <Image
            src={HERO_IMAGE.src}
            alt={HERO_IMAGE.alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center"
          />
        </div>
      </div>
    </HomeSection>
  );
}
