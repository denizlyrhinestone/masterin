"use client"

import type React from "react"

import { useRef } from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useChat } from "@ai-sdk/react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader2,
  Send,
  BookOpen,
  Code,
  Calculator,
  Globe,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Lightbulb,
  HelpCircle,
  Settings,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"

// Sample courses data - in a real app, this would come from your API/database
const coursesData = {
  "ml-intro": {
    title: "Introduction to Machine Learning",
    description: "A comprehensive introduction to machine learning concepts and applications",
    topics: {
      "Supervised Learning": [
        "Understand classification and regression",
        "Learn about training and test datasets",
        "Explore evaluation metrics",
        "Implement supervised learning algorithms",
      ],
      "Unsupervised Learning": [
        "Understand clustering and dimensionality reduction",
        "Learn about K-means and hierarchical clustering",
        "Explore principal component analysis",
        "Implement unsupervised learning algorithms",
      ],
      "Neural Networks": [
        "Understand the structure and function of neural networks",
        "Learn about activation functions and their purposes",
        "Explore backpropagation and gradient descent",
        "Implement a simple neural network",
      ],
      "Decision Trees": [
        "Understand decision tree structure and function",
        "Learn about information gain and entropy",
        "Explore tree pruning techniques",
        "Implement decision trees and random forests",
      ],
    },
  },
  "web-dev": {
    title: "Full-Stack Web Development",
    description: "Learn to build modern web applications from front to back",
    topics: {
      "HTML & CSS Fundamentals": [
        "Understand HTML document structure",
        "Learn CSS selectors and properties",
        "Explore responsive design principles",
        "Implement layouts using flexbox and grid",
      ],
      "JavaScript Basics": [
        "Understand JavaScript syntax and data types",
        "Learn about functions, objects, and arrays",
        "Explore DOM manipulation",
        "Implement interactive web features",
      ],
      "React Framework": [
        "Understand React component architecture",
        "Learn about props and state management",
        "Explore hooks and context API",
        "Implement a single-page application",
      ],
      "Backend with Node.js": [
        "Understand server-side JavaScript",
        "Learn about Express.js framework",
        "Explore RESTful API design",
        "Implement a full-stack application",
      ],
    },
  },
  "data-science": {
    title: "Data Science Fundamentals",
    description: "Master the essential skills for analyzing and interpreting data",
    topics: {
      "Data Cleaning": [
        "Understand common data quality issues",
        "Learn techniques for handling missing values",
        "Explore outlier detection methods",
        "Implement data cleaning pipelines",
      ],
      "Exploratory Data Analysis": [
        "Understand descriptive statistics",
        "Learn about data distributions",
        "Explore correlation and covariance",
        "Implement EDA workflows",
      ],
      "Statistical Methods": [
        "Understand hypothesis testing",
        "Learn about confidence intervals",
        "Explore regression analysis",
        "Implement statistical tests",
      ],
      "Data Visualization": [
        "Understand principles of effective visualization",
        "Learn about different chart types",
        "Explore interactive visualization tools",
        "Implement dashboards and reports",
      ],
    },
  },
}

// Define the course context type
interface CourseContext {
  title: string
  description: string
  currentTopic: string
  learningObjectives: string[]
}

export default function AiLearningContextPage() {
  // State for course context selector
  const [courseContext, setCourseContext] = useState<CourseContext | null>(null)
  const [showSelector, setShowSelector] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState("")
  const [selectedTopic, setSelectedTopic] = useState("")

  // State for AI chat
  const [activeTab, setActiveTab] = useState("general")
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [showHelpDialog, setShowHelpDialog] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // State to track client-side rendering
  const [isClient, setIsClient] = useState(false)

  // Only render client-side components after mount
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Initialize the chat with AI SDK
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, reload } = useChat({
    api: "/api/enhanced-tutor",
    body: {
      courseContext,
    },
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hello! I'm your AI learning assistant. I can help you understand concepts, solve problems, and provide learning resources. What would you like to learn today?",
      },
    ],
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to connect to AI tutor. Please try again later.",
        variant: "destructive",
      })
    },
  })

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Handle course selection
  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourse(e.target.value)
    setSelectedTopic("")
  }

  // Handle topic selection
  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTopic(e.target.value)
  }

  // Apply selected course and topic
  const handleApply = () => {
    if (selectedCourse && selectedTopic) {
      const course = coursesData[selectedCourse as keyof typeof coursesData]
      if (course && course.topics[selectedTopic as keyof typeof course.topics]) {
        setCourseContext({
          title: course.title,
          description: course.description,
          currentTopic: selectedTopic,
          learningObjectives: course.topics[selectedTopic as keyof typeof course.topics],
        })
      }
      setShowSelector(false)
    }
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)

    // Prepare a prompt based on the selected tab
    let prompt = ""
    switch (value) {
      case "programming":
        prompt = "I'd like to learn about programming concepts."
        break
      case "math":
        prompt = "I need help with mathematics."
        break
      case "languages":
        prompt = "I want to practice a new language."
        break
      default:
        return // Don't send a message for general tab
    }

    // Only send if changing to a specific subject tab
    if (value !== "general") {
      const form = new FormData()
      form.append("message", prompt)
      handleSubmit({
        preventDefault: () => {},
        currentTarget: { elements: { message: { value: prompt } } },
      } as any)
    }
  }

  // Handle feedback submission
  const handleFeedback = (messageId: string, isPositive: boolean) => {
    setFeedbackMessage(messageId)

    if (!isPositive) {
      setShowFeedbackDialog(true)
    } else {
      // Submit positive feedback
      toast({
        title: "Thank you for your feedback",
        description: "We're glad this response was helpful!",
      })

      // In a real app, you would send this feedback to your backend
      console.log("Positive feedback for message:", messageId)
    }
  }

  // Submit detailed feedback
  const submitDetailedFeedback = () => {
    // In a real app, you would send this feedback to your backend
    console.log("Detailed feedback:", {
      messageId: feedbackMessage,
      feedback: feedbackText,
    })

    toast({
      title: "Feedback submitted",
      description: "Thank you for helping us improve our AI tutor.",
    })

    setShowFeedbackDialog(false)
    setFeedbackText("")
    setFeedbackMessage(null)
  }

  // Generate a suggested question based on the course context
  const getSuggestedQuestion = () => {
    if (!courseContext) return "What is the difference between machine learning and deep learning?"

    const suggestions = [
      `Can you explain the concept of ${courseContext.currentTopic}?`,
      `What are the key principles of ${courseContext.currentTopic}?`,
      `How does ${courseContext.currentTopic} relate to ${courseContext.title}?`,
      `Can you provide an example of ${courseContext.currentTopic} in practice?`,
      `What are common challenges when learning about ${courseContext.currentTopic}?`,
    ]

    return suggestions[Math.floor(Math.random() * suggestions.length)]
  }

  // Insert a suggested question into the input
  const insertSuggestedQuestion = () => {
    handleInputChange({ target: { value: getSuggestedQuestion() } } as any)
  }

  // If not client-side yet, return a loading indicator
  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">AI Learning Assistant</h1>
          <p className="text-lg text-gray-700 mb-8">Loading...</p>
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">AI Learning Assistant</h1>
        <p className="text-lg text-gray-700 mb-8">
          Ask questions, get explanations, and receive personalized learning recommendations from our advanced AI tutor.
        </p>

        <div className="flex justify-end mb-6">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowSelector(!showSelector)}>
            <Settings className="h-4 w-4" />
            <span>Learning Context</span>
          </Button>
        </div>

        {showSelector && (
          <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Set Learning Context</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Course</label>
                <select value={selectedCourse} onChange={handleCourseChange} className="w-full p-2 border rounded-md">
                  <option value="">Select a course</option>
                  {Object.entries(coursesData).map(([id, course]) => (
                    <option key={id} value={id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Topic</label>
                <select
                  value={selectedTopic}
                  onChange={handleTopicChange}
                  disabled={!selectedCourse}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">{selectedCourse ? "Select a topic" : "Select a course first"}</option>
                  {selectedCourse &&
                    Object.keys(coursesData[selectedCourse as keyof typeof coursesData].topics).map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowSelector(false)}>
                  Cancel
                </Button>
                <Button onClick={handleApply} disabled={!selectedCourse || !selectedTopic}>
                  Apply Context
                </Button>
              </div>
            </div>
          </div>
        )}

        {courseContext ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Current Learning Context</h2>
            <p className="text-blue-700 mb-1">
              <span className="font-medium">Course:</span> {courseContext.title}
            </p>
            <p className="text-blue-700 mb-1">
              <span className="font-medium">Topic:</span> {courseContext.currentTopic}
            </p>
            <p className="text-sm text-blue-600">
              The AI tutor will provide responses relevant to your current learning context.
            </p>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">No Learning Context Selected</h2>
            <p className="text-yellow-700">
              Use the "Learning Context" button to select a course and topic for more relevant AI responses.
            </p>
          </div>
        )}

        <Card className="border-2">
          <Tabs defaultValue="general" onValueChange={handleTabChange}>
            <TabsList className="w-full justify-start p-0 bg-transparent border-b rounded-none">
              <TabsTrigger value="general" className="data-[state=active]:bg-blue-50 rounded-b-none">
                <BookOpen className="h-4 w-4 mr-2" />
                General
              </TabsTrigger>
              <TabsTrigger value="programming" className="data-[state=active]:bg-blue-50 rounded-b-none">
                <Code className="h-4 w-4 mr-2" />
                Programming
              </TabsTrigger>
              <TabsTrigger value="math" className="data-[state=active]:bg-blue-50 rounded-b-none">
                <Calculator className="h-4 w-4 mr-2" />
                Mathematics
              </TabsTrigger>
              <TabsTrigger value="languages" className="data-[state=active]:bg-blue-50 rounded-b-none">
                <Globe className="h-4 w-4 mr-2" />
                Languages
              </TabsTrigger>
            </TabsList>

            <CardContent className="p-0">
              <div className="h-[500px] flex flex-col">
                <div className="flex-1 overflow-y-auto p-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`mb-4 ${
                        message.role === "user" ? "bg-blue-50 ml-12 rounded-lg p-3" : "bg-gray-100 mr-12 rounded-lg p-3"
                      }`}
                    >
                      <div className="font-medium mb-1">{message.role === "user" ? "You" : "AI Tutor"}</div>
                      <div className="text-gray-700 whitespace-pre-wrap">{message.content}</div>

                      {/* Feedback buttons for AI responses */}
                      {message.role === "assistant" && message.id !== "welcome" && (
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <span className="mr-2">Was this helpful?</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 rounded-full"
                            onClick={() => handleFeedback(message.id, true)}
                          >
                            <ThumbsUp className="h-3 w-3" />
                            <span className="sr-only">Yes</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 rounded-full ml-1"
                            onClick={() => handleFeedback(message.id, false)}
                          >
                            <ThumbsDown className="h-3 w-3" />
                            <span className="sr-only">No</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}

                  {error && (
                    <div className="p-3 bg-red-50 text-red-800 rounded-lg mb-4">
                      <div className="font-medium">Error</div>
                      <div>
                        Failed to get a response. Please try again or reload the conversation.
                        <Button variant="outline" size="sm" className="mt-2" onClick={reload}>
                          <RefreshCw className="h-3 w-3 mr-2" />
                          Reload
                        </Button>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSubmit} className="p-4 border-t">
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <Textarea
                        name="message"
                        placeholder="Ask a question or describe what you want to learn..."
                        value={input}
                        onChange={handleInputChange}
                        className="min-h-[80px] pr-20"
                      />
                      <div className="absolute right-2 top-2 flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={insertSuggestedQuestion}
                          title="Insert a suggested question"
                        >
                          <Lightbulb className="h-4 w-4" />
                          <span className="sr-only">Suggest question</span>
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setShowHelpDialog(true)}
                          title="Get help with using the AI tutor"
                        >
                          <HelpCircle className="h-4 w-4" />
                          <span className="sr-only">Help</span>
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        {courseContext && (
                          <span>
                            Context: <strong>{courseContext.currentTopic}</strong>
                          </span>
                        )}
                      </div>
                      <Button type="submit" disabled={isLoading || !input.trim()} className="self-end">
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        <span className="ml-2">{isLoading ? "Thinking..." : "Send"}</span>
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </CardContent>
          </Tabs>
        </Card>

        {/* Feedback Dialog - Only rendered when needed */}
        {showFeedbackDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Help us improve</h2>
              <p className="text-sm text-gray-500 mb-4">
                We're sorry this response wasn't helpful. Please let us know how we can improve.
              </p>
              <Textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="What was wrong with this response? How could it be better?"
                className="min-h-[100px] mb-4"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={submitDetailedFeedback} disabled={!feedbackText.trim()}>
                  Submit Feedback
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Help Dialog - Only rendered when needed */}
        {showHelpDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">AI Tutor Help</h2>
              <div className="py-2">
                <h3 className="font-medium mb-2">How to use the AI Tutor</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="font-medium">Ask questions:</span> Type your question and press Send
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium">Choose a subject:</span> Use the tabs to focus on a specific subject
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium">Get suggestions:</span> Click the lightbulb icon for question ideas
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium">Provide feedback:</span> Let us know if responses are helpful
                  </li>
                </ul>

                <h3 className="font-medium mt-4 mb-2">Tips for better results</h3>
                <ul className="space-y-2 text-sm">
                  <li>Be specific in your questions</li>
                  <li>Provide context about what you're studying</li>
                  <li>Ask for examples if concepts are unclear</li>
                  <li>Request step-by-step explanations for complex topics</li>
                </ul>
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={() => setShowHelpDialog(false)}>Close</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
