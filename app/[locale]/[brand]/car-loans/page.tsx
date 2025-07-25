"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, CheckCircle, FileText, Star, ArrowRight, Car } from "lucide-react"
import Hero from "@/components/Hero"
import { useTranslations } from "next-intl"
import { Slider } from "@/components/ui/slider"
import Link from "next/link"
import { useSiteContext } from "@/lib/SiteContext"
import { CdpPageEvent, useCdp } from "@hcl-cdp-ta/hclcdp-web-sdk-react"
import { useCDPTracking } from "@/lib/hooks/useCDPTracking"
import { usePageMeta } from "@/lib/hooks/usePageMeta"

export default function CarLoansPage() {
  const { brand, locale, getPageNamespace } = useSiteContext()
  const pageNamespace = getPageNamespace()
  const t = useTranslations(pageNamespace)
  const { isCDPTrackingEnabled } = useCDPTracking()
  const [interestShown, setInterestShown] = useState(false)
  const { track } = useCdp()

  usePageMeta(t("meta.title"), t("meta.description"))

  interface CalculatorData {
    vehiclePrice: number
    deposit: number
    loanTerm: number
    vehicleType: string
    paymentFrequency: "weekly" | "fortnightly" | "monthly"
    balloonPayment: number
    payments?: number
    interestRate?: number
  }

  const defaultVehiclePrice = parseInt(t("calculator.vehiclePrice.default"))
  const defaultDepositPercentage = parseFloat(t("calculator.deposit.defaultPercentage"))
  const defaultDeposit = (defaultVehiclePrice * defaultDepositPercentage) / 100
  const defaultLoanTerm = parseInt(t("calculator.loanTerm.default"))
  const defaultBalloonPaymentPercentage = parseFloat(t("calculator.balloonPayment.defaultPercentage"))
  const defaultBalloonPayment = (defaultBalloonPaymentPercentage * (defaultVehiclePrice - defaultDeposit)) / 100
  const defaultPaymentFrequency = t("calculator.paymentFrequency.default") as "weekly" | "fortnightly" | "monthly"
  const defaultVehicleType = t("calculator.vehicleType.default")

  const [calculatorData, setCalculatorData] = useState<CalculatorData>({
    vehiclePrice: defaultVehiclePrice,
    deposit: defaultDeposit,
    loanTerm: defaultLoanTerm,
    vehicleType: defaultVehicleType,
    balloonPayment: defaultBalloonPayment,
    paymentFrequency: defaultPaymentFrequency,
  })

  const handleCalculator = () => {
    setInterestShown(true)
    setCalculatorData(prevData => ({
      ...prevData,
      payments: calculateRepayment(
        prevData.vehiclePrice,
        prevData.deposit,
        prevData.loanTerm,
        prevData.balloonPayment,
        prevData.paymentFrequency,
        prevData.vehicleType as "new" | "used" | "refinance",
      ),
    }))

    if (isCDPTrackingEnabled) {
      track({
        identifier: t("cdp.calculateEventName"),
        properties: {
          vehiclePrice: calculatorData.vehiclePrice,
          deposit: calculatorData.deposit,
          loanTerm: calculatorData.loanTerm,
          vehicleType: calculatorData.vehicleType,
          paymentFrequency: calculatorData.paymentFrequency,
          balloonPayment: calculatorData.balloonPayment,
          payment: calculateRepayment(
            calculatorData.vehiclePrice,
            calculatorData.deposit,
            calculatorData.loanTerm,
            calculatorData.balloonPayment,
            calculatorData.paymentFrequency,
            calculatorData.vehicleType as "new" | "used" | "refinance",
          ).toFixed(2),
          interestRate: calculatorData.interestRate,
          vehicleTypeLabel: t(`calculator.vehicleType.${calculatorData.vehicleType}`),
          currency: t("calculator.currency"),
        },
      })
    }
  }

  function calculateRepayment(
    vehiclePrice: number,
    deposit: number,
    termMonths: number,
    balloon: number,
    paymentFrequency: "weekly" | "fortnightly" | "monthly",
    vehicleType: "new" | "used" | "refinance",
  ): number {
    const loanAmount = vehiclePrice - deposit - balloon

    // Calculate interest rate based on risk factors
    let baseRate = 8 // Base rate for new vehicles
    if (vehicleType === "used") baseRate += 1.75 // Higher risk for used vehicles
    if (vehicleType === "refinance") baseRate += 1.25 // Moderate risk for refinancing

    if (loanAmount < 5000) baseRate += 1.35 // Small loans increase risk
    else if (loanAmount > 50000) baseRate -= 1.25 // Large loans reduce risk

    const depositPercentage = (deposit / vehiclePrice) * 100
    if (depositPercentage < 20) baseRate += 1.85 // Lower deposit increases risk
    else if (depositPercentage > 40) baseRate -= 0.75 // Higher deposit reduces risk

    const balloonPercentage = (balloon / (vehiclePrice - deposit)) * 100
    if (balloonPercentage > 30) baseRate += 1.95 // Larger balloon increases risk

    switch (termMonths) {
      case 12:
        baseRate -= 1.35
        break
      case 24:
        baseRate -= 0.55
        break
      case 36:
        baseRate -= 0.15
        break
      case 48:
        baseRate += 0.15
        break
      case 60:
        baseRate += 0.45
        break
      default:
        break
    }

    const annualInterestRate = Math.min(Math.max(baseRate, 4), 12.75) // Clamp rate between 4% and 14.75%

    // Update calculator data with the calculated interest rate
    setCalculatorData(prevData => ({
      ...prevData,
      interestRate: annualInterestRate,
    }))

    const monthlyRate = annualInterestRate / 100 / 12
    const numberOfPayments =
      paymentFrequency === "weekly"
        ? termMonths * 4.33
        : paymentFrequency === "fortnightly"
        ? termMonths * 2.17
        : termMonths

    if (monthlyRate === 0) return loanAmount / numberOfPayments

    const adjustedRate =
      paymentFrequency === "weekly"
        ? monthlyRate / 4
        : paymentFrequency === "fortnightly"
        ? monthlyRate / 2
        : monthlyRate

    const factor = Math.pow(1 + adjustedRate, numberOfPayments)
    return (loanAmount * adjustedRate * factor) / (factor - 1)
  }

  function handleLearnMoreClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault() // Prevent default link behavior

    try {
      track({ identifier: t("cdp.learnMoreEventName") })
    } catch (error) {
      console.error("Error tracking Learn More event:", error)
    }

    const loanTypesSection = document.getElementById("loan-types-section")
    if (loanTypesSection) {
      loanTypesSection.scrollIntoView({ behavior: "smooth" })
    }
  }
  const handleCalculatorSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setInterestShown(true)

    const customerData = JSON.parse(localStorage.getItem(`${brand.key}_customer_data`) || "{}")
    localStorage.setItem(
      `${brand.key}_customer_data`,
      JSON.stringify({
        ...customerData,
        carLoanInterest: {
          vehiclePrice: calculatorData.vehiclePrice,
          downPayment: calculatorData.deposit,
          loanTerm: calculatorData.loanTerm,
          vehicleType: calculatorData.vehicleType,
          timestamp: new Date().toISOString(),
        },
      }),
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {isCDPTrackingEnabled && (
        <CdpPageEvent pageName={t("cdp.pageEventName")} pageProperties={{ brand: brand.label, locale: locale.code }} />
      )}
      <Hero title={t("hero.title")} subTitle={t("hero.subTitle")} cta={t("hero.cta")} imageUrl={t("hero.imageUrl")} />

      {/* Auto Loan Calculator */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="h-full flex flex-col">
              <h2 className="text-3xl font-bold text-slate-800 mb-6">{t("calculator.title")}</h2>
              <p className="text-slate-600 mb-8 text-lg">{t("calculator.subTitle")}</p>
              <p className="text-slate-600 mb-8 text-lg">
                <a
                  href="#loan-types-section"
                  onClick={handleLearnMoreClick}
                  className="text-primary font-semibold hover:underline">
                  {t("calculator.learnMore")}
                </a>
              </p>

              <Card className="border-slate-200 shadow-sm flex-1 flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <Calculator className="h-5 w-5" />
                    {t("calculator.cardTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <form onSubmit={handleCalculatorSubmit} className="space-y-6 flex-1 flex flex-col">
                    <div>
                      <Label htmlFor="vehiclePrice" className="text-slate-700">
                        {t("calculator.vehiclePrice.label")}
                        <span className="text-sm">
                          {`(${t("calculator.max")} 
                          ${new Intl.NumberFormat(t("calculator.locale"), {
                            style: "currency",
                            currency: t("calculator.currency"),
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(parseFloat(t("calculator.vehiclePrice.max")))})`}
                        </span>
                      </Label>
                      <Slider
                        defaultValue={[parseInt(t("calculator.vehiclePrice.default"))]}
                        min={parseFloat(t("calculator.vehiclePrice.min"))}
                        max={parseFloat(t("calculator.vehiclePrice.max"))}
                        step={parseFloat(t("calculator.vehiclePrice.step"))}
                        className="cursor-pointer py-3"
                        onChange={e => {
                          const newValue = parseFloat((e.target as HTMLInputElement).value)
                          setCalculatorData({
                            ...calculatorData,
                            vehiclePrice: newValue,
                            deposit: (newValue * defaultDepositPercentage) / 100,
                            balloonPayment:
                              ((newValue - (newValue * defaultDepositPercentage) / 100) *
                                defaultBalloonPaymentPercentage) /
                              100,
                          })
                          setInterestShown(false)
                        }}
                      />
                      <span className="text-3xl font-bold text-slate-600">
                        {new Intl.NumberFormat(t("calculator.locale"), {
                          style: "currency",
                          currency: t("calculator.currency"),
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(calculatorData.vehiclePrice)}
                      </span>
                    </div>

                    <div>
                      <Label htmlFor="downPayment" className="text-slate-700">
                        {t("calculator.deposit.label")}
                        <span className="text-sm">
                          {`(${t("calculator.max")} 
                          ${new Intl.NumberFormat(t("calculator.locale"), {
                            style: "currency",
                            currency: t("calculator.currency"),
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(
                            (calculatorData.vehiclePrice * parseFloat(t("calculator.deposit.maxPercentage"))) / 100,
                          )})`}
                        </span>
                      </Label>
                      <Slider
                        defaultValue={[
                          (calculatorData.vehiclePrice * parseFloat(t("calculator.deposit.defaultPercentage"))) / 100,
                        ]}
                        min={(calculatorData.vehiclePrice * parseFloat(t("calculator.deposit.minPercentage"))) / 100}
                        max={(calculatorData.vehiclePrice * parseFloat(t("calculator.deposit.maxPercentage"))) / 100}
                        step={parseFloat(t("calculator.deposit.step"))}
                        className="cursor-pointer py-3"
                        onChange={e => {
                          const newValue = parseFloat((e.target as HTMLInputElement).value)
                          setCalculatorData({
                            ...calculatorData,
                            deposit: newValue,
                            balloonPayment:
                              ((calculatorData.vehiclePrice - newValue) * defaultBalloonPaymentPercentage) / 100,
                          })
                          setInterestShown(false)
                        }}
                      />
                      <span className="text-3xl font-bold text-slate-600">
                        {new Intl.NumberFormat(t("calculator.locale"), {
                          style: "currency",
                          currency: t("calculator.currency"),
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(calculatorData.deposit)}
                        <span className="text-sm pl-2 font-normal">
                          ({((calculatorData.deposit / calculatorData.vehiclePrice) * 100).toFixed(0)}%)
                        </span>
                      </span>
                    </div>

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

                    <div className={t("calculator.balloonPayment.visible") == "true" ? "block" : "hidden"}>
                      <Label htmlFor="balloonPayment" className="text-slate-700">
                        {t("calculator.balloonPayment.label")}
                        <span className="text-sm">
                          {`(${t("calculator.max")} 
                          ${new Intl.NumberFormat(t("calculator.locale"), {
                            style: "currency",
                            currency: t("calculator.currency"),
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(
                            ((calculatorData.vehiclePrice - calculatorData.deposit) *
                              parseFloat(t("calculator.balloonPayment.maxPercentage"))) /
                              100,
                          )})`}
                        </span>
                      </Label>
                      <Slider
                        defaultValue={[
                          ((calculatorData.vehiclePrice - calculatorData.deposit) *
                            parseFloat(t("calculator.balloonPayment.defaultPercentage"))) /
                            100,
                        ]}
                        min={
                          ((calculatorData.vehiclePrice - calculatorData.deposit) *
                            parseFloat(t("calculator.balloonPayment.minPercentage"))) /
                          100
                        }
                        max={
                          ((calculatorData.vehiclePrice - calculatorData.deposit) *
                            parseFloat(t("calculator.balloonPayment.maxPercentage"))) /
                          100
                        }
                        step={parseFloat(t("calculator.balloonPayment.step"))}
                        className="cursor-pointer py-3"
                        onChange={e => {
                          setCalculatorData({
                            ...calculatorData,
                            balloonPayment: parseFloat((e.target as HTMLInputElement).value),
                          })
                          setInterestShown(false)
                        }}
                      />
                      <span className="text-3xl font-bold text-slate-600">
                        {new Intl.NumberFormat(t("calculator.locale"), {
                          style: "currency",
                          currency: t("calculator.currency"),
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(calculatorData.balloonPayment)}
                        <span className="text-sm pl-2 font-normal">
                          (
                          {(
                            (calculatorData.balloonPayment / (calculatorData.vehiclePrice - calculatorData.deposit)) *
                            100
                          ).toFixed(0)}
                          %)
                        </span>
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

                    <div>
                      <Label htmlFor="vehicleType" className="text-slate-700">
                        {t("calculator.vehicleType.label")}
                      </Label>
                      <Select
                        value={calculatorData.vehicleType}
                        onValueChange={value => setCalculatorData({ ...calculatorData, vehicleType: value })}>
                        <SelectTrigger className="mt-2 w-full cursor-pointer">
                          <SelectValue>{t(`calculator.vehicleType.${calculatorData.vehicleType}`)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">{t("calculator.vehicleType.new")}</SelectItem>
                          <SelectItem value="used">{t("calculator.vehicleType.used")}</SelectItem>
                          <SelectItem value="refinance">{t("calculator.vehicleType.refinance")}</SelectItem>
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
                        {calculatorData.loanTerm}
                        {" x "}
                        {new Intl.NumberFormat(t("calculator.locale"), {
                          style: "currency",
                          currency: t("calculator.currency"),
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(calculatorData.payments ?? 0)}
                        <span className="text-sm pl-2">
                          {t(`calculator.paymentFrequency.${calculatorData.paymentFrequency}`)}{" "}
                          {t("calculator.installments")}
                        </span>
                      </p>
                      {calculatorData.balloonPayment > 0 && (
                        <>
                          <p className="font-bold text-slate-600 mt-2">
                            {t("calculator.balloonPayment.paymentMessage")}
                            {new Intl.NumberFormat(t("calculator.locale"), {
                              style: "currency",
                              currency: t("calculator.currency"),
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(calculatorData.balloonPayment)}
                          </p>
                        </>
                      )}
                      <p className="text-sm text-slate-600 mt-2">
                        {t("calculator.resultDescription")}
                        <span className="font-bold">
                          {calculatorData.interestRate?.toFixed(2)}% {t("calculator.APR")}
                        </span>
                      </p>
                      <p className="text-sm text-slate-600 mt-2">
                        {t("calculator.totalCost")}{" "}
                        <span className="font-bold">
                          {new Intl.NumberFormat(t("calculator.locale"), {
                            style: "currency",
                            currency: t("calculator.currency"),
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(
                            calculatorData.balloonPayment + calculatorData.loanTerm * (calculatorData.payments ?? 0),
                          )}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500 mt-2">{t("calculator.resultDisclaimer")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="h-full flex flex-col">
              {/* Banner Section - Placeholder for RTP */}
              <div className="mb-6 relative rounded-2xl overflow-hidden bg-center bg-no-repeat bg-cover min-h-[400px] flex items-center bg-[linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.6)),url('https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop')]">
                <div className="relative z-10 p-8 text-white">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Our Auto Loans?</h2>
                  <p className="text-lg md:text-xl mb-8 text-slate-200 leading-relaxed">
                    Get competitive rates, flexible terms, and fast approval to drive away in your dream car today.
                  </p>
                  <Button size="lg">
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Learn More About Our Rates
                  </Button>
                </div>
              </div>

              {/* Apply Section */}
              <Card className="border-slate-200 shadow-sm flex-shrink-0">
                <CardHeader className="text-center">
                  <CardTitle>
                    <div className="mx-auto mb-4 p-3 bg-primary rounded-full w-fit">
                      <Car className="h-8 w-8 text-primary-foreground" />
                    </div>
                  </CardTitle>
                  <CardTitle className="text-2xl text-slate-800">{t("readyToApply.title")}</CardTitle>
                  <CardDescription className="text-slate-600">{t("readyToApply.subTitle")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-slate-800">{t("readyToApply.stats.stat1.title")}</div>
                      <div className="text-sm text-slate-600">{t("readyToApply.stats.stat1.subTitle")}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-800">{t("readyToApply.stats.stat2.title")}</div>
                      <div className="text-sm text-slate-600">{t("readyToApply.stats.stat2.subTitle")}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-800">{t("readyToApply.stats.stat3.title")}</div>
                      <div className="text-sm text-slate-600">{t("readyToApply.stats.stat3.subTitle")}</div>
                    </div>
                  </div>

                  {/* Application Benefits */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-800 text-center">{t("readyToApply.benefits.title")}</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-slate-600">{t("readyToApply.benefits.feature1")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-slate-600">{t("readyToApply.benefits.feature2")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-slate-600">{t("readyToApply.benefits.feature3")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-slate-600">{t("readyToApply.benefits.feature4")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Reviews */}
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-sm text-slate-600 ml-2">{t("readyToApply.reviews.rating")}</span>
                    </div>
                    <p className="text-sm text-slate-600 italic">{t("readyToApply.reviews.quote")}</p>
                    <p className="text-xs text-slate-500 mt-1">{t("readyToApply.reviews.author")}</p>
                  </div>

                  {/* Required Documents */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {t("readyToApply.documents.title")}
                    </h4>
                    <div className="text-sm text-slate-600 space-y-1">
                      <div>• {t("readyToApply.documents.item1")}</div>
                      <div>• {t("readyToApply.documents.item2")}</div>
                      <div>• {t("readyToApply.documents.item3")}</div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link href="./car-loans/apply">
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
                    </Button>
                  </Link>

                  <p className="text-xs text-slate-500 text-center">{t("readyToApply.footer")}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle Types */}
      <section id="vehicle-types-section" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">{t("vehicleTypes.title")}</h2>
            <p className="text-xl text-slate-600">{t("vehicleTypes.description")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {["item1", "item2", "item3"].map((key, index) => (
              <Card key={index} className="card-hover border-slate-200">
                <CardHeader>
                  <CardTitle className="text-slate-800">{t(`vehicleTypes.items.${key}.title`)}</CardTitle>
                  <CardDescription className="text-slate-600">
                    {t(`vehicleTypes.items.${key}.description`)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm mb-6">
                    {["feature1", "feature2", "feature3", "feature4"].map((featureKey, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-slate-600">{t(`vehicleTypes.items.${key}.features.${featureKey}`)}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
