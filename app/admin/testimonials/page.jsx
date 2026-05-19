'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import Badge from '../../../components/ui/Badge'
import DeleteTestimonialButton from '../../../components/forms/DeleteTestimonialButton'
import { createSupabaseBrowserClient } from '../../../lib/supabase'

function getAuthorMeta(testimonial) {
  return [testimonial.author_role, testimonial.author_company]
    .filter(Boolean)
    .join(' at ')
}

function getQuotePreview(quote) {
  if (!quote) {
    return ''
  }

  return quote.length > 120 ? `${quote.slice(0, 120)}...` : quote
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
        <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Author
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Quote
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Sort
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {testimonials.map((testimonial) => (
                <tr key={testimonial.id}>
                  <td className="px-4 py-4 align-top">
                    <p className="font-medium text-gray-950">
                      {testimonial.author_name}
                    </p>
                    {getAuthorMeta(testimonial) ? (
                      <p className="mt-1 text-sm text-gray-600">
                        {getAuthorMeta(testimonial)}
                      </p>
                    ) : null}
                  </td>
                  <td className="max-w-md px-4 py-4 align-top text-sm leading-6 text-gray-700">
                    {getQuotePreview(testimonial.quote)}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <Badge
                      variant={
                        testimonial.is_published ? 'published' : 'draft'
                      }
                    >
                      {testimonial.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-gray-700">
                    {testimonial.sort_order}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        href={`/admin/testimonials/${testimonial.id}`}
                      >
                        Edit
                      </Link>
                      <DeleteTestimonialButton
                        id={testimonial.id}
                        authorName={testimonial.author_name}
                        onDeleted={removeTestimonial}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
