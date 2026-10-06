"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "span";
}

/**
 * Scroll-triggered reveal for below-the-fold home sections.
 * GPU-friendly (opacity + transform only), runs once, and
 * disables itself when the user prefers reduced motion.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 20,
  className,
  as = "div",
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    if (as === "li") return <li className={className}>{children}</li>;
    if (as === "span") return <span className={className}>{children}</span>;
    return <div className={className}>{children}</div>;
  }

  const Tag = as === "li" ? motion.li : as === "span" ? motion.span : motion.div;

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  );
}
