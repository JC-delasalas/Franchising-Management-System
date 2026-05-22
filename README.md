# FranchiseHub

A franchise control tower for Philippine franchisors. One platform to replace the chaos of Messenger, Excel, and Google Drive for managing branches, sales reports, royalties, compliance, documents, and support requests.

**Status**: rebuild in progress — see [`PLAN.md`](./PLAN.md) for the current phase.

## Source of truth

- [`Franchise.md`](./Franchise.md) — canonical product spec (MVP scope, roles, rules)
- [`CLAUDE.md`](./CLAUDE.md) — operating guide for AI coding assistants on this repo
- [`PLAN.md`](./PLAN.md) — 16-week implementation roadmap, current phase, checklist
- [`AGENTS.md`](./AGENTS.md) — Next.js 16 warning (breaking changes from earlier versions)

## Stack

| Layer        | Tech                                                  |
| ------------ | ----------------------------------------------------- |
| Framework    | Next.js 16 (App Router, React 19, Turbopack)          |
| Styling      | Tailwind v4 (CSS-first `@theme` in `app/globals.css`) |
| Backend      | Supabase (auth, Postgres, storage, realtime)          |
| Forms        | react-hook-form + zod                                 |
| Server state | TanStack Query (client) + RSC fetch (server)          |
| Emails       | Resend + React Email                                  |
| Errors       | Sentry                                                |
| PWA          | Serwist                                               |
| i18n         | next-intl                                             |
| Hosting      | Vercel                                                |

Full stack details: [`CLAUDE.md` § Tech stack](./CLAUDE.md).

## Develop

```bash
# Install
npm install

# Run dev server (Turbopack)
npm run dev

# Typecheck, lint, format check, build
npm run typecheck
npm run lint
npm run format
npm run build
```

## Environment

Copy `.env.example` to `.env.local` and fill in Supabase credentials.

Project: `egucihmwendiaaoskpno` ([dashboard](https://supabase.com/dashboard/project/egucihmwendiaaoskpno)).

`SUPABASE_SERVICE_ROLE_KEY` must NEVER appear in a `NEXT_PUBLIC_*` variable — it bypasses Row-Level Security.

## Repo layout

```
app/                    Next.js App Router pages, layouts, API routes
lib/                    Shared utilities (cn, Supabase clients)
public/                 Static assets (logos, favicons, manifest)
proxy.ts                Next.js 16 proxy (was middleware.ts) — refreshes auth session
.claude/                Project-scoped Claude Code config
                          - skills/franchise-control-tower/  expert skill
                          - settings.json                    permissions + rules
.github/workflows/      CI pipeline
```

## License

See [`LICENSE`](./LICENSE).
