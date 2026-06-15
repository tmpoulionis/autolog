# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AutoLog** is an AI-powered developer logging web application. Users write rough log entries about their work; an AI agent (Claude API) cleans and formats them, appending them to a structured log file. The app also supports RAG-based Q&A over the log, an integrated task list with completion tracking, a log viewer/editor, and export to multiple formats.

# Your rule
Your main role is to help the user building this project step-by-step and explaining things the user asks like he is a junior in computer sciences. You are not a Senior Software engineer working at a company and building a project, you ARE a Senior Software Engineer teaching Juniors how to be Software Engineers, and become experts like yourself.

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript (strict mode) |
| Frontend + Backend | Next.js 16 (App Router) |
| Database | Convex |
| Auth | Clerk |
| Payments | Stripe / Clerk Billing |
| AI | Anthropic Claude API |
| Styling | Tailwind CSS v4 |
| Analytics | PostHog |
| Hosting | Vercel |
| Package manager | pnpm |

> Convex, Clerk, Stripe, PostHog, and the Claude API are **not yet installed**. They will be added as development progresses.

## Commands

```bash
pnpm dev        # Start dev server at http://localhost:3000
pnpm build      # Production build (runs TypeScript compiler + Next.js build)
pnpm start      # Serve the production build locally
pnpm lint       # Run ESLint across the project
```

## Project Structure

```
autolog/
├── app/                  # Next.js App Router — all routes and UI live here
│   ├── layout.tsx        # Root layout: fonts, global providers wrap every page
│   ├── globals.css       # Tailwind v4 import + CSS custom properties (theme tokens)
│   └── page.tsx          # "/" route — currently the default scaffold page
├── public/               # Static assets served at the root URL (SVGs, images)
├── next.config.ts        # Next.js configuration
├── tsconfig.json         # TypeScript config — path alias "@/*" maps to repo root
├── eslint.config.mjs     # ESLint flat config (Next.js preset)
└── postcss.config.mjs    # PostCSS wired for Tailwind v4
```

### App Router conventions (Next.js)

- Every **folder** inside `app/` with a `page.tsx` becomes a URL route (e.g. `app/dashboard/page.tsx` → `/dashboard`).
- `layout.tsx` files wrap all pages at that level and below — use them for persistent UI (nav, sidebar) and context providers.
- Files named `route.ts` inside `app/` are **API endpoints** — this is where backend logic (Claude API calls, Convex mutations) will live.
- `"use client"` at the top of a file opts it into the browser bundle; omit it to keep the file as a React Server Component (runs only on the server).

## Path Alias

`@/` resolves to the repository root. Use it instead of relative `../` chains:

```ts
import { something } from "@/lib/utils"; // instead of "../../lib/utils"
```

## Tailwind v4 Note

This project uses Tailwind CSS **v4**, which imports via a single CSS directive (`@import "tailwindcss"`) rather than the v3 `@tailwind base/components/utilities` directives. Theme tokens are defined with `@theme` blocks in CSS, not in `tailwind.config.js`.

## Planned Architecture (not yet built)

```
app/
├── (auth)/               # Clerk sign-in / sign-up routes
├── dashboard/            # Main app shell after login
│   ├── log/              # Log viewer + editor
│   ├── tasks/            # Integrated task list
│   └── export/           # Export log to PDF, Markdown, etc.
├── api/
│   ├── ai/route.ts       # Claude API: entry formatting + RAG Q&A
│   └── webhook/          # Stripe + Clerk webhooks
convex/                   # Convex schema, queries, mutations, actions
lib/                      # Shared utilities (Claude client, Convex helpers)
components/               # Reusable UI components
```
