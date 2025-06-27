"use client"
import { Phone, Mail } from "lucide-react"
import { useTranslations } from "next-intl"
import NavLink from "./common/NavLink"
import { useSiteContext } from "@/lib/SiteContext"

const Footer = () => {
  const { brand, getFullPath } = useSiteContext()
  const t = useTranslations("footer")

  return (
    <footer className="bg-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}

          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <brand.icon className="h-8 w-8 text-[var(--primary)]" />
              <span className="text-2xl font-bold">{brand.label}</span>
            </div>
            <p className="text-slate-300 mb-4 leading-relaxed">{t("description")}</p>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4" />
                <span>{t("phone")}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4" />
                <span>{t("email")}</span>
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("sections.products.title")}</h3>
            <ul className="space-y-2 text-slate-300">
              <li>
                <NavLink href={getFullPath("/home-loans")}>{t("sections.products.homeLoans")}</NavLink>
              </li>
              <li>
                <NavLink href={getFullPath("/credit-cards")}>{t("sections.products.creditCards")}</NavLink>
              </li>
              <li>
                <NavLink href={getFullPath("/car-loans")}>{t("sections.products.carLoans")}</NavLink>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("sections.support.title")}</h3>
            <ul className="space-y-2 text-slate-300">
              <li>
                <NavLink href="#">{t("sections.support.contact")}</NavLink>
              </li>
              <li>
                <NavLink href="#">{t("sections.support.help")}</NavLink>
              </li>
              <li>
                <NavLink href="#">{t("sections.support.security")}</NavLink>
              </li>
              <li>
                <NavLink href="#">{t("sections.support.privacy")}</NavLink>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-600 mt-8 pt-8 text-center text-slate-400">
          <p>{t("copyright")}</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
