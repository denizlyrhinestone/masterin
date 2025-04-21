import { HeroCarousel } from "@/components/hero-carousel"
import { FeatureSection } from "@/components/feature-section"
import { TestimonialSection } from "@/components/testimonial-section"
import { StatisticsSection } from "@/components/statistics-section"
import { CTASection } from "@/components/cta-section"
import { PopularCoursesSection } from "@/components/popular-courses-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroCarousel />
      <FeatureSection />
      <PopularCoursesSection />
      <StatisticsSection />
      <TestimonialSection />
      <CTASection />
      <Footer />
    </div>
  )
}
