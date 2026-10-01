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
- Photosensitivity-safe: nothing flashes, blinks, strobes or flickers. Animations are slow and smooth (fades, glides, gentle lifts, 3D flips).
- A global "Effects" setting: Full / Gentle / Minimal.
- The kit supports two input modes: Drag, and Tap-Tap (tap origin, then tap destination). Which modes are exposed in settings is defined per release in CONCEPT.md.
- No timers, lives, scores pressure, ads, accounts, streaks, rewards, or "come back tomorrow".
- Large touch targets, clear simple navigation, always an obvious way back to Home.
- All visible text in French and English; French is the default language.
- Settings are global with per-game overrides; which settings are visible is defined per release in CONCEPT.md.
