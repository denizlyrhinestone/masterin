// Simple AI Health Monitor

// Track AI service health
let aiServiceHealthy = true
let lastFailureTime = 0
const RECOVERY_PERIOD = 60000 // 1 minute recovery period

// Report an AI service failure
export function reportAiFailure(): void {
  aiServiceHealthy = false
  lastFailureTime = Date.now()
}

// Report an AI service success
export function reportAiSuccess(): void {
  aiServiceHealthy = true
}

// Check if the AI service is available
export function isAiServiceAvailable(): boolean {
  // Check if we should try the AI service again after failure
  const now = Date.now()
  if (!aiServiceHealthy && now - lastFailureTime > RECOVERY_PERIOD) {
    aiServiceHealthy = true
  }

  return aiServiceHealthy
}
