export default function Input({ className = '', ...props }) {
  return (
    <input
      className={`mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-950 outline-none focus:border-gray-950 focus:ring-1 focus:ring-gray-950 ${className}`}
      {...props}
    />
  )
}
