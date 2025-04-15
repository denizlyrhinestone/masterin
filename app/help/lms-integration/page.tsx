"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, HelpCircle, BookOpen, Server, Database, AlertTriangle } from "lucide-react"

export default function LMSIntegrationHelpPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">LMS Integration Documentation</h1>
          <p className="text-muted-foreground">Learn how to connect and use your Learning Management System</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-600" />
              Getting Started with LMS Integration
            </CardTitle>
            <CardDescription>Connect your Learning Management System to share content and sync data</CardDescription>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p>
              LearnWise offers seamless integration with popular Learning Management Systems (LMS), allowing you to
              share content, sync data, and enhance your educational experience. This documentation will guide you
              through the process of connecting your LMS and using the integrated features.
            </p>
            <p>Our platform currently supports integration with the following Learning Management Systems:</p>
            <ul>
              <li>Canvas</li>
              <li>Moodle</li>
              <li>Blackboard</li>
              <li>Google Classroom</li>
              <li>Schoology</li>
            </ul>
            <p>
              To get started, navigate to your profile settings and select "LMS Integration" from the menu. From there,
              you can connect your LMS and start sharing content.
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="connect" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2">
          <TabsTrigger value="connect" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            <span>Connection</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Content Sharing</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span>Data Sync</span>
          </TabsTrigger>
          <TabsTrigger value="troubleshooting" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Troubleshooting</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connect">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-blue-600" />
                Connecting Your LMS
              </CardTitle>
              <CardDescription>
                Step-by-step instructions for connecting your Learning Management System
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <h3>Connection Process</h3>
                <p>To connect your Learning Management System to LearnWise, follow these steps:</p>
                <ol>
                  <li>
                    <strong>Find your LMS instance URL:</strong> This is the URL you use to access your LMS (e.g.,
                    "https://canvas.example.edu").
                  </li>
                  <li>
                    <strong>Navigate to the LMS Integration settings:</strong> Go to your profile settings and select
                    "LMS Integration".
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
                  <li>
                    <strong>Grant necessary permissions:</strong> Allow LearnWise to access your LMS data as required.
                  </li>
                  <li>
                    <strong>Verify the connection:</strong> Once authorized, you'll be redirected back to LearnWise
                    where you can verify the connection status.
                  </li>
                </ol>

                <h3>Platform-Specific Instructions</h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="canvas">
                    <AccordionTrigger>Canvas</AccordionTrigger>
                    <AccordionContent>
                      <p>To connect Canvas to LearnWise:</p>
                      <ol>
                        <li>Log in to your Canvas account as an administrator or instructor</li>
                        <li>Go to Settings &gt; Developer Keys</li>
                        <li>Click on "+ Developer Key" and select "LTI Key"</li>
                        <li>Enter "LearnWise" as the name</li>
                        <li>Set the redirect URI to "https://learnwise.com/api/lms/canvas/callback"</li>
                        <li>Enable the key and copy the Client ID and Secret</li>
                        <li>Enter these credentials in the LearnWise LMS Integration settings</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="moodle">
                    <AccordionTrigger>Moodle</AccordionTrigger>
                    <AccordionContent>
                      <p>To connect Moodle to LearnWise:</p>
                      <ol>
                        <li>Log in to your Moodle site as an administrator</li>
                        <li>Go to Site administration &gt; Plugins &gt; External services</li>
                        <li>Create a new external service named "LearnWise Integration"</li>
                        <li>Enable the following functions: core_course_get_courses, core_user_get_users, etc.</li>
                        <li>Create a new token for this service</li>
                        <li>Enter the token and your Moodle URL in the LearnWise LMS Integration settings</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="blackboard">
                    <AccordionTrigger>Blackboard</AccordionTrigger>
                    <AccordionContent>
                      <p>To connect Blackboard to LearnWise:</p>
                      <ol>
                        <li>Log in to your Blackboard Learn instance as an administrator</li>
                        <li>Go to System Admin &gt; Integrations &gt; REST API Integrations</li>
                        <li>Create a new integration with the name "LearnWise"</li>
                        <li>Set the application ID to "learnwise"</li>
                        <li>Configure the required permissions (Read Course, Read User, etc.)</li>
                        <li>Generate a new key and secret</li>
                        <li>Enter these credentials in the LearnWise LMS Integration settings</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="google">
                    <AccordionTrigger>Google Classroom</AccordionTrigger>
                    <AccordionContent>
                      <p>To connect Google Classroom to LearnWise:</p>
                      <ol>
                        <li>Make sure you're signed in to the Google account associated with Google Classroom</li>
                        <li>In LearnWise, select Google Classroom from the LMS Integration options</li>
                        <li>Click "Connect with Google Classroom"</li>
                        <li>You'll be redirected to Google's authorization page</li>
                        <li>Select the Google account you want to connect</li>
                        <li>Review and grant the requested permissions</li>
                        <li>You'll be redirected back to LearnWise once the connection is established</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="schoology">
                    <AccordionTrigger>Schoology</AccordionTrigger>
                    <AccordionContent>
                      <p>To connect Schoology to LearnWise:</p>
                      <ol>
                        <li>Log in to your Schoology account as an administrator</li>
                        <li>Go to App Center &gt; API &gt; API Credentials & Settings</li>
                        <li>Create a new app with the name "LearnWise"</li>
                        <li>Set the domain to "learnwise.com"</li>
                        <li>Copy the consumer key and secret</li>
                        <li>Enter these credentials in the LearnWise LMS Integration settings</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <h3>Connection Status</h3>
                <p>
                  After connecting your LMS, you can check the connection status in the LMS Integration settings. A
                  green indicator means the connection is active and working properly. A red indicator means there's an
                  issue with the connection that needs to be resolved.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                Content Sharing
              </CardTitle>
              <CardDescription>Learn how to share content between LearnWise and your LMS</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <h3>What Content Can Be Shared</h3>
                <p>LearnWise allows you to share various types of content with your connected LMS:</p>
                <ul>
                  <li>
                    <strong>AI-Generated Assignments</strong> - Share assignments created with our AI Assignment
                    Generator
                  </li>
                  <li>
                    <strong>Quizzes</strong> - Share quizzes created with our AI Quiz Generator
                  </li>
                  <li>
                    <strong>Flashcard Decks</strong> - Share flashcard decks for student review
                  </li>
                  <li>
                    <strong>Course Materials</strong> - Share course content, readings, and resources
                  </li>
                  <li>
                    <strong>Discussion Topics</strong> - Create discussion topics based on course content
                  </li>
                </ul>

                <h3>How to Share Content</h3>
                <p>To share content from LearnWise to your LMS:</p>
                <ol>
                  <li>Navigate to the content you want to share (e.g., an assignment, quiz, or flashcard deck)</li>
                  <li>Click the "Share" button</li>
                  <li>Select "Share to LMS" from the dropdown menu</li>
                  <li>Choose the LMS connection you want to use</li>
                  <li>Select the course or class where you want to share the content</li>
                  <li>Configure any additional settings (due dates, points, etc.)</li>
                  <li>Click "Share" to complete the process</li>
                </ol>

                <h3>Content Synchronization</h3>
                <p>
                  When you share content from LearnWise to your LMS, the content is synchronized in the following ways:
                </p>
                <ul>
                  <li>
                    <strong>One-time Share</strong> - Content is copied to your LMS as a new item
                  </li>
                  <li>
                    <strong>Linked Share</strong> - Content remains linked, and updates in LearnWise are reflected in
                    your LMS
                  </li>
                  <li>
                    <strong>Scheduled Share</strong> - Content is shared according to a schedule you define
                  </li>
                </ul>

                <h3>Platform-Specific Content Sharing</h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="canvas-content">
                    <AccordionTrigger>Canvas Content Sharing</AccordionTrigger>
                    <AccordionContent>
                      <p>When sharing content to Canvas:</p>
                      <ul>
                        <li>Assignments are created as Canvas Assignments</li>
                        <li>Quizzes are created as Canvas Quizzes</li>
                        <li>Flashcard decks are shared as Canvas Pages with embedded content</li>
                        <li>Course materials are added as Canvas Modules or Pages</li>
                        <li>Discussion topics are created as Canvas Discussions</li>
                      </ul>
                      <p>
                        Note: You must have the appropriate permissions in Canvas to create these content types in your
                        courses.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="moodle-content">
                    <AccordionTrigger>Moodle Content Sharing</AccordionTrigger>
                    <AccordionContent>
                      <p>When sharing content to Moodle:</p>
                      <ul>
                        <li>Assignments are created as Moodle Assignments</li>
                        <li>Quizzes are created as Moodle Quizzes</li>
                        <li>Flashcard decks are shared as Moodle Pages with embedded content</li>
                        <li>Course materials are added as Moodle Resources</li>
                        <li>Discussion topics are created as Moodle Forums</li>
                      </ul>
                      <p>
                        Note: You must have the appropriate permissions in Moodle to create these content types in your
                        courses.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-green-600" />
                Data Synchronization
              </CardTitle>
              <CardDescription>Understand how data is synchronized between LearnWise and your LMS</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <h3>What Data is Synchronized</h3>
                <p>LearnWise synchronizes the following data with your connected LMS:</p>
                <ul>
                  <li>
                    <strong>Course Information</strong> - Course titles, descriptions, and schedules
                  </li>
                  <li>
                    <strong>User Information</strong> - Basic user profiles and roles
                  </li>
                  <li>
                    <strong>Enrollment Data</strong> - Which users are enrolled in which courses
                  </li>
                  <li>
                    <strong>Assignment Submissions</strong> - When enabled, assignment submissions can be synchronized
                  </li>
                  <li>
                    <strong>Grades</strong> - When enabled, grades can be synchronized between systems
                  </li>
                </ul>

                <h3>Data Synchronization Settings</h3>
                <p>You can configure data synchronization settings in the LMS Integration settings page:</p>
                <ol>
                  <li>Navigate to your profile settings</li>
                  <li>Select "LMS Integration"</li>
                  <li>Click on the connected LMS</li>
                  <li>Select the "Data Sync" tab</li>
                  <li>Configure which data types should be synchronized</li>
                  <li>Set the synchronization frequency (manual, daily, hourly, etc.)</li>
                  <li>Save your settings</li>
                </ol>

                <h3>Manual Synchronization</h3>
                <p>To manually synchronize data between LearnWise and your LMS:</p>
                <ol>
                  <li>Navigate to your profile settings</li>
                  <li>Select "LMS Integration"</li>
                  <li>Click on the connected LMS</li>
                  <li>Click the "Sync Now" button</li>
                  <li>Select which data types to synchronize</li>
                  <li>Confirm the synchronization</li>
                </ol>

                <h3>Data Privacy and Security</h3>
                <p>LearnWise takes data privacy and security seriously. When synchronizing data with your LMS:</p>
                <ul>
                  <li>All data transfers are encrypted using industry-standard protocols</li>
                  <li>Only the minimum necessary data is transferred</li>
                  <li>User data is handled in accordance with our privacy policy</li>
                  <li>You can delete synchronized data at any time</li>
                  <li>Data synchronization logs are maintained for auditing purposes</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="troubleshooting">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Troubleshooting
              </CardTitle>
              <CardDescription>Solutions for common LMS integration issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <h3>Common Connection Issues</h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="issue-1">
                    <AccordionTrigger>Connection Failed or Timed Out</AccordionTrigger>
                    <AccordionContent>
                      <p>If your connection attempt fails or times out:</p>
                      <ol>
                        <li>Verify that your LMS instance URL is correct</li>
                        <li>Check that your LMS is online and accessible</li>
                        <li>Ensure you have the necessary permissions in your LMS</li>
                        <li>Check your network connection</li>
                        <li>Try again after a few minutes</li>
                        <li>If the problem persists, contact your LMS administrator</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="issue-2">
                    <AccordionTrigger>Authentication Failed</AccordionTrigger>
                    <AccordionContent>
                      <p>If authentication fails during the connection process:</p>
                      <ol>
                        <li>Verify that you're using the correct credentials</li>
                        <li>Check that your API key or token is still valid</li>
                        <li>Ensure you have the necessary permissions in your LMS</li>
                        <li>Try regenerating your API key or token</li>
                        <li>Check if your LMS has any security settings blocking the connection</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="issue-3">
                    <AccordionTrigger>Connection Disconnects Frequently</AccordionTrigger>
                    <AccordionContent>
                      <p>If your LMS connection disconnects frequently:</p>
                      <ol>
                        <li>Check if your API token has an expiration date</li>
                        <li>Verify that your LMS is not undergoing maintenance</li>
                        <li>Ensure your LMS administrator hasn't revoked your access</li>
                        <li>Try reconnecting with fresh credentials</li>
                        <li>Contact support if the issue persists</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <h3>Content Sharing Issues</h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="issue-4">
                    <AccordionTrigger>Content Fails to Share</AccordionTrigger>
                    <AccordionContent>
                      <p>If content fails to share to your LMS:</p>
                      <ol>
                        <li>Verify that your LMS connection is active</li>
                        <li>Check that you have permission to create content in the target course</li>
                        <li>Ensure the content type is supported by your LMS</li>
                        <li>Check if the content exceeds any size limitations</li>
                        <li>Try sharing a different piece of content to isolate the issue</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="issue-5">
                    <AccordionTrigger>Shared Content Appears Incorrectly</AccordionTrigger>
                    <AccordionContent>
                      <p>If shared content appears incorrectly in your LMS:</p>
                      <ol>
                        <li>Check if your LMS has any formatting restrictions</li>
                        <li>Verify that all content elements are supported by your LMS</li>
                        <li>Try sharing with different settings</li>
                        <li>Check if your LMS has any content filters that might be affecting the display</li>
                        <li>Contact support for format-specific issues</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <h3>Data Synchronization Issues</h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="issue-6">
                    <AccordionTrigger>Data Not Synchronizing</AccordionTrigger>
                    <AccordionContent>
                      <p>If data is not synchronizing between LearnWise and your LMS:</p>
                      <ol>
                        <li>Check your data synchronization settings</li>
                        <li>Verify that your LMS connection is active</li>
                        <li>Ensure you have the necessary permissions for data access</li>
                        <li>Try a manual synchronization</li>
                        <li>Check the synchronization logs for specific errors</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="issue-7">
                    <AccordionTrigger>Incomplete Data Synchronization</AccordionTrigger>
                    <AccordionContent>
                      <p>If only some data is synchronizing:</p>
                      <ol>
                        <li>Check which data types are enabled for synchronization</li>
                        <li>Verify that you have permissions for all data types</li>
                        <li>Check if there are any filters or restrictions in place</li>
                        <li>Look for specific error messages in the synchronization logs</li>
                        <li>Try synchronizing specific data types individually</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <h3>Contact Support</h3>
                <p>
                  If you're experiencing issues that aren't resolved by the troubleshooting steps above, please contact
                  our support team:
                </p>
                <ul>
                  <li>Email: support@learnwise.com</li>
                  <li>In-app: Click the "Help" button and select "Contact Support"</li>
                  <li>Phone: 1-800-LEARN-WISE (available Monday-Friday, 9am-5pm EST)</li>
                </ul>
                <p>When contacting support about LMS integration issues, please provide:</p>
                <ul>
                  <li>Your LMS type and version</li>
                  <li>A description of the issue</li>
                  <li>Any error messages you've received</li>
                  <li>Steps you've already taken to resolve the issue</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 border-t pt-8">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-bold">Need More Help?</h2>
        </div>
        <p className="text-muted-foreground mb-4">
          If you have any questions or need further assistance with LMS integration, please contact our support team.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/faq">View FAQ</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
