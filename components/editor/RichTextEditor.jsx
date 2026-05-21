'use client'

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

const toolbarButtons = [
  { label: 'P', action: (editor) => editor.chain().focus().setParagraph().run(), isActive: (editor) => editor.isActive('paragraph') },
  { label: 'H2', action: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: (editor) => editor.isActive('heading', { level: 2 }) },
  { label: 'H3', action: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: (editor) => editor.isActive('heading', { level: 3 }) },
  { label: 'B', action: (editor) => editor.chain().focus().toggleBold().run(), isActive: (editor) => editor.isActive('bold') },
  { label: 'I', action: (editor) => editor.chain().focus().toggleItalic().run(), isActive: (editor) => editor.isActive('italic') },
  { label: 'Bullets', action: (editor) => editor.chain().focus().toggleBulletList().run(), isActive: (editor) => editor.isActive('bulletList') },
  { label: 'Numbers', action: (editor) => editor.chain().focus().toggleOrderedList().run(), isActive: (editor) => editor.isActive('orderedList') },
]

export default function RichTextEditor({ content = '', onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editorProps: {
      attributes: {
        class:
          'min-h-64 rounded-b-md border border-t-0 border-gray-300 px-3 py-3 text-sm leading-7 text-gray-950 outline-none',
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return (
      <div className="rounded-md border border-gray-300 px-3 py-3 text-sm text-gray-600">
        Loading editor...
      </div>
    )
  }

  return (
    <div className="mt-1">
      <div className="flex flex-wrap gap-2 rounded-t-md border border-gray-300 bg-gray-50 p-2">
        {toolbarButtons.map((button) => (
          <button
            className={`rounded-md px-3 py-1 text-sm font-medium ${
              button.isActive(editor)
                ? 'bg-gray-950 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            key={button.label}
            type="button"
            onClick={() => button.action(editor)}
          >
            {button.label}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
