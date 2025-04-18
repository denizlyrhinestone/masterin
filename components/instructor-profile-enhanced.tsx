"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Mail, MessageSquare, Users, Star } from "lucide-react"
import Link from "next/link"
import type { Instructor, Course } from "@/lib/courses-data"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

interface InstructorProfileEnhancedProps {
  instructor: Instructor
  courses: Course[]
  courseCount?: number
  studentCount?: number
}

export function InstructorProfileEnhanced({
  instructor,
  courses,
  courseCount,
  studentCount = 1500,
}: InstructorProfileEnhancedProps) {
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [messageSubject, setMessageSubject] = useState("")
  const [messageContent, setMessageContent] = useState("")

  // Calculate instructor stats if not provided
  const actualCourseCount = courseCount || courses.length
  const actualStudentCount = studentCount || courses.reduce((total, course) => total + course.enrollmentCount, 0)

  // Calculate average rating
  const averageRating =
    courses.length > 0
      ? (courses.reduce((total, course) => total + course.rating, 0) / courses.length).toFixed(1)
      : "N/A"

  const handleSendMessage = () => {
    if (!messageSubject.trim() || !messageContent.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    // Simulate sending message
    toast({
      title: "Message Sent",
      description: `Your message has been sent to ${instructor.name}`,
    })

    setMessageDialogOpen(false)
    setMessageSubject("")
    setMessageContent("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Instructor Profile</CardTitle>
        <CardDescription>Learn more about your course instructor</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center">
            <Avatar className="h-32 w-32 border-2 border-primary/10">
              <AvatarImage src={instructor.avatar || "/placeholder.svg"} alt={instructor.name} />
              <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="mt-4 flex flex-col items-center">
              <h3 className="text-xl font-bold">{instructor.name}</h3>
              <Badge variant="outline" className="mb-2">
                {instructor.title}
              </Badge>
              <div className="flex space-x-2 mt-2">
                <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send Message to {instructor.name}</DialogTitle>
                      <DialogDescription>
                        Your message will be sent directly to the instructor. They typically respond within 48 hours.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Subject</label>
                        <Input
                          placeholder="Enter message subject"
                          value={messageSubject}
                          onChange={(e) => setMessageSubject(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Message</label>
                        <Textarea
                          placeholder="Type your message here..."
                          className="min-h-[150px]"
                          value={messageContent}
                          onChange={(e) => setMessageContent(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSendMessage}>Send Message</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button size="sm" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <Tabs defaultValue="bio">
              <TabsList className="mb-4">
                <TabsTrigger value="bio">Biography</TabsTrigger>
                <TabsTrigger value="stats">Statistics</TabsTrigger>
                <TabsTrigger value="courses">Courses</TabsTrigger>
              </TabsList>

              <TabsContent value="bio">
                <div className="prose prose-sm max-w-none">
                  <p>{instructor.bio}</p>
                </div>
              </TabsContent>

              <TabsContent value="stats">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{actualCourseCount}</div>
                    <div className="text-sm text-muted-foreground">Courses</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{actualStudentCount.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Students</div>
                  </div>
                </div>

                <div className="mt-4 bg-muted rounded-lg p-4">
                  <h4 className="font-medium mb-2">Teaching Experience</h4>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Student Satisfaction</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-amber-500 mr-1" />
                      <span className="text-sm font-medium">{averageRating}/5</span>
                    </div>
                  </div>
                  <div className="w-full bg-background rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{ width: `${(Number.parseFloat(averageRating) / 5) * 100}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center mt-3 mb-1">
                    <span className="text-sm">Response Rate</span>
                    <span className="text-sm font-medium">92%</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: "92%" }}></div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="courses">
                <div className="space-y-3">
                  {courses.length > 0 ? (
                    courses.map((course, index) => (
                      <div key={course.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{course.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {course.duration} • {course.level}
                          </p>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/courses/${course.id}`}>View</Link>
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <h4 className="text-sm font-medium">No courses available</h4>
                    </div>
                  )}

                  {courses.length > 3 && (
                    <Button variant="ghost" className="w-full text-sm" asChild>
                      <Link href={`/instructors/${instructor.id}`}>View All Courses</Link>
                    </Button>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
