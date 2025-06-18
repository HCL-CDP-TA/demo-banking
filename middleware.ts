import createIntlMiddleware from "next-intl/middleware"
import { NextResponse, type NextRequest } from "next/server"
import { supportedLocales } from "./i18n/locales"
import { supportedBrands } from "./i18n/brands"

const DEFAULT_LOCALE = "en-US"
const DEFAULT_BRAND = supportedBrands[0].value

// Create the intl middleware
const intlMiddleware = createIntlMiddleware({
  locales: supportedLocales.map(locale => locale.code),
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always",
  localeDetection: true,
})

// Custom middleware function
export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const [_, locale, brand, ...rest] = pathname.split("/")
  const path = rest.join("/")

  // Handle redirects
  if (!locale) {
    return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}/${DEFAULT_BRAND}`, request.url))
  }

  if (!brand) {
    return NextResponse.redirect(new URL(`/${locale}/${DEFAULT_BRAND}/${path}`, request.url))
  }

  const isValidBrand = supportedBrands.some(supportedBrand => supportedBrand.value === brand)
  if (!isValidBrand) {
    return NextResponse.redirect(new URL(`/${locale}/${DEFAULT_BRAND}/${brand}/${path}`, request.url))
  }

  // Continue with intl middleware
  return intlMiddleware(request)
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
}
