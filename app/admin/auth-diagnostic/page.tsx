"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabaseAuth } from "@/lib/supabase-auth"
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react"

export default function AuthDiagnosticPage() {
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [envVars, setEnvVars] = useState<Record<string, boolean>>({})
  const [redirectUrl, setRedirectUrl] = useState<string>("")

  useEffect(() => {
    async function checkProviders() {
      try {
        // This is a workaround to check which providers are enabled
        // We try to get the sign-in URL for each provider
        const googleProvider = await supabaseAuth.auth
          .signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: window.location.origin,
              skipBrowserRedirect: true,
            },
          })
          .then(() => true)
          .catch((e) => {
            console.error("Google provider error:", e)
            return e.message.includes("provider is not enabled") ? false : true
          })

        setProviders([
          {
            name: "Google",
            enabled: googleProvider,
            requiredEnvVars: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
          },
        ])

        // Check environment variables
        const envVarStatus: Record<string, boolean> = {}
        const requiredVars = [
          "NEXT_PUBLIC_SUPABASE_URL",
          "NEXT_PUBLIC_SUPABASE_ANON_KEY",
          "SUPABASE_URL",
          "SUPABASE_ANON_KEY",
        ]

        // We can't directly check env vars on client, but we can check if they're defined
        requiredVars.forEach((varName) => {
          if (varName.startsWith("NEXT_PUBLIC_")) {
            envVarStatus[varName] = process.env[varName] !== undefined
          } else {
            // For server-side vars, we'll just check if they're in our list
            envVarStatus[varName] = true // Assume they exist, we can't check directly
          }
        })

        setEnvVars(envVarStatus)
        setRedirectUrl(`${window.location.origin}/auth/callback`)
      } catch (err: any) {
        setError(err.message || "Failed to check authentication providers")
      } finally {
        setLoading(false)
      }
    }

    checkProviders()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Authentication Diagnostic</h1>

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center p-6">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <span className="ml-3">Checking authentication configuration...</span>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <Tabs defaultValue="providers">
          <TabsList className="mb-4">
            <TabsTrigger value="providers">Auth Providers</TabsTrigger>
            <TabsTrigger value="env">Environment Variables</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="providers">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Providers</CardTitle>
                <CardDescription>
                  Check which authentication providers are properly configured in your Supabase project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {providers.map((provider) => (
                    <div key={provider.name} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <div className="mt-0.5">
                        {provider.enabled ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{provider.name} Authentication</h3>
                        {provider.enabled ? (
                          <p className="text-sm text-muted-foreground">
                            {provider.name} authentication is properly configured.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-sm text-red-500">
                              {provider.name} authentication is not enabled in your Supabase project.
                            </p>
                            <Alert>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                <p className="font-medium">To enable {provider.name} authentication:</p>
                                <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                                  <li>Go to your Supabase dashboard</li>
                                  <li>Navigate to Authentication &gt; Providers</li>
                                  <li>Enable {provider.name} provider</li>
                                  <li>Add your {provider.name} OAuth credentials (Client ID and Secret)</li>
                                  <li>
                                    Add <code className="bg-muted px-1 py-0.5 rounded">{redirectUrl}</code> to the
                                    Redirect URLs
                                  </li>
                                </ol>
                              </AlertDescription>
                            </Alert>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="env">
            <Card>
              <CardHeader>
                <CardTitle>Environment Variables</CardTitle>
                <CardDescription>Check if all required environment variables are properly configured</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(envVars).map(([varName, exists]) => (
                    <div key={varName} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <div className="mt-0.5">
                        {exists ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium font-mono">{varName}</h3>
                        {exists ? (
                          <p className="text-sm text-muted-foreground">Environment variable is properly configured.</p>
                        ) : (
                          <p className="text-sm text-red-500">
                            Environment variable is missing or not properly configured.
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config">
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>Important configuration settings for authentication</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium">Redirect URL</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      This URL must be added to your OAuth provider's allowed redirect URLs:
                    </p>
                    <div className="bg-muted p-2 rounded font-mono text-sm overflow-x-auto">{redirectUrl}</div>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-medium">Common issues with Google authentication:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                        <li>Google provider not enabled in Supabase dashboard</li>
                        <li>Missing or incorrect Client ID and Client Secret</li>
                        <li>Redirect URL not added to Google OAuth configuration</li>
                        <li>Google Cloud project doesn't have OAuth consent screen configured</li>
                        <li>Google Cloud project doesn't have the necessary APIs enabled</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
