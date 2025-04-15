"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Check, Play } from "lucide-react"

interface CourseProgressProps {
  userId: string
  courseId: string
  totalLessons: number
}

export function CourseProgress({ userId, courseId, totalLessons }: CourseProgressProps) {
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)

  // Fetch progress
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/courses/${courseId}/progress?userId=${userId}`)
        if (response.ok) {
          const data = await response.json()
          setProgress(data.progress)
        }
      } catch (error) {
        console.error("Failed to fetch progress:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [userId, courseId])

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">Your progress</span>
        <span className="text-sm text-gray-500">{progress}% complete</span>
      </div>
      <Progress value={progress} className="h-2 mb-4" />

      {progress === 0 ? (
        <Button className="w-full">
          <Play className="h-4 w-4 mr-2" />
          Start Learning
        </Button>
      ) : progress === 100 ? (
        <Button variant="outline" className="w-full">
          <Check className="h-4 w-4 mr-2" />
          Completed
        </Button>
      ) : (
        <Button className="w-full">
          <Play className="h-4 w-4 mr-2" />
          Continue Learning
        </Button>
      )}
    </div>
  )
}
