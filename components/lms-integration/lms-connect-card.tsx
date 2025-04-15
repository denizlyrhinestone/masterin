"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ExternalLink, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { connectLMS, getLMSPlatformDetails, type LMSPlatform } from "@/lib/lms-integration"

interface LMSConnectCardProps {
  platform: LMSPlatform
  onConnect?: () => void
  isConnected?: boolean
}

export function LMSConnectCard({ platform, onConnect, isConnected = false }: LMSConnectCardProps) {
  const { toast } = useToast()
  const [instanceUrl, setInstanceUrl] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const platformDetails = getLMSPlatformDetails(platform)

  const handleConnect = async () => {
    if (!instanceUrl) {
      toast({
        title: "Missing information",
        description: "Please provide the instance URL",
        variant: "destructive",
      })
      return
    }

    setIsConnecting(true)
    try {
      const connection = await connectLMS(platform, instanceUrl)

      if (connection) {
        toast({
          title: "Connection successful",
          description: `Successfully connected to ${platformDetails.name}`,
        })
        if (onConnect) onConnect()
      } else {
        throw new Error("Failed to connect")
      }
    } catch (error) {
      console.error("Error connecting to LMS:", error)
      toast({
        title: "Connection failed",
        description: `Failed to connect to ${platformDetails.name}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{platformDetails.name}</CardTitle>
          {isConnected && (
            <div className="flex items-center text-sm text-green-600">
              <Check className="h-4 w-4 mr-1" />
              Connected
            </div>
          )}
        </div>
        <CardDescription>{platformDetails.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex items-center justify-center py-4">
          <div className="relative h-16 w-16">
            <Image
              src={platformDetails.logo || `/placeholder.svg?height=64&width=64&query=${platformDetails.name} logo`}
              alt={`${platformDetails.name} logo`}
              fill
              className="object-contain"
            />
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <Label htmlFor={`${platform}-url`}>Instance URL</Label>
          <Input
            id={`${platform}-url`}
            placeholder={`https://${platform}.example.edu`}
            value={instanceUrl}
            onChange={(e) => setInstanceUrl(e.target.value)}
            disabled={isConnected || isConnecting}
          />
          <p className="text-xs text-muted-foreground">Enter the URL of your {platformDetails.name} instance</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={() => window.open(platformDetails.apiDocUrl, "_blank")}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Documentation
        </Button>

        {!isConnected ? (
          <Button onClick={handleConnect} disabled={isConnecting}>
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect"
            )}
          </Button>
        ) : (
          <Button variant="secondary" disabled>
            <Check className="h-4 w-4 mr-2" />
            Connected
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
