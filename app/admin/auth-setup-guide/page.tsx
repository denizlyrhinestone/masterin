import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Info, AlertTriangle, CheckCircle } from "lucide-react"

export default function AuthSetupGuidePage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Google Authentication Setup Guide</h1>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="google">Google Setup</TabsTrigger>
          <TabsTrigger value="supabase">Supabase Setup</TabsTrigger>
          <TabsTrigger value="env">Environment Variables</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Setting Up Google Authentication</CardTitle>
              <CardDescription>
                Follow this guide to properly configure Google authentication for your LearnWise platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>To enable Google authentication, you need to complete the following steps:</p>

                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Create a Google Cloud project and configure OAuth consent screen</li>
                  <li>Create OAuth credentials (Client ID and Client Secret)</li>
                  <li>Configure Supabase to use Google authentication</li>
                  <li>Set up the correct environment variables in your project</li>
                </ol>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    This guide assumes you already have a Supabase project created and connected to your application.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="google">
          <Card>
            <CardHeader>
              <CardTitle>Google Cloud Setup</CardTitle>
              <CardDescription>Configure your Google Cloud project to enable OAuth authentication</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Step 1: Create a Google Cloud Project</h3>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>
                      Go to the{" "}
                      <a
                        href="https://console.cloud.google.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Google Cloud Console
                      </a>
                    </li>
                    <li>Click on the project dropdown at the top of the page</li>
                    <li>Click "New Project"</li>
                    <li>Enter a name for your project and click "Create"</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Step 2: Configure OAuth Consent Screen</h3>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>In your Google Cloud project, go to "APIs & Services" &gt; "OAuth consent screen"</li>
                    <li>Select "External" as the user type (unless you're using Google Workspace)</li>
                    <li>
                      Fill in the required information:
                      <ul className="list-disc list-inside ml-6 mt-1">
                        <li>App name: "LearnWise"</li>
                        <li>User support email: Your email</li>
                        <li>Developer contact information: Your email</li>
                      </ul>
                    </li>
                    <li>Click "Save and Continue"</li>
                    <li>You can skip adding scopes for now - click "Save and Continue"</li>
                    <li>Add test users if you're keeping the app in testing mode, or skip this step</li>
                    <li>Click "Save and Continue" to complete the setup</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Step 3: Create OAuth Credentials</h3>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>Go to "APIs & Services" > "Credentials"</li>
                    <li>Click "Create Credentials" > "OAuth client ID"</li>
                    <li>Select "Web application" as the application type</li>
                    <li>Enter a name for your OAuth client</li>
                    <li>
                      Add authorized JavaScript origins:
                      <ul className="list-disc list-inside ml-6 mt-1">
                        <li>https://your-project-ref.supabase.co (your Supabase project URL)</li>
                        <li>http://localhost:3000 (for local development)</li>
                      </ul>
                    </li>
                    <li>
                      Add authorized redirect URIs:
                      <ul className="list-disc list-inside ml-6 mt-1">
                        <li>https://your-project-ref.supabase.co/auth/v1/callback</li>
                        <li>http://localhost:3000/auth/callback (for local development)</li>
                      </ul>
                    </li>
                    <li>Click "Create"</li>
                    <li>A popup will appear with your Client ID and Client Secret - save these for the next step</li>
                  </ol>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <AlertDescription>
                    Keep your Client Secret secure! Don't commit it to your code repository or share it publicly.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="supabase">
          <Card>
            <CardHeader>
              <CardTitle>Supabase Configuration</CardTitle>
              <CardDescription>Configure your Supabase project to use Google authentication</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Step 1: Enable Google Auth Provider</h3>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>
                      Go to your{" "}
                      <a
                        href="https://app.supabase.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Supabase Dashboard
                      </a>
                    </li>
                    <li>Select your project</li>
                    <li>Go to "Authentication" > "Providers" in the sidebar</li>
                    <li>Find "Google" in the list of providers</li>
                    <li>Toggle the switch to enable Google authentication</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Step 2: Add Google OAuth Credentials</h3>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>
                      In the Google provider settings, enter the Client ID and Client Secret you obtained from Google
                      Cloud Console
                    </li>
                    <li>
                      Make sure the "Redirect URL" shown in Supabase is added to your Google OAuth credentials as an
                      authorized redirect URI
                    </li>
                    <li>Click "Save"</li>
                  </ol>
                </div>

                <div className="flex items-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <p className="text-green-700">
                    Once completed, Google authentication should be properly configured in your Supabase project.
                  </p>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium">Troubleshooting tips:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                      <li>
                        Ensure the redirect URL in Supabase exactly matches what you added in Google Cloud Console
                      </li>
                      <li>Check that you've enabled the necessary Google APIs (Google+ API or Google People API)</li>
                      <li>Verify that your OAuth consent screen is properly configured</li>
                      <li>If using a custom domain, ensure it's properly set up in both Google and Supabase</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="env">
          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
              <CardDescription>Set up the necessary environment variables for your application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Required Environment Variables</h3>
                  <p className="mb-4">Make sure the following environment variables are set in your project:</p>
                  <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                    <div className="mb-2">NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co</div>
                    <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Where to Find These Values</h3>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>Go to your Supabase project dashboard</li>
                    <li>Click on the "Settings" icon (gear) in the sidebar</li>
                    <li>Go to "API" in the settings menu</li>
                    <li>You'll find your project URL and anon key in the "Project API keys" section</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Adding Environment Variables to Your Project</h3>
                  <p className="mb-2">For local development:</p>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>
                      Create a <code className="bg-muted px-1 py-0.5 rounded">.env.local</code> file in your project
                      root
                    </li>
                    <li>Add the environment variables listed above</li>
                    <li>Restart your development server</li>
                  </ol>

                  <p className="mt-4 mb-2">For production deployment:</p>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>Add these environment variables in your hosting platform's environment settings</li>
                    <li>For Vercel, go to your project settings > Environment Variables</li>
                    <li>Add each variable and its value, then redeploy your application</li>
                  </ol>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <AlertDescription>
                    Never commit your <code className="bg-muted px-1 py-0.5 rounded">.env.local</code> file to your
                    repository. Make sure it's included in your{" "}
                    <code className="bg-muted px-1 py-0.5 rounded">.gitignore</code> file.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
