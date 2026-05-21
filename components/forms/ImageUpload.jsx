'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '../../lib/supabase'
import Button from '../ui/Button'

function sanitizeFileName(fileName) {
  return fileName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9.-]/g, '')
}

export default function ImageUpload({ imageUrl, onChange }) {
  const [errorMessage, setErrorMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  async function handleUpload(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    setErrorMessage('')

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please choose an image file.')
      return
    }

    setIsUploading(true)

    const supabase = createSupabaseBrowserClient()
    const filePath = `projects/${Date.now()}-${sanitizeFileName(file.name)}`
    const { error } = await supabase.storage
      .from('project-images')
      .upload(filePath, file)

    if (error) {
      setErrorMessage(error.message)
      setIsUploading(false)
      return
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('project-images').getPublicUrl(filePath)

    onChange(publicUrl)
    setIsUploading(false)
  }

  return (
    <div className="space-y-3">
      {imageUrl ? (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
          <img
            alt="Project cover preview"
            className="h-48 w-full object-cover"
            src={imageUrl}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
          {isUploading ? 'Uploading...' : 'Upload image'}
          <input
            accept="image/*"
            className="sr-only"
            disabled={isUploading}
            type="file"
            onChange={handleUpload}
          />
        </label>

        {imageUrl ? (
          <Button
            disabled={isUploading}
            type="button"
            variant="secondary"
            onClick={() => onChange('')}
          >
            Clear image
          </Button>
        ) : null}
      </div>

      {errorMessage ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}
