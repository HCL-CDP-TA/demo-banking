"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import Hero from "@/components/Hero"
import { getIcon } from "@/lib/brandLocaleUtils"
import { useSiteContext } from "@/lib/SiteContext"

export default function CreditCardsPage() {
  const { brand, getPageNamespace } = useSiteContext()
  const t = useTranslations(getPageNamespace())
  const [selectedCard, setSelectedCard] = useState<string | null>(null)

  const handleCardInterest = (cardType: string) => {
    setSelectedCard(cardType)

    // Track customer interaction for CDP
    const customerData = JSON.parse(localStorage.getItem(`${brand.key}_customer_data`) || "{}")
    localStorage.setItem(
      `${brand.key}_customer_data`,
      JSON.stringify({
        ...customerData,
        creditCardInterest: {
          cardType,
          timestamp: new Date().toISOString(),
        },
      }),
    )
  }

  interface Card {
    title: string
    description: string
    rate1: string
    rate1Description: string
    rate2: string
    rate2Description: string
    features: string[]
    ctaText: string
  }

  const cards: Card[] = [
    {
      title: t("cards.card1.title"),
      description: t("cards.card1.description"),
      rate1: t("cards.card1.rate1"),
      rate1Description: t("cards.card1.rate1Description"),
      rate2: t("cards.card1.rate2"),
      rate2Description: t("cards.card1.rate2Description"),
      features: [
        t("cards.card1.features.feature1"),
        t("cards.card1.features.feature2"),
        t("cards.card1.features.feature3"),
        t("cards.card1.features.feature4"),
      ],
      ctaText: t("cards.card1.cta"),
    },
    {
      title: t("cards.card2.title"),
      description: t("cards.card2.description"),
      rate1: t("cards.card2.rate1"),
      rate1Description: t("cards.card2.rate1Description"),
      rate2: t("cards.card2.rate2"),
      rate2Description: t("cards.card2.rate2Description"),
      features: [
        t("cards.card2.features.feature1"),
        t("cards.card2.features.feature2"),
        t("cards.card2.features.feature3"),
        t("cards.card2.features.feature4"),
      ],
      ctaText: t("cards.card2.cta"),
    },
    {
      title: t("cards.card3.title"),
      description: t("cards.card3.description"),
      rate1: t("cards.card3.rate1"),
      rate1Description: t("cards.card3.rate1Description"),
      rate2: t("cards.card3.rate2"),
      rate2Description: t("cards.card3.rate2Description"),
      features: [
        t("cards.card3.features.feature1"),
        t("cards.card3.features.feature2"),
        t("cards.card3.features.feature3"),
        t("cards.card3.features.feature4"),
      ],
      ctaText: t("cards.card3.cta"),
    },
  ]

  const benefits = [
    {
      icon: getIcon(t("benefits.items.item1.icon")),
      title: t("benefits.items.item1.title"),
      description: t("benefits.items.item1.description"),
    },
    {
      icon: getIcon(t("benefits.items.item2.icon")),
      title: t("benefits.items.item2.title"),
      description: t("benefits.items.item2.description"),
    },
    {
      icon: getIcon(t("benefits.items.item3.icon")),
      title: t("benefits.items.item3.title"),
      description: t("benefits.items.item3.description"),
    },
    {
      icon: getIcon(t("benefits.items.item4.icon")),
      title: t("benefits.items.item4.title"),
      description: t("benefits.items.item4.description"),
    },
  ]

  return (
    <>
      <Hero title={t("hero.title")} subTitle={t("hero.subTitle")} cta={t("hero.cta")} imageUrl={t("hero.imageUrl")} />

      {/* Credit Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">{t("cards.title")}</h2>
            <p className="text-xl text-slate-600">{t("cards.subTitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cards.map((card, index) => (
              <Card key={index} className="card-hover border-slate-200 bg-white">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl text-slate-800">{card.title}</CardTitle>
                  <CardDescription className="text-slate-600">{card.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-6 bg-slate-50 rounded-lg">
                      <div className="text-4xl font-bold text-slate-800 mb-2">{card.rate1}</div>
                      <p className="text-sm text-slate-600">{card.rate1Description}</p>
                      <div className="text-2xl font-bold text-slate-700 mt-3">{card.rate2}</div>
                      <p className="text-sm text-slate-600">{card.rate2Description}</p>
                    </div>

                    <ul className="space-y-3 text-sm">
                      {card.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-slate-600">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button className="w-full">{card.ctaText}</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">{t("benefits.title")}</h2>
            <p className="text-xl text-slate-600">{t("benefits.subTitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto mb-4 p-4 bg-slate-100 rounded-full w-fit">
                  <benefit.icon className="h-8 w-8 text-[var(--primary)]" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-slate-800">{benefit.title}</h3>
                <p className="text-slate-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">{t("cta.title")}</h2>
          <p className="text-xl mb-8 text-slate-300 max-w-2xl mx-auto">{t("cta.description")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="cursor-pointer px-8 py-3">
              {t("cta.applyButton")}
            </Button>
            <Button size="lg" variant="secondary" className="cursor-pointer px-8 py-3">
              {t("cta.compareButton")}
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
