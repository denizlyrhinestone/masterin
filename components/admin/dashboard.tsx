"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Users, Bell, Shield, Database } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import UserManagement from "./user-management"
import AdminNotifications from "./admin-notifications"
import SecuritySettings from "./security-settings"
import SystemStatus from "./system-status"

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [adminConfig, setAdminConfig] = useState<{ email: string | null }>({ email: null })
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchAdminConfig = async () => {
      try {
        const response = await fetch("/api/admin/config")

        if (!response.ok) {
          if (response.status === 403) {
            router.push("/access-denied")
            return
          }
          throw new Error("Failed to fetch admin configuration")
        }

        const data = await response.json()
        setAdminConfig(data)
      } catch (error) {
        console.error("Error fetching admin configuration:", error)
        toast({
          title: "Error",
          description: "Failed to load admin configuration",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAdminConfig()
  }, [router, toast])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your application as {adminConfig.email || "administrator"}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>Quick stats and system health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium">Total Users</h3>
                <p className="text-2xl font-bold">--</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium">Active Sessions</h3>
                <p className="text-2xl font-bold">--</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium">System Status</h3>
                <p className="text-2xl font-bold text-green-500">Online</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="users">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">System</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="notifications">
            <AdminNotifications />
          </TabsContent>

          <TabsContent value="security">
            <SecuritySettings />
          </TabsContent>

          <TabsContent value="system">
            <SystemStatus />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
