import platformInfo from "./platform-info"

export type QueryType =
  | "greeting"
  | "subject_question"
  | "feature_inquiry"
  | "pricing_inquiry"
  | "comparison_request"
  | "how_to_question"
  | "definition_request"
  | "problem_solving"
  | "opinion_request"
  | "resource_request"
  | "account_question"
  | "feedback"
  | "unknown"

export type QueryAnalysis = {
  type: QueryType
  subject?: string
  topic?: string
  feature?: string
  pricingPlan?: string
  confidence: number
  entities: {
    name: string
    type: string
    value: string
  }[]
  executionTime?: number
  optimizationSuggestions?: string[]
}

/**
 * Analyzes a user query to determine its type and extract relevant information
 * @param query The user's query text
 * @returns Analysis of the query type and extracted information
 */
export function analyzeQuery(query: string): QueryAnalysis {
  const startTime = performance.now()
  const lowerQuery = query.toLowerCase().trim()

  // Initialize the analysis object
  const analysis: QueryAnalysis = {
    type: "unknown",
    confidence: 0,
    entities: [],
    optimizationSuggestions: [],
  }

  // Check for greetings
  if (/^(hi|hello|hey|greetings|howdy|good (morning|afternoon|evening))[\s\W]*$/i.test(lowerQuery)) {
    analysis.type = "greeting"
    analysis.confidence = 0.9
    analysis.executionTime = performance.now() - startTime
    return analysis
  }

  // Check for feature inquiries
  for (const feature of platformInfo.features) {
    if (lowerQuery.includes(feature.name.toLowerCase()) || lowerQuery.includes(feature.id.toLowerCase())) {
      analysis.type = "feature_inquiry"
      analysis.feature = feature.name
      analysis.confidence = 0.8
      analysis.entities.push({
        name: feature.name,
        type: "feature",
        value: feature.id,
      })

      // If it's also asking how to use the feature
      if (lowerQuery.includes("how") && (lowerQuery.includes("use") || lowerQuery.includes("work"))) {
        analysis.type = "how_to_question"
        analysis.confidence = 0.85
      }

      analysis.executionTime = performance.now() - startTime
      return analysis
    }
  }

  // Check for pricing inquiries
  if (
    lowerQuery.includes("price") ||
    lowerQuery.includes("cost") ||
    lowerQuery.includes("subscription") ||
    lowerQuery.includes("plan") ||
    lowerQuery.includes("free") ||
    lowerQuery.includes("trial") ||
    lowerQuery.includes("premium") ||
    lowerQuery.includes("team")
  ) {
    analysis.type = "pricing_inquiry"
    analysis.confidence = 0.8

    // Determine which plan they're asking about
    if (lowerQuery.includes("free") || lowerQuery.includes("trial")) {
      analysis.pricingPlan = "free"
      analysis.entities.push({
        name: "Free Trial",
        type: "pricing_plan",
        value: "free",
      })
    } else if (lowerQuery.includes("premium")) {
      analysis.pricingPlan = "premium"
      analysis.entities.push({
        name: "Premium",
        type: "pricing_plan",
        value: "premium",
      })
    } else if (lowerQuery.includes("team")) {
      analysis.pricingPlan = "team"
      analysis.entities.push({
        name: "Team",
        type: "pricing_plan",
        value: "team",
      })
    }

    analysis.executionTime = performance.now() - startTime
    return analysis
  }

  // Check for subject questions
  for (const subject of platformInfo.subjects) {
    if (lowerQuery.includes(subject.name.toLowerCase())) {
      analysis.type = "subject_question"
      analysis.subject = subject.name
      analysis.confidence = 0.75
      analysis.entities.push({
        name: subject.name,
        type: "subject",
        value: subject.name.toLowerCase(),
      })

      // Check for specific topics within the subject
      for (const topic of subject.topics) {
        if (lowerQuery.includes(topic.toLowerCase())) {
          analysis.topic = topic
          analysis.confidence = 0.85
          analysis.entities.push({
            name: topic,
            type: "topic",
            value: topic.toLowerCase(),
          })
          break
        }
      }

      analysis.executionTime = performance.now() - startTime
      return analysis
    }
  }

  // Check for comparison requests
  if (
    lowerQuery.includes("compare") ||
    lowerQuery.includes("difference") ||
    lowerQuery.includes("versus") ||
    lowerQuery.includes(" vs ") ||
    lowerQuery.includes("better than")
  ) {
    analysis.type = "comparison_request"
    analysis.confidence = 0.7
    analysis.executionTime = performance.now() - startTime
    return analysis
  }

  // Check for how-to questions
  if (lowerQuery.startsWith("how") || lowerQuery.includes("how to")) {
    analysis.type = "how_to_question"
    analysis.confidence = 0.7
    analysis.executionTime = performance.now() - startTime
    return analysis
  }

  // Check for definition requests
  if (
    lowerQuery.startsWith("what is") ||
    lowerQuery.startsWith("what are") ||
    lowerQuery.startsWith("define") ||
    lowerQuery.startsWith("explain")
  ) {
    analysis.type = "definition_request"
    analysis.confidence = 0.7
    analysis.executionTime = performance.now() - startTime
    return analysis
  }

  // Check for problem solving
  if (
    lowerQuery.includes("solve") ||
    lowerQuery.includes("calculate") ||
    lowerQuery.includes("find the") ||
    lowerQuery.includes("compute")
  ) {
    analysis.type = "problem_solving"
    analysis.confidence = 0.7
    analysis.executionTime = performance.now() - startTime
    return analysis
  }

  // Check for resource requests
  if (
    lowerQuery.includes("resource") ||
    lowerQuery.includes("article") ||
    lowerQuery.includes("video") ||
    lowerQuery.includes("tutorial") ||
    lowerQuery.includes("guide")
  ) {
    analysis.type = "resource_request"
    analysis.confidence = 0.7
    analysis.executionTime = performance.now() - startTime
    return analysis
  }

  // Check for account questions
  if (
    lowerQuery.includes("account") ||
    lowerQuery.includes("login") ||
    lowerQuery.includes("sign up") ||
    lowerQuery.includes("password") ||
    lowerQuery.includes("profile")
  ) {
    analysis.type = "account_question"
    analysis.confidence = 0.7
    analysis.executionTime = performance.now() - startTime
    return analysis
  }

  // If we couldn't determine a specific type
  analysis.executionTime = performance.now() - startTime

  // Add optimization suggestions if the analysis took too long
  if (analysis.executionTime > 50) {
    analysis.optimizationSuggestions = [
      "Consider using a more efficient pattern matching algorithm",
      "Cache common query patterns for faster lookup",
      "Use a machine learning model for more accurate classification",
    ]
  }

  return analysis
}

/**
 * Suggests relevant resources based on query analysis
 * @param analysis The analysis of the user's query
 * @returns Array of relevant resources
 */
export function suggestResources(analysis: QueryAnalysis): any[] {
  const resources: any[] = []

  if (analysis.subject) {
    // Find articles related to the subject
    const articles = platformInfo.resources.articles.filter((article) =>
      article.topics.some((topic) => topic.toLowerCase().includes(analysis.subject?.toLowerCase() || "")),
    )

    if (articles.length > 0) {
      resources.push(...articles.slice(0, 2))
    }

    // Find videos related to the subject
    const videos = platformInfo.resources.videos.filter((video) =>
      video.topics.some((topic) => topic.toLowerCase().includes(analysis.subject?.toLowerCase() || "")),
    )

    if (videos.length > 0) {
      resources.push(...videos.slice(0, 2))
    }

    // Find tools related to the subject
    const tools = platformInfo.resources.tools.filter((tool) =>
      tool.subjects.some((subject) => subject.toLowerCase().includes(analysis.subject?.toLowerCase() || "")),
    )

    if (tools.length > 0) {
      resources.push(...tools.slice(0, 1))
    }
  }

  return resources.slice(0, 3) // Return at most 3 resources
}

/**
 * Logs query analysis for debugging and improvement
 * @param query The original query
 * @param analysis The analysis result
 */
export function logQueryAnalysis(query: string, analysis: QueryAnalysis): void {
  console.log(`Query Analysis:
  Original: "${query}"
  Type: ${analysis.type}
  Confidence: ${analysis.confidence}
  Subject: ${analysis.subject || "N/A"}
  Topic: ${analysis.topic || "N/A"}
  Feature: ${analysis.feature || "N/A"}
  Execution Time: ${analysis.executionTime?.toFixed(2)}ms
  Entities: ${analysis.entities.length}
  `)

  if (analysis.optimizationSuggestions && analysis.optimizationSuggestions.length > 0) {
    console.log("Optimization Suggestions:")
    analysis.optimizationSuggestions.forEach((suggestion, index) => {
      console.log(`  ${index + 1}. ${suggestion}`)
    })
  }
}

export default {
  analyzeQuery,
  suggestResources,
  logQueryAnalysis,
}
