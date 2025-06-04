import type React from "react"
// This is the root layout, it will wrap all pages.
// We'll use AppLayout component inside specific page layouts or page.tsx files
// if they need the sidebar and header.
// For simplicity, let's assume all pages use AppLayout.

import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import AppLayout from "@/components/layout/app-layout" // Import AppLayout

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Financial Planner",
  description: "Manage your personal finances effectively.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AppLayout>{children}</AppLayout> {/* Wrap children with AppLayout */}
        </ThemeProvider>
      </body>
    </html>
  )
}
