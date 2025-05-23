import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function LessonPlanGenerator() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <h1 className="text-4xl font-bold mb-2">Lesson Plan Generator</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Create detailed, customized lesson plans for any subject or grade level
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Lesson Plan Parameters</CardTitle>
            <CardDescription>Configure the details for your lesson plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select defaultValue="science">
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="math">Mathematics</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="language">Language Arts</SelectItem>
                  <SelectItem value="social">Social Studies</SelectItem>
                  <SelectItem value="art">Art</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="pe">Physical Education</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">Grade Level</Label>
              <Select defaultValue="5">
                <SelectTrigger>
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="k">Kindergarten</SelectItem>
                  <SelectItem value="1">1st Grade</SelectItem>
                  <SelectItem value="2">2nd Grade</SelectItem>
                  <SelectItem value="3">3rd Grade</SelectItem>
                  <SelectItem value="4">4th Grade</SelectItem>
                  <SelectItem value="5">5th Grade</SelectItem>
                  <SelectItem value="6">6th Grade</SelectItem>
                  <SelectItem value="7">7th Grade</SelectItem>
                  <SelectItem value="8">8th Grade</SelectItem>
                  <SelectItem value="9">9th Grade</SelectItem>
                  <SelectItem value="10">10th Grade</SelectItem>
                  <SelectItem value="11">11th Grade</SelectItem>
                  <SelectItem value="12">12th Grade</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Lesson Topic</Label>
              <Input id="topic" placeholder="e.g., Photosynthesis" defaultValue="Solar System" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select defaultValue="45">
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                  <SelectItem value="120">120 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="objectives">Learning Objectives</Label>
              <Textarea
                id="objectives"
                placeholder="Enter key learning objectives..."
                className="min-h-[100px]"
                defaultValue="Students will be able to identify and describe the planets in our solar system."
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Generate Lesson Plan</Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Generated Lesson Plan</CardTitle>
            <CardDescription>5th Grade Science: Solar System</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Lesson Overview</h3>
              <p className="text-muted-foreground">
                This 45-minute lesson introduces 5th grade students to the solar system, focusing on the planets and
                their characteristics.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Learning Objectives</h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Students will be able to identify the eight planets in our solar system</li>
                <li>Students will be able to describe key characteristics of each planet</li>
                <li>Students will understand the relative positions of the planets from the sun</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Materials Needed</h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Solar system poster or digital presentation</li>
                <li>Planet fact cards (one set per group)</li>
                <li>Colored pencils and drawing paper</li>
                <li>Solar system model (if available)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Lesson Procedure</h3>
              <div className="space-y-3 text-muted-foreground">
                <div>
                  <h4 className="font-medium">Introduction (5 minutes)</h4>
                  <p>
                    Begin by asking students what they already know about the solar system. Show a picture or video of
                    the solar system and discuss.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Direct Instruction (15 minutes)</h4>
                  <p>
                    Present information about each planet using visual aids. Discuss the order of planets from the sun,
                    their sizes, and key characteristics.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Group Activity (15 minutes)</h4>
                  <p>
                    Divide students into small groups. Each group receives a set of planet fact cards. Students work
                    together to match planet names with their descriptions.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Assessment/Closure (10 minutes)</h4>
                  <p>
                    Students create a simple diagram of the solar system, labeling each planet. Discuss as a class what
                    they learned about the solar system.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Assessment</h3>
              <p className="text-muted-foreground">
                Formative: Monitor student participation in discussions and group work.
                <br />
                Summative: Evaluate student diagrams for accuracy and completeness.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Extensions</h3>
              <p className="text-muted-foreground">
                For advanced students: Research and present on dwarf planets or specific features of a chosen planet.
                <br />
                For students needing support: Work with a partner and focus on the four inner planets only.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Download PDF</Button>
            <Button variant="outline">Download DOCX</Button>
            <Button>Save to My Lessons</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
