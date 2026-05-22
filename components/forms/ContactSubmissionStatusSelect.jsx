'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '../../lib/supabase'

const statuses = ['new', 'read', 'archived']

export default function ContactSubmissionStatusSelect({
  id,
  onUpdated,
  status,
}) {
  const [currentStatus, setCurrentStatus] = useState(status)
  const [errorMessage, setErrorMessage] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  async function handleChange(event) {
    const nextStatus = event.target.value
    const previousStatus = currentStatus

    setCurrentStatus(nextStatus)
    setErrorMessage('')
    setIsUpdating(true)

    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase
      .from('contact_submissions')
      .update({ status: nextStatus })
      .eq('id', id)

    setIsUpdating(false)

    if (error) {
      setCurrentStatus(previousStatus)
      setErrorMessage(error.message)
      return
    }

    onUpdated(id, nextStatus)
  }

  return (
    <div className="grid gap-2">
      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Status
      </label>
      <select
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:border-[#d7b777]"
        disabled={isUpdating}
        onChange={handleChange}
        value={currentStatus}
      >
        {statuses.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      {errorMessage ? (
        <p className="text-sm text-red-700">{errorMessage}</p>
      ) : null}
    </div>
  )
}
