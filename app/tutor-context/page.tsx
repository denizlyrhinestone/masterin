"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { EnhancedAiTutor } from "@/components/enhanced-ai-tutor-simple"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"

// Sample courses data - in a real app, this would come from your API/database
const coursesData = {
  "ml-intro": {
    title: "Introduction to Machine Learning",
    description: "A comprehensive introduction to machine learning concepts and applications",
    topics: {
      "Supervised Learning": [
        "Understand classification and regression",
        "Learn about training and test datasets",
        "Explore evaluation metrics",
        "Implement supervised learning algorithms",
      ],
      "Unsupervised Learning": [
        "Understand clustering and dimensionality reduction",
        "Learn about K-means and hierarchical clustering",
        "Explore principal component analysis",
        "Implement unsupervised learning algorithms",
      ],
      "Neural Networks": [
        "Understand the structure and function of neural networks",
        "Learn about activation functions and their purposes",
        "Explore backpropagation and gradient descent",
        "Implement a simple neural network",
      ],
      "Decision Trees": [
        "Understand decision tree structure and function",
        "Learn about information gain and entropy",
        "Explore tree pruning techniques",
        "Implement decision trees and random forests",
      ],
    },
  },
  "web-dev": {
    title: "Full-Stack Web Development",
    description: "Learn to build modern web applications from front to back",
    topics: {
      "HTML & CSS Fundamentals": [
        "Understand HTML document structure",
        "Learn CSS selectors and properties",
        "Explore responsive design principles",
        "Implement layouts using flexbox and grid",
      ],
      "JavaScript Basics": [
        "Understand JavaScript syntax and data types",
        "Learn about functions, objects, and arrays",
        "Explore DOM manipulation",
        "Implement interactive web features",
      ],
      "React Framework": [
        "Understand React component architecture",
        "Learn about props and state management",
        "Explore hooks and context API",
        "Implement a single-page application",
      ],
      "Backend with Node.js": [
        "Understand server-side JavaScript",
        "Learn about Express.js framework",
        "Explore RESTful API design",
        "Implement a full-stack application",
      ],
    },
  },
  "data-science": {
    title: "Data Science Fundamentals",
    description: "Master the essential skills for analyzing and interpreting data",
    topics: {
      "Data Cleaning": [
        "Understand common data quality issues",
        "Learn techniques for handling missing values",
        "Explore outlier detection methods",
        "Implement data cleaning pipelines",
      ],
      "Exploratory Data Analysis": [
        "Understand descriptive statistics",
        "Learn about data distributions",
        "Explore correlation and covariance",
        "Implement EDA workflows",
      ],
      "Statistical Methods": [
        "Understand hypothesis testing",
        "Learn about confidence intervals",
        "Explore regression analysis",
        "Implement statistical tests",
      ],
      "Data Visualization": [
        "Understand principles of effective visualization",
        "Learn about different chart types",
        "Explore interactive visualization tools",
        "Implement dashboards and reports",
      ],
    },
  },
}

export default function TutorContextPage() {
  const [courseContext, setCourseContext] = useState<{
    title: string
    description: string
    currentTopic: string
    learningObjectives: string[]
  } | null>(null)

  const [showSelector, setShowSelector] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState("")
  const [selectedTopic, setSelectedTopic] = useState("")
  const [isClient, setIsClient] = useState(false)

  // Only render client-side components after mount
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourse(e.target.value)
    setSelectedTopic("")
  }

  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTopic(e.target.value)
  }

  const handleApply = () => {
    if (selectedCourse && selectedTopic) {
      const course = coursesData[selectedCourse as keyof typeof coursesData]
      if (course && course.topics[selectedTopic as keyof typeof course.topics]) {
        setCourseContext({
          title: course.title,
          description: course.description,
          currentTopic: selectedTopic,
          learningObjectives: course.topics[selectedTopic as keyof typeof course.topics],
        })
      }
      setShowSelector(false)
    }
  }

  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Enhanced AI Learning Assistant</h1>
          <p className="text-lg text-gray-700 mb-8">Loading...</p>
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Enhanced AI Learning Assistant</h1>
        <p className="text-lg text-gray-700 mb-8">
          Ask questions, get explanations, and receive personalized learning recommendations from our advanced AI tutor.
        </p>

        <div className="flex justify-end mb-6">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowSelector(!showSelector)}>
            <Settings className="h-4 w-4" />
            <span>Learning Context</span>
          </Button>
        </div>

        {showSelector && (
          <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Set Learning Context</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Course</label>
                <select value={selectedCourse} onChange={handleCourseChange} className="w-full p-2 border rounded-md">
                  <option value="">Select a course</option>
                  {Object.entries(coursesData).map(([id, course]) => (
                    <option key={id} value={id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Topic</label>
                <select
                  value={selectedTopic}
                  onChange={handleTopicChange}
                  disabled={!selectedCourse}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">{selectedCourse ? "Select a topic" : "Select a course first"}</option>
                  {selectedCourse &&
                    Object.keys(coursesData[selectedCourse as keyof typeof coursesData].topics).map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowSelector(false)}>
                  Cancel
                </Button>
                <Button onClick={handleApply} disabled={!selectedCourse || !selectedTopic}>
                  Apply Context
                </Button>
              </div>
            </div>
          </div>
        )}

        {courseContext ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Current Learning Context</h2>
            <p className="text-blue-700 mb-1">
              <span className="font-medium">Course:</span> {courseContext.title}
            </p>
            <p className="text-blue-700 mb-1">
              <span className="font-medium">Topic:</span> {courseContext.currentTopic}
            </p>
            <p className="text-sm text-blue-600">
              The AI tutor will provide responses relevant to your current learning context.
            </p>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">No Learning Context Selected</h2>
            <p className="text-yellow-700">
              Use the "Learning Context" button to select a course and topic for more relevant AI responses.
            </p>
          </div>
        )}

        <EnhancedAiTutor courseContext={courseContext || undefined} />
      </div>
    </main>
  )
}
