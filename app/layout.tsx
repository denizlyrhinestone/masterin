import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AppHeader } from "@/components/app-header"
import { MasterinSidebar } from "@/components/masterin-sidebar"
import { ErrorBoundary } from "@/components/error-boundary"
import { AuthProvider } from "@/contexts/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Masterin - Educational Platform",
  description: "AI-powered educational platform for middle and high school students",
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
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <ErrorBoundary>
              <SidebarProvider>
                <div className="flex min-h-screen">
                  <MasterinSidebar />
                  <div className="flex-1 flex flex-col">
                    <AppHeader />
                    <main className="flex-1 overflow-auto">{children}</main>
                  </div>
                </div>
              </SidebarProvider>
            </ErrorBoundary>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
