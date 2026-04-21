# ShipKit

One-page launch-kit generator built on Ace Data Cloud. Paste a GitHub repo URL, get back a cinematic trailer, theme song, poster set, and launch copy in ~60 seconds. Billed per request via x402 (USDC on Base) — no subscriptions.

Target cost per kit: **~$0.50–$0.80** vs. ~$155/mo in equivalent subscriptions (Runway + Suno + Midjourney + ChatGPT).

Built for the Ace Data Cloud hackathon. Rubric-locked goals: platform depth (4+ services), post engagement (shareable outputs), cost clarity (live x402 receipt), Nexior deploy (+10 bonus), Agent Skill qualifier (publish `SKILL.md`).

## Repo layout

- [frontend/](frontend/) — Next.js 16 app (App Router, React 19, Tailwind v4). See [frontend/AGENTS.md](frontend/AGENTS.md) — **Next.js 16 has breaking changes from prior versions; consult `node_modules/next/dist/docs/` before writing Next code.**
- Backend orchestrator — TBD (planned Node or Python; single `POST /generate` endpoint fanning out to 4 Ace APIs in parallel).

## Pipeline (the whole product)

```
GitHub URL
  → GitHub API: /repos/{owner}/{repo}  (name, desc, README)
  → POST /v1/chat/completions          (creative brief, JSON mode)
  → Parallel fan-out:
      • Suno       → 30s theme song
      • Midjourney → 3 posters (16:9, 1:1, 9:16)
      • Luma       → 5–10s cinematic trailer
      • Chat       → README rewrite + 5-tweet thread
  → Poll until complete
  → Render kit page + x402 settlement receipt
```

All 3 media calls fire in parallel. That's the product.

## Ace Data Cloud

- Base URL: `https://api.acedata.cloud`
- Auth: `Authorization: Bearer $ACEDATA_API_TOKEN` (one global credential works across all services — toggle "Allow Use General Balance" ON per subscription)
- Docs hub: https://docs.acedata.cloud (every service page has an interactive sandbox — test there before coding)
- Console: https://platform.acedata.cloud

### Endpoints in use

| Service | Endpoint | Purpose | Notes |
|---|---|---|---|
| Chat | `POST /v1/chat/completions` | Creative brief, README rewrite, tweets | Use `gpt-4o-mini` or `deepseek-chat` for cost; OpenAI response shape; set `response_format: {type: "json_object"}` |
| Suno | `POST /suno/audios` | Theme song | `action: "generate"`; simple (prompt-only) vs. custom (lyric/title/style); returns 2 variants; stream URL in 30–40s, MP3 in 2–3 min |
| Midjourney | `POST /midjourney/imagine` | Posters | **Streaming NDJSON response** (not JSON); each line is a progress tick, final line has the image; modifiers: `--ar 16:9`, `--v 6`, `--style raw` |
| Luma | `POST /luma/videos` | Trailer (MVP tier) | Task-based; pass a Midjourney poster as `keyframes.frame0` to anchor the first frame |
| Veo | `POST /veo/videos` | Trailer (premium tier) | Models: `veo2-fast`, `veo3`, `veo3.1`; supports `callback_url`; 4K via `get1080p: true, resolution: "4k"` |

### x402 payment flow (campaign qualifier — must use)

1. Client → ShipKit backend (`POST /api/generate-kit`).
2. Backend → Ace: `POST /platform.acedata.cloud/api/v1/orders/{order_id}/pay/` with `{"pay_way": "X402"}`.
3. Ace returns `HTTP 402` with EIP-712 signing payload.
4. Backend (or client wallet) signs with user's private key.
5. Resend with `X-PAYMENT: {base64_signed_payload}` header.
6. Ace verifies, settles on Base via facilitator, returns `200` + result.

For MVP, use `x402curl` (drop-in curl replacement that handles the 402 dance automatically). Guide: https://docs.acedata.cloud/en/guides/x402

### Managed MCP endpoints (for the Agent Skill qualifier)

Bearer-token auth with the same Ace API token.

- Suno: `https://suno.mcp.acedata.cloud/mcp`
- Midjourney: `https://midjourney.mcp.acedata.cloud/mcp`
- Luma: `https://luma.mcp.acedata.cloud/mcp`
- Veo: `https://veo.mcp.acedata.cloud/mcp`

Deliverable: publish a `SKILL.md` to [AceDataCloud/Skills](https://github.com/AceDataCloud/Skills) so `npx skills install shipkit` works in Claude Code / Cursor / Copilot.

## Unit economics

| Step | ~Cost | Notes |
|---|---|---|
| Chat (GPT-4o-mini, ~2k tok) | $0.002 | Trivial |
| Suno (1 song, 2 variants) | $0.08 | Use cheaper model |
| Midjourney × 3 | $0.12 | $0.04 each |
| Luma (5s video) | $0.35 | Biggest line item |
| **Total per kit** | **~$0.55** | Before x402/$ACE discounts |

With x402 (5% off): ~$0.52. With $ACE holding: ~$0.48–0.50. Post-campaign price target: $2/kit = 75% gross margin.

## Environment variables

```bash
# Backend (.env)
ACEDATA_API_TOKEN=ace_...    # global Ace credential
X402_PRIVATE_KEY=0x...        # wallet with USDC on Base
GITHUB_TOKEN=ghp_...          # higher rate limit for repo fetches

# Frontend (.env.local)
VITE_API_BASE=https://your-shipkit-api.vercel.app
VITE_NEXIOR_URL=https://your-nexior.vercel.app
```

---

# UI / Design System

The UI is a sleek, invisible wrapper around generated media. It must feel high-trust, premium, VC-standard — built for developers and founders. The interface recedes; the media is the star.

## Stack

- **Next.js 16.2.4** (App Router) · **React 19.2.4** · **Tailwind CSS v4**
- Single-page architecture · bento-box grid for output

## Aesthetic rules

- **Backgrounds:** true deep blacks (`#000000` → `#050505`). No washed-out greys.
- **Horizon glow:** deep black top fading into a vibrant electric-blue / deep-purple glow at the bottom edge. Implement with absolute-positioned gradient layers + a linear-gradient overlay so text stays readable.
- **Grids:** 1px grid lines at `opacity-5` to `opacity-10` behind content — technical, developer-centric feel.
- **Depth:** sharp 1px borders using alpha channels (`border-white/10`, never opaque). Subtle inner glows over heavy blurry drop shadows.
- **Chrome is monochromatic.** The only bright colors come from generated media and the bottom horizon glow.

## Typography

- **Primary:** Satoshi (geometric, modern, premium).
- **Monospace** (JetBrains Mono or Geist Mono): receipt numbers, code snippets, CLI blocks — anywhere alignment and financial clarity matter.
- **Hierarchy:** headlines pure white (`#FFFFFF`), tightly tracked. Subtext/metadata muted (`text-neutral-400` → `text-neutral-500`).

## Iconography — Hugeicons ONLY

- **Single source of truth:** Hugeicons (Pro/Stroke preferred).
- Stroke weight strictly `1.5px` across the entire app.
- **Do not** mix Lucide, Heroicons, Feather, FontAwesome, or Tabler. A mixed icon set instantly kills the premium feel.

## Buttons & inputs

**Primary CTA** (e.g., "Generate Kit")
- `rounded-full` or `rounded-xl`, solid white bg with black text (or dark fill with subtle gradient border + white text).
- Hover: `scale-[1.02]` + slight brightness/glow.

**Secondary** (e.g., "Install as Skill", "How it works")
- Transparent bg, `border border-white/15`, text `white/80`.
- Hover: `bg-white/5`, text pure white.

**Input bar (GitHub URL)**
- Floating command-bar aesthetic. `bg-neutral-900/50`, `backdrop-blur-md`, 1px inner border.
- Focus: `ring-1 ring-blue-500/50`; placeholder fades out smoothly.

## The 7 non-negotiables

1. **Hero shows a live demo, not a form.** Default to a pre-generated kit for a famous repo (e.g. `vercel/next.js`). Output first, input bar below.
2. **x402 receipt is the second thing below the hero.** Never buried. Sleek DeFi-transaction-receipt styling: monospace numbers, dashed dividers, itemized costs, on-chain tx link.
3. **Live parallel progress.** Four concurrent streams with Hugeicon spinners + skeletons: 🎵 Song · 🎨 Posters · 🎬 Trailer · ✍️ Copy. Each completes independently — feels fast even though the trailer takes ~30s.
4. **Watermark every output.** Bottom-right of videos, corner of images: "Made with ShipKit · @acedatacloud". Free distribution.
5. **"Install as Skill" panel.** Right-side on desktop. Shows `npx skills install shipkit` in a terminal block with copy button. Converts developer users.
6. **No sign-up for the first kit.** Eat the ~$0.55 once per user. Paywall hits on the second kit. Single biggest conversion lever.
7. **Dark, high-contrast, uncluttered hero.** Title, subtitle, floating input bar, pre-loaded kit. Docs and skill install go to secondary panels or below the fold.

## DO / DON'T

**DO**
- Default to results over forms.
- Make the cost visible and proud — $0.50–$0.80 per kit is the differentiator.
- Use `backdrop-blur-xl` on sticky headers / floating panels over the glowing horizon.
- Use alpha-channel borders so they blend across layers.

**DON'T**
- Use large blocks of bright color in the UI chrome.
- Use opaque borders or heavy blurry drop shadows.
- Hide pricing or bury the receipt.
- Clutter the hero with secondary CTAs or documentation.
- Mix icon libraries.

## Bonus / qualifier checklist

- [ ] Fork [Nexior](https://github.com/AceDataCloud/Nexior) → deploy to Vercel (+10 bonus)
- [ ] Ship ShipKit frontend (can be a separate `shipkit.yourdomain.com` linked from Nexior — simpler than bolting into the Vue app)
- [ ] Pipeline uses x402 end-to-end with visible on-chain settlement (qualifier)
- [ ] Pipeline uses 4+ Ace services: Chat + Suno + Midjourney + Luma/Veo (multi-tool qualifier)
- [ ] Publish `SKILL.md` via PR to [AceDataCloud/Skills](https://github.com/AceDataCloud/Skills) (Agent Skills qualifier)
- [ ] Submission post tags `@acedatacloud`, uses `#BuildWithAce #AceDataCloud`, includes 60s demo video showing x402 settlement

## Links

- Ace console: https://platform.acedata.cloud
- Ace docs: https://docs.acedata.cloud
- x402 guide: https://docs.acedata.cloud/en/guides/x402
- x402 facilitator: https://facilitator.acedata.cloud
- Nexior source: https://github.com/AceDataCloud/Nexior
- Ace Skills repo: https://github.com/AceDataCloud/Skills
- Ace MCPs: https://github.com/AceDataCloud/MCPs
