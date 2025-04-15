"use client"

import { useState } from "react"
import { EnhancedAiTutor } from "@/components/enhanced-ai-tutor"
import { CourseContextSelector } from "@/components/course-context-selector"

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

export default function EnhancedTutorWithSelectorPage() {
  const [courseContext, setCourseContext] = useState<{
    title: string
    description: string
    currentTopic: string
    learningObjectives: string[]
  } | null>(null)

  const handleContextChange = (courseId: string, topicId: string) => {
    const course = coursesData[courseId as keyof typeof coursesData]
    if (course && course.topics[topicId as keyof typeof course.topics]) {
      setCourseContext({
        title: course.title,
        description: course.description,
        currentTopic: topicId,
        learningObjectives: course.topics[topicId as keyof typeof course.topics],
      })
    }
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Enhanced AI Learning Assistant</h1>
          <CourseContextSelector onContextChange={handleContextChange} />
        </div>

        <p className="text-lg text-gray-700 mb-8">
          Ask questions, get explanations, and receive personalized learning recommendations from our advanced AI tutor.
        </p>

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
