# 🐭 Mushak: The Festive Quest

## Ganesh Chaturthi Game Design Contest — 2026

### Status

🟡 Pre-production / Game Design

### Developer

Solo project

---

# 1. Game Overview

**Mushak: The Festive Quest** is a 2D arcade adventure game set during Ganesh Chaturthi.

The player controls Mushak, Lord Ganesha's mouse companion, and helps prepare the festival by collecting important puja offerings and bringing them back to the pandal.

The game combines exploration, collection, obstacle avoidance, combo-based scoring, and short replayable challenges.

The goal is to complete festival tasks while achieving the highest possible score.

---

# 2. Core Gameplay Loop

```text
Start Stage
    ↓
Receive Festival Objective
    ↓
Travel Through Festival Area
    ↓
Collect Required Offerings
    ↓
Build Combo
    ↓
Avoid Obstacles
    ↓
Fill Blessing Meter
    ↓
Activate Ganesha's Blessing
    ↓
Collect Rare / Golden Modaks
    ↓
Complete Objective
    ↓
Return To Pandal
    ↓
Receive Score
    ↓
Continue To Next Stage
    ↓
Final Results
    ↓
Play Again
```

---

# 3. Player Character

## 🐭 Mushak

The player controls Mushak.

Mushak is responsible for gathering offerings and helping prepare the Ganesh Chaturthi celebration.

The character should have:

* Smooth movement
* Clear animations
* Responsive controls
* A cute and respectful visual design
* Clear collision boundaries

Lord Ganesha will be represented respectfully and will not be placed in situations where he is hurt, attacked, mocked, or treated disrespectfully.

---

# 4. Main Objective

Each stage gives the player a specific festival-related task.

Example:

### Stage Objective

Collect:

* 🍬 5 Modaks
* 🌸 3 Flowers
* 🌿 3 Durva

After collecting the required items, the player must return to the pandal to complete the objective.

The player is encouraged to collect additional valuable items and maintain combos to achieve a higher score.

---

# 5. Collectibles

## 🍬 Modak

Basic collectible.

**Value:** +10 points

---

## 🌸 Flower

Festival offering.

**Value:** +15 points

---

## 🌿 Durva

Traditional offering associated with Lord Ganesha.

**Value:** +20 points

---

## ✨ Golden Modak

Rare collectible.

**Value:** +100 points

Golden Modaks should be placed in riskier locations so players must decide whether the extra points are worth the danger.

---

# 6. Combo System

Collecting items successfully builds a combo.

Example:

```text
3 consecutive collections → ×2
6 consecutive collections → ×3
10 consecutive collections → ×4
15 consecutive collections → ×5
```

The combo multiplier increases the value of collected items.

Hitting an obstacle or otherwise breaking the collection streak can reset the combo.

The exact thresholds may be adjusted during playtesting.

---

# 7. Difficulty

The game becomes progressively more difficult.

## Increasing Speed

As the player progresses, movement and/or object speed increases.

---

## Obstacles

Festival environments contain obstacles that the player must avoid.

Possible obstacles:

* 🪨 Stones
* 📦 Boxes
* 🪣 Objects around the festival area
* 🚧 Barriers

Obstacles should fit naturally into the environment and should not make the game feel disrespectful toward the festival.

---

## Multiple Lanes

Some sections of the game use three lanes:

```text
LEFT       CENTER       RIGHT
  ↓           ↓           ↓
 🐭
```

The player switches lanes to collect offerings and avoid obstacles.

This mechanic will be used more heavily in the procession stage.

---

# 8. Lives

The player has three lives.

```text
❤️ ❤️ ❤️
```

Collision with an obstacle removes one life and can break the player's combo.

When all lives are lost:

# GAME OVER

The player's final score is displayed.

The player can then restart the game.

---

# 9. Time

Stages use a time limit.

The player must complete the objective before time runs out.

The remaining time also contributes to the player's performance and may be used for a speed bonus.

The exact time limits will be balanced during testing.

---

# 10. Scoring

The game uses several scoring systems.

### Base Scores

| Item           | Points |
| -------------- | -----: |
| 🍬 Modak       |    +10 |
| 🌸 Flower      |    +15 |
| 🌿 Durva       |    +20 |
| ✨ Golden Modak |   +100 |

### Additional Bonuses

The final score can include:

* Combo multiplier
* Speed bonus
* Perfect objective bonus
* Golden Modak bonus

The final scoring formula will be finalized during implementation and playtesting.

---

# 11. Ganesha's Blessing

## 🙏 Blessing Meter

Collecting offerings fills a special meter.

```text
GANESHA'S BLESSING

████████████░░░
```

When the meter becomes full, the player can activate:

# ✨ GANESHA'S BLESSING ✨

During the blessing:

* Game speed temporarily slows
* The player's score multiplier increases
* The player receives a temporary advantage against obstacles

The exact duration and multiplier will be balanced during testing.

The blessing should feel visually special while remaining respectful.

---

# 12. Stages

The game will initially contain three stages.

## 🛕 Stage 1 — The Pandal

Purpose:

Introduce the player to the game.

Features:

* Basic movement
* Basic collectibles
* Simple obstacles
* Introduction to combos
* Introduction to Blessing Meter

Difficulty:

⭐ Easy

---

## 🥁 Stage 2 — The Procession

The game becomes faster.

Features:

* Multiple lanes
* More obstacles
* Faster movement
* Higher scoring opportunities
* More Golden Modaks

Difficulty:

⭐⭐⭐ Medium

---

## 🌊 Stage 3 — The Final Journey

The final and most difficult stage.

Features:

* Highest speed
* More challenging obstacle placement
* More valuable collectibles
* Greater risk/reward opportunities
* Full use of the Blessing system

Difficulty:

⭐⭐⭐⭐ Hard

---

# 13. Risk vs Reward

Golden Modaks should frequently appear in dangerous locations.

Example:

```text
SAFE ROUTE

🐭 → 🍬 → 🌸


RISKY ROUTE

🐭 → 🚧 → ✨🍬
```

The player chooses whether to:

* Play safely and protect their current score
* Take risks for large rewards

This should create interesting decisions without making the game frustrating.

---

# 14. Controls

## Laptop / Desktop

Primary controls:

* `A` / `D` — Move left/right
* `←` / `→` — Move left/right
* `Space` — Blessing / special action if required

Additional controls:

* `P` — Pause
* `R` — Restart

The exact controls may be changed during implementation.

---

## Mobile

The game must support touch controls.

Possible control:

* Touch / drag to move Mushak
* On-screen buttons where necessary

Mobile controls must be tested separately from desktop controls.

---

# 15. Game Screens

## Start Screen

Should contain:

* Game title
* Festival-themed background
* Mushak
* Short game description
* Play button
* How To Play button

---

## How To Play

Explain:

* Movement
* Collectibles
* Obstacles
* Combo system
* Blessing
* Objective

The player should understand the game within a few seconds.

---

## Gameplay Screen

Should show:

* Score
* Timer
* Lives
* Combo
* Blessing Meter
* Current objective
* Stage indicator

---

## Pause Screen

Options:

* Resume
* Restart
* Main Menu

---

## Results Screen

Display:

* Final score
* Best combo
* Time
* Golden Modaks collected
* Objectives completed
* Performance bonuses
* Best score

Buttons:

**PLAY AGAIN**

**MAIN MENU**

---

# 16. Replayability

The game is designed around improving personal and leaderboard scores.

Players should want to replay because they can:

* Improve their score
* Increase their combo
* Collect more Golden Modaks
* Complete stages faster
* Avoid more obstacles
* Improve their Blessing usage

The game should save the player's best score locally if practical.

---

# 17. Visual Style

The game will use a colorful 2D festival-inspired style.

Visual elements may include:

* 🛕 Pandal decorations
* 🌺 Flowers
* 🪔 Diyas
* 🥁 Dhols
* ✨ Decorative lights
* 🌸 Rangoli-inspired patterns
* 🌙 Evening festival atmosphere
* 🐭 Mushak
* 🍬 Modaks

Visuals should remain lightweight enough for smooth browser performance.

---

# 18. Audio

Possible audio:

* Festive background music
* Dhol / percussion elements
* Collectible sound effects
* Combo sound effects
* Blessing activation sound
* Stage completion sound
* Game-over sound

Only assets that are permitted for use will be included.

---

# 19. Platform

The final game should run in a web browser.

Target platforms:

* 💻 Laptop
* 🖥️ Desktop
* 📱 Mobile

No installation should be required.

The game should be accessible through a public link.

---

# 20. Technology

Initial technology choice:

* HTML
* CSS
* JavaScript
* HTML Canvas

Potential supporting libraries may be added only when they provide a clear benefit and are permitted by the contest rules.

---

# 21. Contest Requirements Checklist

Before submission:

* [ ] Game is clearly themed around Ganesh Chaturthi
* [ ] Game is functional
* [ ] Game has a clear objective
* [ ] Game has working gameplay
* [ ] Game has a measurable result
* [ ] Game has a proper ending
* [ ] Game can be restarted
* [ ] Game works on laptop/desktop
* [ ] Game works on mobile
* [ ] Game is accessible through a public link
* [ ] Source code is available
* [ ] How-to-play instructions are included
* [ ] Demo video is 1–3 minutes
* [ ] Team details are ready
* [ ] Tools/assets used are documented
* [ ] All assets have appropriate permission
* [ ] No unnecessary player data is collected
* [ ] No leaderboard manipulation exists
* [ ] Game link works before submission

---

# 22. Submission

### Game Title

Mushak: The Festive Quest

### Live Game

To be added

### Source Code

To be added

### Demo Video

To be recorded

### Team

Solo

### Deadline

**20 September 2026 — 5:00 PM**

---

# 23. Development Philosophy

The priority is:

> **A small, polished, complete game is better than a huge unfinished game.**

Development order:

1. Core gameplay
2. Movement
3. Collectibles
4. Obstacles
5. Scoring
6. Lives
7. Objectives
8. Stages
9. Blessing system
10. Visual polish
11. Audio
12. Mobile support
13. Testing
14. Deployment
15. Demo video
16. Submission

Features should only be added when the core game is stable.

---

# 24. Current Status

🟢 Game concept selected
🟢 Core gameplay direction selected
🟢 Main mechanics selected
🟢 Three-stage structure selected
🟡 Detailed balancing — pending
🔴 Coding — not started
🔴 Art/assets — not started
🔴 Audio — not started
🔴 Deployment — not started
🔴 Demo — not started
🔴 Submission — not started

First Note- 15th Sept.
    core gameplay = move mushak -> collect offerings -> avoid obstacles -> build combo -> fill blessing -> reach destination -> score -> next stage

goals for v1 = mushak, one simple stage, modaks, flowers, an obstacle, score, lives, finish point

no visual components yet, goal is to get them on 17th

