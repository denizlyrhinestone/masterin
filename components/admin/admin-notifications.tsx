"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function AdminNotifications() {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [notificationType, setNotificationType] = useState("email")
  const [recipients, setRecipients] = useState("all")
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

  const handleSendNotification = async () => {
    if (!subject || !message) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    try {
      const response = await fetch("/api/admin/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          message,
          type: notificationType,
          recipients,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send notification")
      }

      toast({
        title: "Success",
        description: "Notification has been sent successfully",
      })

      // Reset form
      setSubject("")
      setMessage("")
    } catch (error) {
      console.error("Error sending notification:", error)
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Send Notification</CardTitle>
          <CardDescription>Send notifications to users via email or in-app messages</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="notification-type">Notification Type</Label>
              <Select value={notificationType} onValueChange={setNotificationType}>
                <SelectTrigger id="notification-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="in-app">In-App Notification</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipients">Recipients</Label>
              <Select value={recipients} onValueChange={setRecipients}>
                <SelectTrigger id="recipients">
                  <SelectValue placeholder="Select recipients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active Users</SelectItem>
                  <SelectItem value="inactive">Inactive Users</SelectItem>
                  <SelectItem value="premium">Premium Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Notification subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your notification message here"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSendNotification} disabled={isSending} className="ml-auto">
            {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSending ? "Sending..." : "Send Notification"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification History</CardTitle>
          <CardDescription>View previously sent notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">No notification history available</div>
        </CardContent>
      </Card>
    </div>
  )
}
