import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Info } from "lucide-react"

export default function VideoHelpPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Video Playback Help</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Requirements</CardTitle>
            <CardDescription>Recommended specifications for optimal video playback</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Supported Browsers</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Google Chrome (latest version)</li>
                  <li>Mozilla Firefox (latest version)</li>
                  <li>Safari (latest version)</li>
                  <li>Microsoft Edge (latest version)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-2">Internet Connection</h3>
                <p>Minimum recommended speed:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Standard definition (SD): 3+ Mbps</li>
                  <li>High definition (HD): 5+ Mbps</li>
                  <li>Ultra HD/4K: 25+ Mbps</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-2">Required Codecs</h3>
                <p>Your browser should support these codecs:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>H.264 (MP4)</li>
                  <li>VP8/VP9 (WebM)</li>
                  <li>Theora (Ogg)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting</CardTitle>
            <CardDescription>Common issues and how to resolve them</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Video won't play at all</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    <li>• Check if JavaScript is enabled in your browser</li>
                    <li>• Try refreshing the page</li>
                    <li>• Clear your browser cache and cookies</li>
                    <li>• Try a different browser</li>
                    <li>• Check if you have an ad blocker that might be interfering</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>Video is buffering or stuttering</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    <li>• Check your internet connection speed</li>
                    <li>• Close other applications or tabs that might be using bandwidth</li>
                    <li>• Try lowering the video quality if available</li>
                    <li>• Pause the video for a few minutes to allow it to buffer</li>
                    <li>• Try watching at a less busy time of day</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>No sound during playback</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    <li>• Check if your device is muted or volume is turned down</li>
                    <li>• Check if the video player is muted (look for mute icon)</li>
                    <li>• Try another video to see if the issue persists</li>
                    <li>• Restart your browser</li>
                    <li>• Check if your audio drivers are up to date</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>Video quality is poor</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    <li>• Check if there are quality options available in the player</li>
                    <li>• Ensure your internet connection is stable</li>
                    <li>• Try a wired connection instead of Wi-Fi if possible</li>
                    <li>• Some videos may be available in limited quality only</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Browser-Specific Settings</CardTitle>
          <CardDescription>Configure your browser for optimal video playback</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-2">Chrome</h3>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Open Chrome Settings (three dots in top right)</li>
                <li>Go to "Privacy and security"</li>
                <li>Click "Site Settings"</li>
                <li>Ensure "JavaScript" is allowed</li>
                <li>Under "Additional content settings", check that "Images" and "Media" are allowed</li>
              </ol>
            </div>

            <div>
              <h3 className="font-medium mb-2">Firefox</h3>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Open Firefox Options (three lines in top right)</li>
                <li>Go to "Privacy & Security"</li>
                <li>Under "Permissions", ensure "Autoplay" is set appropriately</li>
                <li>Go to "about:config" in the address bar</li>
                <li>Search for "media.autoplay" and adjust settings if needed</li>
              </ol>
            </div>

            <div>
              <h3 className="font-medium mb-2">Safari</h3>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Open Safari Preferences</li>
                <li>Go to "Websites" tab</li>
                <li>Select "Auto-Play" from the left sidebar</li>
                <li>Set to "Allow All Auto-Play" or adjust per website</li>
                <li>Check "Plug-ins" settings to ensure they're enabled</li>
              </ol>
            </div>

            <div>
              <h3 className="font-medium mb-2">Edge</h3>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Open Edge Settings (three dots in top right)</li>
                <li>Go to "Cookies and site permissions"</li>
                <li>Find "JavaScript" and ensure it's allowed</li>
                <li>Check "Media autoplay" settings</li>
                <li>Ensure "Media" permissions are set correctly</li>
              </ol>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">Need More Help?</h4>
                <p className="text-sm text-blue-700">
                  If you're still experiencing issues after trying these solutions, please contact our support team at
                  <a href="mailto:support@masterin.com" className="underline ml-1">
                    support@masterin.com
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
