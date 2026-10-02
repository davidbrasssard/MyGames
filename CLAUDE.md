# MyGames (working name: Oasis)
A bilingual (French/English) PWA of gentle, calm tablet games for seniors. docs/CONCEPT.md is the product spec: read it before any feature work. When CLAUDE.md and CONCEPT.md differ on product decisions, CONCEPT.md wins.

## Stack
React + TypeScript + Vite PWA, hosted on Netlify (free plan). No backend, no accounts, no Supabase. Settings stored locally on the device. Must work fully offline once installed. Everything must stay within free-tier limits.

## Working rules
- Never ask for permission or clarifying questions. Make the most sensible choice and list every assumption in docs/results.txt.
- After EVERY prompt, OVERWRITE docs/results.txt (do not append) with a short report: what was done, files created/changed, assumptions made, anything David must check or do. Plain text, concise.
- Never commit, push, or deploy unless the prompt explicitly asks for it. Never combine making changes and committing in the same task.
- Before changing any existing code, first read the relevant files and include their current relevant content in docs/results.txt for verification.
- Never claim something "doesn't exist yet" without checking the code first.
- When docs and code disagree, the code is the source of truth; update the docs.
- Do not update docs/BACKLOG.md unless the prompt asks.

## Design rules (non-negotiable)
- Photosensitivity-safe: no rapid strobing, flashing, blinking or flickering. Animations may be lively for fun (glow, sparkle, bounce) as well as smooth (fades, glides, gentle lifts, 3D flips).
- A global "Effects" setting: Full / Gentle / Minimal.
- The kit supports two input modes: Drag, and Tap-Tap (tap origin, then tap destination). Which modes are exposed in settings is defined per release in CONCEPT.md.
- No timers, lives, scores pressure, ads, accounts, streaks, rewards, or "come back tomorrow".
- Large touch targets, clear simple navigation, always an obvious way back to Home.
- All visible text in French and English; French is the default language.
- Settings are global with per-game overrides; which settings are visible is defined per release in CONCEPT.md.

## Device compatibility (non-negotiable)
- Primary device: Samsung Galaxy Tab 4 10.1 (2014): Android 4.4 or 5, old Chrome (assume Chrome 80), 1.5 GB RAM, screen 1280x800. The app must run smoothly on it.
- Build: use @vitejs/plugin-legacy with targets "chrome >= 80" so old browsers get a compatible bundle; modern tablets get the normal one.
- CSS must work in Chrome 80. Do NOT use: flexbox gap (use margins, or grid gap which is fine), aspect-ratio, inset shorthand, :is() / :where() / :has(), dvh/svh/lvh units, container queries, CSS nesting, color-mix(). If unsure whether a feature works in Chrome 80, don't use it.
- Performance: animate only transform and opacity. No blur/backdrop-filter, no animated shadows, no heavy effects. Keep images optimized and the bundle small.
- Layout: design base is 1280x800 landscape. Scale smoothly to any tablet 10 inches or larger, in landscape and portrait. Never smaller than 10-inch tablets.

## Efficiency
- Keep docs/results.txt reports short: about 15 lines maximum. List what was done, files changed, key assumptions, and anything David must check. Add detail only when something needs David's attention.
- Do not view docs/reference/mockup.png unless the prompt explicitly asks for it.
