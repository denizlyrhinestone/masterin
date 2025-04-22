import { ServiceType, ServiceStatus, serviceHealthMonitor } from "./service-health"

// Feature types
export enum FeatureType {
  AI_TUTOR = "ai_tutor",
  AI_STUDY_ASSISTANT = "ai_study_assistant",
  AI_WRITING_HELPER = "ai_writing_helper",
  AI_PROBLEM_SOLVER = "ai_problem_solver",
  COURSE_RECOMMENDATIONS = "course_recommendations",
  PERSONALIZED_LEARNING = "personalized_learning",
  COMMUNITY_FEATURES = "community_features",
  PROGRESS_TRACKING = "progress_tracking",
}

// Feature dependency configuration
interface FeatureDependency {
  service: ServiceType
  requiredStatus: ServiceStatus
  isCritical: boolean // If true, feature is disabled when dependency is not met
}

// Feature configuration
interface FeatureConfig {
  enabled: boolean
  dependencies: FeatureDependency[]
  fallbackEnabled: boolean // Whether to show fallback content when feature is disabled
  description: string
}

// Feature flag service
export class FeatureFlags {
  private static instance: FeatureFlags
  private features: Map<FeatureType, FeatureConfig> = new Map()
  private overrides: Map<FeatureType, boolean> = new Map()
  private changeListeners: Array<(feature: FeatureType, isEnabled: boolean) => void> = []

  private constructor() {
    this.initializeFeatures()
    this.setupServiceHealthListeners()
  }

  // Singleton pattern
  public static getInstance(): FeatureFlags {
    if (!FeatureFlags.instance) {
      FeatureFlags.instance = new FeatureFlags()
    }
    return FeatureFlags.instance
  }

  // Initialize feature configurations
  private initializeFeatures(): void {
    // AI Tutor
    this.features.set(FeatureType.AI_TUTOR, {
      enabled: true,
      dependencies: [
        { service: ServiceType.OPENAI, requiredStatus: ServiceStatus.OPERATIONAL, isCritical: false },
        { service: ServiceType.GROQ, requiredStatus: ServiceStatus.OPERATIONAL, isCritical: false },
        { service: ServiceType.XAI, requiredStatus: ServiceStatus.OPERATIONAL, isCritical: false },
      ],
      fallbackEnabled: true,
      description: "AI-powered tutoring for personalized learning assistance",
    })

    // AI Study Assistant
    this.features.set(FeatureType.AI_STUDY_ASSISTANT, {
      enabled: true,
      dependencies: [{ service: ServiceType.OPENAI, requiredStatus: ServiceStatus.OPERATIONAL, isCritical: true }],
      fallbackEnabled: false,
      description: "AI-powered study planning and organization",
    })

    // AI Writing Helper
    this.features.set(FeatureType.AI_WRITING_HELPER, {
      enabled: true,
      dependencies: [{ service: ServiceType.OPENAI, requiredStatus: ServiceStatus.OPERATIONAL, isCritical: true }],
      fallbackEnabled: false,
      description: "AI-powered writing assistance and feedback",
    })

    // AI Problem Solver
    this.features.set(FeatureType.AI_PROBLEM_SOLVER, {
      enabled: true,
      dependencies: [
        { service: ServiceType.OPENAI, requiredStatus: ServiceStatus.OPERATIONAL, isCritical: false },
        { service: ServiceType.GROQ, requiredStatus: ServiceStatus.OPERATIONAL, isCritical: false },
      ],
      fallbackEnabled: true,
      description: "Step-by-step problem solving for math and science",
    })

    // Course Recommendations
    this.features.set(FeatureType.COURSE_RECOMMENDATIONS, {
      enabled: true,
      dependencies: [
        { service: ServiceType.OPENAI, requiredStatus: ServiceStatus.OPERATIONAL, isCritical: false },
        { service: ServiceType.DATABASE, requiredStatus: ServiceStatus.OPERATIONAL, isCritical: true },
      ],
      fallbackEnabled: true,
      description: "Personalized course recommendations",
    })

    // Personalized Learning
    this.features.set(FeatureType.PERSONALIZED_LEARNING, {
      enabled: true,
      dependencies: [
        { service: ServiceType.OPENAI, requiredStatus: ServiceStatus.OPERATIONAL, isCritical: false },
        { service: ServiceType.DATABASE, requiredStatus: ServiceStatus.OPERATIONAL, isCritical: true },
      ],
      fallbackEnabled: true,
      description: "Personalized learning paths and content",
    })

    // Community Features
    this.features.set(FeatureType.COMMUNITY_FEATURES, {
      enabled: true,
      dependencies: [
        { service: ServiceType.DATABASE, requiredStatus: ServiceStatus.OPERATIONAL, isCritical: true },
        { service: ServiceType.AUTHENTICATION, requiredStatus: ServiceStatus.OPERATIONAL, isCritical: true },
      ],
      fallbackEnabled: false,
      description: "Community forums, discussions, and collaboration",
    })

    // Progress Tracking
    this.features.set(FeatureType.PROGRESS_TRACKING, {
      enabled: true,
      dependencies: [{ service: ServiceType.DATABASE, requiredStatus: ServiceStatus.OPERATIONAL, isCritical: true }],
      fallbackEnabled: false,
      description: "Track learning progress and achievements",
    })
  }

  // Set up listeners for service health changes
  private setupServiceHealthListeners(): void {
    serviceHealthMonitor.registerStatusChangeCallback((service, oldStatus, newStatus) => {
      // Re-evaluate all features that depend on this service
      for (const [featureType, config] of this.features.entries()) {
        const dependency = config.dependencies.find((dep) => dep.service === service)
        if (dependency) {
          // Check if feature status should change
          const wasEnabled = this.isFeatureEnabled(featureType)
          const shouldBeEnabled = this.evaluateFeatureStatus(featureType)

          if (wasEnabled !== shouldBeEnabled) {
            this.notifyChangeListeners(featureType, shouldBeEnabled)
          }
        }
      }
    })
  }

  // Evaluate if a feature should be enabled based on dependencies
  private evaluateFeatureStatus(feature: FeatureType): boolean {
    // Check for manual override
    if (this.overrides.has(feature)) {
      return this.overrides.get(feature)!
    }

    const config = this.features.get(feature)
    if (!config || !config.enabled) {
      return false
    }

    // Check dependencies
    for (const dependency of config.dependencies) {
      const serviceHealth = serviceHealthMonitor.getServiceHealth(dependency.service)

      // If service status is unknown, assume it's available
      if (!serviceHealth) {
        continue
      }

      // For critical dependencies, the service must meet the required status
      if (dependency.isCritical) {
        const statusValue = this.getStatusValue(serviceHealth.status)
        const requiredValue = this.getStatusValue(dependency.requiredStatus)

        if (statusValue < requiredValue) {
          return false
        }
      }
      // For non-critical dependencies, we continue even if they're not met
    }

    return true
  }

  // Convert status to numeric value for comparison
  private getStatusValue(status: ServiceStatus): number {
    switch (status) {
      case ServiceStatus.OPERATIONAL:
        return 3
      case ServiceStatus.DEGRADED:
        return 2
      case ServiceStatus.OUTAGE:
        return 0
      case ServiceStatus.UNKNOWN:
      default:
        return 1
    }
  }

  // Check if a feature is enabled
  public isFeatureEnabled(feature: FeatureType): boolean {
    return this.evaluateFeatureStatus(feature)
  }

  // Check if fallback content should be shown for a feature
  public shouldShowFallback(feature: FeatureType): boolean {
    const config = this.features.get(feature)
    if (!config) {
      return false
    }

    return !this.isFeatureEnabled(feature) && config.fallbackEnabled
  }

  // Override a feature's enabled status
  public overrideFeature(feature: FeatureType, enabled: boolean): void {
    const previousValue = this.isFeatureEnabled(feature)
    this.overrides.set(feature, enabled)

    if (previousValue !== enabled) {
      this.notifyChangeListeners(feature, enabled)
    }
  }

  // Clear an override
  public clearOverride(feature: FeatureType): void {
    const previousValue = this.isFeatureEnabled(feature)
    this.overrides.delete(feature)

    const newValue = this.isFeatureEnabled(feature)
    if (previousValue !== newValue) {
      this.notifyChangeListeners(feature, newValue)
    }
  }

  // Register a change listener
  public registerChangeListener(listener: (feature: FeatureType, isEnabled: boolean) => void): void {
    this.changeListeners.push(listener)
  }

  // Notify change listeners
  private notifyChangeListeners(feature: FeatureType, isEnabled: boolean): void {
    for (const listener of this.changeListeners) {
      try {
        listener(feature, isEnabled)
      } catch (e) {
        console.error("Error in feature flag change listener:", e)
      }
    }
  }

  // Get all feature statuses
  public getAllFeatureStatuses(): Record<FeatureType, { enabled: boolean; fallbackAvailable: boolean }> {
    const result: Record<string, { enabled: boolean; fallbackAvailable: boolean }> = {}

    for (const [feature, config] of this.features.entries()) {
      result[feature] = {
        enabled: this.isFeatureEnabled(feature),
        fallbackAvailable: config.fallbackEnabled,
      }
    }

    return result as Record<FeatureType, { enabled: boolean; fallbackAvailable: boolean }>
  }
}

// Initialize the feature flags service
export const featureFlags = FeatureFlags.getInstance()
