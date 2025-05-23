import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface LessonContentProps {
  videoUrl?: string
  transcript?: string
  content?: string
  resources?: {
    id: string
    title: string
    description?: string
    url: string
  }[]
}

export default function LessonContent({ videoUrl, transcript, content, resources = [] }: LessonContentProps) {
  return (
    <Card>
      <CardContent className="p-0">
        {videoUrl && (
          <div className="aspect-video w-full bg-black">
            <video src={videoUrl} controls className="w-full h-full" poster="/video-still-12-seconds.png" />
          </div>
        )}

        <Tabs defaultValue="content" className="p-6">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            {transcript && <TabsTrigger value="transcript">Transcript</TabsTrigger>}
            {resources.length > 0 && <TabsTrigger value="resources">Resources</TabsTrigger>}
          </TabsList>

          <TabsContent value="content" className="mt-4">
            <div className="prose max-w-none dark:prose-invert">
              {content ? (
                <div dangerouslySetInnerHTML={{ __html: content }} />
              ) : (
                <p className="text-muted-foreground">No content available for this lesson.</p>
              )}
            </div>
          </TabsContent>

          {transcript && (
            <TabsContent value="transcript" className="mt-4">
              <div className="prose max-w-none dark:prose-invert">
                <div dangerouslySetInnerHTML={{ __html: transcript }} />
              </div>
            </TabsContent>
          )}

          {resources.length > 0 && (
            <TabsContent value="resources" className="mt-4">
              <div className="space-y-4">
                {resources.map((resource) => (
                  <div key={resource.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <h3 className="font-medium">{resource.title}</h3>
                    {resource.description && (
                      <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                    )}
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm inline-block mt-2"
                    >
                      View Resource
                    </a>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}
