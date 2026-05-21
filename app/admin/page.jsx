import Link from 'next/link'
import { createSupabaseServerClient } from '../../lib/supabase-server'

const dashboardSections = [
  {
    title: 'Testimonials',
    manageHref: '/admin/testimonials',
    newHref: '/admin/testimonials/new',
    stats: [
      { key: 'total', label: 'Total testimonials' },
      { key: 'published', label: 'Published testimonials' },
      { key: 'draft', label: 'Draft testimonials' },
    ],
  },
  {
    title: 'Projects',
    manageHref: '/admin/projects',
    newHref: '/admin/projects/new',
    stats: [
      { key: 'total', label: 'Total projects' },
      { key: 'published', label: 'Published projects' },
      { key: 'draft', label: 'Draft projects' },
      { key: 'featured', label: 'Featured projects' },
    ],
  },
  {
    title: 'Posts',
    manageHref: '/admin/posts',
    newHref: '/admin/posts/new',
    stats: [
      { key: 'total', label: 'Total posts' },
      { key: 'published', label: 'Published posts' },
      { key: 'draft', label: 'Draft posts' },
    ],
  },
]

async function getCount(supabase, tableName, applyFilter = (query) => query) {
  const query = supabase.from(tableName).select('*', {
    count: 'exact',
    head: true,
  })
  const { count, error } = await applyFilter(query)

  if (error) {
    throw error
  }

  return count ?? 0
}

async function getContentStats(supabase, tableName, includeFeatured = false) {
  const stats = {
    draft: 0,
    error: '',
    featured: 0,
    published: 0,
    total: 0,
  }

  try {
    const [total, published, draft, featured] = await Promise.all([
      getCount(supabase, tableName),
      getCount(supabase, tableName, (query) =>
        query.eq('is_published', true),
      ),
      getCount(supabase, tableName, (query) =>
        query.eq('is_published', false),
      ),
      includeFeatured
        ? getCount(supabase, tableName, (query) =>
            query.eq('is_featured', true),
          )
        : Promise.resolve(0),
    ])

    return {
      ...stats,
      draft,
      featured,
      published,
      total,
    }
  } catch (error) {
    return {
      ...stats,
      error:
        error instanceof Error
          ? error.message
          : `Could not load ${tableName} stats.`,
    }
  }
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-950">{value}</p>
    </div>
  )
}

function QuickLink({ href, children, variant = 'secondary' }) {
  const className =
    variant === 'primary'
      ? 'bg-gray-950 text-white hover:bg-gray-800'
      : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100'

  return (
    <Link
      className={`inline-flex rounded-md px-4 py-2 text-sm font-medium ${className}`}
      href={href}
    >
      {children}
    </Link>
  )
}

export default async function AdminDashboardPage() {
  const supabase = createSupabaseServerClient()
  const [testimonials, projects, posts] = await Promise.all([
    getContentStats(supabase, 'testimonials'),
    getContentStats(supabase, 'projects', true),
    getContentStats(supabase, 'posts'),
  ])
  const statsBySection = {
    Posts: posts,
    Projects: projects,
    Testimonials: testimonials,
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold text-gray-950">Dashboard</h1>
        <p className="mt-3 text-sm leading-6 text-gray-700">
          Content overview for testimonials, projects, and posts.
        </p>
      </div>

      <div className="mt-6 grid gap-6">
        {dashboardSections.map((section) => {
          const sectionStats = statsBySection[section.title]

          return (
            <section
              className="rounded-lg border border-gray-200 bg-gray-50 p-5"
              key={section.title}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-950">
                    {section.title}
                  </h2>
                  {sectionStats.error ? (
                    <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                      {sectionStats.error}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <QuickLink href={section.manageHref}>
                    Manage {section.title.toLowerCase()}
                  </QuickLink>
                  <QuickLink href={section.newHref} variant="primary">
                    New {section.title.slice(0, -1).toLowerCase()}
                  </QuickLink>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {section.stats.map((stat) => (
                  <StatCard
                    key={stat.key}
                    label={stat.label}
                    value={sectionStats.error ? '-' : sectionStats[stat.key]}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
