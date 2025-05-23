import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Calendar, BarChart, Award } from "lucide-react"

interface CourseInfoProps {
  duration: string
  lastUpdated: string
  level: string
  certificate: boolean
  prerequisites?: string[]
  learningOutcomes?: string[]
}

export default function CourseInfo({
  duration,
  lastUpdated,
  level,
  certificate,
  prerequisites = [],
  learningOutcomes = [],
}: CourseInfoProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Course Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{duration}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">{lastUpdated}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BarChart className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="font-medium">{level}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Certificate</p>
                <p className="font-medium">{certificate ? "Yes" : "No"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {prerequisites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Prerequisites</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {prerequisites.map((prerequisite, index) => (
                <li key={index}>{prerequisite}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {learningOutcomes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>What You'll Learn</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {learningOutcomes.map((outcome, index) => (
                <li key={index}>{outcome}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
