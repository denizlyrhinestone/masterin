import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function AiFeaturePreview() {
  return (
    <section className="py-8">
      <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-none overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-4 text-indigo-900">Meet Your AI Learning Assistant</h2>
              <p className="text-lg mb-6 text-indigo-700">
                Our AI-powered learning assistant helps you master concepts faster, answers your questions, and provides
                personalized learning recommendations.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  "Get instant answers to your questions",
                  "Receive personalized learning recommendations",
                  "Practice with AI-generated exercises",
                  "Get feedback on your assignments",
                ].map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                <Link href="/ai-tutor">Try AI Tutor Now</Link>
              </Button>
            </div>
            <div className="flex-1 relative">
              <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.5 2.25m0 0v5.8a2.25 2.25 0 01-1.5 2.25m0 0a2.25 2.25 0 01-2.25 0m0 0a2.25 2.25 0 01-1.5-2.25m3 0v-5.8a2.25 2.25 0 00-1.5-2.25"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold">AI Tutor</h3>
                    <p className="text-xs text-gray-500">Always ready to help</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-indigo-50 rounded-lg p-3 text-sm">
                    <p className="font-medium text-indigo-800">How do I solve quadratic equations?</p>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 text-sm">
                    <p>
                      To solve a quadratic equation in the form ax² + bx + c = 0, you can use the quadratic formula:
                    </p>
                    <p className="mt-2 font-medium">x = (-b ± √(b² - 4ac)) / 2a</p>
                    <p className="mt-2">Would you like me to walk through an example with you?</p>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-3 text-sm">
                    <p className="font-medium text-indigo-800">Yes, please show me with x² + 5x + 6 = 0</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
