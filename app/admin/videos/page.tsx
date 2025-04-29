import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, FilePlus, Pencil, Search, Trash2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Admin Videos",
  description: "Manage course videos in the admin dashboard",
}

// Mock data for videos
const videos = [
  {
    id: "1",
    title: "Introduction to Machine Learning",
    duration: "45:30",
    uploadDate: "2023-10-15",
    views: 1245,
    status: "published",
  },
  {
    id: "2",
    title: "Advanced Python Programming",
    duration: "1:12:45",
    uploadDate: "2023-11-02",
    views: 876,
    status: "published",
  },
  {
    id: "3",
    title: "Data Structures and Algorithms",
    duration: "58:20",
    uploadDate: "2023-11-10",
    views: 543,
    status: "draft",
  },
  {
    id: "4",
    title: "Web Development Fundamentals",
    duration: "1:05:15",
    uploadDate: "2023-11-18",
    views: 321,
    status: "processing",
  },
]

export default function AdminVideosPage() {
  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Videos</h1>
        <Button>
          <FilePlus className="mr-2 h-4 w-4" />
          Upload New Video
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search videos..." className="w-full pl-8" />
        </div>
        <Button variant="outline">Filters</Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Videos</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="published" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {videos
              .filter((video) => video.status === "published")
              .map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
          </div>
        </TabsContent>
        <TabsContent value="drafts" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {videos
              .filter((video) => video.status === "draft")
              .map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
          </div>
        </TabsContent>
        <TabsContent value="processing" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {videos
              .filter((video) => video.status === "processing")
              .map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function VideoCard({ video }: { video: (typeof videos)[number] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="aspect-video w-full bg-muted rounded-md flex items-center justify-center">
          <span className="text-muted-foreground">Video Preview</span>
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-lg">{video.title}</CardTitle>
        <CardDescription className="flex items-center mt-1">
          <CalendarDays className="h-3.5 w-3.5 mr-1" />
          {video.uploadDate} • {video.duration}
        </CardDescription>
        <div className="mt-2 flex items-center text-sm">
          <span className="mr-2">{video.views} views</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              video.status === "published"
                ? "bg-green-100 text-green-800"
                : video.status === "draft"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-blue-100 text-blue-800"
            }`}
          >
            {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/videos/${video.id}`}>
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Edit
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="text-destructive">
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  )
}
