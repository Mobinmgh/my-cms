'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '../../lib/supabase'

const dashboardSections = [
  {
    title: 'Testimonials',
    description: 'Client proof and portfolio quotes.',
    manageHref: '/admin/testimonials',
    newHref: '/admin/testimonials/new',
    tableName: 'testimonials',
    stats: [
      { key: 'total', label: 'Total' },
      { key: 'published', label: 'Published' },
      { key: 'draft', label: 'Draft' },
    ],
  },
  {
    title: 'Projects',
    description: 'Case studies and featured work.',
    includeFeatured: true,
    manageHref: '/admin/projects',
    newHref: '/admin/projects/new',
    tableName: 'projects',
    stats: [
      { key: 'total', label: 'Total' },
      { key: 'published', label: 'Published' },
      { key: 'draft', label: 'Draft' },
      { key: 'featured', label: 'Featured' },
    ],
  },
  {
    title: 'Posts',
    description: 'Long-form writing and updates.',
    manageHref: '/admin/posts',
    newHref: '/admin/posts/new',
    tableName: 'posts',
    stats: [
      { key: 'total', label: 'Total' },
      { key: 'published', label: 'Published' },
      { key: 'draft', label: 'Draft' },
    ],
  },
]

const emptyStats = {
  draft: 0,
  error: '',
  featured: 0,
  isLoading: true,
  published: 0,
  total: 0,
}

function getInitialStats() {
  return Object.fromEntries(
    dashboardSections.map((section) => [section.title, emptyStats]),
  )
}

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

async function getContentStats(supabase, section) {
  try {
    const [total, published, draft, featured] = await Promise.all([
      getCount(supabase, section.tableName),
      getCount(supabase, section.tableName, (query) =>
        query.eq('is_published', true),
      ),
      getCount(supabase, section.tableName, (query) =>
        query.eq('is_published', false),
      ),
      section.includeFeatured
        ? getCount(supabase, section.tableName, (query) =>
            query.eq('is_featured', true),
          )
        : Promise.resolve(0),
    ])

    return {
      draft,
      error: '',
      featured,
      isLoading: false,
      published,
      total,
    }
  } catch (error) {
    return {
      ...emptyStats,
      error:
        error instanceof Error
          ? error.message
          : `Could not load ${section.tableName} stats.`,
      isLoading: false,
    }
  }
}

function StatCard({ isLoading, label, value }) {
  return (
    <div className="rounded-md border border-[#2a2721] bg-[#171612] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8d8678]">
        {label}
      </p>
      <p className="mt-4 text-4xl font-semibold text-[#f0dfbd]">
        {isLoading ? '...' : value}
      </p>
    </div>
  )
}

function QuickLink({ href, children, variant = 'secondary' }) {
  const className =
    variant === 'primary'
      ? 'border-[#d7b777] bg-[#d7b777] text-[#151411] hover:bg-[#f0dfbd]'
      : 'border-[#3a352c] bg-[#151411] text-[#d7b777] hover:border-[#d7b777] hover:bg-[#1d1a14]'

  return (
    <Link
      className={`inline-flex rounded-md border px-4 py-2 text-sm font-semibold transition ${className}`}
      href={href}
    >
      {children}
    </Link>
  )
}

export default function AdminDashboardPage() {
  const [statsBySection, setStatsBySection] = useState(getInitialStats)

  useEffect(() => {
    let isMounted = true
    const supabase = createSupabaseBrowserClient()

    async function loadStats() {
      const entries = await Promise.all(
        dashboardSections.map(async (section) => [
          section.title,
          await getContentStats(supabase, section),
        ]),
      )

      if (isMounted) {
        setStatsBySection(Object.fromEntries(entries))
      }
    }

    loadStats()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div>
      <div className="grid gap-5 border-b border-[#2a2721] pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9c8b6e]">
            Dashboard
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-normal leading-tight text-[#f0dfbd] lg:text-5xl">
            Content overview for the portfolio system.
          </h1>
        </div>
        <div className="rounded-md border border-[#2a2721] bg-[#171612] px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8d8678]">
            Workspace
          </p>
          <p className="mt-2 text-lg font-semibold text-[#d7b777]">
            MobinCMS
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6">
        {dashboardSections.map((section) => {
          const sectionStats = statsBySection[section.title]

          return (
            <section
              className="rounded-lg border border-[#2a2721] bg-[#11100e] p-5 sm:p-6"
              key={section.title}
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-[#f0dfbd]">
                    {section.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#8d8678]">
                    {section.description}
                  </p>
                  {sectionStats.error ? (
                    <p className="mt-4 rounded-md border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-200">
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

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {section.stats.map((stat) => (
                  <StatCard
                    isLoading={sectionStats.isLoading}
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
