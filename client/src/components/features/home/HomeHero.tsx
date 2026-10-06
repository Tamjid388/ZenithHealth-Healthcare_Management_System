"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";

import { heroContent } from "@/components/features/home/homeContent";
import HeroVisual from "@/components/features/home/HeroVisual";
import Container from "@/components/layout/Container";
import Magnetic from "@/components/motion/Magnetic";
import {
  DEPTH,
  DURATION,
  EASE_REVEAL,
  SPRING_POINTER,
  STAGGER_WORD,
} from "@/components/motion/motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const headlineLines = [
  { words: ["Care", "that", "stays"], tone: "ink" },
  { words: ["organized."], tone: "accent" },
] as const;

/**
 * Signature hero: "the trail". Oversized serif type revealed word by word
 * through masks, set against one tall continuous image surface with a
 * solid care-trail rail docked to it.
 *
 * Motion language (three layers, one story):
 *  1. Entrance — choreographed mask reveals: eyebrow → headline words →
 *     copy → CTA → visual → rail.
 *  2. Pointer — spring-driven depth (image drifts, rail drifts further,
 *     copy counter-drifts). Motion values only; zero re-renders.
 *  3. Scroll — image slowly scales as the hero exits, copy lifts and
 *     fades, handing off to the section below via the connector row.
 *
 * Rich motion (pointer + scroll scrub) runs only on fine-pointer desktop;
 * mobile gets the same choreography with small offsets and no parallax.
 */
export default function HomeHero() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Rich motion gate: fine pointer + desktop viewport. Evaluated once on
  // mount (and on viewport change) — no per-frame React state.
  const richMotion = useMotionValue(true);
  useEffect(() => {
    const pointerQuery = window.matchMedia("(pointer: fine)");
    const widthQuery = window.matchMedia("(min-width: 1024px)");
    const sync = () => richMotion.set(pointerQuery.matches && widthQuery.matches);
    sync();
    pointerQuery.addEventListener("change", sync);
    widthQuery.addEventListener("change", sync);
    return () => {
      pointerQuery.removeEventListener("change", sync);
      widthQuery.removeEventListener("change", sync);
    };
  }, [richMotion]);

  // --- Pointer depth (spring-smoothed, no re-renders) ---
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, SPRING_POINTER);
  const smoothY = useSpring(pointerY, SPRING_POINTER);

  const imageX = useTransform(smoothX, (v) => v * DEPTH.image * 2);
  const imageY = useTransform(smoothY, (v) => v * DEPTH.image * 2);
  const railX = useTransform(smoothX, (v) => v * DEPTH.rail * 2);
  const railY = useTransform(smoothY, (v) => v * DEPTH.rail * 2);
  const copyX = useTransform(smoothX, (v) => v * DEPTH.copy * 2);
  const copyY = useTransform(smoothY, (v) => v * DEPTH.copy * 2);

  // --- Scroll continuity (scrubbed, transform/opacity only) ---
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const scrubScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const scrubCopyY = useTransform(scrollYProgress, [0, 0.7], [0, 48]);
  const scrubCopyOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  function handlePointerMove(event: React.MouseEvent) {
    if (reduceMotion || !richMotion.get() || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function handlePointerLeave() {
    pointerX.set(0);
    pointerY.set(0);
  }

  // Flattened word list with precomputed stagger delays — continuous
  // across headline lines without render-time mutation.
  const headlineWords = headlineLines.flatMap((line, lineIndex) =>
    line.words.map((word, wordInLine) => ({
      word,
      tone: line.tone,
      lineIndex,
      wordInLine,
      delay:
        0.15 +
        (headlineLines
          .slice(0, lineIndex)
          .reduce((sum, l) => sum + l.words.length, 0) +
          wordInLine) *
          STAGGER_WORD,
    })),
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="home-hero-heading"
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      className="relative overflow-hidden bg-zh-mist"
    >
      <Container width="wide" className="pt-[clamp(3rem,6vw,5rem)] pb-[clamp(2rem,3vw,2.75rem)]">
        <div className="grid items-center gap-[clamp(2.5rem,5vw,4rem)] lg:grid-cols-12">
          {/* Copy — scroll layer outside, pointer layer inside (nested so
              scrub and parallax never fight over one transform). */}
          <motion.div
            style={
              reduceMotion
                ? undefined
                : { y: scrubCopyY, opacity: scrubCopyOpacity }
            }
            className="max-w-[40rem] lg:col-span-6"
          >
            <motion.div style={reduceMotion ? undefined : { x: copyX, y: copyY }}>
              <motion.p
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DURATION.fade, ease: EASE_REVEAL, delay: 0.05 }}
                className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.8125rem] font-semibold tracking-[0.16em] text-zh-blue-deep uppercase"
              >
                <span aria-hidden="true" className="size-2 rounded-[3px] bg-zh-blue" />
                Zenith Health
                <span aria-hidden="true" className="h-px w-8 bg-zh-blue-deep/30" />
                <span className="text-zh-blue">{heroContent.eyebrow}</span>
              </motion.p>

              <h1
                id="home-hero-heading"
                className="mt-5 font-heading text-[clamp(3rem,1.8rem+5.2vw,5.5rem)] leading-[0.98] tracking-tight text-balance"
              >
                {headlineLines.map((line, lineIndex) => (
                  <span key={line.words.join(" ")} className="block">
                    {headlineWords
                      .filter((w) => w.lineIndex === lineIndex)
                      .map(({ word, tone, delay }) => {
                        return (
                          <span
                            key={`${word}-${delay}`}
                            className="inline-block overflow-hidden align-bottom pb-[0.09em] -mb-[0.09em]"
                          >
                            <motion.span
                              className={cn(
                                "inline-block will-change-transform",
                                tone === "accent" ? "text-zh-blue" : "text-zh-blue-deep",
                              )}
                            initial={reduceMotion ? false : { y: "110%" }}
                            animate={{ y: "0%" }}
                            transition={{ duration: DURATION.word, ease: EASE_REVEAL, delay }}
                          >
                            {word}
                            {word !== "organized." ? "\u00A0" : null}
                          </motion.span>
                        </span>
                      );
                    })}
                  </span>
                ))}
              </h1>

              <motion.p
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DURATION.fade, ease: EASE_REVEAL, delay: 0.45 }}
                className="mt-5 max-w-[54ch] text-[clamp(1rem,0.95rem+0.4vw,1.125rem)] leading-relaxed text-pretty text-zh-ink/70"
              >
                From visit to follow-up — {heroContent.body}
              </motion.p>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DURATION.fade, ease: EASE_REVEAL, delay: 0.58 }}
                className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6"
              >
                <Magnetic className="w-full sm:w-auto">
                  <Link
                    href={heroContent.primary.href}
                    className="block w-full sm:w-auto"
                    aria-label={`${heroContent.primary.label} — primary action`}
                  >
                    <Button
                      size="lg"
                      className="group h-13 w-full rounded-full bg-zh-blue px-7 text-base text-primary-foreground transition-colors hover:bg-zh-blue-deep sm:w-auto"
                    >
                      {heroContent.primary.label}
                      <ArrowRight
                        className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </Button>
                  </Link>
                </Magnetic>
                <Link
                  href={heroContent.secondary.href}
                  className="group inline-flex min-h-11 items-center gap-1.5 self-start rounded-md px-1 text-base font-semibold text-zh-blue-deep transition-colors hover:text-zh-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:self-auto"
                >
                  {heroContent.secondary.label}
                  <span
                    aria-hidden="true"
                    className="block h-px w-6 bg-current transition-all duration-300 group-hover:w-9"
                  />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Visual */}
          <div className="lg:col-span-6">
            <HeroVisual
              imageStyle={reduceMotion ? undefined : { x: imageX, y: imageY }}
              railStyle={reduceMotion ? undefined : { x: railX, y: railY }}
              scrubScale={reduceMotion ? undefined : scrubScale}
            />
          </div>
        </div>

        {/* Connector: the trail continues below. Scroll cue + anchor into
            the next section — the handoff, not a dead banner edge. */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DURATION.fade, ease: EASE_REVEAL, delay: 1 }}
          className="mt-[clamp(2rem,4vw,3rem)] flex items-center justify-between gap-6 border-t border-zh-blue-deep/10 pt-5"
        >
          <p className="flex items-center gap-3 text-[0.8125rem] font-medium tracking-wide text-zh-ink/60">
            <span className="relative block h-8 w-px overflow-hidden bg-zh-blue-deep/15">
              {!reduceMotion && (
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-0 origin-top bg-zh-blue"
                  animate={{ scaleY: [0, 1, 1], opacity: [0, 1, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </span>
            Your care path continues below
          </p>
          <Link
            href="#home-features-heading"
            className="group inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-semibold text-zh-blue-deep transition-colors hover:text-zh-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            See how it works
            <ArrowDown
              className="size-4 transition-transform duration-300 group-hover:translate-y-0.5"
              aria-hidden="true"
            />
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}
