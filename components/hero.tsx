"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

const slides = [
  {
    title: "Unlock Your Potential",
    description: "Explore a world of knowledge with our diverse range of courses.",
    image: "/diverse-students-studying.png",
    alt: "Diverse group of students collaborating",
  },
  {
    title: "Personalized AI Tutoring",
    description: "Get personalized help and guidance from our AI tutors.",
    image: "/abstract-ai-network.png",
    alt: "AI tutor assisting a student",
  },
  {
    title: "Empowering Educators",
    description: "Create and share your expertise with a global community of learners.",
    image: "/thoughtful-professor.png",
    alt: "Teacher creating a course",
  },
  {
    title: "Explore Endless Subjects",
    description: "From science to history, discover courses in every subject imaginable.",
    image: "/linguistic-diversity.png",
    alt: "Students exploring course categories",
  },
]

export const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentSlide((currentSlide + 1) % slides.length)
    }, 5000)
    return () => clearTimeout(timer)
  }, [currentSlide])

  return (
    <div className="relative w-full h-[600px] overflow-hidden rounded-xl">
      {slides.map((slide, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: index === currentSlide ? 0 : index > currentSlide ? "100%" : "-100%" }}
          animate={{ opacity: index === currentSlide ? 1 : 0, x: 0 }}
          exit={{ x: index > currentSlide ? "-100%" : "100%", opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute top-0 left-0 w-full h-full"
        >
          <img src={slide.image || "/placeholder.svg"} alt={slide.alt} className="object-cover w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-8">
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-4xl font-bold mb-4"
            >
              {slide.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-lg mb-8"
            >
              {slide.description}
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.7 }}>
              <Button size="lg">Explore Courses</Button>
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
