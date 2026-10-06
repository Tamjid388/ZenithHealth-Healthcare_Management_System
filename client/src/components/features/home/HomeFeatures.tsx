import {
  ClipboardList,
  HeartHandshake,
  ListChecks,
  Route,
  type LucideIcon,
} from "lucide-react";

import { featuresContent } from "@/components/features/home/homeContent";
import HomeSection, {
  SectionHeading,
} from "@/components/features/home/HomeSection";
import Reveal from "@/components/motion/Reveal";

const featureIcons: Record<(typeof featuresContent.items)[number]["key"], LucideIcon> =
  {
    visits: ClipboardList,
    records: Route,
    nextSteps: ListChecks,
    community: HeartHandshake,
  };

export default function HomeFeatures() {
  return (
    <HomeSection aria-labelledby="home-features-heading" className="bg-white">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          eyebrow="Why Zenith"
          headingId="home-features-heading"
          title={featuresContent.title}
          description={featuresContent.subtitle}
        />
        <Reveal delay={0.1} className="shrink-0">
          <p className="max-w-[26ch] border-l-2 border-zh-blue/30 pl-4 text-sm leading-relaxed text-zh-ink/60 md:text-right">
            One calm trail — not five disconnected portals.
          </p>
        </Reveal>
      </div>

      {/* Editorial index instead of a repetitive card grid: a top rule,
          an index number, and generous type carry the hierarchy. */}
      <ul className="mt-[clamp(2rem,4vw,3rem)] grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {featuresContent.items.map((feature, index) => {
          const Icon = featureIcons[feature.key];

          return (
            <Reveal
              as="li"
              key={feature.key}
              delay={Math.min(index * 0.08, 0.24)}
            >
              <article className="group border-t-2 border-zh-blue-deep/10 pt-6 transition-colors duration-300 hover:border-zh-blue">
                <div className="flex items-center justify-between">
                  <span className="inline-flex size-11 items-center justify-center rounded-xl bg-zh-mist text-zh-blue ring-1 ring-zh-blue-deep/10 transition-colors duration-300 group-hover:bg-zh-blue group-hover:text-white">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span
                    aria-hidden="true"
                    className="font-heading text-sm tracking-[0.2em] text-zh-ink/30 tabular-nums"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-5 font-heading text-xl leading-tight tracking-tight text-zh-ink">
                  {feature.title}
                </h3>
                <p className="mt-2.5 max-w-[38ch] text-[0.9375rem] leading-relaxed text-zh-ink/65">
                  {feature.description}
                </p>
              </article>
            </Reveal>
          );
        })}
      </ul>
    </HomeSection>
  );
}
