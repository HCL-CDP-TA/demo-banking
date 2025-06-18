import * as Icons from "lucide-react"

const getIcon = (name: string): Icons.LucideIcon => {
  return (Icons[name as keyof typeof Icons] as Icons.LucideIcon) || Icons.Shield
}

export default getIcon
