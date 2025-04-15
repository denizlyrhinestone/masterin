import { AiTutor } from "@/components/ai-tutor"

export default function AiTutorPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">AI Learning Assistant</h1>
        <p className="text-lg text-gray-700 mb-8">
          Ask questions, get explanations, and receive personalized learning recommendations from our AI tutor.
        </p>
        <AiTutor />
      </div>
    </main>
  )
}
