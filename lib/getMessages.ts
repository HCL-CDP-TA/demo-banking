import fs from "fs/promises"
import path from "path"
import { supportedLocales } from "@/i18n/locales"
import { supportedBrands } from "@/i18n/brands"
import deepmerge from "deepmerge"

async function loadJson(filePath: string): Promise<any> {
  try {
    const data = await fs.readFile(filePath, "utf-8")
    return JSON.parse(data)
  } catch {
    return {} // Return an empty object if the file doesn't exist
  }
}

export async function getMessages(brand: string, locale: string) {
  const defaultLocale = supportedLocales[0].code // Default fallback locale
  const defaultBrand = supportedBrands[0].key // Default brand fallback (first in supportedThemes)

  // Find the locale configuration from supportedLocales
  const localeConfig =
    supportedLocales.find(l => l.code === locale) || supportedLocales.find(l => l.code === defaultLocale)

  if (!localeConfig) {
    throw new Error(`Locale configuration not found for locale: ${locale}`)
  }

  const selectedBrand = supportedBrands.find(supportedBrand => supportedBrand.key === brand)?.key || defaultBrand

  // Resolve fallback chain for the locale (exclude the default locale from the chain)
  const fallbackChain = Array.from(new Set([localeConfig.code, ...(localeConfig.fallbacks || [])])).filter(
    fallbackLocale => fallbackLocale !== defaultLocale,
  )

  // console.log("Fallback Chain:", fallbackChain)

  // Load the base translations (en.json)
  const baseTranslations = await loadJson(path.resolve(process.cwd(), `language/${defaultLocale}.json`))
  // console.log("Base Translations:", baseTranslations)

  // Load locale-specific translations (excluding the base translations)
  const localeTranslations = await Promise.all(
    fallbackChain.map(async fallbackLocale => {
      const filePath = path.resolve(process.cwd(), `language/${fallbackLocale}.json`)
      const translations = await loadJson(filePath)
      // console.log(`Loaded locale translations for ${fallbackLocale}:`, translations)
      return translations
    }),
  )

  // Load brand-specific translations
  const brandTranslations = await Promise.all(
    [defaultLocale, ...fallbackChain].map(async fallbackLocale => {
      const filePath = path.resolve(process.cwd(), `language/${selectedBrand}/${fallbackLocale}.json`)
      const translations = await loadJson(filePath)
      // console.log(`Loaded brand translations for ${selectedBrand}/${fallbackLocale}:`, translations)
      return translations
    }),
  )

  // Merge translations in order of precedence:
  // 1. Base translations (en.json)
  // 2. Locale translations (fallback chain)
  // 3. Brand translations (fallback chain)
  const mergedTranslations = deepmerge.all([baseTranslations, ...localeTranslations, ...brandTranslations], {
    arrayMerge: (destinationArray, sourceArray) => sourceArray, // Ensure arrays are overridden completely
  })

  // console.log("Merged Translations:", mergedTranslations)

  return mergedTranslations
}
