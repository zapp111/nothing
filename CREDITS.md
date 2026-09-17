# Credits — Mushak: The Festive Quest

## Game
**Title:** Mushak: The Festive Quest
**Contest:** Ganesh Chaturthi Game Design Contest — 2026
**Developer:** Solo project
**Deadline:** 20 September 2026 — 5:00 PM

## Concept & Design
- Core idea: Control Mushak (Lord Ganesha's mouse companion) collecting puja offerings
- 3 stages: The Pandal (Easy), The Procession (Medium), The Final Journey (Hard)
- Mechanics: Movement, collectibles, obstacles, combo, blessing meter, objectives, risk/reward

## Art Assets
All visual assets are either:
1. **Procedurally drawn with Canvas 2D** (fallback, always available)
2. **AI Generated via Arena** for final version — prompt-engineered to be respectful, cute, festival-inspired

### Generated Images (assets/images/)
- `mushak.png` — Mushak hero character, brown mouse with orange scarf
- `modak.png` — Modak sweet collectible
- `golden-modak.png` — Rare golden modak with sparkles
- `flower.png` — Marigold flower offering
- `durva.png` — Durva grass offering
- `diya.png` — Clay oil lamp decoration
- `pandal.png` — Festival pandal entrance (no deity depicted)
- `rangoli.png` — Colorful rangoli pattern
- `obstacle-barrier.png` — Festival barrier obstacle
- `blessing.png` — Golden blessing aura with Om
- Fallbacks for stone/box/bucket drawn procedurally

**Style:** Cute 2D flat, lightweight, 60fps friendly, respectful
**License:** Generated for this project, no copyrighted third-party art

## Audio
**No copyrighted music used.** All audio is procedural via Web Audio API:
- Collect: 660Hz + 880Hz sine
- Golden: 523Hz + 659Hz + 1046Hz triangle/sine
- Hit: 180Hz sawtooth + 90Hz square
- Combo: 400Hz + level*120Hz
- Blessing Ready: 440Hz → 554Hz → 659Hz
- Blessing Activate: 300Hz → 600Hz
- Stage Complete: 400Hz → 500Hz → 600Hz → 700Hz
- Game Over: 300Hz → 180Hz
- Background: Gentle 110Hz sine + 220Hz triangle drone with 0.15Hz LFO (0.06 gain)

**Mute toggle:** Saves to localStorage `mushak_muted`

## Technology
- **HTML5** — semantic structure, screens, UI
- **CSS3** — Flexbox, gradients, animations, responsive, glassmorphism
- **JavaScript (Vanilla)** — No frameworks, no libraries
- **Canvas 2D** — Game rendering, particles, 1600×900 design space, DPR aware
- **Web Audio API** — SFX + ambient
- **LocalStorage** — Best score `mushak_best`

## Fonts
- Fredoka (400,600,700) — UI
- Baloo 2 (600,800) — Titles
- Source: Google Fonts (permitted)

## Respectful Design
- Lord Ganesha never shown being hurt, attacked, mocked, or in disrespectful situations
- Blessing is visual aura (ॐ) + slow-mo + multiplier, not attack
- Festival elements: diyas, rangoli, pandal, flowers, lights, modaks — all respectful
- No disrespectful depiction, no offensive content

## Tools Used
- VS Code
- Chrome DevTools (performance, mobile emulation)
- Python http.server for local testing
- Git + GitHub
- GitHub Pages for deployment
- Arena.ai Agent Mode for development assistance

## Development Philosophy
> A small, polished, complete game is better than a huge unfinished game.

Order: Core gameplay → Movement → Collectibles → Obstacles → Scoring → Lives → Objectives → Stages → Blessing → Visual polish → Audio → Mobile → Testing → Deployment

## Team
Solo — Designed, coded, tested, and documented by one developer, with AI assistance for art generation and code scaffolding.

## Acknowledgments
- Ganesh Chaturthi festival inspiration
- Contest organizers
- Family/friends for playtesting
