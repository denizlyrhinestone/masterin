import { CheckCircle } from "lucide-react"

interface CourseObjectivesProps {
  objectives: string[]
  requirements?: string[]
}

export function CourseObjectives({ objectives, requirements }: CourseObjectivesProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-3">What You'll Learn</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {objectives.map((objective, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>{objective}</span>
            </li>
          ))}
        </ul>
      </div>

      {requirements && requirements.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-3">Requirements</h3>
          <ul className="space-y-2">
            {requirements.map((requirement, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{requirement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
