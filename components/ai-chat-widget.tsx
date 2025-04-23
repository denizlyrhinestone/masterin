"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Send, Bot, User, ArrowRight, Loader2, ThumbsUp, ThumbsDown, HelpCircle } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/contexts/auth-context"
import { v4 as uuidv4 } from "uuid"
import platformInfo from "@/lib/platform-info"
import { analyzeQuery, suggestResources } from "@/lib/query-analyzer"
import { initializeMemory, addMemoryItem, extractMemoryFromMessages, getTopMemoryItem } from "@/lib/conversation-memory"

type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  isLoading?: boolean
  feedback?: "positive" | "negative"
}

type Resource = {
  title: string
  url: string
  type: "article" | "video" | "tool"
  description?: string
}

export default function AIChatWidget() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hi there! I'm your AI assistant from ${platformInfo.name}. How can I help you learn about our platform today?`,
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isExpanded, setIsExpanded] = useState(true) // Start expanded on the homepage
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    "What AI tools do you offer?",
    "How can Masterin help me learn?",
    "Tell me about your pricing",
    "What subjects do you cover?",
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId] = useState(() => uuidv4())
  const [memory, setMemory] = useState(() => initializeMemory(user?.id || null, sessionId))
  const [suggestedResources, setSuggestedResources] = useState<Resource[]>([])
  const [showResources, setShowResources] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Update memory when messages change
  useEffect(() => {
    if (messages.length > 1) {
      const extractedItems = extractMemoryFromMessages(messages.map((m) => ({ role: m.role, content: m.content })))

      let updatedMemory = { ...memory }
      for (const item of extractedItems) {
        updatedMemory = addMemoryItem(updatedMemory, {
          type: item.type,
          value: item.value,
          confidence: item.confidence,
        })
      }

      setMemory(updatedMemory)
    }
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    // Analyze the query
    const analysis = analyzeQuery(inputValue)

    // Update memory based on analysis
    let updatedMemory = { ...memory }
    if (analysis.subject) {
      updatedMemory = addMemoryItem(updatedMemory, {
        type: "subject",
        value: analysis.subject,
        confidence: analysis.confidence,
      })
    }

    if (analysis.feature) {
      updatedMemory = addMemoryItem(updatedMemory, {
        type: "feature",
        value: analysis.feature,
        confidence: analysis.confidence,
      })
    }

    setMemory(updatedMemory)

    // Find relevant resources
    const resources = suggestResources(analysis)
    if (resources.length > 0) {
      setSuggestedResources(
        resources.map((r) => ({
          title: r.title,
          url: r.url,
          type: r.url.includes("/videos/") ? "video" : r.url.includes("/tools/") ? "tool" : "article",
          description: r.description,
        })),
      )
      setShowResources(true)
    } else {
      setSuggestedResources([])
      setShowResources(false)
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
    }

    // Add a loading message from the assistant
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      isLoading: true,
    }

    setMessages((prev) => [...prev, userMessage, loadingMessage])
    setInputValue("")
    setIsTyping(true)

    // Scroll to bottom
    setTimeout(() => {
      scrollToBottom()
    }, 100)

    // Generate response with a slight delay to simulate thinking
    setTimeout(() => {
      // Remove the loading message and add the real response
      setMessages((prev) => {
        const filtered = prev.filter((msg) => !msg.isLoading)
        return [
          ...filtered,
          {
            id: (Date.now() + 2).toString(),
            role: "assistant",
            content: generateContextualResponse(inputValue, filtered, analysis, updatedMemory),
          },
        ]
      })
      setIsTyping(false)

      // Update suggested questions based on the conversation
      updateSuggestedQuestions(inputValue, analysis)

      // Scroll to bottom again
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    }, 1500)
  }

  // Update suggested questions based on the conversation context and query analysis
  const updateSuggestedQuestions = (lastInput: string, analysis: any) => {
    // Get the user's current interests from memory
    const subjectItem = getTopMemoryItem(memory, "subject")
    const featureItem = getTopMemoryItem(memory, "feature")
    const goalItem = getTopMemoryItem(memory, "goal")

    // Base suggestions on query type
    switch (analysis.type) {
      case "greeting":
        setSuggestedQuestions([
          "What AI tools do you offer?",
          "How can Masterin help me learn?",
          "Tell me about your pricing",
          "What subjects do you cover?",
        ])
        break

      case "feature_inquiry":
        if (analysis.feature) {
          const feature = platformInfo.features.find(
            (f) => f.name === analysis.feature || f.id === analysis.feature?.toLowerCase(),
          )

          if (feature) {
            setSuggestedQuestions([
              `How does the ${feature.name} work?`,
              `What are the benefits of the ${feature.name}?`,
              `Can I try the ${feature.name} for free?`,
              `Show me an example of the ${feature.name}`,
            ])
          }
        }
        break

      case "pricing_inquiry":
        setSuggestedQuestions([
          "What's included in the free trial?",
          "What features come with Premium?",
          "How does the Team plan work?",
          "Can I upgrade or downgrade anytime?",
        ])
        break

      case "subject_question":
        if (analysis.subject) {
          setSuggestedQuestions([
            `How does Masterin help with ${analysis.subject}?`,
            `What ${analysis.subject} topics do you cover?`,
            `Can you show me a ${analysis.subject} example?`,
            `Do you have ${analysis.subject} practice problems?`,
          ])
        }
        break

      default:
        // If we have memory items, use them to generate relevant questions
        if (subjectItem) {
          const subject = subjectItem.value
          const subjectObj = platformInfo.subjects.find((s) => s.name.toLowerCase() === subject.toLowerCase())

          if (subjectObj && subjectObj.commonQuestions) {
            // Use the common questions for this subject
            setSuggestedQuestions(subjectObj.commonQuestions.slice(0, 4))
            return
          }
        }

        if (featureItem) {
          const feature = featureItem.value
          const featureObj = platformInfo.features.find(
            (f) => f.name.toLowerCase() === feature.toLowerCase() || f.id === feature.toLowerCase(),
          )

          if (featureObj) {
            setSuggestedQuestions([
              `How does the ${featureObj.name} work?`,
              `What are the benefits of the ${featureObj.name}?`,
              `Can I try the ${featureObj.name} for free?`,
              `Show me an example of the ${featureObj.name}`,
            ])
            return
          }
        }

        // Default questions if we don't have specific context
        setSuggestedQuestions([
          "What makes Masterin different?",
          "How do I get started?",
          "Can I try before subscribing?",
          "Do you have mobile apps?",
        ])
    }
  }

  // Enhanced response generation with platform context, query analysis, and memory
  const generateContextualResponse = (input: string, prevMessages: Message[], analysis: any, memory: any): string => {
    // Get memory items for context
    const subjectItem = getTopMemoryItem(memory, "subject")
    const featureItem = getTopMemoryItem(memory, "feature")
    const goalItem = getTopMemoryItem(memory, "goal")

    // Use the query analysis to generate a response
    switch (analysis.type) {
      case "greeting":
        return platformInfo.responseTemplates.greeting

      case "feature_inquiry":
        if (analysis.feature) {
          const feature = platformInfo.features.find(
            (f) => f.name === analysis.feature || f.id === analysis.feature?.toLowerCase(),
          )

          if (feature) {
            let response = `**${feature.name}**: ${feature.description}\n\n`

            response += "**Key capabilities:**\n"
            response += feature.capabilities.map((cap) => `• ${cap}`).join("\n")

            response += "\n\n**Benefits:**\n"
            response += feature.benefits.map((ben) => `• ${ben}`).join("\n")

            // Add an example if available
            if (feature.examples && feature.examples.length > 0) {
              const example = feature.examples[0]
              response += `\n\n**Example:**\nQuestion: "${example.question}"\n\nResponse: "${example.response}"`
            }

            response += "\n\nWould you like to know more about this feature or try it out?"

            return response
          }
        }
        break

      case "pricing_inquiry":
        let pricingResponse = "Here's information about our pricing plans:\n\n"

        // If they asked about a specific plan
        if (analysis.pricingPlan) {
          const plan = platformInfo.pricing[analysis.pricingPlan as keyof typeof platformInfo.pricing]

          pricingResponse += `**${plan.name}**: ${plan.price}\n\n`
          pricingResponse += "**Features:**\n"
          pricingResponse += plan.features.map((feature) => `• ${feature}`).join("\n")

          if ("bestFor" in plan) {
            pricingResponse += `\n\n**Best for**: ${plan.bestFor}`
          }

          if ("savings" in plan) {
            pricingResponse += `\n\n**Savings**: ${plan.savings}`
          }

          if ("limitations" in plan) {
            pricingResponse += "\n\n**Limitations:**\n"
            pricingResponse += (plan as any).limitations.map((limit: string) => `• ${limit}`).join("\n")
          }
        }
        // Otherwise show all plans
        else {
          // Free plan
          pricingResponse += `**${platformInfo.pricing.free.name}**: ${platformInfo.pricing.free.price}\n`
          pricingResponse += platformInfo.pricing.free.features.map((feature) => `• ${feature}`).join("\n")

          // Premium plan
          pricingResponse += `\n\n**${platformInfo.pricing.premium.name}**: ${platformInfo.pricing.premium.price}\n`
          pricingResponse += platformInfo.pricing.premium.features.map((feature) => `• ${feature}`).join("\n")
          pricingResponse += `\n**Best for**: ${platformInfo.pricing.premium.bestFor}`
          pricingResponse += `\n**Savings**: ${platformInfo.pricing.premium.savings}`

          // Team plan
          pricingResponse += `\n\n**${platformInfo.pricing.team.name}**: ${platformInfo.pricing.team.price}\n`
          pricingResponse += platformInfo.pricing.team.features.map((feature) => `• ${feature}`).join("\n")
          pricingResponse += `\n**Best for**: ${platformInfo.pricing.team.bestFor}`
          pricingResponse += `\n**Savings**: ${platformInfo.pricing.team.savings}`
        }

        pricingResponse += "\n\nWould you like to know more about a specific plan or feature?"

        return pricingResponse

      case "subject_question":
        if (analysis.subject) {
          const subject = platformInfo.subjects.find((s) => s.name.toLowerCase() === analysis.subject?.toLowerCase())

          if (subject) {
            let response = `**${subject.name}**: ${subject.description}\n\n`

            response += "**Topics covered:**\n"
            response += subject.topics.map((topic) => `• ${topic}`).join("\n")

            response +=
              "\n\nOur AI tutor can help with all these topics through personalized explanations, practice problems, and step-by-step solutions. Would you like to see an example of how we can help with a specific topic?"

            return response
          }
        }
        break

      case "comparison_request":
        return (
          "When comparing educational platforms, Masterin stands out in several key ways:\n\n" +
          "**1. Personalized Learning Experience**\n" +
          "Unlike generic AI tools, Masterin adapts to your learning style and pace, providing explanations that match your level of understanding.\n\n" +
          "**2. Comprehensive Subject Coverage**\n" +
          "We cover a wide range of subjects from mathematics and sciences to humanities and languages, with deep expertise in each area.\n\n" +
          "**3. Multiple Learning Tools**\n" +
          "Beyond just answering questions, we offer specialized tools for essay writing, math problem-solving, coding assistance, and study note generation.\n\n" +
          "**4. Educational Focus**\n" +
          "Our AI is specifically designed for education, with an emphasis on building understanding rather than just providing answers.\n\n" +
          "**5. Affordable Pricing**\n" +
          "Our plans are designed to be accessible to students, with a free trial and affordable subscription options.\n\n" +
          "Would you like more specific information about how we compare to a particular platform or service?"
        )

      case "how_to_question":
        // If they're asking how to use a feature
        if (analysis.feature) {
          const feature = platformInfo.features.find(
            (f) => f.name === analysis.feature || f.id === analysis.feature?.toLowerCase(),
          )

          if (feature) {
            let response = `**How to use the ${feature.name}:**\n\n`

            response += "1. **Access the tool**: Click on the '${feature.name}' option in the main dashboard\n"
            response += "2. **Ask your question or upload content**: Type your question or upload relevant materials\n"
            response += "3. **Review the response**: Get personalized explanations, solutions, or feedback\n"
            response += "4. **Interact further**: Ask follow-up questions or request different approaches\n"
            response += "5. **Save and review**: Bookmark important explanations for later review\n\n"

            response += "Would you like to try it now or see a specific example?"

            return response
          }
        }

        // General how-to for the platform
        return (
          "**Getting started with Masterin is easy:**\n\n" +
          "1. **Create an account**: Sign up with your email or Google account\n" +
          "2. **Select your subjects**: Choose the subjects you're interested in\n" +
          "3. **Explore the tools**: Try out our AI Tutor, Essay Assistant, Math Problem Solver, and more\n" +
          "4. **Ask questions**: Start learning by asking questions about any topic\n" +
          "5. **Track your progress**: Review your learning history and saved explanations\n\n" +
          "You can start with our free trial to explore the platform before choosing a subscription plan. Would you like more specific guidance on getting started?"
        )

      case "definition_request":
        // Try to find a relevant FAQ
        for (const faq of platformInfo.faq) {
          if (input.toLowerCase().includes(faq.question.toLowerCase().replace(/\?/g, ""))) {
            return faq.answer
          }
        }

        // If no matching FAQ, provide a general response
        return "I'd be happy to explain that concept in detail. For the most comprehensive explanation with examples and visual aids, I recommend clicking the 'Open Full Chat' button below where our advanced AI can provide a more detailed response tailored to your specific question."

      case "account_question":
        return (
          "**Account Management Information:**\n\n" +
          "• **Creating an account**: Sign up with email or Google account on our homepage\n" +
          "• **Password reset**: Use the 'Forgot Password' link on the login page\n" +
          "• **Subscription management**: Access through your account settings\n" +
          "• **Profile updates**: Edit your profile information in account settings\n" +
          "• **Privacy settings**: Control your data and privacy preferences in settings\n\n" +
          "For specific account issues or technical support, our support team is available at support@masterin.ai. Is there a specific account question I can help with?"
        )
    }

    // If we have memory items, use them to provide a more contextual response
    if (subjectItem || featureItem || goalItem) {
      let contextualResponse = "Based on our conversation, I think I can help you with "

      if (subjectItem) {
        contextualResponse += `${subjectItem.value}`

        if (featureItem) {
          contextualResponse += ` using our ${featureItem.value} feature`
        }

        contextualResponse += ". "
      } else if (featureItem) {
        contextualResponse += `our ${featureItem.value} feature. `
      }

      if (goalItem) {
        contextualResponse += `I understand you want to ${goalItem.value}. `
      }

      contextualResponse +=
        "For a more detailed and personalized response to your specific question, I recommend clicking the 'Open Full Chat' button below where our advanced AI can provide comprehensive assistance."

      return contextualResponse
    }

    // Default response with conversation awareness
    const conversationContext = analyzeConversationContext(prevMessages)
    return `That's an interesting question about ${conversationContext}. For a more detailed and personalized response, I recommend clicking the "Open Full Chat" button below where our advanced AI can provide comprehensive information tailored to your specific needs.`
  }

  // Analyze conversation context to provide more relevant default responses
  const analyzeConversationContext = (messages: Message[]): string => {
    // Get only user messages
    const userMessages = messages.filter((msg) => msg.role === "user")

    if (userMessages.length === 0) return "our platform"

    // Check for common themes in the conversation
    const allText = userMessages.map((msg) => msg.content.toLowerCase()).join(" ")

    if (
      allText.includes("math") ||
      allText.includes("calculus") ||
      allText.includes("algebra") ||
      allText.includes("equation") ||
      allText.includes("problem")
    ) {
      return "mathematics and problem-solving"
    }

    if (
      allText.includes("essay") ||
      allText.includes("write") ||
      allText.includes("writing") ||
      allText.includes("paper") ||
      allText.includes("assignment")
    ) {
      return "writing and essay assistance"
    }

    if (
      allText.includes("code") ||
      allText.includes("programming") ||
      allText.includes("python") ||
      allText.includes("javascript") ||
      allText.includes("developer")
    ) {
      return "programming and coding"
    }

    if (
      allText.includes("price") ||
      allText.includes("cost") ||
      allText.includes("subscription") ||
      allText.includes("payment") ||
      allText.includes("free")
    ) {
      return "our pricing and plans"
    }

    // Default to the most recent message context
    const lastMessage = userMessages[userMessages.length - 1].content.toLowerCase()
    const words = lastMessage.split(/\s+/).filter((word) => word.length > 3)

    if (words.length > 0) {
      // Use the most significant word from the last message
      const significantWords = words.filter(
        (word) =>
          ![
            "what",
            "when",
            "where",
            "which",
            "who",
            "whom",
            "whose",
            "why",
            "how",
            "about",
            "does",
            "this",
            "that",
            "these",
            "those",
          ].includes(word),
      )

      if (significantWords.length > 0) {
        return significantWords[0]
      }
    }

    return "our educational platform"
  }

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question)
    // Focus the input field
    const inputElement = document.getElementById("chat-input") as HTMLInputElement
    if (inputElement) {
      inputElement.focus()
    }
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  // Handle feedback on responses
  const handleFeedback = (messageId: string, feedbackType: "positive" | "negative") => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, feedback: feedbackType } : msg)))

    // In a real implementation, you would send this feedback to your backend
    console.log(`Feedback for message ${messageId}: ${feedbackType}`)
  }

  return (
    <Card className="border-0 shadow-lg overflow-hidden h-[500px] flex flex-col">
      <CardHeader
        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 cursor-pointer"
        onClick={toggleExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
              <Bot className="w-4 h-4 text-purple-600" />
            </div>
            <CardTitle className="text-lg">Masterin Assistant</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-white/20 hover:bg-white/30">
            AI Powered
          </Badge>
        </div>
      </CardHeader>

      {isExpanded && (
        <>
          <CardContent className="p-4 flex-grow overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === "user"
                          ? "bg-purple-100 dark:bg-purple-900/30 ml-2"
                          : "bg-blue-100 dark:bg-blue-900/30 mr-2"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="w-3 h-3 text-purple-600" />
                      ) : (
                        <Bot className="w-3 h-3 text-blue-600" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg p-3 text-sm ${
                        message.role === "user"
                          ? "bg-purple-600 text-white"
                          : message.isLoading
                            ? "bg-gray-100 dark:bg-gray-800 animate-pulse"
                            : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      {message.isLoading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Thinking...</span>
                        </div>
                      ) : (
                        <div className="whitespace-pre-line">
                          {message.content.split("\n").map((line, i) => {
                            // Handle markdown-style bold text
                            const boldPattern = /\*\*(.*?)\*\*/g
                            const formattedLine = line.replace(boldPattern, "<strong>$1</strong>")

                            return <div key={i} dangerouslySetInnerHTML={{ __html: formattedLine }} />
                          })}

                          {/* Feedback buttons for assistant messages */}
                          {message.role === "assistant" && !message.isLoading && message.id !== "welcome" && (
                            <div className="flex items-center justify-end mt-2 space-x-2 text-xs text-gray-500">
                              <span className="mr-1">Helpful?</span>
                              <button
                                onClick={() => handleFeedback(message.id, "positive")}
                                className={`p-1 rounded-full ${message.feedback === "positive" ? "bg-green-100 text-green-600" : "hover:bg-gray-200"}`}
                                aria-label="Thumbs up"
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleFeedback(message.id, "negative")}
                                className={`p-1 rounded-full ${message.feedback === "negative" ? "bg-red-100 text-red-600" : "hover:bg-gray-200"}`}
                                aria-label="Thumbs down"
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Suggested resources */}
              {showResources && suggestedResources.length > 0 && !isTyping && (
                <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-3 text-sm">
                  <div className="font-medium mb-2 flex items-center">
                    <HelpCircle className="w-4 h-4 mr-1" />
                    Suggested Resources
                  </div>
                  <div className="space-y-2">
                    {suggestedResources.map((resource, index) => (
                      <div key={index} className="flex items-start">
                        <div className="w-4 h-4 mt-0.5 mr-2 text-purple-600">
                          {resource.type === "video" ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-4 h-4"
                            >
                              <polygon points="23 7 16 12 23 17 23 7" />
                              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                            </svg>
                          ) : resource.type === "tool" ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-4 h-4"
                            >
                              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-4 h-4"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                              <polyline points="10 9 9 9 8 9" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:underline font-medium"
                          >
                            {resource.title}
                          </a>
                          {resource.description && <p className="text-xs text-gray-500">{resource.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </CardContent>

          {/* Suggested questions */}
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleSuggestedQuestion(question)}
                  disabled={isTyping}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>

          <CardFooter className="p-3 border-t">
            <form onSubmit={handleSubmit} className="flex w-full space-x-2">
              <Input
                id="chat-input"
                type="text"
                placeholder="Ask about Masterin..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-grow text-sm"
                disabled={isTyping}
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="submit" size="sm" disabled={!inputValue.trim() || isTyping}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Send message</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </form>
          </CardFooter>
        </>
      )}

      <div className="p-3 bg-gray-50 dark:bg-gray-900 border-t text-center">
        <Link href="/ai/chat">
          <Button variant="outline" size="sm" className="w-full">
            Open Full Chat <ArrowRight className="ml-2 w-3 h-3" />
          </Button>
        </Link>
      </div>
    </Card>
  )
}
