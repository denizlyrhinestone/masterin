"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, Trash2, Share2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { disconnectLMS, getLMSPlatformDetails, syncFromLMS, type LMSConnection } from "@/lib/lms-integration"
import { LMSShareDialog } from "./lms-share-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface LMSConnectionCardProps {
  connection: LMSConnection
  onUpdate?: () => void
}

export function LMSConnectionCard({ connection, onUpdate }: LMSConnectionCardProps) {
  const { toast } = useToast()
  const [isSyncing, setIsSyncing] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  const platformDetails = getLMSPlatformDetails(connection.platform)
  const lastSyncedDate = connection.lastSynced ? new Date(connection.lastSynced) : null

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const result = await syncFromLMS(connection.id)

      if (result.success) {
        toast({
          title: "Sync successful",
          description: result.message,
        })
        if (onUpdate) onUpdate()
      } else {
        throw new Error(result.message)
      }
    } catch (error: any) {
      console.error("Error syncing from LMS:", error)
      toast({
        title: "Sync failed",
        description: error.message || "Failed to sync from LMS. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    try {
      const success = await disconnectLMS(connection.id)

      if (success) {
        toast({
          title: "Disconnection successful",
          description: `Successfully disconnected from ${platformDetails.name}`,
        })
        if (onUpdate) onUpdate()
      } else {
        throw new Error("Failed to disconnect")
      }
    } catch (error) {
      console.error("Error disconnecting from LMS:", error)
      toast({
        title: "Disconnection failed",
        description: `Failed to disconnect from ${platformDetails.name}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsDisconnecting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative h-8 w-8">
                <Image
                  src={platformDetails.logo || `/placeholder.svg?height=32&width=32&query=${platformDetails.name} logo`}
                  alt={`${platformDetails.name} logo`}
                  fill
                  className="object-contain"
                />
              </div>
              <CardTitle className="text-lg">{platformDetails.name}</CardTitle>
            </div>
            <Badge variant={connection.isConnected ? "success" : "destructive"}>
              {connection.isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
          <CardDescription>{connection.instanceUrl}</CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Connected since:</span>{" "}
              {new Date(connection.createdAt).toLocaleDateString()}
            </div>
            <div className="text-sm">
              <span className="font-medium">Last synced:</span>{" "}
              {lastSyncedDate ? lastSyncedDate.toLocaleString() : "Never"}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSync} disabled={isSyncing || !connection.isConnected}>
              {isSyncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Sync
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareDialogOpen(true)}
              disabled={!connection.isConnected}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isDisconnecting}>
                {isDisconnecting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Disconnect
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Disconnect from {platformDetails.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will disconnect your account from {platformDetails.name}. You can reconnect at any time.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDisconnect}>Disconnect</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>

      <LMSShareDialog open={shareDialogOpen} onOpenChange={setShareDialogOpen} connection={connection} />
    </>
  )
}
