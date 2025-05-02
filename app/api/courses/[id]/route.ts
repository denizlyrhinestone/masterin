import { type NextRequest, NextResponse } from "next/server"
import type { Course, CourseModule, CourseLesson, CourseReview, InstructorDetails } from "@/types/course"

// Mock data for a detailed course
const generateDetailedCourse = (id: string): Course => {
  // Base course data
  const baseCourse: Course = {
    id,
    title: `Advanced ${id === "1" ? "Web Development" : id === "2" ? "AI and Machine Learning" : "Programming"} Masterclass`,
    description: "A comprehensive course covering all aspects of modern development techniques and best practices.",
    instructor: id === "1" ? "Sarah Johnson" : id === "2" ? "Michael Chen" : "David Wilson",
    category: id === "1" ? "Computer Science" : id === "2" ? "Data Science" : "Computer Science",
    level: id === "1" ? "Intermediate" : id === "2" ? "Advanced" : "All Levels",
    duration: `${8 + Number(id)} weeks`,
    price: 49.99 + Number(id) * 10,
    rating: 4.5 + (Number(id) % 5) * 0.1,
    enrolledCount: 1000 + Number(id) * 100,
    thumbnailUrl:
      id === "1"
        ? "/course-web-development.png"
        : id === "2"
          ? "/course-ai-fundamentals.png"
          : `/placeholder.svg?height=400&width=600&query=course ${id}`,
    tags:
      id === "1"
        ? ["HTML", "CSS", "JavaScript", "React"]
        : id === "2"
          ? ["Python", "Machine Learning", "AI", "Data Science"]
          : ["Programming", "Computer Science", "Software Development"],
    updatedAt: new Date(Date.now() - Number(id) * 1000000).toISOString(),
    language: "English",
    certificateIncluded: true,
    lastUpdated: new Date(Date.now() - Number(id) * 1000000).toISOString(),
  }

  // Generate curriculum
  const modules: CourseModule[] = []
  const moduleCount = 5 + (Number(id) % 3)
  let totalLessons = 0

  for (let i = 1; i <= moduleCount; i++) {
    const lessons: CourseLesson[] = []
    const lessonCount = 3 + (i % 4)

    for (let j = 1; j <= lessonCount; j++) {
      const lessonTypes: CourseLesson["type"][] = ["video", "quiz", "assignment", "reading"]
      const lesson: CourseLesson = {
        id: `${id}-${i}-${j}`,
        title: `Lesson ${j}: ${j === 1 ? "Introduction to" : j === 2 ? "Understanding" : j === 3 ? "Advanced" : "Mastering"} ${i === 1 ? "Fundamentals" : i === 2 ? "Core Concepts" : i === 3 ? "Advanced Techniques" : i === 4 ? "Best Practices" : "Real-world Applications"}`,
        duration: `${j * 7 + i * 3}:00`,
        type: lessonTypes[(i + j) % 4],
        isFree: j === 1 && i === 1,
        description: j === 1 ? "An overview of what you'll learn in this module." : undefined,
      }
      lessons.push(lesson)
    }

    totalLessons += lessons.length

    const module: CourseModule = {
      id: `${id}-${i}`,
      title: `Module ${i}: ${i === 1 ? "Getting Started" : i === 2 ? "Core Principles" : i === 3 ? "Advanced Concepts" : i === 4 ? "Professional Techniques" : "Mastery and Application"}`,
      description: i === 1 ? "Learn the fundamentals and set up your development environment." : undefined,
      duration: `${i * 2}h ${30 + i * 10}m`,
      lessons,
    }
    modules.push(module)
  }

  // Generate instructor details
  const instructorDetails: InstructorDetails = {
    id: `instructor-${id}`,
    name: baseCourse.instructor,
    avatar:
      id === "1" ? "/thoughtful-instructor.png" : id === "2" ? "/confident-leader.png" : "/focused-professional.png",
    bio: `${baseCourse.instructor} is a seasoned professional with over ${10 + Number(id)} years of experience in the industry. Specializing in ${baseCourse.category}, they have helped thousands of students master complex concepts through clear, practical instruction.`,
    title:
      id === "1"
        ? "Senior Web Developer & Educator"
        : id === "2"
          ? "AI Researcher & Professor"
          : "Software Engineer & Technical Lead",
    rating: baseCourse.rating,
    coursesCount: 5 + Number(id),
    studentsCount: baseCourse.enrolledCount * 3,
    reviewsCount: baseCourse.enrolledCount / 2,
    website: `https://example.com/${baseCourse.instructor.toLowerCase().replace(" ", "")}`,
    social: {
      twitter: `https://twitter.com/${baseCourse.instructor.toLowerCase().replace(" ", "")}`,
      linkedin: `https://linkedin.com/in/${baseCourse.instructor.toLowerCase().replace(" ", "")}`,
      github: `https://github.com/${baseCourse.instructor.toLowerCase().replace(" ", "")}`,
    },
  }

  // Generate reviews
  const reviews: CourseReview[] = []
  const reviewCount = 20 + Number(id) * 5

  for (let i = 1; i <= reviewCount; i++) {
    const names = [
      "Alex Thompson",
      "Jamie Rivera",
      "Jordan Smith",
      "Taylor Johnson",
      "Casey Williams",
      "Morgan Brown",
      "Riley Davis",
      "Quinn Miller",
      "Avery Wilson",
      "Blake Martinez",
    ]
    const comments = [
      "This course exceeded my expectations. The content is well-structured and easy to follow.",
      "I've learned so much in such a short time. Highly recommended for anyone looking to improve their skills.",
      "The instructor explains complex concepts in a way that's easy to understand. Great course!",
      "Very practical course with real-world examples. I'm already applying what I've learned.",
      "Excellent content and presentation. The exercises really helped reinforce the concepts.",
      "This course has been instrumental in advancing my career. Thank you!",
      "Well-paced and comprehensive. I appreciate the attention to detail.",
      "The instructor's enthusiasm makes learning enjoyable. Great experience overall.",
      "I've taken many courses on this subject, and this is by far the best one.",
      "Clear explanations and practical examples. Exactly what I was looking for.",
    ]

    const review: CourseReview = {
      id: `${id}-review-${i}`,
      userId: `user-${i}`,
      userName: names[i % names.length],
      userAvatar: `/placeholder.svg?height=100&width=100&query=avatar ${i}`,
      rating: 3 + (i % 3),
      comment: comments[i % comments.length],
      date: new Date(Date.now() - i * 86400000).toISOString(),
      helpful: i % 10,
    }

    // Add instructor response to some reviews
    if (i % 7 === 0) {
      review.response = {
        from: baseCourse.instructor,
        comment: "Thank you for your feedback! I'm glad you found the course helpful.",
        date: new Date(Date.now() - i * 86400000 + 172800000).toISOString(),
      }
    }

    reviews.push(review)
  }

  // Calculate total duration
  const totalHours = modules.reduce((total, module) => {
    const [hours, minutes] = module.duration.split("h ")
    return total + Number.parseInt(hours) + Number.parseInt(minutes) / 60
  }, 0)

  // Add additional details to the base course
  return {
    ...baseCourse,
    longDescription: `
      This comprehensive ${baseCourse.title} course is designed to take you from the fundamentals to advanced concepts in ${baseCourse.category}. 
      
      You'll start by learning the core principles and gradually progress to more complex topics. By the end of this course, you'll have the skills and confidence to build professional-grade projects and advance your career.
      
      Whether you're looking to upskill for your current job or transition to a new role, this course provides the practical knowledge and hands-on experience you need to succeed.
    `,
    objectives: [
      `Master the fundamentals of ${baseCourse.category}`,
      "Build real-world projects for your portfolio",
      "Understand industry best practices and workflows",
      "Gain confidence in solving complex problems",
      "Learn how to collaborate effectively with teams",
    ],
    requirements: [
      baseCourse.level === "Beginner"
        ? "No prior experience required"
        : `Basic understanding of ${baseCourse.category}`,
      "A computer with internet access",
      "Willingness to practice and complete exercises",
    ],
    curriculum: {
      modules,
      totalDuration: `${totalHours.toFixed(0)}h ${((totalHours % 1) * 60).toFixed(0)}m`,
      totalLessons,
    },
    reviews,
    instructorDetails,
    relatedCourseIds: ["1", "2", "3", "4", "5"].filter((cid) => cid !== id).slice(0, 3),
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id

  // Simulate server processing delay (remove in production)
  // await new Promise(resolve => setTimeout(resolve, 500));

  try {
    const course = generateDetailedCourse(id)
    return NextResponse.json(course)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch course details" }, { status: 500 })
  }
}
