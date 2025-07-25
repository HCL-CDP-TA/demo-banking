"use client"

import { useEffect, useState } from "react"
import Script from "next/script"

export default function ScriptInjector() {
  const [scriptConfig, setScriptConfig] = useState<{
    enabled: boolean
    url: string | null
    initialized: boolean
  }>({
    enabled: true,
    url: null,
    initialized: false,
  })
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

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
        isMounted,
      })

      setScriptConfig({
        enabled: isScriptEnabled,
        url: scriptUrl || null,
        initialized: true,
      })
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
  }, [isMounted])

  // Don't render anything during SSR or before initialization
  if (!isMounted || !scriptConfig.initialized) {
    return null
  }

  // Don't render script if disabled
  if (!scriptConfig.enabled) {
    return null
  }

  // Show warning if no URL configured but only when enabled and initialized
  if (!scriptConfig.url) {
    console.warn(
      "Discover script is enabled but no URL configured.",
      "Environment variable NEXT_PUBLIC_DISCOVER_DEFAULT_SCRIPT:",
      process.env.NEXT_PUBLIC_DISCOVER_DEFAULT_SCRIPT,
      "Override from localStorage:",
      localStorage.getItem("discover_script_override"),
    )
    return null
  }

  return (
    <Script
      src={scriptConfig.url}
      strategy="afterInteractive"
      onError={() => {
        console.error(`Failed to load discover script: ${scriptConfig.url}`)
      }}
    />
  )
}
