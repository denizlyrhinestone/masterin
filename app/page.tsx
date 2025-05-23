import { HeroSlider } from "@/components/hero-slider"
import { FeaturesSection } from "@/components/features-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { CTASection } from "@/components/cta-section"
import { AiToolsSection } from "@/components/ai-tools-section"
import { MasterbotSection } from "@/components/masterbot/masterbot-section"

export default function HomePage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <HeroSlider />
      <MasterbotSection />
      <AiToolsSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  )
}
