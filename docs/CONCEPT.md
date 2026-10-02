# MyGames (Oasis) — Concept

## Purpose
Entertain, while staying super simple for both the player and the caregiver. Vivid, playful tablet games for seniors, including people with mild memory difficulties. First player: a 75-year-old woman with good dexterity today; tap-based play must be ready for when that changes. Other players may follow. The look is adult and modern, never childish.

## Design direction
- Look: vivid and playful, but adult; never childish. Colourful illustrated scenes, rich colour, glossy tiles, lively animations and rewarding moments (glow, sparkle, bounce, flourishes) are welcome. This replaces the earlier "calm / soothing / gentle" look direction.
- Non-negotiable senior-friendly rules (functional, they do not change with the look):
  - Big, readable tiles and large touch targets; clear pictures.
  - Forgiving touch (see Touch).
  - No ads, no accounts, no timers, no pressure (no lives, no score pressure, no streaks, no "come back tomorrow").
  - Very simple controls and navigation; always an obvious way back to Home.
  - Sound minimal and default off; no music, ever.
  - Détente levels cannot be lost.
  - Photosensitivity-safe: lively is fine, never strobing, flashing or flickering.
  - Performance on the Galaxy Tab 4 (transform/opacity only, light assets).

## Releases
Design and build the code for the full version; expose only what each release needs.
- Release 1: Mahjong only. No settings screen. Home has a language pill FR | EN and a speaker (sound on/off) button, top-right. Everything else uses fixed defaults: Drag and Tap both work at the same time, Effects = Gentle, large pictures.
- Next releases: ask the player which game she wants next; add settings only when feedback shows a need.

## Visual reference
docs/reference/mockup.png (when added) is a visual reference for layout and tile depth; where it looks calmer or more muted than the Design direction, the Design direction wins. Target: illustrated nature scenes with rich colour (lakes, mountains, forests, flowers), depth, rounded glossy tiles, colour-coded game buttons, large clear text, lively and smooth animations.

## Approach: a generic game kit
Everything is built once and shared by all games. A game only defines its own rules. The kit includes:
- One game screen layout: top bar (Back, game name, level), board in the middle, side bar of action buttons (Hint, Undo, Shuffle...). Each game declares which buttons it uses.
- One tile/card component, same look everywhere.
- Tile depth (src/kit/tileDepth.ts + tileDepth.css): every tile-type game uses the kit tile depth by default, with its own palette (Mahjong ivory/gold, Triple Tile white/blue). It covers the geometry (face and thickness ratios, touching neighbours, row step, each layer lifted up and leaning right by the thickness), the colour variables (face, edge, side, rim, blocked grey; lower layers get darker sides and rim), stepped thickness on the left and bottom, and a light static ground shadow (no blur, no filter). A game supplies only its palette and its rules; Home icons use it too.
- One touch system (see Touch).
- One undo system: every game records moves the same way.
- One set of animations (lift, glide, fade, flip) that follows the Effects setting.
- One end card (src/kit/EndCard.tsx, built on OverlayCard), one settings system, one picture system.
- End cards: warm ivory card with a gold border and soft glow, a game-supplied decoration on top, title, short line, and two large buttons: Rejouer / Play again (new board, same level, solid green) and Accueil / Home (white, blue outline). Tapping outside does not close them. Win = "Bravo !" / "Well done!" + "Partie terminée" / "Game complete". Stuck (Défi levels only) = "Presque !" / "Almost!" + "Plus de paires libres. On réessaie ?" / "No free pairs left. Try again?"; never "game over", no sad imagery. Animations are transform/opacity only: reduced on Gentle, none on Minimal. They may be lively (glow, sparkle, bounce) but never strobe or flash rapidly. Mahjong win: gold trophy popping in with 4 board tiles fanned out beside it; stuck: 3 remaining tiles with a few faded behind.
- Détente / Défi: each game declares, per level, whether it can be lost. Levels that cannot are "Détente" / "Relaxed"; levels that can are "Défi" / "Challenge". The level panel shows this word on each level button.
When a game needs something new, extend the kit; no one-off code.

## Mahjong (Release 1)
- Layered tiles; only free tiles can be picked (no tile on top, and a free left or right side).
- Tiles: ivory blocks built in CSS. Tiles on a layer sit tight together; thickness shows on the left and bottom (darker tan). Each higher layer is offset up and to the right by the tile thickness and casts a soft static shadow down-left onto the tiles below. Lower layers are slightly darker (about 4% per layer) so the top tiles stand out; tiles on the same layer look identical. Blocked tiles are never greyed out. Pictures: Microsoft Fluent Emoji, "Color" (flat) style, MIT license, bundled locally for offline use.
- Every picture on a board must be clearly different from the others: no near-twins (e.g. never two butterflies).
- Every board is generated to be solvable.
- Détente levels (Easy, Medium): each picture appears twice. If no free pair remains, the remaining tiles reshuffle gently and automatically. No message, no game over.
- Défi levels (Hard, Very Hard): each picture appears 4 times (any two identical tiles match); boards are still generated with at least one full solution, but there is no auto-reshuffle. When no free matching pair remains, after a short calm pause the "Presque !" card appears (Undo during the pause still works).
- Clearing the board on any level shows the "Bravo !" card.
- Select a tile: it lifts with a soft glow. Tap its match: both glide away and fade. Wrong pick: the selection simply moves to the new tile.
- Hint (gently highlights a free pair) and Undo.
- Level picker (kit screen): the level badge in the game's top bar opens "Choose your level" (4 colored cards with tile count and 1-4 stars). Choosing starts a new board; Back returns to the game unchanged. The chosen level is remembered per game and used when the game is next opened from Home.
- Levels (Easy and Medium = Détente, Hard and Very Hard = Défi; 24 / 40 / 64 / 80 tiles): Easy = small, nearly flat board, few tiles; Very Hard = a tall pyramid of 5 layers. Every level is visibly layered (Easy 2 layers, Medium 3, Hard 4, Very Hard 5). Medium and Hard in between.

## Triple Tile (game 2)
- Real Tile Master rules. Layered, symmetric boards. A tile is free when no tile above overlaps it. Tap only (no drag).
- A tapped free tile flies into a 7-slot tray below the board and is placed next to identical pictures already in the tray. When 3 identical tiles are in the tray they clear with a lively animation (glow, gather, vanish).
- Levels (every board is generated to be solvable). First play starts on Facile; the last level chosen is remembered (kit rule).
  - Facile (Easy): 36 tiles, 2 layers (piles of 2 at most), 6 pictures. Détente.
  - Moyen (Medium): 54 tiles, up to 3 layers (piles up to 3), 9 pictures. Détente.
  - Difficile (Hard): 72 tiles, up to 4 layers (piles up to 4), 12 pictures. Défi.
  - Très difficile (Very Hard): 90 tiles, up to 4 layers (piles up to 4), 15 pictures. Défi.
  - Shaped layouts: each level has 4 symmetric layouts with exactly the level's tile count (Facile: ring, diamond, two islands, staircases; Moyen: butterfly, cross, arch, staircases; Difficile: double ring, big diamond, four islands, staircases and centre; Très difficile: big butterfly, big cross, big arch, islands and staircases). Positions are in quarter-tile units. Real-game features: deep piles (tiles exactly on the same spot, each higher tile drawn slightly higher so the stacked edges show), stepped clusters (groups of 3 tiles inside the outline, each step half a tile further toward the centre and one layer higher; nothing sticks out of the shape), separate clusters with open space between. Facile stays simple (no staircases, piles of 2). Each new board picks a random layout of its level, never the same one twice in a row; the layout is scaled as large as possible in the board area. Difficulty comes mainly from the tile and picture counts.
- Action bar: the kit Hint and Undo, same as Mahjong. Undo is unlimited. No Shuffle button. Hint highlights the next free tile that builds toward a set.
- Tray full, Détente levels (Facile, Moyen): the tray gives a gentle shake, the Undo button glows and pulses, and a clear line appears above the tray: FR "Plateau plein — annulez votre dernier coup" / EN "Tray full — undo your last move". Tapping board tiles only gives a tiny wiggle. Hint points to Undo. No timer, no ending. The line disappears once she taps Undo.
- Tray full, Défi levels (Difficile, Très difficile): the game ends with the kit stuck EndCard exactly as shipped (its rotating titles) and Rejouer.
- Look: Microsoft Fluent Emoji "3D" style (PNG, MIT license), bundled offline, distinct from Mahjong's flat "Color" style. Tiles: white face, soft blue thickness, rounded corners. Blocked tiles are clearly greyed but still readable. Own colourful illustrated background (see Backlog: illustrated backgrounds).
- Performance: glows and sparkles are opacity-faded layers using transform/opacity only, no animated shadows or filters. Fluent 3D PNGs are resized small (about 128 px) to stay light on the Galaxy Tab 4.
- Sound: minimal, default off (kit rule); its own soft "good action" sound when a set clears. No music.
- Its own end-card decoration (kit rule).

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

## Player controls and settings
No settings screen for now. Home, top-right: a language pill "FR | EN" (both shown, current one highlighted; tapping the other switches the whole app at once) and a speaker button for sound on/off (clear on/off look). Both at least 64px tall.
- Sound: default OFF. No music, ever. Only a very soft click on a match (coming later).
- Levels: the first time a game is opened it starts on Easy; after that it opens on the level the player last chose (remembered per game).
- All released games appear on Home automatically.
- The settings store still holds the full list (language, sound, input mode, effects, image size, hints, swipe, picture collection, level per game); only language, sound and level are changeable by the player today. Defaults: Drag and Tap both on, Effects = Gentle, large pictures.
- The gear returns later, only for caregiver functions (personal photos, passcode-protected, opened by press-and-hold ~3 seconds with a filling ring; a tap does nothing). The press-and-hold component is kept in src/kit/GearButton.tsx. A caregiver guide for locking the tablet (Guided Access on iPad, Screen Pinning on Android) comes with it.

## Never
Timers, lives, scores pressure, ads, accounts, streaks, rewards, pop-ups, "come back tomorrow", rapid strobing, flashing or flickering effects (lively glow, sparkle and bounce are allowed), scrolling game boards, hidden menus, close/exit buttons.

## Platform
PWA for iPad and Android tablets, full screen, works fully offline. React + TypeScript + Vite, hosted free on Netlify. Settings stored on the device. Everything within free tiers. A web app cannot lock the tablet; locking is done with the tablet's own Guided Access / Screen Pinning.
