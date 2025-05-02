"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, ChevronRight, Sparkles, Target, BookOpen, Clock, TrendingUp } from "lucide-react"
import type { Course } from "../types/course"

interface StudentInterest {
  id: string
  name: string
}

interface StudentSkill {
  id: string
  name: string
  level: "developing" | "proficient" | "advanced"
}

interface StudentProfile {
  interests: StudentInterest[]
  skills: StudentSkill[]
  recentCourses: string[]
  gradeLevel: string
  learningStyle: string[]
}

export function CourseRecommendations({
  courses,
  studentProfile,
}: {
  courses: Course[]
  studentProfile?: StudentProfile
}) {
  const [activeTab, setActiveTab] = useState("personalized")

  // Default student profile if none is provided
  const defaultProfile: StudentProfile = {
    interests: [
      { id: "math", name: "Mathematics" },
      { id: "coding", name: "Computer Programming" },
      { id: "creative", name: "Creative Writing" },
    ],
    skills: [
      { id: "algebra", name: "Algebra", level: "proficient" },
      { id: "reading", name: "Reading Comprehension", level: "advanced" },
      { id: "science", name: "Scientific Inquiry", level: "developing" },
    ],
    recentCourses: ["pre-algebra", "intro-programming", "creative-writing"],
    gradeLevel: "7-8",
    learningStyle: ["visual", "hands-on"],
  }

  const profile = studentProfile || defaultProfile

  // Memoize recommended courses to prevent recalculation on every render
  const personalizedCourses = useMemo(() => {
    // Simulated AI recommendation algorithm
    const scoredCourses = courses.map((course) => {
      let score = 0

      // Match by interests
      profile.interests.forEach((interest) => {
        if (
          course.title.toLowerCase().includes(interest.name.toLowerCase()) ||
          course.description.toLowerCase().includes(interest.name.toLowerCase()) ||
          course.category.toLowerCase().includes(interest.name.toLowerCase()) ||
          (course.tags && course.tags.some((tag) => tag.toLowerCase().includes(interest.name.toLowerCase())))
        ) {
          score += 2
        }
      })

      // Match by grade level
      if (course.gradeLevel === profile.gradeLevel) {
        score += 3
      } else if (course.gradeLevel.includes(profile.gradeLevel.split("-")[0])) {
        score += 1
      }

      // Avoid recently taken courses
      if (profile.recentCourses.includes(course.id)) {
        score -= 10 // Strongly discourage recommending courses already taken
      }

      // Boost courses with AI features that match learning style
      if (
        profile.learningStyle.includes("visual") &&
        course.aiFeatures.some(
          (feature) => feature.toLowerCase().includes("visual") || feature.toLowerCase().includes("simulator"),
        )
      ) {
        score += 1.5
      }

      if (
        profile.learningStyle.includes("hands-on") &&
        course.aiFeatures.some(
          (feature) =>
            feature.toLowerCase().includes("interactive") ||
            feature.toLowerCase().includes("practice") ||
            feature.toLowerCase().includes("lab"),
        )
      ) {
        score += 1.5
      }

      return { ...course, score }
    })

    // Sort by score and take top 6
    return scoredCourses
      .sort((a, b) => b.score - a.score)
      .filter((course) => course.score > 0)
      .slice(0, 6)
  }, [courses, profile])

  // Memoize other course lists
  const skillBuildingCourses = useMemo(() => {
    // Find courses that help with developing skills
    const developingSkills = profile.skills
      .filter((skill) => skill.level === "developing")
      .map((skill) => skill.name.toLowerCase())

    return courses
      .filter((course) =>
        developingSkills.some(
          (skill) =>
            course.description.toLowerCase().includes(skill) ||
            (course.tags && course.tags.some((tag) => tag.toLowerCase().includes(skill))),
        ),
      )
      .slice(0, 6)
  }, [courses, profile.skills])

  const trendingCourses = useMemo(() => {
    // In a real app, this would be based on actual enrollment data
    // For demo purposes, we'll just filter courses marked as popular
    return courses.filter((course) => course.popular).slice(0, 6)
  }, [courses])

  const nextStepCourses = useMemo(() => {
    // Recommend logical next courses based on completed courses
    // This is a simplified version of what would be a more complex algorithm
    const recommendedIds = []

    if (profile.recentCourses.includes("pre-algebra")) {
      recommendedIds.push("intro-algebra")
    }

    if (profile.recentCourses.includes("intro-programming")) {
      recommendedIds.push("web-development")
    }

    if (profile.recentCourses.includes("creative-writing")) {
      recommendedIds.push("composition-rhetoric")
    }

    // Add some grade-appropriate courses to fill out the recommendations
    const gradeLevelCourses = courses
      .filter((course) => course.gradeLevel === profile.gradeLevel)
      .filter((course) => !profile.recentCourses.includes(course.id))
      .slice(0, 6 - recommendedIds.length)

    return [...courses.filter((course) => recommendedIds.includes(course.id)), ...gradeLevelCourses]
  }, [courses, profile.gradeLevel, profile.recentCourses])

  return (
    <div className="mb-12 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 p-6 rounded-xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <h2 className="text-2xl font-bold">AI-Powered Course Recommendations</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          Personalized course suggestions based on your interests, learning style, and academic goals
        </p>
      </div>

      <Tabs defaultValue="personalized" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-2" aria-label="Recommendation categories">
          <TabsTrigger value="personalized" className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span>Personalized</span>
          </TabsTrigger>
          <TabsTrigger value="skill-building" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span>Skill Building</span>
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-1">
            <Sparkles className="h-4 w-4" />
            <span>Trending</span>
          </TabsTrigger>
          <TabsTrigger value="next-steps" className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4" />
            <span>Next Steps</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personalized">
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-1">Personalized For You</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Courses selected based on your interests and learning preferences
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personalizedCourses.map((course) => (
              <RecommendationCard
                key={course.id}
                course={course}
                reasonTags={["Matches your interests", "Grade-appropriate", "Aligns with learning style"]}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="skill-building">
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-1">Skill Building Recommendations</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Courses to help strengthen your developing skills
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skillBuildingCourses.map((course) => (
              <RecommendationCard
                key={course.id}
                course={course}
                reasonTags={["Builds critical skills", "Addresses learning gaps", "Interactive practice"]}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trending">
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-1">Trending Courses</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Popular courses other students in your grade are taking
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingCourses.map((course) => (
              <RecommendationCard
                key={course.id}
                course={course}
                reasonTags={["Highly rated", "Popular in your grade", "In-demand skills"]}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="next-steps">
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-1">Recommended Next Steps</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Based on courses you've already completed</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nextStepCourses.map((course) => (
              <RecommendationCard
                key={course.id}
                course={course}
                reasonTags={["Logical next step", "Builds on prior knowledge", "Continues your learning path"]}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-5 w-5 text-purple-500" />
          <h3 className="font-medium">How We Generate Your Recommendations</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          Our AI analyzes multiple factors to provide personalized course recommendations:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <BookOpen className="h-4 w-4 text-blue-500 mt-0.5" />
            <div>
              <span className="font-medium">Learning Profile</span>
              <p className="text-gray-500 dark:text-gray-400">Your interests, strengths, and learning style</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-blue-500 mt-0.5" />
            <div>
              <span className="font-medium">Academic History</span>
              <p className="text-gray-500 dark:text-gray-400">Courses you've completed and your performance</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Target className="h-4 w-4 text-blue-500 mt-0.5" />
            <div>
              <span className="font-medium">Educational Goals</span>
              <p className="text-gray-500 dark:text-gray-400">Your academic objectives and career interests</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RecommendationCard({
  course,
  reasonTags,
}: {
  course: Course & { score?: number }
  reasonTags: string[]
}) {
  // Use thumbnailUrl consistently, falling back to thumbnail if needed
  const imageUrl = course.thumbnailUrl || course.thumbnail || "/placeholder.svg"

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-all duration-200 border-purple-100 dark:border-purple-900/50">
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={course.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          crossOrigin="anonymous"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {course.popular && <Badge className="bg-yellow-500 hover:bg-yellow-600">Popular</Badge>}
          {course.new && <Badge className="bg-green-500 hover:bg-green-600">New</Badge>}
        </div>
        <div className="absolute top-2 left-2">
          <Badge className="bg-purple-500 hover:bg-purple-600 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Recommended
          </Badge>
        </div>
      </div>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between mb-1">
          <Badge variant="outline" className="text-xs">
            Grades {course.gradeLevel}
          </Badge>
          <span className="text-xs text-gray-500">{course.category}</span>
        </div>
        <CardTitle className="text-lg">{course.title}</CardTitle>
        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
      </CardHeader>
      <CardContent className="px-4 py-2 flex-grow">
        <div className="space-y-2">
          <p className="text-sm font-medium">Why we recommend this:</p>
          <div className="flex flex-wrap gap-1">
            {reasonTags.map((reason, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {reason}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-2">
        <Button className="w-full">
          View Course
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  )
}
