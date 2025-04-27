// Groq API Connection Test
require("dotenv").config()

const GROQ_API_KEY = process.env.GROQ_API_KEY

if (!GROQ_API_KEY) {
  console.error("Error: GROQ_API_KEY environment variable is not set")
  process.exit(1)
}

// Log the first and last 4 characters of the API key for verification
console.log(`Using Groq API key: ${GROQ_API_KEY.substring(0, 4)}...${GROQ_API_KEY.substring(GROQ_API_KEY.length - 4)}`)

// Verify API key format
if (!GROQ_API_KEY.startsWith("gsk_")) {
  console.warn('Warning: Groq API keys typically start with "gsk_". Your key may be invalid.')
}

// Test the models endpoint
async function testModelsEndpoint() {
  console.log("\nTesting Groq models endpoint...")

  try {
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    console.log(`Status: ${response.status} ${response.statusText}`)

    if (response.ok) {
      const data = await response.json()
      console.log("Success! Available models:")
      if (data.data && Array.isArray(data.data)) {
        data.data.forEach((model) => {
          console.log(`- ${model.id}`)
        })
      } else {
        console.log(JSON.stringify(data, null, 2))
      }
    } else {
      console.error("Error response:")
      try {
        const errorData = await response.json()
        console.error(JSON.stringify(errorData, null, 2))
      } catch (e) {
        const text = await response.text()
        console.error(text || "No response body")
      }
    }
  } catch (error) {
    console.error(`Network error: ${error.message}`)
  }
}

// Test a simple completion to verify full API functionality
async function testCompletion() {
  console.log("\nTesting Groq completion API...")

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "user",
            content: 'Say "Groq API test successful" if you can read this message.',
          },
        ],
        max_tokens: 50,
      }),
    })

    console.log(`Status: ${response.status} ${response.statusText}`)

    if (response.ok) {
      const data = await response.json()
      console.log("Success! Response:")
      if (data.choices && data.choices[0] && data.choices[0].message) {
        console.log(data.choices[0].message.content)
      } else {
        console.log(JSON.stringify(data, null, 2))
      }
    } else {
      console.error("Error response:")
      try {
        const errorData = await response.json()
        console.error(JSON.stringify(errorData, null, 2))
      } catch (e) {
        const text = await response.text()
        console.error(text || "No response body")
      }
    }
  } catch (error) {
    console.error(`Network error: ${error.message}`)
  }
}

// Run the tests
async function runTests() {
  await testModelsEndpoint()
  await testCompletion()

  console.log("\nTests completed. Check the results above for any errors.")
}

runTests()
