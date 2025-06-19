import { Building, Building2, Landmark } from "lucide-react"
import { LucideIcon } from "lucide-react"

export interface SupportedBrand {
  key: string
  label: string
  icon: LucideIcon
}

const supportedBrands: SupportedBrand[] = [
  { key: "woodburn", label: "Woodburn Bank", icon: Landmark },
  { key: "firstbank", label: "First Bank", icon: Building2 },
  { key: "national", label: "National Bank", icon: Building },
]

export { supportedBrands }
