import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// AI model configuration
const defaultModel = "gpt-4o"

// Base prompts for different educational features
const SYSTEM_PROMPTS = {
  tutor: `You are an expert educational tutor with deep knowledge across multiple subjects. 
  Your goal is to provide clear, accurate, and helpful explanations tailored to the student's level.
  Break down complex concepts into understandable parts and use examples when helpful.
  If you're unsure about something, acknowledge it rather than providing incorrect information.`,

  assignmentGenerator: `You are an expert educational content creator specializing in creating engaging assignments.
  Create assignments that are clear, educational, and appropriate for the specified subject and difficulty level.
  Include learning objectives, instructions, and grading criteria when appropriate.`,

  quizGenerator: `You are an expert at creating educational assessments and quizzes.
  Create questions that test understanding rather than just memorization.
  Provide clear questions and answer options when creating multiple choice questions.
  Include a mix of question types appropriate for the subject matter.`,

  flashcardGenerator: `You are an expert at creating effective flashcards for learning and memorization.
  Create concise, clear flashcards with an appropriate question/prompt on one side and the answer/information on the other.
  Focus on key concepts, definitions, and relationships that are important to understand.`,
}

// Types for the different educational features
export interface TutorResponse {
  answer: string
  relatedTopics?: string[]
  resources?: { title: string; description: string }[]
}

export interface Assignment {
  title: string
  description: string
  learningObjectives: string[]
  instructions: string
  tasks: { description: string; points: number }[]
  resources?: string[]
  gradingCriteria?: string
  estimatedTime?: string
}

export interface QuizQuestion {
  question: string
  type: "multiple-choice" | "true-false" | "short-answer" | "essay"
  options?: string[]
  correctAnswer?: string | number
  explanation?: string
  points?: number
}

export interface Quiz {
  title: string
  description: string
  timeLimit?: string
  questions: QuizQuestion[]
  totalPoints: number
}

export interface Flashcard {
  front: string
  back: string
  category?: string
}

// AI Tutor function
export async function getAITutorResponse(
  question: string,
  subject?: string,
  userLevel?: string,
): Promise<TutorResponse> {
  try {
    const prompt = `
      Question: ${question}
      ${subject ? `Subject: ${subject}` : ""}
      ${userLevel ? `Student Level: ${userLevel}` : ""}
      
      Provide a helpful, educational response in JSON format with the following structure:
      {
        "answer": "Your detailed answer here",
        "relatedTopics": ["Topic 1", "Topic 2"],
        "resources": [
          { "title": "Resource Title", "description": "Brief description" }
        ]
      }
    `

    const { text } = await generateText({
      model: openai(defaultModel),
      system: SYSTEM_PROMPTS.tutor,
      prompt,
    })

    // Parse the JSON response
    try {
      return JSON.parse(text) as TutorResponse
    } catch (e) {
      // If parsing fails, return just the text as the answer
      console.error("Failed to parse AI response as JSON:", e)
      return { answer: text }
    }
  } catch (error) {
    console.error("Error getting AI tutor response:", error)
    return {
      answer: "I'm sorry, I encountered an error while processing your question. Please try again later.",
    }
  }
}

// Assignment Generator function
export async function generateAssignment(
  subject: string,
  topic: string,
  difficultyLevel: string,
  additionalRequirements?: string,
): Promise<Assignment> {
  try {
    const prompt = `
      Create an educational assignment with the following parameters:
      Subject: ${subject}
      Topic: ${topic}
      Difficulty Level: ${difficultyLevel}
      ${additionalRequirements ? `Additional Requirements: ${additionalRequirements}` : ""}
      
      Generate a complete assignment in JSON format with the following structure:
      {
        "title": "Assignment title",
        "description": "Brief overview of the assignment",
        "learningObjectives": ["Objective 1", "Objective 2"],
        "instructions": "Detailed instructions for completing the assignment",
        "tasks": [
          { "description": "Task 1 description", "points": 10 },
          { "description": "Task 2 description", "points": 15 }
        ],
        "resources": ["Resource 1", "Resource 2"],
        "gradingCriteria": "Information about how the assignment will be graded",
        "estimatedTime": "Estimated time to complete (e.g., '2 hours')"
      }
    `

    const { text } = await generateText({
      model: openai(defaultModel),
      system: SYSTEM_PROMPTS.assignmentGenerator,
      prompt,
    })

    // Parse the JSON response
    try {
      return JSON.parse(text) as Assignment
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", e)
      return {
        title: "Error in Assignment Generation",
        description: "There was an error generating your assignment. Please try again.",
        learningObjectives: [],
        instructions: "",
        tasks: [],
      }
    }
  } catch (error) {
    console.error("Error generating assignment:", error)
    return {
      title: "Error in Assignment Generation",
      description: "There was an error generating your assignment. Please try again.",
      learningObjectives: [],
      instructions: "",
      tasks: [],
    }
  }
}

// Quiz Generator function
export async function generateQuiz(
  subject: string,
  topic: string,
  numberOfQuestions: number,
  difficultyLevel: string,
  questionTypes?: string[],
): Promise<Quiz> {
  try {
    const prompt = `
      Create an educational quiz with the following parameters:
      Subject: ${subject}
      Topic: ${topic}
      Number of Questions: ${numberOfQuestions}
      Difficulty Level: ${difficultyLevel}
      ${questionTypes ? `Question Types: ${questionTypes.join(", ")}` : ""}
      
      Generate a complete quiz in JSON format with the following structure:
      {
        "title": "Quiz title",
        "description": "Brief description of the quiz",
        "timeLimit": "Suggested time limit (e.g., '30 minutes')",
        "questions": [
          {
            "question": "Question text",
            "type": "multiple-choice", // or "true-false", "short-answer", "essay"
            "options": ["Option A", "Option B", "Option C", "Option D"], // for multiple-choice
            "correctAnswer": "Option A or index (0-3)", // omit for essay questions
            "explanation": "Explanation of the correct answer",
            "points": 5
          }
          // more questions...
        ],
        "totalPoints": 100
      }
    `

    const { text } = await generateText({
      model: openai(defaultModel),
      system: SYSTEM_PROMPTS.quizGenerator,
      prompt,
    })

    // Parse the JSON response
    try {
      return JSON.parse(text) as Quiz
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", e)
      return {
        title: "Error in Quiz Generation",
        description: "There was an error generating your quiz. Please try again.",
        questions: [],
        totalPoints: 0,
      }
    }
  } catch (error) {
    console.error("Error generating quiz:", error)
    return {
      title: "Error in Quiz Generation",
      description: "There was an error generating your quiz. Please try again.",
      questions: [],
      totalPoints: 0,
    }
  }
}

// Flashcard Generator function
export async function generateFlashcards(
  subject: string,
  topic: string,
  numberOfCards: number,
  content?: string,
): Promise<Flashcard[]> {
  try {
    const prompt = `
      Create educational flashcards with the following parameters:
      Subject: ${subject}
      Topic: ${topic}
      Number of Flashcards: ${numberOfCards}
      ${content ? `Content to base flashcards on: ${content}` : ""}
      
      Generate flashcards in JSON format with the following structure:
      [
        {
          "front": "Question or prompt side of the flashcard",
          "back": "Answer or information side of the flashcard",
          "category": "Optional category or subtopic"
        }
        // more flashcards...
      ]
    `

    const { text } = await generateText({
      model: openai(defaultModel),
      system: SYSTEM_PROMPTS.flashcardGenerator,
      prompt,
    })

    // Parse the JSON response
    try {
      return JSON.parse(text) as Flashcard[]
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", e)
      return [{ front: "Error generating flashcards", back: "Please try again" }]
    }
  } catch (error) {
    console.error("Error generating flashcards:", error)
    return [{ front: "Error generating flashcards", back: "Please try again" }]
  }
}
