import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { GlobalErrorBoundary } from "@/components/global-error-boundary"
import { AnalyticsInitializer } from "@/components/analytics-initializer"
import type { Metadata } from "next"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Masterin - AI-Powered Education",
  description: "Advanced AI solutions for modern education",
  icons: {
    icon: [{ url: "/favicon.png" }],
    apple: [{ url: "/icon-192.png" }, { url: "/icon-512.png", sizes: "512x512" }],
  },
  manifest: "/manifest.json",
  // Add security-related metadata
  other: {
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://www.google-analytics.com;",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <GlobalErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <AuthProvider>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <Suspense>
                  <main className="flex-grow">{children}</main>
                </Suspense>
                <Footer />
              </div>
              {/* Analytics initializer - client-side only */}
              <AnalyticsInitializer />
            </AuthProvider>
          </ThemeProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  )
}
