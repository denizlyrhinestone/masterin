"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function IMasterArchitectureDiagram() {
  const [activeTab, setActiveTab] = useState("technical")

  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue="technical" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="data">Data Flow</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="technical" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>i-Master Technical Architecture</CardTitle>
              <CardDescription>Core components and their relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-auto">
                <svg width="100%" height="500" viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* User Layer */}
                  <rect x="300" y="20" width="200" height="60" rx="8" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
                  <text x="400" y="55" textAnchor="middle" fill="#0284C7" fontWeight="bold">
                    User Interfaces
                  </text>

                  {/* Application Layer */}
                  <rect
                    x="100"
                    y="130"
                    width="600"
                    height="100"
                    rx="8"
                    fill="#F0F9FF"
                    stroke="#0284C7"
                    strokeWidth="2"
                  />
                  <text x="400" y="155" textAnchor="middle" fill="#0284C7" fontWeight="bold">
                    Application Layer
                  </text>

                  {/* Application Components */}
                  <rect x="120" y="170" width="120" height="40" rx="4" fill="white" stroke="#0284C7" strokeWidth="1" />
                  <text x="180" y="195" textAnchor="middle" fontSize="12">
                    Conversation UI
                  </text>

                  <rect x="260" y="170" width="120" height="40" rx="4" fill="white" stroke="#0284C7" strokeWidth="1" />
                  <text x="320" y="195" textAnchor="middle" fontSize="12">
                    Content Delivery
                  </text>

                  <rect x="400" y="170" width="120" height="40" rx="4" fill="white" stroke="#0284C7" strokeWidth="1" />
                  <text x="460" y="195" textAnchor="middle" fontSize="12">
                    Assessment Engine
                  </text>

                  <rect x="540" y="170" width="120" height="40" rx="4" fill="white" stroke="#0284C7" strokeWidth="1" />
                  <text x="600" y="195" textAnchor="middle" fontSize="12">
                    Analytics Dashboard
                  </text>

                  {/* AI Core Layer */}
                  <rect
                    x="100"
                    y="280"
                    width="600"
                    height="100"
                    rx="8"
                    fill="#EFF6FF"
                    stroke="#2563EB"
                    strokeWidth="2"
                  />
                  <text x="400" y="305" textAnchor="middle" fill="#2563EB" fontWeight="bold">
                    AI Core Layer
                  </text>

                  {/* AI Core Components */}
                  <rect x="120" y="320" width="120" height="40" rx="4" fill="white" stroke="#2563EB" strokeWidth="1" />
                  <text x="180" y="345" textAnchor="middle" fontSize="12">
                    LLM Engine
                  </text>

                  <rect x="260" y="320" width="120" height="40" rx="4" fill="white" stroke="#2563EB" strokeWidth="1" />
                  <text x="320" y="345" textAnchor="middle" fontSize="12">
                    Knowledge Base
                  </text>

                  <rect x="400" y="320" width="120" height="40" rx="4" fill="white" stroke="#2563EB" strokeWidth="1" />
                  <text x="460" y="345" textAnchor="middle" fontSize="12">
                    Student Modeling
                  </text>

                  <rect x="540" y="320" width="120" height="40" rx="4" fill="white" stroke="#2563EB" strokeWidth="1" />
                  <text x="600" y="345" textAnchor="middle" fontSize="12">
                    Recommendation Engine
                  </text>

                  {/* Data Layer */}
                  <rect
                    x="100"
                    y="430"
                    width="600"
                    height="60"
                    rx="8"
                    fill="#EEF2FF"
                    stroke="#4F46E5"
                    strokeWidth="2"
                  />
                  <text x="400" y="465" textAnchor="middle" fill="#4F46E5" fontWeight="bold">
                    Data Infrastructure Layer
                  </text>

                  {/* Connecting Lines */}
                  {/* User to App */}
                  <line x1="400" y1="80" x2="400" y2="130" stroke="#94A3B8" strokeWidth="2" strokeDasharray="5,5" />

                  {/* App to AI */}
                  <line x1="400" y1="230" x2="400" y2="280" stroke="#94A3B8" strokeWidth="2" strokeDasharray="5,5" />

                  {/* AI to Data */}
                  <line x1="400" y1="380" x2="400" y2="430" stroke="#94A3B8" strokeWidth="2" strokeDasharray="5,5" />
                </svg>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>i-Master Data Flow</CardTitle>
              <CardDescription>How data moves through the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-auto">
                <svg width="100%" height="500" viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Student */}
                  <circle cx="100" cy="100" r="40" fill="#DBEAFE" stroke="#2563EB" strokeWidth="2" />
                  <text x="100" y="105" textAnchor="middle" fill="#2563EB" fontWeight="bold">
                    Student
                  </text>

                  {/* Interaction */}
                  <rect
                    x="220"
                    y="80"
                    width="120"
                    height="40"
                    rx="20"
                    fill="#EFF6FF"
                    stroke="#2563EB"
                    strokeWidth="2"
                  />
                  <text x="280" y="105" textAnchor="middle" fill="#2563EB" fontSize="14">
                    Interaction
                  </text>

                  {/* Processing */}
                  <rect
                    x="400"
                    y="80"
                    width="120"
                    height="40"
                    rx="20"
                    fill="#EFF6FF"
                    stroke="#2563EB"
                    strokeWidth="2"
                  />
                  <text x="460" y="105" textAnchor="middle" fill="#2563EB" fontSize="14">
                    Processing
                  </text>

                  {/* Response */}
                  <rect
                    x="580"
                    y="80"
                    width="120"
                    height="40"
                    rx="20"
                    fill="#EFF6FF"
                    stroke="#2563EB"
                    strokeWidth="2"
                  />
                  <text x="640" y="105" textAnchor="middle" fill="#2563EB" fontSize="14">
                    Response
                  </text>

                  {/* Student Profile */}
                  <rect
                    x="220"
                    y="200"
                    width="120"
                    height="60"
                    rx="8"
                    fill="#F0FDF4"
                    stroke="#16A34A"
                    strokeWidth="2"
                  />
                  <text x="280" y="235" textAnchor="middle" fill="#16A34A" fontWeight="bold">
                    Student Profile
                  </text>

                  {/* Content Repository */}
                  <rect
                    x="400"
                    y="200"
                    width="120"
                    height="60"
                    rx="8"
                    fill="#FEF3C7"
                    stroke="#D97706"
                    strokeWidth="2"
                  />
                  <text x="460" y="235" textAnchor="middle" fill="#D97706" fontWeight="bold">
                    Content Repository
                  </text>

                  {/* Learning Analytics */}
                  <rect
                    x="580"
                    y="200"
                    width="120"
                    height="60"
                    rx="8"
                    fill="#F3E8FF"
                    stroke="#9333EA"
                    strokeWidth="2"
                  />
                  <text x="640" y="235" textAnchor="middle" fill="#9333EA" fontWeight="bold">
                    Learning Analytics
                  </text>

                  {/* LMS */}
                  <rect
                    x="400"
                    y="350"
                    width="120"
                    height="60"
                    rx="8"
                    fill="#E0F2FE"
                    stroke="#0284C7"
                    strokeWidth="2"
                  />
                  <text x="460" y="385" textAnchor="middle" fill="#0284C7" fontWeight="bold">
                    LMS Integration
                  </text>

                  {/* Connecting Lines */}
                  <line
                    x1="140"
                    y1="100"
                    x2="220"
                    y2="100"
                    stroke="#94A3B8"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                  <line
                    x1="340"
                    y1="100"
                    x2="400"
                    y2="100"
                    stroke="#94A3B8"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                  <line
                    x1="520"
                    y1="100"
                    x2="580"
                    y2="100"
                    stroke="#94A3B8"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                  <line x1="640" y1="120" x2="640" y2="150" stroke="#94A3B8" strokeWidth="2" />
                  <line x1="640" y1="150" x2="100" y2="150" stroke="#94A3B8" strokeWidth="2" />
                  <line
                    x1="100"
                    y1="150"
                    x2="100"
                    y2="120"
                    stroke="#94A3B8"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />

                  <line
                    x1="280"
                    y1="120"
                    x2="280"
                    y2="200"
                    stroke="#94A3B8"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                  <line
                    x1="460"
                    y1="120"
                    x2="460"
                    y2="200"
                    stroke="#94A3B8"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                  <line x1="640" y1="260" x2="640" y2="300" stroke="#94A3B8" strokeWidth="2" />
                  <line x1="640" y1="300" x2="460" y2="300" stroke="#94A3B8" strokeWidth="2" />
                  <line
                    x1="460"
                    y1="300"
                    x2="460"
                    y2="350"
                    stroke="#94A3B8"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />

                  <line x1="280" y1="260" x2="280" y2="380" stroke="#94A3B8" strokeWidth="2" />
                  <line
                    x1="280"
                    y1="380"
                    x2="400"
                    y2="380"
                    stroke="#94A3B8"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />

                  {/* Arrow Marker */}
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#94A3B8" />
                    </marker>
                  </defs>
                </svg>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>i-Master Integration Architecture</CardTitle>
              <CardDescription>How i-Master connects with existing systems</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-auto">
                <svg width="100%" height="500" viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* i-Master Core */}
                  <circle cx="400" cy="250" r="80" fill="#EFF6FF" stroke="#2563EB" strokeWidth="2" />
                  <text x="400" y="255" textAnchor="middle" fill="#2563EB" fontWeight="bold">
                    i-Master Core
                  </text>

                  {/* LMS */}
                  <rect
                    x="100"
                    y="100"
                    width="120"
                    height="60"
                    rx="8"
                    fill="#E0F2FE"
                    stroke="#0284C7"
                    strokeWidth="2"
                  />
                  <text x="160" y="135" textAnchor="middle" fill="#0284C7" fontWeight="bold">
                    LMS
                  </text>

                  {/* CMS */}
                  <rect
                    x="100"
                    y="350"
                    width="120"
                    height="60"
                    rx="8"
                    fill="#F0FDF4"
                    stroke="#16A34A"
                    strokeWidth="2"
                  />
                  <text x="160" y="385" textAnchor="middle" fill="#16A34A" fontWeight="bold">
                    CMS
                  </text>

                  {/* Assessment Platform */}
                  <rect
                    x="580"
                    y="100"
                    width="120"
                    height="60"
                    rx="8"
                    fill="#FEF3C7"
                    stroke="#D97706"
                    strokeWidth="2"
                  />
                  <text x="640" y="135" textAnchor="middle" fill="#D97706" fontWeight="bold">
                    Assessment
                  </text>

                  {/* Student Information */}
                  <rect
                    x="580"
                    y="350"
                    width="120"
                    height="60"
                    rx="8"
                    fill="#F3E8FF"
                    stroke="#9333EA"
                    strokeWidth="2"
                  />
                  <text x="640" y="385" textAnchor="middle" fill="#9333EA" fontWeight="bold">
                    SIS
                  </text>

                  {/* API Gateway */}
                  <rect
                    x="340"
                    y="400"
                    width="120"
                    height="40"
                    rx="20"
                    fill="#DBEAFE"
                    stroke="#2563EB"
                    strokeWidth="2"
                  />
                  <text x="400" y="425" textAnchor="middle" fill="#2563EB" fontSize="14">
                    API Gateway
                  </text>

                  {/* Authentication */}
                  <rect
                    x="340"
                    y="60"
                    width="120"
                    height="40"
                    rx="20"
                    fill="#DBEAFE"
                    stroke="#2563EB"
                    strokeWidth="2"
                  />
                  <text x="400" y="85" textAnchor="middle" fill="#2563EB" fontSize="14">
                    Authentication
                  </text>

                  {/* Connecting Lines */}
                  <line
                    x1="220"
                    y1="130"
                    x2="330"
                    y2="210"
                    stroke="#94A3B8"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                  <line
                    x1="220"
                    y1="350"
                    x2="330"
                    y2="290"
                    stroke="#94A3B8"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                  <line
                    x1="580"
                    y1="130"
                    x2="470"
                    y2="210"
                    stroke="#94A3B8"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                  <line
                    x1="580"
                    y1="350"
                    x2="470"
                    y2="290"
                    stroke="#94A3B8"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />

                  <line
                    x1="400"
                    y1="330"
                    x2="400"
                    y2="400"
                    stroke="#94A3B8"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                  <line
                    x1="400"
                    y1="170"
                    x2="400"
                    y2="100"
                    stroke="#94A3B8"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />

                  {/* Arrow Marker */}
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#94A3B8" />
                    </marker>
                  </defs>
                </svg>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
