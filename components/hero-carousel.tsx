"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const heroSlides = [
  {
    id: 1,
    title: "Personalized Learning Journeys",
    description:
      "Tailored educational experiences powered by AI to meet each student's unique needs and learning style.",
    ctaText: "Start Learning",
    ctaLink: "/courses",
    image: "/images/hero-personalized-learning.jpg",
    query: "students learning with tablets in modern classroom with AI visualization overlay",
  },
  {
    id: 2,
    title: "Expert Educators & Quality Content",
    description: "Learn from verified educators who are passionate about their subjects and committed to your success.",
    ctaText: "Meet Our Educators",
    ctaLink: "/educators",
    image: "/images/hero-expert-educators.jpg",
    query: "diverse group of professional teachers collaborating in modern educational setting",
  },
  {
    id: 3,
    title: "Interactive AI Tutoring",
    description: "Get instant help and feedback from our advanced AI tutors available 24/7 to support your learning.",
    ctaText: "Try AI Tutor",
    ctaLink: "/ai-tutor",
    image: "/images/hero-ai-tutoring.jpg",
    query: "student interacting with futuristic AI tutor interface with holographic elements",
  },
  {
    id: 4,
    title: "Track Your Progress",
    description: "Visualize your learning journey with comprehensive analytics and achievement tracking.",
    ctaText: "View Dashboard",
    ctaLink: "/dashboard",
    image: "/images/hero-progress-tracking.jpg",
    query: "student looking at colorful learning analytics dashboard with progress charts",
  },
  {
    id: 5,
    title: "Join Our Learning Community",
    description: "Connect with peers, collaborate on projects, and engage in meaningful educational discussions.",
    ctaText: "Join Community",
    ctaLink: "/community",
    image: "/images/hero-community.jpg",
    query: "diverse group of students collaborating in modern study space with digital devices",
  },
]

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(interval)
  }, [currentSlide, isAutoPlaying])

  return (
    <section className="relative h-[600px] overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800">
      {/* Hero Slides */}
      <div className="relative h-full w-full">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 h-full w-full transition-opacity duration-1000",
              index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
          >
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <Image
                src={slide.image || `/placeholder.svg?height=1200&width=1920&query=${encodeURIComponent(slide.query)}`}
                alt={slide.title}
                fill
                className="object-cover opacity-40"
                priority={index === 0}
              />
            </div>

            {/* Content */}
            <div className="relative z-10 flex h-full items-center">
              <div className="container mx-auto px-4 md:px-6">
                <div className="max-w-2xl">
                  <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
                    {slide.title}
                  </h1>
                  <p className="mb-8 text-xl text-gray-200">{slide.description}</p>
                  <div className="flex flex-wrap gap-4">
                    <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                      <Link href={slide.ctaLink}>{slide.ctaText}</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                      <Link href="/about">Learn More</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/50"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/50"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "h-2 w-8 rounded-full transition-all",
              index === currentSlide ? "bg-white" : "bg-white/40 hover:bg-white/60",
            )}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentSlide ? "true" : "false"}
          />
        ))}
      </div>
    </section>
  )
}
