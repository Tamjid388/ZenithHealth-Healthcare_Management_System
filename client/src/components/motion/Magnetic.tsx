"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useRef, type MouseEvent, type ReactNode } from "react";

import { SPRING_MAGNETIC } from "@/components/motion/motion";

interface MagneticProps {
  children: ReactNode;
  /** Max pull toward the cursor, in px. Kept small — tactile, not gimmicky. */
  strength?: number;
  className?: string;
}

/**
 * Magnetic hover wrapper for the primary CTA. Translates the element a few
 * px toward the cursor with spring physics, driven entirely by motion
 * values (no React re-renders on pointer movement). Renders a plain
 * wrapper when reduced motion is preferred.
 */
export default function Magnetic({ children, strength = 7, className }: MagneticProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, SPRING_MAGNETIC);
  const y = useSpring(rawY, SPRING_MAGNETIC);

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  function handleMove(event: MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
    const relY = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
    rawX.set(Math.max(-0.5, Math.min(0.5, relX)) * strength * 2);
    rawY.set(Math.max(-0.5, Math.min(0.5, relY)) * strength * 2);
  }

  function handleLeave() {
    rawX.set(0);
    rawY.set(0);
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x, y }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </motion.div>
  );
}
