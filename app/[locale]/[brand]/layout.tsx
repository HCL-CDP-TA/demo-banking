import { NextIntlClientProvider, hasLocale } from "next-intl"
import { notFound } from "next/navigation"
import { routing } from "@/i18n/routing"
import Footer from "@/components/Footer"
import Navigation from "@/components/Navigation"
import { getMessages } from "@/lib/getMessages"
import { supportedBrands } from "@/i18n/brands"
import { supportedLocales } from "@/i18n/locales"

export async function generateStaticParams() {
  return supportedBrands.flatMap(brand =>
    supportedLocales.map(locale => ({
      locale: locale.code,
      brand: brand.key,
    })),
  )
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { brand: string; locale: string }
}) {
  const { brand, locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const messages = await getMessages(brand, locale)

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        {children}
        <Footer />
      </div>
    </NextIntlClientProvider>
  )
}
