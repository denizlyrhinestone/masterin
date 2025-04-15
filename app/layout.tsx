import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Navigation } from "@/components/navigation"
import { Toaster } from "@/components/toaster"
import { StackAuthProvider } from "@/components/stack-auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Educational Platform",
  description: "Learn with AI-powered education",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <StackAuthProvider>
            <Navigation />
            {children}
            <footer className="bg-gray-100 py-8 mt-12">
              <div className="container mx-auto px-4">
                <div className="text-center text-gray-500 text-sm">
                  © {new Date().getFullYear()} Educational Platform. All rights reserved.
                </div>
              </div>
            </footer>
            <Toaster />
          </StackAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'