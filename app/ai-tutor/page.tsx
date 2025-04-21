import { AITutorInterface } from "@/components/ai-chat/ai-tutor-interface"

export const metadata = {
  title: "AI Tutor | Masterin",
  description: "Get personalized help with your studies from our AI tutor.",
}

export default function AITutorPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">AI Tutor</h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          Get personalized help with your studies. Our AI tutor is available 24/7 to answer your questions and guide
          your learning.
        </p>
      </div>
      <AITutorInterface />
    </div>
  )
}
