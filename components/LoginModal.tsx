"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, User, Lock, Mail, Phone } from "lucide-react"
import { useSiteContext } from "@/lib/SiteContext"
import { saveCustomer, getCustomerByEmail, StoredCustomer } from "@/app/actions/customerActions"

interface LoginModalProps {
  children: React.ReactNode
  onLogin?: () => void
}

interface Customer {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  password: string // In production, this should be hashed
  loginTime?: string
  registrationTime?: string
  confirmPassword?: string // Only used during registration
}

export default function LoginModal({ children, onLogin }: LoginModalProps) {
  const t = useTranslations("loginModal")
  const { brand } = useSiteContext()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  const [registerData, setRegisterData] = useState<Customer>({
    id: 0,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    loginTime: undefined,
    registrationTime: undefined,
    confirmPassword: "",
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const customer: StoredCustomer | null = await getCustomerByEmail(loginData.email)
      if (customer) {
        const customerData = {
          id: customer.id,
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
          loginTime: new Date().toISOString(),
        }
        const existingData = JSON.parse(localStorage.getItem(`${brand.key}_customer_data`) || "{}")
        localStorage.setItem(`${brand.key}_customer_data`, JSON.stringify({ ...existingData, loginData: customerData }))
        localStorage.setItem("isLoggedIn", "true")
        setIsOpen(false)

        if (onLogin) {
          onLogin()
        }
      } else {
        setError(t("errors.invalidCredentials"))
      }
    } catch (error) {
      console.error("Login failed:", error)
      setError(t("errors.genericError"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (registerData.password !== registerData.confirmPassword) {
        setError(t("errors.passwordMismatch"))
        setIsLoading(false)
        return
      }

      const customerData: StoredCustomer = {
        id: 0, // Default value for id
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        email: registerData.email,
        phone: registerData.phone || "",
        password: registerData.password, // In production, hash passwords before saving
      }

      const userId = await saveCustomer(customerData)
      const updatedCustomerData = {
        id: userId,
        email: registerData.email,
        registrationTime: new Date().toISOString(),
        customerType: "new",
      }

      const existingData = JSON.parse(localStorage.getItem(`${brand.key}_customer_data`) || "{}")
      localStorage.setItem(
        `${brand.key}_customer_data`,
        JSON.stringify({ ...existingData, loginData: updatedCustomerData }),
      )
      localStorage.setItem("isLoggedIn", "true")
      setIsOpen(false)

      if (onLogin) {
        onLogin()
      }
    } catch (error) {
      console.error("Registration failed:", error)
      setError(t("errors.genericError"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    })
  }

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-slate-100 rounded-full w-fit">
            <Shield className="h-8 w-8 text-slate-700" />
          </div>
          <DialogTitle className="text-2xl font-bold text-slate-800">{t("title")}</DialogTitle>
          <DialogDescription className="text-slate-600">{t("description")}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{t("tabs.login")}</TabsTrigger>
            <TabsTrigger value="register">{t("tabs.register")}</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-slate-700">
                  {t("fields.email")}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder={t("placeholders.email")}
                    value={loginData.email}
                    onChange={handleLoginChange}
                    className="pl-10 border-slate-300"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-slate-700">
                  {t("fields.password")}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder={t("placeholders.password")}
                    value={loginData.password}
                    onChange={handleLoginChange}
                    className="pl-10 border-slate-300"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-slate-700 hover:bg-slate-800" disabled={isLoading}>
                {isLoading ? t("buttons.signingIn") : t("buttons.signIn")}
              </Button>
            </form>

            <div className="text-center">
              <button className="text-sm text-slate-600 hover:text-slate-800 hover:underline">
                {t("links.forgotPassword")}
              </button>
            </div>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-slate-700">
                    {t("fields.firstName")}
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder={t("placeholders.firstName")}
                    value={registerData.firstName}
                    onChange={handleRegisterChange}
                    className="border-slate-300"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-slate-700">
                    {t("fields.lastName")}
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder={t("placeholders.lastName")}
                    value={registerData.lastName}
                    onChange={handleRegisterChange}
                    className="border-slate-300"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email" className="text-slate-700">
                  {t("fields.email")}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="register-email"
                    name="email"
                    type="email"
                    placeholder={t("placeholders.email")}
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    className="pl-10 border-slate-300"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-700">
                  {t("fields.phone")}
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder={t("placeholders.phone")}
                    value={registerData.phone}
                    onChange={handleRegisterChange}
                    className="pl-10 border-slate-300"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password" className="text-slate-700">
                  {t("fields.password")}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="register-password"
                    name="password"
                    type="password"
                    placeholder={t("placeholders.password")}
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    className="pl-10 border-slate-300"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700">
                  {t("fields.confirmPassword")}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder={t("placeholders.confirmPassword")}
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    className="pl-10 border-slate-300"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-slate-700 hover:bg-slate-800" disabled={isLoading}>
                {isLoading ? t("buttons.creatingAccount") : t("buttons.createAccount")}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
