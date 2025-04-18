"use client"

import type React from "react"

import { SelectItem } from "@/components/ui/select"

import { SelectContent } from "@/components/ui/select"

import { SelectValue } from "@/components/ui/select"

import { SelectTrigger } from "@/components/ui/select"

import { Select } from "@/components/ui/select"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, MessageSquare, Share, Filter, Search, Users } from "lucide-react"
import Link from "next/link"

// Sample discussion data
const discussions = [
  {
    id: "disc-1",
    title: "How to solve quadratic equations?",
    content: "I'm having trouble understanding the quadratic formula. Can someone explain it in simple terms?",
    author: {
      name: "Alex Johnson",
      avatar: "/vibrant-street-market.png",
      role: "Student",
    },
    category: "Mathematics",
    replies: 12,
    likes: 8,
    createdAt: "2 days ago",
    isPopular: true,
  },
  {
    id: "disc-2",
    title: "Understanding photosynthesis process",
    content: "What are the key stages of photosynthesis and how does it work at the cellular level?",
    author: {
      name: "Emma Davis",
      avatar: "/mystical-forest-spirit.png",
      role: "Student",
    },
    category: "Biology",
    replies: 8,
    likes: 15,
    createdAt: "1 day ago",
    isPopular: true,
  },
  {
    id: "disc-3",
    title: "Tips for AP Chemistry exam",
    content: "I'm preparing for the AP Chemistry exam. Does anyone have study tips or resources to share?",
    author: {
      name: "Michael Smith",
      avatar: "/mystical-forest-spirit.png",
      role: "Student",
    },
    category: "Chemistry",
    replies: 20,
    likes: 32,
    createdAt: "3 days ago",
    isPopular: true,
  },
  {
    id: "disc-4",
    title: "Historical significance of the Renaissance",
    content:
      "I'm working on a project about the Renaissance. What were the most significant cultural changes during this period?",
    author: {
      name: "Sophia Lee",
      avatar: "/mystical-forest-spirit.png",
      role: "Student",
    },
    category: "History",
    replies: 15,
    likes: 10,
    createdAt: "4 days ago",
    isPopular: false,
  },
]

// Sample study group data
const studyGroups = [
  {
    id: "group-1",
    name: "AP Biology Study Group",
    description: "A group for students preparing for the AP Biology exam",
    members: 24,
    category: "Biology",
    image: "/diverse-cell-landscape.png",
  },
  {
    id: "group-2",
    name: "Calculus Problem Solvers",
    description: "Working through challenging calculus problems together",
    members: 18,
    category: "Mathematics",
    image: "/abstract-mathematics.png",
  },
  {
    id: "group-3",
    name: "Chemistry Lab Partners",
    description: "Discussing chemistry experiments and lab techniques",
    members: 15,
    category: "Chemistry",
    image: "/busy-chemistry-lab.png",
  },
  {
    id: "group-4",
    name: "World History Explorers",
    description: "Exploring historical events and their impact on today's world",
    members: 20,
    category: "History",
    image: "/ancient-civilizations-timeline.png",
  },
]

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("discussions")
  const [newPostContent, setNewPostContent] = useState("")

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return

    // In a real app, this would send the post to an API
    console.log("Creating new post:", newPostContent)
    setNewPostContent("")

    // Show success message
    alert("Post created successfully!")
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Community</h1>
        <p className="text-muted-foreground">Connect with other students and join study groups.</p>
      </div>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search discussions..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button size="sm">
            <MessageSquare className="mr-2 h-4 w-4" />
            New Discussion
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full justify-start rounded-lg bg-muted p-1">
          <TabsTrigger value="discussions" className="rounded-md">
            Discussions
          </TabsTrigger>
          <TabsTrigger value="study-groups" className="rounded-md">
            Study Groups
          </TabsTrigger>
          <TabsTrigger value="create-post" className="rounded-md">
            Create Post
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discussions">
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <Card key={discussion.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={discussion.author.avatar || "/placeholder.svg"}
                            alt={discussion.author.name}
                          />
                          <AvatarFallback>{discussion.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{discussion.author.name}</p>
                          <p className="text-xs text-muted-foreground">{discussion.createdAt}</p>
                        </div>
                      </div>
                      <Badge>{discussion.category}</Badge>
                    </div>
                    <Link href={`/community/discussions/${discussion.id}`} className="hover:underline">
                      <h3 className="text-xl font-bold mb-2">{discussion.title}</h3>
                    </Link>
                    <p className="text-muted-foreground mb-4">{discussion.content}</p>
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm" className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{discussion.likes}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{discussion.replies}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center gap-1">
                        <Share className="h-4 w-4" />
                        <span>Share</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="study-groups">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {studyGroups.map((group) => (
              <Card key={group.id} className="overflow-hidden">
                <div className="relative h-40">
                  <img
                    src={group.image || "/placeholder.svg"}
                    alt={group.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <Badge className="mb-1">{group.category}</Badge>
                    <h3 className="text-lg font-bold text-white">{group.name}</h3>
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-4">{group.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-sm">{group.members} members</span>
                    </div>
                    <Button size="sm" asChild>
                      <Link href={`/community/groups/${group.id}`}>Join Group</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create-post">
          <Card>
            <CardHeader>
              <CardTitle>Create a New Discussion</CardTitle>
              <CardDescription>Share your questions or insights with the community</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="post-title">Title</Label>
                <Input id="post-title" placeholder="Enter a descriptive title for your discussion" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="post-category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="biology">Biology</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                    <SelectItem value="literature">Literature</SelectItem>
                    <SelectItem value="computer-science">Computer Science</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="post-content">Content</Label>
                <Textarea
                  id="post-content"
                  placeholder="Share your thoughts, questions, or insights..."
                  className="min-h-[200px]"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleCreatePost} disabled={!newPostContent.trim()}>
                  Create Discussion
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Label component for the form
function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {children}
    </label>
  )
}
