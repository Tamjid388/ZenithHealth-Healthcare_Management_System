import HomeCta from "@/components/features/home/HomeCta";
import HomeFeatures from "@/components/features/home/HomeFeatures";
import HomeHero from "@/components/features/home/HomeHero";
import HomePath from "@/components/features/home/HomePath";
import HomeServices from "@/components/features/home/HomeServices";
import HomeStats from "@/components/features/home/HomeStats";

export default function CommonLayoutPage() {
  return (
    <main>
      <HomeHero />
      <HomeFeatures />
      <HomeServices />
      <HomeStats />
      <HomePath />
      <HomeCta />
    </main>
  );
}
