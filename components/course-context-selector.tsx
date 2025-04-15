"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings } from "lucide-react"

// Sample courses data - in a real app, this would come from your API/database
const sampleCourses = [
  {
    id: "ml-intro",
    title: "Introduction to Machine Learning",
    topics: ["Supervised Learning", "Unsupervised Learning", "Neural Networks", "Decision Trees"],
  },
  {
    id: "web-dev",
    title: "Full-Stack Web Development",
    topics: ["HTML & CSS Fundamentals", "JavaScript Basics", "React Framework", "Backend with Node.js"],
  },
  {
    id: "data-science",
    title: "Data Science Fundamentals",
    topics: ["Data Cleaning", "Exploratory Data Analysis", "Statistical Methods", "Data Visualization"],
  },
]

interface CourseContextSelectorProps {
  onContextChange: (courseId: string, topicId: string) => void
}

export function CourseContextSelector({ onContextChange }: CourseContextSelectorProps) {
  const [selectedCourse, setSelectedCourse] = useState("")
  const [selectedTopic, setSelectedTopic] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId)
    setSelectedTopic("")
  }

  const handleTopicChange = (topicId: string) => {
    setSelectedTopic(topicId)
  }

  const handleApply = () => {
    if (selectedCourse && selectedTopic) {
      onContextChange(selectedCourse, selectedTopic)
      setIsOpen(false)
    }
  }

  // Get the selected course object
  const course = sampleCourses.find((c) => c.id === selectedCourse)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          <span>Learning Context</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Learning Context</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Course</label>
            <Select value={selectedCourse} onValueChange={handleCourseChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {sampleCourses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Topic</label>
            <Select value={selectedTopic} onValueChange={handleTopicChange} disabled={!selectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder={selectedCourse ? "Select a topic" : "Select a course first"} />
              </SelectTrigger>
              <SelectContent>
                {course?.topics.map((topic, index) => (
                  <SelectItem key={index} value={topic}>
                    {topic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4">
            <Button onClick={handleApply} disabled={!selectedCourse || !selectedTopic} className="w-full">
              Apply Context
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
