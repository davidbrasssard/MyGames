# MyGames (Oasis) — Concept

## Purpose
Gentle tablet games for seniors, including people with mild memory difficulties. Open the app, understand immediately, play, get a pleasant result, continue or stop. First player: a 75-year-old woman with good dexterity today; tap-based play must be ready for when that changes. Other players may follow.

## Look and feel
A polished, modern 2026 tablet game — not childish, not "elderly-looking". Calm nature imagery (lakes, mountains, forests, flowers), soft depth, rounded glossy tiles, color-coded game buttons on Home (Match blue, Mahjong green, Match 3 purple, Puzzles orange). Smooth, slow, satisfying animations. Completion screen: "Bravo !" with a gentle effect, then Play again / Home.

## Games (build order)
1. Match — flip cards to find pairs. 3D card flip. Matched pairs stay visible or gently fade.
2. Mahjong — layered tiles showing familiar pictures (flowers, birds, fruit, boats, cars, trees). Only free tiles can be picked. Tap one (it lifts/glows softly), tap its match, both glide away. Hint and Undo buttons.
3. Match 3 — grid of familiar pictures. Swap two neighbours to line up three. Matches dissolve, new pieces glide in from above. Hint and Shuffle buttons. No way to lose.
4. Puzzles — picture puzzle: move tiles to rebuild a photo. Pieces snap gently into place.

## Input modes (every game supports both)
- Drag: hold a piece, move it, release.
- Tap-Tap: tap the piece, then tap the destination. Valid destinations highlight softly.

## Settings
Global (apply to all games): language (FR default / EN), input mode, effects level (Full / Gentle / Minimal), image size, sound on/off, hints on/off, theme (Nature, Animals, Flowers; Family photos later).
Per game: difficulty (Easy / Medium / Hard / Very Hard), and optional overrides of the global settings.
Settings are meant to be configured once by a caregiver; the player should rarely need them.

## Never
Timers, lives, scores pressure, ads, accounts, streaks, rewards, pop-ups, "come back tomorrow", flashing or flickering effects, scrolling game boards, hidden menus.

## Platform
PWA installed on iPad home screen, full screen, works fully offline. React + TypeScript + Vite, hosted free on Netlify. Settings stored on the device.
