"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PiggyBank, Smartphone, Shield, Award, TrendingUp, CheckCircle, CreditCard, Banknote } from "lucide-react"
import { useSiteContext } from "@/lib/SiteContext"

export default function BankAccountsPage() {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
  const { brand } = useSiteContext()

  const handleAccountInterest = (accountType: string) => {
    setSelectedAccount(accountType)

    // Track customer interaction for CDP
    const customerData = JSON.parse(localStorage.getItem(`${brand.key}_customer_data`) || "{}")
    localStorage.setItem(
      `${brand.key}_customer_data`,
      JSON.stringify({
        ...customerData,
        bankAccountInterest: {
          accountType,
          timestamp: new Date().toISOString(),
        },
      }),
    )
  }

  return (
    <>
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <PiggyBank className="h-16 w-16 text-green-400 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Banking Made Simple</h1>
            <p className="text-xl md:text-2xl mb-8 text-slate-200 max-w-3xl mx-auto">
              Experience modern banking with no monthly fees, high-yield savings, and the personal service you deserve
              from a trusted community bank.
            </p>
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
              Open Your Account Today
            </Button>
          </div>
        </div>
      </section>

      {/* Account Types */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Choose the Right Account for You</h2>
            <p className="text-xl text-slate-600">
              From everyday checking to high-yield savings, we have accounts designed for your financial goals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Essential Checking */}
            <Card className="card-hover relative border-slate-200 bg-white">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-slate-800">Essential Checking</CardTitle>
                    <CardDescription className="text-slate-600">Perfect for everyday banking needs</CardDescription>
                  </div>
                  <Badge className="bg-green-600 text-white">Most Popular</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-6 bg-slate-50 rounded-lg">
                    <div className="text-4xl font-bold text-slate-800 mb-2">$0</div>
                    <p className="text-sm text-slate-600">Monthly maintenance fee</p>
                    <div className="text-2xl font-bold text-slate-700 mt-3">$0</div>
                    <p className="text-sm text-slate-600">Minimum balance required</p>
                  </div>

                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-slate-600">Free online and mobile banking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-slate-600">Free debit card with contactless pay</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-slate-600">Access to 30,000+ ATMs nationwide</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-slate-600">Mobile check deposit</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-slate-600">Overdraft protection available</span>
                    </li>
                  </ul>

                  <Button
                    className="w-full bg-slate-700 hover:bg-slate-800"
                    onClick={() => handleAccountInterest("essential-checking")}>
                    Open Account
                  </Button>

                  {selectedAccount === "essential-checking" && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        Excellent choice! This account offers everything you need for daily banking with no fees.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Premium Checking */}
            <Card className="card-hover border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">Premium Checking</CardTitle>
                <CardDescription className="text-slate-600">Enhanced benefits for active banking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-6 bg-slate-50 rounded-lg">
                    <div className="text-4xl font-bold text-slate-800 mb-2">0.25%</div>
                    <p className="text-sm text-slate-600">Interest on balances over $2,500</p>
                    <div className="text-2xl font-bold text-slate-700 mt-3">$2,500</div>
                    <p className="text-sm text-slate-600">Minimum balance to avoid fees</p>
                  </div>

                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-slate-600">All Essential Checking benefits</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-slate-600">Interest earning account</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-slate-600">Free cashier&aposs checks</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-slate-600">Priority customer service</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-slate-600">ATM fee reimbursements</span>
                    </li>
                  </ul>

                  <Button
                    className="w-full bg-slate-700 hover:bg-slate-800"
                    onClick={() => handleAccountInterest("premium-checking")}>
                    Open Account
                  </Button>

                  {selectedAccount === "premium-checking" && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        Great for active banking! Earn interest while enjoying premium benefits and service.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* High-Yield Savings */}
            <Card className="card-hover border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">High-Yield Savings</CardTitle>
                <CardDescription className="text-slate-600">
                  Maximize your savings with competitive rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-6 bg-slate-50 rounded-lg">
                    <div className="text-4xl font-bold text-slate-800 mb-2">4.25%</div>
                    <p className="text-sm text-slate-600">Annual Percentage Yield (APY)</p>
                    <div className="text-2xl font-bold text-slate-700 mt-3">$500</div>
                    <p className="text-sm text-slate-600">Minimum opening deposit</p>
                  </div>

                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-slate-600">Competitive interest rates</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-slate-600">No monthly maintenance fees</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-slate-600">FDIC insured up to $250,000</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-slate-600">Online and mobile access</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-slate-600">Automatic savings programs</span>
                    </li>
                  </ul>

                  <Button
                    className="w-full bg-slate-700 hover:bg-slate-800"
                    onClick={() => handleAccountInterest("high-yield-savings")}>
                    Open Account
                  </Button>

                  {selectedAccount === "high-yield-savings" && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        Smart choice! Start earning more on your savings with our competitive rates.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Digital Banking Features */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Modern Banking at Your Fingertips</h2>
            <p className="text-xl text-slate-600">
              Experience the convenience of digital banking with the security and service of a trusted institution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="mx-auto mb-4 p-4 bg-slate-100 rounded-full w-fit">
                <Smartphone className="h-8 w-8 text-slate-700" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-800">Mobile Banking</h3>
              <p className="text-slate-600 text-sm">
                Bank anywhere, anytime with our secure mobile app featuring biometric login and real-time alerts
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 p-4 bg-slate-100 rounded-full w-fit">
                <CreditCard className="h-8 w-8 text-slate-700" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-800">Contactless Payments</h3>
              <p className="text-slate-600 text-sm">
                Tap to pay with your debit card or mobile wallet for fast, secure transactions
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 p-4 bg-slate-100 rounded-full w-fit">
                <Banknote className="h-8 w-8 text-slate-700" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-800">Mobile Deposits</h3>
              <p className="text-slate-600 text-sm">
                Deposit checks instantly by taking a photo with your smartphone - no trip to the bank required
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 p-4 bg-slate-100 rounded-full w-fit">
                <TrendingUp className="h-8 w-8 text-slate-700" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-800">Financial Insights</h3>
              <p className="text-slate-600 text-sm">
                Track spending, set budgets, and receive personalized insights to help you reach your financial goals
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Trust */}
      <section className="trust-gradient py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Your Money, Secure and Protected</h2>
            <p className="text-xl text-slate-600">
              Bank with confidence knowing your deposits and personal information are fully protected
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="mx-auto mb-6 p-4 bg-white rounded-full w-fit shadow-sm">
                <Shield className="h-10 w-10 text-slate-700" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">FDIC Insured</h3>
              <p className="text-slate-600 leading-relaxed">
                Your deposits are insured up to $250,000 by the Federal Deposit Insurance Corporation, providing peace
                of mind for your savings.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 p-4 bg-white rounded-full w-fit shadow-sm">
                <Award className="h-10 w-10 text-slate-700" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">Advanced Security</h3>
              <p className="text-slate-600 leading-relaxed">
                Multi-factor authentication, encryption, and 24/7 fraud monitoring keep your accounts and personal
                information secure.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 p-4 bg-white rounded-full w-fit shadow-sm">
                <TrendingUp className="h-10 w-10 text-slate-700" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">Financial Stability</h3>
              <p className="text-slate-600 leading-relaxed">
                With over 50 years of stable operations and strong capital reserves, Woodburn Bank is built to weather
                any economic climate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Banking Better?</h2>
          <p className="text-xl mb-8 text-slate-300 max-w-2xl mx-auto">
            Open your account online in minutes and start enjoying the benefits of modern banking with the personal
            touch of a community bank.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
              Open Account Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-400 text-slate-200 hover:bg-slate-100 hover:text-slate-800 px-8 py-3">
              Visit a Branch
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
