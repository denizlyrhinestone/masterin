"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, XCircle } from "lucide-react"

interface QuizQuestion {
  id: string
  question: string
  options: {
    id: string
    text: string
  }[]
  correctOptionId: string
  explanation?: string
}

interface WrittenExercise {
  id: string
  question: string
  sampleAnswer?: string
}

interface LessonExercisesProps {
  quizQuestions?: QuizQuestion[]
  writtenExercises?: WrittenExercise[]
  onComplete?: () => void
}

export default function LessonExercises({
  quizQuestions = [],
  writtenExercises = [],
  onComplete,
}: LessonExercisesProps) {
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [writtenAnswers, setWrittenAnswers] = useState<Record<string, string>>({})
  const [showSampleAnswers, setShowSampleAnswers] = useState<Record<string, boolean>>({})

  const handleQuizSubmit = () => {
    setQuizSubmitted(true)
  }

  const handleWrittenAnswerChange = (exerciseId: string, value: string) => {
    setWrittenAnswers((prev) => ({
      ...prev,
      [exerciseId]: value,
    }))
  }

  const toggleSampleAnswer = (exerciseId: string) => {
    setShowSampleAnswers((prev) => ({
      ...prev,
      [exerciseId]: !prev[exerciseId],
    }))
  }

  const isQuizCorrect = quizQuestions.every((q) => quizAnswers[q.id] === q.correctOptionId)

  const isQuizComplete = quizQuestions.length > 0 && quizQuestions.every((q) => quizAnswers[q.id])

  const areWrittenExercisesComplete =
    writtenExercises.length > 0 && writtenExercises.every((e) => writtenAnswers[e.id]?.trim().length > 0)

  const isAllComplete =
    (quizQuestions.length === 0 || (quizSubmitted && isQuizCorrect)) &&
    (writtenExercises.length === 0 || areWrittenExercisesComplete)

  return (
    <div className="space-y-6">
      {quizQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Knowledge Check</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {quizQuestions.map((question) => (
                <div key={question.id} className="space-y-3">
                  <h3 className="font-medium">{question.question}</h3>
                  <RadioGroup
                    value={quizAnswers[question.id]}
                    onValueChange={(value) => {
                      if (!quizSubmitted) {
                        setQuizAnswers((prev) => ({
                          ...prev,
                          [question.id]: value,
                        }))
                      }
                    }}
                    disabled={quizSubmitted}
                  >
                    {question.options.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.id} id={`${question.id}-${option.id}`} />
                        <Label
                          htmlFor={`${question.id}-${option.id}`}
                          className={
                            quizSubmitted
                              ? option.id === question.correctOptionId
                                ? "text-green-600"
                                : quizAnswers[question.id] === option.id
                                  ? "text-red-500"
                                  : ""
                              : ""
                          }
                        >
                          {option.text}
                          {quizSubmitted && option.id === question.correctOptionId && (
                            <CheckCircle className="inline-block ml-2 h-4 w-4 text-green-600" />
                          )}
                          {quizSubmitted &&
                            quizAnswers[question.id] === option.id &&
                            option.id !== question.correctOptionId && (
                              <XCircle className="inline-block ml-2 h-4 w-4 text-red-500" />
                            )}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {quizSubmitted && question.explanation && (
                    <div className="text-sm bg-muted p-3 rounded-md mt-2">
                      <strong>Explanation:</strong> {question.explanation}
                    </div>
                  )}
                </div>
              ))}

              {!quizSubmitted && (
                <Button onClick={handleQuizSubmit} disabled={!isQuizComplete}>
                  Submit Answers
                </Button>
              )}

              {quizSubmitted && (
                <div
                  className={`p-4 rounded-md ${isQuizCorrect ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"}`}
                >
                  <p
                    className={`font-medium ${isQuizCorrect ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
                  >
                    {isQuizCorrect
                      ? "Great job! All answers are correct."
                      : "Some answers are incorrect. Please review and try again."}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {writtenExercises.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Practice Exercises</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {writtenExercises.map((exercise) => (
                <div key={exercise.id} className="space-y-3">
                  <h3 className="font-medium">{exercise.question}</h3>
                  <Textarea
                    placeholder="Type your answer here..."
                    value={writtenAnswers[exercise.id] || ""}
                    onChange={(e) => handleWrittenAnswerChange(exercise.id, e.target.value)}
                    rows={4}
                  />
                  {exercise.sampleAnswer && (
                    <div>
                      <Button variant="outline" size="sm" onClick={() => toggleSampleAnswer(exercise.id)}>
                        {showSampleAnswers[exercise.id] ? "Hide" : "Show"} Sample Answer
                      </Button>

                      {showSampleAnswers[exercise.id] && (
                        <div className="mt-2 p-3 bg-muted rounded-md text-sm">
                          <strong>Sample Answer:</strong>
                          <p className="mt-1">{exercise.sampleAnswer}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {onComplete && (
        <div className="flex justify-end">
          <Button onClick={onComplete} disabled={!isAllComplete}>
            Complete Exercises
          </Button>
        </div>
      )}
    </div>
  )
}
