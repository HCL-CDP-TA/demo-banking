import Link from "next/link"
import { Button } from "../ui/button"

// Extended offer interface with display properties
export interface OfferDisplayData {
  n: string
  code: string
  treatmentCode: string
  score: number
  desc: string
  attributes: Array<{ n: string; v: string | number | boolean }>
  // Display properties extracted from attributes or defaults
  title?: string
  description?: string
  image?: string
  cta?: string
  ctaLink?: string
}

interface OfferProps {
  offer: OfferDisplayData
}

const Offer = ({ offer }: OfferProps) => {
  // Helper function to get attribute value by name
  const getAttributeValue = (attributeName: string, defaultValue = ""): string => {
    const attribute = offer.attributes.find(attr => attr.n.toLowerCase() === attributeName.toLowerCase())
    return attribute ? String(attribute.v) : defaultValue
  }

  // Extract display properties from attributes with fallbacks
  const title = offer.title || getAttributeValue("offer_title") || offer.n || ""
  const description =
    offer.description ||
    getAttributeValue("offer_copy") ||
    getAttributeValue("offer_description") ||
    offer.desc ||
    "Great offer just for you!"
  const image = offer.image || getAttributeValue("offer_image") || "/placeholder-offer.jpg"
  const cta = offer.cta || getAttributeValue("offer_cta") || "Learn More"
  const ctaLink = offer.ctaLink || getAttributeValue("offer_link") || "#"

  return (
    <div
      className="relative rounded-2xl overflow-hidden bg-center bg-no-repeat bg-cover min-h-[400px] flex items-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4),rgba(0,0,0,0.6)),url('${image}')`,
      }}>
      <div className="relative z-10 p-6 text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
        <p className="text-lg md:text-xl mb-8 text-slate-200 leading-relaxed">{description}</p>
        <Link href={ctaLink}>
          <Button size="lg" className="bg-primary px-6 py-2">
            {cta}
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default Offer
