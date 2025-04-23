import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Download, Video, ExternalLink } from "lucide-react"

export default function ResourcesPage() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Learning{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Resources
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Explore our collection of free learning materials, guides, and tools to support your educational journey
            </p>
          </div>
        </div>
      </section>

      {/* Study Guides Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8">Study Guides & Cheatsheets</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Python Programming Cheatsheet",
                description: "A comprehensive reference guide covering Python syntax, functions, and best practices.",
                image: "/placeholder.svg?height=200&width=400&query=python code syntax",
                category: "Programming",
                downloads: "12,345",
                link: "/resources/python-cheatsheet",
              },
              {
                title: "Data Science Fundamentals Guide",
                description: "Key concepts, formulas, and techniques for data analysis and visualization.",
                image: "/placeholder.svg?height=200&width=400&query=data science formulas",
                category: "Data Science",
                downloads: "8,721",
                link: "/resources/data-science-guide",
              },
              {
                title: "Machine Learning Algorithms Overview",
                description: "A visual guide to common machine learning algorithms and their applications.",
                image: "/placeholder.svg?height=200&width=400&query=machine learning algorithms diagram",
                category: "AI & ML",
                downloads: "9,876",
                link: "/resources/ml-algorithms",
              },
            ].map((resource, index) => (
              <Card key={index} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={resource.image || "/placeholder.svg"}
                    alt={resource.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs px-2 py-1 rounded-full">
                      {resource.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{resource.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <Download className="w-4 h-4 mr-1" />
                      {resource.downloads} downloads
                    </span>
                    <Link href={resource.link}>
                      <Button variant="outline" size="sm" className="flex items-center">
                        Download PDF
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/resources/study-guides">
              <Button variant="ghost">
                View All Study Guides
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Video Tutorials Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8">Video Tutorials</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Introduction to Neural Networks",
                description: "Learn the basics of neural networks and how they form the foundation of deep learning.",
                image: "/placeholder.svg?height=200&width=400&query=neural network visualization",
                duration: "32 min",
                instructor: "Dr. Michael Rodriguez",
                views: "45,678",
                link: "/resources/videos/neural-networks-intro",
              },
              {
                title: "Web Development Crash Course",
                description: "A quick introduction to HTML, CSS, and JavaScript for beginners.",
                image: "/placeholder.svg?height=200&width=400&query=web development code",
                duration: "45 min",
                instructor: "Jessica Williams",
                views: "38,912",
                link: "/resources/videos/web-dev-crash-course",
              },
              {
                title: "Data Visualization Best Practices",
                description: "Learn how to create effective and informative data visualizations.",
                image: "/placeholder.svg?height=200&width=400&query=data visualization charts",
                duration: "28 min",
                instructor: "Dr. Sarah Chen",
                views: "29,345",
                link: "/resources/videos/data-viz-best-practices",
              },
            ].map((video, index) => (
              <Card key={index} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative h-48">
                  <Image src={video.image || "/placeholder.svg"} alt={video.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white bg-opacity-80 flex items-center justify-center">
                      <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-purple-600 border-b-8 border-b-transparent ml-1"></div>
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{video.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{video.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Instructor: {video.instructor}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <Video className="w-4 h-4 mr-1" />
                      {video.views} views
                    </span>
                  </div>
                  <Link href={video.link}>
                    <Button className="w-full">Watch Video</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/resources/videos">
              <Button variant="ghost">
                View All Videos
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Practice Exercises Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8">Practice Exercises</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Python Coding Challenges",
                description: "A collection of programming exercises to test and improve your Python skills.",
                image: "/placeholder.svg?height=200&width=400&query=python coding challenge",
                difficulty: "Beginner to Advanced",
                exercises: 48,
                link: "/resources/exercises/python-challenges",
              },
              {
                title: "Data Analysis Projects",
                description: "Real-world data analysis scenarios to practice your analytical skills.",
                image: "/placeholder.svg?height=200&width=400&query=data analysis project",
                difficulty: "Intermediate",
                exercises: 24,
                link: "/resources/exercises/data-analysis",
              },
              {
                title: "Machine Learning Problems",
                description: "Hands-on machine learning exercises with datasets and solution guides.",
                image: "/placeholder.svg?height=200&width=400&query=machine learning exercise",
                difficulty: "Intermediate to Advanced",
                exercises: 36,
                link: "/resources/exercises/machine-learning",
              },
            ].map((exercise, index) => (
              <Card key={index} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={exercise.image || "/placeholder.svg"}
                    alt={exercise.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{exercise.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{exercise.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Difficulty: {exercise.difficulty}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{exercise.exercises} exercises</span>
                  </div>
                  <Link href={exercise.link}>
                    <Button className="w-full">Start Practicing</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/resources/exercises">
              <Button variant="ghost">
                View All Exercises
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* External Resources Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8">Recommended External Resources</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Khan Academy",
                description: "Free world-class education for anyone, anywhere. Covers math, science, and more.",
                image: "/placeholder.svg?height=60&width=120&query=khan academy logo",
                category: "General Education",
                link: "https://www.khanacademy.org/",
              },
              {
                title: "Kaggle",
                description: "Platform for data science competitions, datasets, and notebooks.",
                image: "/placeholder.svg?height=60&width=120&query=kaggle logo",
                category: "Data Science",
                link: "https://www.kaggle.com/",
              },
              {
                title: "MIT OpenCourseWare",
                description:
                  "Free publication of MIT course materials that reflects almost all the undergraduate and graduate subjects taught at MIT.",
                image: "/placeholder.svg?height=60&width=120&query=mit opencourseware logo",
                category: "Higher Education",
                link: "https://ocw.mit.edu/",
              },
              {
                title: "GitHub",
                description: "Platform for version control and collaboration for software projects.",
                image: "/placeholder.svg?height=60&width=120&query=github logo",
                category: "Programming",
                link: "https://github.com/",
              },
            ].map((resource, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-16 h-16 flex-shrink-0 mr-4">
                      <Image
                        src={resource.image || "/placeholder.svg"}
                        alt={resource.title}
                        width={64}
                        height={64}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{resource.title}</h3>
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                          {resource.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{resource.description}</p>
                    </div>
                  </div>
                  <div className="mt-4 text-right">
                    <a href={resource.link} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="flex items-center">
                        Visit Website
                        <ExternalLink className="ml-2 w-3 h-3" />
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-purple-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Stay Updated with New Resources</h2>
            <p className="text-xl mb-8 text-purple-100">
              Subscribe to our newsletter to receive weekly updates on new learning resources and tips.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button size="lg" variant="secondary" className="px-8">
                Subscribe Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 border-white text-white hover:bg-white hover:text-purple-600"
              >
                Browse All Resources
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
