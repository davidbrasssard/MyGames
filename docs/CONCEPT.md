# MyGames (Oasis) — Concept

## Purpose
Entertain, while staying super simple for both the player and the caregiver. Gentle tablet games for seniors, including people with mild memory difficulties. First player: a 75-year-old woman with good dexterity today; tap-based play must be ready for when that changes. Other players may follow. The look is adult and modern, never childish.

## Releases
Design and build the code for the full version; expose only what each release needs. Settings are added release by release, based on real feedback.
- Release 1: Mahjong only. Visible settings: Language (FR/EN), Difficulty (Easy/Medium/Hard/Very Hard), Sound (on/off). Everything else uses fixed defaults: Drag and Tap both work at the same time, Effects = Gentle, large pictures.
- Next releases: ask the player which game she wants next; add settings only when feedback shows a need.

## Visual reference
docs/reference/mockup.png (when added) is the visual standard: calm nature backgrounds (lakes, mountains, forests, flowers), soft depth, rounded glossy tiles, color-coded game buttons, large clear text, smooth gentle animations.

## Approach: a generic game kit
Everything is built once and shared by all games. A game only defines its own rules. The kit includes:
- One game screen layout: top bar (Back, game name, level), board in the middle, side bar of action buttons (Hint, Undo, Shuffle...). Each game declares which buttons it uses.
- One tile/card component, same look everywhere.
- One touch system (see Touch).
- One undo system: every game records moves the same way.
- One set of animations (lift, glide, fade, flip) that follows the Effects setting.
- One completion screen ("Bravo !", Play again / Home), one settings system, one picture system.
When a game needs something new, extend the kit; no one-off code.

## Mahjong (Release 1)
- Layered tiles; only free tiles can be picked (no tile on top, and a free left or right side).
- Tiles: ivory blocks built in CSS (visible thickness, rounded edges, soft shadow, stacked layers). Pictures: Microsoft Fluent Emoji, "Color" (flat) style, MIT license, bundled locally for offline use.
- Every picture on a board must be clearly different from the others: no near-twins (e.g. never two butterflies).
- Every board is generated to be solvable.
- If no free pair remains, the remaining tiles reshuffle gently and automatically. No message, no game over.
- Select a tile: it lifts with a soft glow. Tap its match: both glide away and fade. Wrong pick: the selection simply moves to the new tile.
- Hint (gently highlights a free pair) and Undo.
- Levels: Easy = small, nearly flat board, few tiles; Very Hard = taller classic-style pyramid. Medium and Hard in between.

## Later games
Match (pairs; Easy 6 cards, Medium 12, Hard 20, Very Hard 32; wrong pair flips back gently), Match 3 (no way to lose), Puzzles (move tiles to rebuild a picture). All games use the level names Easy / Medium / Hard / Very Hard; each game defines what they mean.

## Home screen
Shows only games switched on by the caregiver (no placeholders). Pages of 4 game buttons. With 1–2 games, buttons grow and center. More than 4: large visible arrow buttons plus page dots; swipe also works.

## Touch
Forgiving shared touch system: a tap counts on release and tolerates wobble; a swipe needs a clear, mostly sideways movement over a good distance; accidental double taps ignored; second finger or resting palm ignored. Block browser gestures: pinch zoom, double-tap zoom, pull-to-refresh, text selection, long-press menu. Large touch targets everywhere.
Input modes supported by the kit: Drag, and Tap-Tap (tap piece, then tap destination; valid destinations highlight softly).

## Pictures
Every image belongs to a collection. Sources: bundled illustrations (Fluent Emoji), bundled photos (free libraries, e.g. Pexels/Unsplash, used for backgrounds and later games), and personal photos (family, home, familiar places). Games ask for N pictures from a collection and do not care about the source.
Personal photos (later release): caregiver uploads collections from settings (protected by a caregiver passcode) to a private Cloudflare R2 bucket; the tablet downloads changes when online and keeps them for offline play. Reuse the CHRONOS offline-package approach. No Supabase. Personal photos never go in the repo or on Netlify.

## Settings (caregiver)
Opened by press-and-hold on the gear for about 3 seconds (a ring fills); a normal tap does nothing.
Full list the code must support (exposed release by release): language, difficulty per game, sound, input mode, effects (Full / Gentle / Minimal), image size, hints, swipe on/off, picture collection, which games appear on Home, caregiver setup guide for locking the tablet (Guided Access on iPad, Screen Pinning on Android).

## Never
Timers, lives, scores pressure, ads, accounts, streaks, rewards, pop-ups, "come back tomorrow", flashing or flickering effects, scrolling game boards, hidden menus, close/exit buttons.

## Platform
PWA for iPad and Android tablets, full screen, works fully offline. React + TypeScript + Vite, hosted free on Netlify. Settings stored on the device. Everything within free tiers. A web app cannot lock the tablet; locking is done with the tablet's own Guided Access / Screen Pinning.
