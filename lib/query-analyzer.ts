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
}

/**
 * Analyzes a user query to determine its type and extract relevant information
 * @param query The user's query text
 * @returns Analysis of the query type and extracted information
 */
export function analyzeQuery(query: string): QueryAnalysis {
  const lowerQuery = query.toLowerCase().trim()

  // Initialize the analysis object
  const analysis: QueryAnalysis = {
    type: "unknown",
    confidence: 0,
    entities: [],
  }

  // Check for greetings
  if (/^(hi|hello|hey|greetings|howdy|good (morning|afternoon|evening))[\s\W]*$/i.test(lowerQuery)) {
    analysis.type = "greeting"
    analysis.confidence = 0.9
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
    return analysis
  }

  // Check for how-to questions
  if (lowerQuery.startsWith("how") || lowerQuery.includes("how to")) {
    analysis.type = "how_to_question"
    analysis.confidence = 0.7
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
    return analysis
  }

  // If we couldn't determine a specific type
  return analysis
}

/**
 * Generates a response template based on query analysis
 * @param analysis The analysis of the user's query
 * @returns A template string for the response
 */
export function getResponseTemplate(analysis: QueryAnalysis): string {
  switch (analysis.type) {
    case "greeting":
      return platformInfo.responseTemplates.greeting

    case "subject_question":
      if (analysis.subject) {
        return platformInfo.responseTemplates.subjectInquiry.replace("{subject}", analysis.subject)
      }
      break

    case "feature_inquiry":
      if (analysis.feature) {
        const feature = platformInfo.features.find((f) => f.name === analysis.feature || f.id === analysis.feature)

        if (feature) {
          return platformInfo.responseTemplates.featureExplanation
            .replace("{feature}", feature.name)
            .replace("{description}", feature.description)
            .replace("{capabilities}", feature.capabilities.slice(0, 3).join(", "))
        }
      }
      break

    case "pricing_inquiry":
      return platformInfo.responseTemplates.pricingInformation
        .replace("{freePlan}", platformInfo.pricing.free.name)
        .replace("{freePrice}", platformInfo.pricing.free.price)
        .replace("{freeFeatures}", platformInfo.pricing.free.features.slice(0, 2).join(", "))
        .replace("{premiumPlan}", platformInfo.pricing.premium.name)
        .replace("{premiumPrice}", platformInfo.pricing.premium.price)
        .replace("{premiumFeatures}", platformInfo.pricing.premium.features.slice(0, 2).join(", "))
        .replace("{teamPlan}", platformInfo.pricing.team.name)
        .replace("{teamPrice}", platformInfo.pricing.team.price)
        .replace("{teamFeatures}", platformInfo.pricing.team.features.slice(0, 2).join(", "))

    case "how_to_question":
      return platformInfo.responseTemplates.problemSolving
        .replace("{subject}", analysis.subject || "problem")
        .replace("{steps}", "1. First step\n2. Second step\n3. Third step")

    case "definition_request":
      return platformInfo.responseTemplates.conceptExplanation
        .replace("{concept}", "the concept")
        .replace("{explanation}", "Detailed explanation would go here.")

    default:
      // For unknown query types, use a clarification request
      return platformInfo.responseTemplates.clarificationRequest.replace("{interpretation}", "your question")
  }

  // Fallback
  return platformInfo.responseTemplates.greeting
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

export default {
  analyzeQuery,
  getResponseTemplate,
  suggestResources,
}
