import { Building, Building2, Landmark } from "lucide-react"
import { LucideIcon } from "lucide-react"

export interface SupportedBrand {
  value: string
  label: string
  icon: LucideIcon
}

const supportedBrands: SupportedBrand[] = [
  { value: "woodburn", label: "Woodburn Bank", icon: Landmark },
  { value: "firstbank", label: "First Bank", icon: Building2 },
  { value: "national", label: "National Bank", icon: Building },
]

export { supportedBrands }
