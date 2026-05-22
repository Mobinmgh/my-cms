'use client'

import { useEffect, useMemo, useState } from 'react'
import ContactSubmissionStatusSelect from '../../../components/forms/ContactSubmissionStatusSelect'
import DeleteContactSubmissionButton from '../../../components/forms/DeleteContactSubmissionButton'
import { createSupabaseBrowserClient } from '../../../lib/supabase'

const filters = ['all', 'new', 'read', 'archived']

const statusStyles = {
  archived: 'bg-gray-100 text-gray-700',
  new: 'bg-amber-100 text-amber-800',
  read: 'bg-green-100 text-green-800',
}

function formatDate(value) {
  if (!value) {
    return 'No date'
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
        statusStyles[status] || statusStyles.new
      }`}
    >
      {status}
    </span>
  )
}

export default function ContactSubmissionsPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [submissions, setSubmissions] = useState([])

  useEffect(() => {
    let isMounted = true
    const supabase = createSupabaseBrowserClient()

    supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!isMounted) {
          return
        }

        if (error) {
          setErrorMessage(error.message)
          setSubmissions([])
          return
        }

        setErrorMessage('')
        setSubmissions(data ?? [])
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const filteredSubmissions = useMemo(() => {
    if (activeFilter === 'all') {
      return submissions
    }

    return submissions.filter((submission) => submission.status === activeFilter)
  }, [activeFilter, submissions])

  function removeSubmission(id) {
    setSubmissions((current) =>
      current.filter((submission) => submission.id !== id),
    )
  }

  function updateSubmissionStatus(id, status) {
    setSubmissions((current) =>
      current.map((submission) =>
        submission.id === id ? { ...submission, status } : submission,
      ),
    )
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-950">
            Contact submissions
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Review messages submitted from the portfolio contact form.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              className={`rounded-full border px-3 py-1.5 text-sm font-medium capitalize transition ${
                activeFilter === filter
                  ? 'border-gray-950 bg-gray-950 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
              }`}
              key={filter}
              onClick={() => setActiveFilter(filter)}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="mt-6 text-sm text-gray-600">
          Loading contact submissions...
        </p>
      ) : null}

      {!isLoading && errorMessage ? (
        <p className="mt-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {!isLoading && !errorMessage && submissions.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <h2 className="text-base font-medium text-gray-950">
            No contact submissions yet
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            New portfolio contact messages will appear here.
          </p>
        </div>
      ) : null}

      {!isLoading &&
      !errorMessage &&
      submissions.length > 0 &&
      filteredSubmissions.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <h2 className="text-base font-medium text-gray-950">
            No {activeFilter} submissions
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Try another filter to see more messages.
          </p>
        </div>
      ) : null}

      {!isLoading && !errorMessage && filteredSubmissions.length > 0 ? (
        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {filteredSubmissions.map((submission) => (
            <article
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              key={submission.id}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-950">
                      {submission.name}
                    </h2>
                    <StatusBadge status={submission.status} />
                  </div>
                  <a
                    className="mt-1 inline-flex text-sm font-medium text-gray-700 hover:text-gray-950"
                    href={`mailto:${submission.email}`}
                  >
                    {submission.email}
                  </a>
                </div>
                <p className="text-sm text-gray-500">
                  {formatDate(submission.created_at)}
                </p>
              </div>

              <p className="mt-5 whitespace-pre-wrap rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                {submission.message}
              </p>

              <div className="mt-5 flex flex-col gap-4 border-t border-gray-200 pt-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Source
                  </span>
                  <span className="text-sm font-medium text-gray-800">
                    {submission.source || 'portfolio'}
                  </span>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <ContactSubmissionStatusSelect
                    id={submission.id}
                    onUpdated={updateSubmissionStatus}
                    status={submission.status || 'new'}
                  />
                  <DeleteContactSubmissionButton
                    id={submission.id}
                    name={submission.name}
                    onDeleted={removeSubmission}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  )
}
