'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '../../lib/supabase'
import Button from '../ui/Button'
import ConfirmDialog from '../ui/ConfirmDialog'

export default function DeleteTestimonialButton({ id, authorName }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleDelete() {
    setIsDeleting(true)
    setErrorMessage('')

    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.from('testimonials').delete().eq('id', id)

    setIsDeleting(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setIsOpen(false)
    router.refresh()
  }

  return (
    <>
      <div className="flex flex-col items-start gap-2">
        <Button
          type="button"
          variant="danger"
          onClick={() => setIsOpen(true)}
        >
          Delete
        </Button>
        {errorMessage ? (
          <p className="text-sm text-red-700">{errorMessage}</p>
        ) : null}
      </div>

      <ConfirmDialog
        title="Delete testimonial?"
        description={`This will permanently delete the testimonial from ${authorName}.`}
        confirmLabel="Delete"
        isOpen={isOpen}
        isSubmitting={isDeleting}
        onCancel={() => setIsOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  )
}
