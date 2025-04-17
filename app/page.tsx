import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Educational Platform</h1>

        <p className="text-gray-600 mb-8 text-center">
          Welcome to our educational platform. This application provides AI-powered tutoring and educational resources
          for students and educators.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">For Students</h2>
            <p className="text-gray-600 mb-4">
              Get help with your studies using our AI tutor. Ask questions and receive personalized guidance.
            </p>
            <Link
              href="/student"
              className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
            >
              Student Dashboard
            </Link>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">For Educators</h2>
            <p className="text-gray-600 mb-4">
              Create and manage educational content, track student progress, and customize learning experiences.
            </p>
            <Link
              href="/educator"
              className="block text-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
            >
              Educator Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-2">API Status</h3>
          <p className="text-gray-600">
            Check our{" "}
            <Link href="/api/health" className="text-blue-600 hover:underline">
              API health
            </Link>{" "}
            to ensure all systems are operational.
          </p>
        </div>
      </div>

      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Educational Platform. All rights reserved.</p>
      </footer>
    </div>
  )
}
