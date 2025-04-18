"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: Array<"student" | "educator" | "admin">
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip during initial load
    if (isLoading) return

    // If no user is logged in, redirect to login
    if (!user) {
      // Store the current path to redirect back after login
      if (typeof window !== "undefined") {
        sessionStorage.setItem("redirectAfterLogin", pathname)
      }
      router.push("/login")
      return
    }

    // If roles are specified, check if user has the required role
    if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
      router.push("/unauthorized")
    }
  }, [user, profile, isLoading, router, pathname, allowedRoles])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If not logged in or doesn't have the required role, don't render children
  if (!user || (allowedRoles && profile && !allowedRoles.includes(profile.role))) {
    return null
  }

  // Otherwise, render the protected content
  return <>{children}</>
}
