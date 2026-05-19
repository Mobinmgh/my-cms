'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import TestimonialForm from '../../../../components/forms/TestimonialForm'
import { createSupabaseBrowserClient } from '../../../../lib/supabase'

export default function EditTestimonialPage({ params }) {
  const [testimonial, setTestimonial] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const supabase = createSupabaseBrowserClient()

    supabase
      .from('testimonials')
      .select('*')
      .eq('id', params.id)
      .single()
      .then(({ data, error }) => {
        if (!isMounted) {
          return
        }

        if (error) {
          setErrorMessage(error.message)
          setTestimonial(null)
          return
        }

        setErrorMessage('')
        setTestimonial(data)
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [params.id])

  return (
    <div>
      <div className="mb-6">
        <Link
          className="text-sm font-medium text-gray-600 hover:text-gray-950"
          href="/admin/testimonials"
        >
          Back to testimonials
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-gray-950">
          Edit testimonial
        </h1>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-600">Loading testimonial...</p>
      ) : null}

      {!isLoading && errorMessage ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {!isLoading && !errorMessage && testimonial ? (
        <TestimonialForm testimonial={testimonial} />
      ) : null}
    </div>
  )
}
