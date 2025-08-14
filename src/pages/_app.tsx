import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { useState } from 'react'
import Navbar from '@/components/Navbar'

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Component {...pageProps} />
        </div>
      </QueryClientProvider>
    </SessionProvider>
  )
}