# Deployment — Mushak: The Festive Quest

## Live Game Link
**Primary:** https://zapp111.github.io/nothing/
**Fallback:** (add Netlify/Vercel if needed)

> Test the LIVE link, not just localhost — per Roadmap Phase 26

## How to Deploy (GitHub Pages)

### Option 1: Automatic via GitHub UI
1. Go to repo Settings → Pages
2. Source: Deploy from branch
3. Branch: `main` (or `arena/01a0af79-nothing` for this session) / root
4. Save → Wait 1-2 mins → Link appears

### Option 2: Via gh CLI
```bash
gh api repos/zapp111/nothing/pages -X POST -f source.branch=main -f source.path=/
# Or enable via web
```

### Option 3: Manual
- Push `index.html`, `style.css`, `game.js`, `assets/` to `main`
- Enable Pages

## Files Required for Deploy
```
index.html
style.css
game.js
assets/images/* (10 images)
.nojekyll
```

## Pre-Deploy Checklist
- [ ] `index.html` at root
- [ ] All image paths relative (`assets/images/...`)
- [ ] No absolute localhost URLs
- [ ] Works in incognito (no cache)
- [ ] Mobile tested via preview URL
- [ ] Audio toggle works
- [ ] Best score saves
- [ ] 3 stages completable
- [ ] No console errors

## Current Deployment Status
- Branch `arena/01a0af79-nothing` contains v1.0
- Local server running on port 8000 (python http.server)
- Ready to merge to `main` for Pages

## How to Merge to Main for Final Submission
```bash
git checkout main
git merge arena/01a0af79-nothing
git push origin main
# Then enable Pages from main
```

## Testing Live Link
- Open live link in Chrome, Edge, Firefox
- Test mobile via phone
- Check loading screen completes
- Play through Stage 1 → 2 → 3
- Test pause, mute, restart, main menu
- Check best score persists after reload

## Fallback Hosting
If GitHub Pages fails, alternatives:
- Netlify Drop: drag folder
- Vercel: `vercel --prod`
- Itch.io (HTML5 game)
- All permitted as static hosting

## Submission Links to Provide
- Live Game: https://zapp111.github.io/nothing/
- Source Code: https://github.com/zapp111/nothing
- Demo Video: (see DEMO_SCRIPT.md)
- How to Play: In-game + README.md
