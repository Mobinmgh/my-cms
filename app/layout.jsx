import './globals.css'

export const metadata = {
  title: 'MobinCMS',
  description: 'A reusable headless CMS built with Next.js and Supabase.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
