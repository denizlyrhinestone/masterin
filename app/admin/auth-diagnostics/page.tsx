"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"
import AuthTroubleshooter from "@/components/auth-troubleshooter"
import { Button } from "@/components/ui/button"

export default function AuthDiagnosticsPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isLoading && !isAuthenticated) {
        router.push("/auth/sign-in?redirect=/admin/auth-diagnostics")
        return
      }

      if (isAuthenticated && user) {
        // In a real app, you would check if the user has admin privileges
        // For this example, we'll use the ADMIN_API_KEY environment variable
        try {
          const response = await fetch("/api/check-admin", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: user.id }),
          })

          if (response.ok) {
            setIsAdmin(true)
          } else {
            router.push("/")
          }
        } catch (error) {
          console.error("Error checking admin status:", error)
          router.push("/")
        } finally {
          setIsCheckingAdmin(false)
        }
      }
    }

    checkAdminStatus()
  }, [isLoading, isAuthenticated, user, router])

  if (isLoading || isCheckingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">You do not have permission to access this page.</p>
        <Button onClick={() => router.push("/")}>Return to Home</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Authentication Diagnostics</h1>
      <AuthTroubleshooter />
    </div>
  )
}
