import { EnhancedAiTutor } from "@/components/enhanced-ai-tutor"

// Sample course context - in a real app, this would come from your database
const sampleCourseContext = {
  title: "Introduction to Machine Learning",
  description: "A comprehensive introduction to machine learning concepts and applications",
  currentTopic: "Neural Networks",
  learningObjectives: [
    "Understand the structure and function of neural networks",
    "Learn about activation functions and their purposes",
    "Explore backpropagation and gradient descent",
    "Implement a simple neural network",
  ],
}

export default function EnhancedTutorPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Enhanced AI Learning Assistant</h1>
        <p className="text-lg text-gray-700 mb-8">
          Ask questions, get explanations, and receive personalized learning recommendations from our advanced AI tutor.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Current Learning Context</h2>
          <p className="text-blue-700 mb-1">
            <span className="font-medium">Course:</span> {sampleCourseContext.title}
          </p>
          <p className="text-blue-700 mb-1">
            <span className="font-medium">Topic:</span> {sampleCourseContext.currentTopic}
          </p>
          <p className="text-sm text-blue-600">
            The AI tutor will provide responses relevant to your current learning context.
          </p>
        </div>

        <EnhancedAiTutor courseContext={sampleCourseContext} />
      </div>
    </main>
  )
}
