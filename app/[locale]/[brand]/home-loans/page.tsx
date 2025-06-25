"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Home, Calculator, CheckCircle, LucideIcon, Phone, ArrowRight, ChevronsRight } from "lucide-react"
import Hero from "@/components/Hero"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { getIcon } from "@/lib/brandLocaleUtils"
import { useSiteContext } from "@/lib/SiteContext"
import { CdpPageEvent, useCdp } from "hclcdp-web-sdk-react"
import { useCDPTracking } from "@/lib/hooks/useCDPTracking"

export default function HomeLoansPage() {
  const { brand, locale, getPageNamespace } = useSiteContext()
  const pageNamespace = getPageNamespace()
  const t = useTranslations(pageNamespace)
  const { isCDPTrackingEnabled } = useCDPTracking()
  const [interestShown, setInterestShown] = useState(false)
  const { track } = useCdp()

  interface CalculatorData {
    loanAmount: number
    interestRate: number
    loanTerm: number
    paymentFrequency: "weekly" | "fortnightly" | "monthly"
    monthlyPayments?: number
  }

  const [calculatorData, setCalculatorData] = useState<CalculatorData>({
    loanAmount: parseInt(t("calculator.loanAmount.default")),
    interestRate: parseFloat(t("calculator.interestRate.default")) * 100,
    loanTerm: parseInt(t("calculator.loanTerm.default")),
    paymentFrequency: t("calculator.paymentFrequency.default") as "weekly" | "fortnightly" | "monthly",
  })

  interface LoanType {
    title: string
    description: string
    icon: LucideIcon
    features: string[]
  }

  const loanTypes: LoanType[] = [
    {
      title: t("loanTypes.items.item1.title"),
      description: t("loanTypes.items.item1.description"),
      icon: getIcon(t("loanTypes.items.item1.icon")),
      features: [
        t("loanTypes.items.item1.features.feature1"),
        t("loanTypes.items.item1.features.feature2"),
        t("loanTypes.items.item1.features.feature3"),
        t("loanTypes.items.item1.features.feature4"),
      ],
    },
    {
      title: t("loanTypes.items.item2.title"),
      description: t("loanTypes.items.item2.description"),
      icon: getIcon(t("loanTypes.items.item2.icon")),
      features: [
        t("loanTypes.items.item2.features.feature1"),
        t("loanTypes.items.item2.features.feature2"),
        t("loanTypes.items.item2.features.feature3"),
        t("loanTypes.items.item2.features.feature4"),
      ],
    },
    {
      title: t("loanTypes.items.item3.title"),
      description: t("loanTypes.items.item3.description"),
      icon: getIcon(t("loanTypes.items.item3.icon")),
      features: [
        t("loanTypes.items.item3.features.feature1"),
        t("loanTypes.items.item3.features.feature2"),
        t("loanTypes.items.item3.features.feature3"),
        t("loanTypes.items.item3.features.feature4"),
      ],
    },
  ]

  const handleCalculator = () => {
    setInterestShown(true)
    setCalculatorData(prevData => ({
      ...prevData,
      monthlyPayments: calculateRepayment(
        prevData.loanAmount,
        prevData.interestRate / 100,
        prevData.loanTerm,
        prevData.paymentFrequency,
      ),
    }))

    if (isCDPTrackingEnabled) {
      track({
        identifier: t("cdp.calculateEventName"),
        properties: {
          loanAmount: calculatorData.loanAmount,
          interestRate: calculatorData.interestRate / 100,
          loanTerm: calculatorData.loanTerm,
          paymentFrequency: calculatorData.paymentFrequency,
          monthlyPayments: calculateRepayment(
            calculatorData.loanAmount,
            calculatorData.interestRate / 100,
            calculatorData.loanTerm,
            calculatorData.paymentFrequency,
          ).toFixed(2),
          currency: t("calculator.loanAmount.currency"),
          brand: brand.label,
          locale: locale.code,
        },
      })
    }
  }

  function calculateRepayment(
    loanAmount: number,
    annualInterestRate: number,
    loanTermYears: number,
    paymentFrequency: "weekly" | "fortnightly" | "monthly",
  ): number {
    const principal = loanAmount
    const monthlyRate = annualInterestRate / 100 / 12
    const numberOfPayments =
      paymentFrequency === "weekly"
        ? loanTermYears * 52
        : paymentFrequency === "fortnightly"
        ? loanTermYears * 26
        : loanTermYears * 12

    if (monthlyRate === 0) return principal / numberOfPayments

    const adjustedRate =
      paymentFrequency === "weekly"
        ? monthlyRate / 4
        : paymentFrequency === "fortnightly"
        ? monthlyRate / 2
        : monthlyRate

    const factor = Math.pow(1 + adjustedRate, numberOfPayments)
    return (principal * adjustedRate * factor) / (factor - 1)
  }

  return (
    <>
      {isCDPTrackingEnabled && (
        <CdpPageEvent pageName={t("cdp.pageEventName")} pageProperties={{ brand: brand.label, locale: locale.code }} />
      )}
      <Hero
        title={t("hero.title")}
        subTitle={t("hero.subTitle")}
        cta={t("hero.button")}
        imageUrl={t("hero.imageUrl")}
      />

      {/* Loan Calculator */}
      <section className="py-16 items-stretch">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
            <div className="flex flex-col">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-6">{t("calculator.title")}</h2>
                <p className="text-slate-600 mb-8 text-lg">{t("calculator.description")}</p>
              </div>

              <Card className="border-slate-200 shadow-sm flex-1 flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    {t("calculator.cardTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <form className="space-y-6 flex-1">
                    {/* Loan Amount */}
                    <div>
                      <Label htmlFor="loanAmount" className="text-slate-700">
                        {t("calculator.loanAmount.label")}
                      </Label>
                      <Slider
                        defaultValue={[parseInt(t("calculator.loanAmount.default"))]}
                        min={parseFloat(t("calculator.loanAmount.min"))}
                        max={parseFloat(t("calculator.loanAmount.max"))}
                        step={parseFloat(t("calculator.loanAmount.step"))}
                        className="cursor-pointer py-3"
                        onChange={e => {
                          setCalculatorData({
                            ...calculatorData,
                            loanAmount: parseFloat((e.target as HTMLInputElement).value),
                          })
                          setInterestShown(false)
                        }}
                      />
                      <span className="text-3xl font-bold text-slate-600">
                        {new Intl.NumberFormat(t("calculator.loanAmount.locale"), {
                          style: "currency",
                          currency: t("calculator.loanAmount.currency"),
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(calculatorData.loanAmount)}
                      </span>
                    </div>

                    {/* Interest Rate */}
                    <div>
                      <Label htmlFor="interestRate" className="text-slate-700">
                        {t("calculator.interestRate.label")}
                      </Label>
                      <Slider
                        defaultValue={[parseInt(t("calculator.interestRate.default")) * 100]}
                        min={parseInt(t("calculator.interestRate.min")) * 100}
                        max={parseInt(t("calculator.interestRate.max")) * 100}
                        step={parseFloat(t("calculator.interestRate.step")) * 100}
                        className="cursor-pointer py-3"
                        onChange={e => {
                          setCalculatorData({
                            ...calculatorData,
                            interestRate: parseFloat((e.target as HTMLInputElement).value),
                          })
                          setInterestShown(false)
                        }}
                      />
                      <span className="text-3xl font-bold text-slate-600">
                        {(calculatorData.interestRate / 100).toFixed(2)}%
                      </span>
                    </div>

                    {/* Loan Term */}
                    <div>
                      <Label htmlFor="loanTerm" className="text-slate-700">
                        {t("calculator.loanTerm.label")}
                      </Label>
                      <Slider
                        defaultValue={[parseInt(t("calculator.loanTerm.default"))]}
                        min={parseInt(t("calculator.loanTerm.min"))}
                        max={parseInt(t("calculator.loanTerm.max"))}
                        step={parseInt(t("calculator.loanTerm.step"))}
                        className="cursor-pointer py-3"
                        onChange={e => {
                          setCalculatorData({
                            ...calculatorData,
                            loanTerm: parseInt((e.target as HTMLInputElement).value),
                          })
                          setInterestShown(false)
                        }}
                      />
                      <span className="text-3xl font-bold text-slate-600">
                        {calculatorData.loanTerm} {t("calculator.loanTerm.years")}
                      </span>
                    </div>

                    {/* Payment Frequency */}
                    <div className={t("calculator.paymentFrequency.visible") == "true" ? "block" : "hidden"}>
                      <Label htmlFor="paymentFrequency" className="text-slate-700 py-3 ">
                        {t("calculator.paymentFrequency.label")}
                      </Label>
                      <Select
                        value={calculatorData.paymentFrequency}
                        onValueChange={value => {
                          setCalculatorData({
                            ...calculatorData,
                            paymentFrequency: value as "weekly" | "fortnightly" | "monthly",
                          })
                          setInterestShown(false)
                        }}>
                        <SelectTrigger className="w-full cursor-pointer">
                          <SelectValue>
                            {t(`calculator.paymentFrequency.${calculatorData.paymentFrequency}`)}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">{t("calculator.paymentFrequency.weekly")}</SelectItem>
                          <SelectItem value="fortnightly">{t("calculator.paymentFrequency.fortnightly")}</SelectItem>
                          <SelectItem value="monthly">{t("calculator.paymentFrequency.monthly")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1 flex flex-col ">
                      <Button type="button" className="w-full cursor-pointer" onClick={handleCalculator}>
                        {t("calculator.submitButton")}
                      </Button>
                    </div>
                  </form>

                  {interestShown && (
                    <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
                      <h3 className="font-semibold text-green-800 mb-2">{t("calculator.resultTitle")}</h3>
                      <p className="text-3xl font-bold text-slate-800">
                        {new Intl.NumberFormat(t("calculator.loanAmount.locale"), {
                          style: "currency",
                          currency: t("calculator.loanAmount.currency"),
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(calculatorData.monthlyPayments ?? 0)}
                        <span className="text-sm pl-2">
                          {t(`calculator.paymentFrequency.${calculatorData.paymentFrequency}`)}
                        </span>
                      </p>
                      <p className="text-sm text-slate-600 mt-2">{t("calculator.resultDescription")}</p>
                      <p className="text-xs text-slate-500 mt-2">{t("calculator.resultDisclaimer")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              {/* Banner Section - Placeholder for RTP */}
              <div className="relative rounded-2xl overflow-hidden bg-center bg-no-repeat bg-cover min-h-[400px] flex items-center bg-[linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.6)),url('https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop')]">
                <div className="relative z-10 p-8 text-white">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Our Home Loans?</h2>
                  <p className="text-lg md:text-xl mb-8 text-slate-200 leading-relaxed">
                    With over 50 years of trusted mortgage expertise, we combine competitive rates with personalised
                    service to make your home ownership dreams a reality.
                  </p>
                  <Button size="lg" className="bg-primary px-8 py-3">
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Learn More About Our Rates
                  </Button>
                </div>
              </div>

              {/* Apply Online */}
              <Card>
                <CardContent className="p-8">
                  <div className="text-center">
                    <div className="mx-auto mb-4 p-3 bg-primary rounded-full w-fit">
                      <Home className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-3">{t("readyToApply.title")}</h3>
                    <p className="text-slate-600 mb-6 leading-relaxed">{t("readyToApply.subTitle")}</p>
                    <div className="space-y-4">
                      <Link href="./home-loans/apply">
                        <Button
                          size="lg"
                          className="w-full cursor-pointer"
                          onClick={() => {
                            if (isCDPTrackingEnabled) {
                              track({
                                identifier: t("cdp.applyEventName"),
                                properties: {
                                  brand: brand.label,
                                  locale: locale.code,
                                },
                              })
                            }
                          }}>
                          {t("readyToApply.applyButton")}
                          <ChevronsRight className="h-5 w-5 mr-2" />
                        </Button>
                      </Link>

                      <div className="flex items-center justify-center gap-6 text-sm text-slate-600 pt-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span>{t("readyToApply.feature1")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span>{t("readyToApply.feature2")}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-green-200">
                        <p className="text-sm text-slate-600 mb-3">Prefer to speak with someone?</p>
                        <Button variant="outline" className="w-full cursor-pointer">
                          <Phone className="h-4 w-4 mr-2 " />
                          {t("readyToApply.speakButton")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Loan Types */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">{t("loanTypes.title")}</h2>
            <p className="text-xl text-slate-600">{t("loanTypes.description")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loanTypes.map((loanType, index) => (
              <Card key={index} className="card-hover border-slate-200">
                <CardHeader className="flex items-start gap-4">
                  <div className="p-3 bg-slate-100 rounded-lg">
                    <loanType.icon className="h-8 w-8 text-[var(--primary)]" />
                  </div>
                  <div>
                    <CardTitle className="text-slate-800">{loanType.title}</CardTitle>
                    <CardDescription className="text-slate-600">{loanType.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    {loanType.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
