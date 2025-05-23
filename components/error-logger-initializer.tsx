"use client"

import { useEffect } from "react"

export function ErrorLoggerInitializer() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Global error:", event.error)
      // In a real app, send to error tracking service
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason)
      // In a real app, send to error tracking service
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleUnhandledRejection)

    return () => {
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
    }
  }, [])

  return null
}
