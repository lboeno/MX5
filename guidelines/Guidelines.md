# Portal MX — Design Guidelines

## Stance
**Data-dense premium dark.** The product is a motorsports SaaS platform: every screen
must carry information density with clarity, never sacrificing readability for decoration.
Inspired by Bloomberg Terminal for density, and Vercel/Linear for polish.

## Palette
| Token | Value | Usage |
|---|---|---|
| Background | `#09090b` | Page ground — near-black |
| Card | `#111113` | Panels and data cards |
| Border | `#27272a` | Hairlines, table rows |
| Primary | `#e11d48` | Racing red — CTAs, highlights, racing accent |
| Foreground | `#fafafa` | Primary text |
| Muted FG | `#71717a` | Labels, captions, timestamps |
| Success | `#22c55e` | Paid, active, confirmed |
| Warning | `#f59e0b` | Pending, in-progress |
| Info | `#3b82f6` | Informational, upcoming |

## Typography
- **Display / Headings:** Outfit (variable) — sharp, authoritative, mechanical
- **Body / UI:** DM Sans (variable) — clean, readable, neutral
- **Data / Code / Labels:** Geist Mono (variable) — tabular data, numbers, IDs, timestamps

Hierarchy:
- Page title: `font-display font-bold text-4xl tracking-tight`
- Section title: `font-display font-semibold text-2xl`
- Card title: `font-display font-semibold text-[15px]`
- Body: `DM Sans text-sm leading-relaxed`
- Data: `Geist Mono text-xs`

## Layout
- Max content width: `max-w-7xl`
- Page padding: `px-4`
- Admin sidebar: 56px collapsed / 224px expanded
- Grid: prefer asymmetric layouts (e.g. 2:1 for detail + sidebar)

## Components
- Border radius: 3–10px (never pill-shaped except full-circle avatars)
- Borders: 1px, `#27272a` — thin hairlines only
- Shadows: only for glow effects on primary elements (`box-shadow: 0 0 40px rgba(225,29,72,0.15)`)
- Tables: no background on rows, hover `bg-zinc-900/30`, striped via border-bottom only
- Badges: font-mono, UPPERCASE, 11px — sharp and data-forward

## Motion
- Entry animations: `opacity: 0 → 1, y: 16 → 0` with `0.15s` duration
- Stagger: `0.04–0.1s` between list items
- Hover: `150ms` duration for color transitions
- Charts: animate fill on mount with 1s ease-out

## Rules
1. Never use lorem ipsum — always realistic Brazilian motorsports data
2. Mono font for all numbers, IDs, timestamps, lap times
3. Racing red (`#e11d48`) is used sparingly — only for primary actions and live/featured state
4. Loading states: skeleton shimmer, not spinners (except button loading)
5. Empty states: always include an icon and helpful message
6. Error states: rose-tinted background, clear error text
