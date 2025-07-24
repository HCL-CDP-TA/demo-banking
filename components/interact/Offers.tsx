import { postEventAndGetOffers, setConfig } from "@/lib/InteractSpot"
import { useEffect, useState, useMemo, useRef } from "react"
import Offer, { type OfferDisplayData } from "./Offer"
import { useSiteContext } from "@/lib/SiteContext"
import { useTranslations } from "next-intl"

// Custom audience config interface with string types for this component
interface CustomAudienceConfig {
  audId: string
  audLevel: string
}

// Props interface for the Offers component
interface OffersProps {
  interactionPoint: string // e.g., "home-loans", "car-loans"
  pageNamespace: string // e.g., "home-loans", "car-loans" for translations
  refreshTrigger?: number // Optional prop to trigger offer refresh
  className?: string // Optional styling
}

// Simple cookie utility
const Cookie = {
  get: (name: string): string | null => {
    if (typeof document === "undefined") return null
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null
    return null
  },
}

// Function to create default offer from language file
const createDefaultOffers = (t: (key: string) => string): OfferDisplayData[] => [
  {
    n: "Default Offer",
    code: "DEFAULT_OFFER",
    treatmentCode: "DEFAULT_OFFER",
    score: 100,
    desc: t("defaultOffer.description"),
    attributes: [
      { n: "offer_title", v: t("defaultOffer.title") },
      { n: "offer_copy", v: t("defaultOffer.copy") },
      { n: "offer_image", v: t("defaultOffer.image") },
      { n: "offer_cta", v: t("defaultOffer.cta") },
      { n: "offer_link", v: t("defaultOffer.link") },
    ],
  },
]

// Function to get the current logged-in user ID
const getCurrentUser = (brandKey: string): string => {
  if (typeof window === "undefined") return ""

  try {
    const customerData = JSON.parse(localStorage.getItem(`${brandKey}_customer_data`) || "{}")
    return customerData?.loginData?.id || ""
  } catch (error) {
    console.error("Error getting current user:", error)
    return ""
  }
}

const Offers = ({ interactionPoint, pageNamespace, refreshTrigger, className }: OffersProps) => {
  const { brand } = useSiteContext()
  const t = useTranslations(pageNamespace)
  const [offer, setOffer] = useState<OfferDisplayData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const hasInitiallyLoaded = useRef(false)

  // Create default offers from language file - memoized to prevent recreating on every render
  const defaultOffers = useMemo(() => createDefaultOffers(t), [t])

  useEffect(() => {
    const fetchOffers = async (): Promise<void> => {
      // Only show loading spinner on initial load, use refresh indicator for subsequent loads
      if (!hasInitiallyLoaded.current) {
        setIsLoading(true)
      } else {
        setIsRefreshing(true)
      }

      const confObj = {
        serverUrl: process.env.NEXT_PUBLIC_INTERACT_ENDPOINT || "",
        icName: "", // interactive channel name
        audId: "", // audience id.  3 is what we will use as default to represent an unknown/anonymous user
        audLevel: "", // audience level. This is default value/
        contactEvent: "contact",
        acceptEvent: "accept",
        sessVars: "UACIWaitForSegmentation,true,string",
        debug: true,
        prevAudIdVar: "",
        customerAudLvl: "Individual", // Audience name for customer audience level
        customerAud: "indiv_id", // Audience key for customer audience level
        customerAudType: "string", // Audience key type
        visitorAudLvl: "Visitor", // Audience Level for unauthenticated visitors
        visitorAud: "VisitorID",
        visitorAudType: "string",
        visitorAudID: "VisitorID,0,string", // Predefined visitor ID used to start session for a first time visitor
        visitorAltIDVar: "AlternateID", // Visitor profile variable used to pass first time visitor ID (e.g. cookie) on session start.
        // Offer content attributes
        imageAttribute: "offer_image",
        titleAttribute: "offer_title",
        copyAttribute: "offer_copy",
        ctaAttribute: "offer_cta",
        linkAttribute: "offer_link",
        offerTemplateURL: "",
        timeout: 5,
        interactSpot: [],
        sessionCookie: "",
        modalOffers: false,
      }

      const getAudience = (userName?: string): CustomAudienceConfig => {
        const urlParams = new URLSearchParams(window.location.search)
        if (userName) {
          return {
            audId: confObj.customerAud + "," + userName.toString() + "," + confObj.customerAudType,
            audLevel: confObj.customerAudLvl,
          }
        } else if (urlParams.has("utm_email")) {
          const id = urlParams.get("utm_email")
          return { audId: "VisitorID," + (id || "0") + ",string", audLevel: "Visitor" }
        } else if (urlParams.has("id")) {
          const id = urlParams.get("id")
          return {
            audId: confObj.customerAud + "," + (id || "0").toString() + "," + confObj.customerAudType,
            audLevel: confObj.customerAudLvl,
          }
        } else {
          let currAudId = sessionStorage.getItem("audId")
          if (currAudId === null) {
            return { audId: "VisitorID,0,string", audLevel: "Visitor" }
          } else {
            currAudId = currAudId.replaceAll("|", ",")
            let lvl = confObj.visitorAudLvl
            if (currAudId.includes(confObj.customerAud)) {
              lvl = confObj.customerAudLvl
            }
            return { audId: currAudId, audLevel: lvl }
          }
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const renderOffers = (spotId: string, response: any): void => {
        let firstApiOffer: OfferDisplayData | null = null

        if (response.responses?.length) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          response.responses.forEach((responseItem: any) => {
            if (responseItem.offerList?.length > 0) {
              const offers = responseItem.offerList[0]?.offers || []
              if (offers.length > 0) {
                // Take only the first offer and convert to OfferDisplayData
                firstApiOffer = {
                  ...offers[0],
                  // Display properties will be extracted from attributes in the Offer component
                }
              }
            }
          })
        }

        // Use first API offer if available, otherwise use first default offer
        setOffer(firstApiOffer || defaultOffers[0])
      }

      const getPageOffers = async (pageName: string, userName = "", eventVars = ""): Promise<void> => {
        const tltsidCookie = Cookie.get("TLTSID")
        confObj.sessionCookie = tltsidCookie || ""
        // console.log("Session cookie (TLTSID):", tltsidCookie || "not found")

        // Ensure we have a session ID fallback
        if (!tltsidCookie) {
          const timestamp = new Date().getTime()
          const fallbackSessionId = `session_${timestamp}`
          confObj.sessionCookie = fallbackSessionId
          // console.log("Generated fallback session ID:", fallbackSessionId)
        }

        const aud = getAudience(userName)
        // console.log("Audience config:", aud, "for userName:", userName)
        const spot = {
          interactionPoint: pageName,
          event: "page_view",
          maxNumOffers: 1,
          eventVars,
          renderFunction: renderOffers,
          offerTemplateURL: "",
          interactSpot: ["spot1"],
        }

        // Convert string audLevel to number for the API call
        const apiAud = {
          ...aud,
          audLevel: aud.audLevel === "Visitor" ? 1 : 2,
        }

        // First set the base configuration to ensure proper initialization
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setConfig(confObj as any)
        // console.log("API audience config:", { audId: apiAud.audId, audLevel: apiAud.audLevel })
        // console.log("confObj.sessionCookie before postEventAndGetOffers:", confObj.sessionCookie)

        await postEventAndGetOffers(
          pageName, // Use the interaction point name
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          apiAud as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          spot as any,
        )
      }

      try {
        const userName = getCurrentUser(brand.key) // Get current logged-in user ID
        // console.log("Fetching offers for user ID:", userName || "anonymous")

        // Force session reset for authenticated users to ensure proper audience
        if (userName) {
          // console.log("User is authenticated - forcing session reset")
          sessionStorage.removeItem("audId")
          sessionStorage.removeItem("ssId")
          sessionStorage.removeItem("ssTs")
          sessionStorage.removeItem("lastAuthenticatedUser")
        }

        await getPageOffers(interactionPoint, userName)
      } catch (error) {
        console.error("Error fetching offers:", error)
        // Set default offer on error
        setOffer(defaultOffers[0])
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
        hasInitiallyLoaded.current = true
      }
    }

    fetchOffers()
  }, [refreshTrigger, brand.key, defaultOffers, interactionPoint]) // Removed 'offer' to prevent infinite loop

  return (
    <div>
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">Loading offer...</p>
        </div>
      ) : offer ? (
        <div className={`w-full transition-opacity duration-300 ${isRefreshing ? "opacity-75" : "opacity-100"}`}>
          <Offer offer={offer} />
        </div>
      ) : (
        <div>
          <p className="text-lg text-gray-600">No offers available at this time.</p>
        </div>
      )}
    </div>
  )
}

export default Offers
