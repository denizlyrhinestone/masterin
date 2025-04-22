"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Clock, HelpCircle } from "lucide-react"
import { ServiceStatus, ServiceType } from "@/lib/service-health"

interface ServiceStatusIndicatorProps {
  serviceType: ServiceType
  showLabel?: boolean
  className?: string
}

export function ServiceStatusIndicator({
  serviceType,
  showLabel = false,
  className = "",
}: ServiceStatusIndicatorProps) {
  const [status, setStatus] = useState<ServiceStatus>(ServiceStatus.UNKNOWN)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  useEffect(() => {
    // Fetch initial status
    fetchServiceStatus()

    // Set up polling
    const interval = setInterval(fetchServiceStatus, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [serviceType])

  const fetchServiceStatus = async () => {
    try {
      const response = await fetch("/api/health")
      if (!response.ok) {
        throw new Error("Failed to fetch service health")
      }

      const data = await response.json()

      if (data.services && data.services[serviceType]) {
        setStatus(data.services[serviceType].status)
        setLastChecked(new Date(data.services[serviceType].lastChecked))
      }
    } catch (error) {
      console.error("Error fetching service status:", error)
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case ServiceStatus.OPERATIONAL:
        return "bg-green-100 text-green-800 border-green-200"
      case ServiceStatus.DEGRADED:
        return "bg-amber-100 text-amber-800 border-amber-200"
      case ServiceStatus.OUTAGE:
        return "bg-red-100 text-red-800 border-red-200"
      case ServiceStatus.UNKNOWN:
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case ServiceStatus.OPERATIONAL:
        return <CheckCircle className="h-3 w-3 mr-1" />
      case ServiceStatus.DEGRADED:
        return <AlertTriangle className="h-3 w-3 mr-1" />
      case ServiceStatus.OUTAGE:
        return <AlertTriangle className="h-3 w-3 mr-1" />
      case ServiceStatus.UNKNOWN:
      default:
        return <HelpCircle className="h-3 w-3 mr-1" />
    }
  }

  const getStatusLabel = () => {
    switch (status) {
      case ServiceStatus.OPERATIONAL:
        return "Operational"
      case ServiceStatus.DEGRADED:
        return "Degraded"
      case ServiceStatus.OUTAGE:
        return "Outage"
      case ServiceStatus.UNKNOWN:
      default:
        return "Unknown"
    }
  }

  const getServiceLabel = () => {
    switch (serviceType) {
      case ServiceType.OPENAI:
        return "OpenAI"
      case ServiceType.GROQ:
        return "Groq"
      case ServiceType.XAI:
        return "XAI"
      case ServiceType.DATABASE:
        return "Database"
      case ServiceType.STORAGE:
        return "Storage"
      case ServiceType.AUTHENTICATION:
        return "Auth"
      default:
        return serviceType
    }
  }

  return (
    <Badge
      variant="outline"
      className={`${getStatusColor()} ${className} flex items-center text-xs py-0.5 px-2`}
      title={lastChecked ? `Last checked: ${lastChecked.toLocaleTimeString()}` : "Status unknown"}
    >
      {getStatusIcon()}
      {showLabel ? `${getServiceLabel()}: ${getStatusLabel()}` : getStatusLabel()}
      {lastChecked && <Clock className="h-2 w-2 ml-1 opacity-70" />}
    </Badge>
  )
}
