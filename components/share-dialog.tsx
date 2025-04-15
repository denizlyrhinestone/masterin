"use client"

import type React from "react"

import { useState } from "react"
import { Check, Copy, Share2, Mail, Twitter, Facebook } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

interface ShareDialogProps {
  title: string
  type: "assignment" | "quiz" | "flashcards" | "tutor"
  id: string
  isPublic?: boolean
  onVisibilityChange?: (isPublic: boolean) => Promise<void>
  children?: React.ReactNode
}

export function ShareDialog({ title, type, id, isPublic = false, onVisibilityChange, children }: ShareDialogProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [isPublicState, setIsPublicState] = useState(isPublic)
  const [isUpdating, setIsUpdating] = useState(false)
  const [open, setOpen] = useState(false)

  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://example.com"}/${type}/${id}`
  const shareTitle = `Check out this ${type === "tutor" ? "AI Tutor session" : type} on LearnWise: ${title}`
  const shareText = `I wanted to share this ${
    type === "tutor" ? "AI Tutor session" : type
  } with you from LearnWise. It might help with your studies!`

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast({
      title: "Link copied",
      description: "The share link has been copied to your clipboard",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEmailShare = () => {
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(
      `${shareText}\n\n${shareUrl}`,
    )}`
    window.open(mailtoUrl, "_blank")
  }

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `${shareTitle}\n\n${shareText}\n\n${shareUrl}`,
    )}`
    window.open(twitterUrl, "_blank", "width=550,height=420")
  }

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(facebookUrl, "_blank", "width=550,height=420")
  }

  const handleVisibilityChange = async () => {
    if (!onVisibilityChange) return

    setIsUpdating(true)
    try {
      await onVisibilityChange(!isPublicState)
      setIsPublicState(!isPublicState)
      toast({
        title: `Visibility updated`,
        description: `This ${type} is now ${!isPublicState ? "public" : "private"}`,
      })
    } catch (error) {
      console.error("Error updating visibility:", error)
      toast({
        title: "Error",
        description: `Failed to update visibility. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" /> Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share {type}</DialogTitle>
          <DialogDescription>Share this {type} with others or make it public for anyone to access.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2 py-4">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="visibility" className="text-left">
              Make {type} public
            </Label>
            <div className="flex items-center gap-2">
              <Switch
                id="visibility"
                checked={isPublicState}
                onCheckedChange={handleVisibilityChange}
                disabled={isUpdating || !onVisibilityChange}
              />
              <Label className="font-normal text-sm text-muted-foreground">
                {isPublicState ? `Anyone with the link can view this ${type}` : `Only you can view this ${type}`}
              </Label>
            </div>
          </div>
        </div>

        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
          </TabsList>
          <TabsContent value="link" className="mt-4">
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">
                  Link
                </Label>
                <Input id="link" defaultValue={shareUrl} readOnly className="h-9" />
              </div>
              <Button type="submit" size="sm" className="px-3" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="sr-only">Copy</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {isPublicState
                ? `Anyone with this link can view this ${type}`
                : `Only you can view this ${type} with this link`}
            </p>
          </TabsContent>
          <TabsContent value="email" className="mt-4 flex flex-col items-center">
            <div className="mb-4 text-center">
              <Mail className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Share this {type} via email with your friends or colleagues
              </p>
            </div>
            <Button onClick={handleEmailShare} className="w-full">
              <Mail className="mr-2 h-4 w-4" /> Share via Email
            </Button>
          </TabsContent>
          <TabsContent value="social" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={handleTwitterShare} variant="outline" className="w-full">
                <Twitter className="mr-2 h-4 w-4" /> Twitter
              </Button>
              <Button onClick={handleFacebookShare} variant="outline" className="w-full">
                <Facebook className="mr-2 h-4 w-4" /> Facebook
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="sm:justify-start">
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
