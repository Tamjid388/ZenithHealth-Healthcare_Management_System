import { statsContent } from "@/components/features/home/homeContent";
import HomeSection from "@/components/features/home/HomeSection";

export default function HomeStats() {
  return (
    <HomeSection
      aria-labelledby="home-stats-heading"
      className="bg-zh-blue-deep py-12 sm:py-14 lg:py-16"
    >
      <h2 id="home-stats-heading" className="sr-only">
        Care path at a glance
      </h2>
      <ul className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-6">
        {statsContent.items.map((stat) => (
          <li key={stat.label} className="text-center md:text-left">
            <p className="font-heading text-3xl tracking-tight text-white sm:text-4xl">
              {stat.value}
            </p>
            <p className="mt-2 text-sm leading-snug text-zh-foam/85 sm:text-base">
              {stat.label}
            </p>
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}
