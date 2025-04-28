import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import GroqTestClient from "./client-component"
import Loading from "./loading"

export const dynamic = "force-dynamic"

export default function GroqTestPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Groq API Test</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Groq API Connection Test</CardTitle>
          <CardDescription>Test your connection to the Groq API</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Loading />}>
            <GroqTestClient />
          </Suspense>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 border rounded-lg shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">About Groq API</h2>
            <p className="text-gray-500 mb-4">Understanding the Groq API and its capabilities</p>

            <div className="prose dark:prose-invert max-w-none">
              <p>
                Groq is a high-performance inference engine designed for running large language models with exceptional
                speed. The Groq API allows you to integrate these capabilities into your applications.
              </p>

              <h3>Key Features:</h3>
              <ul>
                <li>Ultra-fast inference times</li>
                <li>Support for popular LLM models</li>
                <li>Simple REST API interface</li>
                <li>Streaming responses</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border rounded-lg shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">Setup Instructions</h2>
            <p className="text-gray-500 mb-4">How to configure your Groq API integration</p>

            <ol className="list-decimal pl-5 space-y-2">
              <li>Create an account at Groq Console</li>
              <li>Generate an API key from your account settings</li>
              <li>Add the API key to your environment variables as GROQ_API_KEY</li>
              <li>Restart your application</li>
            </ol>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md mt-4 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start">
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-300">Security Note</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-200 mt-1">
                    Always keep your API keys secure and never expose them in client-side code.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', function() {
              const container = document.getElementById('groq-test-container');
              
              if (container) {
                // Create test form
                const form = document.createElement('form');
                form.className = 'space-y-4';
                form.innerHTML = \`
                  <div>
                    <label for="prompt" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Test Prompt</label>
                    <textarea 
                      id="prompt" 
                      rows="3" 
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800"
                      placeholder="Enter a test prompt here..."
                    >Hello, this is a test message. Please respond with a short greeting.</textarea>
                  </div>
                  
                  <div>
                    <button 
                      type="submit" 
                      class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                    >
                      Run Test
                    </button>
                  </div>
                  
                  <div id="status-container" class="hidden">
                    <div class="flex items-center space-x-2 mb-2">
                      <div id="status-indicator" class="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span id="status-text" class="text-sm font-medium">Testing connection...</span>
                    </div>
                    <div id="status-details" class="text-sm text-gray-600 dark:text-gray-400"></div>
                  </div>
                  
                  <div id="result-container" class="hidden mt-4">
                    <h3 class="text-lg font-medium mb-2">API Response:</h3>
                    <div class="bg-gray-50 dark:bg-gray-900 p-4 rounded-md border border-gray-200 dark:border-gray-800">
                      <pre id="result-content" class="whitespace-pre-wrap text-sm overflow-x-auto"></pre>
                    </div>
                  </div>
                \`;
                
                // Replace loading indicator with form
                container.innerHTML = '';
                container.appendChild(form);
                
                // Handle form submission
                form.addEventListener('submit', async function(e) {
                  e.preventDefault();
                  
                  const promptInput = document.getElementById('prompt');
                  const statusContainer = document.getElementById('status-container');
                  const statusIndicator = document.getElementById('status-indicator');
                  const statusText = document.getElementById('status-text');
                  const statusDetails = document.getElementById('status-details');
                  const resultContainer = document.getElementById('result-container');
                  const resultContent = document.getElementById('result-content');
                  
                  // Show status
                  statusContainer.classList.remove('hidden');
                  statusIndicator.className = 'w-3 h-3 rounded-full bg-yellow-500';
                  statusText.textContent = 'Testing connection...';
                  statusDetails.textContent = 'Sending request to Groq API...';
                  resultContainer.classList.add('hidden');
                  
                  try {
                    const startTime = Date.now();
                    
                    const response = await fetch('/api/test-groq', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        prompt: promptInput.value,
                      }),
                    });
                    
                    const responseTime = Date.now() - startTime;
                    const data = await response.json();
                    
                    if (response.ok) {
                      statusIndicator.className = 'w-3 h-3 rounded-full bg-green-500';
                      statusText.textContent = 'Connection successful!';
                      statusDetails.textContent = \`Response received in \${responseTime}ms\`;
                      
                      resultContainer.classList.remove('hidden');
                      resultContent.textContent = JSON.stringify(data, null, 2);
                    } else {
                      statusIndicator.className = 'w-3 h-3 rounded-full bg-red-500';
                      statusText.textContent = 'Connection failed';
                      statusDetails.textContent = data.error || 'Unknown error occurred';
                    }
                  } catch (error) {
                    statusIndicator.className = 'w-3 h-3 rounded-full bg-red-500';
                    statusText.textContent = 'Connection error';
                    statusDetails.textContent = error.message || 'Failed to connect to API';
                  }
                });
              }
            });
          `,
        }}
      />
    </div>
  )
}
