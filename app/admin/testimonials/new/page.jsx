import Link from 'next/link'
import TestimonialForm from '../../../../components/forms/TestimonialForm'

export default function NewTestimonialPage() {
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
          New testimonial
        </h1>
      </div>

      <TestimonialForm />
    </div>
  )
}
