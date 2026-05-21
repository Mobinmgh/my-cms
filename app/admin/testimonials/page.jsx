'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import Badge from '../../../components/ui/Badge'
import DeleteTestimonialButton from '../../../components/forms/DeleteTestimonialButton'
import { createSupabaseBrowserClient } from '../../../lib/supabase'

function getEnglishAuthor(testimonial) {
  return testimonial.author_name_en || testimonial.author_name || ''
}

function getPersianAuthor(testimonial) {
  return testimonial.author_name_fa || ''
}

function getEnglishMeta(testimonial) {
  return [
    testimonial.author_role_en || testimonial.author_role,
    testimonial.author_company_en || testimonial.author_company,
  ]
    .filter(Boolean)
    .join(' at ')
}

function getPersianMeta(testimonial) {
  return [testimonial.author_role_fa, testimonial.author_company_fa]
    .filter(Boolean)
    .join('، ')
}

function getEnglishQuote(testimonial) {
  return testimonial.quote_en || testimonial.quote || ''
}

function getPersianQuote(testimonial) {
  return testimonial.quote_fa || ''
}

function TestimonialLanguageBlock({
  author,
  dir,
  emptyMessage,
  label,
  meta,
  quote,
}) {
  const hasContent = author || meta || quote

  return (
    <div
      className="rounded-lg border border-gray-200 bg-white p-4"
      dir={dir}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
          {label}
        </span>
      </div>

      {hasContent ? (
        <div className="mt-4">
          <p className="font-semibold text-gray-950">{author}</p>
          {meta ? <p className="mt-1 text-sm text-gray-600">{meta}</p> : null}
          {quote ? (
            <p className="mt-4 line-clamp-4 text-sm leading-6 text-gray-700">
              {quote}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="mt-4 text-sm text-gray-500">{emptyMessage}</p>
      )}
    </div>
  )
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const supabase = createSupabaseBrowserClient()

    supabase
      .from('testimonials')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!isMounted) {
          return
        }

        if (error) {
          setErrorMessage(error.message)
          setTestimonials([])
          return
        }

        setErrorMessage('')
        setTestimonials(data ?? [])
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  function removeTestimonial(id) {
    setTestimonials((current) =>
      current.filter((testimonial) => testimonial.id !== id),
    )
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-950">
            Testimonials
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage portfolio testimonials.
          </p>
        </div>
        <Link
          className="inline-flex rounded-md bg-gray-950 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          href="/admin/testimonials/new"
        >
          New testimonial
        </Link>
      </div>

      {isLoading ? (
        <p className="mt-6 text-sm text-gray-600">Loading testimonials...</p>
      ) : null}

      {!isLoading && errorMessage ? (
        <p className="mt-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {!isLoading && !errorMessage && testimonials.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <h2 className="text-base font-medium text-gray-950">
            No testimonials yet
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create the first testimonial to start managing social proof.
          </p>
        </div>
      ) : null}

      {!isLoading && !errorMessage && testimonials.length > 0 ? (
        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {testimonials.map((testimonial) => (
            <article
              className="rounded-xl border border-gray-200 bg-gray-50 p-5 shadow-sm"
              key={testimonial.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={testimonial.is_published ? 'published' : 'draft'}
                  >
                    {testimonial.is_published ? 'Published' : 'Draft'}
                  </Badge>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-200">
                    Sort {testimonial.sort_order}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    href={`/admin/testimonials/${testimonial.id}`}
                  >
                    Edit
                  </Link>
                  <DeleteTestimonialButton
                    id={testimonial.id}
                    authorName={getEnglishAuthor(testimonial)}
                    onDeleted={removeTestimonial}
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <TestimonialLanguageBlock
                  author={getEnglishAuthor(testimonial)}
                  dir="ltr"
                  emptyMessage="English version missing"
                  label="EN"
                  meta={getEnglishMeta(testimonial)}
                  quote={getEnglishQuote(testimonial)}
                />
                <TestimonialLanguageBlock
                  author={getPersianAuthor(testimonial)}
                  dir="rtl"
                  emptyMessage="Persian version missing"
                  label="FA"
                  meta={getPersianMeta(testimonial)}
                  quote={getPersianQuote(testimonial)}
                />
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  )
}
