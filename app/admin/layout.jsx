import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '../../lib/supabase-server'
import LogoutButton from '../../components/layout/LogoutButton'

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/testimonials', label: 'Testimonials' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/posts', label: 'Posts' },
]

export default async function AdminLayout({ children }) {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link className="text-lg font-semibold text-gray-950" href="/admin">
            MobinCMS
          </Link>
          <LogoutButton />
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-6 md:grid-cols-[220px_1fr]">
        <aside className="rounded-lg border border-gray-200 bg-white p-4">
          <nav className="flex gap-2 md:flex-col">
            {navItems.map((item) => (
              <Link
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-950"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="rounded-lg border border-gray-200 bg-white p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
