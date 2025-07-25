import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { SiteProvider } from "@/lib/SiteContext"
import CdpProvider from "@/components/CdpProvider"
import StatusPopover from "@/components/StatusPopover"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Woodburn Bank - Your Trusted Financial Partner",
  description:
    "Discover comprehensive banking solutions including home loans, credit cards, personal loans, and bank accounts at Woodburn Bank.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SiteProvider>
          <CdpProvider>{children}</CdpProvider>
          <StatusPopover />
        </SiteProvider>
      </body>
    </html>
  )
}
