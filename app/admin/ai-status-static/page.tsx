export const dynamic = "force-static"

export default function AIStatusStaticPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">AI Service Status</h1>

      <div className="bg-white dark:bg-gray-800 border rounded-lg shadow-sm mb-6 p-6">
        <h2 className="text-xl font-semibold mb-2">Groq API Status</h2>
        <p className="text-gray-500 mb-4">Check the status of the Groq API integration</p>

        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-4">
            To check the Groq API status interactively, please use our dedicated testing page:
          </p>
          <a
            href="/groq-test"
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors inline-block"
          >
            Go to Groq API Test Page
          </a>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-2">AI Configuration Guide</h2>
        <p className="text-gray-500 mb-4">How to set up and configure the AI service</p>

        <div className="space-y-4">
          <h3 className="font-medium">Setting up Groq API</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Create an account at Groq Console</li>
            <li>Generate an API key from your account settings</li>
            <li>Add the API key to your environment variables as GROQ_API_KEY</li>
            <li>Restart your application</li>
          </ol>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md mt-4 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start">
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-300">Important Note</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-200 mt-1">
                  Keep your API key secure and never expose it in client-side code. The key should only be used in
                  server-side API routes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
