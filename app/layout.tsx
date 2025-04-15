import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Link from "next/link"
import { GraduationCap } from "lucide-react"
import { AuthProvider } from "@/components/auth-provider"
import { UserNav } from "@/components/user-nav"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LearnWise - AI-Powered Learning Platform",
  description:
    "Master new skills with personalized courses and real-time AI tutoring to accelerate your learning journey",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <a href="#main-content" className="skip-to-content">
            Skip to content
          </a>
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
              <Link href="/" className="flex items-center gap-2" aria-label="LearnWise homepage">
                <GraduationCap className="h-6 w-6 text-blue-600" aria-hidden="true" />
                <span className="text-xl font-bold">LearnWise</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="/"
                  className="text-sm font-medium transition-colors hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md px-2 py-1"
                >
                  Home
                </Link>
                <Link
                  href="/categories"
                  className="text-sm font-medium transition-colors hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md px-2 py-1"
                >
                  Categories
                </Link>
                <Link
                  href="/courses"
                  className="text-sm font-medium transition-colors hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md px-2 py-1"
                >
                  Courses
                </Link>
                <Link
                  href="/ai-tutor"
                  className="text-sm font-medium transition-colors hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md px-2 py-1"
                >
                  AI Tutor
                </Link>
                <Link
                  href="/resources"
                  className="text-sm font-medium transition-colors hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md px-2 py-1"
                >
                  Resources
                </Link>
              </nav>
              <div className="flex items-center gap-4">
                <UserNav />
                <button
                  className="md:hidden focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md p-1"
                  aria-label="Toggle menu"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-menu"
                    aria-hidden="true"
                  >
                    <line x1="4" x2="20" y1="12" y2="12"></line>
                    <line x1="4" x2="20" y1="6" y2="6"></line>
                    <line x1="4" x2="20" y1="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          </header>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}


import './globals.css'