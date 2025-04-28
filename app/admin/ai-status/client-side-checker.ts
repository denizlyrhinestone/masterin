export default function initClientChecker(container: HTMLElement) {
  // Create modal
  const modal = document.createElement("div")
  modal.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"

  // Create modal content
  const modalContent = document.createElement("div")
  modalContent.className =
    "bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"

  // Create close button
  const closeButton = document.createElement("button")
  closeButton.className = "absolute top-4 right-4 text-gray-500 hover:text-gray-700"
  closeButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  `
  closeButton.addEventListener("click", () => {
    document.body.removeChild(modal)
  })

  // Create content
  const content = document.createElement("div")
  content.innerHTML = `
    <h2 class="text-2xl font-bold mb-4">Groq API Status Check</h2>
    <div class="mb-4">
      <div class="flex items-center mb-2">
        <div class="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
        <span>Checking API key configuration...</span>
      </div>
      <div id="api-key-status" class="pl-6 text-sm text-gray-600">Verifying environment variables...</div>
    </div>
    <div class="mb-4">
      <div class="flex items-center mb-2">
        <div class="w-4 h-4 rounded-full bg-gray-300 mr-2" id="connection-indicator"></div>
        <span>Testing API connection...</span>
      </div>
      <div id="connection-status" class="pl-6 text-sm text-gray-600">Waiting for API key verification...</div>
    </div>
    <div class="mb-4">
      <div class="flex items-center mb-2">
        <div class="w-4 h-4 rounded-full bg-gray-300 mr-2" id="response-indicator"></div>
        <span>Validating response...</span>
      </div>
      <div id="response-status" class="pl-6 text-sm text-gray-600">Waiting for connection test...</div>
    </div>
    <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md hidden" id="response-container">
      <h3 class="font-medium mb-2">API Response:</h3>
      <pre id="response-content" class="text-xs whitespace-pre-wrap overflow-x-auto"></pre>
    </div>
    <div class="mt-6">
      <button id="retry-button" class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
        Retry Check
      </button>
    </div>
  `

  // Append elements
  modalContent.appendChild(closeButton)
  modalContent.appendChild(content)
  modal.appendChild(modalContent)
  container.appendChild(modal)

  // Add retry functionality
  const retryButton = modalContent.querySelector("#retry-button")
  if (retryButton) {
    retryButton.addEventListener("click", () => {
      checkGroqStatus(modalContent)
    })
  }

  // Start the check
  checkGroqStatus(modalContent)
}

async function checkGroqStatus(container: HTMLElement) {
  // Get elements
  const apiKeyStatus = container.querySelector("#api-key-status")
  const connectionIndicator = container.querySelector("#connection-indicator")
  const connectionStatus = container.querySelector("#connection-status")
  const responseIndicator = container.querySelector("#response-indicator")
  const responseStatus = container.querySelector("#response-status")
  const responseContainer = container.querySelector("#response-container")
  const responseContent = container.querySelector("#response-content")

  // Reset states
  if (connectionIndicator) connectionIndicator.className = "w-4 h-4 rounded-full bg-gray-300 mr-2"
  if (connectionStatus) connectionStatus.textContent = "Waiting for API key verification..."
  if (responseIndicator) responseIndicator.className = "w-4 h-4 rounded-full bg-gray-300 mr-2"
  if (responseStatus) responseStatus.textContent = "Waiting for connection test..."
  if (responseContainer) responseContainer.classList.add("hidden")

  // Check API key
  try {
    const keyResponse = await fetch("/api/check-groq")
    const keyData = await keyResponse.json()

    if (keyData.hasKey) {
      if (apiKeyStatus) {
        apiKeyStatus.textContent = "API key is configured ✓"
        apiKeyStatus.className = "pl-6 text-sm text-green-600"
      }

      // Test connection
      if (connectionIndicator) connectionIndicator.className = "w-4 h-4 rounded-full bg-yellow-500 mr-2"
      if (connectionStatus) connectionStatus.textContent = "Testing connection to Groq API..."

      try {
        const testStart = Date.now()
        const testResponse = await fetch("/api/test-groq", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: "Hello, this is a test message. Please respond with a short greeting.",
          }),
        })
        const testEnd = Date.now()
        const responseTime = testEnd - testStart

        const testData = await testResponse.json()

        if (testResponse.ok) {
          if (connectionIndicator) connectionIndicator.className = "w-4 h-4 rounded-full bg-green-500 mr-2"
          if (connectionStatus) connectionStatus.textContent = `Connection successful (${responseTime}ms) ✓`
          if (responseIndicator) responseIndicator.className = "w-4 h-4 rounded-full bg-green-500 mr-2"
          if (responseStatus) responseStatus.textContent = "Valid response received ✓"
          if (responseContainer) responseContainer.classList.remove("hidden")
          if (responseContent) responseContent.textContent = JSON.stringify(testData, null, 2)
        } else {
          if (connectionIndicator) connectionIndicator.className = "w-4 h-4 rounded-full bg-red-500 mr-2"
          if (connectionStatus) connectionStatus.textContent = `Connection failed: ${testData.error || "Unknown error"}`
          if (responseIndicator) responseIndicator.className = "w-4 h-4 rounded-full bg-red-500 mr-2"
          if (responseStatus) responseStatus.textContent = "Failed to get valid response"
        }
      } catch (error) {
        if (connectionIndicator) connectionIndicator.className = "w-4 h-4 rounded-full bg-red-500 mr-2"
        if (connectionStatus)
          connectionStatus.textContent = `Connection error: ${error instanceof Error ? error.message : String(error)}`
        if (responseIndicator) responseIndicator.className = "w-4 h-4 rounded-full bg-red-500 mr-2"
        if (responseStatus) responseStatus.textContent = "Could not validate response"
      }
    } else {
      if (apiKeyStatus) {
        apiKeyStatus.textContent = "API key is not configured ✗"
        apiKeyStatus.className = "pl-6 text-sm text-red-600"
      }
      if (connectionIndicator) connectionIndicator.className = "w-4 h-4 rounded-full bg-red-500 mr-2"
      if (connectionStatus) connectionStatus.textContent = "Cannot test connection without API key"
      if (responseIndicator) responseIndicator.className = "w-4 h-4 rounded-full bg-red-500 mr-2"
      if (responseStatus) responseStatus.textContent = "Cannot validate response without connection"
    }
  } catch (error) {
    if (apiKeyStatus) {
      apiKeyStatus.textContent = `Error checking API key: ${error instanceof Error ? error.message : String(error)}`
      apiKeyStatus.className = "pl-6 text-sm text-red-600"
    }
    if (connectionIndicator) connectionIndicator.className = "w-4 h-4 rounded-full bg-red-500 mr-2"
    if (connectionStatus) connectionStatus.textContent = "Cannot test connection due to error"
    if (responseIndicator) responseIndicator.className = "w-4 h-4 rounded-full bg-red-500 mr-2"
    if (responseStatus) responseStatus.textContent = "Cannot validate response due to error"
  }
}
