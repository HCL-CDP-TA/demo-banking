"use client"

import { useState, useEffect } from "react"
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
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Settings, User, Bell, Shield, Globe, Save, RefreshCw, UserCog } from "lucide-react"
import { useSiteContext } from "@/lib/SiteContext"

interface SettingsModalProps {
  children: React.ReactNode
}

export default function SettingsModal({ children }: SettingsModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { brand } = useSiteContext()

  // Settings state
  const [settings, setSettings] = useState({
    // Profile Settings
    firstName: "",
    lastName: "",
    email: "",
    phone: "",

    // Notification Preferences
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: true,
    securityAlerts: true,
    accountUpdates: true,
    promotionalOffers: false,

    // Security Settings
    twoFactorAuth: false,
    biometricLogin: true,
    sessionTimeout: "30",

    // Banking Preferences
    defaultAccount: "checking",
    currency: "USD",
    statementFrequency: "monthly",
    overdraftProtection: true,
    autoSave: false,
    roundUpPurchases: false,

    // Demo Settings
    sourceKey: "",
    CDPenabled: true,

    // Communication Preferences
    preferredContactMethod: "email",
    timezone: "America/New_York",
  })

  useEffect(() => {
    // Load customer data from local storage if it exists
    const storedCustomerData = JSON.parse(localStorage.getItem(`${brand.key}_customer_data`) || "{}")
    if (storedCustomerData?.loginData) {
      setSettings(prev => ({
        ...prev,
        firstName: storedCustomerData.loginData.firstName || "",
        lastName: storedCustomerData.loginData.lastName || "",
        email: storedCustomerData.loginData.email || "",
        phone: storedCustomerData.loginData.phone || "",
      }))
    }
  }, [brand.key])

  useEffect(() => {
    // Listen for changes in customer data after login
    const handleStorageChange = () => {
      const updatedCustomerData = JSON.parse(localStorage.getItem(`${brand.key}_customer_data`) || "{}")
      if (updatedCustomerData?.loginData) {
        setSettings(prev => ({
          ...prev,
          firstName: updatedCustomerData.loginData.firstName || "",
          lastName: updatedCustomerData.loginData.lastName || "",
          email: updatedCustomerData.loginData.email || "",
          phone: updatedCustomerData.loginData.phone || "",
        }))
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [brand.key])

  const handleSave = async () => {
    setIsSaving(true)

    // Simulate saving process
    setTimeout(() => {
      // Save to localStorage for demo purposes
      localStorage.setItem(`${brand.key}_settings`, JSON.stringify(settings))

      // Track settings change for CDP
      const customerData = JSON.parse(localStorage.getItem(`${brand.key}_customer_data`) || "{}")
      localStorage.setItem(
        `${brand.key}_customer_data`,
        JSON.stringify({
          ...customerData,
          settingsUpdated: {
            timestamp: new Date().toISOString(),
            preferences: settings,
          },
        }),
      )

      setIsSaving(false)
      setIsOpen(false)
    }, 1000)
  }

  const handleSettingChange = (key: string, value: unknown) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl h-[50vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Settings className="h-6 w-6 text-slate-700" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-slate-800">Account Settings</DialogTitle>
              <DialogDescription className="text-slate-600">
                Manage your banking preferences and account settings
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="profile" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="demo" className="flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                Demo Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-6">
              {/* Profile Settings */}
              <TabsContent value="profile" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>Update your personal details and contact information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={settings.firstName}
                          onChange={e => handleSettingChange("firstName", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={settings.lastName}
                          onChange={e => handleSettingChange("lastName", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={settings.email}
                        onChange={e => handleSettingChange("email", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={settings.phone}
                        onChange={e => handleSettingChange("phone", e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Communication Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Preferred Contact Method</Label>
                      <Select
                        value={settings.preferredContactMethod}
                        onValueChange={value => handleSettingChange("preferredContactMethod", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                          <SelectItem value="mail">Mail</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Time Zone</Label>
                      <Select value={settings.timezone} onValueChange={value => handleSettingChange("timezone", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notification Settings */}
              <TabsContent value="notifications" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notification Preferences
                    </CardTitle>
                    <CardDescription>Choose how you want to receive updates and alerts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Email Notifications</Label>
                          <p className="text-sm text-slate-600">Receive notifications via email</p>
                        </div>
                        <Switch
                          checked={settings.emailNotifications}
                          onCheckedChange={checked => handleSettingChange("emailNotifications", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">SMS Notifications</Label>
                          <p className="text-sm text-slate-600">Receive text message alerts</p>
                        </div>
                        <Switch
                          checked={settings.smsNotifications}
                          onCheckedChange={checked => handleSettingChange("smsNotifications", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Push Notifications</Label>
                          <p className="text-sm text-slate-600">Receive mobile app notifications</p>
                        </div>
                        <Switch
                          checked={settings.pushNotifications}
                          onCheckedChange={checked => handleSettingChange("pushNotifications", checked)}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium">Notification Types</h4>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Security Alerts</Label>
                          <p className="text-sm text-slate-600">Login attempts and security events</p>
                        </div>
                        <Switch
                          checked={settings.securityAlerts}
                          onCheckedChange={checked => handleSettingChange("securityAlerts", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Account Updates</Label>
                          <p className="text-sm text-slate-600">Balance changes and transactions</p>
                        </div>
                        <Switch
                          checked={settings.accountUpdates}
                          onCheckedChange={checked => handleSettingChange("accountUpdates", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Marketing Emails</Label>
                          <p className="text-sm text-slate-600">Product updates and bank news</p>
                        </div>
                        <Switch
                          checked={settings.marketingEmails}
                          onCheckedChange={checked => handleSettingChange("marketingEmails", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Promotional Offers</Label>
                          <p className="text-sm text-slate-600">Special deals and limited-time offers</p>
                        </div>
                        <Switch
                          checked={settings.promotionalOffers}
                          onCheckedChange={checked => handleSettingChange("promotionalOffers", checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Settings */}
              <TabsContent value="security" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Security Settings
                    </CardTitle>
                    <CardDescription>Manage your account security and authentication preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Two-Factor Authentication</Label>
                        <p className="text-sm text-slate-600">Add an extra layer of security to your account</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {settings.twoFactorAuth && <Badge variant="secondary">Enabled</Badge>}
                        <Switch
                          checked={settings.twoFactorAuth}
                          onCheckedChange={checked => handleSettingChange("twoFactorAuth", checked)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Biometric Login</Label>
                        <p className="text-sm text-slate-600">Use fingerprint or face recognition</p>
                      </div>
                      <Switch
                        checked={settings.biometricLogin}
                        onCheckedChange={checked => handleSettingChange("biometricLogin", checked)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Session Timeout</Label>
                      <Select
                        value={settings.sessionTimeout}
                        onValueChange={value => handleSettingChange("sessionTimeout", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Banking Preferences */}
              <TabsContent value="demo" className="space-y-6 mt-0">
                {/* CDP Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCog className="h-5 w-5" />
                      CDP Configuration
                    </CardTitle>
                    <CardDescription>HCL CDP Settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Enable CDP Logging</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        {settings.CDPenabled && <Badge variant="secondary">Enabled</Badge>}
                        <Switch
                          checked={settings.CDPenabled}
                          onCheckedChange={checked => handleSettingChange("CDPenabled", checked)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sourceKey">Source Key</Label>
                      <Input
                        id="sourceKey"
                        value={settings.firstName}
                        onChange={e => handleSettingChange("sourceKey", e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Banking Preferences
                    </CardTitle>
                    <CardDescription>Customize your banking experience and account settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Default Account</Label>
                      <Select
                        value={settings.defaultAccount}
                        onValueChange={value => handleSettingChange("defaultAccount", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="checking">Primary Checking</SelectItem>
                          <SelectItem value="savings">High-Yield Savings</SelectItem>
                          <SelectItem value="premium">Premium Checking</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Statement Frequency</Label>
                      <Select
                        value={settings.statementFrequency}
                        onValueChange={value => handleSettingChange("statementFrequency", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium">Account Features</h4>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Overdraft Protection</Label>
                          <p className="text-sm text-slate-600">
                            Automatically transfer from savings to cover overdrafts
                          </p>
                        </div>
                        <Switch
                          checked={settings.overdraftProtection}
                          onCheckedChange={checked => handleSettingChange("overdraftProtection", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Auto-Save</Label>
                          <p className="text-sm text-slate-600">Automatically save a percentage of deposits</p>
                        </div>
                        <Switch
                          checked={settings.autoSave}
                          onCheckedChange={checked => handleSettingChange("autoSave", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Round-Up Purchases</Label>
                          <p className="text-sm text-slate-600">Round up purchases and save the change</p>
                        </div>
                        <Switch
                          checked={settings.roundUpPurchases}
                          onCheckedChange={checked => handleSettingChange("roundUpPurchases", checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card> */}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="flex justify-between pt-6 border-t flex-shrink-0">
          <Button variant="outline" onClick={() => setIsOpen(false)} className="cursor-pointer">
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" className="cursor-pointer flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Reset to Defaults
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="cursor-pointer flex items-center gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
