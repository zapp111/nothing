# Testing Checklist — Mushak: The Festive Quest v1.0

## Manual Testing Per Roadmap Phase 22

### Gameplay
- [ ] Mushak cannot leave screen (left/right clamped)
- [ ] Score never negative
- [ ] Lives never below 0, never above 3
- [ ] Combo resets on obstacle hit, not on missing collectible
- [ ] Blessing cannot activate twice, meter resets after activation
- [ ] Cannot collect same item twice
- [ ] Cannot finish without completing objective (if time runs out, game over)
- [ ] Game stops after Game Over (no input moves Mushak)
- [ ] Particles cleaned up (no memory leak)
- [ ] FPS stays >50 on laptop, >30 on mobile

### UI
- [ ] Play button starts game
- [ ] How to Play opens/closes
- [ ] Credits opens/closes
- [ ] Pause pauses (game freezes, music stops)
- [ ] Resume resumes
- [ ] Restart Stage resets score? No, score continues but stage resets — check
- [ ] Main Menu goes to start, stops loop
- [ ] Stage Complete → Next Stage works
- [ ] Game Over → Play Again works
- [ ] Festival Complete → Play Again works
- [ ] Mute toggle works and persists after reload
- [ ] Best score saves after reload
- [ ] Copy Score copies to clipboard

### Mobile
- [ ] Touch drag moves Mushak
- [ ] ◀ ▶ buttons move
- [ ] Blessing button activates when ready (glows)
- [ ] Text fits on small screen (320px width)
- [ ] Canvas scales correctly (no black bars huge)
- [ ] No zoom on double tap
- [ ] Works in portrait and landscape
- [ ] Safe area inset respected (iPhone notch)

### Browser
- [ ] Chrome (primary) — tested
- [ ] Edge — tested
- [ ] Firefox — should work (WebAudio, Canvas)
- [ ] Safari iOS — should work
- [ ] No console errors
- [ ] Images load or fallback gracefully
- [ ] Loading screen completes even if images fail (timeout 4s)

### Performance
- [ ] FPS display shows 55-60 on desktop
- [ ] Object count < 30 (collectibles+obstacles)
- [ ] Particles < 100 at a time
- [ ] No huge image files blocking (9MB total, but cached)
- [ ] Loading time < 3s on 4G
- [ ] Memory usage stable after 5 minutes play

### Accessibility / Cleanliness
- [ ] Readable text (Fredoka, high contrast pills)
- [ ] Clear buttons (14px radius, shadow)
- [ ] Instructions understandable (HOWTOPLAY.md + in-game)
- [ ] No personal data collection (only localStorage)
- [ ] No offensive content
- [ ] No disrespectful Ganesha depiction
- [ ] All assets permitted (generated + procedural + OFL fonts)
- [ ] No copyrighted music

### Deployment
- [ ] Local server works (python http.server)
- [ ] Preview URL works (8000-xxx.e2b.app)
- [ ] GitHub Pages link works (after enabling)
- [ ] Incognito works (no cache dependency)
- [ ] Direct link to index.html works
- [ ] .nojekyll present

### Final Check Before Submission (Sep 20, 5 PM)
```
☐ Game opens
☐ Game starts
☐ Gameplay works
☐ All 3 stages work
☐ Score works
☐ Combo works
☐ Lives work
☐ Blessing works
☐ Golden Modaks work
☐ Game Over works
☐ Results work
☐ Replay works
☐ Mobile works
☐ Live link works
☐ GitHub works
☐ Demo video works
☐ README complete
☐ Submission ready
```

## Test Results (Manual, Sep 17)
- Desktop Chrome: ✅ Playable, 60 FPS, all features
- Mobile emulation (DevTools): ✅ Drag works, buttons work
- Audio: ✅ SFX, mute toggle, background drone
- Stages: ✅ 1→2→3 progression, final results
- Best score: ✅ Persists
- Images: ✅ 10 loaded, fallback works for missing stone/box

## Known Issues / Limitations
- Stone/box images missing (generation limit hit) — fallback to procedural drawing (acceptable)
- Background festival image missing — fallback to gradient + stars (acceptable)
- Demo video not yet recorded — script ready
- No backend leaderboard (intentional, contest forbids manipulation)
- Images total 9.3MB — could be compressed to <2MB with tinypng, but okay for v1.0

## Next Steps if Time
- Compress images with tinypng
- Record demo video
- Add PWA manifest for install
- Add more particle variations
- Add subtle screen transitions
