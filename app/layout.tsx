import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
// REMOVABLE FEATURE: theme toggle init script
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'World Time — Time Zone Converter & Meeting Scheduler',
  description: 'Compare multiple time zones at a glance and schedule meetings across the world.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${inter.className} h-full flex flex-col`}>
        {/* REMOVABLE FEATURE: theme init — delete this Script to remove no-flash theme load */}
        <Script id="worldtime-theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('worldtime-theme');if(t==='light')document.documentElement.dataset.theme='light';}catch(e){}})()`}
        </Script>
        {children}
      </body>
    </html>
  )
}
