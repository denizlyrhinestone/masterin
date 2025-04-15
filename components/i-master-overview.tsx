"use client"

import { useState } from "react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Brain,
  Users,
  BarChart,
  Code,
  MessageSquare,
  FileText,
  Lightbulb,
  CheckCircle,
  Clock,
  Layers,
} from "lucide-react"

export default function IMasterOverview() {
  const [activeTab, setActiveTab] = useState("features")

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">i-Master AI Tutor System</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          A next-generation AI educational assistant designed to provide personalized learning experiences and transform
          how students engage with educational content.
        </p>
      </div>

      <Tabs defaultValue="features" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="features">Core Features</TabsTrigger>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="implementation">Implementation</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">Personalized Learning Experience</h2>
              <p className="mb-4">
                i-Master adapts to each student's unique learning style, pace, and knowledge gaps, creating a truly
                personalized educational journey.
              </p>
              <ul className="space-y-2">
                {[
                  "Adaptive learning paths based on performance",
                  "Personalized content recommendations",
                  "Custom difficulty adjustment",
                  "Learning style recognition",
                  "Progress tracking and goal setting",
                ].map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <Image
                src="/placeholder.svg?height=300&width=500"
                alt="Personalized learning dashboard"
                width={500}
                height={300}
                className="object-cover"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <MessageSquare className="h-6 w-6 text-blue-500 mb-2" />
                <CardTitle>Intelligent Tutoring</CardTitle>
                <CardDescription>Natural conversations with contextual understanding</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Engage in natural dialogue with i-Master to ask questions, receive explanations, and explore concepts
                  through conversational learning.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="h-6 w-6 text-purple-500 mb-2" />
                <CardTitle>Real-time Feedback</CardTitle>
                <CardDescription>Immediate, actionable guidance on assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Receive instant feedback on assignments, practice problems, and assessments with specific suggestions
                  for improvement.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Lightbulb className="h-6 w-6 text-yellow-500 mb-2" />
                <CardTitle>Knowledge Enhancement</CardTitle>
                <CardDescription>Supplementary materials and explanations</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Access additional resources, examples, and alternative explanations to reinforce understanding of
                  difficult concepts.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="architecture" className="space-y-8">
          <div className="bg-slate-50 p-8 rounded-lg border">
            <h2 className="text-2xl font-bold mb-6">Technical Architecture</h2>
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h3 className="font-bold text-lg mb-2 flex items-center">
                    <Brain className="h-5 w-5 text-blue-500 mr-2" />
                    AI Core Models
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Large Language Models (LLMs)</li>
                    <li>• Knowledge Retrieval System</li>
                    <li>• Student Modeling Engine</li>
                    <li>• Content Recommendation System</li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h3 className="font-bold text-lg mb-2 flex items-center">
                    <Layers className="h-5 w-5 text-purple-500 mr-2" />
                    Middleware & Integration
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li>• API Gateway</li>
                    <li>• LMS Integration Services</li>
                    <li>• Authentication & Authorization</li>
                    <li>• Data Processing Pipeline</li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h3 className="font-bold text-lg mb-2 flex items-center">
                    <Users className="h-5 w-5 text-green-500 mr-2" />
                    User-Facing Components
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Conversational Interface</li>
                    <li>• Student Dashboard</li>
                    <li>• Instructor Controls</li>
                    <li>• Content Delivery System</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 bg-white p-4 rounded-lg border shadow-sm">
                <h3 className="font-bold text-lg mb-2 flex items-center">
                  <BarChart className="h-5 w-5 text-orange-500 mr-2" />
                  Data Infrastructure
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium mb-1">Storage Systems:</p>
                    <ul className="space-y-1">
                      <li>• Student Profile Database</li>
                      <li>• Learning Content Repository</li>
                      <li>• Interaction History Database</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Analytics Systems:</p>
                    <ul className="space-y-1">
                      <li>• Performance Analytics Engine</li>
                      <li>• Learning Pattern Recognition</li>
                      <li>• Feedback Analysis System</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <Code className="h-6 w-6 text-blue-500 mb-2" />
                <CardTitle>Integration Capabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  i-Master is designed to seamlessly integrate with existing educational technology ecosystems:
                </p>
                <ul className="space-y-2">
                  <li>• LMS Integration (Canvas, Moodle, Blackboard)</li>
                  <li>• SSO Authentication Systems</li>
                  <li>• Content Management Systems</li>
                  <li>• Assessment Platforms</li>
                  <li>• Student Information Systems</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="h-6 w-6 text-purple-500 mb-2" />
                <CardTitle>Scalability & Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">The system architecture is designed for high performance and scalability:</p>
                <ul className="space-y-2">
                  <li>• Cloud-native microservices architecture</li>
                  <li>• Horizontal scaling for handling peak loads</li>
                  <li>• Caching strategies for improved response times</li>
                  <li>• Asynchronous processing for resource-intensive tasks</li>
                  <li>• Global distribution for low-latency worldwide access</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="implementation" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Implementation Strategy</h2>
              <p className="mb-4">
                A phased approach to deploying i-Master across educational environments, ensuring smooth adoption and
                maximum effectiveness.
              </p>

              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="font-bold text-lg mb-2 text-blue-700">Phase 1: Pilot Program</h3>
                  <ul className="space-y-1 text-blue-800">
                    <li>• Select 2-3 courses for initial implementation</li>
                    <li>• Train faculty and support staff</li>
                    <li>• Gather baseline metrics for comparison</li>
                    <li>• Deploy core functionality only</li>
                  </ul>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <h3 className="font-bold text-lg mb-2 text-purple-700">Phase 2: Expanded Deployment</h3>
                  <ul className="space-y-1 text-purple-800">
                    <li>• Roll out to additional courses based on pilot results</li>
                    <li>• Implement feedback-driven improvements</li>
                    <li>• Add advanced features and integrations</li>
                    <li>• Establish ongoing support systems</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h3 className="font-bold text-lg mb-2 text-green-700">Phase 3: Full Integration</h3>
                  <ul className="space-y-1 text-green-800">
                    <li>• Campus-wide availability across all suitable courses</li>
                    <li>• Deep integration with institutional systems</li>
                    <li>• Continuous improvement based on analytics</li>
                    <li>• Development of custom features for specific disciplines</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Subject Suitability</h2>
              <p className="mb-4">
                While i-Master can benefit most educational areas, certain subjects are particularly well-suited for
                initial implementation:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-blue-800">STEM Subjects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm">
                      <li>• Mathematics</li>
                      <li>• Computer Science</li>
                      <li>• Physics</li>
                      <li>• Engineering</li>
                      <li>• Chemistry</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-purple-800">Language Learning</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm">
                      <li>• ESL/EFL</li>
                      <li>• Foreign Languages</li>
                      <li>• Grammar & Composition</li>
                      <li>• Technical Writing</li>
                      <li>• Reading Comprehension</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-amber-800">Business Studies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm">
                      <li>• Accounting</li>
                      <li>• Economics</li>
                      <li>• Marketing</li>
                      <li>• Management</li>
                      <li>• Finance</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-green-800">Health Sciences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm">
                      <li>• Anatomy</li>
                      <li>• Physiology</li>
                      <li>• Pharmacology</li>
                      <li>• Medical Terminology</li>
                      <li>• Clinical Procedures</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <h3 className="font-bold text-lg mb-2">Evaluation Methods</h3>
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Performance Metrics:</span> Track improvements in grades,
                        completion rates, and assessment scores
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Engagement Analytics:</span> Measure time spent learning,
                        interaction frequency, and resource utilization
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">User Satisfaction:</span> Regular surveys and feedback collection
                        from students and instructors
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Learning Outcomes:</span> Assessment of specific learning
                        objectives and competency development
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="roadmap" className="space-y-8">
          <div className="bg-slate-50 p-8 rounded-lg border">
            <h2 className="text-2xl font-bold mb-6">Development Roadmap</h2>

            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>

              <div className="space-y-8 relative">
                <div className="ml-10 relative">
                  <div className="absolute -left-10 top-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white">
                    1
                  </div>
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <h3 className="font-bold text-lg mb-2 text-blue-700">Foundation (6 months)</h3>
                    <ul className="space-y-2">
                      <li>• Core conversational AI capabilities</li>
                      <li>• Basic personalization engine</li>
                      <li>• LMS integration framework</li>
                      <li>• Student profile management</li>
                      <li>• Content delivery system</li>
                    </ul>
                  </div>
                </div>

                <div className="ml-10 relative">
                  <div className="absolute -left-10 top-0 flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 text-white">
                    2
                  </div>
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <h3 className="font-bold text-lg mb-2 text-purple-700">Enhancement (12 months)</h3>
                    <ul className="space-y-2">
                      <li>• Advanced learning analytics</li>
                      <li>• Expanded subject-specific knowledge</li>
                      <li>• Improved feedback mechanisms</li>
                      <li>• Multi-modal content support</li>
                      <li>• Instructor dashboards and controls</li>
                    </ul>
                  </div>
                </div>

                <div className="ml-10 relative">
                  <div className="absolute -left-10 top-0 flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white">
                    3
                  </div>
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <h3 className="font-bold text-lg mb-2 text-green-700">Advanced Features (18 months)</h3>
                    <ul className="space-y-2">
                      <li>• Sentiment analysis for emotional support</li>
                      <li>• Computer vision for diagram and handwriting recognition</li>
                      <li>• Collaborative learning facilitation</li>
                      <li>• Predictive analytics for intervention</li>
                      <li>• Customizable AI teaching assistants</li>
                    </ul>
                  </div>
                </div>

                <div className="ml-10 relative">
                  <div className="absolute -left-10 top-0 flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white">
                    4
                  </div>
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <h3 className="font-bold text-lg mb-2 text-amber-700">Expansion (24+ months)</h3>
                    <ul className="space-y-2">
                      <li>• Cross-disciplinary knowledge connections</li>
                      <li>• Adaptive curriculum development</li>
                      <li>• Extended reality (XR) integration</li>
                      <li>• Lifelong learning portfolio management</li>
                      <li>• Institutional knowledge network</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Ethical Considerations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="bg-blue-100 text-blue-800 rounded-full p-1 mr-2 flex-shrink-0 mt-0.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium">Data Privacy & Security</span>
                      <p className="text-sm text-muted-foreground">
                        Implementing robust data protection measures, transparent policies, and compliance with
                        regulations like FERPA and GDPR.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-blue-100 text-blue-800 rounded-full p-1 mr-2 flex-shrink-0 mt-0.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium">Algorithmic Bias</span>
                      <p className="text-sm text-muted-foreground">
                        Regular auditing of AI models for bias, diverse training data, and continuous monitoring of
                        recommendations and assessments.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-blue-100 text-blue-800 rounded-full p-1 mr-2 flex-shrink-0 mt-0.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium">Human-AI Balance</span>
                      <p className="text-sm text-muted-foreground">
                        Designing i-Master to complement rather than replace human educators, with clear guidelines for
                        appropriate use.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-blue-100 text-blue-800 rounded-full p-1 mr-2 flex-shrink-0 mt-0.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium">Transparency</span>
                      <p className="text-sm text-muted-foreground">
                        Clear communication about AI capabilities, limitations, and how student data is used to inform
                        recommendations.
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Long-Term Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">i-Master represents a transformative approach to education that can evolve into:</p>

                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="bg-green-100 text-green-800 rounded-full p-1 mr-2 flex-shrink-0 mt-0.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium">Lifelong Learning Companion</span>
                      <p className="text-sm text-muted-foreground">
                        Extending beyond formal education to support continuous professional development and personal
                        learning goals.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-green-100 text-green-800 rounded-full p-1 mr-2 flex-shrink-0 mt-0.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium">Institutional Knowledge Network</span>
                      <p className="text-sm text-muted-foreground">
                        Creating connections between courses, departments, and institutions to provide comprehensive
                        educational experiences.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-green-100 text-green-800 rounded-full p-1 mr-2 flex-shrink-0 mt-0.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium">Adaptive Curriculum Development</span>
                      <p className="text-sm text-muted-foreground">
                        Using insights from student interactions to continuously improve course materials and teaching
                        approaches.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-green-100 text-green-800 rounded-full p-1 mr-2 flex-shrink-0 mt-0.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium">Global Education Equalizer</span>
                      <p className="text-sm text-muted-foreground">
                        Democratizing access to high-quality educational support regardless of geographic or
                        socioeconomic factors.
                      </p>
                    </div>
                  </li>
                </ul>

                <Button className="mt-6 w-full">Request Implementation Consultation</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
