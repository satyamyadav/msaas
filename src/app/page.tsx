import { HeroSection } from "@components/sections/hero";
import { ModulesOverview } from "@components/sections/modules-overview";

export default function Home() {
  return (
    <div className="flex flex-col gap-4 pb-16">
      <HeroSection />
      <ModulesOverview />
    </div>
  );
}
