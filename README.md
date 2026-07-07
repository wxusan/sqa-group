# SQA.uz — Standart and Quality Assessment Group

Corporate website + custom admin CMS. Next.js 16 (App Router), Tailwind v4, Prisma + PostgreSQL, NextAuth v5, next-intl (uz / ru / en).

## Quick start

```bash
npm install

# 1. PostgreSQL — easiest via Docker:
docker run -d --name sqa-pg -e POSTGRES_USER=sqa -e POSTGRES_PASSWORD=sqa -e POSTGRES_DB=sqa -p 5432:5432 postgres:16

# 2. Environment
cp .env.example .env   # adjust DATABASE_URL / ADMIN_* / AUTH_SECRET

# 3. Database
npx prisma migrate dev   # creates schema + runs seed automatically
# (or: npx prisma db seed)

# 4. Run
npm run dev              # http://localhost:3000  → redirects to /uz
```

Admin: `http://localhost:3000/admin` — credentials from `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`, seeded on first run). **Change them before deploying.**

## What's inside

- **Public site** (uz default, ru, en): home, about, certification body, laboratories, team (+detail), news (+detail), financing, schemes, accreditation scopes ×2, appeals (with copyable template), contacts. All content per the client's page plan.
- **Admin CMS**: staff / news / partners CRUD with UZ-RU-EN translation tabs, image upload, ordering, search, preview links, media library, dashboard.
- **Publishing rule** (enforced server-side): an item cannot be published until uz, ru and en translations are complete. The admin shows per-locale completeness badges.
- **Partner carousel**: two rows, opposite directions, pause on hover, seamless loop, static grid under `prefers-reduced-motion`.
- **Signature design element**: guilloche accreditation ribbon with real O'ZAK registry data (MS.0052 / SL.0162).
- **Media storage**: local `/public/uploads` by default; set `CLOUDINARY_*` env vars to switch to Cloudinary automatically (required for Vercel — its filesystem is ephemeral).
- SEO: per-locale metadata, hreflang alternates, sitemap.xml, robots.txt (admin excluded).

## Tests

```bash
npx vitest run          # unit: publish rule, slugify
npx playwright test     # e2e: starts the prod server itself (build first: npm run build)
```

E2E covers: homepage desktop+mobile, carousel directions, staff/news card → detail, language switcher preserving pages, admin auth redirect + login.

## Deploying

- **Vercel**: set `DATABASE_URL` (Supabase/Railway/Neon), `AUTH_SECRET` (generate: `openssl rand -base64 32`), `AUTH_TRUST_HOST=true`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CLOUDINARY_*`, `NEXT_PUBLIC_SITE_URL=https://www.sqa.uz`. Run `npx prisma migrate deploy && npx prisma db seed` against prod DB once.
- Old certificates/team photos/partner logos are already migrated into `/public/images`.

## Known follow-ups

- Second laboratory: the client plan mentions two labs; only one accreditation certificate exists publicly (SL.0162). Lab #2 currently has neutral copy — update `messages/*.json` → `laboratories.lab2*` when real details arrive.
- Social links in the footer point to platform homepages — replace with SQA's real profiles.
- `director@sqa.uz` is a placeholder address from the client plan — confirm it exists.
