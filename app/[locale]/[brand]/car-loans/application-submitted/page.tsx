"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl" // Import useTranslations

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Car, Clock, Phone, Mail, FileText, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useSiteContext } from "@/lib/SiteContext"
import { CdpPageEvent, useCdp } from "hclcdp-web-sdk-react"
import { useCDPTracking } from "@/lib/hooks/useCDPTracking"

export default function CarLoanApplicationSubmittedPage() {
  const router = useRouter()
  const [applicationId, setApplicationId] = useState("")
  const { brand, locale, getPageNamespace } = useSiteContext()
  const pageNamespace = getPageNamespace()
  const t = useTranslations(pageNamespace)
  const { isCDPTrackingEnabled } = useCDPTracking()
  const { track } = useCdp()

  useEffect(() => {
    // Get application data from localStorage
    const customerData = JSON.parse(localStorage.getItem(`${brand.key}_customer_data`) || "{}")
    if (customerData.carLoanApplication?.applicationId) {
      if (isCDPTrackingEnabled) {
        track({ identifier: t("cdp.conversionEventName"), properties: { ...customerData.carLoanApplication } })
      }
      setApplicationId(customerData.carLoanApplication.applicationId)
    } else {
      // Redirect if no application found
      // router.push("./car-loans")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-slate-50">
      {isCDPTrackingEnabled && (
        <CdpPageEvent pageName={t("cdp.pageEventName")} pageProperties={{ brand: brand.label, locale: locale.code }} />
      )}

      {/* Success Header */}
      <section className="bg-green-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto mb-6 p-4 bg-green-100 rounded-full w-fit">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-4">{t("successHeader.title")}</h1>
          <p className="text-xl text-slate-600 mb-6">{t("successHeader.description")}</p>
          {applicationId && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-green-200">
              <FileText className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-slate-700">
                {t("successHeader.applicationIdPrefix")} {applicationId}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Next Steps */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">{t("nextSteps.title")}</h2>
            <p className="text-xl text-slate-600">{t("nextSteps.description")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center border-slate-200">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">{t("nextSteps.within1HourCard.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">{t("nextSteps.within1HourCard.content")}</p>
              </CardContent>
            </Card>

            <Card className="text-center border-slate-200">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-yellow-100 rounded-full w-fit">
                  <FileText className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle className="text-lg">{t("nextSteps.sameDayCard.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">{t("nextSteps.sameDayCard.content")}</p>
              </CardContent>
            </Card>

            <Card className="text-center border-slate-200">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">{t("nextSteps.atPurchaseCard.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">{t("nextSteps.atPurchaseCard.content")}</p>
              </CardContent>
            </Card>
          </div>

          {/* Pre-Approval Benefits */}
          <Card className="border-slate-200 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                {t("preApprovalBenefits.title")}
              </CardTitle>
              <CardDescription>{t("preApprovalBenefits.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {(t.raw("preApprovalBenefits.benefitsList") as string[])
                    .slice(0, 3)
                    .map((benefit: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-slate-700">{benefit}</p>
                      </div>
                    ))}
                </div>
                <div className="space-y-3">
                  {(t.raw("preApprovalBenefits.benefitsList") as string[])
                    .slice(3)
                    .map((benefit: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-slate-700">{benefit}</p>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-slate-200 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                {t("contactInfo.title")}
              </CardTitle>
              <CardDescription>{t("contactInfo.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Phone className="h-5 w-5 text-slate-700" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{t("contactInfo.callUs.title")}</p>
                    <p className="text-slate-600">{t("contactInfo.callUs.number")}</p>
                    <p className="text-sm text-slate-500">{t("contactInfo.callUs.hours")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Mail className="h-5 w-5 text-slate-700" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{t("contactInfo.emailUs.title")}</p>
                    <p className="text-slate-600">{t("contactInfo.emailUs.address")}</p>
                    <p className="text-sm text-slate-500">{t("contactInfo.emailUs.response_time")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Information */}
          <Card className="border-slate-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-slate-800">{t("importantReminders.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {t.raw("importantReminders.remindersList").map((reminder: string, index: number) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-700">{reminder}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link
              href="../"
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 px-4 py-2 rounded-lg text-white">
              {t("actionButtons.returnHome")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="./car-loans"
              className="flex items-center gap-2 border border-slate-700 px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100">
              <Car className="h-4 w-4" />
              {t("actionButtons.learnMoreAutoLoans")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
