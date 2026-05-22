'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import LogoutButton from '../../components/layout/LogoutButton'
import { createSupabaseBrowserClient } from '../../lib/supabase'

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/testimonials', label: 'Testimonials' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/posts', label: 'Posts' },
  { href: '/admin/contact-submissions', label: 'Contact' },
]

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sessionError, setSessionError] = useState('')
  const currentItem =
    navItems
      .filter((item) =>
        item.href === '/admin'
          ? pathname === item.href
          : pathname.startsWith(item.href),
      )
      .sort((first, second) => second.href.length - first.href.length)[0] ||
    navItems[0]
  const isDashboard = pathname === '/admin'

  useEffect(() => {
    let isMounted = true
    let subscription

    async function checkSession() {
      try {
        const supabase = createSupabaseBrowserClient()
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (!isMounted) {
          return
        }

        if (error) {
          setSessionError(error.message)
          return
        }

        if (!session) {
          router.replace('/login')
          return
        }

        setSessionError('')

        const authListener = supabase.auth.onAuthStateChange(
          (event, currentSession) => {
            if (event === 'SIGNED_OUT' || !currentSession) {
              router.replace('/login')
            }
          },
        )

        subscription = authListener.data.subscription
      } catch (error) {
        if (!isMounted) {
          return
        }

        setSessionError(
          error instanceof Error
            ? error.message
            : 'Could not verify the current session.',
        )
      }
    }

    checkSession()

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [router])

  return (
    <div className="min-h-screen w-full bg-[#0f0e0c] text-[#f0dfbd]">
      <div className="grid min-h-screen w-full gap-0 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="w-full border-b border-[#2a2721] bg-[#14130f] px-5 py-5 lg:min-h-screen lg:w-[280px] lg:border-b-0 lg:border-r lg:px-6 lg:py-8">
          <Link className="block" href="/admin">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9c8b6e]">
              Content Studio
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-[#f0dfbd]">
              MobinCMS
            </h1>
          </Link>

          <nav className="mt-8 grid gap-2 sm:grid-cols-5 lg:grid-cols-1">
            {navItems.map((item) => (
              <Link
                className={`rounded-md border px-4 py-3 text-sm font-medium transition ${
                  currentItem.href === item.href
                    ? 'border-[#d7b777] bg-[#1d1a14] text-[#f0dfbd]'
                    : 'border-transparent text-[#8d8678] hover:border-[#2a2721] hover:bg-[#171612] hover:text-[#f0dfbd]'
                }`}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 px-5 py-5 sm:px-6 lg:px-8 lg:py-8">
          <header className="mb-6 flex flex-col gap-4 border-b border-[#2a2721] pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9c8b6e]">
                {currentItem.label}
              </p>
              <h2 className="mt-2 text-3xl font-normal text-[#f0dfbd]">
                Content Command Center
              </h2>
            </div>
            <LogoutButton />
          </header>

          <main
            className={`min-h-[calc(100vh-170px)] rounded-lg border p-5 shadow-2xl sm:p-6 lg:p-8 ${
              isDashboard
                ? 'border-transparent bg-transparent p-0 shadow-none sm:p-0 lg:p-0'
                : 'border-[#2a2721] bg-[#f4efe6] text-gray-950'
            }`}
          >
            {sessionError ? (
              <p className="mb-4 rounded-md border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-200">
                {sessionError}
              </p>
            ) : null}
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
