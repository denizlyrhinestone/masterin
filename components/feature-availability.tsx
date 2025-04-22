"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Clock } from "lucide-react"
import { FeatureType } from "@/lib/feature-flags"

interface FeatureAvailabilityProps {
  featureType: FeatureType
  showLabel?: boolean
  className?: string
}

export function FeatureAvailability({ featureType, showLabel = false, className = "" }: FeatureAvailabilityProps) {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [hasFallback, setHasFallback] = useState<boolean>(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  useEffect(() => {
    // Fetch initial status
    fetchFeatureStatus()

    // Set up polling
    const interval = setInterval(fetchFeatureStatus, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [featureType])

  const fetchFeatureStatus = async () => {
    try {
      const response = await fetch("/api/health")
      if (!response.ok) {
        throw new Error("Failed to fetch feature status")
      }

      const data = await response.json()

      if (data.features && data.features[featureType]) {
        setIsAvailable(data.features[featureType].enabled)
        setHasFallback(data.features[featureType].fallbackAvailable)
        setLastChecked(new Date())
      }
    } catch (error) {
      console.error("Error fetching feature status:", error)
    }
  }

  const getStatusColor = () => {
    if (isAvailable === null) {
      return "bg-gray-100 text-gray-800 border-gray-200"
    }

    if (isAvailable) {
      return "bg-green-100 text-green-800 border-green-200"
    }

    return hasFallback ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-red-100 text-red-800 border-red-200"
  }

  const getStatusIcon = () => {
    if (isAvailable === null) {
      return <Clock className="h-3 w-3 mr-1" />
    }

    if (isAvailable) {
      return <CheckCircle className="h-3 w-3 mr-1" />
    }

    return <AlertCircle className="h-3 w-3 mr-1" />
  }

  const getStatusLabel = () => {
    if (isAvailable === null) {
      return "Checking..."
    }

    if (isAvailable) {
      return "Available"
    }

    return hasFallback ? "Limited" : "Unavailable"
  }

  const getFeatureLabel = () => {
    switch (featureType) {
      case FeatureType.AI_TUTOR:
        return "AI Tutor"
      case FeatureType.AI_STUDY_ASSISTANT:
        return "Study Assistant"
      case FeatureType.AI_WRITING_HELPER:
        return "Writing Helper"
      case FeatureType.AI_PROBLEM_SOLVER:
        return "Problem Solver"
      case FeatureType.COURSE_RECOMMENDATIONS:
        return "Recommendations"
      case FeatureType.PERSONALIZED_LEARNING:
        return "Personalized Learning"
      case FeatureType.COMMUNITY_FEATURES:
        return "Community"
      case FeatureType.PROGRESS_TRACKING:
        return "Progress Tracking"
      default:
        return featureType
    }
  }

  return (
    <Badge
      variant="outline"
      className={`${getStatusColor()} ${className} flex items-center text-xs py-0.5 px-2`}
      title={lastChecked ? `Last checked: ${lastChecked.toLocaleTimeString()}` : "Status unknown"}
    >
      {getStatusIcon()}
      {showLabel ? `${getFeatureLabel()}: ${getStatusLabel()}` : getStatusLabel()}
    </Badge>
  )
}
