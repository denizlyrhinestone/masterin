"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Software Developer",
    avatar: "/placeholder.svg?height=60&width=60&text=SJ",
    content:
      "The courses on LearnWise are incredibly well-structured and engaging. The instructors break down complex programming concepts into manageable pieces that build on each other logically. I've tried many online learning platforms, but LearnWise's approach has been the most effective for me.",
    course: "Advanced JavaScript",
    rating: 5,
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Marketing Manager",
    avatar: "/placeholder.svg?height=60&width=60&text=MC",
    content:
      "LearnWise has transformed how I approach professional development. The courses are engaging and practical, with real-world examples that I've been able to apply immediately in my work. The platform's interface is intuitive and makes learning enjoyable rather than a chore.",
    course: "Digital Marketing Strategy",
    rating: 5,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "UX Designer",
    avatar: "/placeholder.svg?height=60&width=60&text=ER",
    content:
      "As a visual learner, I appreciate how the platform incorporates different learning modalities. The combination of video lectures, interactive exercises, and project-based assessments has helped me retain information better than traditional learning methods. The design courses are particularly excellent.",
    course: "UI/UX Design Principles",
    rating: 4,
  },
  {
    id: 4,
    name: "David Okafor",
    role: "Data Scientist",
    avatar: "/placeholder.svg?height=60&width=60&text=DO",
    content:
      "The depth of content is impressive. I've taken courses on other platforms, but LearnWise's courses go beyond surface-level explanations to provide a thorough understanding of complex topics. The machine learning course helped me implement advanced algorithms that I now use daily in my work.",
    course: "Machine Learning Fundamentals",
    rating: 5,
  },
  {
    id: 5,
    name: "Priya Sharma",
    role: "Business Analyst",
    avatar: "/placeholder.svg?height=60&width=60&text=PS",
    content:
      "The community aspect of LearnWise sets it apart. Being able to discuss concepts with other learners creates a collaborative environment that enhances the learning experience. The forums are active and the instructors are responsive to questions, which has been invaluable for my professional growth.",
    course: "Business Analytics",
    rating: 5,
  },
  {
    id: 6,
    name: "James Wilson",
    role: "Product Manager",
    avatar: "/placeholder.svg?height=60&width=60&text=JW",
    content:
      "I've recommended LearnWise to my entire team. The courses are comprehensive yet concise, focusing on practical skills that can be immediately applied. The platform's interface is clean and distraction-free, allowing me to focus entirely on learning. It's been a game-changer for our team's skill development.",
    course: "Product Management Essentials",
    rating: 4,
  },
]

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const itemsPerPage = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  }

  const [itemsToShow, setItemsToShow] = useState(itemsPerPage.desktop)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsToShow(itemsPerPage.mobile)
      } else if (window.innerWidth < 1024) {
        setItemsToShow(itemsPerPage.tablet)
      } else {
        setItemsToShow(itemsPerPage.desktop)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const totalPages = Math.ceil(testimonials.length / itemsToShow)

  const next = useCallback(() => {
    setDirection(1)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalPages)
  }, [totalPages])

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalPages) % totalPages)
  }, [totalPages])

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        next()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [next, isPaused])

  const visibleTestimonials = () => {
    const start = currentIndex * itemsToShow
    return testimonials.slice(start, start + itemsToShow)
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 200 : -200,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 200 : -200,
      opacity: 0,
    }),
  }

  return (
    <div className="relative" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <div className="overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {visibleTestimonials().map((testimonial) => (
              <Card key={testimonial.id} className="h-full hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-10 w-10 mr-4">
                      <AvatarImage
                        src={testimonial.avatar || "/placeholder.svg"}
                        alt={`Profile picture of ${testimonial.name}`}
                      />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex mb-4" aria-label={`Rating: ${testimonial.rating} out of 5 stars`}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                  <p className="text-sm text-gray-500">Course: {testimonial.course}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center mt-8 gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={prev}
          className="rounded-full hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 transform active:scale-95"
          aria-label="Previous testimonials"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2" role="tablist" aria-label="Testimonial pages">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1)
                setCurrentIndex(i)
              }}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === currentIndex ? "bg-blue-600 scale-125" : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to testimonial page ${i + 1}`}
              aria-selected={i === currentIndex}
              role="tab"
            />
          ))}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={next}
          className="rounded-full hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 transform active:scale-95"
          aria-label="Next testimonials"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
