"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { getLMSConnections, type LMSConnection, type LMSPlatform } from "@/lib/lms-integration"
import { LMSConnectCard } from "@/components/lms-integration/lms-connect-card"
import { LMSConnectionCard } from "@/components/lms-integration/lms-connection-card"

export default function LMSIntegrationPage() {
  const router = useRouter()
  const { user, status } = useAuth()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("connections")
  const [connections, setConnections] = useState<LMSConnection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const platforms: LMSPlatform[] = ["canvas", "moodle", "blackboard", "google-classroom", "schoology"]

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    router.push("/auth?redirect=/settings/lms-integration")
    return null
  }

  // Fetch LMS connections
  const fetchConnections = async () => {
    setIsLoading(true)
    try {
      const data = await getLMSConnections()
      setConnections(data)
    } catch (error) {
      console.error("Error fetching LMS connections:", error)
      toast({
        title: "Error",
        description: "Failed to load your LMS connections",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh connections
  const refreshConnections = async () => {
    setIsRefreshing(true)
    try {
      await fetchConnections()
      toast({
        title: "Refreshed",
        description: "Your LMS connections have been refreshed",
      })
    } catch (error) {
      console.error("Error refreshing LMS connections:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    let mounted = true

    if (status === "authenticated") {
      fetchConnections()
    }

    return () => {
      mounted = false
    }
  }, [status])

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">LMS Integration</h1>
          <p className="text-muted-foreground">Connect and manage your Learning Management Systems</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/settings")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Settings
          </Button>
          <Button variant="outline" onClick={refreshConnections} disabled={isRefreshing}>
            {isRefreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="connections">My Connections</TabsTrigger>
          <TabsTrigger value="add">Add Connection</TabsTrigger>
        </TabsList>

        <TabsContent value="connections">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : connections.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <h3 className="text-lg font-medium mb-2">No LMS Connections</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  You haven't connected any Learning Management Systems yet. Add a connection to share your content with
                  your LMS.
                </p>
                <Button onClick={() => setActiveTab("add")}>Add Connection</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {connections.map((connection) => (
                <LMSConnectionCard key={connection.id} connection={connection} onUpdate={fetchConnections} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="add">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add LMS Connection</CardTitle>
              <CardDescription>Connect your Learning Management System to share content and sync data</CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platforms.map((platform) => {
              const isConnected = connections.some((conn) => conn.platform === platform && conn.isConnected)

              return (
                <LMSConnectCard
                  key={platform}
                  platform={platform}
                  onConnect={fetchConnections}
                  isConnected={isConnected}
                />
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
