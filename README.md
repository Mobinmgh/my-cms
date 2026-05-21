# MobinCMS

MobinCMS is a small headless CMS admin app for managing content used by Mobin's portfolio and future frontend clients. It stores content in Supabase and relies on Supabase Row Level Security for public read access and authenticated admin management.

## Tech Stack

- Next.js 14 App Router
- React
- Tailwind CSS
- Supabase Auth, Database, and Storage
- TipTap for post rich text editing

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
copy .env.local.example .env.local
```

Set the required variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Do not commit real Supabase keys.

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Supabase Setup

### Tables

MobinCMS expects these tables to exist:

- `testimonials`
- `projects`
- `posts`

The schema is documented in `AGENTS.md`.

### Storage Buckets

Create these Supabase Storage buckets:

- `project-images`
- `post-images`

Both buckets should allow public reads so portfolio/frontends can display uploaded cover images.

### RLS Behavior

Enable Row Level Security on all content tables.

Required behavior:

- Public users can read only published content.
- Authenticated admin users can create, read, update, and delete content.

In practice, public read policies should filter by `is_published = true`, and authenticated users should have full access for admin CRUD.

### Admin User

Create the admin user manually in Supabase:

1. Open the Supabase dashboard.
2. Go to Authentication.
3. Create a user with email and password.
4. Use that account to log in at `/login`.

There is no public registration flow and no role management in this app.

## Completed Features

- Admin login and logout
- Protected admin layout
- Testimonials CRUD
- Projects CRUD with cover image upload
- Posts CRUD with TipTap rich text editing and cover image upload
- Dashboard overview with content counts
- Supabase-backed public content model for frontend consumption

## Related App

The portfolio frontend lives in `../my-portfolio`. It reads published content directly from Supabase using the anon key and RLS policies.
