"use client"

import Link from "next/link"

import { CardFooter } from "@/components/ui/card"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

export function LMSIntegrationDocs() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>LMS Integration Documentation</CardTitle>
        <CardDescription>Learn how to connect and use your Learning Management System</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>To connect your Learning Management System (LMS) to LearnWise, follow these steps:</p>
        <ol className="list-decimal list-inside space-y-2">
          <li>
            <strong>Find your LMS instance URL:</strong> This is the URL you use to access your LMS (e.g.,
            "https://canvas.example.edu").
          </li>
          <li>
            <strong>Navigate to the LMS Integration settings:</strong> Go to your profile settings and select "LMS
            Integration".
          </li>
          <li>
            <strong>Select your LMS platform:</strong> Choose your LMS from the list of supported platforms.
          </li>
          <li>
            <strong>Enter your instance URL:</strong> Provide the URL you found in step 1.
          </li>
          <li>
            <strong>Follow the authorization steps:</strong> You may be redirected to your LMS to authorize the
            connection.
          </li>
        </ol>

        <p>Once connected, you can share assignments, quizzes, and other learning materials directly to your LMS.</p>

        <h3 className="text-lg font-medium">Supported Platforms</h3>
        <ul className="list-disc list-inside space-y-2">
          <li>Canvas</li>
          <li>Moodle</li>
          <li>Blackboard</li>
          <li>Google Classroom</li>
          <li>Schoology</li>
        </ul>

        <h3 className="text-lg font-medium">Troubleshooting</h3>
        <p>
          If you encounter any issues during the connection process, please refer to your LMS documentation or contact
          our support team.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" asChild>
          <Link href="https://example.com/lms-integration-docs" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Full Documentation
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
