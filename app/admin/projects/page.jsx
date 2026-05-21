'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import Badge from '../../../components/ui/Badge'
import DeleteProjectButton from '../../../components/forms/DeleteProjectButton'
import { createSupabaseBrowserClient } from '../../../lib/supabase'

function formatTags(tags) {
  if (!Array.isArray(tags) || tags.length === 0) {
    return 'No tags'
  }

  return tags.join(', ')
}

export default function ProjectsPage() {
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [projects, setProjects] = useState([])

  useEffect(() => {
    let isMounted = true
    const supabase = createSupabaseBrowserClient()

    supabase
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!isMounted) {
          return
        }

        if (error) {
          setErrorMessage(error.message)
          setProjects([])
          return
        }

        setErrorMessage('')
        setProjects(data ?? [])
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

  function removeProject(id) {
    setProjects((current) => current.filter((project) => project.id !== id))
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-950">Projects</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage portfolio projects and case studies.
          </p>
        </div>
        <Link
          className="inline-flex rounded-md bg-gray-950 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          href="/admin/projects/new"
        >
          New project
        </Link>
      </div>

      {isLoading ? (
        <p className="mt-6 text-sm text-gray-600">Loading projects...</p>
      ) : null}

      {!isLoading && errorMessage ? (
        <p className="mt-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {!isLoading && !errorMessage && projects.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <h2 className="text-base font-medium text-gray-950">
            No projects yet
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create the first project to start managing portfolio work.
          </p>
        </div>
      ) : null}

      {!isLoading && !errorMessage && projects.length > 0 ? (
        <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Project
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Tags
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Sort
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {projects.map((project) => (
                <tr key={project.id}>
                  <td className="px-4 py-4 align-top">
                    <div className="flex gap-4">
                      {project.cover_image_url ? (
                        <img
                          alt=""
                          className="h-14 w-20 rounded-md border border-gray-200 object-cover"
                          src={project.cover_image_url}
                        />
                      ) : (
                        <div className="flex h-14 w-20 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 text-xs text-gray-400">
                          No image
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-950">
                          {project.title}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          {project.slug}
                        </p>
                        {project.category ? (
                          <p className="mt-1 text-sm text-gray-600">
                            {project.category}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="max-w-xs px-4 py-4 align-top text-sm leading-6 text-gray-700">
                    {formatTags(project.tags)}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-wrap gap-2">
                      {project.is_featured ? <Badge>Featured</Badge> : null}
                      <Badge
                        variant={project.is_published ? 'published' : 'draft'}
                      >
                        {project.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-gray-700">
                    {project.sort_order}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        href={`/admin/projects/${project.id}`}
                      >
                        Edit
                      </Link>
                      <DeleteProjectButton
                        id={project.id}
                        onDeleted={removeProject}
                        title={project.title}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
