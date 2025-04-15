"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  getLMSPlatformDetails,
  shareToLMS,
  type ContentType,
  type LMSConnection,
  type ShareOptions,
} from "@/lib/lms-integration"

interface LMSShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  connection: LMSConnection
}

export function LMSShareDialog({ open, onOpenChange, connection }: LMSShareDialogProps) {
  const { toast } = useToast()
  const [contentType, setContentType] = useState<ContentType>("assignment")
  const [contentId, setContentId] = useState("")
  const [courseId, setCourseId] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [points, setPoints] = useState("10")
  const [isPublished, setIsPublished] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  const platformDetails = getLMSPlatformDetails(connection.platform)

  const resetForm = () => {
    setContentType("assignment")
    setContentId("")
    setCourseId("")
    setDescription("")
    setDueDate("")
    setPoints("10")
    setIsPublished(false)
  }

  const handleShare = async () => {
    if (!contentId) {
      toast({
        title: "Missing information",
        description: "Please select content to share",
        variant: "destructive",
      })
      return
    }

    setIsSharing(true)
    try {
      const options: ShareOptions = {
        contentType,
        contentId,
        courseId: courseId || undefined,
        description: description || undefined,
        dueDate: dueDate || undefined,
        points: points ? Number(points) : undefined,
        isPublished,
      }

      const result = await shareToLMS(connection.id, options)

      if (result.success) {
        toast({
          title: "Share successful",
          description: result.message,
        })
        resetForm()
        onOpenChange(false)
      } else {
        throw new Error(result.message)
      }
    } catch (error: any) {
      console.error("Error sharing to LMS:", error)
      toast({
        title: "Share failed",
        description: error.message || "Failed to share to LMS. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share to {platformDetails.name}</DialogTitle>
          <DialogDescription>
            Share your content to {platformDetails.name} at {connection.instanceUrl}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="content-type" className="text-right">
              Content Type
            </Label>
            <Select
              value={contentType}
              onValueChange={(value) => setContentType(value as ContentType)}
              disabled={isSharing}
            >
              <SelectTrigger id="content-type" className="col-span-3">
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assignment">Assignment</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
                <SelectItem value="flashcards">Flashcards</SelectItem>
                <SelectItem value="notes">Notes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="content-id" className="text-right">
              Content ID
            </Label>
            <Input
              id="content-id"
              placeholder="Enter content ID"
              value={contentId}
              onChange={(e) => setContentId(e.target.value)}
              className="col-span-3"
              disabled={isSharing}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="course-id" className="text-right">
              Course ID
            </Label>
            <Input
              id="course-id"
              placeholder="Enter course ID (optional)"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="col-span-3"
              disabled={isSharing}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              placeholder="Enter description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              disabled={isSharing}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="due-date" className="text-right">
              Due Date
            </Label>
            <Input
              id="due-date"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="col-span-3"
              disabled={isSharing}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="points" className="text-right">
              Points
            </Label>
            <Input
              id="points"
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="col-span-3"
              disabled={isSharing}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right">
              <Label htmlFor="published">Published</Label>
            </div>
            <div className="col-span-3 flex items-center space-x-2">
              <Checkbox
                id="published"
                checked={isPublished}
                onCheckedChange={(checked) => setIsPublished(checked === true)}
                disabled={isSharing}
              />
              <Label htmlFor="published">Publish immediately</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isSharing}>
            Cancel
          </Button>
          <Button type="button" onClick={handleShare} disabled={isSharing}>
            {isSharing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sharing...
              </>
            ) : (
              "Share"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
