import { Suspense } from "react"
import { CourseRecommendations } from "@/components/course-recommendations"
import { LoadingSpinner } from "@/components/loading-spinner"

// Make this page dynamic since it uses Redis which requires dynamic rendering
export const dynamic = "force-dynamic"

export default function DashboardPage() {
  // For demo purposes, we'll use a fixed user ID
  // In a real app, this would come from authentication
  const userId = "demo-user-123"

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Your Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - User stats */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border p-6 shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Web Development</span>
                  <span>40%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "40%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Python Programming</span>
                  <span>65%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "65%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>UI Design</span>
                  <span>20%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "20%" }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Learning Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">3</div>
                <div className="text-sm text-gray-600">Courses in progress</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">12</div>
                <div className="text-sm text-gray-600">Hours learned</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">5</div>
                <div className="text-sm text-gray-600">Quizzes completed</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">2</div>
                <div className="text-sm text-gray-600">Certificates earned</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Recommendations and activity */}
        <div className="lg:col-span-2">
          <Suspense fallback={<LoadingSpinner />}>
            <CourseRecommendations userId={userId} />
          </Suspense>

          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-4 border-b">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-500">Yesterday</span>
                </div>
                <p className="mt-1">Completed lesson 3 in Web Development</p>
              </div>
              <div className="p-4 border-b">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-500">3 days ago</span>
                </div>
                <p className="mt-1">Started Python Programming course</p>
              </div>
              <div className="p-4 border-b">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-500">1 week ago</span>
                </div>
                <p className="mt-1">Earned Web Development Basics certificate</p>
              </div>
              <div className="p-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-500">2 weeks ago</span>
                </div>
                <p className="mt-1">Completed UI Design quiz with 90% score</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
