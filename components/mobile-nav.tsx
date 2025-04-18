"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Book, BookOpen, Brain, Home, User } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

export function MobileNav() {
  const pathname = usePathname()
  const isMobile = useIsMobile()

  if (!isMobile) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background px-2 md:hidden">
      <Link
        href="/dashboard"
        className={`flex flex-col items-center justify-center px-3 py-2 ${
          pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <Home className="h-5 w-5" />
        <span className="text-xs mt-1">Home</span>
      </Link>

      <Link
        href="/categories"
        className={`flex flex-col items-center justify-center px-3 py-2 ${
          pathname === "/categories" || pathname.startsWith("/categories/") ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <Book className="h-5 w-5" />
        <span className="text-xs mt-1">Explore</span>
      </Link>

      <Link
        href="/my-courses"
        className={`flex flex-col items-center justify-center px-3 py-2 ${
          pathname === "/my-courses" || pathname.startsWith("/courses/") ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <BookOpen className="h-5 w-5" />
        <span className="text-xs mt-1">Courses</span>
      </Link>

      <Link
        href="/ai-tutor"
        className={`flex flex-col items-center justify-center px-3 py-2 ${
          pathname === "/ai-tutor" ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <Brain className="h-5 w-5" />
        <span className="text-xs mt-1">AI Tutor</span>
      </Link>

      <Link
        href="/profile"
        className={`flex flex-col items-center justify-center px-3 py-2 ${
          pathname === "/profile" || pathname === "/settings" ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <User className="h-5 w-5" />
        <span className="text-xs mt-1">Profile</span>
      </Link>
    </div>
  )
}
