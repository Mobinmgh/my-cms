'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '../../lib/supabase'
import Button from '../ui/Button'
import ImageUpload from './ImageUpload'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function formatTags(tags) {
  return Array.isArray(tags) ? tags.join(', ') : ''
}

function parseTags(value) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function isValidOptionalUrl(value) {
  if (!value.trim()) {
    return true
  }

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export default function ProjectForm({ project }) {
  const router = useRouter()
  const isEditing = Boolean(project?.id)
  const [formData, setFormData] = useState({
    category: project?.category || '',
    challenge: project?.challenge || '',
    cover_image_url: project?.cover_image_url || '',
    github_url: project?.github_url || '',
    is_featured: project?.is_featured || false,
    is_published: project?.is_published || false,
    live_url: project?.live_url || '',
    result: project?.result || '',
    slug: project?.slug || '',
    solution: project?.solution || '',
    sort_order: project?.sort_order ?? 0,
    tags: formatTags(project?.tags),
    title: project?.title || '',
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [isSlugEdited, setIsSlugEdited] = useState(isEditing)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField(name, value) {
    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function updateTitle(value) {
    setFormData((current) => ({
      ...current,
      slug: !isEditing && !isSlugEdited ? slugify(value) : current.slug,
      title: value,
    }))
  }

  function updateSlug(value) {
    setIsSlugEdited(true)
    updateField('slug', slugify(value))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')

    if (!formData.title.trim()) {
      setErrorMessage('Title is required.')
      return
    }

    if (!formData.slug.trim()) {
      setErrorMessage('Slug is required.')
      return
    }

    if (!isValidOptionalUrl(formData.live_url)) {
      setErrorMessage('Live URL must be a valid http or https URL.')
      return
    }

    if (!isValidOptionalUrl(formData.github_url)) {
      setErrorMessage('GitHub URL must be a valid http or https URL.')
      return
    }

    setIsSubmitting(true)

    const payload = {
      category: formData.category.trim() || null,
      challenge: formData.challenge.trim() || null,
      cover_image_url: formData.cover_image_url || null,
      github_url: formData.github_url.trim() || null,
      is_featured: formData.is_featured,
      is_published: formData.is_published,
      live_url: formData.live_url.trim() || null,
      result: formData.result.trim() || null,
      slug: formData.slug.trim(),
      solution: formData.solution.trim() || null,
      sort_order: Number(formData.sort_order) || 0,
      tags: parseTags(formData.tags),
      title: formData.title.trim(),
    }

    const supabase = createSupabaseBrowserClient()
    const request = isEditing
      ? supabase.from('projects').update(payload).eq('id', project.id)
      : supabase.from('projects').insert(payload)

    const { error } = await request

    setIsSubmitting(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    router.refresh()
    router.push('/admin/projects')
  }

  return (
    <form className="max-w-3xl space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <Input
            type="text"
            value={formData.title}
            onChange={(event) => updateTitle(event.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Slug
          </label>
          <Input
            type="text"
            value={formData.slug}
            onChange={(event) => updateSlug(event.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <Input
            type="text"
            value={formData.category}
            onChange={(event) => updateField('category', event.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tags
          </label>
          <Input
            placeholder="React, Supabase, Performance"
            type="text"
            value={formData.tags}
            onChange={(event) => updateField('tags', event.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Challenge
        </label>
        <Textarea
          value={formData.challenge}
          onChange={(event) => updateField('challenge', event.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Solution
        </label>
        <Textarea
          value={formData.solution}
          onChange={(event) => updateField('solution', event.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Result
        </label>
        <Textarea
          value={formData.result}
          onChange={(event) => updateField('result', event.target.value)}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Live URL
          </label>
          <Input
            type="url"
            value={formData.live_url}
            onChange={(event) => updateField('live_url', event.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            GitHub URL
          </label>
          <Input
            type="url"
            value={formData.github_url}
            onChange={(event) => updateField('github_url', event.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Cover image
        </label>
        <div className="mt-1">
          <ImageUpload
            imageUrl={formData.cover_image_url}
            onChange={(url) => updateField('cover_image_url', url)}
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
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
            checked={formData.is_featured}
            className="h-4 w-4 rounded border-gray-300 text-gray-950"
            type="checkbox"
            onChange={(event) =>
              updateField('is_featured', event.target.checked)
            }
          />
          Featured
        </label>

        <label className="flex items-center gap-3 pt-6 text-sm font-medium text-gray-700">
          <input
            checked={formData.is_published}
            className="h-4 w-4 rounded border-gray-300 text-gray-950"
            type="checkbox"
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
              ? 'Save project'
              : 'Create project'}
        </Button>
        <Button
          disabled={isSubmitting}
          type="button"
          variant="secondary"
          onClick={() => router.push('/admin/projects')}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
