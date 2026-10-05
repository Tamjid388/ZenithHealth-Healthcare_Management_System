import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  Building2,
  Check,
  ClipboardPlus,
  HeartPulse,
  Pill,
  type LucideIcon,
} from "lucide-react";

import {
  HERO_IMAGE,
  consultationFeature,
  servicesContent,
} from "@/components/features/home/homeContent";
import HomeSection from "@/components/features/home/HomeSection";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const serviceIcons: Record<string, LucideIcon> = {
  "/consultation": HeartPulse,
  "/medicines": Pill,
  "/diagnostics": Activity,
  "/health-plans": ClipboardPlus,
  "/ngos": Building2,
};

export default function HomeServices() {
  return (
    <HomeSection
      aria-labelledby="home-services-heading"
      className="bg-zh-mist"
    >
      <div className="max-w-2xl">
        <h2
          id="home-services-heading"
          className="font-heading text-3xl tracking-tight text-zh-blue-deep sm:text-4xl lg:text-5xl"
        >
          {servicesContent.title}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-zh-ink/70 sm:text-lg">
          {servicesContent.subtitle}
        </p>
      </div>

      <div className="mt-12 grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="space-y-6">
          <p className="text-sm font-medium tracking-[0.18em] text-zh-blue uppercase">
            {consultationFeature.eyebrow}
          </p>
          <h3 className="font-heading text-2xl tracking-tight text-zh-ink sm:text-3xl">
            {consultationFeature.title}
          </h3>
          <p className="max-w-lg text-base leading-relaxed text-zh-ink/70">
            {consultationFeature.body}
          </p>
          <ul className="space-y-3">
            {consultationFeature.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3 text-sm text-zh-ink/80 sm:text-base">
                <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-zh-foam text-zh-blue">
                  <Check className="size-3" aria-hidden="true" />
                </span>
                {bullet}
              </li>
            ))}
          </ul>
          <Link href={consultationFeature.cta.href}>
            <Button
              size="lg"
              className="h-11 rounded-xl bg-zh-blue px-5 text-primary-foreground hover:bg-zh-blue-deep"
            >
              {consultationFeature.cta.label}
            </Button>
          </Link>
        </div>

        <div className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-zh-foam ring-1 ring-zh-blue-deep/10">
          <Image
            src={HERO_IMAGE.src}
            alt={HERO_IMAGE.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-[center_20%]"
          />
        </div>
      </div>

      <ul className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-6 md:grid-rows-2 md:auto-rows-fr">
        {servicesContent.tiles.map((tile) => {
          const Icon = serviceIcons[tile.href] ?? HeartPulse;
          const isPhoto = tile.variant === "photo";
          const isDeep = tile.variant === "deep";

          return (
            <li key={tile.href} className={cn("min-h-44", tile.layout)}>
              <Link
                href={tile.href}
                className={cn(
                  "group relative flex h-full min-h-44 flex-col justify-end overflow-hidden rounded-2xl p-5 ring-1 transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  isPhoto && "bg-zh-blue-deep text-white ring-zh-blue-deep/20 hover:shadow-md",
                  tile.variant === "foam" &&
                    "bg-white text-zh-ink ring-zh-blue-deep/10 hover:bg-zh-foam/60 hover:shadow-md",
                  isDeep &&
                    "bg-zh-blue-deep text-white ring-zh-blue-deep/20 hover:shadow-md",
                )}
              >
                {isPhoto ? (
                  <>
                    <Image
                      src={HERO_IMAGE.src}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className={cn(
                        "object-cover transition-transform duration-500 group-hover:scale-105",
                        tile.objectPosition ?? "object-center",
                      )}
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-linear-to-t from-zh-blue-deep via-zh-blue-deep/55 to-zh-blue-deep/10"
                    />
                  </>
                ) : null}

                <span className="relative space-y-2">
                  <span
                    className={cn(
                      "inline-flex size-10 items-center justify-center rounded-xl",
                      isPhoto || isDeep
                        ? "bg-white/15 text-white"
                        : "bg-zh-foam text-zh-blue",
                    )}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="block font-heading text-xl sm:text-2xl">
                    {tile.title}
                  </span>
                  <span
                    className={cn(
                      "block max-w-sm text-sm leading-relaxed",
                      isPhoto || isDeep ? "text-zh-foam/90" : "text-zh-ink/65",
                    )}
                  >
                    {tile.description}
                  </span>
                  <span
                    className={cn(
                      "inline-block pt-1 text-sm font-medium transition-transform duration-300 group-hover:translate-x-1",
                      isPhoto || isDeep ? "text-white" : "text-zh-blue",
                    )}
                  >
                    Explore
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </HomeSection>
  );
}
