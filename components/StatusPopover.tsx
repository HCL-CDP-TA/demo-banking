"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useCDPTracking } from "@/lib/hooks/useCDPTracking"
import { useSiteContext } from "@/lib/SiteContext"
import { ChevronDown, Info, User, Copy } from "lucide-react"

// Import version from package.json
import packageJson from "../package.json"

export default function StatusPopover() {
  const [isMinimized, setIsMinimized] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [discoverEnabled, setDiscoverEnabled] = useState(true)
  const [currentUser, setCurrentUser] = useState<{
    firstName?: string
    lastName?: string
    email?: string
  } | null>(null)
  const { isCDPTrackingEnabled, setCDPTrackingEnabled } = useCDPTracking()
  const { brand } = useSiteContext()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const updateDiscoverStatus = () => {
      const isDiscoverEnabled = localStorage.getItem("discover_script_enabled") !== "false"
      setDiscoverEnabled(isDiscoverEnabled)
    }

    const updateUserData = () => {
      const customerData = JSON.parse(localStorage.getItem(`${brand.key}_customer_data`) || "{}")
      if (customerData?.loginData) {
        setCurrentUser({
          firstName: customerData.loginData.firstName,
          lastName: customerData.loginData.lastName,
          email: customerData.loginData.email,
        })
      } else {
        setCurrentUser(null)
      }
    }

    // Initial load
    updateDiscoverStatus()
    updateUserData()

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "discover_script_enabled") {
        updateDiscoverStatus()
      }
      if (e.key === `${brand.key}_customer_data`) {
        updateUserData()
      }
    }

    // Listen for custom events when settings are changed from within the same tab
    const handleSettingsChange = () => {
      updateDiscoverStatus()
    }

    // Listen for login/logout events
    const handleLoginChange = () => {
      updateUserData()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("discover-script-settings-changed", handleSettingsChange)
    window.addEventListener("user-login-changed", handleLoginChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("discover-script-settings-changed", handleSettingsChange)
      window.removeEventListener("user-login-changed", handleLoginChange)
    }
  }, [isMounted, brand.key])

  // Handle CDP tracking toggle
  const handleCDPToggle = (checked: boolean) => {
    setCDPTrackingEnabled(checked)
  }

  // Handle Discover script toggle
  const handleDiscoverToggle = (checked: boolean) => {
    localStorage.setItem("discover_script_enabled", checked.toString())
    setDiscoverEnabled(checked)
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("discover-script-settings-changed"))
  }

  // Handle copying email to clipboard
  const handleCopyEmail = async () => {
    if (currentUser?.email) {
      try {
        await navigator.clipboard.writeText(currentUser.email)
        // You could add a toast notification here if you have one
        console.log("Email copied to clipboard:", currentUser.email)
      } catch (err) {
        console.error("Failed to copy email:", err)
        // Fallback for older browsers
        const textArea = document.createElement("textarea")
        textArea.value = currentUser.email
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
      }
    }
  }

  // Don't render during SSR
  if (!isMounted) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isMinimized ? (
        // Minimized state - just an icon
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMinimized(false)}
          className="h-12 w-12 rounded-full bg-white shadow-lg hover:shadow-xl border-2 cursor-pointer"
          title="Show status information">
          <Info className="h-5 w-5" />
        </Button>
      ) : (
        // Expanded state - full popover
        <Card className="w-80 shadow-xl border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(true)}
                className="h-6 w-6 rounded-full cursor-pointer"
                title="Minimize">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {/* Version */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Version</span>
              <Badge variant="outline" className="font-mono text-xs">
                v{packageJson.version}
              </Badge>
            </div>

            {/* Current User */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">User</span>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Not logged in"}
                  </span>
                </div>
              </div>
              {currentUser?.email && (
                <div className="flex items-center justify-between pl-4">
                  <span className="text-xs text-muted-foreground truncate max-w-[180px]" title={currentUser.email}>
                    {currentUser.email}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyEmail}
                    className="h-6 w-6 ml-2 flex-shrink-0"
                    title="Copy email to clipboard">
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* CDP Tracking Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">CDP Tracking</span>
              <Switch checked={isCDPTrackingEnabled} onCheckedChange={handleCDPToggle} className="cursor-pointer" />
            </div>

            {/* Discover Script Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Discover Script</span>
              <Switch checked={discoverEnabled} onCheckedChange={handleDiscoverToggle} className="cursor-pointer" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
