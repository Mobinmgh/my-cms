import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '../../../../lib/supabase-server'
import PostForm from '../../../../components/forms/PostForm'

export default async function EditPostPage({ params }) {
  const supabase = createSupabaseServerClient()
  let errorMessage = ''
  let post = null

  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', params.id)
      .maybeSingle()

    if (error) {
      errorMessage = error.message
    } else {
      post = data
    }
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : 'Could not load post.'
  }

  if (!errorMessage && !post) {
    notFound()
  }

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
          Edit post
        </h1>
      </div>

      {errorMessage ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : (
        <PostForm post={post} />
      )}
    </div>
  )
}
