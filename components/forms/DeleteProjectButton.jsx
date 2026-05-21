'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '../../lib/supabase'
import Button from '../ui/Button'
import ConfirmDialog from '../ui/ConfirmDialog'

export default function DeleteProjectButton({ id, onDeleted, title }) {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  async function handleDelete() {
    setErrorMessage('')
    setIsDeleting(true)

    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.from('projects').delete().eq('id', id)

    setIsDeleting(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setIsOpen(false)
    if (onDeleted) {
      onDeleted(id)
      return
    }

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
        confirmLabel="Delete"
        description={`This will permanently delete "${title}".`}
        isOpen={isOpen}
        isSubmitting={isDeleting}
        title="Delete project?"
        onCancel={() => setIsOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  )
}
