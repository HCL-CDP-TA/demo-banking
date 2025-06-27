import { useSiteContext } from "@/lib/SiteContext"
import { useState, useEffect } from "react"

/**
 * Custom hook to manage CDP tracking state for the current brand.
 * @returns An object with the current CDP tracking state and a function to update it.
 */
export function useCDPTracking() {
  const { brand } = useSiteContext()
  const key = `${brand.key}_cdpTrackingEnabled`

  const [isCDPTrackingEnabled, setIsEnabled] = useState<boolean>(true)

  useEffect(() => {
    // Load CDP tracking state from local storage when the hook is initialized
    const value = localStorage.getItem(key)
    setIsEnabled(value ? JSON.parse(value) : true)
  }, [key])

  const setCDPTrackingEnabled = (enabled: boolean) => {
    setIsEnabled(enabled)
    localStorage.setItem(key, JSON.stringify(enabled))
  }

  return { isCDPTrackingEnabled, setCDPTrackingEnabled }
}
