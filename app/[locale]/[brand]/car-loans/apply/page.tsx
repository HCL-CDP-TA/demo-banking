"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Car, User, FileText, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react"
import { useSiteContext } from "@/lib/SiteContext"
import { CdpPageEvent, useCdp } from "@hcl-cdp-ta/hclcdp-web-sdk-react"
import { useCDPTracking } from "@/lib/hooks/useCDPTracking"
import { usePageMeta } from "@/lib/hooks/usePageMeta"

// Initial form state
const initialFormData = {
  // Personal Information
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  ssn: "",
  driversLicense: "",
  driversLicenseState: "",

  // Address Information
  address: "",
  city: "",
  state: "",
  zipCode: "",
  yearsAtAddress: "",
  monthsAtAddress: "",
  housingStatus: "",
  monthlyRent: "",

  // Employment Information
  employmentStatus: "",
  employer: "",
  jobTitle: "",
  workPhone: "",
  yearsAtJob: "",
  monthsAtJob: "",
  annualIncome: "",
  otherIncome: "",

  // Financial Information
  monthlyDebts: "",
  checkingBalance: "",
  savingsBalance: "",
  creditScore: "",

  // Vehicle Information
  vehicleType: "",
  vehicleYear: "",
  vehicleMake: "",
  vehicleModel: "",
  vehicleMileage: "",
  vehiclePrice: "",
  downPayment: "",
  tradeInValue: "",
  dealerName: "",
  dealerCity: "",

  // Loan Information
  loanAmount: "",
  loanTerm: "",

  // Additional Information
  additionalInfo: "",

  // Agreements
  agreeToTerms: false,
  agreeToCredit: false,
  agreeToContact: false,

  submittedAt: "",
  applicationId: "",
}

export default function CarLoanApplicationPage() {
  const { getPageNamespace, brand, locale } = useSiteContext()
  const pageNamespace = getPageNamespace()
  const t = useTranslations(pageNamespace)
  const { track } = useCdp()
  const { isCDPTrackingEnabled } = useCDPTracking()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState(initialFormData)
  const [isLoading, setIsLoading] = useState(true)

  usePageMeta(t("meta.title"), t("meta.description"))

  // Function to save data to localStorage
  const saveFormData = (dataToSave: typeof initialFormData) => {
    try {
      const customerData = JSON.parse(localStorage.getItem(`${brand.key}_customer_data`) || "{}")
      localStorage.setItem(
        `${brand.key}_customer_data`,
        JSON.stringify({
          ...customerData,
          carLoanApplication: dataToSave,
        }),
      )
    } catch (error) {
      console.error("Failed to save application data to localStorage:", error)
    }
  }

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const loadSavedData = () => {
      try {
        const customerData = JSON.parse(localStorage.getItem(`${brand.key}_customer_data`) || "{}")
        if (customerData.carLoanApplication) {
          // Merge saved data with initial form data
          setFormData(prev => ({
            ...prev,
            ...customerData.carLoanApplication,
            // Don't restore these fields from saved data
            agreeToTerms: false,
            agreeToCredit: false,
            agreeToContact: false,
          }))
        }
      } catch (error) {
        console.error("Failed to load saved application data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSavedData()
  }, []) // Empty dependency array means this runs once on mount

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    //
    // switch (step) {
    //   case 1:
    //     if (!formData.firstName) newErrors.firstName = t("errors.firstNameRequired")
    //     if (!formData.lastName) newErrors.lastName = t("errors.lastNameRequired")
    //     if (!formData.email) newErrors.email = t("errors.emailRequired")
    //     if (!formData.phone) newErrors.phone = t("errors.phoneRequired")
    //     if (!formData.dateOfBirth) newErrors.dateOfBirth = t("errors.dateOfBirthRequired")
    //     if (!formData.ssn) newErrors.ssn = t("errors.ssnRequired")
    //     if (!formData.driversLicense) newErrors.driversLicense = t("errors.driversLicenseRequired")
    //     break
    //   case 2:
    //     if (!formData.employmentStatus) newErrors.employmentStatus = t("errors.employmentStatusRequired")
    //     if (!formData.annualIncome) newErrors.annualIncome = t("errors.annualIncomeRequired")
    //     break
    //   case 3:
    //     if (!formData.vehicleType) newErrors.vehicleType = t("errors.vehicleTypeRequired")
    //     if (!formData.vehiclePrice) newErrors.vehiclePrice = t("errors.vehiclePriceRequired")
    //     if (!formData.loanAmount) newErrors.loanAmount = t("errors.loanAmountRequired")
    //     break
    //   case 4:
    //     if (!formData.agreeToTerms) newErrors.agreeToTerms = t("errors.agreeToTermsRequired")
    //     if (!formData.agreeToCredit) newErrors.agreeToCredit = t("errors.agreeToCreditRequired")
    //     break
    // }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (isCDPTrackingEnabled) {
        const nonEmptyFormData = Object.fromEntries(Object.entries(formData).filter(([_, value]) => value !== ""))

        track({
          identifier: `${t("cdp.stepEventName")}_${currentStep}`,
          properties: { brand: brand.key, locale: locale.code, ...nonEmptyFormData },
        })
      }

      saveFormData(formData) // Save data when going to the next step
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      saveFormData({
        // Save final data on submit
        ...formData,
        submittedAt: new Date().toISOString(),
        applicationId: `CL${Date.now()}`,
      })

      setIsSubmitting(false)
      router.push("./application-submitted")
    }, 2000)
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return t("steps.step1.title")
      case 2:
        return t("steps.step2.title")
      case 3:
        return t("steps.step3.title")
      case 4:
        return t("steps.step4.title")
      default:
        return ""
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return t("steps.step1.description")
      case 2:
        return t("steps.step2.description")
      case 3:
        return t("steps.step3.description")
      case 4:
        return t("steps.step4.description")
      default:
        return ""
    }
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

  return (
    <div className="min-h-screen bg-slate-50">
      {isCDPTrackingEnabled && (
        <CdpPageEvent pageName={pageNamespace} pageProperties={{ brand: brand.label, locale: locale.code }} />
      )}

      {/* Header */}
      <section className="bg-white border-b py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t("navigation.back")}
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{t("header.title")}</h1>
              <p className="text-slate-600">
                {t("header.step")} {currentStep} {t("header.of")} {totalSteps}
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
                {currentStep === 1 && <User className="h-6 w-6 text-slate-700" />}
                {currentStep === 2 && <FileText className="h-6 w-6 text-slate-700" />}
                {currentStep === 3 && <Car className="h-6 w-6 text-slate-700" />}
                {currentStep === 4 && <CheckCircle className="h-6 w-6 text-slate-700" />}
                <div>
                  <CardTitle className="text-xl">{getStepTitle()}</CardTitle>
                  <CardDescription>{getStepDescription()}</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Step 1: Personal & Address Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t("personal.firstName")} </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={e => handleInputChange("firstName", e.target.value)}
                        className={errors.firstName ? "border-red-500" : ""}
                      />
                      {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t("personal.lastName")} </Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={e => handleInputChange("lastName", e.target.value)}
                        className={errors.lastName ? "border-red-500" : ""}
                      />
                      {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">{t("personal.email")} </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={e => handleInputChange("email", e.target.value)}
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t("personal.phone")} </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={e => handleInputChange("phone", e.target.value)}
                        className={errors.phone ? "border-red-500" : ""}
                      />
                      {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">{t("personal.dateOfBirth")} </Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={e => handleInputChange("dateOfBirth", e.target.value)}
                        className={errors.dateOfBirth ? "border-red-500" : ""}
                      />
                      {errors.dateOfBirth && <p className="text-sm text-red-600">{errors.dateOfBirth}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ssn">{t("personal.ssn")} </Label>
                      <Input
                        id="ssn"
                        value={formData.ssn}
                        onChange={e => handleInputChange("ssn", e.target.value)}
                        placeholder={t("personal.ssnPlaceholder")}
                        className={errors.ssn ? "border-red-500" : ""}
                      />
                      {errors.ssn && <p className="text-sm text-red-600">{errors.ssn}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="driversLicense">{t("personal.driversLicense")} </Label>
                      <Input
                        id="driversLicense"
                        value={formData.driversLicense}
                        onChange={e => handleInputChange("driversLicense", e.target.value)}
                        className={errors.driversLicense ? "border-red-500" : ""}
                      />
                      {errors.driversLicense && <p className="text-sm text-red-600">{errors.driversLicense}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="driversLicenseState">{t("personal.driversLicenseState")}</Label>
                      <Input
                        id="driversLicenseState"
                        value={formData.driversLicenseState}
                        onChange={e => handleInputChange("driversLicenseState", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">{t("address.title")}</h3>
                    <div className="space-y-2">
                      <Label htmlFor="address">{t("address.streetAddress")}</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={e => handleInputChange("address", e.target.value)}
                        placeholder={t("address.streetAddressPlaceholder")}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">{t("address.city")}</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={e => handleInputChange("city", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">{t("address.state")}</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={e => handleInputChange("state", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">{t("address.zipCode")}</Label>
                        <Input
                          id="zipCode"
                          value={formData.zipCode}
                          onChange={e => handleInputChange("zipCode", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="yearsAtAddress">{t("address.yearsAtAddress")}</Label>
                        <Input
                          id="yearsAtAddress"
                          type="number"
                          value={formData.yearsAtAddress}
                          onChange={e => handleInputChange("yearsAtAddress", e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="monthsAtAddress">{t("address.monthsAtAddress")}</Label>
                        <Input
                          id="monthsAtAddress"
                          type="number"
                          value={formData.monthsAtAddress}
                          onChange={e => handleInputChange("monthsAtAddress", e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("address.housingStatus")}</Label>
                        <Select
                          value={formData.housingStatus}
                          onValueChange={value => handleInputChange("housingStatus", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder={t("address.housingStatusPlaceholder")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="own">{t("address.housingStatusOptions.own")}</SelectItem>
                            <SelectItem value="rent">{t("address.housingStatusOptions.rent")}</SelectItem>
                            <SelectItem value="other">{t("address.housingStatusOptions.other")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {formData.housingStatus === "rent" && (
                      <div className="space-y-2">
                        <Label htmlFor="monthlyRent">{t("address.monthlyRent")}</Label>
                        <Input
                          id="monthlyRent"
                          type="number"
                          value={formData.monthlyRent}
                          onChange={e => handleInputChange("monthlyRent", e.target.value)}
                          placeholder="1200"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Employment & Financial Information */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>{t("employment.status")} </Label>
                    <Select
                      value={formData.employmentStatus}
                      onValueChange={value => handleInputChange("employmentStatus", value)}>
                      <SelectTrigger className={errors.employmentStatus ? "border-red-500" : ""}>
                        <SelectValue placeholder={t("employment.statusPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={t("employment.statusOptions.employed")}>
                          {t("employment.statusOptions.employed")}
                        </SelectItem>
                        <SelectItem value={t("employment.statusOptions.selfEmployed")}>
                          {t("employment.statusOptions.selfEmployed")}
                        </SelectItem>
                        <SelectItem value={t("employment.statusOptions.retired")}>
                          {t("employment.statusOptions.retired")}
                        </SelectItem>
                        <SelectItem value={t("employment.statusOptions.unemployed")}>
                          {t("employment.statusOptions.unemployed")}
                        </SelectItem>
                        <SelectItem value={t("employment.statusOptions.student")}>
                          {t("employment.statusOptions.student")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.employmentStatus && <p className="text-sm text-red-600">{errors.employmentStatus}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employer">{t("employment.employer")}</Label>
                      <Input
                        id="employer"
                        value={formData.employer}
                        onChange={e => handleInputChange("employer", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">{t("employment.jobTitle")}</Label>
                      <Input
                        id="jobTitle"
                        value={formData.jobTitle}
                        onChange={e => handleInputChange("jobTitle", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="yearsAtJob">{t("employment.yearsAtJob")}</Label>
                      <Input
                        id="yearsAtJob"
                        type="number"
                        value={formData.yearsAtJob}
                        onChange={e => handleInputChange("yearsAtJob", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthsAtJob">{t("employment.monthsAtJob")}</Label>
                      <Input
                        id="monthsAtJob"
                        type="number"
                        value={formData.monthsAtJob}
                        onChange={e => handleInputChange("monthsAtJob", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workPhone">{t("employment.workPhone")}</Label>
                      <Input
                        id="workPhone"
                        type="tel"
                        value={formData.workPhone}
                        onChange={e => handleInputChange("workPhone", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="annualIncome">{t("financial.annualIncome")} </Label>
                      <Input
                        id="annualIncome"
                        type="number"
                        value={formData.annualIncome}
                        onChange={e => handleInputChange("annualIncome", e.target.value)}
                        className={errors.annualIncome ? "border-red-500" : ""}
                      />
                      {errors.annualIncome && <p className="text-sm text-red-600">{errors.annualIncome}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="otherIncome">{t("financial.otherIncome")}</Label>
                      <Input
                        id="otherIncome"
                        type="number"
                        value={formData.otherIncome}
                        onChange={e => handleInputChange("otherIncome", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="monthlyDebts">{t("financial.monthlyDebts")}</Label>
                      <Input
                        id="monthlyDebts"
                        type="number"
                        value={formData.monthlyDebts}
                        onChange={e => handleInputChange("monthlyDebts", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkingBalance">{t("financial.checkingBalance")}</Label>
                      <Input
                        id="checkingBalance"
                        type="number"
                        value={formData.checkingBalance}
                        onChange={e => handleInputChange("checkingBalance", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="savingsBalance">{t("financial.savingsBalance")}</Label>
                      <Input
                        id="savingsBalance"
                        type="number"
                        value={formData.savingsBalance}
                        onChange={e => handleInputChange("financial.savingsBalance", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="creditScore">{t("financial.creditScore")}</Label>
                    <Input
                      id="creditScore"
                      type="number"
                      value={formData.creditScore}
                      onChange={e => handleInputChange("creditScore", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Vehicle & Loan Information */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>{t("vehicle.type")} </Label>
                    <Select
                      value={formData.vehicleType}
                      onValueChange={value => handleInputChange("vehicleType", value)}>
                      <SelectTrigger className={errors.vehicleType ? "border-red-500" : ""}>
                        <SelectValue placeholder={t("vehicle.typePlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">{t("vehicle.typeOptions.new")}</SelectItem>
                        <SelectItem value="used">{t("vehicle.typeOptions.used")}</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.vehicleType && <p className="text-sm text-red-600">{errors.vehicleType}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicleYear">{t("vehicle.year")}</Label>
                      <Input
                        id="vehicleYear"
                        type="number"
                        value={formData.vehicleYear}
                        onChange={e => handleInputChange("vehicleYear", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehicleMake">{t("vehicle.make")}</Label>
                      <Input
                        id="vehicleMake"
                        value={formData.vehicleMake}
                        onChange={e => handleInputChange("vehicleMake", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicleModel">{t("vehicle.model")}</Label>
                      <Input
                        id="vehicleModel"
                        value={formData.vehicleModel}
                        onChange={e => handleInputChange("vehicleModel", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehicleMileage">{t("vehicle.mileage")}</Label>
                      <Input
                        id="vehicleMileage"
                        type="number"
                        value={formData.vehicleMileage}
                        onChange={e => handleInputChange("vehicleMileage", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehiclePrice">{t("vehicle.price")} </Label>
                      <Input
                        id="vehiclePrice"
                        type="number"
                        value={formData.vehiclePrice}
                        onChange={e => handleInputChange("vehiclePrice", e.target.value)}
                        className={errors.vehiclePrice ? "border-red-500" : ""}
                      />
                      {errors.vehiclePrice && <p className="text-sm text-red-600">{errors.vehiclePrice}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="downPayment">{t("loan.downPayment")}</Label>
                      <Input
                        id="downPayment"
                        type="number"
                        value={formData.downPayment}
                        onChange={e => handleInputChange("downPayment", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="loanAmount">{t("loan.amount")} </Label>
                      <Input
                        id="loanAmount"
                        type="number"
                        value={formData.loanAmount}
                        onChange={e => handleInputChange("loanAmount", e.target.value)}
                        className={errors.loanAmount ? "border-red-500" : ""}
                      />
                      {errors.loanAmount && <p className="text-sm text-red-600">{errors.loanAmount}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>{t("loan.term")}</Label>
                      <Select value={formData.loanTerm} onValueChange={value => handleInputChange("loanTerm", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("loan.termPlaceholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12">{t("loan.termOptions.months12")}</SelectItem>
                          <SelectItem value="24">{t("loan.termOptions.months24")}</SelectItem>
                          <SelectItem value="36">{t("loan.termOptions.months36")}</SelectItem>
                          <SelectItem value="48">{t("loan.termOptions.months48")}</SelectItem>
                          <SelectItem value="60">{t("loan.termOptions.months60")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tradeInValue">{t("loan.tradeInValue")}</Label>
                      <Input
                        id="tradeInValue"
                        type="number"
                        value={formData.tradeInValue}
                        onChange={e => handleInputChange("tradeInValue", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dealerName">{t("dealer.name")}</Label>
                      <Input
                        id="dealerName"
                        value={formData.dealerName}
                        onChange={e => handleInputChange("dealerName", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dealerCity">{t("dealer.city")}</Label>
                    <Input
                      id="dealerCity"
                      value={formData.dealerCity}
                      onChange={e => handleInputChange("dealerCity", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Review & Submit */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{t("review.alert")}</AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="additionalInfo">{t("review.additionalInfoLabel")}</Label>
                    <Textarea
                      id="additionalInfo"
                      value={formData.additionalInfo}
                      onChange={e => handleInputChange("additionalInfo", e.target.value)}
                      placeholder={t("review.additionalInfoLabelPlaceholder")}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={checked => handleInputChange("agreeToTerms", checked)}
                        className={errors.agreeToTerms ? "border-red-500" : ""}
                      />
                      <Label htmlFor="agreeToTerms" className="text-sm leading-relaxed">
                        {t("agreements.terms")}
                      </Label>
                    </div>
                    {errors.agreeToTerms && <p className="text-sm text-red-600">{errors.agreeToTerms}</p>}

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreeToCredit"
                        checked={formData.agreeToCredit}
                        onCheckedChange={checked => handleInputChange("agreeToCredit", checked)}
                        className={errors.agreeToCredit ? "border-red-500" : ""}
                      />
                      <Label htmlFor="agreeToCredit" className="text-sm leading-relaxed">
                        {t("agreements.credit")}
                      </Label>
                    </div>
                    {errors.agreeToCredit && <p className="text-sm text-red-600">{errors.agreeToCredit}</p>}

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreeToContact"
                        checked={formData.agreeToContact}
                        onCheckedChange={checked => handleInputChange("agreeToContact", checked)}
                      />
                      <Label htmlFor="agreeToContact" className="text-sm leading-relaxed">
                        {t("agreements.contact")}
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2 cursor-pointer">
                  <ArrowLeft className="h-4 w-4" />
                  {t("navigation.back")}
                </Button>

                {currentStep < totalSteps ? (
                  <Button onClick={handleNext} className="flex items-center gap-2 cursor-pointer">
                    {t("navigation.next")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 cursor-pointer">
                    {isSubmitting ? t("navigation.submitting") : t("navigation.submit")}
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
