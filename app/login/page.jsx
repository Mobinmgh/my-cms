'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '../../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')

    if (!email.trim()) {
      setErrorMessage('Email is required.')
      return
    }

    if (!password) {
      setErrorMessage('Password is required.')
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        setErrorMessage(error.message || 'Login failed.')
        return
      }

      window.location.href = '/admin'
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong while signing in.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0f0e0c] px-5 py-8 text-[#f0dfbd] sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-10 lg:grid-cols-[1fr_440px] lg:items-center">
        <section className="hidden lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9c8b6e]">
            MobinCMS
          </p>
          <h1 className="mt-5 max-w-3xl text-6xl font-normal leading-[0.95] text-[#f0dfbd]">
            Content command center for the portfolio system.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[#8d8678]">
            Manage testimonials, projects, and posts from one focused admin
            workspace built around published portfolio content.
          </p>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            {['Testimonials', 'Projects', 'Posts'].map((item) => (
              <div
                className="rounded-md border border-[#2a2721] bg-[#14130f] p-4"
                key={item}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9c8b6e]">
                  Manage
                </p>
                <p className="mt-2 text-sm font-semibold text-[#d7b777]">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-md rounded-lg border border-[#2a2721] bg-[#14130f] p-6 shadow-2xl sm:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9c8b6e]">
                Secure admin
              </p>
              <h2 className="mt-4 text-3xl font-normal text-[#f0dfbd]">
                Sign in to MobinCMS
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#8d8678]">
                Use the admin account created in Supabase Auth.
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label
                  className="block text-sm font-medium text-[#d7b777]"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  className="mt-2 block w-full rounded-md border border-[#3a352c] bg-[#0f0e0c] px-3 py-3 text-sm text-[#f0dfbd] outline-none transition placeholder:text-[#6f6759] focus:border-[#d7b777] focus:ring-1 focus:ring-[#d7b777]"
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-[#d7b777]"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  className="mt-2 block w-full rounded-md border border-[#3a352c] bg-[#0f0e0c] px-3 py-3 text-sm text-[#f0dfbd] outline-none transition placeholder:text-[#6f6759] focus:border-[#d7b777] focus:ring-1 focus:ring-[#d7b777]"
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              {errorMessage ? (
                <p className="rounded-md border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-200">
                  {errorMessage}
                </p>
              ) : null}

              <button
                className="w-full rounded-md border border-[#d7b777] bg-[#d7b777] px-4 py-3 text-sm font-semibold text-[#151411] transition hover:bg-[#f0dfbd] disabled:cursor-not-allowed disabled:border-[#6f6759] disabled:bg-[#3a352c] disabled:text-[#8d8678]"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}
