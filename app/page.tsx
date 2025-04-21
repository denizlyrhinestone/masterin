"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Clock, Star, Award } from "lucide-react"
import { getFeaturedCourses } from "@/lib/courses-data"
import { useIsMobile } from "@/hooks/use-mobile"
import Link from "next/link"

// Hero slide data
const slides = [
  {
    title: "Unlock Your Potential",
    description: "Explore a world of knowledge with our diverse range of courses.",
    image: "/global-classroom.png",
    alt: "Diverse group of students studying online",
    ctaText: "Explore Courses",
    ctaLink: "/courses",
  },
  {
    title: "Personalized AI Tutoring",
    description: "Get personalized help and guidance from our AI tutors.",
    image: "/interconnected-learning-paths.png",
    alt: "AI tutor assisting a student",
    ctaText: "Try AI Tutor",
    ctaLink: "/ai-tutor",
  },
  {
    title: "Empowering Educators",
    description: "Create and share your expertise with a global community of learners.",
    image: "/online-wisdom.png",
    alt: "Teacher creating a course",
    ctaText: "Become an Educator",
    ctaLink: "/educator/register",
  },
  {
    title: "Explore Endless Subjects",
    description: "From science to history, discover courses in every subject imaginable.",
    image: "/diverse-students-browsing-course-catalog.png",
    alt: "Students exploring course categories",
    ctaText: "Browse Categories",
    ctaLink: "/categories",
  },
]

// Stats card component
function StatsCard({ icon, value, label, iconColor = "text-primary" }) {
  return (
    <Card className="border shadow-sm">
      <CardContent className="flex flex-col items-center justify-center p-3 md:p-6 text-center">
        <div className={`mb-1 md:mb-2 ${iconColor}`}>{icon}</div>
        <p className="text-xl md:text-3xl font-bold">{value}</p>
        <p className="text-xs md:text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}

// Course card component
function CourseCard({ id, title, description, progress, image, isAP }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="relative">
        <img src={image || "/placeholder.svg"} alt={title} className="h-36 md:h-48 w-full object-cover" />
        {isAP && <Badge className="absolute right-2 top-2 bg-primary text-white text-xs">AP Course</Badge>}
      </div>
      <div className="p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-bold line-clamp-1">{title}</h3>
        <p className="mb-3 md:mb-4 mt-1 text-xs md:text-sm text-muted-foreground line-clamp-2">{description}</p>

        <div className="mb-1 flex justify-between text-xs md:text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{progress}% Complete</span>
        </div>

        <Button size="sm" className="w-full md:size-md" asChild>
          <Link href={`/courses/${id}/learn`}>Continue</Link>
        </Button>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const isMobile = useIsMobile()

  // Auto-advance the hero slider
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearTimeout(timer)
  }, [currentSlide])

  // Animation variants for the hero content
  const heroVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  }

  // Mock data for stats cards
  const stats = {
    enrolledCourses: 5,
    learningTime: 12.5,
    completedLessons: 15,
    averageScore: 85,
  }

  // Mock data for featured courses
  const featuredCourses = getFeaturedCourses()

  return (
    <>
      {/* Hero Section */}
      <div className="relative w-full h-[600px] overflow-hidden rounded-xl">
        {slides.map((slide, index) => (
          <motion.div
            key={index}
            className="absolute top-0 left-0 w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: index === currentSlide ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img src={slide.image || "/placeholder.svg"} alt={slide.alt} className="object-cover w-full h-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-8">
              <motion.h2
                className="text-4xl font-bold mb-4"
                variants={heroVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {slide.title}
              </motion.h2>
              <motion.p
                className="text-lg mb-8"
                variants={heroVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                {slide.description}
              </motion.p>
              <motion.div
                variants={heroVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <Button size="lg" asChild>
                  <Link href={slide.ctaLink}>{slide.ctaText}</Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats Section */}
      <div className="container mx-auto p-6">
        <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            icon={<BookOpen className="h-6 w-6" />}
            value={stats.enrolledCourses}
            label="Enrolled Courses"
            iconColor="text-blue-500"
          />
          <StatsCard
            icon={<Clock className="h-6 w-6" />}
            value={`${stats.learningTime} hrs`}
            label="Learning Time"
            iconColor="text-purple-500"
          />
          <StatsCard
            icon={<Star className="h-6 w-6" />}
            value={stats.completedLessons}
            label="Completed Lessons"
            iconColor="text-teal-500"
          />
          <StatsCard
            icon={<Award className="h-6 w-6" />}
            value={`${stats.averageScore}%`}
            label="Average Score"
            iconColor="text-amber-500"
          />
        </div>

        {/* Featured Courses Section */}
        <h2 className="mb-6 text-2xl font-bold">Featured Courses</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCourses.map((course) => (
            <CourseCard
              key={course.id}
              id={course.slug}
              title={course.title}
              description={course.description}
              progress={0}
              image={course.thumbnail}
            />
          ))}
        </div>
      </div>
    </>
  )
}
