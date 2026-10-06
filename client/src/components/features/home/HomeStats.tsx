import { statsContent } from "@/components/features/home/homeContent";
import HomeSection from "@/components/features/home/HomeSection";
import Reveal from "@/components/motion/Reveal";

export default function HomeStats() {
  return (
    <HomeSection
      aria-labelledby="home-stats-heading"
      className="bg-zh-blue-deep py-[clamp(2.75rem,5vw,4rem)]"
    >
      <h2 id="home-stats-heading" className="sr-only">
        Care path at a glance
      </h2>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
        {statsContent.items.map((stat, index) => (
          <Reveal
            key={stat.label}
            delay={Math.min(index * 0.07, 0.21)}
            className={
              // Dividers carry the structure: top rule on mobile,
              // left rule on desktop. No card chrome needed.
              "border-t-2 border-white/15 pt-5 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0"
            }
          >
            <div className="flex flex-col">
              <dt className="order-2 mt-2 text-sm leading-snug text-zh-foam/80">
                {stat.label}
              </dt>
              <dd className="order-1 font-heading text-[clamp(1.875rem,1.5rem+2vw,2.75rem)] leading-none tracking-tight text-white tabular-nums">
                {stat.value}
              </dd>
            </div>
          </Reveal>
        ))}
      </dl>
    </HomeSection>
  );
}
