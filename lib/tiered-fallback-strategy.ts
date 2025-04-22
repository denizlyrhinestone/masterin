import { FallbackTrigger } from "./fallback-analyzer"
import { ErrorCodes } from "./error-handling"

// Fallback content types with more granularity
export enum FallbackContentType {
  SIMPLE_EXPLANATION = "simple_explanation", // Basic explanation of a concept
  STATIC_CONTENT = "static_content", // Pre-written content for common topics
  CACHED_RESPONSE = "cached_response", // Previously successful response
  ALTERNATIVE_SOURCE = "alternative_source", // Content from an alternative source
  USER_GUIDANCE = "user_guidance", // Guidance on how to rephrase or simplify
  INTERACTIVE_FALLBACK = "interactive_fallback", // Fallback that asks clarifying questions
  EDUCATIONAL_RESOURCE = "educational_resource", // Link to external resource
  SIMPLIFIED_MODEL = "simplified_model", // Response from a simpler model
  OFFLINE_CONTENT = "offline_content", // Content available without API
}

// Fallback tiers for progressive degradation
export enum FallbackTier {
  TIER_1 = "tier_1", // Minimal degradation - cached or alternative source
  TIER_2 = "tier_2", // Moderate degradation - simplified model or static content
  TIER_3 = "tier_3", // Significant degradation - simple explanations or guidance
  TIER_4 = "tier_4", // Severe degradation - offline content only
}

// Interface for tiered fallback content
export interface TieredFallbackContent {
  type: FallbackContentType
  tier: FallbackTier
  content: string
  metadata?: Record<string, any>
}

// Interface for tiered fallback strategy configuration
export interface TieredFallbackConfig {
  enableCaching: boolean
  cacheTTL: number // in milliseconds
  maxCacheSize: number
  preferredFallbackTypes: Record<FallbackTier, FallbackContentType[]>
  fallbackTierThresholds: {
    consecutiveErrors: Record<FallbackTier, number>
    responseTime: Record<FallbackTier, number>
  }
}

// Default tiered fallback strategy configuration
const DEFAULT_TIERED_FALLBACK_CONFIG: TieredFallbackConfig = {
  enableCaching: true,
  cacheTTL: 3600000, // 1 hour
  maxCacheSize: 100,
  preferredFallbackTypes: {
    [FallbackTier.TIER_1]: [
      FallbackContentType.CACHED_RESPONSE,
      FallbackContentType.ALTERNATIVE_SOURCE,
      FallbackContentType.SIMPLIFIED_MODEL,
    ],
    [FallbackTier.TIER_2]: [
      FallbackContentType.STATIC_CONTENT,
      FallbackContentType.INTERACTIVE_FALLBACK,
      FallbackContentType.EDUCATIONAL_RESOURCE,
    ],
    [FallbackTier.TIER_3]: [FallbackContentType.SIMPLE_EXPLANATION, FallbackContentType.USER_GUIDANCE],
    [FallbackTier.TIER_4]: [FallbackContentType.OFFLINE_CONTENT],
  },
  fallbackTierThresholds: {
    consecutiveErrors: {
      [FallbackTier.TIER_1]: 1, // 1+ consecutive errors
      [FallbackTier.TIER_2]: 3, // 3+ consecutive errors
      [FallbackTier.TIER_3]: 5, // 5+ consecutive errors
      [FallbackTier.TIER_4]: 10, // 10+ consecutive errors
    },
    responseTime: {
      [FallbackTier.TIER_1]: 5000, // 5+ seconds
      [FallbackTier.TIER_2]: 10000, // 10+ seconds
      [FallbackTier.TIER_3]: 15000, // 15+ seconds
      [FallbackTier.TIER_4]: 20000, // 20+ seconds
    },
  },
}

// Class to manage tiered fallback content strategies
export class TieredFallbackStrategy {
  private static instance: TieredFallbackStrategy
  private config: TieredFallbackConfig
  private cache: Map<string, { content: TieredFallbackContent; timestamp: number }> = new Map()
  private subjectSpecificContent: Record<string, Record<string, TieredFallbackContent[]>> = {}
  private triggerSpecificContent: Record<FallbackTrigger, TieredFallbackContent[]> = {}
  private errorCodeSpecificContent: Record<string, TieredFallbackContent[]> = {}
  private offlineContent: Record<string, Record<string, TieredFallbackContent[]>> = {}

  private constructor(config: Partial<TieredFallbackConfig> = {}) {
    this.config = { ...DEFAULT_TIERED_FALLBACK_CONFIG, ...config }
    this.initializeDefaultContent()
  }

  // Singleton pattern
  public static getInstance(config: Partial<TieredFallbackConfig> = {}): TieredFallbackStrategy {
    if (!TieredFallbackStrategy.instance) {
      TieredFallbackStrategy.instance = new TieredFallbackStrategy(config)
    }
    return TieredFallbackStrategy.instance
  }

  // Initialize default fallback content
  private initializeDefaultContent(): void {
    // Math subject - Tier 1 (minimal degradation)
    this.registerFallbackContent("math", "general", {
      type: FallbackContentType.ALTERNATIVE_SOURCE,
      tier: FallbackTier.TIER_1,
      content:
        "I'm currently using an alternative source for mathematics information. What specific math concept would you like to explore?",
    })

    // Math subject - Tier 2 (moderate degradation)
    this.registerFallbackContent("math", "general", {
      type: FallbackContentType.STATIC_CONTENT,
      tier: FallbackTier.TIER_2,
      content:
        "Mathematics is the study of numbers, quantities, and shapes. It helps us understand patterns and relationships in the world around us. What specific area of math are you interested in learning about?",
    })

    // Math subject - Tier 3 (significant degradation)
    this.registerFallbackContent("math", "general", {
      type: FallbackContentType.SIMPLE_EXPLANATION,
      tier: FallbackTier.TIER_3,
      content:
        "Mathematics involves working with numbers, shapes, and patterns. Could you tell me which specific math topic you'd like help with?",
    })

    // Math subject - Tier 4 (severe degradation)
    this.registerFallbackContent("math", "general", {
      type: FallbackContentType.OFFLINE_CONTENT,
      tier: FallbackTier.TIER_4,
      content:
        "I'm currently operating in offline mode with limited mathematics capabilities. Please try asking a very specific question about a basic math concept.",
    })

    // Math - Algebra - Multiple tiers
    this.registerFallbackContent("math", "algebra", {
      type: FallbackContentType.STATIC_CONTENT,
      tier: FallbackTier.TIER_2,
      content:
        "Algebra is a branch of mathematics that uses symbols and letters to represent numbers and quantities in formulas and equations. It helps us solve problems by finding unknown values. What specific algebraic concept would you like to learn about?",
    })

    this.registerFallbackContent("math", "algebra", {
      type: FallbackContentType.SIMPLE_EXPLANATION,
      tier: FallbackTier.TIER_3,
      content:
        "Algebra uses letters to represent unknown numbers. By manipulating equations, we can find what these unknown values are. What specific algebra problem are you working on?",
    })

    // Science subject - Multiple tiers
    this.registerFallbackContent("science", "general", {
      type: FallbackContentType.ALTERNATIVE_SOURCE,
      tier: FallbackTier.TIER_1,
      content:
        "I'm currently using an alternative source for science information. What specific scientific concept would you like to explore?",
    })

    this.registerFallbackContent("science", "general", {
      type: FallbackContentType.STATIC_CONTENT,
      tier: FallbackTier.TIER_2,
      content:
        "Science is the systematic study of the natural world through observation and experimentation. It helps us understand how things work and why things happen. What specific area of science interests you?",
    })

    this.registerFallbackContent("science", "general", {
      type: FallbackContentType.SIMPLE_EXPLANATION,
      tier: FallbackTier.TIER_3,
      content:
        "Science helps us understand the world through experiments and observation. What specific science topic would you like to learn about?",
    })

    // Trigger-specific fallbacks
    this.registerTriggerFallback(FallbackTrigger.RATE_LIMITED, {
      type: FallbackContentType.USER_GUIDANCE,
      tier: FallbackTier.TIER_2,
      content:
        "I'm currently experiencing high demand and can't process complex requests. Could you try asking a simpler question or breaking your question into smaller parts?",
    })

    this.registerTriggerFallback(FallbackTrigger.CONTEXT_EXCEEDED, {
      type: FallbackContentType.USER_GUIDANCE,
      tier: FallbackTier.TIER_2,
      content:
        "Your question and our conversation history have become quite lengthy for me to process. Could you ask a more focused question about a specific concept?",
    })

    this.registerTriggerFallback(FallbackTrigger.TIMEOUT, {
      type: FallbackContentType.USER_GUIDANCE,
      tier: FallbackTier.TIER_2,
      content:
        "It's taking longer than expected to process your question. Could you try asking a more specific question or breaking it into smaller parts?",
    })

    this.registerTriggerFallback(FallbackTrigger.API_UNAVAILABLE, {
      type: FallbackContentType.OFFLINE_CONTENT,
      tier: FallbackTier.TIER_4,
      content:
        "I'm currently unable to connect to my knowledge source. I can still help with basic concepts, but my capabilities are limited. What specific topic would you like to explore?",
    })

    // Error code specific fallbacks
    this.registerErrorCodeFallback(ErrorCodes.CONN_TIMEOUT, {
      type: FallbackContentType.USER_GUIDANCE,
      tier: FallbackTier.TIER_2,
      content:
        "I'm having trouble connecting to my knowledge source right now. While I work on reconnecting, could you try asking a more specific question or breaking your question into smaller parts?",
    })

    this.registerErrorCodeFallback(ErrorCodes.MODEL_CONTEXT_LENGTH_EXCEEDED, {
      type: FallbackContentType.USER_GUIDANCE,
      tier: FallbackTier.TIER_2,
      content:
        "Your question and our conversation history have become quite lengthy for me to process. Could you ask a more focused question about a specific concept you'd like me to explain?",
    })

    // Offline content for various subjects
    this.registerOfflineContent("math", "algebra", {
      type: FallbackContentType.OFFLINE_CONTENT,
      tier: FallbackTier.TIER_4,
      content:
        "In algebra, we use variables (like x and y) to represent unknown values. Basic algebraic operations include solving equations by isolating the variable. For example, to solve x + 5 = 10, we subtract 5 from both sides to get x = 5.",
    })

    this.registerOfflineContent("math", "geometry", {
      type: FallbackContentType.OFFLINE_CONTENT,
      tier: FallbackTier.TIER_4,
      content:
        "Geometry studies shapes, sizes, and properties of space. Key concepts include points, lines, angles, and shapes. For example, a triangle has three sides and its angles always sum to 180 degrees.",
    })

    this.registerOfflineContent("science", "physics", {
      type: FallbackContentType.OFFLINE_CONTENT,
      tier: FallbackTier.TIER_4,
      content:
        "Physics studies matter, energy, and their interactions. Newton's laws of motion are fundamental: an object at rest stays at rest unless acted upon by a force, force equals mass times acceleration, and for every action there is an equal and opposite reaction.",
    })
  }

  // Register fallback content for a subject and topic
  public registerFallbackContent(subject: string, topic: string, content: TieredFallbackContent): void {
    if (!this.subjectSpecificContent[subject]) {
      this.subjectSpecificContent[subject] = {}
    }

    if (!this.subjectSpecificContent[subject][topic]) {
      this.subjectSpecificContent[subject][topic] = []
    }

    this.subjectSpecificContent[subject][topic].push(content)
  }

  // Register fallback content for a specific trigger
  public registerTriggerFallback(trigger: FallbackTrigger, content: TieredFallbackContent): void {
    if (!this.triggerSpecificContent[trigger]) {
      this.triggerSpecificContent[trigger] = []
    }

    this.triggerSpecificContent[trigger].push(content)
  }

  // Register fallback content for a specific error code
  public registerErrorCodeFallback(errorCode: string, content: TieredFallbackContent): void {
    if (!this.errorCodeSpecificContent[errorCode]) {
      this.errorCodeSpecificContent[errorCode] = []
    }

    this.errorCodeSpecificContent[errorCode].push(content)
  }

  // Register offline content for a subject and topic
  public registerOfflineContent(subject: string, topic: string, content: TieredFallbackContent): void {
    if (!this.offlineContent[subject]) {
      this.offlineContent[subject] = {}
    }

    if (!this.offlineContent[subject][topic]) {
      this.offlineContent[subject][topic] = []
    }

    this.offlineContent[subject][topic].push(content)
  }

  // Determine the appropriate fallback tier based on context
  public determineFallbackTier(
    consecutiveErrors: number,
    responseTime?: number,
    trigger?: FallbackTrigger,
  ): FallbackTier {
    // Critical triggers always get higher tier fallbacks
    if (trigger === FallbackTrigger.API_UNAVAILABLE || trigger === FallbackTrigger.AUTHENTICATION_FAILURE) {
      return consecutiveErrors > 3 ? FallbackTier.TIER_4 : FallbackTier.TIER_3
    }

    // Check consecutive errors thresholds
    if (consecutiveErrors >= this.config.fallbackTierThresholds.consecutiveErrors[FallbackTier.TIER_4]) {
      return FallbackTier.TIER_4
    } else if (consecutiveErrors >= this.config.fallbackTierThresholds.consecutiveErrors[FallbackTier.TIER_3]) {
      return FallbackTier.TIER_3
    } else if (consecutiveErrors >= this.config.fallbackTierThresholds.consecutiveErrors[FallbackTier.TIER_2]) {
      return FallbackTier.TIER_2
    } else if (consecutiveErrors >= this.config.fallbackTierThresholds.consecutiveErrors[FallbackTier.TIER_1]) {
      return FallbackTier.TIER_1
    }

    // Check response time thresholds if provided
    if (responseTime) {
      if (responseTime >= this.config.fallbackTierThresholds.responseTime[FallbackTier.TIER_4]) {
        return FallbackTier.TIER_4
      } else if (responseTime >= this.config.fallbackTierThresholds.responseTime[FallbackTier.TIER_3]) {
        return FallbackTier.TIER_3
      } else if (responseTime >= this.config.fallbackTierThresholds.responseTime[FallbackTier.TIER_2]) {
        return FallbackTier.TIER_2
      } else if (responseTime >= this.config.fallbackTierThresholds.responseTime[FallbackTier.TIER_1]) {
        return FallbackTier.TIER_1
      }
    }

    // Default to TIER_1 for minimal degradation
    return FallbackTier.TIER_1
  }

  // Get fallback content based on subject, topic, and context
  public getFallbackContent(
    subject: string,
    topic = "general",
    options: {
      tier?: FallbackTier
      trigger?: FallbackTrigger
      errorCode?: string
      isOfflineMode?: boolean
      query?: string
    } = {},
  ): TieredFallbackContent {
    const { tier, trigger, errorCode, isOfflineMode, query } = options

    // If we're in offline mode, try to get offline content first
    if (isOfflineMode) {
      // Try to get subject and topic specific offline content
      if (this.offlineContent[subject]?.[topic]) {
        return this.getRandomContent(this.offlineContent[subject][topic])
      }

      // Fall back to general offline content for the subject
      if (this.offlineContent[subject]?.["general"]) {
        return this.getRandomContent(this.offlineContent[subject]["general"])
      }

      // Ultimate offline fallback
      return {
        type: FallbackContentType.OFFLINE_CONTENT,
        tier: FallbackTier.TIER_4,
        content:
          "I'm currently operating in offline mode with very limited capabilities. I can only provide basic information on fundamental concepts.",
      }
    }

    // If we have a cached response and we're in tier 1, try to use it
    if (tier === FallbackTier.TIER_1 && query && this.config.enableCaching) {
      const cachedContent = this.getCachedResponse(subject, topic, query)
      if (cachedContent) return cachedContent
    }

    // If we have an error code, try to get error-specific fallback first
    if (errorCode && this.errorCodeSpecificContent[errorCode]) {
      const errorFallbacks = this.errorCodeSpecificContent[errorCode].filter(
        (content) => !tier || content.tier === tier,
      )
      if (errorFallbacks.length > 0) {
        return this.getRandomContent(errorFallbacks)
      }
    }

    // If we have a trigger, try to get trigger-specific fallback
    if (trigger && this.triggerSpecificContent[trigger]) {
      const triggerFallbacks = this.triggerSpecificContent[trigger].filter((content) => !tier || content.tier === tier)
      if (triggerFallbacks.length > 0) {
        return this.getRandomContent(triggerFallbacks)
      }
    }

    // Try to get subject and topic specific content for the specified tier
    if (this.subjectSpecificContent[subject]?.[topic]) {
      const tierSpecificContent = this.subjectSpecificContent[subject][topic].filter(
        (content) => !tier || content.tier === tier,
      )
      if (tierSpecificContent.length > 0) {
        return this.getRandomContent(tierSpecificContent)
      }
    }

    // Fall back to general content for the subject with the specified tier
    if (this.subjectSpecificContent[subject]?.["general"]) {
      const tierSpecificContent = this.subjectSpecificContent[subject]["general"].filter(
        (content) => !tier || content.tier === tier,
      )
      if (tierSpecificContent.length > 0) {
        return this.getRandomContent(tierSpecificContent)
      }
    }

    // If we couldn't find content for the specified tier, try any tier for the subject and topic
    if (this.subjectSpecificContent[subject]?.[topic]) {
      return this.getRandomContent(this.subjectSpecificContent[subject][topic])
    }

    // Fall back to any tier for the subject general
    if (this.subjectSpecificContent[subject]?.["general"]) {
      return this.getRandomContent(this.subjectSpecificContent[subject]["general"])
    }

    // Ultimate fallback based on tier
    switch (tier) {
      case FallbackTier.TIER_4:
        return {
          type: FallbackContentType.OFFLINE_CONTENT,
          tier: FallbackTier.TIER_4,
          content:
            "I'm currently experiencing significant limitations. I can only provide very basic information at this time.",
        }
      case FallbackTier.TIER_3:
        return {
          type: FallbackContentType.SIMPLE_EXPLANATION,
          tier: FallbackTier.TIER_3,
          content:
            "I'm currently experiencing some limitations. Could you ask a more specific question about a basic concept?",
        }
      case FallbackTier.TIER_2:
        return {
          type: FallbackContentType.USER_GUIDANCE,
          tier: FallbackTier.TIER_2,
          content:
            "I'm currently experiencing some limitations in accessing my full knowledge. Could you please ask a more specific question or try again in a moment?",
        }
      case FallbackTier.TIER_1:
      default:
        return {
          type: FallbackContentType.ALTERNATIVE_SOURCE,
          tier: FallbackTier.TIER_1,
          content:
            "I'm currently using an alternative source for information. What specific concept would you like to explore?",
        }
    }
  }

  // Get a random content item from an array
  private getRandomContent(contentArray: TieredFallbackContent[]): TieredFallbackContent {
    const index = Math.floor(Math.random() * contentArray.length)
    return contentArray[index]
  }

  // Cache a successful response for potential future fallback
  public cacheResponse(subject: string, topic: string, query: string, response: string): void {
    if (!this.config.enableCaching) return

    const key = this.generateCacheKey(subject, topic, query)

    // Store in cache
    this.cache.set(key, {
      content: {
        type: FallbackContentType.CACHED_RESPONSE,
        tier: FallbackTier.TIER_1,
        content: response,
        metadata: { subject, topic, query, timestamp: Date.now() },
      },
      timestamp: Date.now(),
    })

    // Prune cache if it's too large
    this.pruneCache()
  }

  // Get a cached response if available
  public getCachedResponse(subject: string, topic: string, query: string): TieredFallbackContent | null {
    if (!this.config.enableCaching) return null

    const key = this.generateCacheKey(subject, topic, query)
    const cached = this.cache.get(key)

    // Check if cache exists and is still valid
    if (cached && Date.now() - cached.timestamp < this.config.cacheTTL) {
      return cached.content
    }

    // Try to find a similar query
    for (const [cacheKey, cacheEntry] of this.cache.entries()) {
      // Skip if expired
      if (Date.now() - cacheEntry.timestamp >= this.config.cacheTTL) continue

      // Check if the cache key contains the subject and has some similarity to the query
      if (
        cacheKey.includes(`subject:${subject}`) &&
        this.calculateSimilarity(query, cacheEntry.content.metadata?.query || "") > 0.7
      ) {
        return {
          ...cacheEntry.content,
          metadata: {
            ...cacheEntry.content.metadata,
            isSimilarMatch: true,
          },
        }
      }
    }

    return null
  }

  // Generate a cache key
  private generateCacheKey(subject: string, topic: string, query: string): string {
    return `subject:${subject}|topic:${topic}|query:${query.substring(0, 100)}`
  }

  // Prune the cache if it exceeds the maximum size
  private pruneCache(): void {
    if (this.cache.size <= this.config.maxCacheSize) return

    // Convert to array for sorting
    const entries = Array.from(this.cache.entries())

    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)

    // Remove oldest entries until we're under the limit
    const entriesToRemove = entries.slice(0, entries.length - this.config.maxCacheSize)

    for (const [key] of entriesToRemove) {
      this.cache.delete(key)
    }
  }

  // Simple similarity calculation (in a real implementation, you might use a more sophisticated algorithm)
  private calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase()
    const s2 = str2.toLowerCase()

    // Count common words
    const words1 = new Set(s1.split(/\W+/).filter((w) => w.length > 3))
    const words2 = new Set(s2.split(/\W+/).filter((w) => w.length > 3))

    let commonWords = 0
    for (const word of words1) {
      if (words2.has(word)) commonWords++
    }

    // Calculate Jaccard similarity
    const totalUniqueWords = words1.size + words2.size - commonWords
    return totalUniqueWords === 0 ? 0 : commonWords / totalUniqueWords
  }

  // Update configuration
  public updateConfig(config: Partial<TieredFallbackConfig>): void {
    this.config = { ...this.config, ...config }
  }

  // Get current configuration
  public getConfig(): TieredFallbackConfig {
    return { ...this.config }
  }
}
