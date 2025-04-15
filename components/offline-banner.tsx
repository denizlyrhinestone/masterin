"use client"

import { useState, useEffect } from "react"
import { Wifi, WifiOff } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { setupOfflineListeners, syncWithServer } from "@/lib/offline-storage"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    // Initial check
    setIsOffline(!navigator.onLine)

    // Set up listeners
    const cleanup = setupOfflineListeners(setIsOffline)

    return cleanup
  }, [])

  const handleSync = async () => {
    if (!user) return

    setIsSyncing(true)
    try {
      const result = await syncWithServer(user.id)

      if (result.success) {
        toast({
          title: "Sync complete",
          description: "Your data has been successfully synchronized",
        })
      } else {
        toast({
          title: "Sync incomplete",
          description: "Some items failed to sync. Please try again later.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Sync error:", error)
      toast({
        title: "Sync failed",
        description: "Failed to synchronize your data. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  if (!isOffline && !isSyncing) return null

  return (
    <Alert variant={isOffline ? "destructive" : "default"} className="mb-4">
      <div className="flex items-center">
        {isOffline ? <WifiOff className="h-4 w-4 mr-2" /> : <Wifi className="h-4 w-4 mr-2" />}
        <AlertTitle>{isOffline ? "You're offline" : "Back online"}</AlertTitle>
      </div>
      <AlertDescription className="flex items-center justify-between mt-2">
        <span>
          {isOffline
            ? "You can continue working. Changes will be saved locally and synced when you're back online."
            : "You're back online. Sync your changes to save them to the cloud."}
        </span>
        {!isOffline && (
          <Button size="sm" onClick={handleSync} disabled={isSyncing}>
            {isSyncing ? "Syncing..." : "Sync Now"}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
