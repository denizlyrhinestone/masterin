import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { validateGroqApiKey } from "@/lib/env-config"

// Force static rendering
export const dynamic = "force-static"

export default function GroqStatusPage() {
  // Server-side validation of API key format
  const keyValidation = validateGroqApiKey()

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Groq API Status</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>API Key Configuration</CardTitle>
          <CardDescription>Checking if the Groq API key is properly configured</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-md bg-gray-50">
              <h3 className="font-medium mb-2">Environment Variable Status:</h3>
              <p className={keyValidation.valid ? "text-green-600" : "text-red-600"}>{keyValidation.message}</p>
            </div>

            <div className="p-4 rounded-md bg-gray-50">
              <h3 className="font-medium mb-2">Next Steps:</h3>
              <p className="mb-2">To test the actual API connection, use the client-side test tool:</p>
              <Link href="/groq-test" passHref>
                <Button>Go to Groq Test Tool</Button>
              </Link>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 border-t">
          <p className="text-sm text-gray-500">
            Note: This page only checks if the API key is configured. It does not make any API calls.
          </p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting</CardTitle>
          <CardDescription>Common issues and solutions</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Make sure the <code>GROQ_API_KEY</code> environment variable is set
            </li>
            <li>
              Verify that the API key starts with <code>gsk_</code>
            </li>
            <li>Check that the API key has not expired</li>
            <li>Ensure the API key has the necessary permissions</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
