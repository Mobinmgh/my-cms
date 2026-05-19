'use client'

import Button from './Button'

export default function ConfirmDialog({
  confirmLabel = 'Delete',
  description,
  isOpen,
  isSubmitting = false,
  onCancel,
  onConfirm,
  title = 'Are you sure?',
}) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-gray-700">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Deleting...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
