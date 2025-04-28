"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Loader2, CheckCircle, AlertTriangle, HelpCircle } from "lucide-react"

type AIStatus = "loading" | "available" | "unavailable" | "error"

export default function GroqStatusIndicator() {
  const [status, setStatus] = useState<AIStatus>("loading")
  const [message, setMessage] = useState<string>("Checking Groq API status...")
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  useEffect(() => {
    checkGroqStatus()

    // Check status every 5 minutes
    const interval = setInterval(checkGroqStatus, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const checkGroqStatus = async () => {
    try {
      setStatus("loading")

      const response = await fetch("/api/check-groq")
      const data = await response.json()

      if (data.status === "available") {
        setStatus("available")
        setMessage(data.message || "Groq API is available")
      } else if (data.status === "unavailable") {
        setStatus("unavailable")
        setMessage(data.message || "Groq API is unavailable")
      } else {
        setStatus("error")
        setMessage(data.message || "Error checking Groq API")
      }

      setLastChecked(new Date())
    } catch (error) {
      setStatus("error")
      setMessage("Failed to check Groq API status")
      setLastChecked(new Date())
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 className="h-3 w-3 animate-spin" />
      case "available":
        return <CheckCircle className="h-3 w-3" />
      case "unavailable":
        return <AlertTriangle className="h-3 w-3" />
      case "error":
        return <HelpCircle className="h-3 w-3" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "loading":
        return "bg-blue-500"
      case "available":
        return "bg-green-500"
      case "unavailable":
        return "bg-yellow-500"
      case "error":
        return "bg-red-500"
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`${getStatusColor()} flex items-center gap-1 cursor-help`}>
            {getStatusIcon()}
            <span>Groq</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-medium">{message}</p>
            {lastChecked && <p className="text-xs text-gray-500">Last checked: {lastChecked.toLocaleTimeString()}</p>}
            <p className="text-xs mt-1">
              <a href="/groq-test" className="text-blue-500 hover:underline">
                Run full test →
              </a>
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
