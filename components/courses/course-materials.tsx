import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Lock } from "lucide-react"

interface Material {
  id: string
  title: string
  description?: string
  fileType: string
  fileSize: string
  downloadUrl?: string
  isLocked?: boolean
}

interface CourseMaterialsProps {
  materials: Material[]
}

export default function CourseMaterials({ materials }: CourseMaterialsProps) {
  if (materials.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Materials</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {materials.map((material) => (
            <div key={material.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{material.title}</h3>
                  {material.description && <p className="text-sm text-muted-foreground">{material.description}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded">{material.fileType}</span>
                    <span className="text-xs text-muted-foreground">{material.fileSize}</span>
                  </div>
                </div>
              </div>
              {material.isLocked ? (
                <Button variant="outline" size="sm" disabled>
                  <Lock className="h-4 w-4 mr-2" />
                  Locked
                </Button>
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <a href={material.downloadUrl} download>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
