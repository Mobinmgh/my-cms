'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '../../lib/supabase'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'

export default function TestimonialForm({ testimonial }) {
  const router = useRouter()
  const isEditing = Boolean(testimonial?.id)
  const [formData, setFormData] = useState({
    author_name: testimonial?.author_name || '',
    author_role: testimonial?.author_role || '',
    author_company: testimonial?.author_company || '',
    quote: testimonial?.quote || '',
    is_published: testimonial?.is_published || false,
    sort_order: testimonial?.sort_order ?? 0,
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField(name, value) {
    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')

    if (!formData.author_name.trim()) {
      setErrorMessage('Author name is required.')
      return
    }

    if (!formData.quote.trim()) {
      setErrorMessage('Quote is required.')
      return
    }

    setIsSubmitting(true)

    const payload = {
      author_name: formData.author_name.trim(),
      author_role: formData.author_role.trim() || null,
      author_company: formData.author_company.trim() || null,
      quote: formData.quote.trim(),
      is_published: formData.is_published,
      sort_order: Number(formData.sort_order) || 0,
    }

    const supabase = createSupabaseBrowserClient()
    const request = isEditing
      ? supabase.from('testimonials').update(payload).eq('id', testimonial.id)
      : supabase.from('testimonials').insert(payload)

    const { error } = await request

    setIsSubmitting(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    router.refresh()
    router.push('/admin/testimonials')
  }

  return (
    <form className="max-w-2xl space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Author name
        </label>
        <Input
          type="text"
          value={formData.author_name}
          onChange={(event) => updateField('author_name', event.target.value)}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Author role
          </label>
          <Input
            type="text"
            value={formData.author_role}
            onChange={(event) => updateField('author_role', event.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Author company
          </label>
          <Input
            type="text"
            value={formData.author_company}
            onChange={(event) =>
              updateField('author_company', event.target.value)
            }
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Quote</label>
        <Textarea
          value={formData.quote}
          onChange={(event) => updateField('quote', event.target.value)}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sort order
          </label>
          <Input
            type="number"
            value={formData.sort_order}
            onChange={(event) => updateField('sort_order', event.target.value)}
          />
        </div>

        <label className="flex items-center gap-3 pt-6 text-sm font-medium text-gray-700">
          <input
            className="h-4 w-4 rounded border-gray-300 text-gray-950"
            type="checkbox"
            checked={formData.is_published}
            onChange={(event) =>
              updateField('is_published', event.target.checked)
            }
          />
          Published
        </label>
      </div>

      {errorMessage ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Saving...'
            : isEditing
              ? 'Save testimonial'
              : 'Create testimonial'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/admin/testimonials')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
