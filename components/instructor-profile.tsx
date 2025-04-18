import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Mail, MessageSquare, Users } from "lucide-react"
import Link from "next/link"
import type { Instructor } from "@/lib/courses-data"

interface InstructorProfileProps {
  instructor: Instructor
  courseCount?: number
  studentCount?: number
}

export function InstructorProfile({ instructor, courseCount = 5, studentCount = 1500 }: InstructorProfileProps) {
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
              <Badge variant="outline" className="mb-2">
                {instructor.title}
              </Badge>
              <div className="flex space-x-2 mt-2">
                <Button size="sm" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button size="sm" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-bold">{instructor.name}</h3>
            <p className="text-muted-foreground mb-4">{instructor.title}</p>

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
                    <div className="text-2xl font-bold">{courseCount}</div>
                    <div className="text-sm text-muted-foreground">Courses</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{studentCount.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Students</div>
                  </div>
                </div>

                <div className="mt-4 bg-muted rounded-lg p-4">
                  <h4 className="font-medium mb-2">Teaching Experience</h4>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Student Satisfaction</span>
                    <span className="text-sm font-medium">4.8/5</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: "96%" }}></div>
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
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {["Advanced Biology", "Chemistry Fundamentals", "Environmental Science"][i]}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {["32 weeks", "10 weeks", "12 weeks"][i]} • {["Advanced", "Beginner", "Intermediate"][i]}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href="#">View</Link>
                      </Button>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full text-sm" asChild>
                    <Link href="#">View All Courses</Link>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
