import { NextResponse } from "next/server"

export async function GET() {
  const courses = [
    {
      id: 1,
      slug: "sample-course",
      title: "Sample Course: Introduction to Learning",
      description: "A comprehensive sample course to demonstrate platform capabilities",
      image: "/course-placeholder.png",
      instructor: "John Doe",
      duration: "4 weeks",
      level: "Beginner",
      price: 49.99,
      rating: 4.5,
      reviewCount: 120,
      enrolledCount: 1500,
    },
    {
      id: 2,
      slug: "advanced-course",
      title: "Advanced Learning Techniques",
      description: "Take your skills to the next level with advanced concepts",
      image: "/course-placeholder.png",
      instructor: "Jane Smith",
      duration: "6 weeks",
      level: "Advanced",
      price: 79.99,
      rating: 4.7,
      reviewCount: 85,
      enrolledCount: 950,
    },
  ]

  return NextResponse.json({ courses })
}
