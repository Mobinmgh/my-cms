import Link from 'next/link'
import ProjectForm from '../../../../components/forms/ProjectForm'

export default function NewProjectPage() {
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
          New project
        </h1>
      </div>

      <ProjectForm />
    </div>
  )
}
