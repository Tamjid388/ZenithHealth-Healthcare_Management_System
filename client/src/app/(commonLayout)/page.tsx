import HomeHero from "@/components/features/home/HomeHero";
import HomePath from "@/components/features/home/HomePath";
import HomeServices from "@/components/features/home/HomeServices";

export default function CommonLayoutPage() {
  return (
    <main>
      <HomeHero />
      <HomeServices />
      <HomePath />
    </main>
  );
}
