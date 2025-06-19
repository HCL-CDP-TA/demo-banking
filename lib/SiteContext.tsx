"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { SupportedBrand, supportedBrands } from "@/i18n/brands"
import { SupportedLocale, supportedLocales } from "@/i18n/locales"

const brandKeys = supportedBrands.map(b => b.key)
const localeCodes = supportedLocales.map(l => l.code)

interface SiteContextType {
  brand: SupportedBrand
  locale: SupportedLocale
  setBrand: (brandKey: string) => void
  setLocale: (localeCode: string) => void
  /** Returns the path for the current locale and brand. Example: `/en-GB/woodburn` */
  basePath: string
  /** Returns a full URL by appending `path` to the base path. Example: `/en-GB/woodburn/your/path` */
  getFullPath: (path: string) => string
  /** Returns the relative path (excluding locale/brand) to use as the translation namespace. Example: `home-loans/application` */
  getPageNamespace: () => string
}

const SiteContext = createContext<SiteContextType | undefined>(undefined)

/**
 * Provides brand and locale context for the site.
 * Extracts the current brand and locale from the URL path.
 * Includes helpers for building URLs and determining translation namespaces.
 */
export function SiteProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const [brand, setBrandState] = useState<SupportedBrand>(supportedBrands[0])
  const [locale, setLocaleState] = useState<SupportedLocale>(supportedLocales[0])

  useEffect(() => {
    const [_, localeCode, brandKey] = pathname.split("/")
    const matchedBrand = supportedBrands.find(b => b.key === brandKey)
    const matchedLocale = supportedLocales.find(l => l.code === localeCode)

    if (matchedBrand) setBrandState(matchedBrand)
    if (matchedLocale) setLocaleState(matchedLocale)
  }, [pathname])

  const setBrand = (brandKey: string) => {
    const [_, localeCode, _brandKey, ...rest] = pathname.split("/")
    const newPath = `/${localeCode}/${brandKey}${rest.length ? "/" + rest.join("/") : ""}`
    router.push(newPath)
  }

  const setLocale = (localeCode: string) => {
    const [_, _localeCode, brandKey, ...rest] = pathname.split("/")
    const newPath = `/${localeCode}/${brandKey}${rest.length ? "/" + rest.join("/") : ""}`
    router.push(newPath)
  }

  const basePath = `/${locale.code}/${brand.key}`

  const getFullPath = (path: string) => {
    if (!path) return basePath
    return `${basePath}/${path.replace(/^\/+/, "")}` // remove any leading slashes from provided path
  }

  const getPageNamespace = () => {
    const [, , , ...rest] = pathname.split("/")
    return rest.join("/") || "home"
  }

  return (
    <SiteContext.Provider
      value={{
        brand,
        locale,
        setBrand,
        setLocale,
        basePath,
        getFullPath,
        getPageNamespace,
      }}>
      {children}
    </SiteContext.Provider>
  )
}

/**
 * Hook to access the SiteContext.
 * Must be used within a <SiteProvider>.
 */
export function useSiteContext() {
  const context = useContext(SiteContext)
  if (!context) {
    throw new Error("useSiteContext must be used within a SiteProvider")
  }
  return context
}
