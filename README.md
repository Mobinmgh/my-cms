# MobinCMS

A reusable headless CMS built with Next.js 14, Tailwind CSS, and Supabase.

This repository currently contains Phase 1 only: the project foundation.
Authentication, admin pages, CRUD screens, image uploads, and rich text editing are intentionally not included yet.

## Setup

Install dependencies:

```bash
npm install
```

Create a Supabase project:

1. Go to the Supabase dashboard.
2. Create a new project.
3. Copy the project URL and anon public key.

Create your local environment file:

```bash
copy .env.local.example .env.local
```

Fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run the development server:

```bash
npm run dev
```

Open http://localhost:3000.

## Supabase Manual Setup

Run the database schema SQL from `AGENTS.md` manually in the Supabase SQL editor.

After that, enable Row Level Security and apply the RLS policies from `AGENTS.md`.

The admin user is not created in this phase. It will be created manually in Supabase Auth before Phase 2 auth work is tested.

## Current Phase

Phase 1 Foundation:

- Next.js 14 App Router project structure
- Tailwind CSS setup
- Supabase browser client
- Supabase server client placeholder
- Environment variable example

## Next Phase

Phase 2 Auth:

- Build `/login`
- Connect Supabase email/password login
- Protect `/admin/*`
- Add logout
