"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Loader2, RefreshCw, Database, Server, AlertTriangle } from "lucide-react"

interface SystemStatus {
  database: {
    status: "online" | "degraded" | "offline"
    responseTime: number
  }
  auth: {
    status: "online" | "degraded" | "offline"
    activeUsers: number
  }
  storage: {
    status: "online" | "degraded" | "offline"
    usedSpace: number
    totalSpace: number
  }
  adminConfig: {
    isConfigured: boolean
    email: string | null
    message?: string
  }
}

export default function SystemStatus() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchSystemStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/system/status")

      if (!response.ok) {
        throw new Error("Failed to fetch system status")
      }

      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error("Error fetching system status:", error)
      toast({
        title: "Error",
        description: "Failed to load system status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSystemStatus()
  }, [toast])

  const getStatusBadge = (status: "online" | "degraded" | "offline") => {
    switch (status) {
      case "online":
        return <Badge className="bg-green-500">Online</Badge>
      case "degraded":
        return <Badge className="bg-yellow-500">Degraded</Badge>
      case "offline":
        return <Badge className="bg-red-500">Offline</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  // If we don't have status data yet, show a placeholder
  if (!status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Unable to retrieve system status information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <AlertTriangle className="h-12 w-12 text-yellow-500" />
            <p className="text-muted-foreground">System status information is currently unavailable</p>
            <Button onClick={fetchSystemStatus}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Configuration</CardTitle>
          <CardDescription>Status of the admin configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="font-medium">Configuration Status</h3>
                <p className="text-sm text-muted-foreground">ADMIN_EMAIL environment variable</p>
              </div>
              {status.adminConfig.isConfigured ? (
                <Badge className="bg-green-500">Configured</Badge>
              ) : (
                <Badge className="bg-red-500">Not Configured</Badge>
              )}
            </div>

            {status.adminConfig.isConfigured ? (
              <div className="p-4 bg-muted rounded-md">
                <p className="font-medium">Admin Email</p>
                <p className="text-sm">{status.adminConfig.email}</p>
              </div>
            ) : (
              <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-md">
                <p className="font-medium text-red-800 dark:text-red-300">Configuration Error</p>
                <p className="text-sm text-red-700 dark:text-red-400">
                  {status.adminConfig.message || "ADMIN_EMAIL environment variable is not properly configured"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Status
          </CardTitle>
          <CardDescription>Current status of the database connection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="font-medium">Connection Status</h3>
                <p className="text-sm text-muted-foreground">Database connection health</p>
              </div>
              {getStatusBadge(status.database.status)}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Response Time</h3>
                <span>{status.database.responseTime}ms</span>
              </div>
              <Progress value={Math.min(100, (status.database.responseTime / 500) * 100)} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Authentication Service
          </CardTitle>
          <CardDescription>Status of the authentication service</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="font-medium">Service Status</h3>
                <p className="text-sm text-muted-foreground">Authentication service health</p>
              </div>
              {getStatusBadge(status.auth.status)}
            </div>

            <div className="p-4 bg-muted rounded-md">
              <p className="font-medium">Active Users</p>
              <p className="text-2xl font-bold">{status.auth.activeUsers}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Storage Status</CardTitle>
          <CardDescription>Current status of the storage service</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="font-medium">Service Status</h3>
                <p className="text-sm text-muted-foreground">Storage service health</p>
              </div>
              {getStatusBadge(status.storage.status)}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Storage Usage</h3>
                <span>
                  {Math.round(status.storage.usedSpace / 1024 / 1024)} MB /
                  {Math.round(status.storage.totalSpace / 1024 / 1024)} MB
                </span>
              </div>
              <Progress value={(status.storage.usedSpace / status.storage.totalSpace) * 100} className="h-2" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" onClick={fetchSystemStatus} className="ml-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
