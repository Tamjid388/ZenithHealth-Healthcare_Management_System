import type { BezierDefinition } from "framer-motion";

/**
 * Shared hero motion language. One easing curve, one stagger rhythm,
 * spring presets per interaction weight — tuned in one place.
 *
 * Hierarchy of motion: reveal (entrance) → pointer (depth) → scroll
 * (continuity). All compositor-friendly: transform / opacity / clip-path.
 */

/** Signature reveal curve: fast start, soft landing. */
export const EASE_REVEAL: BezierDefinition = [0.22, 1, 0.36, 1];

/** Entrance durations (seconds). */
export const DURATION = {
  word: 0.7,
  fade: 0.6,
  visual: 1.1,
} as const;

/** Per-word stagger for masked typography reveals. */
export const STAGGER_WORD = 0.045;

/** Pointer parallax springs: loose enough to feel physical, tight enough
 *  to never lag behind the cursor. */
export const SPRING_POINTER = {
  stiffness: 60,
  damping: 20,
} as const;

/** Magnetic CTA spring: snappier, small mass for a tactile pull. */
export const SPRING_MAGNETIC = {
  stiffness: 180,
  damping: 14,
  mass: 0.4,
} as const;

/**
 * Pointer depth map (multipliers on the normalized -0.5…0.5 pointer
 * value, in px at full deflection). Foreground moves most, background
 * least; copy drifts inverse for counter-depth.
 */
export const DEPTH = {
  image: 8,
  rail: 16,
  copy: -6,
} as const;
