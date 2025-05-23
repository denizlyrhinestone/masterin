import { FeaturesSection } from "@/components/features-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { CTASection } from "@/components/cta-section"
import { HeroSlider } from "@/components/hero-slider"
import { MasterbotSection } from "@/components/masterbot/masterbot-section"
import AIToolsSection from "@/components/ai-tools-section"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <HeroSlider />
        <MasterbotSection />
        <FeaturesSection />
        <AIToolsSection />
        <TestimonialsSection />
        <CTASection />
      </main>
    </div>
  )
}
