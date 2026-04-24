// /app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import AppWrapper from '@/app/components/layout/AppWrapper'
import { ColorSchemeScript } from '@mantine/core' 
import { geistSans, geistMono } from '@/app/fonts'

export const metadata: Metadata = {
  title: 'Velora - Premium Retail',
  description: 'Discover unbeatable deals on top brands at Velora.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ColorSchemeScript />
      </head>
      <body className="min-h-full flex flex-col">
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  )
}
