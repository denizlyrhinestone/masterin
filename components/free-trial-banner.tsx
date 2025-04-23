"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { ArrowRight } from "lucide-react"

interface FreeTrialBannerProps {
  isNewVisitor?: boolean
  checkClientSide?: boolean
}

export default function FreeTrialBanner({ isNewVisitor, checkClientSide = false }: FreeTrialBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [hasVisited, setHasVisited] = useState(false)
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  // Check for visitor cookie client-side if needed
  useEffect(() => {
    if (checkClientSide) {
      const cookies = document.cookie.split(";")
      const visitorCookie = cookies.find((cookie) => cookie.trim().startsWith("visitor_id="))
      setHasVisited(!!visitorCookie)
    } else {
      // Use the prop value if not checking client-side
      setHasVisited(!isNewVisitor)
    }
  }, [checkClientSide, isNewVisitor])

  // Set visitor cookie on first visit
  useEffect(() => {
    if (checkClientSide && !hasVisited) {
      // Set a cookie to track that this user has visited before
      document.cookie = "visitor_id=1; path=/; max-age=2592000" // 30 days
    }
  }, [checkClientSide, hasVisited])

  // Don't show banner for authenticated users
  if (isAuthenticated) {
    return null
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center mb-3 sm:mb-0">
            <span className="font-medium">
              {!hasVisited
                ? "Welcome! Try our AI tools for free - no account required"
                : "You have limited free access to our AI tools"}
            </span>
          </div>
          <div className="flex space-x-4">
            <Button variant="secondary" size="sm" onClick={() => router.push("/auth/sign-up")}>
              Sign Up for Full Access
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => setIsVisible(false)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
