import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle, Clock, PlayCircle, FileText, LockIcon } from "lucide-react"

interface Lesson {
  id: string
  title: string
  duration: string
  type: "video" | "reading" | "quiz"
  isCompleted?: boolean
  isLocked?: boolean
}

interface Module {
  id: string
  title: string
  description?: string
  lessons: Lesson[]
}

interface CourseContentProps {
  modules: Module[]
  totalLessons: number
  totalDuration: string
}

export default function CourseContent({ modules, totalLessons, totalDuration }: CourseContentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Content</CardTitle>
        <div className="text-sm text-muted-foreground">
          {totalLessons} lessons • {totalDuration} total length
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {modules.map((module) => (
            <AccordionItem key={module.id} value={module.id}>
              <AccordionTrigger className="text-left">
                <div>
                  {module.title}
                  {module.description && (
                    <p className="text-sm text-muted-foreground font-normal mt-1">{module.description}</p>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2">
                  {module.lessons.map((lesson) => (
                    <li key={lesson.id} className="flex items-center justify-between py-2 px-1">
                      <div className="flex items-center gap-3">
                        {lesson.isLocked ? (
                          <LockIcon className="h-5 w-5 text-muted-foreground" />
                        ) : lesson.type === "video" ? (
                          <PlayCircle className="h-5 w-5 text-primary" />
                        ) : lesson.type === "reading" ? (
                          <FileText className="h-5 w-5 text-primary" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                        <span className={lesson.isLocked ? "text-muted-foreground" : ""}>{lesson.title}</span>
                        {lesson.isCompleted && !lesson.isLocked && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Completed</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}
