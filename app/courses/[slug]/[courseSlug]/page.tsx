"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChevronLeft,
  Star,
  Clock,
  BarChart,
  Users,
  Award,
  CheckCircle,
  PlayCircle,
  FileText,
  MessageSquare,
  Share2,
  BookmarkPlus,
} from "lucide-react"

// All courses data
const allCourses = [
  // Technology courses
  {
    id: 1,
    title: "Complete Web Development Bootcamp",
    slug: "web-development-bootcamp",
    category: "Technology",
    categorySlug: "technology",
    image: "/placeholder.svg?height=400&width=800&text=Web+Development",
    instructor: "Sarah Johnson",
    instructorTitle: "Senior Web Developer & Educator",
    instructorImage: "/placeholder.svg?height=100&width=100&text=SJ",
    rating: 4.9,
    reviewCount: 2453,
    studentCount: 42156,
    level: "Beginner to Advanced",
    duration: "12 weeks",
    lectures: 124,
    description:
      "Learn HTML, CSS, JavaScript, React, Node.js and more. Build real-world projects and deploy them to the web.",
    longDescription:
      "This comprehensive bootcamp takes you from absolute beginner to professional web developer. You'll learn front-end and back-end technologies, including HTML5, CSS3, JavaScript, React, Node.js, Express, MongoDB, and more. Through hands-on projects and real-world applications, you'll build a professional portfolio that showcases your skills to potential employers. By the end of this course, you'll be able to develop, test, and deploy complete web applications.",
    featured: true,
    price: 129.99,
    whatYouWillLearn: [
      "Build responsive websites using HTML5, CSS3, and JavaScript",
      "Develop full-stack web applications with React and Node.js",
      "Work with databases like MongoDB and SQL",
      "Implement authentication and authorization in web apps",
      "Deploy applications to production environments",
      "Use modern development tools and workflows",
      "Debug and troubleshoot common web development issues",
      "Create a professional portfolio of web projects",
    ],
    courseContent: [
      {
        title: "Introduction to Web Development",
        lectures: 8,
        duration: "2 hours 15 minutes",
      },
      {
        title: "HTML Fundamentals",
        lectures: 12,
        duration: "3 hours 20 minutes",
      },
      {
        title: "CSS Styling and Layout",
        lectures: 15,
        duration: "4 hours 10 minutes",
      },
      {
        title: "JavaScript Programming",
        lectures: 18,
        duration: "5 hours 45 minutes",
      },
      {
        title: "Building Interactive Websites",
        lectures: 14,
        duration: "4 hours 30 minutes",
      },
      {
        title: "Introduction to React",
        lectures: 16,
        duration: "5 hours 15 minutes",
      },
      {
        title: "Server-side Development with Node.js",
        lectures: 14,
        duration: "4 hours 50 minutes",
      },
      {
        title: "Database Integration",
        lectures: 12,
        duration: "3 hours 40 minutes",
      },
      {
        title: "Authentication and Security",
        lectures: 8,
        duration: "2 hours 55 minutes",
      },
      {
        title: "Deployment and DevOps",
        lectures: 7,
        duration: "2 hours 20 minutes",
      },
    ],
  },
  // Data Science courses
  {
    id: 2,
    title: "Data Science Fundamentals",
    slug: "data-science-fundamentals",
    category: "Data Science",
    categorySlug: "data-science",
    image: "/placeholder.svg?height=400&width=800&text=Data+Science",
    instructor: "Michael Chen",
    instructorTitle: "Data Scientist & AI Researcher",
    instructorImage: "/placeholder.svg?height=100&width=100&text=MC",
    rating: 4.8,
    reviewCount: 1872,
    studentCount: 35842,
    level: "Intermediate",
    duration: "8 weeks",
    lectures: 86,
    description:
      "Master the essentials of data analysis, visualization, and machine learning with Python and real-world datasets.",
    longDescription:
      "This comprehensive course covers all the fundamentals of data science using Python. You'll learn data manipulation with pandas, visualization with matplotlib and seaborn, and machine learning with scikit-learn. Through hands-on projects with real-world datasets, you'll develop practical skills in data cleaning, exploratory data analysis, feature engineering, model selection, and evaluation. By the end of this course, you'll have a solid foundation in data science and be able to apply these techniques to your own datasets and problems.",
    featured: true,
    price: 149.99,
    whatYouWillLearn: [
      "Master data manipulation and analysis with pandas",
      "Create insightful data visualizations with matplotlib and seaborn",
      "Apply statistical methods to extract insights from data",
      "Build and evaluate machine learning models with scikit-learn",
      "Work with real-world datasets across various domains",
      "Implement supervised and unsupervised learning algorithms",
      "Perform feature engineering and selection",
      "Communicate data insights effectively",
    ],
    courseContent: [
      {
        title: "Introduction to Data Science",
        lectures: 6,
        duration: "1 hour 45 minutes",
      },
      {
        title: "Python for Data Science",
        lectures: 10,
        duration: "3 hours 10 minutes",
      },
      {
        title: "Data Manipulation with Pandas",
        lectures: 12,
        duration: "4 hours 20 minutes",
      },
      {
        title: "Data Visualization",
        lectures: 10,
        duration: "3 hours 30 minutes",
      },
      {
        title: "Statistical Analysis",
        lectures: 8,
        duration: "2 hours 50 minutes",
      },
      {
        title: "Introduction to Machine Learning",
        lectures: 12,
        duration: "4 hours 15 minutes",
      },
      {
        title: "Supervised Learning Algorithms",
        lectures: 14,
        duration: "5 hours 10 minutes",
      },
      {
        title: "Unsupervised Learning",
        lectures: 8,
        duration: "2 hours 45 minutes",
      },
      {
        title: "Feature Engineering",
        lectures: 6,
        duration: "2 hours 10 minutes",
      },
    ],
  },
]

export default function CourseDetailPage({
  params,
}: {
  params: { slug: string; courseSlug: string }
}) {
  const [course, setCourse] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    // Find the course based on the slug
    const foundCourse = allCourses.find((c) => c.categorySlug === params.slug && c.slug === params.courseSlug)
    setCourse(foundCourse || null)
  }, [params.slug, params.courseSlug])

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Course not found</h1>
        <p className="mb-8">The course you're looking for doesn't exist or has been moved.</p>
        <Button asChild>
          <Link href="/courses">Back to Courses</Link>
        </Button>
      </div>
    )
  }

  return (
    <main className="flex flex-col min-h-screen" id="main-content">
      {/* Course Header */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <Link
            href={`/courses/${params.slug}`}
            className="inline-flex items-center text-blue-100 hover:text-white mb-6"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to {course.category} courses
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <Badge variant="outline" className="mb-4 bg-blue-500/30 text-blue-50 border-blue-400/30">
                {course.category}
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-blue-100 mb-6">{course.description}</p>
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center">
                  <div className="flex items-center mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(course.rating) ? "text-yellow-400 fill-yellow-400" : "text-blue-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{course.rating}</span>
                  <span className="text-blue-200 ml-1">({course.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-200" />
                  <span>{course.studentCount.toLocaleString()} students</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-200" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center">
                  <BarChart className="h-5 w-5 mr-2 text-blue-200" />
                  <span>{course.level}</span>
                </div>
              </div>
              <div className="flex items-center">
                <div className="relative h-12 w-12 rounded-full overflow-hidden mr-3">
                  <Image
                    src={course.instructorImage || "/placeholder.svg"}
                    alt={course.instructor}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div>
                  <p className="font-medium">Created by {course.instructor}</p>
                  <p className="text-sm text-blue-200">{course.instructorTitle}</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <Card className="overflow-hidden">
                <div className="relative aspect-video w-full">
                  <Image
                    src={course.image || "/placeholder.svg"}
                    alt={course.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Button className="bg-white text-blue-600 hover:bg-blue-50">
                      <PlayCircle className="h-5 w-5 mr-2" /> Preview Course
                    </Button>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="mb-6">
                    <p className="text-3xl font-bold mb-1">${course.price}</p>
                    <p className="text-sm text-gray-500">Full lifetime access</p>
                  </div>
                  <div className="space-y-3">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Enroll Now</Button>
                    <Button variant="outline" className="w-full">
                      <BookmarkPlus className="h-4 w-4 mr-2" /> Add to Wishlist
                    </Button>
                  </div>
                  <div className="mt-6 space-y-4 text-sm">
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 mr-3 text-gray-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Course Duration</p>
                        <p className="text-gray-500">{course.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FileText className="h-5 w-5 mr-3 text-gray-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Course Content</p>
                        <p className="text-gray-500">
                          {course.lectures} lectures •{" "}
                          {course.courseContent.reduce((total: number, section: any) => total + section.lectures, 0)}{" "}
                          hours
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Award className="h-5 w-5 mr-3 text-gray-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Certificate</p>
                        <p className="text-gray-500">Certificate of completion</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-center">
                    <Button variant="ghost" size="sm" className="text-gray-500">
                      <Share2 className="h-4 w-4 mr-2" /> Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="instructor">Instructor</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h2 className="text-2xl font-bold mb-4">About This Course</h2>
                  <p className="text-gray-700 mb-6">{course.longDescription}</p>

                  <h3 className="text-xl font-bold mb-4">What You'll Learn</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                    {course.whatYouWillLearn.map((item: string, index: number) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <h3 className="text-xl font-bold mb-4">Requirements</h3>
                  <ul className="list-disc list-inside space-y-2 mb-8 text-gray-700">
                    <li>Basic computer skills</li>
                    <li>No prior programming experience required for beginners track</li>
                    <li>A computer with internet access</li>
                  </ul>

                  <h3 className="text-xl font-bold mb-4">This Course Is Perfect For</h3>
                  <ul className="list-disc list-inside space-y-2 mb-8 text-gray-700">
                    <li>Complete beginners with no prior experience</li>
                    <li>Intermediate developers looking to expand their skillset</li>
                    <li>Anyone interested in building modern web applications</li>
                    <li>Career changers looking to enter the tech industry</li>
                  </ul>
                </div>

                <div className="lg:col-span-1">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-4">Course Features</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b">
                          <span className="text-gray-600">Lectures</span>
                          <span className="font-medium">{course.lectures}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b">
                          <span className="text-gray-600">Duration</span>
                          <span className="font-medium">{course.duration}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b">
                          <span className="text-gray-600">Level</span>
                          <span className="font-medium">{course.level}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b">
                          <span className="text-gray-600">Language</span>
                          <span className="font-medium">English</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b">
                          <span className="text-gray-600">Certificate</span>
                          <span className="font-medium">Yes</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Last Updated</span>
                          <span className="font-medium">June 2023</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="curriculum" className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">Course Curriculum</h2>
                <p className="text-gray-700 mb-8">
                  This course includes {course.lectures} lectures spanning over{" "}
                  {course.courseContent.reduce((total: number, section: any) => {
                    const [hours, minutes] = section.duration.split(" hours ")
                    return total + Number.parseInt(hours)
                  }, 0)}{" "}
                  hours of on-demand video content.
                </p>

                <div className="space-y-4">
                  {course.courseContent.map((section: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="p-0">
                        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                          <h3 className="font-bold">
                            Section {index + 1}: {section.title}
                          </h3>
                          <div className="text-sm text-gray-500">
                            {section.lectures} lectures • {section.duration}
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center text-blue-600 cursor-pointer hover:underline">
                              <PlayCircle className="h-5 w-5 mr-2" />
                              <span>Introduction to {section.title}</span>
                              <Badge className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-200">Preview</Badge>
                            </div>
                            <div className="flex items-center text-gray-700">
                              <FileText className="h-5 w-5 mr-2 text-gray-500" />
                              <span>Key Concepts and Terminology</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                              <FileText className="h-5 w-5 mr-2 text-gray-500" />
                              <span>Practical Examples</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                              <FileText className="h-5 w-5 mr-2 text-gray-500" />
                              <span>Hands-on Exercise</span>
                            </div>
                            <div className="flex items-center text-gray-500">
                              <FileText className="h-5 w-5 mr-2" />
                              <span>+ {section.lectures - 4} more lectures</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="instructor" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1">
                  <div className="relative h-48 w-48 rounded-full overflow-hidden mx-auto">
                    <Image
                      src={course.instructorImage || "/placeholder.svg"}
                      alt={course.instructor}
                      fill
                      className="object-cover"
                      sizes="192px"
                    />
                  </div>
                </div>
                <div className="md:col-span-3">
                  <h2 className="text-2xl font-bold mb-2">{course.instructor}</h2>
                  <p className="text-gray-600 mb-4">{course.instructorTitle}</p>
                  <div className="flex items-center gap-6 mb-6">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="font-medium">{course.rating} Instructor Rating</span>
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="h-5 w-5 text-gray-500 mr-1" />
                      <span>{course.reviewCount} Reviews</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-gray-500 mr-1" />
                      <span>{course.studentCount.toLocaleString()} Students</span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-6">
                    {course.instructor} is a passionate educator and industry professional with over 10 years of
                    experience in {course.category.toLowerCase()}. They have worked with leading companies and have
                    helped thousands of students master complex technical skills through their practical, hands-on
                    teaching approach.
                  </p>
                  <p className="text-gray-700 mb-6">
                    Their teaching philosophy focuses on building real-world projects that help students develop
                    practical skills they can immediately apply in their careers. With a background in both industry and
                    education, they bring a unique perspective that bridges theoretical knowledge with practical
                    application.
                  </p>
                  <Button variant="outline">View Full Profile</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </main>
  )
}
