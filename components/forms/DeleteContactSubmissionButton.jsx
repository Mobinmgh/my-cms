'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '../../lib/supabase'
import Button from '../ui/Button'
import ConfirmDialog from '../ui/ConfirmDialog'

export default function DeleteContactSubmissionButton({ id, name, onDeleted }) {
  const [errorMessage, setErrorMessage] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  async function handleDelete() {
    setErrorMessage('')
    setIsDeleting(true)

    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase
      .from('contact_submissions')
      .delete()
      .eq('id', id)

    setIsDeleting(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setIsOpen(false)
    onDeleted(id)
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
        description={`This will permanently delete the contact submission from ${name}.`}
        isOpen={isOpen}
        isSubmitting={isDeleting}
        onCancel={() => setIsOpen(false)}
        onConfirm={handleDelete}
        title="Delete contact submission?"
      />
    </>
  )
}
