import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
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
import HomeSection, {
  SectionHeading,
} from "@/components/features/home/HomeSection";
import Reveal from "@/components/motion/Reveal";
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
      <SectionHeading
        eyebrow="Care areas"
        headingId="home-services-heading"
        title={servicesContent.title}
        description={servicesContent.subtitle}
      />

      {/* Consultation spotlight: the primary path gets editorial space
          before the supporting tiles. 12-col grid keeps copy at a
          readable measure while the visual uses real viewport width. */}
      <div className="mt-[clamp(2rem,4vw,3.5rem)] grid items-center gap-[clamp(2rem,4vw,3.5rem)] lg:grid-cols-12">
        <Reveal className="lg:col-span-6">
          <div className="max-w-[36rem]">
            <p className="text-[0.8125rem] font-semibold tracking-[0.16em] text-zh-blue uppercase">
              {consultationFeature.eyebrow}
            </p>
            <h3 className="mt-3 font-heading text-[clamp(1.5rem,1.2rem+1.6vw,2.25rem)] leading-tight tracking-tight text-balance text-zh-ink">
              {consultationFeature.title}
            </h3>
            <p className="mt-4 max-w-[52ch] text-[clamp(1rem,0.95rem+0.4vw,1.125rem)] leading-relaxed text-pretty text-zh-ink/70">
              {consultationFeature.body}
            </p>
            <ul className="mt-6 space-y-3">
              {consultationFeature.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex gap-3 text-[0.9375rem] leading-relaxed text-zh-ink/80"
                >
                  <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-zh-blue text-white">
                    <Check className="size-3" aria-hidden="true" />
                  </span>
                  {bullet}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href={consultationFeature.cta.href}>
                <Button
                  size="lg"
                  className="group h-12 w-full rounded-xl bg-zh-blue px-6 text-base text-primary-foreground transition-all hover:bg-zh-blue-deep active:scale-[0.98] sm:w-auto"
                >
                  {consultationFeature.cta.label}
                  <ArrowRight
                    className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Button>
              </Link>
              <p className="text-sm text-zh-ink/55 sm:pl-1">
                No account needed to browse clinicians.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-6">
          <figure className="relative overflow-hidden rounded-2xl bg-zh-foam ring-1 ring-zh-blue-deep/10">
            <div className="relative aspect-[16/11] sm:aspect-[16/9] lg:aspect-[4/3]">
              <Image
                src={HERO_IMAGE.src}
                alt={HERO_IMAGE.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 44vw"
                className="object-cover object-[center_20%]"
              />
            </div>
            <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-zh-blue-deep/10 bg-white px-5 py-3.5 text-sm">
              <span className="font-semibold text-zh-blue-deep">
                Consultation is the front door
              </span>
              <span className="text-zh-ink/60">
                Everything else connects to that visit
              </span>
            </figcaption>
          </figure>
        </Reveal>
      </div>

      {/* Supporting areas: single photo tile (consultation) + solid tiles.
          Tablet gets 2 columns; desktop restores the 6-col bento. */}
      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-6 md:auto-rows-fr">
        {servicesContent.tiles.map((tile, index) => {
          const Icon = serviceIcons[tile.href] ?? HeartPulse;
          // Only the lead tile uses photography; the second "photo" tile
          // would otherwise duplicate the same image.
          const isPhoto = tile.variant === "photo" && index === 0;
          const isDeep = tile.variant === "deep";

          return (
            <Reveal
              as="li"
              key={tile.href}
              delay={Math.min(index * 0.06, 0.24)}
              className={cn("min-h-44", tile.layout)}
            >
              <Link
                href={tile.href}
                className={cn(
                  "group relative flex h-full min-h-44 flex-col justify-end overflow-hidden rounded-2xl p-5 ring-1 transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:p-6",
                  isPhoto &&
                    "bg-zh-blue-deep text-white ring-zh-blue-deep/20 hover:shadow-[0_16px_32px_-16px_rgb(11_58_92/0.5)]",
                  tile.variant === "foam" &&
                    "bg-white text-zh-ink ring-zh-blue-deep/10 hover:bg-zh-foam/60 hover:shadow-[0_12px_28px_-16px_rgb(11_58_92/0.35)]",
                  tile.variant === "photo" &&
                    !isPhoto &&
                    "bg-zh-sand text-zh-ink ring-zh-blue-deep/10 hover:bg-white hover:shadow-[0_12px_28px_-16px_rgb(11_58_92/0.35)]",
                  isDeep &&
                    "bg-zh-blue-deep text-white ring-zh-blue-deep/20 hover:shadow-[0_16px_32px_-16px_rgb(11_58_92/0.5)]",
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
                        "object-cover transition-transform duration-500 group-hover:scale-[1.03]",
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
                      "inline-flex size-10 items-center justify-center rounded-xl transition-colors duration-300",
                      isPhoto || isDeep
                        ? "bg-white/15 text-white group-hover:bg-white/25"
                        : "bg-zh-foam text-zh-blue group-hover:bg-zh-blue group-hover:text-white",
                    )}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="flex items-center gap-1.5 font-heading text-xl tracking-tight sm:text-2xl">
                    {tile.title}
                    <ArrowUpRight
                      className="size-5 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </span>
                  <span
                    className={cn(
                      "block max-w-[42ch] text-sm leading-relaxed",
                      isPhoto || isDeep ? "text-zh-foam/90" : "text-zh-ink/65",
                    )}
                  >
                    {tile.description}
                  </span>
                  <span
                    className={cn(
                      "inline-block pt-1 text-sm font-semibold",
                      isPhoto || isDeep ? "text-white" : "text-zh-blue",
                    )}
                  >
                    Explore
                  </span>
                </span>
              </Link>
            </Reveal>
          );
        })}
      </ul>
    </HomeSection>
  );
}
