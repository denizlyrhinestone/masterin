"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export default function EmailDiagnosticPage() {
  const { sendVerificationEmail } = useAuth()
  const [email, setEmail] = useState("")
  const [testResult, setTestResult] = useState<null | { success: boolean; message: string }>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testEmailConfirmation = async () => {
    if (!email) return

    setIsLoading(true)
    setTestResult(null)

    try {
      const { error } = await sendVerificationEmail(email)

      if (error) {
        setTestResult({
          success: false,
          message: `Failed to send verification email: ${error.message}`,
        })
      } else {
        setTestResult({
          success: true,
          message: `Verification email sent to ${email}. Please check your inbox and spam folder.`,
        })
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `An unexpected error occurred: ${err.message || "Unknown error"}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get the current site URL
  const siteUrl = typeof window !== "undefined" ? window.location.origin : ""

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Email Confirmation Diagnostic</h1>

      <Tabs defaultValue="test">
        <TabsList className="mb-4">
          <TabsTrigger value="test">Test Email Confirmation</TabsTrigger>
          <TabsTrigger value="troubleshoot">Troubleshooting Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>Test Email Confirmation</CardTitle>
              <CardDescription>Send a test verification email to diagnose confirmation link issues</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {testResult && (
                <Alert variant={testResult.success ? "default" : "destructive"}>
                  {testResult.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  <AlertTitle>{testResult.success ? "Success" : "Error"}</AlertTitle>
                  <AlertDescription>{testResult.message}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={testEmailConfirmation} disabled={!email || isLoading}>
                {isLoading ? "Sending..." : "Send Test Email"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="troubleshoot">
          <Card>
            <CardHeader>
              <CardTitle>Troubleshooting Email Confirmation Issues</CardTitle>
              <CardDescription>Common issues and solutions for email confirmation problems</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Common Issues</h3>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium flex items-center">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                      "This site can't be reached" Error
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      This error occurs when the confirmation link points to a URL that isn't accessible, often due to
                      incorrect configuration or a server that isn't running.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium flex items-center">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                      Localhost in Production Links
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      If your confirmation emails contain "localhost" URLs in a production environment, your site URL
                      configuration is incorrect.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium flex items-center">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                      Email Not Received
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Verification emails might be filtered as spam or blocked by email providers. Check your spam
                      folder and ensure your email service is properly configured.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Solutions</h3>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Correct Site URL Configuration
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1 mb-2">
                      Ensure your site URL is correctly configured in your authentication setup:
                    </p>
                    <div className="bg-muted p-2 rounded text-sm font-mono">Current site URL: {siteUrl}</div>
                    <p className="text-sm text-muted-foreground mt-2">
                      This URL should match the domain where your application is hosted. For local development, it
                      should be http://localhost:3000 (or your custom port).
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Environment Variables
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1 mb-2">
                      Set the NEXT_PUBLIC_BASE_URL environment variable to your site's URL:
                    </p>
                    <div className="bg-muted p-2 rounded text-sm font-mono">
                      NEXT_PUBLIC_BASE_URL=https://your-site.com
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      For local development, set it to http://localhost:3000 (or your custom port).
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Server Running Check
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ensure your development server is running when testing locally. If you're using a custom port,
                      make sure it matches in your configuration.
                    </p>
                  </div>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium">Recent fixes implemented:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>Dynamic site URL detection for email redirects</li>
                    <li>Improved error handling for authentication flows</li>
                    <li>Better logging for debugging authentication issues</li>
                    <li>Support for environment-specific redirect URLs</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
