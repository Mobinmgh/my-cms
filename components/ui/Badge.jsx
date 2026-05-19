const variants = {
  published: 'bg-green-100 text-green-800',
  draft: 'bg-gray-100 text-gray-700',
}

export default function Badge({ children, variant = 'draft' }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  )
}
