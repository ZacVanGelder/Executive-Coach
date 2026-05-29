import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "My Day Coach — Executive Functioning Support",
  description: "A daily planning coach designed for people with ADHD and autism.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
