/**
 * Validates an OpenAI API key format
 * Note: This only checks format, not if the key is active
 */
export function isValidOpenAIKey(key: string | undefined): boolean {
  if (!key) return false

  // OpenAI API keys typically start with "sk-" and are 51 characters long
  return key.startsWith("sk-") && key.length > 40
}

/**
 * Performs a lightweight test call to verify an OpenAI API key is working
 */
export async function testOpenAIKey(key: string): Promise<{ valid: boolean; error?: string }> {
  try {
    // Make a minimal API call to test the key
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      // Short timeout to avoid hanging
      signal: AbortSignal.timeout(5000),
    })

    if (response.ok) {
      return { valid: true }
    } else {
      const data = await response.json()
      return {
        valid: false,
        error: data.error?.message || `API error: ${response.status}`,
      }
    }
  } catch (error: any) {
    return {
      valid: false,
      error: error.message || "Unknown error validating API key",
    }
  }
}
