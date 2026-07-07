# CLAUDE.md — SQA.uz project conventions

## Stack
Next.js 16 App Router + TS, Tailwind v4 (tokens in `src/app/globals.css` `@theme`), Prisma 6 + PostgreSQL, NextAuth v5 (credentials, JWT), next-intl v4 (`uz` default, `ru`, `en`, prefix always).

## Layout of the code
- `src/app/[locale]/…` — public pages (server components, `revalidate = 120` where DB-backed)
- `src/app/admin/…` — non-localized admin, every page checks `auth()` and is `force-dynamic`
- `src/lib/actions.ts` — ALL mutations as server actions; every action calls `requireAdmin()`
- `src/lib/publish.ts` — translation-completeness rule; enforce on the server, never only in UI
- `messages/{uz,ru,en}.json` — static page copy. DB translations handle dynamic content (staff/news/partners)
- Storage: `src/lib/storage.ts` — Cloudinary if env present, else local `/public/uploads`

## Rules
- Brand: primary `#2003bd` (from the actual logo), ink `#10153a`, band `#f2f4fb`, radius 8px. No new colors without reason.
- Uzbek is Latin script (modern standard), not Cyrillic.
- Any new public content type MUST follow the translation pattern: parent row + `XxxTranslation` with `@@unique([parentId, locale])` + publish validation via `missingTranslations`.
- Accreditation facts are real legal data — never invent numbers/dates. Source: O'ZAK.MS.0052 (ISO/IEC 17065:2015, until 11.01.2027), O'ZAK.SL.0162 (ISO/IEC 17025:2019, until 10.01.2027).
- Quality gates before any "done": `npm run lint`, `npm run build`, `npx vitest run`, `npx playwright test`.
- Conventional commits; one vertical slice per commit.
