import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, PlayCircleIcon, SettingsIcon, HelpCircleIcon } from "lucide-react"

export const metadata: Metadata = {
  title: "Video Help | Masterin",
  description: "Learn how to use video features in our courses",
}

export default function VideoHelpPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Video Player Help</h1>

      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="basics">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
            <TabsTrigger value="captions">Captions</TabsTrigger>
            <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
          </TabsList>

          <TabsContent value="basics">
            <Card>
              <CardHeader>
                <CardTitle>Video Player Basics</CardTitle>
                <CardDescription>Learn the fundamentals of our video player</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <PlayCircleIcon className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Playing Videos</h3>
                    <p className="text-sm text-muted-foreground">
                      Click the play button in the center or bottom left of the player to start the video. Click again
                      to pause.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <SettingsIcon className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Video Quality</h3>
                    <p className="text-sm text-muted-foreground">
                      Click the settings icon in the bottom right to adjust video quality. Higher quality requires
                      better internet connection.
                    </p>
                  </div>
                </div>

                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>Progress Tracking</AlertTitle>
                  <AlertDescription>
                    Your progress is automatically saved as you watch. You can resume from where you left off.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="controls">
            <Card>
              <CardHeader>
                <CardTitle>Video Controls</CardTitle>
                <CardDescription>Learn how to use all video player controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Playback Speed</h3>
                    <p className="text-sm text-muted-foreground">
                      Click the speed button (1x) to cycle through playback speeds from 0.5x to 2x.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Volume Control</h3>
                    <p className="text-sm text-muted-foreground">
                      Click the volume icon to mute/unmute. Hover and use the slider to adjust volume.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Full Screen</h3>
                    <p className="text-sm text-muted-foreground">
                      Click the expand icon in the bottom right to enter full screen mode. Press ESC to exit.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Progress Bar</h3>
                    <p className="text-sm text-muted-foreground">
                      Click anywhere on the progress bar to jump to that point in the video.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="captions">
            <Card>
              <CardHeader>
                <CardTitle>Closed Captions</CardTitle>
                <CardDescription>Learn how to use closed captions and subtitles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div>
                    <h3 className="font-medium">Enabling Captions</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Click the CC button in the player controls to turn captions on or off.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div>
                    <h3 className="font-medium">Language Selection</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      If multiple languages are available, click the settings icon and select your preferred language.
                    </p>
                  </div>
                </div>

                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>Caption Availability</AlertTitle>
                  <AlertDescription>
                    Not all videos have captions available. We're continuously adding captions to our content.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="troubleshooting">
            <Card>
              <CardHeader>
                <CardTitle>Troubleshooting</CardTitle>
                <CardDescription>Solutions for common video playback issues</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Video Won't Play</h3>
                  <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                    <li>Check your internet connection</li>
                    <li>Try refreshing the page</li>
                    <li>Clear your browser cache</li>
                    <li>Try a different browser</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Buffering Issues</h3>
                  <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                    <li>Lower the video quality in settings</li>
                    <li>Pause the video for a few minutes to let it buffer</li>
                    <li>Check if other devices are using your network</li>
                    <li>Try connecting to a different network</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Audio Problems</h3>
                  <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                    <li>Check if your device is muted</li>
                    <li>Ensure the video player volume is turned up</li>
                    <li>Try using headphones</li>
                    <li>Restart your browser</li>
                  </ul>
                </div>

                <div className="mt-6 flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <HelpCircleIcon className="h-5 w-5 text-primary" />
                    <span>
                      Still having issues?{" "}
                      <a href="/contact" className="text-primary hover:underline">
                        Contact Support
                      </a>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
