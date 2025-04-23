"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Shield, Lock, Key } from "lucide-react"

export default function SecuritySettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState({
    twoFactorRequired: false,
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    loginAttemptsLimit: 5,
    sessionTimeout: 24,
  })
  const { toast } = useToast()

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/security/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error("Failed to save security settings")
      }

      toast({
        title: "Success",
        description: "Security settings have been updated",
      })
    } catch (error) {
      console.error("Error saving security settings:", error)
      toast({
        title: "Error",
        description: "Failed to save security settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Authentication Settings
          </CardTitle>
          <CardDescription>Configure authentication and security policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="two-factor">Require Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">Enforce two-factor authentication for all users</p>
            </div>
            <Switch
              id="two-factor"
              checked={settings.twoFactorRequired}
              onCheckedChange={(checked) => setSettings({ ...settings, twoFactorRequired: checked })}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password-min-length">Minimum Password Length</Label>
              <Input
                id="password-min-length"
                type="number"
                min={6}
                max={32}
                value={settings.passwordMinLength}
                onChange={(e) => setSettings({ ...settings, passwordMinLength: Number.parseInt(e.target.value) || 8 })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="password-special">Require Special Characters</Label>
                <p className="text-sm text-muted-foreground">Passwords must contain at least one special character</p>
              </div>
              <Switch
                id="password-special"
                checked={settings.passwordRequireSpecial}
                onCheckedChange={(checked) => setSettings({ ...settings, passwordRequireSpecial: checked })}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveSettings} disabled={isLoading} className="ml-auto">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Authentication Settings
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Session Security
          </CardTitle>
          <CardDescription>Configure session timeouts and security limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="login-attempts">Failed Login Attempts Limit</Label>
            <Input
              id="login-attempts"
              type="number"
              min={1}
              max={10}
              value={settings.loginAttemptsLimit}
              onChange={(e) => setSettings({ ...settings, loginAttemptsLimit: Number.parseInt(e.target.value) || 5 })}
            />
            <p className="text-sm text-muted-foreground">Number of failed login attempts before account lockout</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
            <Input
              id="session-timeout"
              type="number"
              min={1}
              max={72}
              value={settings.sessionTimeout}
              onChange={(e) => setSettings({ ...settings, sessionTimeout: Number.parseInt(e.target.value) || 24 })}
            />
            <p className="text-sm text-muted-foreground">Time in hours before an inactive session expires</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveSettings} disabled={isLoading} className="ml-auto">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Session Settings
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Security
          </CardTitle>
          <CardDescription>Manage API keys and access controls</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            API security settings will be available in a future update
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
