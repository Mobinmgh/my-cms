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
    author_name_en: testimonial?.author_name_en || testimonial?.author_name || '',
    author_name_fa: testimonial?.author_name_fa || '',
    author_role_en: testimonial?.author_role_en || testimonial?.author_role || '',
    author_role_fa: testimonial?.author_role_fa || '',
    author_company_en:
      testimonial?.author_company_en || testimonial?.author_company || '',
    author_company_fa: testimonial?.author_company_fa || '',
    quote_en: testimonial?.quote_en || testimonial?.quote || '',
    quote_fa: testimonial?.quote_fa || '',
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

    if (!formData.author_name_en.trim()) {
      setErrorMessage('English author name is required.')
      return
    }

    if (!formData.quote_en.trim()) {
      setErrorMessage('English quote is required.')
      return
    }

    if (!formData.author_name_fa.trim()) {
      setErrorMessage('Persian author name is required.')
      return
    }

    if (!formData.quote_fa.trim()) {
      setErrorMessage('Persian quote is required.')
      return
    }

    setIsSubmitting(true)

    const payload = {
      author_name: formData.author_name_en.trim(),
      author_name_en: formData.author_name_en.trim(),
      author_name_fa: formData.author_name_fa.trim(),
      author_role: formData.author_role_en.trim() || null,
      author_role_en: formData.author_role_en.trim() || null,
      author_role_fa: formData.author_role_fa.trim() || null,
      author_company: formData.author_company_en.trim() || null,
      author_company_en: formData.author_company_en.trim() || null,
      author_company_fa: formData.author_company_fa.trim() || null,
      quote: formData.quote_en.trim(),
      quote_en: formData.quote_en.trim(),
      quote_fa: formData.quote_fa.trim(),
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
      <section className="rounded-lg border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-950">English</h2>
        <div className="mt-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Author name
            </label>
            <Input
              type="text"
              value={formData.author_name_en}
              onChange={(event) =>
                updateField('author_name_en', event.target.value)
              }
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Author role
              </label>
              <Input
                type="text"
                value={formData.author_role_en}
                onChange={(event) =>
                  updateField('author_role_en', event.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Author company
              </label>
              <Input
                type="text"
                value={formData.author_company_en}
                onChange={(event) =>
                  updateField('author_company_en', event.target.value)
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quote
            </label>
            <Textarea
              value={formData.quote_en}
              onChange={(event) => updateField('quote_en', event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-950">Persian</h2>
        <div className="mt-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Author name
            </label>
            <Input
              dir="rtl"
              type="text"
              value={formData.author_name_fa}
              onChange={(event) =>
                updateField('author_name_fa', event.target.value)
              }
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Author role
              </label>
              <Input
                dir="rtl"
                type="text"
                value={formData.author_role_fa}
                onChange={(event) =>
                  updateField('author_role_fa', event.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Author company
              </label>
              <Input
                dir="rtl"
                type="text"
                value={formData.author_company_fa}
                onChange={(event) =>
                  updateField('author_company_fa', event.target.value)
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quote
            </label>
            <Textarea
              dir="rtl"
              value={formData.quote_fa}
              onChange={(event) => updateField('quote_fa', event.target.value)}
            />
          </div>
        </div>
      </section>

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
