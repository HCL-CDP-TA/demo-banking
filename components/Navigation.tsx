"use client"

import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { Landmark, Menu, User, X } from "lucide-react"
import { supportedBrands } from "@/i18n/brands"
import { useState } from "react"
import Link from "next/link"
import LoginModal from "./LoginModal"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import NavLink from "./common/NavLink"
import NavControls from "./NavControls"

const Navigation = () => {
  const pathname = usePathname()
  const t = useTranslations("navigation")

  // Extract brand from URL path
  const [_, currentLocale, currentBrand] = pathname.split("/")
  const brand = supportedBrands.find(brand => brand.value === currentBrand) || supportedBrands[0]
  const Icon = brand.icon || Landmark

  // Update navigation to include dynamic paths
  const navigation = [
    { name: t("homeLoans"), href: `/${currentLocale}/${currentBrand}/home-loans` },
    { name: t("creditCards"), href: `/${currentLocale}/${currentBrand}/credit-cards` },
    { name: t("carLoans"), href: `/${currentLocale}/${currentBrand}/car-loans` },
  ]

  // Update logo link to maintain brand and locale
  const homeLink = `/${currentLocale}/${currentBrand}`

  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-[var(--secondary)] shadow-sm sticky top-0 z-50 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href={homeLink} className="flex items-center space-x-2">
              <Icon className="h-8 w-8 text-[var(--primary)]" />
              <span className="text-2xl font-bold text-[var(--secondary-foreground)]">{brand.label}</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {navigation.map((item, index) => (
                <NavLink key={item.name} href={item.href}>
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Controls and Login */}
          <div className="hidden md:flex items-center space-x-4">
            <NavControls />
            <LoginModal>
              <Button variant="default" className="cursor-pointer">
                <User className="h-4 w-4 mr-2 cursor-pointer" />
                {t("login")}
              </Button>
            </LoginModal>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <NavControls />
            <Button
              onClick={() => setIsOpen(!isOpen)}
              className="cursor-pointer inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-slate-800 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-500">
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={cn("md:hidden", isOpen ? "block" : "hidden")}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigation.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className="text-[var(--secondary-foreground)] hover:text-[var(--primary)] block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}>
                {item.name}
              </Link>
            ))}
            <div className="pt-4">
              <LoginModal>
                <Button className="w-full pointer-cursor">
                  <User className="h-4 w-4 mr-2" />
                  {t("login")}
                </Button>
              </LoginModal>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
export default Navigation
