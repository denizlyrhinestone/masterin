export interface VideoCompanion {
  videoId: string
  title: string
  questions: Question[]
  notes: Note[]
  summary: string
  keyPoints: string[]
  usedAI: boolean
  timestamp: string
}

export interface Question {
  id: string
  text: string
  type: "multiple-choice" | "open-ended" | "true-false"
  options?: string[]
  correctAnswer?: string | number
  timestamp: number
}

export interface Note {
  id: string
  text: string
  timestamp: number
}
