"use client"

import { formConfig } from "./config"
import { GenericFormStepper } from "@/components/GenericFormStepper"

export default function CarLoanApplicationPage() {
  return (
    <GenericFormStepper
      config={formConfig}
      initialFormData={formConfig.initialFormData}
      storageKey="carLoanApplication"
      applicationIdPrefix="CL"
      successRedirectPath="./application-submitted"
    />
  )
}
