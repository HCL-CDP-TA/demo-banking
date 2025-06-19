"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users, Award, CheckCircle, LucideIcon } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import Hero from "@/components/Hero"
import { getIcon } from "@/lib/brandLocaleUtils"
import { useSiteContext } from "@/lib/SiteContext"

export default function HomePage() {
  const t = useTranslations(useSiteContext().getPageNamespace())
  interface Product {
    title: string
    description: string
    icon: LucideIcon
    link: string
    features: string[]
  }

  interface TrustNumbers {
    title: string
    description: string
  }

  interface TrustIndicator {
    title: string
    description: string
    icon: LucideIcon
  }

  const products: Product[] = [
    {
      title: t("products.items.item1.title"),
      description: t("products.items.item1.description"),
      icon: getIcon(t("products.items.item1.icon")),
      link: "/home-loans",
      features: [
        t("products.items.item1.features.feature1"),
        t("products.items.item1.features.feature2"),
        t("products.items.item1.features.feature3"),
      ],
    },
    {
      title: t("products.items.item2.title"),
      description: t("products.items.item2.description"),
      icon: getIcon(t("products.items.item2.icon")),
      link: "/credit-cards",
      features: [
        t("products.items.item2.features.feature1"),
        t("products.items.item2.features.feature2"),
        t("products.items.item2.features.feature3"),
      ],
    },
    {
      title: t("products.items.item3.title"),
      description: t("products.items.item3.description"),
      icon: getIcon(t("products.items.item3.icon")),
      link: "/personal-loans",
      features: [
        t("products.items.item3.features.feature1"),
        t("products.items.item3.features.feature2"),
        t("products.items.item3.features.feature3"),
      ],
    },
  ]

  const trustNumbers: TrustNumbers[] = [
    {
      title: t("trustNumbers.items.item1.title"),
      description: t("trustNumbers.items.item1.description"),
    },
    {
      title: t("trustNumbers.items.item2.title"),
      description: t("trustNumbers.items.item2.description"),
    },
    {
      title: t("trustNumbers.items.item3.title"),
      description: t("trustNumbers.items.item3.description"),
    },
    {
      title: t("trustNumbers.items.item4.title"),
      description: t("trustNumbers.items.item4.description"),
    },
  ]

  const trustIndicators: TrustIndicator[] = [
    {
      title: t("trustIndicators.items.item1.title"),
      description: t("trustIndicators.items.item1.description"),
      icon: Shield,
    },
    {
      title: t("trustIndicators.items.item2.title"),
      description: t("trustIndicators.items.item2.description"),
      icon: Users,
    },
    {
      title: t("trustIndicators.items.item3.title"),
      description: t("trustIndicators.items.item3.description"),
      icon: Award,
    },
  ]

  return (
    <main>
      {/* Hero Section */}
      <Hero
        title={t.rich("hero.title", {
          highlight: chunks => <span className="text-green-400">{chunks}</span>,
        })}
        subTitle={t.rich("hero.subtitle", {
          highlight: chunks => <span className="text-green-400">{chunks}</span>,
        })}
        cta={t("hero.cta")}
        imageUrl={t("hero.imageUrl")}
      />

      {/* Trust Numbers */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {trustNumbers.map((number, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="text-3xl font-bold mb-1">{number.title}</div>
                <div className="text-sm">{number.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">{t("products.title")}</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">{t("products.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <Card key={index} className="card-hover cursor-pointer border-slate-200 bg-white">
                <Link href={product.link}>
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-4 p-4 bg-slate-100 rounded-full w-fit">
                      <product.icon className="h-8 w-8 text-[var(--primary)]" />
                    </div>
                    <CardTitle className="text-xl text-slate-800">{product.title}</CardTitle>
                    <CardDescription className="text-slate-600">{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-slate-600 space-y-2">
                      {product.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="trust-gradient py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">{t("trustIndicators.title")}</h2>
            <p className="text-xl text-slate-600">{t("trustIndicators.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {trustIndicators.map((indicator, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto mb-6 p-4 bg-white rounded-full w-fit shadow-sm">
                  <indicator.icon className="h-8 w-8 text-[var(--primary)]" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-800">{indicator.title}</h3>
                <p className="text-slate-600 leading-relaxed">{indicator.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("cta.title")}</h2>
          <p className="text-xl mb-8 text-slate-300 max-w-2xl mx-auto">{t("cta.subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={t("cta.buttons.link1")}>
              <Button
                size="lg"
                variant={
                  t("cta.buttons.variant1") as "link" | "default" | "destructive" | "outline" | "secondary" | "ghost"
                }
                className="cursor-pointer">
                {t("cta.buttons.text1")}
              </Button>
            </Link>
            <Link href={t("cta.buttons.link1")}>
              <Button
                size="lg"
                variant={
                  t("cta.buttons.variant2") as "link" | "default" | "destructive" | "outline" | "secondary" | "ghost"
                }
                className="cursor-pointer">
                {t("cta.buttons.text2")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
