"use client"

import { CdpClientWrapper } from "@hcl-cdp-ta/hclcdp-web-sdk-react"
import { useSiteContext } from "@/lib/SiteContext"

export default function CdpProvider({ children }: { children: React.ReactNode }) {
  const { brand } = useSiteContext()

  // Get writekey from cookie or fallback to env
  let writeKey = process.env.NEXT_PUBLIC_CDP_WRITEKEY || ""
  if (brand?.key && typeof document !== "undefined") {
    const cookieName = `${brand.key}_cdp_writekey_override`
    const cookieValue = document.cookie
      .split("; ")
      .find(row => row.startsWith(`${cookieName}=`))
      ?.split("=")[1]

    if (cookieValue && cookieValue.trim() !== "") {
      writeKey = decodeURIComponent(cookieValue.trim())
    }
  }

  const cdpConfig = {
    writeKey,
    inactivityTimeout: 10,
    enableSessionLogging: true,
    enableUserLogoutLogging: true,
    cdpEndpoint: process.env.NEXT_PUBLIC_CDP_ENDPOINT || "",
    destinations: [
      // {
      //   id: "GA4",
      //   classRef: GoogleAnalytics,
      //   config: { measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "" },
      // },
    ],
  }

  return <CdpClientWrapper config={cdpConfig}>{children}</CdpClientWrapper>
}
