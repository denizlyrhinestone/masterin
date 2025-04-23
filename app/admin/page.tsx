"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import AdminDashboard from "@/components/admin/dashboard"

export default function AdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isLoading && !isAuthenticated) {
        router.push("/auth/sign-in?redirect=/admin")
        return
      }

      if (isAuthenticated && user) {
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
            router.push("/access-denied")
          }
        } catch (error) {
          console.error("Error checking admin status:", error)
          router.push("/error")
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
    return null // Will redirect in the useEffect
  }

  return <AdminDashboard />
}
