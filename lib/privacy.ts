import { createHash } from "crypto"
import { logger } from "./logger"

// Sensitive content categories
const SENSITIVE_CONTENT_PATTERNS = [
  {
    category: "personal_identifiers",
    patterns: [
      /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g, // SSN
      /\b\d{16}\b/g, // Credit card (simple)
    ],
    description: "Personal identifiers like SSN or credit card numbers",
  },
  {
    category: "harmful_content",
    patterns: [/\b(hack|exploit|attack|bomb|kill|steal)\b/gi],
    description: "Potentially harmful content",
  },
  {
    category: "offensive_language",
    patterns: [
      // Add patterns for offensive language
      /\b(f[*\w]{2}k|sh[*\w]{1}t|b[*\w]{3}h)\b/gi,
    ],
    description: "Offensive language",
  },
]

// Hash sensitive data like user IDs for privacy
export function hashUserId(userId: string): string {
  if (!userId) return "anonymous"

  try {
    return createHash("sha256")
      .update(userId + (process.env.HASH_SALT || "default-salt"))
      .digest("hex")
  } catch (error) {
    logger.error("Error hashing user ID", { error })
    return "anonymous"
  }
}

// Filter sensitive content from user input
export function filterSensitiveContent(content: string): {
  isAllowed: boolean
  filteredContent: string
  reason?: string
} {
  if (!content) {
    return { isAllowed: true, filteredContent: "" }
  }

  // Check for sensitive content
  for (const { category, patterns, description } of SENSITIVE_CONTENT_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        logger.warn("Filtered sensitive content", { category, description })

        // Replace sensitive content with asterisks
        const filteredContent = content.replace(pattern, (match) => "*".repeat(match.length))

        // For harmful content, block the request entirely
        if (category === "harmful_content") {
          return {
            isAllowed: false,
            filteredContent,
            reason: "prohibited_content",
          }
        }

        // For other categories, just filter the content
        return {
          isAllowed: true,
          filteredContent,
        }
      }
    }
  }

  // No sensitive content found
  return { isAllowed: true, filteredContent: content }
}

// Sanitize data for logging (remove sensitive fields)
export function sanitizeForLogging(data: any): any {
  if (!data) return data

  if (typeof data === "object" && data !== null) {
    const sanitized: any = Array.isArray(data) ? [] : {}

    for (const [key, value] of Object.entries(data)) {
      // Skip sensitive fields
      if (["password", "token", "secret", "key", "authorization"].includes(key.toLowerCase())) {
        sanitized[key] = "[REDACTED]"
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = sanitizeForLogging(value)
      } else {
        sanitized[key] = value
      }
    }

    return sanitized
  }

  return data
}
