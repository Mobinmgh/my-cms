'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '../lib/supabase'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    async function redirectForSession() {
      try {
        const supabase = createSupabaseBrowserClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        router.replace(session ? '/admin' : '/login')
      } catch {
        router.replace('/login')
      }
    }

    redirectForSession()
  }, [router])

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <p className="text-sm text-gray-600">Loading...</p>
    </main>
  )
}
