"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import type { Course } from "@/types"

interface CourseEditFormProps {
  course: Course
}

export default function CourseEditForm({ course }: CourseEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: course.title,
    slug: course.slug,
    description: course.description,
    thumbnailUrl: course.thumbnailUrl || "",
    durationMinutes: course.durationMinutes || 0,
    isFeatured: course.isFeatured || false,
    isPublished: course.isPublished || false,
    subjectId: course.subject?.id || "",
    gradeLevelId: course.gradeLevel?.id || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/admin/courses/${course.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to update course")
      }

      toast({
        title: "Success",
        description: "Course updated successfully",
      })

      router.push("/admin/courses")
    } catch (error) {
      console.error("Error updating course:", error)
      toast({
        title: "Error",
        description: "Failed to update course",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleInputChange("slug", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
              <Input
                id="thumbnailUrl"
                value={formData.thumbnailUrl}
                onChange={(e) => handleInputChange("thumbnailUrl", e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="durationMinutes">Duration (minutes)</Label>
              <Input
                id="durationMinutes"
                type="number"
                value={formData.durationMinutes}
                onChange={(e) => handleInputChange("durationMinutes", Number.parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={formData.subjectId} onValueChange={(value) => handleInputChange("subjectId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Mathematics</SelectItem>
                  <SelectItem value="2">Science</SelectItem>
                  <SelectItem value="3">English</SelectItem>
                  <SelectItem value="4">History</SelectItem>
                  <SelectItem value="5">Computer Science</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Grade Level</Label>
              <Select value={formData.gradeLevelId} onValueChange={(value) => handleInputChange("gradeLevelId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a grade level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Elementary</SelectItem>
                  <SelectItem value="2">Middle School</SelectItem>
                  <SelectItem value="3">High School</SelectItem>
                  <SelectItem value="4">College</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="isFeatured"
                checked={formData.isFeatured}
                onCheckedChange={(checked) => handleInputChange("isFeatured", checked)}
              />
              <Label htmlFor="isFeatured">Featured Course</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isPublished"
                checked={formData.isPublished}
                onCheckedChange={(checked) => handleInputChange("isPublished", checked)}
              />
              <Label htmlFor="isPublished">Published</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/courses")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Course"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
