"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { supportedBrands } from "@/i18n/brands"
import { supportedLocales } from "@/i18n/locales"
import { useRouter, usePathname } from "next/navigation"

const themesList = supportedBrands.map(theme => theme.value)
const localList = supportedLocales.map(locale => locale.code)

type Theme = (typeof themesList)[number]
type Locale = (typeof localList)[number]

interface ThemeContextType {
  theme: Theme
  locale: Locale
  setTheme: (theme: Theme) => void
  setLocale: (locale: Locale) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [theme, setTheme] = useState<Theme>(supportedBrands[0].value)
  const [locale, setLocale] = useState<Locale>(supportedLocales[0].code)

  // Extract theme from URL on mount and path changes
  useEffect(() => {
    const [_, currentLocale, currentBrand] = pathname.split("/")
    if (currentBrand && themesList.includes(currentBrand as Theme)) {
      setTheme(currentBrand as Theme)
    }
    if (currentLocale && localList.includes(currentLocale as Locale)) {
      setLocale(currentLocale as Locale)
    }
  }, [pathname])

  const handleThemeChange = (newTheme: Theme) => {
    const [_, currentLocale, _currentBrand, ...rest] = pathname.split("/")
    const remainingPath = rest.join("/")

    // Construct new URL with changed theme
    const newPath = `/${currentLocale}/${newTheme}${remainingPath ? `/${remainingPath}` : ""}`
    router.push(newPath)
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        locale,
        setTheme: handleThemeChange,
        setLocale,
      }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
