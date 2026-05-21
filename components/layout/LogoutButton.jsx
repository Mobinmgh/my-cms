'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '../../lib/supabase'

export default function LogoutButton() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setIsLoggingOut(true)

    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()

    router.refresh()
    router.push('/login')
  }

  return (
    <button
      className="rounded-md border border-[#3a352c] bg-[#171612] px-4 py-2 text-sm font-medium text-[#d7b777] transition hover:border-[#d7b777] hover:bg-[#1d1a14] disabled:cursor-not-allowed disabled:text-[#6f6759]"
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? 'Logging out...' : 'Logout'}
    </button>
  )
}
