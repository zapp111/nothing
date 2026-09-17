# Demo Video Script — Mushak: The Festive Quest
Target: 1–3 minutes (contest requirement)

## Structure (2:10 total)

### 0:00–0:10 — Title + Concept
- Show Start Screen with Mushak art
- Voiceover: "Mushak: The Festive Quest — a 2D arcade adventure for Ganesh Chaturthi. Help Mushak collect offerings for the celebration."
- Show title, festival background, diyas

### 0:10–0:30 — How to Play
- Show How to Play screen
- Quick cuts:
  - Movement: A/D, arrows, drag on mobile
  - Collect: Modak +10, Flower +15, Durva +20, Golden +100
  - Avoid: Barriers, stones, boxes
  - Combo: 3→×2, 6→×3 etc.
  - Blessing: Fill meter, press SPACE
- Overlay text: "Simple to learn, challenging to master"

### 0:30–1:30 — Actual Gameplay (60s core)
- **Stage 1 — The Pandal (0:30–0:50):**
  - Show movement, collecting modaks
  - Show combo building x2, x3
  - Hit obstacle → lose life, combo reset, invulnerability flash
  - Fill blessing meter → READY → Activate → slow-mo + aura
  - Collect Golden Modak in risky spot near barrier
  - Timer countdown, objective 8/10 → 12/12 ✅
  - Reach finish line → Stage Complete screen

- **Stage 2 — The Procession (0:50–1:10):**
  - Faster speed, more obstacles
  - Show 3 lanes, more decorations
  - Show higher density, risk/reward decision
  - Combo x4, x5

- **Stage 3 — Final Journey (1:10–1:30):**
  - Highest speed, hardest patterns
  - Show blessing used strategically
  - Show particle effects, float texts +100

### 1:30–1:50 — Results
- Show Final Results screen: Final Score, Best Combo, Golden Modaks, Perfect Stages, Total Score
- Show Best Score saved
- Show Play Again / Main Menu

### 1:50–2:10 — Tech & Closing
- Quick code glimpse: index.html, game.js, assets/
- Voiceover: "Built with HTML, CSS, JavaScript, Canvas — no frameworks, 60fps, mobile + desktop, respectful theme, no copyrighted assets. Solo project."
- Show GitHub repo, live link
- End card: "Play now: [live link] — Ganpati Bappa Morya! 🐭✨"

## Recording Tips
- Use OBS or Chrome screen recorder
- Record at 1080p, 60fps
- Capture system audio for SFX
- Keep mouse visible for menu clicks
- Show mobile view via DevTools device toolbar for 5 seconds
- No need for cinematic trailer — show game working

## Voiceover Script (optional)
"Namaste! This is Mushak: The Festive Quest. You are Mushak, Lord Ganesha's companion, collecting modaks, flowers, and durva for Ganesh Chaturthi. Avoid obstacles, build combos, and use Ganesha's Blessing. Three stages, increasing difficulty, risk vs reward with golden modaks. Built respectfully with vanilla web tech. Try to beat my high score!"

## Export
- Format: MP4, H.264
- Length: 1:30–2:30 ideal
- Size: <50MB
- Upload to YouTube (unlisted) or Drive, link in submission

## Placeholder
If you can't record now, create a 30s screen capture via:
```bash
# On Linux with ffmpeg
ffmpeg -video_size 1600x900 -framerate 30 -f x11grab -i :0.0+100,200 -t 90 demo.mp4
```
Or use Loom, OBS.

## Current Status
- [ ] Record gameplay
- [ ] Add voiceover or text overlay
- [ ] Export MP4
- [ ] Upload
- [ ] Add link to README.md and submission form
