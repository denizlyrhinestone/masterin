/**
 * Analytics utility for Masterin
 *
 * This module provides functions for tracking page views and events
 * conditionally based on the NEXT_PUBLIC_ENABLE_ANALYTICS environment variable.
 */

// Check if analytics are enabled via environment variable
export const isAnalyticsEnabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true"

// Replace with your actual Google Analytics Measurement ID
const GA_MEASUREMENT_ID = "G-XXXXXXXXXX"

/**
 * Safe wrapper for console logging in analytics
 * Only logs in development or when debug mode is enabled
 */
const logAnalytics = (message: string, data?: any) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] ${message}`, data || "")
  }
}

/**
 * Initialize Google Analytics
 * This function is called client-side to load and initialize GA
 */
export function initializeAnalytics(): boolean {
  try {
    // Don't run during SSR or if analytics are disabled
    if (typeof window === "undefined" || !isAnalyticsEnabled) {
      return false
    }

    // Check if GA is already initialized
    if (window.gtag) {
      return true
    }

    logAnalytics("Initializing analytics")

    // Load Google Analytics script
    const script = document.createElement("script")
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
    script.async = true
    document.head.appendChild(script)

    // Initialize gtag
    window.dataLayer = window.dataLayer || []
    window.gtag = function gtag() {
      window.dataLayer.push(arguments)
    }
    window.gtag("js", new Date())
    window.gtag("config", GA_MEASUREMENT_ID, {
      send_page_view: false, // We'll track page views manually
    })

    logAnalytics("Analytics initialized successfully")
    return true
  } catch (error) {
    console.error("[Analytics] Failed to initialize:", error)
    return false
  }
}

/**
 * Track a page view
 * @param path The path to track (without query parameters)
 */
export function trackPageView(path: string): boolean {
  try {
    // Don't run during SSR or if analytics are disabled
    if (typeof window === "undefined" || !isAnalyticsEnabled || !window.gtag) {
      return false
    }

    logAnalytics(`Tracking page view: ${path}`)

    window.gtag("event", "page_view", {
      page_path: path,
    })
    return true
  } catch (error) {
    console.error("[Analytics] Failed to track page view:", error)
    return false
  }
}

/**
 * Track a custom event
 * @param eventName The name of the event to track
 * @param eventParams Additional parameters for the event
 */
export function trackEvent(eventName: string, eventParams?: Record<string, any>): boolean {
  try {
    // Don't run during SSR or if analytics are disabled
    if (typeof window === "undefined" || !isAnalyticsEnabled || !window.gtag) {
      return false
    }

    logAnalytics(`Tracking event: ${eventName}`, eventParams)

    window.gtag("event", eventName, eventParams)
    return true
  } catch (error) {
    console.error(`[Analytics] Failed to track event ${eventName}:`, error)
    return false
  }
}

/**
 * Check the current analytics status
 * @returns Object with status information
 */
export function checkAnalyticsStatus() {
  return {
    enabled: isAnalyticsEnabled,
    measurementId: isAnalyticsEnabled ? GA_MEASUREMENT_ID : null,
    initialized: typeof window !== "undefined" && !!window.gtag,
    environmentValue: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS || "not set",
  }
}

/**
 * Get the current analytics status (alias for checkAnalyticsStatus)
 * @returns Object with status information
 */
export const getAnalyticsStatus = checkAnalyticsStatus
