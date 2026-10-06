"use client";

import Image from "next/image";
import { motion, useReducedMotion, type MotionStyle } from "framer-motion";

import { HERO_IMAGE } from "@/components/features/home/homeContent";
import { DURATION, EASE_REVEAL } from "@/components/motion/motion";
import { cn } from "@/lib/utils";

interface HeroVisualProps {
  /** Pointer-parallax style for the image layer (undefined when disabled). */
  imageStyle?: MotionStyle;
  /** Pointer-parallax style for the rail layer (undefined when disabled). */
  railStyle?: MotionStyle;
  /** Scroll-linked image scale (undefined when reduced motion / mobile). */
  scrubScale?: MotionStyle["scale"];
}

const trailStops = [
  { index: "01", label: "Consultation", detail: "Book a visit", active: true },
  { index: "02", label: "Records", detail: "One trail", active: false },
  { index: "03", label: "Follow-up", detail: "Never stall", active: false },
] as const;

/**
 * Hero visual: one large continuous image surface with a solid
 * care-trail rail docked to it. The rail is product content (the three
 * stops of the care path), not decoration — hence solid ink, not glass.
 *
 * Depth system: the image drifts slightly with the pointer, the rail
 * drifts further (foreground), copy elsewhere counter-drifts. All via
 * motion values — no re-renders.
 */
export default function HeroVisual({ imageStyle, railStyle, scrubScale }: HeroVisualProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative">
      {/* Image surface: layered entrance (clip reveal → settle zoom)
          keeps the reveal choreographed instead of a plain fade. */}
      <motion.figure
        initial={reduceMotion ? false : { clipPath: "inset(6% 5% 6% 5% round 24px)", opacity: 0.4 }}
        animate={{ clipPath: "inset(0% 0% 0% 0% round 24px)", opacity: 1 }}
        transition={{ duration: DURATION.visual, ease: EASE_REVEAL, delay: 0.35 }}
        className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-zh-foam ring-1 ring-zh-blue-deep/10 sm:aspect-[16/12] lg:aspect-auto lg:h-[clamp(30rem,38vw,40rem)]"
      >
        <motion.div style={imageStyle} className="absolute inset-0">
          <motion.div
            initial={reduceMotion ? false : { scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ duration: DURATION.visual + 0.3, ease: EASE_REVEAL, delay: 0.35 }}
            className="absolute inset-0"
          >
            <motion.div style={scrubScale ? { scale: scrubScale } : undefined} className="absolute inset-0">
              <Image
                src={HERO_IMAGE.src}
                alt={HERO_IMAGE.alt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 44vw"
                className="object-cover object-[center_18%]"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.figure>

      {/* Trail rail — desktop: vertical, docked over the image's left edge. */}
      <div className="absolute top-[10%] left-0 hidden -translate-x-1/3 md:block lg:-translate-x-1/4">
        <motion.aside
          aria-label="Your care trail: consultation, records, follow-up"
          style={railStyle}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DURATION.fade, ease: EASE_REVEAL, delay: 0.9 }}
          className="w-48 rounded-2xl bg-zh-blue-deep p-4 text-white shadow-[0_20px_44px_-20px_rgb(11_58_92/0.6)]"
        >
          <p className="text-[0.6875rem] font-semibold tracking-[0.18em] text-zh-foam/70 uppercase">
            Care trail
          </p>
          <ol className="mt-3 space-y-0">
            {trailStops.map((stop, i) => (
              <li key={stop.index} className="relative flex gap-3 pb-4 last:pb-0">
                {i < trailStops.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute top-6 bottom-0 left-[7px] w-px bg-white/20"
                  />
                ) : null}
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-1 size-[15px] shrink-0 rounded-full ring-4",
                    stop.active
                      ? "bg-white ring-white/20"
                      : "bg-transparent ring-white/30",
                  )}
                />
                <span>
                  <span className="block text-sm leading-tight font-semibold">
                    {stop.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-zh-foam/70">
                    {stop.detail}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </motion.aside>
      </div>

      {/* Trail rail — mobile: horizontal strip docked to the image base. */}
      <div className="absolute inset-x-3 bottom-3 md:hidden">
        <motion.aside
          aria-label="Your care trail: consultation, records, follow-up"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.fade, ease: EASE_REVEAL, delay: 0.9 }}
          className="rounded-2xl bg-zh-blue-deep px-4 py-3 text-white"
        >
          <ol className="flex items-center justify-between gap-2">
            {trailStops.map((stop, i) => (
              <li key={stop.index} className="flex min-w-0 flex-1 items-center gap-2">
                {i > 0 ? (
                  <span aria-hidden="true" className="h-px w-3 shrink-0 bg-white/25" />
                ) : null}
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    stop.active ? "bg-white" : "bg-white/35",
                  )}
                />
                <span className="truncate text-xs font-semibold">{stop.label}</span>
              </li>
            ))}
          </ol>
        </motion.aside>
      </div>
    </div>
  );
}
