# AGENTS.md — Headless CMS (موبین‌CMS)

## What This Project Is

A reusable headless CMS built with Next.js and Supabase.
It has two parts:

1. **Admin dashboard** — a protected Next.js app where the content owner manages all content.
2. **Public API** — Supabase's auto-generated REST API with RLS, consumed by any frontend.

The first frontend client is Mobin's personal portfolio site.
Future clients can be any website — agency projects, client sites, SaaS products.

The CMS does not care what frontend consumes it.
The frontend does not care how content is managed.
That separation is the whole point.

---

## Developer Profile

- Name: Mobin Moghaddam Samira
- Skill level: Intermediate frontend, learning full-stack
- Stack comfort: React, Tailwind CSS, Supabase (from Ghazato), basic Node.js
- Workflow: AI-assisted (Vibe Coding, agent-based development)
- Goal: Learn the full auth → CRUD → API → frontend cycle through a real product

When generating code, match this level:
- Clean, readable, not over-engineered
- Explain non-obvious decisions inline as comments
- Prefer simple solutions over clever ones
- Do not introduce new libraries without a clear reason

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Admin UI | Next.js 14 (App Router) | SSR, file-based routing, easy API routes |
| Styling | Tailwind CSS | Already familiar |
| Database | Supabase (PostgreSQL) | Already used in Ghazato |
| Auth | Supabase Auth | Single admin user, email/password |
| Storage | Supabase Storage | Image uploads for blog and projects |
| Rich text | TipTap | Headless, React-native, no bloat |
| Public API | Supabase REST (auto-generated) | No separate backend needed |
| Deployment | Vercel (admin) + Supabase (backend) | Simple, free tier sufficient |

Do not introduce Firebase, Prisma, tRPC, or any ORM.
Supabase client handles all database operations directly.

---

## Repository Structure

```
mobincms/
├── AGENTS.md               ← this file
├── README.md
├── .env.local              ← Supabase keys (never commit)
├── .gitignore
├── next.config.js
├── tailwind.config.js
├── package.json
│
├── app/                    ← Next.js App Router
│   ├── layout.jsx          ← root layout
│   ├── page.jsx            ← redirects to /admin or /login
│   ├── login/
│   │   └── page.jsx        ← admin login page
│   └── admin/
│       ├── layout.jsx      ← protected layout (auth check here)
│       ├── page.jsx        ← dashboard home (stats overview)
│       ├── testimonials/
│       │   ├── page.jsx    ← list all testimonials
│       │   ├── new/page.jsx
│       │   └── [id]/page.jsx
│       ├── projects/
│       │   ├── page.jsx
│       │   ├── new/page.jsx
│       │   └── [id]/page.jsx
│       └── posts/
│           ├── page.jsx
│           ├── new/page.jsx
│           └── [id]/page.jsx
│
├── components/
│   ├── ui/                 ← reusable UI primitives
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Textarea.jsx
│   │   ├── Badge.jsx
│   │   └── ConfirmDialog.jsx
│   ├── layout/
│   │   ├── AdminLayout.jsx
│   │   ├── Sidebar.jsx
│   │   └── TopBar.jsx
│   ├── forms/
│   │   ├── TestimonialForm.jsx
│   │   ├── ProjectForm.jsx
│   │   └── PostForm.jsx
│   └── editor/
│       └── RichTextEditor.jsx  ← TipTap wrapper
│
├── lib/
│   ├── supabase.js         ← Supabase client (browser)
│   ├── supabase-server.js  ← Supabase client (server components)
│   └── auth.js             ← auth helpers (getSession, requireAuth)
│
└── hooks/
    ├── useTestimonials.js
    ├── useProjects.js
    └── usePosts.js
```

---

## Database Schema

Run this SQL in Supabase SQL editor to initialize.
Create tables in this order — testimonials first (simplest), posts last.

```sql
-- TESTIMONIALS
create table testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_role text,
  author_company text,
  quote text not null,
  is_published boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PROJECTS
create table projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text,
  challenge text,
  solution text,
  result text,
  tags text[] default '{}',
  live_url text,
  github_url text,
  cover_image_url text,
  is_featured boolean default false,
  is_published boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- POSTS
create table posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  content text,           -- TipTap outputs HTML string
  cover_image_url text,
  tags text[] default '{}',
  is_published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-update updated_at on any row change
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger testimonials_updated_at
  before update on testimonials
  for each row execute function update_updated_at();

create trigger projects_updated_at
  before update on projects
  for each row execute function update_updated_at();

create trigger posts_updated_at
  before update on posts
  for each row execute function update_updated_at();
```

---

## Row Level Security (RLS)

Enable RLS on all tables. Apply these policies.
Public can read published content. Only authenticated admin can write.

```sql
-- Enable RLS
alter table testimonials enable row level security;
alter table projects enable row level security;
alter table posts enable row level security;

-- Public read: published rows only
create policy "Public can read published testimonials"
  on testimonials for select
  using (is_published = true);

create policy "Public can read published projects"
  on projects for select
  using (is_published = true);

create policy "Public can read published posts"
  on posts for select
  using (is_published = true);

-- Admin full access (authenticated user)
create policy "Admin full access to testimonials"
  on testimonials for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Admin full access to projects"
  on projects for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Admin full access to posts"
  on posts for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
```

---

## Auth Model

Single admin user only. No registration flow. No roles table.
Admin account is created once manually in Supabase Auth dashboard.

- Login page: `/login` — email + password form
- On success: redirect to `/admin`
- On any `/admin/*` route: check session server-side, redirect to `/login` if missing
- Logout: clear session, redirect to `/login`

Do not build multi-user auth. Do not build role management.
One user. One password. That is all this needs right now.

---

## Content Types In Detail

### Testimonial
Simplest content type. Build this first.

Fields:
- `author_name` — required, text input
- `author_role` — optional, text input
- `author_company` — optional, text input
- `quote` — required, textarea (no rich text needed)
- `is_published` — toggle, defaults off
- `sort_order` — number input, controls display order on frontend

### Project
Medium complexity. Build second.

Fields:
- `slug` — required, auto-generated from title but editable
- `title` — required, text input
- `category` — optional, text input
- `challenge` — optional, textarea
- `solution` — optional, textarea
- `result` — optional, textarea
- `tags` — tag input (comma-separated, stored as text[])
- `live_url` — optional, url input
- `github_url` — optional, url input
- `cover_image_url` — image upload to Supabase Storage
- `is_featured` — toggle
- `is_published` — toggle
- `sort_order` — number input

### Post (Blog)
Most complex. Build last.

Fields:
- `slug` — required, auto-generated from title but editable
- `title` — required, text input
- `excerpt` — optional, textarea (plain text summary)
- `content` — required, TipTap rich text editor (outputs HTML)
- `cover_image_url` — image upload to Supabase Storage
- `tags` — tag input
- `is_published` — toggle
- `published_at` — date/time picker, set automatically on first publish

---

## Build Order

Follow this sequence exactly. Do not skip ahead.

**Phase 1 — Foundation**
1. Initialize Next.js project with Tailwind
2. Create `.env.local` with Supabase URL and anon key
3. Create `lib/supabase.js` and `lib/supabase-server.js`
4. Run schema SQL in Supabase
5. Apply RLS policies
6. Create admin user in Supabase Auth dashboard

**Phase 2 — Auth**
1. Build `/login` page with email/password form
2. Connect to Supabase Auth signInWithPassword
3. Build protected layout for `/admin/*` that checks session
4. Build logout button
5. Test: unauthenticated user cannot access /admin

**Phase 3 — Testimonials CRUD**
1. Build testimonials list page (`/admin/testimonials`)
2. Build new testimonial form (`/admin/testimonials/new`)
3. Build edit testimonial page (`/admin/testimonials/[id]`)
4. Add delete with confirmation dialog
5. Add publish/unpublish toggle
6. Test: create, read, update, delete, publish all work

**Phase 4 — Connect Portfolio**
1. In the portfolio repo, replace static `testimonials.js` data
2. Fetch from Supabase public API using anon key
3. Only published testimonials appear
4. Test: publish a testimonial in CMS, verify it appears on portfolio

**Phase 5 — Projects CRUD**
Same pattern as testimonials. Add image upload to Supabase Storage.

**Phase 6 — Posts CRUD**
Same pattern. Add TipTap editor. Add published_at logic.

**Phase 7 — Dashboard Home**
Simple stats page: count of published/draft for each content type.
No charts needed. Just numbers.

---

## API Contract (for frontend consumption)

Any frontend fetches content using the Supabase JS client or REST API.
Use the public anon key — RLS handles access control.

```js
// Example: fetch published testimonials (in any frontend)
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const { data, error } = await supabase
  .from('testimonials')
  .select('*')
  .eq('is_published', true)
  .order('sort_order', { ascending: true })
```

The frontend never calls the admin dashboard.
The frontend only talks to Supabase directly.
The admin dashboard also talks to Supabase directly.
There is no custom API layer between them.

---

## UI Design Rules

The admin dashboard is a tool, not a showcase.
It does not need to look premium — it needs to work clearly.

- White or light gray background (not dark — admin UIs are used in daylight)
- Tailwind defaults are fine for layout
- Use simple form elements, clear labels, obvious buttons
- Primary action: solid dark button
- Destructive action (delete): red, always behind a confirmation dialog
- Published state: green badge. Draft: gray badge
- No animations, no gradients, no decorative elements
- Mobile-friendly but desktop-first (admin panels are used on desktop)

---

## Rules for the Agent

- Build one phase at a time. Do not generate all phases at once.
- When asked to build a feature, generate the full working code, not pseudocode.
- Always include the Supabase client import in generated files.
- Always handle loading and error states in UI components.
- Never hardcode Supabase keys — always use environment variables.
- When generating forms, always include basic validation before submit.
- When generating delete actions, always include a confirmation step.
- After completing each phase, summarize what was built and what comes next.
- If a decision has two reasonable options, pick the simpler one and explain why.
- Do not refactor working code unless asked.