import { errorMonitor } from "./error-monitoring"
import { serviceHealthMonitor, ServiceType, ServiceStatus } from "./service-health"
import { featureFlags } from "./feature-flags"
import { ErrorCategory, ErrorSeverity } from "./error-handling"

// Initialize all services
export function initializeServices() {
  console.log("Initializing application services...")

  // Set up service health monitoring
  setupServiceHealthMonitoring()

  // Set up error monitoring alerts
  setupErrorMonitoringAlerts()

  // Set up feature flag listeners
  setupFeatureFlagListeners()

  console.log("Services initialized successfully")
}

// Set up service health monitoring
function setupServiceHealthMonitoring() {
  // OpenAI health check
  serviceHealthMonitor.scheduleHealthCheck(
    ServiceType.OPENAI,
    async () => {
      // Simple check to see if OpenAI API key is valid
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.length < 20) {
        return {
          status: ServiceStatus.OUTAGE,
          message: "OpenAI API key is missing or invalid",
        }
      }

      // In a real implementation, you would make a test call to the OpenAI API
      // For now, we'll just assume it's operational if the key exists
      return {
        status: ServiceStatus.OPERATIONAL,
        message: "OpenAI service is operational",
      }
    },
    60000, // Check every minute
  )

  // Groq health check
  serviceHealthMonitor.scheduleHealthCheck(
    ServiceType.GROQ,
    async () => {
      // Simple check to see if Groq API key is valid
      if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.length < 20) {
        return {
          status: ServiceStatus.OUTAGE,
          message: "Groq API key is missing or invalid",
        }
      }

      // In a real implementation, you would make a test call to the Groq API
      return {
        status: ServiceStatus.OPERATIONAL,
        message: "Groq service is operational",
      }
    },
    60000, // Check every minute
  )

  // XAI health check
  serviceHealthMonitor.scheduleHealthCheck(
    ServiceType.XAI,
    async () => {
      // Simple check to see if XAI API key is valid
      if (!process.env.XAI_API_KEY || process.env.XAI_API_KEY.length < 20) {
        return {
          status: ServiceStatus.OUTAGE,
          message: "XAI API key is missing or invalid",
        }
      }

      // In a real implementation, you would make a test call to the XAI API
      return {
        status: ServiceStatus.OPERATIONAL,
        message: "XAI service is operational",
      }
    },
    60000, // Check every minute
  )

  // Register status change callback
  serviceHealthMonitor.registerStatusChangeCallback((service, oldStatus, newStatus) => {
    console.log(`Service ${service} status changed from ${oldStatus} to ${newStatus}`)

    // Log error if service is degraded or down
    if (newStatus === ServiceStatus.DEGRADED || newStatus === ServiceStatus.OUTAGE) {
      errorMonitor.trackError(
        `Service ${service} is ${newStatus}`,
        "ServiceHealthMonitor",
        ErrorCategory.CONNECTIVITY,
        newStatus === ServiceStatus.OUTAGE ? ErrorSeverity.ERROR : ErrorSeverity.WARNING,
      )
    }
  })
}

// Set up error monitoring alerts
function setupErrorMonitoringAlerts() {
  // Register alert callback
  errorMonitor.registerAlertCallback((category, count) => {
    console.warn(`Error threshold exceeded for category ${category}: ${count} errors`)

    // In a real implementation, you would send alerts to an external service
  })
}

// Set up feature flag listeners
function setupFeatureFlagListeners() {
  // Register feature flag change listener
  featureFlags.registerChangeListener((feature, isEnabled) => {
    console.log(`Feature ${feature} is now ${isEnabled ? "enabled" : "disabled"}`)
  })
}

// Call this function in your app initialization
if (typeof window === "undefined") {
  // Only run on server
  initializeServices()
}
