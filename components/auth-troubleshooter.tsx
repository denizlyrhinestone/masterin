"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function AuthTroubleshooter() {
  const [isChecking, setIsChecking] = useState(false)
  const [results, setResults] = useState<{
    supabaseConnection: boolean
    googleProvider: boolean
    redirectUrl: boolean
    errors: string[]
  } | null>(null)

  const runDiagnostics = async () => {
    setIsChecking(true)
    const diagnosticResults = {
      supabaseConnection: false,
      googleProvider: false,
      redirectUrl: false,
      errors: [] as string[],
    }

    try {
      // Check Supabase connection
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        diagnosticResults.errors.push(`Supabase connection error: ${error.message}`)
      } else {
        diagnosticResults.supabaseConnection = true
      }

      // Check if Google provider is configured
      try {
        const { data: providers, error: providersError } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: window.location.origin + "/auth/callback",
            skipBrowserRedirect: true,
          },
        })

        if (providersError) {
          diagnosticResults.errors.push(`Google provider error: ${providersError.message}`)
        } else if (providers && providers.url) {
          diagnosticResults.googleProvider = true

          // Check if the redirect URL is properly configured
          const url = new URL(providers.url)
          const redirectParam = url.searchParams.get("redirect_to")

          if (redirectParam && redirectParam.includes("/auth/callback")) {
            diagnosticResults.redirectUrl = true
          } else {
            diagnosticResults.errors.push("Redirect URL is not properly configured")
          }
        }
      } catch (e) {
        diagnosticResults.errors.push(`Error checking Google provider: ${e instanceof Error ? e.message : String(e)}`)
      }
    } catch (e) {
      diagnosticResults.errors.push(`Unexpected error: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setResults(diagnosticResults)
      setIsChecking(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Authentication Troubleshooter</CardTitle>
        <CardDescription>Use this tool to diagnose issues with Gmail registration and authentication</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={runDiagnostics} disabled={isChecking} className="mb-6">
          {isChecking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running diagnostics...
            </>
          ) : (
            "Run Diagnostics"
          )}
        </Button>

        {results && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className={results.supabaseConnection ? "border-green-500" : "border-red-500"}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Supabase Connection</h3>
                    {results.supabaseConnection ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className={results.googleProvider ? "border-green-500" : "border-red-500"}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Google Provider</h3>
                    {results.googleProvider ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className={results.redirectUrl ? "border-green-500" : "border-red-500"}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Redirect URL</h3>
                    {results.redirectUrl ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {results.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Errors Detected</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 mt-2">
                    {results.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="troubleshooting">
                <AccordionTrigger>Troubleshooting Steps</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">If Supabase Connection Failed:</h3>
                      <ul className="list-disc pl-5 mt-2">
                        <li>
                          Check that your Supabase URL and anon key are correctly set in your environment variables
                        </li>
                        <li>Verify that your Supabase project is active and running</li>
                        <li>Check for any network issues or CORS restrictions</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-medium">If Google Provider Failed:</h3>
                      <ul className="list-disc pl-5 mt-2">
                        <li>Verify that Google OAuth is enabled in your Supabase project</li>
                        <li>Check that your Google Client ID and Secret are correctly configured in Supabase</li>
                        <li>Ensure your Google Cloud project has the OAuth consent screen properly set up</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-medium">If Redirect URL Failed:</h3>
                      <ul className="list-disc pl-5 mt-2">
                        <li>
                          Check that the redirect URL in your Supabase Google provider settings matches your
                          application's callback URL
                        </li>
                        <li>Verify that the redirect URL is also correctly configured in your Google Cloud Console</li>
                        <li>Ensure the callback route is properly implemented in your application</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-gray-500">
          For more detailed instructions, refer to the documentation in <code>docs/google-oauth-setup.md</code>
        </p>
      </CardFooter>
    </Card>
  )
}
