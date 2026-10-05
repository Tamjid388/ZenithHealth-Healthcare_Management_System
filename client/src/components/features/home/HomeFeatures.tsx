import {
  ClipboardList,
  HeartHandshake,
  ListChecks,
  Route,
  type LucideIcon,
} from "lucide-react";

import { featuresContent } from "@/components/features/home/homeContent";
import HomeSection from "@/components/features/home/HomeSection";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const featureIcons: Record<(typeof featuresContent.items)[number]["key"], LucideIcon> =
  {
    visits: ClipboardList,
    records: Route,
    nextSteps: ListChecks,
    community: HeartHandshake,
  };

export default function HomeFeatures() {
  return (
    <HomeSection
      aria-labelledby="home-features-heading"
      className="bg-white"
    >
      <div className="max-w-2xl">
        <h2
          id="home-features-heading"
          className="font-heading text-3xl tracking-tight text-zh-blue-deep sm:text-4xl lg:text-5xl"
        >
          {featuresContent.title}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-zh-ink/70 sm:text-lg">
          {featuresContent.subtitle}
        </p>
      </div>

      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {featuresContent.items.map((feature) => {
          const Icon = featureIcons[feature.key];

          return (
            <li key={feature.key}>
              <Card className="h-full bg-zh-mist/60 py-5 ring-zh-blue-deep/10 transition-shadow duration-300 hover:shadow-md">
                <CardHeader className="gap-4">
                  <span className="inline-flex size-11 items-center justify-center rounded-xl bg-zh-foam text-zh-blue">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <CardTitle className="font-heading text-lg text-zh-ink sm:text-xl">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed text-zh-ink/65 sm:text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </HomeSection>
  );
}
