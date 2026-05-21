import Link from 'next/link'
import PostForm from '../../../../components/forms/PostForm'

export default function NewPostPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          className="text-sm font-medium text-gray-600 hover:text-gray-950"
          href="/admin/posts"
        >
          Back to posts
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-gray-950">
          New post
        </h1>
      </div>

      <PostForm />
    </div>
  )
}
