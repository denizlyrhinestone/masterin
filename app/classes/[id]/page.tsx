import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getCourseViews } from "@/lib/course-views"
import { CourseViews } from "@/components/course-views"
import { CourseProgress } from "@/components/course-progress"
import { recordCourseView } from "@/lib/recommendations"
import { ReminderButton } from "@/components/reminder-button"
import { CourseMaterials } from "@/components/course-materials"

// This would typically come from a database
const classes = {
  "web-development": {
    id: "web-development",
    title: "Full-Stack Web Development",
    instructor: "Sarah Johnson",
    category: "Programming",
    level: "Intermediate",
    duration: "12 weeks",
    price: 299,
    rating: 4.8,
    students: 1245,
    imageUrl: "/images/classes/web-development.jpg",
    description: `
      This comprehensive course covers everything you need to know to become a full-stack web developer. 
      You'll learn front-end technologies like HTML, CSS, JavaScript, and React, as well as back-end 
      technologies like Node.js, Express, and MongoDB. By the end of this course, you'll be able to 
      build complete web applications from scratch.
    `,
    topics: [
      "HTML, CSS, and JavaScript fundamentals",
      "React and modern front-end development",
      "Node.js and Express for back-end development",
      "MongoDB and database design",
      "Authentication and authorization",
      "Deployment and DevOps basics",
    ],
  },
  "machine-learning": {
    id: "machine-learning",
    title: "Machine Learning Fundamentals",
    instructor: "Dr. Michael Chen",
    category: "Data Science",
    level: "Advanced",
    duration: "10 weeks",
    price: 399,
    rating: 4.9,
    students: 987,
    imageUrl: "/images/classes/machine-learning.jpg",
    description: `
      Dive into the world of machine learning with this advanced course. You'll learn the mathematical 
      foundations of machine learning algorithms, how to implement them from scratch, and how to use 
      popular libraries like scikit-learn and TensorFlow. This course includes hands-on projects to 
      apply your knowledge to real-world problems.
    `,
    topics: [
      "Supervised and unsupervised learning",
      "Neural networks and deep learning",
      "Natural language processing",
      "Computer vision",
      "Reinforcement learning",
      "Model deployment and monitoring",
    ],
  },
  "ui-design": {
    id: "ui-design",
    title: "UI/UX Design Principles",
    instructor: "Emma Rodriguez",
    category: "Design",
    level: "Beginner",
    duration: "8 weeks",
    price: 249,
    rating: 4.7,
    students: 1532,
    imageUrl: "/images/classes/ui-design.jpg",
    description: `
      Learn the principles of effective UI/UX design in this beginner-friendly course. You'll discover 
      how to create intuitive, accessible, and visually appealing interfaces that users love. The course 
      covers design theory, user research, wireframing, prototyping, and usability testing.
    `,
    topics: [
      "Design principles and color theory",
      "User research and personas",
      "Wireframing and prototyping",
      "Interaction design",
      "Usability testing",
      "Design systems and documentation",
    ],
  },
  "python-programming": {
    id: "python-programming",
    title: "Python for Data Analysis",
    instructor: "James Wilson",
    category: "Programming",
    level: "Intermediate",
    duration: "6 weeks",
    price: 199,
    rating: 4.6,
    students: 2156,
    imageUrl: "/images/classes/python-programming.jpg",
    description: `
      Master Python for data analysis in this intermediate course. You'll learn how to use libraries like 
      NumPy, Pandas, and Matplotlib to analyze and visualize data. The course includes real-world projects 
      to help you build a portfolio of data analysis work.
    `,
    topics: [
      "Python fundamentals for data analysis",
      "Data manipulation with NumPy and Pandas",
      "Data visualization with Matplotlib and Seaborn",
      "Statistical analysis",
      "Data cleaning and preprocessing",
      "Exploratory data analysis",
    ],
  },
}

export default async function ClassPage({ params }: { params: { id: string } }) {
  const classData = classes[params.id as keyof typeof classes]

  if (!classData) {
    notFound()
  }

  // Get initial view count from Redis
  const initialViews = await getCourseViews(params.id)

  // For demo purposes, we'll use a fixed user ID
  // In a real app, this would come from authentication
  const userId = "demo-user-123"

  // Record that this user viewed this course (for recommendations)
  await recordCourseView(userId, params.id)

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left column - Image and enrollment */}
          <div className="md:w-2/5">
            <div className="relative h-64 md:h-80 w-full rounded-lg overflow-hidden mb-6">
              <Image
                src={classData.imageUrl || "/placeholder.svg"}
                alt={classData.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <div className="text-3xl font-bold mb-2">${classData.price}</div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-600">{classData.duration}</span>
                <CourseViews courseId={params.id} initialViews={initialViews} />
              </div>

              {/* Course progress component */}
              <CourseProgress userId={userId} courseId={params.id} totalLessons={10} />

              <div className="flex flex-col gap-4 mt-4">
                <Button variant="outline" className="w-full">
                  Add to Wishlist
                </Button>

                {/* Reminder button */}
                <ReminderButton userId={userId} courseId={params.id} courseTitle={classData.title} />
              </div>
            </div>
          </div>

          {/* Right column - Course details */}
          <div className="md:w-3/5">
            <div className="mb-2">
              <Link href={`/categories/${classData.category.toLowerCase()}`} className="text-blue-600 hover:underline">
                {classData.category}
              </Link>
              <span className="mx-2">•</span>
              <span className="text-gray-600">{classData.level}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{classData.title}</h1>
            <div className="flex items-center mb-6">
              <div className="flex items-center mr-4">
                <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <span>{classData.rating}</span>
              </div>
              <div className="text-gray-600">{classData.students.toLocaleString()} students</div>
            </div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Instructor</h2>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold mr-3">
                  {classData.instructor.charAt(0)}
                </div>
                <div>
                  <div className="font-medium">{classData.instructor}</div>
                  <div className="text-sm text-gray-600">Expert Instructor</div>
                </div>
              </div>
            </div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{classData.description}</p>
            </div>
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">What You'll Learn</h2>
              <ul className="space-y-2">
                {classData.topics.map((topic, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Course Materials Section */}
            <CourseMaterials courseId={params.id} isInstructor={true} />
          </div>
        </div>
      </div>
    </main>
  )
}
