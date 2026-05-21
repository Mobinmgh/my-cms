import Link from 'next/link'
import { createSupabaseServerClient } from '../../../lib/supabase-server'
import Badge from '../../../components/ui/Badge'
import DeletePostButton from '../../../components/forms/DeletePostButton'

function formatTags(tags) {
  if (!Array.isArray(tags) || tags.length === 0) {
    return 'No tags'
  }

  return tags.join(', ')
}

function getExcerptPreview(excerpt) {
  if (!excerpt) {
    return 'No excerpt'
  }

  return excerpt.length > 120 ? `${excerpt.slice(0, 120)}...` : excerpt
}

function formatDate(value) {
  if (!value) {
    return 'Not published'
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default async function PostsPage() {
  const supabase = createSupabaseServerClient()
  let posts = []
  let errorMessage = ''

  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      errorMessage = error.message
    } else {
      posts = data ?? []
    }
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : 'Could not load posts.'
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-950">Posts</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage blog posts and long-form writing.
          </p>
        </div>
        <Link
          className="inline-flex rounded-md bg-gray-950 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          href="/admin/posts/new"
        >
          New post
        </Link>
      </div>

      {errorMessage ? (
        <p className="mt-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {!errorMessage && posts.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <h2 className="text-base font-medium text-gray-950">No posts yet</h2>
          <p className="mt-2 text-sm text-gray-600">
            Create the first post to start managing blog content.
          </p>
        </div>
      ) : null}

      {!errorMessage && posts.length > 0 ? (
        <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Post
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Excerpt
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Tags
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Published
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="px-4 py-4 align-top">
                    <div className="flex gap-4">
                      {post.cover_image_url ? (
                        <img
                          alt=""
                          className="h-14 w-20 rounded-md border border-gray-200 object-cover"
                          src={post.cover_image_url}
                        />
                      ) : (
                        <div className="flex h-14 w-20 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 text-xs text-gray-400">
                          No image
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-950">
                          {post.title}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          {post.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-xs px-4 py-4 align-top text-sm leading-6 text-gray-700">
                    {getExcerptPreview(post.excerpt)}
                  </td>
                  <td className="max-w-xs px-4 py-4 align-top text-sm leading-6 text-gray-700">
                    {formatTags(post.tags)}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <Badge variant={post.is_published ? 'published' : 'draft'}>
                      {post.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-gray-700">
                    {formatDate(post.published_at)}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        href={`/admin/posts/${post.id}`}
                      >
                        Edit
                      </Link>
                      <DeletePostButton id={post.id} title={post.title} />
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
