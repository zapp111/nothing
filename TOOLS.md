# Tools & Assets Documentation

## Required for Contest Submission

### Tools Used
1. **HTML5, CSS3, JavaScript** — Core web technologies, no build step
2. **HTML Canvas 2D API** — Rendering
3. **Web Audio API** — Sound
4. **Google Fonts** — Fredoka, Baloo 2 (OFL license, permitted)
5. **Arena.ai Image Generation** — For festival art assets (see CREDITS.md)
6. **Git & GitHub** — Version control
7. **GitHub Pages** — Static hosting (permitted)
8. **Python http.server** — Local dev server

### No External Libraries
- No Phaser, no Three.js, no jQuery
- Keeps bundle < 200KB (excluding images)
- Fast load, works on low-end mobiles

### Asset Licenses
- **Generated Images:** Created via Arena for this project, no third-party copyright
- **Fonts:** Google Fonts — Open Font License
- **Emojis:** System emojis (Unicode)
- **Audio:** Procedural, no samples, no copyrighted music
- **Code:** Original, written for contest

### How to Run Locally
```bash
git clone https://github.com/zapp111/nothing.git
cd nothing
python3 -m http.server 8000
# Open http://localhost:8000
```
Or just open `index.html` (but server recommended for image loading).

### Performance
- Target: 60 FPS on mid-range laptop + mobile
- Canvas: 1600×900 design, CSS scaled, DPR capped at 2
- Images: ~9MB total, lazy fallback to canvas drawing if fails
- Particles capped, object pools reused via array splice
- No memory leaks: particles/floatTexts cleaned each frame

### Browser Support
- Chrome (primary)
- Edge
- Firefox
- Safari (iOS)
- Mobile Chrome / Safari

### Accessibility
- Keyboard + touch
- Clear contrast (WCAG AA for UI pills)
- No flashing at >3Hz
- Pause available anytime
- No personal data collection

### Deployment
- Static site, no backend
- Works on GitHub Pages, Netlify, Vercel, any static host
- `.nojekyll` file included to bypass Jekyll processing
- `index.html` at root

### Verification
- No leaderboard manipulation (localStorage only)
- No external tracking
- No unnecessary permissions
- All links tested
