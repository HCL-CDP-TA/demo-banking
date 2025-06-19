"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react"
import { FormFieldRenderer } from "./FormFieldRenderer"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Checkbox } from "./ui/checkbox"
import { useSiteContext } from "@/lib/SiteContext"

export function GenericFormStepper({
  config,
  initialFormData,
  storageKey,
  applicationIdPrefix,
  successRedirectPath,
}: {
  config: any
  initialFormData: any
  storageKey: string
  applicationIdPrefix: string
  successRedirectPath: string
}) {
  const t = useTranslations(config.translationNamespace)
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<Record<string, any>>(initialFormData)
  const [isLoading, setIsLoading] = useState(true)
  const { brand } = useSiteContext()

  // Load saved data from localStorage
  useEffect(() => {
    const loadSavedData = () => {
      try {
        const customerData = JSON.parse(localStorage.getItem(`${brand.key}_customer_data`) || "{}")
        if (customerData[storageKey]) {
          setFormData(prev => ({
            ...prev,
            ...customerData[storageKey],
            // Reset agreement fields
            ...Object.fromEntries(config.agreements.map((agreement: any) => [agreement.id, false])),
          }))
        }
      } catch (error) {
        console.error("Failed to load saved application data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSavedData()
  }, [config.agreements, storageKey])

  const totalSteps = config.steps.length
  const progress = (currentStep / totalSteps) * 100

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }))
  }

  const validateStep = (step: number): boolean => {
    const currentStepConfig = config.steps.find((s: any) => s.id === step)
    const newErrors: Record<string, string> = {}

    currentStepConfig?.sections?.forEach((section: any) => {
      section.fields.forEach((field: any) => {
        if (field.required && !formData[field.id]) {
          newErrors[field.id] = t(`errors.${field.id}Required`)
        }
      })
    })

    // Validate agreements if on last step
    if (step === totalSteps) {
      config.agreements.forEach((agreement: any) => {
        if (agreement.required && !formData[agreement.id]) {
          newErrors[agreement.id] = t(`errors.${agreement.id}Required`)
        }
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setIsSubmitting(true)

    setTimeout(() => {
      const customerData = JSON.parse(localStorage.getItem(`${brand.key}_customer_data`) || "{}")
      localStorage.setItem(
        `${brand.key}_customer_data`,
        JSON.stringify({
          ...customerData,
          [storageKey]: {
            ...formData,
            submittedAt: new Date().toISOString(),
            applicationId: `${applicationIdPrefix}${Date.now()}`,
          },
        }),
      )

      setIsSubmitting(false)
      router.push(successRedirectPath)
    }, 2000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mx-auto mb-4"></div>
          <p className="text-slate-700">{t("loading")}</p>
        </div>
      </div>
    )
  }

  const currentStepConfig = config.steps.find((step: any) => step.id === currentStep)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="bg-white border-b py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t(config.navigation.backKey)}
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{t(config.header.titleKey)}</h1>
              <p className="text-slate-600">
                {t(config.header.stepKey)} {currentStep} {t(config.header.ofKey)} {totalSteps}
              </p>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </section>

      {/* Form Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <currentStepConfig.icon className="h-6 w-6 text-slate-700" />
                <div>
                  <CardTitle className="text-xl">{t(currentStepConfig.titleKey)}</CardTitle>
                  <CardDescription>{t(currentStepConfig.descriptionKey)}</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {currentStep === totalSteps ? (
                <div className="space-y-6">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{t(config.review.alertKey)}</AlertDescription>
                  </Alert>

                  {/* Additional info textarea */}
                  {config.review.additionalInfo && (
                    <div className="space-y-2">
                      <Label htmlFor="additionalInfo">{t(config.review.additionalInfoKey)}</Label>
                      <Textarea
                        id="additionalInfo"
                        value={formData.additionalInfo}
                        onChange={e => handleInputChange("additionalInfo", e.target.value)}
                        placeholder={t(config.review.additionalInfoPlaceholderKey)}
                        rows={4}
                      />
                    </div>
                  )}

                  {/* Agreements */}
                  <div className="space-y-4">
                    {config.agreements.map((agreement: any) => (
                      <div key={agreement.id} className="flex items-start space-x-2">
                        <Checkbox
                          id={agreement.id}
                          checked={formData[agreement.id]}
                          onCheckedChange={checked => handleInputChange(agreement.id, checked)}
                          className={errors[agreement.id] ? "border-red-500" : ""}
                        />
                        <Label htmlFor={agreement.id} className="text-sm leading-relaxed">
                          {t(agreement.labelKey)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                currentStepConfig.sections.map((section: any) => (
                  <div key={section.titleKey} className="space-y-6">
                    {section.titleKey && (
                      <h3 className="text-lg font-semibold text-slate-800">{t(section.titleKey)}</h3>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {section.fields.map((field: any) => (
                        <div key={field.id} className={`space-y-2 ${field.gridCols === 3 ? "md:col-span-3" : ""}`}>
                          <Label htmlFor={field.id}>
                            {t(field.labelKey)} {field.required && "*"}
                          </Label>
                          <FormFieldRenderer
                            field={field}
                            value={formData[field.id]}
                            onChange={(value: any) => handleInputChange(field.id, value)}
                            error={errors[field.id]}
                            t={t}
                          />
                          {errors[field.id] && <p className="text-sm text-red-600">{errors[field.id]}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  {t(config.navigation.previousKey)}
                </Button>

                {currentStep < totalSteps ? (
                  <Button onClick={handleNext} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800">
                    {t(config.navigation.nextKey)}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                    {isSubmitting ? t(config.navigation.submittingKey) : t(config.navigation.submitKey)}
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
