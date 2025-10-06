import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ERP App',
  description: 'Created with SoftSkiller',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="bg-orange-50">{children}</body>
    </html>
  )
}
