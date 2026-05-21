'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '../../lib/supabase'
import Button from '../ui/Button'
import ImageUpload from './ImageUpload'
import Input from '../ui/Input'
import RichTextEditor from '../editor/RichTextEditor'
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

function toDateTimeLocal(value) {
  if (!value) {
    return ''
  }

  return new Date(value).toISOString().slice(0, 16)
}

function hasTextContent(html) {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

export default function PostForm({ post }) {
  const router = useRouter()
  const isEditing = Boolean(post?.id)
  const [formData, setFormData] = useState({
    content: post?.content || '',
    cover_image_url: post?.cover_image_url || '',
    excerpt: post?.excerpt || '',
    is_published: post?.is_published || false,
    published_at: toDateTimeLocal(post?.published_at),
    slug: post?.slug || '',
    tags: formatTags(post?.tags),
    title: post?.title || '',
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

    if (!hasTextContent(formData.content)) {
      setErrorMessage('Content is required.')
      return
    }

    setIsSubmitting(true)

    const publishedAt =
      formData.published_at ||
      (formData.is_published ? new Date().toISOString() : null)

    const payload = {
      content: formData.content,
      cover_image_url: formData.cover_image_url || null,
      excerpt: formData.excerpt.trim() || null,
      is_published: formData.is_published,
      published_at: publishedAt,
      slug: formData.slug.trim(),
      tags: parseTags(formData.tags),
      title: formData.title.trim(),
    }

    const supabase = createSupabaseBrowserClient()
    const request = isEditing
      ? supabase.from('posts').update(payload).eq('id', post.id)
      : supabase.from('posts').insert(payload)

    const { error } = await request

    setIsSubmitting(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    router.refresh()
    router.push('/admin/posts')
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

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Excerpt
        </label>
        <Textarea
          rows={3}
          value={formData.excerpt}
          onChange={(event) => updateField('excerpt', event.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Content
        </label>
        <RichTextEditor
          content={formData.content}
          onChange={(html) => updateField('content', html)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Cover image
        </label>
        <div className="mt-1">
          <ImageUpload
            bucketName="post-images"
            imageUrl={formData.cover_image_url}
            pathPrefix="posts"
            previewAlt="Post cover preview"
            onChange={(url) => updateField('cover_image_url', url)}
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tags
          </label>
          <Input
            placeholder="React, CMS, Notes"
            type="text"
            value={formData.tags}
            onChange={(event) => updateField('tags', event.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Published at
          </label>
          <Input
            type="datetime-local"
            value={formData.published_at}
            onChange={(event) => updateField('published_at', event.target.value)}
          />
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
        <input
          checked={formData.is_published}
          className="h-4 w-4 rounded border-gray-300 text-gray-950"
          type="checkbox"
          onChange={(event) => updateField('is_published', event.target.checked)}
        />
        Published
      </label>

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
              ? 'Save post'
              : 'Create post'}
        </Button>
        <Button
          disabled={isSubmitting}
          type="button"
          variant="secondary"
          onClick={() => router.push('/admin/posts')}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
