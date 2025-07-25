"use client"

import { useEffect, useState } from "react"
import Script from "next/script"

export default function ScriptInjector() {
  const [scriptConfig, setScriptConfig] = useState<{
    enabled: boolean
    url: string | null
  }>({
    enabled: true,
    url: null,
  })
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    console.log("Config", process.env.NEXT_PUBLIC_DISCOVER_DEFAULT_SCRIPT)
    const updateScriptConfig = () => {
      // Check if script injection is enabled (default: true)
      const isScriptEnabled = localStorage.getItem("discover_script_enabled") !== "false"

      // Get script URL from override or environment variable
      const overrideScript = localStorage.getItem("discover_script_override")
      const defaultScript = process.env.NEXT_PUBLIC_DISCOVER_DEFAULT_SCRIPT
      const scriptUrl = overrideScript || defaultScript

      console.log("Script Config Debug:", {
        isScriptEnabled,
        overrideScript,
        defaultScript,
        scriptUrl,
      })

      setScriptConfig({
        enabled: isScriptEnabled,
        url: scriptUrl || null,
      })

      setIsInitialized(true)
    }

    // Initial load
    updateScriptConfig()

    // Listen for storage changes to reload script when settings change
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "discover_script_enabled" || e.key === "discover_script_override") {
        updateScriptConfig()
      }
    }

    // Listen for custom events when settings are changed from within the same tab
    const handleSettingsChange = () => {
      updateScriptConfig()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("discover-script-settings-changed", handleSettingsChange)

    // Cleanup function
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("discover-script-settings-changed", handleSettingsChange)
    }
  }, [])

  // Don't render script if disabled or no URL
  if (!scriptConfig.enabled || !scriptConfig.url) {
    // Only show warning after component has been initialized to avoid false warnings
    if (isInitialized && !scriptConfig.url) {
      console.warn(
        "No discover script URL configured. Set NEXT_PUBLIC_DISCOVER_DEFAULT_SCRIPT or use override in settings.",
      )
    }
    return null
  }

  return (
    <Script
      src={scriptConfig.url}
      strategy="afterInteractive"
      onLoad={() => {
        console.log(`Discover script loaded successfully: ${scriptConfig.url}`)
      }}
      onError={() => {
        console.error(`Failed to load discover script: ${scriptConfig.url}`)
      }}
    />
  )
}
