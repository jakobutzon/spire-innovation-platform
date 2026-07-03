# 🌱 Spire — Innovation Management Platform

**Spire** is a Danish-language web platform for corporate innovation management. It turns an
organisation's scattered ideas into a structured, transparent and measurable pipeline:
**category → idea → execution**. Every idea is public, employees vote and give feedback, leaders
decide, and the original author's credit follows the idea all the way from suggestion to shipped
project.

> Built as a portfolio project to demonstrate full-stack product thinking: opinionated product
> design, a polished component system, gamification, role-based flows, and real authentication.

**🔗 Live demo:** _(added after deployment)_ — use the **“Prøv demoen som gæst” (Try as guest)**
button to explore instantly, no signup required.

---

## ✨ Highlights

- **Public, gamified idea flow** — employees submit ideas, then upvote or skip their colleagues'
  ideas and leave inline feedback. Everything is out in the open.
- **Level system** — every meaningful action (submit / decide / comment on someone else's idea)
  earns +1 toward the next level. Levels rank the leaderboard; avatars carry a visible level badge.
- **Leader decision flow** — a dedicated “Overblik” page where leaders send the best ideas to a
  project or reject them **with a required reason** (the idea isn't lost — it moves to a clearly
  marked “rejected” section with the reason pinned as the highlighted comment).
- **Execution board** — once an idea becomes a project, innovation stops and execution begins:
  a leader-configurable Kanban (Skal laves → I gang → Afventer feedback → Færdig) with a
  success/not-success outcome, a per-project to-do list, and a project comment thread.
- **Credit that follows the idea** — the originator stays attached as project lead, from
  suggestion to execution.
- **Leader admin** — editable, reorderable categories and pipeline stages on a dedicated
  “Indstillinger” page.
- **My profile** — every user gets a profile page with their ideas, projects, progress and badges,
  plus editable avatar (colour or uploaded image) and account settings.
- **Authentication** — real email/password auth via **Supabase**, plus a one-click **guest mode**
  so anyone can explore the full app immediately.
- **Demo role switching** — flip between Employee / Leader / Admin to see each perspective.

## 🛠️ Tech stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS v4 (`@theme` tokens), lucide-react icons |
| Charts | Recharts |
| Auth & storage | Supabase (Auth + Postgres profiles + Storage for avatars) |
| Language | TypeScript (strict) |
| Hosting | Vercel |

The application content runs on a rich in-memory mock-data layer (a single typed React context
store), which keeps the demo fast and instantly explorable. Supabase is layered on top for real
authentication, profile persistence and avatar uploads.

## 🚀 Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# then fill in your Supabase project URL + anon/publishable key

# 3. Run the dev server
npm run dev
# open http://localhost:3000  →  click “Prøv demoen som gæst”
```

### Environment variables

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon / publishable key |

Both are public client keys. Without them the app still runs — the guest demo works, only the
account features are hidden.

### Supabase schema

The app expects a namespaced `spire_profiles` table (linked to `auth.users`) and a public
`spire-avatars` storage bucket, both protected by row-level security. See the SQL in
`supabase/migrations/` to reproduce it.

## 📦 Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Lint the codebase |

## 📝 Note

The interface is intentionally in **Danish**, matching its target market. It's a demo/portfolio
build: the innovation content (ideas, projects, users) is seeded mock data, while authentication,
profile storage and avatar uploads are backed by a real Supabase project.

---

<sub>Made with Next.js, React &amp; Supabase.</sub>
