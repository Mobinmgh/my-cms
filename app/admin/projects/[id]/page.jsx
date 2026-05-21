'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import ProjectForm from '../../../../components/forms/ProjectForm'
import { createSupabaseBrowserClient } from '../../../../lib/supabase'

export default function EditProjectPage({ params }) {
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [project, setProject] = useState(null)

  useEffect(() => {
    let isMounted = true
    const supabase = createSupabaseBrowserClient()

    supabase
      .from('projects')
      .select('*')
      .eq('id', params.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!isMounted) {
          return
        }

        if (error) {
          setErrorMessage(error.message)
          setProject(null)
          return
        }

        if (!data) {
          setErrorMessage('Project not found.')
          setProject(null)
          return
        }

        setErrorMessage('')
        setProject(data)
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [params.id])

  return (
    <div>
      <div className="mb-6">
        <Link
          className="text-sm font-medium text-gray-600 hover:text-gray-950"
          href="/admin/projects"
        >
          Back to projects
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-gray-950">
          Edit project
        </h1>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-600">Loading project...</p>
      ) : null}

      {!isLoading && errorMessage ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {!isLoading && !errorMessage && project ? (
        <ProjectForm project={project} />
      ) : null}
    </div>
  )
}
