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
import { Home, User, FileText, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react"
import { useSiteContext } from "@/lib/SiteContext"

// Initial form state
const initialFormData = {
  // Personal Information
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  ssn: "",
  maritalStatus: "",
  dependents: "",

  // Employment Information
  employmentStatus: "",
  employer: "",
  jobTitle: "",
  workPhone: "",
  yearsAtJob: "",
  monthsAtJob: "",
  annualIncome: "",
  otherIncome: "",
  otherIncomeSource: "",

  // Financial Information
  monthlyRent: "",
  assets: "",
  checkingBalance: "",
  savingsBalance: "",
  retirementBalance: "",
  creditScore: "",
  monthlyDebts: "",

  // Loan Information
  loanAmount: "",
  downPayment: "",
  propertyType: "",
  propertyUse: "",
  propertyAddress: "",
  propertyCity: "",
  propertyState: "",
  propertyZip: "",
  loanPurpose: "",

  // Additional Information
  hasRealtor: false,
  realtorName: "",
  realtorPhone: "",
  additionalInfo: "",

  // Agreements
  agreeToTerms: false,
  agreeToCredit: false,
  agreeToContact: false,

  submittedAt: "",
  applicationId: "",
}

export default function HomeLoanApplicationPage() {
  const { brand, getPageNamespace } = useSiteContext()
  const t = useTranslations(getPageNamespace())
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState(initialFormData)
  const [isLoading, setIsLoading] = useState(true)

  // Function to save data to localStorage
  const saveFormData = (dataToSave: typeof initialFormData) => {
    try {
      const customerData = JSON.parse(localStorage.getItem(`${brand.key}_customer_data`) || "{}")
      localStorage.setItem(
        `${brand.key}_customer_data`,
        JSON.stringify({
          ...customerData,
          homeLoanApplication: dataToSave,
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
        if (customerData.homeLoanApplication) {
          // Merge saved data with initial form data
          setFormData(prev => ({
            ...prev,
            ...customerData.homeLoanApplication,
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

    switch (step) {
      case 1:
        if (!formData.firstName) newErrors.firstName = t("errors.firstNameRequired")
        if (!formData.lastName) newErrors.lastName = t("errors.lastNameRequired")
        if (!formData.email) newErrors.email = t("errors.emailRequired")
        if (!formData.phone) newErrors.phone = t("errors.phoneRequired")
        if (!formData.dateOfBirth) newErrors.dateOfBirth = t("errors.dateOfBirthRequired")
        if (!formData.ssn) newErrors.ssn = t("errors.ssnRequired")
        break
      case 2:
        if (!formData.employmentStatus) newErrors.employmentStatus = t("errors.employmentStatusRequired")
        if (!formData.annualIncome) newErrors.annualIncome = t("errors.annualIncomeRequired")
        break
      case 3:
        if (!formData.loanAmount) newErrors.loanAmount = t("errors.loanAmountRequired")
        if (!formData.downPayment) newErrors.downPayment = t("errors.downPaymentRequired")
        if (!formData.propertyType) newErrors.propertyType = t("errors.propertyTypeRequired")
        break
      case 4:
        if (!formData.agreeToTerms) newErrors.agreeToTerms = t("errors.agreeToTermsRequired")
        if (!formData.agreeToCredit) newErrors.agreeToCredit = t("errors.agreeToCreditRequired")
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
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
        applicationId: `HL${Date.now()}`,
      })

      setIsSubmitting(false)
      router.push("./application-submitted")
    }, 2000)
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return t("steps.personalInfo.title")
      case 2:
        return t("steps.employmentInfo.title")
      case 3:
        return t("steps.loanInfo.title")
      case 4:
        return t("steps.review.title")
      default:
        return ""
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return t("steps.personalInfo.description")
      case 2:
        return t("steps.employmentInfo.description")
      case 3:
        return t("steps.loanInfo.description")
      case 4:
        return t("steps.review.description")
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
      {/* Header */}
      <section className="bg-white border-b py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t("backButton")}
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{t("title")}</h1>
              <p className="text-slate-600">{t("stepIndicator", { current: currentStep, total: totalSteps })}</p>
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
                {currentStep === 3 && <Home className="h-6 w-6 text-slate-700" />}
                {currentStep === 4 && <CheckCircle className="h-6 w-6 text-slate-700" />}
                <div>
                  <CardTitle className="text-xl">{getStepTitle()}</CardTitle>
                  <CardDescription>{getStepDescription()}</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t("form.firstName.label")} *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={e => handleInputChange("firstName", e.target.value)}
                        className={errors.firstName ? "border-red-500" : ""}
                      />
                      {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t("form.lastName.label")} *</Label>
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
                      <Label htmlFor="email">{t("form.email.label")} *</Label>
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
                      <Label htmlFor="phone">{t("form.phone.label")} *</Label>
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
                      <Label htmlFor="dateOfBirth">{t("form.dateOfBirth.label")} *</Label>
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
                      <Label htmlFor="ssn">{t("form.ssn.label")} *</Label>
                      <Input
                        id="ssn"
                        value={formData.ssn}
                        onChange={e => handleInputChange("ssn", e.target.value)}
                        placeholder={t("form.ssn.placeholder")}
                        className={errors.ssn ? "border-red-500" : ""}
                      />
                      {errors.ssn && <p className="text-sm text-red-600">{errors.ssn}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("form.maritalStatus.label")}</Label>
                      <Select
                        value={formData.maritalStatus}
                        onValueChange={value => handleInputChange("maritalStatus", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("form.maritalStatus.placeholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">{t("form.maritalStatus.options.single")}</SelectItem>
                          <SelectItem value="married">{t("form.maritalStatus.options.married")}</SelectItem>
                          <SelectItem value="divorced">{t("form.maritalStatus.options.divorced")}</SelectItem>
                          <SelectItem value="widowed">{t("form.maritalStatus.options.widowed")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dependents">{t("form.dependents.label")}</Label>
                      <Input
                        id="dependents"
                        type="number"
                        value={formData.dependents}
                        onChange={e => handleInputChange("dependents", e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Employment & Financial */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>{t("form.employmentStatus.label")} *</Label>
                    <Select
                      value={formData.employmentStatus}
                      onValueChange={value => handleInputChange("employmentStatus", value)}>
                      <SelectTrigger className={errors.employmentStatus ? "border-red-500" : ""}>
                        <SelectValue placeholder={t("form.employmentStatus.placeholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employed">{t("form.employmentStatus.options.employed")}</SelectItem>
                        <SelectItem value="self-employed">{t("form.employmentStatus.options.selfEmployed")}</SelectItem>
                        <SelectItem value="retired">{t("form.employmentStatus.options.retired")}</SelectItem>
                        <SelectItem value="unemployed">{t("form.employmentStatus.options.unemployed")}</SelectItem>
                        <SelectItem value="student">{t("form.employmentStatus.options.student")}</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.employmentStatus && <p className="text-sm text-red-600">{errors.employmentStatus}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employer">{t("form.employer.label")}</Label>
                      <Input
                        id="employer"
                        value={formData.employer}
                        onChange={e => handleInputChange("employer", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">{t("form.jobTitle.label")}</Label>
                      <Input
                        id="jobTitle"
                        value={formData.jobTitle}
                        onChange={e => handleInputChange("jobTitle", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="yearsAtJob">{t("form.yearsAtJob.label")}</Label>
                      <Input
                        id="yearsAtJob"
                        type="number"
                        value={formData.yearsAtJob}
                        onChange={e => handleInputChange("yearsAtJob", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthsAtJob">{t("form.monthsAtJob.label")}</Label>
                      <Input
                        id="monthsAtJob"
                        type="number"
                        value={formData.monthsAtJob}
                        onChange={e => handleInputChange("monthsAtJob", e.target.value)}
                        placeholder={t("form.monthsAtJob.placeholder")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workPhone">{t("form.workPhone.label")}</Label>
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
                      <Label htmlFor="annualIncome">{t("form.annualIncome.label")} *</Label>
                      <Input
                        id="annualIncome"
                        type="number"
                        value={formData.annualIncome}
                        onChange={e => handleInputChange("annualIncome", e.target.value)}
                        placeholder="75000"
                        className={errors.annualIncome ? "border-red-500" : ""}
                      />
                      {errors.annualIncome && <p className="text-sm text-red-600">{errors.annualIncome}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="otherIncome">{t("form.otherIncome.label")}</Label>
                      <Input
                        id="otherIncome"
                        type="number"
                        value={formData.otherIncome}
                        onChange={e => handleInputChange("otherIncome", e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="monthlyRent">{t("form.monthlyRent.label")}</Label>
                      <Input
                        id="monthlyRent"
                        type="number"
                        value={formData.monthlyRent}
                        onChange={e => handleInputChange("monthlyRent", e.target.value)}
                        placeholder="1500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthlyDebts">{t("form.monthlyDebts.label")}</Label>
                      <Input
                        id="monthlyDebts"
                        type="number"
                        value={formData.monthlyDebts}
                        onChange={e => handleInputChange("monthlyDebts", e.target.value)}
                        placeholder="500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="checkingBalance">{t("form.checkingBalance.label")}</Label>
                      <Input
                        id="checkingBalance"
                        type="number"
                        value={formData.checkingBalance}
                        onChange={e => handleInputChange("checkingBalance", e.target.value)}
                        placeholder="5000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="savingsBalance">{t("form.savingsBalance.label")}</Label>
                      <Input
                        id="savingsBalance"
                        type="number"
                        value={formData.savingsBalance}
                        onChange={e => handleInputChange("savingsBalance", e.target.value)}
                        placeholder="15000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="retirementBalance">{t("form.retirementBalance.label")}</Label>
                      <Input
                        id="retirementBalance"
                        type="number"
                        value={formData.retirementBalance}
                        onChange={e => handleInputChange("retirementBalance", e.target.value)}
                        placeholder="50000"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Loan & Property Information */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="loanAmount">{t("form.loanAmount.label")} *</Label>
                      <Input
                        id="loanAmount"
                        type="number"
                        value={formData.loanAmount}
                        onChange={e => handleInputChange("loanAmount", e.target.value)}
                        placeholder="350000"
                        className={errors.loanAmount ? "border-red-500" : ""}
                      />
                      {errors.loanAmount && <p className="text-sm text-red-600">{errors.loanAmount}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="downPayment">{t("form.downPayment.label")} *</Label>
                      <Input
                        id="downPayment"
                        type="number"
                        value={formData.downPayment}
                        onChange={e => handleInputChange("downPayment", e.target.value)}
                        placeholder="70000"
                        className={errors.downPayment ? "border-red-500" : ""}
                      />
                      {errors.downPayment && <p className="text-sm text-red-600">{errors.downPayment}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("form.propertyType.label")} *</Label>
                      <Select
                        value={formData.propertyType}
                        onValueChange={value => handleInputChange("propertyType", value)}>
                        <SelectTrigger className={errors.propertyType ? "border-red-500" : ""}>
                          <SelectValue placeholder={t("form.propertyType.placeholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single-family">{t("form.propertyType.options.singleFamily")}</SelectItem>
                          <SelectItem value="condo">{t("form.propertyType.options.condo")}</SelectItem>
                          <SelectItem value="townhouse">{t("form.propertyType.options.townhouse")}</SelectItem>
                          <SelectItem value="multi-family">{t("form.propertyType.options.multiFamily")}</SelectItem>
                          <SelectItem value="manufactured">{t("form.propertyType.options.manufactured")}</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.propertyType && <p className="text-sm text-red-600">{errors.propertyType}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>{t("form.propertyUse.label")}</Label>
                      <Select
                        value={formData.propertyUse}
                        onValueChange={value => handleInputChange("propertyUse", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("form.propertyUse.placeholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="primary">{t("form.propertyUse.options.primary")}</SelectItem>
                          <SelectItem value="secondary">{t("form.propertyUse.options.secondary")}</SelectItem>
                          <SelectItem value="investment">{t("form.propertyUse.options.investment")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("form.loanPurpose.label")}</Label>
                    <Select
                      value={formData.loanPurpose}
                      onValueChange={value => handleInputChange("loanPurpose", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("form.loanPurpose.placeholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="purchase">{t("form.loanPurpose.options.purchase")}</SelectItem>
                        <SelectItem value="refinance">{t("form.loanPurpose.options.refinance")}</SelectItem>
                        <SelectItem value="cash-out">{t("form.loanPurpose.options.cashOut")}</SelectItem>
                        <SelectItem value="construction">{t("form.loanPurpose.options.construction")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">{t("form.propertyAddress.sectionTitle")}</h3>
                    <div className="space-y-2">
                      <Label htmlFor="propertyAddress">{t("form.propertyAddress.street")}</Label>
                      <Input
                        id="propertyAddress"
                        value={formData.propertyAddress}
                        onChange={e => handleInputChange("propertyAddress", e.target.value)}
                        placeholder={t("form.propertyAddress.streetPlaceholder")}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="propertyCity">{t("form.propertyAddress.city")}</Label>
                        <Input
                          id="propertyCity"
                          value={formData.propertyCity}
                          onChange={e => handleInputChange("propertyCity", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="propertyState">{t("form.propertyAddress.state")}</Label>
                        <Input
                          id="propertyState"
                          value={formData.propertyState}
                          onChange={e => handleInputChange("propertyState", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="propertyZip">{t("form.propertyAddress.zip")}</Label>
                        <Input
                          id="propertyZip"
                          value={formData.propertyZip}
                          onChange={e => handleInputChange("propertyZip", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasRealtor"
                        checked={formData.hasRealtor}
                        onCheckedChange={checked => handleInputChange("hasRealtor", checked)}
                      />
                      <Label htmlFor="hasRealtor">{t("form.hasRealtor.label")}</Label>
                    </div>

                    {formData.hasRealtor && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="realtorName">{t("form.realtorName.label")}</Label>
                          <Input
                            id="realtorName"
                            value={formData.realtorName}
                            onChange={e => handleInputChange("realtorName", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="realtorPhone">{t("form.realtorPhone.label")}</Label>
                          <Input
                            id="realtorPhone"
                            type="tel"
                            value={formData.realtorPhone}
                            onChange={e => handleInputChange("realtorPhone", e.target.value)}
                          />
                        </div>
                      </div>
                    )}
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
                    <Label htmlFor="additionalInfo">{t("form.additionalInfo.label")}</Label>
                    <Textarea
                      id="additionalInfo"
                      value={formData.additionalInfo}
                      onChange={e => handleInputChange("additionalInfo", e.target.value)}
                      placeholder={t("form.additionalInfo.placeholder")}
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
                  className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  {t("buttons.previous")}
                </Button>

                {currentStep < totalSteps ? (
                  <Button onClick={handleNext} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800">
                    {t("buttons.next")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                    {isSubmitting ? t("buttons.submitting") : t("buttons.submit")}
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
