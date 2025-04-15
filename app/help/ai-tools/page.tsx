"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Brain, MessageSquare, FileText, PenTool, FlaskConical, ArrowLeft, HelpCircle } from "lucide-react"

export default function AIToolsHelpPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">AI Learning Tools Documentation</h1>
          <p className="text-muted-foreground">Learn how to use our AI-powered educational features</p>
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
              <Brain className="h-5 w-5 text-blue-600" />
              Getting Started with AI Learning Tools
            </CardTitle>
            <CardDescription>
              Our AI-powered learning tools are designed to enhance your educational experience
            </CardDescription>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p>
              LearnWise offers a suite of AI-powered learning tools to help you master new skills more effectively.
              These tools adapt to your learning style and provide personalized educational experiences.
            </p>
            <p>
              All of our AI tools are accessible from the AI Dashboard, which you can reach by clicking on the "AI
              Learning Tools" link in the main navigation. You can also access context-specific AI tools directly from
              your course pages.
            </p>
            <p>To get started, simply select the tool that best fits your current learning needs:</p>
            <ul>
              <li>
                <strong>AI Tutor</strong> - Get personalized explanations and answers to your questions
              </li>
              <li>
                <strong>Assignment Generator</strong> - Create custom assignments for any subject or topic
              </li>
              <li>
                <strong>Quiz Generator</strong> - Create quizzes to test your knowledge and track progress
              </li>
              <li>
                <strong>Flashcard Generator</strong> - Generate flashcards for effective memorization and review
              </li>
            </ul>
            <p>
              Each tool is designed to work both online and offline, with changes syncing automatically when you
              reconnect to the internet.
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tutor" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2">
          <TabsTrigger value="tutor" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>AI Tutor</span>
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Assignments</span>
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="flex items-center gap-2">
            <PenTool className="h-4 w-4" />
            <span>Quizzes</span>
          </TabsTrigger>
          <TabsTrigger value="flashcards" className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4" />
            <span>Flashcards</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tutor">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                AI Tutor Documentation
              </CardTitle>
              <CardDescription>Get personalized explanations and answers to your questions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <h3>Overview</h3>
                <p>
                  The AI Tutor provides instant, personalized help across various subjects. You can ask questions, get
                  explanations, and deepen your understanding with interactive learning sessions.
                </p>

                <h3>How to Use</h3>
                <ol>
                  <li>Navigate to the AI Tutor page by clicking on "AI Tutor" in the AI Dashboard</li>
                  <li>Start a new conversation by clicking the "New Conversation" button</li>
                  <li>Type your question in the input field at the bottom of the screen</li>
                  <li>Press Enter or click the Send button to submit your question</li>
                  <li>The AI Tutor will respond with a detailed explanation</li>
                  <li>Continue the conversation by asking follow-up questions</li>
                </ol>

                <h3>Features</h3>
                <ul>
                  <li>
                    <strong>Subject Specification</strong> - Specify a subject to get more relevant answers
                  </li>
                  <li>
                    <strong>Knowledge Level Adjustment</strong> - Set your knowledge level to receive explanations
                    tailored to your understanding
                  </li>
                  <li>
                    <strong>Conversation History</strong> - Access and continue previous conversations
                  </li>
                  <li>
                    <strong>Related Topics</strong> - Discover related topics to explore further
                  </li>
                  <li>
                    <strong>Additional Resources</strong> - Get recommendations for further reading and study
                  </li>
                </ul>

                <h3>Advanced Settings</h3>
                <p>You can customize the AI Tutor's behavior by adjusting the settings:</p>
                <ul>
                  <li>
                    <strong>Tutor Personality</strong> - Choose between friendly, formal, socratic, or concise
                    communication styles
                  </li>
                  <li>
                    <strong>Response Format</strong> - Select conversational, structured, detailed, or simplified
                    response formats
                  </li>
                  <li>
                    <strong>Expertise Level</strong> - Adjust the technical depth of explanations
                  </li>
                </ul>

                <h3>Offline Support</h3>
                <p>The AI Tutor works offline, allowing you to:</p>
                <ul>
                  <li>View your conversation history</li>
                  <li>Draft questions to be sent when you're back online</li>
                  <li>Access previously received answers</li>
                </ul>
                <p>
                  When you reconnect to the internet, your drafted questions will be automatically sent to the AI Tutor.
                </p>

                <h3>Troubleshooting</h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>The AI Tutor isn't responding to my question</AccordionTrigger>
                    <AccordionContent>
                      <p>If the AI Tutor isn't responding, try the following:</p>
                      <ol>
                        <li>Check your internet connection</li>
                        <li>Refresh the page</li>
                        <li>Try rephrasing your question</li>
                        <li>Start a new conversation</li>
                      </ol>
                      <p>If the problem persists, please contact support at support@learnwise.com.</p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>How can I save important explanations?</AccordionTrigger>
                    <AccordionContent>
                      <p>
                        All conversations are automatically saved and can be accessed from the conversation history
                        panel. You can also share specific explanations using the share button next to each message.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Can I use the AI Tutor for my course material?</AccordionTrigger>
                    <AccordionContent>
                      <p>
                        Yes! When viewing a course, you can access the AI Tutor directly from the course page. The AI
                        Tutor will have context about the course material, allowing it to provide more relevant
                        explanations.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Assignment Generator Documentation
              </CardTitle>
              <CardDescription>Create custom assignments for any subject or topic</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <h3>Overview</h3>
                <p>
                  The Assignment Generator creates high-quality educational assignments tailored to specific subjects,
                  topics, and difficulty levels. It's perfect for self-study, teaching, or creating practice materials.
                </p>

                <h3>How to Use</h3>
                <ol>
                  <li>Navigate to the Assignment Generator page from the AI Dashboard</li>
                  <li>Enter the subject and topic for your assignment</li>
                  <li>Select the difficulty level</li>
                  <li>Add any additional requirements (optional)</li>
                  <li>Click "Generate Assignment"</li>
                  <li>Review the generated assignment</li>
                  <li>Save or export the assignment as needed</li>
                </ol>

                <h3>Features</h3>
                <ul>
                  <li>
                    <strong>Customizable Difficulty</strong> - Choose from beginner, intermediate, advanced, or expert
                    levels
                  </li>
                  <li>
                    <strong>Learning Objectives</strong> - Each assignment includes clear learning objectives
                  </li>
                  <li>
                    <strong>Detailed Instructions</strong> - Comprehensive instructions for completing the assignment
                  </li>
                  <li>
                    <strong>Task Breakdown</strong> - Assignments are broken down into manageable tasks with point
                    allocations
                  </li>
                  <li>
                    <strong>Resource Suggestions</strong> - Relevant resources to help complete the assignment
                  </li>
                  <li>
                    <strong>Grading Criteria</strong> - Clear criteria for evaluating the completed assignment
                  </li>
                </ul>

                <h3>Assignment Formats</h3>
                <p>The Assignment Generator supports various formats:</p>
                <ul>
                  <li>
                    <strong>Standard</strong> - Traditional assignment with tasks and instructions
                  </li>
                  <li>
                    <strong>Rubric-Based</strong> - Assignment with detailed evaluation criteria
                  </li>
                  <li>
                    <strong>Project-Based</strong> - Longer-form project with multiple components
                  </li>
                  <li>
                    <strong>Essay/Writing</strong> - Writing assignments with prompts and guidelines
                  </li>
                </ul>

                <h3>Sharing and Collaboration</h3>
                <p>You can share assignments with others:</p>
                <ul>
                  <li>Save assignments to your account</li>
                  <li>Export assignments as PDF</li>
                  <li>Share assignments via link</li>
                  <li>Make assignments public or private</li>
                </ul>

                <h3>Troubleshooting</h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>The assignment is too difficult/easy</AccordionTrigger>
                    <AccordionContent>
                      <p>If the generated assignment doesn't match your desired difficulty level, you can:</p>
                      <ol>
                        <li>Adjust the difficulty level and regenerate</li>
                        <li>Add specific requirements about the difficulty in the additional requirements field</li>
                        <li>Edit the assignment manually after generation</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>How can I customize assignments further?</AccordionTrigger>
                    <AccordionContent>
                      <p>For more customization, use the advanced settings:</p>
                      <ol>
                        <li>Click the "Settings" button before generating</li>
                        <li>Adjust parameters like assignment format, examples, and solutions</li>
                        <li>Use the additional requirements field to specify exact needs</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quizzes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="h-5 w-5 text-green-600" />
                Quiz Generator Documentation
              </CardTitle>
              <CardDescription>Create quizzes to test your knowledge and track progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <h3>Overview</h3>
                <p>
                  The Quiz Generator creates customized quizzes with various question types to test understanding and
                  knowledge retention. It helps you identify areas for improvement and track your progress over time.
                </p>

                <h3>How to Use</h3>
                <ol>
                  <li>Navigate to the Quiz Generator page from the AI Dashboard</li>
                  <li>Enter the subject and topic for your quiz</li>
                  <li>Select the number of questions</li>
                  <li>Choose the difficulty level</li>
                  <li>Select the question types you want to include</li>
                  <li>Click "Generate Quiz"</li>
                  <li>Review the generated quiz</li>
                  <li>Take the quiz or save it for later</li>
                </ol>

                <h3>Question Types</h3>
                <ul>
                  <li>
                    <strong>Multiple Choice</strong> - Questions with several options and one correct answer
                  </li>
                  <li>
                    <strong>True/False</strong> - Statements that are either true or false
                  </li>
                  <li>
                    <strong>Short Answer</strong> - Questions requiring brief text responses
                  </li>
                  <li>
                    <strong>Essay</strong> - Open-ended questions requiring longer responses
                  </li>
                </ul>

                <h3>Features</h3>
                <ul>
                  <li>
                    <strong>Explanations</strong> - Optional explanations for correct answers
                  </li>
                  <li>
                    <strong>Hints</strong> - Optional hints for difficult questions
                  </li>
                  <li>
                    <strong>Adaptive Difficulty</strong> - Quizzes can adapt to your performance
                  </li>
                  <li>
                    <strong>Progress Tracking</strong> - Track your scores and improvement over time
                  </li>
                  <li>
                    <strong>Content-Based Generation</strong> - Generate quizzes based on specific content or text
                  </li>
                </ul>

                <h3>Taking Quizzes</h3>
                <p>When taking a quiz:</p>
                <ol>
                  <li>Navigate to the "Take Quiz" tab</li>
                  <li>Select a quiz from your saved quizzes or use a recently generated one</li>
                  <li>Answer each question and use the navigation buttons to move between questions</li>
                  <li>Submit your answers when finished</li>
                  <li>Review your results, including correct answers and explanations</li>
                </ol>

                <h3>Sharing and Collaboration</h3>
                <p>You can share quizzes with others:</p>
                <ul>
                  <li>Save quizzes to your account</li>
                  <li>Export quizzes as PDF</li>
                  <li>Share quizzes via link</li>
                  <li>Make quizzes public or private</li>
                </ul>

                <h3>Troubleshooting</h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>My answers aren't being saved</AccordionTrigger>
                    <AccordionContent>
                      <p>If your answers aren't being saved while taking a quiz:</p>
                      <ol>
                        <li>Check your internet connection</li>
                        <li>Make sure you're logged in</li>
                        <li>Try refreshing the page (your progress should be saved)</li>
                        <li>Use the "Save Progress" button if available</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>How can I create a quiz from my course material?</AccordionTrigger>
                    <AccordionContent>
                      <p>To create a quiz from your course material:</p>
                      <ol>
                        <li>Navigate to the course page</li>
                        <li>Click on the "AI Learning Tools" tab</li>
                        <li>Select "Quizzes" from the tools menu</li>
                        <li>The system will automatically use the course content as context</li>
                        <li>Adjust settings as needed and generate your quiz</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flashcards">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-orange-600" />
                Flashcard Generator Documentation
              </CardTitle>
              <CardDescription>Generate flashcards for effective memorization and review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <h3>Overview</h3>
                <p>
                  The Flashcard Generator creates flashcard decks for effective memorization and spaced repetition
                  learning. It's perfect for vocabulary, definitions, key concepts, and fact-based learning.
                </p>

                <h3>How to Use</h3>
                <ol>
                  <li>Navigate to the Flashcard Generator page from the AI Dashboard</li>
                  <li>Enter a title for your flashcard deck</li>
                  <li>Specify the subject and topic</li>
                  <li>Select the number of cards to generate</li>
                  <li>Optionally, paste content to base the flashcards on</li>
                  <li>Click "Generate Flashcards"</li>
                  <li>Review the generated flashcards</li>
                  <li>Save the deck or start studying immediately</li>
                </ol>

                <h3>Features</h3>
                <ul>
                  <li>
                    <strong>Content-Based Generation</strong> - Generate flashcards from specific text or content
                  </li>
                  <li>
                    <strong>Category Organization</strong> - Flashcards can be organized by categories or subtopics
                  </li>
                  <li>
                    <strong>Spaced Repetition</strong> - Optimized for spaced repetition learning
                  </li>
                  <li>
                    <strong>Progress Tracking</strong> - Track which cards you've mastered
                  </li>
                  <li>
                    <strong>Image Suggestions</strong> - Optional image suggestions for visual learning
                  </li>
                  <li>
                    <strong>Examples</strong> - Optional examples to reinforce concepts
                  </li>
                </ul>

                <h3>Studying Flashcards</h3>
                <p>When studying flashcards:</p>
                <ol>
                  <li>Navigate to the "Study" tab</li>
                  <li>Select a deck from your saved decks or use a recently generated one</li>
                  <li>Click on a card to flip it and reveal the answer</li>
                  <li>Use the navigation buttons to move between cards</li>
                  <li>Mark cards as mastered to track your progress</li>
                </ol>

                <h3>Spaced Repetition</h3>
                <p>The flashcard system uses spaced repetition to optimize learning:</p>
                <ul>
                  <li>Cards you find difficult will appear more frequently</li>
                  <li>Cards you've mastered will appear less frequently</li>
                  <li>The system adapts to your learning pace</li>
                  <li>You'll receive reminders to review cards at optimal intervals</li>
                </ul>

                <h3>Offline Support</h3>
                <p>Flashcards work offline, allowing you to:</p>
                <ul>
                  <li>Study your saved flashcard decks without an internet connection</li>
                  <li>Track your progress offline</li>
                  <li>Create new flashcards (they'll be synced when you're back online)</li>
                </ul>

                <h3>Troubleshooting</h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>How can I edit flashcards?</AccordionTrigger>
                    <AccordionContent>
                      <p>To edit flashcards:</p>
                      <ol>
                        <li>Navigate to the "Preview" or "Saved" tab</li>
                        <li>Find the deck containing the card you want to edit</li>
                        <li>Click "View" to see all cards in the deck</li>
                        <li>Click the "Edit" button on the specific card</li>
                        <li>Make your changes and save</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Can I import existing flashcards?</AccordionTrigger>
                    <AccordionContent>
                      <p>Yes, you can import existing flashcards:</p>
                      <ol>
                        <li>Navigate to the "Create" tab</li>
                        <li>Click the "Import" button</li>
                        <li>Select the file format (CSV, TXT, or Anki)</li>
                        <li>Upload your file</li>
                        <li>Map the columns to front/back/category fields</li>
                        <li>Click "Import" to add the cards to your account</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
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
          If you have any questions or need further assistance with our AI learning tools, please contact our support
          team.
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
