"use client"

import { useEffect } from "react"
import { initErrorListeners } from "@/lib/client-error-logger"

export function ErrorLoggerInitializer() {
  useEffect(() => {
    initErrorListeners()
  }, [])

  return null // This component doesn't render anything
}
