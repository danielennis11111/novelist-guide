import { Inter } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import Navbar from '@/components/layout/Navbar'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Novelist Guide - Your Writing Companion',
  description: 'A personal AI writing assistant that helps you develop your novel while ensuring you do the actual writing.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main>{children}</main>
          </div>
        </SessionProvider>
      </body>
    </html>
  )
} 