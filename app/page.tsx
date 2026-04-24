import { HeroSection } from "@/components/home/hero-section";
import { AffiliateBanner } from "@/components/home/affiliate-banner";
import { WebinarSection } from "@/components/home/webinar-section";
import { FeaturedCourses } from "@/components/home/featured-courses";
import { CTASection } from "@/components/home/cta-section";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <AffiliateBanner />
      <WebinarSection />
      <FeaturedCourses />
      <CTASection />
    </div>
  );
}
