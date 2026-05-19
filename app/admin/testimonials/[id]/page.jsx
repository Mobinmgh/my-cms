import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '../../../../lib/supabase-server'
import TestimonialForm from '../../../../components/forms/TestimonialForm'

export default async function EditTestimonialPage({ params }) {
  const supabase = createSupabaseServerClient()
  const { data: testimonial, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !testimonial) {
    notFound()
  }

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

      <TestimonialForm testimonial={testimonial} />
    </div>
  )
}
