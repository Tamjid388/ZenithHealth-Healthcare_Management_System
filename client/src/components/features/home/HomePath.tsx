import { ArrowRight } from "lucide-react";

import { pathContent } from "@/components/features/home/homeContent";
import HomeSection, {
  SectionHeading,
} from "@/components/features/home/HomeSection";
import Reveal from "@/components/motion/Reveal";

export default function HomePath() {
  return (
    <HomeSection aria-labelledby="home-path-heading" className="bg-zh-sand">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          headingId="home-path-heading"
          title={pathContent.title}
          description={pathContent.subtitle}
        />
        <Reveal delay={0.1} className="shrink-0">
          <p className="text-sm font-semibold tracking-wide text-zh-blue">
            {String(pathContent.steps.length).padStart(2, "0")} moves, one trail
          </p>
        </Reveal>
      </div>

      {/* Connected stepper: numbers joined by a rule on desktop,
          stacked with a rail on mobile. Hover highlights the step. */}
      <ol className="relative mt-[clamp(2rem,4vw,3rem)] grid gap-10 md:grid-cols-3 md:gap-6">
        <span
          aria-hidden="true"
          className="absolute top-6 right-[16%] left-[16%] hidden h-px bg-zh-blue-deep/15 md:block"
        />
        {pathContent.steps.map((step, index) => (
          <Reveal as="li" key={step.number} delay={Math.min(index * 0.08, 0.16)}>
            <article className="group relative md:pr-6">
              <p className="relative inline-flex items-center justify-center">
                <span className="relative z-10 inline-flex size-12 items-center justify-center rounded-full bg-zh-blue-deep font-heading text-sm tracking-[0.12em] text-white ring-4 ring-zh-sand transition-colors duration-300 group-hover:bg-zh-blue">
                  {step.number}
                </span>
              </p>
              <h3 className="mt-5 flex items-center gap-2 font-heading text-[clamp(1.25rem,1.1rem+0.8vw,1.5rem)] tracking-tight text-zh-ink">
                {step.title}
                <ArrowRight
                  className="size-4 -translate-x-1 text-zh-blue opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                  aria-hidden="true"
                />
              </h3>
              <p className="mt-2 max-w-[42ch] text-[0.9375rem] leading-relaxed text-zh-ink/65">
                {step.description}
              </p>
            </article>
          </Reveal>
        ))}
      </ol>
    </HomeSection>
  );
}
