import { ErrorCodes } from "./error-handling"

// Fallback content types
export enum FallbackContentType {
  SIMPLE_EXPLANATION = "simple_explanation",
  STATIC_CONTENT = "static_content",
  CACHED_RESPONSE = "cached_response",
  ALTERNATIVE_SOURCE = "alternative_source",
  USER_GUIDANCE = "user_guidance",
}

// Interface for fallback content
export interface FallbackContent {
  type: FallbackContentType
  content: string
  metadata?: Record<string, any>
}

// Interface for fallback strategy configuration
export interface FallbackStrategyConfig {
  enableCaching: boolean
  cacheTTL: number // in milliseconds
  maxCacheSize: number
  preferredFallbackTypes: FallbackContentType[]
}

// Default fallback strategy configuration
const DEFAULT_FALLBACK_CONFIG: FallbackStrategyConfig = {
  enableCaching: true,
  cacheTTL: 3600000, // 1 hour
  maxCacheSize: 100,
  preferredFallbackTypes: [
    FallbackContentType.CACHED_RESPONSE,
    FallbackContentType.SIMPLE_EXPLANATION,
    FallbackContentType.STATIC_CONTENT,
    FallbackContentType.USER_GUIDANCE,
  ],
}

// Class to manage fallback content strategies
export class FallbackStrategy {
  private static instance: FallbackStrategy
  private config: FallbackStrategyConfig
  private cache: Map<string, { content: FallbackContent; timestamp: number }> = new Map()
  private subjectSpecificContent: Record<string, Record<string, FallbackContent[]>> = {}

  private constructor(config: Partial<FallbackStrategyConfig> = {}) {
    this.config = { ...DEFAULT_FALLBACK_CONFIG, ...config }
    this.initializeDefaultContent()
  }

  // Singleton pattern
  public static getInstance(config: Partial<FallbackStrategyConfig> = {}): FallbackStrategy {
    if (!FallbackStrategy.instance) {
      FallbackStrategy.instance = new FallbackStrategy(config)
    }
    return FallbackStrategy.instance
  }

  // Initialize default fallback content
  private initializeDefaultContent(): void {
    // Math subject
    this.registerFallbackContent("math", "general", {
      type: FallbackContentType.SIMPLE_EXPLANATION,
      content:
        "Mathematics is about understanding patterns and relationships between numbers and shapes. What specific math topic are you interested in learning about?",
    })

    this.registerFallbackContent("math", "algebra", {
      type: FallbackContentType.SIMPLE_EXPLANATION,
      content:
        "Algebra uses letters and symbols to represent values in equations. It helps us solve for unknown values and understand relationships between variables.",
    })

    this.registerFallbackContent("math", "calculus", {
      type: FallbackContentType.SIMPLE_EXPLANATION,
      content:
        "Calculus is about rates of change and accumulation. Derivatives measure how quickly values change, while integrals measure accumulated quantities.",
    })

    // Science subject
    this.registerFallbackContent("science", "general", {
      type: FallbackContentType.SIMPLE_EXPLANATION,
      content:
        "Science is a systematic way of understanding the natural world through observation and experimentation. What specific science topic would you like to explore?",
    })

    this.registerFallbackContent("science", "physics", {
      type: FallbackContentType.SIMPLE_EXPLANATION,
      content:
        "Physics studies matter, energy, and the fundamental forces of nature. It helps us understand everything from subatomic particles to the entire universe.",
    })

    // Error-specific fallbacks
    this.registerFallbackContent("error", ErrorCodes.CONN_TIMEOUT, {
      type: FallbackContentType.USER_GUIDANCE,
      content:
        "I'm having trouble connecting to my knowledge source right now. While I work on reconnecting, could you try asking a more specific question or breaking your question into smaller parts?",
    })

    this.registerFallbackContent("error", ErrorCodes.MODEL_CONTEXT_LENGTH_EXCEEDED, {
      type: FallbackContentType.USER_GUIDANCE,
      content:
        "Your question and our conversation history have become quite lengthy for me to process. Could you ask a more focused question about a specific concept you'd like me to explain?",
    })
  }

  // Register fallback content
  public registerFallbackContent(category: string, subcategory: string, content: FallbackContent): void {
    if (!this.subjectSpecificContent[category]) {
      this.subjectSpecificContent[category] = {}
    }

    if (!this.subjectSpecificContent[category][subcategory]) {
      this.subjectSpecificContent[category][subcategory] = []
    }

    this.subjectSpecificContent[category][subcategory].push(content)
  }

  // Get fallback content based on subject and topic
  public getFallbackContent(subject: string, topic = "general", errorCode?: string): FallbackContent {
    // If we have an error code, try to get error-specific fallback first
    if (errorCode && this.subjectSpecificContent["error"]?.[errorCode]) {
      return this.getRandomContent(this.subjectSpecificContent["error"][errorCode])
    }

    // Try to get subject and topic specific content
    if (this.subjectSpecificContent[subject]?.[topic]) {
      return this.getRandomContent(this.subjectSpecificContent[subject][topic])
    }

    // Fall back to general content for the subject
    if (this.subjectSpecificContent[subject]?.["general"]) {
      return this.getRandomContent(this.subjectSpecificContent[subject]["general"])
    }

    // Ultimate fallback
    return {
      type: FallbackContentType.SIMPLE_EXPLANATION,
      content:
        "I'm currently experiencing some limitations in accessing my full knowledge. Could you please ask a more specific question or try again in a moment?",
    }
  }

  // Get a random content item from an array
  private getRandomContent(contentArray: FallbackContent[]): FallbackContent {
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
        content: response,
        metadata: { subject, topic, query, timestamp: Date.now() },
      },
      timestamp: Date.now(),
    })

    // Prune cache if it's too large
    this.pruneCache()
  }

  // Get a cached response if available
  public getCachedResponse(subject: string, topic: string, query: string): FallbackContent | null {
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
  public updateConfig(config: Partial<FallbackStrategyConfig>): void {
    this.config = { ...this.config, ...config }
  }

  // Get current configuration
  public getConfig(): FallbackStrategyConfig {
    return { ...this.config }
  }
}
