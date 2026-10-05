import { pathContent } from "@/components/features/home/homeContent";
import HomeSection from "@/components/features/home/HomeSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePath() {
  return (
    <HomeSection
      aria-labelledby="home-path-heading"
      className="bg-zh-sand"
    >
      <div className="max-w-2xl">
        <h2
          id="home-path-heading"
          className="font-heading text-3xl tracking-tight text-zh-blue-deep sm:text-4xl lg:text-5xl"
        >
          {pathContent.title}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-zh-ink/70 sm:text-lg">
          {pathContent.subtitle}
        </p>
      </div>

      <ol className="mt-12 grid gap-4 md:grid-cols-3 md:gap-6">
        {pathContent.steps.map((step) => (
          <li key={step.number}>
            <Card className="h-full bg-white/80 py-6 ring-zh-blue-deep/10">
              <CardHeader>
                <p className="font-heading text-sm tracking-[0.2em] text-zh-blue">
                  {step.number}
                </p>
                <CardTitle className="font-heading text-2xl text-zh-ink">
                  {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="max-w-xs text-base leading-relaxed text-zh-ink/65">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>
    </HomeSection>
  );
}
