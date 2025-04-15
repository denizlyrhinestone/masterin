"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"

interface ReminderButtonProps {
  userId: string
  courseId: string
  courseTitle: string
}

export function ReminderButton({ userId, courseId, courseTitle }: ReminderButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const scheduleReminder = async (delayHours: number) => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/reminders/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "course",
          userId,
          courseId,
          courseTitle,
          delayHours,
        }),
      })

      if (response.ok) {
        toast({
          title: "Reminder scheduled",
          description: `We'll remind you to continue this course in ${delayHours} hour${delayHours === 1 ? "" : "s"}.`,
        })
      } else {
        throw new Error("Failed to schedule reminder")
      }
    } catch (error) {
      console.error("Error scheduling reminder:", error)
      toast({
        title: "Error",
        description: "Failed to schedule reminder. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isLoading} className="w-full">
          <Bell className="h-4 w-4 mr-2" />
          {isLoading ? "Scheduling..." : "Remind Me"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => scheduleReminder(1)}>In 1 hour</DropdownMenuItem>
        <DropdownMenuItem onClick={() => scheduleReminder(8)}>In 8 hours</DropdownMenuItem>
        <DropdownMenuItem onClick={() => scheduleReminder(24)}>Tomorrow</DropdownMenuItem>
        <DropdownMenuItem onClick={() => scheduleReminder(72)}>In 3 days</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
