"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      title: "AI-Powered Learning",
      description: "Enhance your learning experience with our AI tools and courses",
      cta: "Get Started",
      ctaLink: "/ai",
    },
    {
      title: "Master New Skills",
      description: "Learn at your own pace with our comprehensive courses",
      cta: "Explore Courses",
      ctaLink: "/courses",
    },
    {
      title: "Personalized Education",
      description: "Get personalized learning recommendations based on your goals",
      cta: "Learn More",
      ctaLink: "/about",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [slides.length])

  return (
    <div className="relative h-[600px] bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`transition-opacity duration-1000 ${
                currentSlide === index ? "opacity-100" : "opacity-0 absolute inset-0"
              }`}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">{slide.title}</h1>
              <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto">{slide.description}</p>
              <Link href={slide.ctaLink}>
                <Button size="lg" className="bg-white text-purple-900 hover:bg-white/90">
                  {slide.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${currentSlide === index ? "bg-white" : "bg-white/40"}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  )
}
