# ShipKit · frontend

Next.js 16 app for ShipKit. See the [root README](../README.md) for the full product overview.

```bash
npm install
npm run dev
```

Opens at [localhost:3000](http://localhost:3000). Stack: Next.js 16 App Router · React 19 · Tailwind v4 · Hugeicons · Satoshi + Instrument Serif Italic + Geist Mono.

**Pipeline lives in [app/api/generate/route.ts](app/api/generate/route.ts)** — GitHub → Ace Chat → parallel fan-out to Suno / Midjourney / Veo. Helpers in [lib/](lib/). See [AGENTS.md](AGENTS.md) for conventions.
