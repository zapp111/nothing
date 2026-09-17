/* 🐭 Mushak: The Festive Quest — Core Game Engine
   Phase 1-15: Movement, Collectibles, Obstacles, Lives, Objectives, Combo, Blessing, 3 Stages
   Design: 1600x900, responsive, mobile + desktop
   Philosophy: Small, polished, complete > huge unfinished
*/

(() => {
  // ---------- CONFIG ----------
  const DESIGN_W = 1600;
  const DESIGN_H = 900;
  const ROAD_MARGIN = 280; // side decorations width
  const ROAD_LEFT = ROAD_MARGIN;
  const ROAD_RIGHT = DESIGN_W - ROAD_MARGIN;

  const STAGES = [
    {
      id: 1,
      name: "🛕 Stage 1 — The Pandal",
      subtitle: "The Pandal",
      duration: 45,
      baseSpeed: 320,
      maxSpeed: 480,
      spawnInterval: 0.85,
      obstacleChance: 0.28,
      goldenChance: 0.06,
      objective: { modak: 4, flower: 3, durva: 2, total: 12 },
      bg: { skyTop: "#1a0b2e", skyMid: "#2d1b4e", road: "#3a2a1a", roadLine: "#ffbd59" },
      decor: "pandal"
    },
    {
      id: 2,
      name: "🥁 Stage 2 — The Procession",
      subtitle: "The Procession",
      duration: 55,
      baseSpeed: 420,
      maxSpeed: 620,
      spawnInterval: 0.62,
      obstacleChance: 0.38,
      goldenChance: 0.09,
      objective: { modak: 6, flower: 4, durva: 4, total: 18 },
      bg: { skyTop: "#1e0f3a", skyMid: "#3a1f5e", road: "#4a3520", roadLine: "#ff8c42" },
      decor: "procession"
    },
    {
      id: 3,
      name: "🌊 Stage 3 — The Final Journey",
      subtitle: "Final Journey",
      duration: 65,
      baseSpeed: 520,
      maxSpeed: 780,
      spawnInterval: 0.48,
      obstacleChance: 0.48,
      goldenChance: 0.13,
      objective: { modak: 8, flower: 6, durva: 5, total: 24 },
      bg: { skyTop: "#0f0a24", skyMid: "#2a184a", road: "#5a3a20", roadLine: "#ff5a5f" },
      decor: "final"
    }
  ];

  const COLLECTIBLES = {
    modak: { value: 10, color: "#ffbd59", emoji: "🍬", size: 44, blessing: 10, label: "Modak" },
    flower: { value: 15, color: "#ff7ac4", emoji: "🌸", size: 40, blessing: 14, label: "Flower" },
    durva: { value: 20, color: "#2ec4b6", emoji: "🌿", size: 42, blessing: 18, label: "Durva" },
    golden: { value: 100, color: "#ffd700", emoji: "✨", size: 54, blessing: 30, label: "Golden Modak" }
  };

  const OBSTACLES = [
    { type: "stone", emoji: "🪨", size: 52, color: "#6b5a4a" },
    { type: "box", emoji: "📦", size: 56, color: "#8b7355" },
    { type: "barrier", emoji: "🚧", size: 60, color: "#ff5a5f" },
    { type: "bucket", emoji: "🪣", size: 48, color: "#7a6a5a" }
  ];

  const COMBO_THRESHOLDS = [
    { count: 3, mult: 2, text: "COMBO x2!" },
    { count: 6, mult: 3, text: "COMBO x3!!" },
    { count: 10, mult: 4, text: "COMBO x4!!! 🔥" },
    { count: 15, mult: 5, text: "COMBO x5!!!!! 🌟" },
    { count: 22, mult: 6, text: "GODLIKE x6!!!! 🌟🌟" }
  ];

  // ---------- DOM ----------
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const screens = {
    start: document.getElementById("startScreen"),
    howToPlay: document.getElementById("howToPlayScreen"),
    game: document.getElementById("gameScreen"),
    pause: document.getElementById("pauseScreen"),
    stageComplete: document.getElementById("stageCompleteScreen"),
    gameOver: document.getElementById("gameOverScreen"),
    results: document.getElementById("resultsScreen")
  };
  const ui = {
    score: document.getElementById("scoreDisplay"),
    combo: document.getElementById("comboDisplay"),
    objective: document.getElementById("objectiveDisplay"),
    timer: document.getElementById("timerDisplay"),
    lives: document.getElementById("livesDisplay"),
    stageName: document.getElementById("stageName"),
    blessingFill: document.getElementById("blessingFill"),
    blessingStatus: document.getElementById("blessingStatus"),
    comboPopup: document.getElementById("comboPopup"),
    blessingPopup: document.getElementById("blessingPopup"),
    bestMenu: document.getElementById("bestScoreMenu")
  };

  // Buttons
  const btn = {
    play: document.getElementById("playBtn"),
    howToPlay: document.getElementById("howToPlayBtn"),
    htpBack: document.getElementById("htpBackBtn"),
    pause: document.getElementById("pauseBtn"),
    resume: document.getElementById("resumeBtn"),
    restartPause: document.getElementById("restartBtnPause"),
    mainMenuPause: document.getElementById("mainMenuBtnPause"),
    nextStage: document.getElementById("nextStageBtn"),
    playAgain: document.getElementById("playAgainBtn"),
    mainMenuOver: document.getElementById("mainMenuBtnGameOver"),
    playAgainFinal: document.getElementById("playAgainFinalBtn"),
    mainMenuFinal: document.getElementById("mainMenuBtnFinal"),
    left: document.getElementById("leftBtn"),
    right: document.getElementById("rightBtn"),
    blessing: document.getElementById("blessingBtn")
  };

  // ---------- STATE ----------
  let gameState = "MENU"; // MENU, PLAYING, PAUSED, STAGE_COMPLETE, GAME_OVER, RESULTS
  let currentStageIndex = 0;
  let stageTimeLeft = 0;
  let gameSpeed = 300;
  let distanceTraveled = 0;
  let score = 0;
  let lives = 3;
  let combo = 0;
  let bestCombo = 0;
  let blessingMeter = 0; // 0-100
  let blessingReady = false;
  let blessingActive = false;
  let blessingTimer = 0;
  let blessingCooldown = 0;
  let collected = { modak: 0, flower: 0, durva: 0, golden: 0, total: 0 };
  let totalStats = { score: 0, golden: 0, offerings: 0, bestCombo: 0, perfectStages: 0 };
  let spawnTimer = 0;
  let difficultyTimer = 0;
  let invulnerableTimer = 0;
  let shakeTimer = 0;
  let bestScore = parseInt(localStorage.getItem("mushak_best") || "0", 10);

  // Entities
  let mushak = { x: DESIGN_W / 2, y: DESIGN_H - 140, w: 78, h: 78, speed: 680, targetX: DESIGN_W / 2, vx: 0 };
  let collectibles = [];
  let obstacles = [];
  let particles = [];
  let floatTexts = [];
  let roadOffset = 0;
  let decorOffset = 0;

  // Input
  const keys = {};
  let touchLeft = false;
  let touchRight = false;
  let isDragging = false;
  let dragX = 0;

  // Loop
  let lastTime = 0;
  let animationId = null;
  let audioCtx = null;

  // ---------- AUDIO (simple WebAudio) ----------
  function getAudio() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch { audioCtx = null; }
    }
    return audioCtx;
  }
  function playTone(freq, dur, type = "sine", vol = 0.18, slide = 0) {
    const ac = getAudio();
    if (!ac) return;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.value = freq;
    o.connect(g);
    g.connect(ac.destination);
    const now = ac.currentTime;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(vol, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    if (slide) o.frequency.exponentialRampToValueAtTime(freq + slide, now + dur);
    o.start(now);
    o.stop(now + dur);
  }
  const SFX = {
    collect: () => { playTone(660, 0.18, "sine", 0.22, 220); setTimeout(() => playTone(880, 0.15, "sine", 0.15), 60); },
    golden: () => { playTone(523, 0.2, "triangle", 0.25); setTimeout(() => playTone(659, 0.2, "triangle", 0.25), 90); setTimeout(() => playTone(1046, 0.4, "sine", 0.3), 180); },
    hit: () => { playTone(180, 0.35, "sawtooth", 0.22, -80); playTone(90, 0.4, "square", 0.15); },
    combo: (lvl) => { playTone(400 + lvl * 120, 0.25, "sine", 0.22, 150); },
    blessingReady: () => { playTone(440, 0.3, "sine", 0.2); setTimeout(() => playTone(554, 0.3, "sine", 0.2), 120); setTimeout(() => playTone(659, 0.5, "sine", 0.25), 240); },
    blessingActivate: () => { playTone(300, 0.6, "triangle", 0.28, 400); setTimeout(() => playTone(600, 0.8, "sine", 0.25), 200); },
    stageComplete: () => { [0, 120, 240, 400].forEach((d, i) => setTimeout(() => playTone(400 + i * 100, 0.35, "sine", 0.22), d)); },
    gameOver: () => { playTone(300, 0.5, "sawtooth", 0.2, -150); setTimeout(() => playTone(180, 0.8, "triangle", 0.18), 300); }
  };

  // ---------- HELPERS ----------
  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove("active"));
    if (screens[name]) screens[name].classList.add("active");
  }
  function getStage() { return STAGES[currentStageIndex]; }
  function getComboMultiplier() {
    let mult = 1;
    for (let i = COMBO_THRESHOLDS.length - 1; i >= 0; i--) {
      if (combo >= COMBO_THRESHOLDS[i].count) { mult = COMBO_THRESHOLDS[i].mult; break; }
    }
    if (blessingActive) mult = Math.max(mult * 1.5, mult + 1);
    return mult;
  }
  function getComboText() {
    for (let i = COMBO_THRESHOLDS.length - 1; i >= 0; i--) {
      if (combo >= COMBO_THRESHOLDS[i].count) return COMBO_THRESHOLDS[i].text;
    }
    return combo > 1 ? `COMBO x${getComboMultiplier()}` : "";
  }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function rand(min, max) { return Math.random() * (max - min) + min; }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
  function checkCollision(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }
  function getObjectiveProgress() {
    const s = getStage();
    const obj = s.objective;
    const totalNeeded = obj.total;
    const totalHave = collected.total;
    return { have: totalHave, need: totalNeeded, percent: clamp(totalHave / totalNeeded, 0, 1) };
  }
  function isObjectiveComplete() {
    const s = getStage();
    const o = s.objective;
    return collected.modak >= o.modak && collected.flower >= o.flower && collected.durva >= o.durva && collected.total >= o.total;
  }

  // ---------- PARTICLES ----------
  function spawnParticles(x, y, color, count = 12, speed = 300) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x, y,
        vx: rand(-speed, speed),
        vy: rand(-speed, speed) - 100,
        life: rand(0.4, 0.9),
        maxLife: 1,
        size: rand(4, 10),
        color,
        gravity: 600,
        alpha: 1
      });
    }
  }
  function spawnFloatText(x, y, text, color = "#ffffff") {
    floatTexts.push({ x, y, text, color, life: 1, vy: -80, alpha: 1 });
  }

  // ---------- SPAWNING ----------
  function getLaneX(lane) {
    // 3 lanes
    const roadW = ROAD_RIGHT - ROAD_LEFT;
    const laneW = roadW / 3;
    return ROAD_LEFT + laneW * lane + laneW / 2;
  }

  function spawnCollectible() {
    const stage = getStage();
    // Decide type
    let typeRoll = Math.random();
    let type = "modak";
    if (typeRoll < stage.goldenChance) type = "golden";
    else if (typeRoll < stage.goldenChance + 0.28) type = "durva";
    else if (typeRoll < stage.goldenChance + 0.55) type = "flower";
    else type = "modak";

    const cfg = COLLECTIBLES[type];
    // Risky placement: golden near obstacle chance
    let lane = randInt(0, 2);
    let x = getLaneX(lane) + rand(-60, 60);
    x = clamp(x, ROAD_LEFT + 30, ROAD_RIGHT - 30 - cfg.size);

    // Occasionally spawn 2 in safe vs risky pattern
    if (Math.random() < 0.35) {
      // safe route: two items far from obstacles
      const secondType = Math.random() < 0.5 ? "modak" : "flower";
      const secondCfg = COLLECTIBLES[secondType];
      const secondLane = (lane + 1) % 3;
      const secondX = getLaneX(secondLane) + rand(-40, 40);
      collectibles.push({
        x: secondX, y: -secondCfg.size - rand(0, 120),
        w: secondCfg.size, h: secondCfg.size,
        type: secondType, value: secondCfg.value, color: secondCfg.color,
        rotation: rand(0, Math.PI * 2), rotSpeed: rand(-2, 2),
        bob: rand(0, Math.PI * 2)
      });
    }

    collectibles.push({
      x, y: -cfg.size - rand(0, 80),
      w: cfg.size, h: cfg.size,
      type, value: cfg.value, color: cfg.color,
      rotation: rand(0, Math.PI * 2), rotSpeed: rand(-2, 2),
      bob: rand(0, Math.PI * 2),
      risky: type === "golden" && Math.random() < 0.7
    });

    // If risky golden, spawn nearby obstacle
    if (type === "golden" && Math.random() < 0.65) {
      const obsType = OBSTACLES[randInt(0, OBSTACLES.length - 1)];
      const obsLane = Math.random() < 0.5 ? lane : randInt(0, 2);
      const obsX = getLaneX(obsLane) + rand(-30, 30);
      obstacles.push({
        x: clamp(obsX, ROAD_LEFT + 20, ROAD_RIGHT - 20 - obsType.size),
        y: -obsType.size - rand(60, 180),
        w: obsType.size, h: obsType.size,
        type: obsType.type, emoji: obsType.emoji, color: obsType.color,
        rotation: 0
      });
    }
  }

  function spawnObstacle() {
    const obsType = OBSTACLES[randInt(0, OBSTACLES.length - 1)];
    const lane = randInt(0, 2);
    const x = getLaneX(lane) + rand(-35, 35);
    obstacles.push({
      x: clamp(x, ROAD_LEFT + 20, ROAD_RIGHT - 20 - obsType.size),
      y: -obsType.size - rand(0, 100),
      w: obsType.size, h: obsType.size,
      type: obsType.type, emoji: obsType.emoji, color: obsType.color,
      rotation: rand(-0.15, 0.15)
    });
  }

  // ---------- GAME LOGIC ----------
  function resetStage() {
    const stage = getStage();
    stageTimeLeft = stage.duration;
    gameSpeed = stage.baseSpeed;
    distanceTraveled = 0;
    spawnTimer = 0;
    difficultyTimer = 0;
    collectibles = [];
    obstacles = [];
    particles = [];
    floatTexts = [];
    collected = { modak: 0, flower: 0, durva: 0, golden: 0, total: 0 };
    mushak.x = DESIGN_W / 2 - mushak.w / 2;
    mushak.targetX = mushak.x;
    blessingMeter = 0;
    blessingReady = false;
    blessingActive = false;
    blessingTimer = 0;
    invulnerableTimer = 0;
    combo = 0;
    // keep lives, score cumulative? Score is cumulative across stages for final, but we also track stage score.
    // For simplicity, score continues.
  }

  function resetGame() {
    currentStageIndex = 0;
    score = 0;
    lives = 3;
    bestCombo = 0;
    totalStats = { score: 0, golden: 0, offerings: 0, bestCombo: 0, perfectStages: 0, stagesCleared: 0 };
    resetStage();
  }

  function startGame() {
    resetGame();
    gameState = "PLAYING";
    showScreen("game");
    lastTime = performance.now();
    if (animationId) cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(gameLoop);
    updateUI();
  }

  function nextStage() {
    totalStats.score = score;
    totalStats.golden += collected.golden;
    totalStats.offerings += collected.total;
    totalStats.bestCombo = Math.max(totalStats.bestCombo, bestCombo);
    if (isObjectiveComplete()) totalStats.perfectStages++;
    totalStats.stagesCleared = currentStageIndex + 1;

    currentStageIndex++;
    if (currentStageIndex >= STAGES.length) {
      // Final results
      finishGame(true);
    } else {
      resetStage();
      gameState = "PLAYING";
      showScreen("game");
      lastTime = performance.now();
      animationId = requestAnimationFrame(gameLoop);
    }
  }

  function finishGame(completedAll = false) {
    if (completedAll) {
      gameState = "RESULTS";
      const timeBonus = Math.floor(stageTimeLeft * 12);
      const perfectBonus = totalStats.perfectStages * 500;
      const goldenBonus = totalStats.golden * 50;
      const finalTotal = score + timeBonus + perfectBonus + goldenBonus;

      document.getElementById("resultFinalScore").textContent = score;
      document.getElementById("resultBestCombo").textContent = `x${totalStats.bestCombo}`;
      document.getElementById("resultGolden").textContent = totalStats.golden;
      document.getElementById("resultOfferings").textContent = totalStats.offerings;
      document.getElementById("resultPerfect").textContent = `${totalStats.perfectStages} / 3`;
      document.getElementById("resultSpeed").textContent = `+${timeBonus + perfectBonus + goldenBonus}`;
      document.getElementById("resultTotal").textContent = finalTotal;

      if (finalTotal > bestScore) {
        bestScore = finalTotal;
        localStorage.setItem("mushak_best", String(bestScore));
        ui.bestMenu.textContent = bestScore;
      }

      showScreen("results");
      SFX.stageComplete();
    } else {
      gameState = "GAME_OVER";
      const reason = lives <= 0 ? "Mushak got tired! Out of lives." : "Time ran out before completing the objective!";
      document.getElementById("gameOverReason").textContent = reason;
      document.getElementById("finalScore").textContent = score;
      document.getElementById("finalCombo").textContent = `x${bestCombo}`;
      document.getElementById("finalGolden").textContent = collected.golden;
      document.getElementById("finalStages").textContent = `${totalStats.stagesCleared} / 3`;
      document.getElementById("bestScoreDisplay").textContent = bestScore;
      document.getElementById("gameOverTitle").textContent = lives <= 0 ? "💫 GAME OVER" : "⏱️ TIME UP!";
      showScreen("gameOver");
      SFX.gameOver();
    }

    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem("mushak_best", String(bestScore));
      ui.bestMenu.textContent = bestScore;
    }
  }

  function handleCollect(item) {
    const cfg = COLLECTIBLES[item.type];
    const mult = getComboMultiplier();
    const points = Math.floor(cfg.value * mult);
    score += points;
    combo++;
    bestCombo = Math.max(bestCombo, combo);
    collected.total++;
    if (item.type in collected) collected[item.type]++;
    else if (item.type === "golden") collected.golden++;

    // Blessing meter
    if (!blessingActive) {
      blessingMeter = Math.min(100, blessingMeter + cfg.blessing);
      if (blessingMeter >= 100 && !blessingReady) {
        blessingReady = true;
        SFX.blessingReady();
        ui.blessingStatus.textContent = "— READY! PRESS SPACE";
        ui.blessingFill.classList.add("ready");
        btn.blessing.classList.add("ready");
        spawnFloatText(mushak.x + mushak.w / 2, mushak.y - 20, "BLESSING READY!", "#ffbd59");
      }
    }

    // Effects
    spawnParticles(item.x + item.w / 2, item.y + item.h / 2, cfg.color, item.type === "golden" ? 20 : 10);
    spawnFloatText(item.x + item.w / 2, item.y, `+${points}`, cfg.color);

    if (item.type === "golden") SFX.golden();
    else SFX.collect();

    // Combo popup
    if (combo >= 3) {
      const text = getComboText();
      ui.comboPopup.textContent = text;
      ui.comboPopup.classList.add("show");
      setTimeout(() => ui.comboPopup.classList.remove("show"), 800);
      if (combo === 3 || combo === 6 || combo === 10 || combo === 15 || combo === 22) {
        SFX.combo(getComboMultiplier());
      }
    }

    updateUI();
  }

  function handleHitObstacle(obs) {
    if (invulnerableTimer > 0 || blessingActive) return;
    lives--;
    combo = 0;
    invulnerableTimer = 1.6;
    shakeTimer = 0.35;
    spawnParticles(mushak.x + mushak.w / 2, mushak.y + mushak.h / 2, "#ff5a5f", 16, 400);
    spawnFloatText(mushak.x + mushak.w / 2, mushak.y - 30, "-1 LIFE", "#ff5a5f");
    SFX.hit();
    updateUI();
    if (lives <= 0) {
      setTimeout(() => finishGame(false), 400);
    }
  }

  function activateBlessing() {
    if (!blessingReady || blessingActive) return;
    blessingActive = true;
    blessingReady = false;
    blessingTimer = 6.5;
    blessingMeter = 0;
    ui.blessingFill.classList.remove("ready");
    btn.blessing.classList.remove("ready");
    ui.blessingStatus.textContent = "— ACTIVE!";
    ui.blessingPopup.classList.add("show");
    setTimeout(() => ui.blessingPopup.classList.remove("show"), 2000);
    SFX.blessingActivate();
    spawnParticles(mushak.x + mushak.w / 2, mushak.y + mushak.h / 2, "#ffbd59", 30, 350);
  }

  // ---------- UPDATE ----------
  function update(dt) {
    if (gameState !== "PLAYING") return;

    const stage = getStage();

    // Timer
    stageTimeLeft -= dt;
    if (stageTimeLeft <= 0) {
      stageTimeLeft = 0;
      if (isObjectiveComplete()) {
        // Stage complete
        const stageScore = score;
        const timeBonus = Math.floor(stageTimeLeft * 10 + 200);
        document.getElementById("stageCompleteTitle").textContent = `🛕 ${stage.subtitle} COMPLETE!`;
        document.getElementById("stageScore").textContent = stageScore;
        document.getElementById("stageCombo").textContent = `x${bestCombo}`;
        document.getElementById("stageGolden").textContent = collected.golden;
        document.getElementById("stageTimeBonus").textContent = `+${timeBonus}`;
        gameState = "STAGE_COMPLETE";
        showScreen("stageComplete");
        SFX.stageComplete();
        return;
      } else {
        finishGame(false);
        return;
      }
    }

    // Difficulty ramp
    difficultyTimer += dt;
    const progress = 1 - stageTimeLeft / stage.duration;
    gameSpeed = stage.baseSpeed + (stage.maxSpeed - stage.baseSpeed) * progress;
    if (blessingActive) gameSpeed *= 0.42;

    // Mushak movement
    let moveInput = 0;
    if (keys["ArrowLeft"] || keys["a"] || keys["A"]) moveInput -= 1;
    if (keys["ArrowRight"] || keys["d"] || keys["D"]) moveInput += 1;
    if (touchLeft) moveInput -= 1;
    if (touchRight) moveInput += 1;

    if (isDragging) {
      mushak.targetX = dragX - mushak.w / 2;
    } else {
      mushak.targetX += moveInput * mushak.speed * dt;
    }

    // Smooth follow
    const diff = mushak.targetX - mushak.x;
    mushak.vx = diff * 12;
    mushak.x += mushak.vx * dt;
    // Also direct movement for responsiveness
    mushak.x += moveInput * mushak.speed * 0.6 * dt;

    mushak.x = clamp(mushak.x, ROAD_LEFT + 8, ROAD_RIGHT - mushak.w - 8);

    // Spawning
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnTimer = stage.spawnInterval * rand(0.7, 1.3);
      if (blessingActive) spawnTimer *= 1.2;
      if (Math.random() < stage.obstacleChance) spawnObstacle();
      spawnCollectible();
      // Extra spawn for higher difficulty
      if (progress > 0.5 && Math.random() < 0.5) spawnCollectible();
      if (progress > 0.8 && Math.random() < 0.4) spawnObstacle();
    }

    // Update collectibles
    for (let i = collectibles.length - 1; i >= 0; i--) {
      const c = collectibles[i];
      c.y += gameSpeed * dt;
      c.rotation += c.rotSpeed * dt;
      c.bob += dt * 3;
      if (c.y > DESIGN_H + 100) {
        collectibles.splice(i, 1);
        // Missing a collectible does NOT break combo in this design, only obstacle does — to be forgiving
        continue;
      }
      if (checkCollision(mushak, c)) {
        handleCollect(c);
        collectibles.splice(i, 1);
      }
    }

    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const o = obstacles[i];
      o.y += gameSpeed * dt;
      if (o.y > DESIGN_H + 100) {
        obstacles.splice(i, 1);
        continue;
      }
      if (checkCollision(mushak, o)) {
        handleHitObstacle(o);
        obstacles.splice(i, 1);
        spawnParticles(o.x + o.w / 2, o.y + o.h / 2, o.color, 14);
      }
    }

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.gravity * dt;
      p.life -= dt;
      p.alpha = p.life / p.maxLife;
      if (p.life <= 0) particles.splice(i, 1);
    }

    // Float texts
    for (let i = floatTexts.length - 1; i >= 0; i--) {
      const f = floatTexts[i];
      f.y += f.vy * dt;
      f.life -= dt;
      f.alpha = f.life;
      if (f.life <= 0) floatTexts.splice(i, 1);
    }

    // Blessing
    if (blessingActive) {
      blessingTimer -= dt;
      if (blessingTimer <= 0) {
        blessingActive = false;
        ui.blessingStatus.textContent = "";
      } else {
        const pulse = Math.sin(Date.now() * 0.01) * 0.2 + 0.8;
        ui.blessingStatus.textContent = `— ${blessingTimer.toFixed(1)}s`;
      }
    }

    // Invulnerability
    if (invulnerableTimer > 0) invulnerableTimer -= dt;
    if (shakeTimer > 0) shakeTimer -= dt;

    // Road scroll
    roadOffset += gameSpeed * dt * 0.3;
    decorOffset += gameSpeed * dt * 0.1;

    // Check objective + finish line condition: if close to end and objective done, auto complete
    if (stageTimeLeft < 3 && isObjectiveComplete()) {
      // Let timer run out to trigger stage complete
    }

    distanceTraveled += gameSpeed * dt;

    updateUI();
  }

  function updateUI() {
    const stage = getStage();
    ui.score.textContent = score;
    const mult = getComboMultiplier();
    ui.combo.textContent = combo >= 2 ? `x${mult} (${combo})` : "";
    ui.combo.style.display = combo >= 2 ? "inline" : "none";

    const prog = getObjectiveProgress();
    ui.objective.textContent = `${prog.have} / ${prog.need} ${isObjectiveComplete() ? "✅" : ""}`;
    ui.timer.textContent = Math.ceil(stageTimeLeft);
    ui.lives.textContent = "❤️".repeat(Math.max(0, lives)) + "🤍".repeat(3 - Math.max(0, lives));
    ui.stageName.textContent = stage.name;

    ui.blessingFill.style.width = `${blessingMeter}%`;
    if (blessingActive) {
      ui.blessingFill.style.width = `${(blessingTimer / 6.5) * 100}%`;
      ui.blessingFill.style.background = "linear-gradient(90deg, #fff8a0, #ffbd59, #ffffff)";
    } else {
      ui.blessingFill.style.background = "";
    }
  }

  // ---------- DRAW ----------
  function draw() {
    const stage = getStage();

    // Clear
    ctx.clearRect(0, 0, DESIGN_W, DESIGN_H);

    // Shake
    ctx.save();
    if (shakeTimer > 0) {
      const intensity = shakeTimer * 18;
      ctx.translate(rand(-intensity, intensity), rand(-intensity, intensity));
    }

    // Background sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, DESIGN_H);
    skyGrad.addColorStop(0, stage.bg.skyTop);
    skyGrad.addColorStop(0.5, stage.bg.skyMid);
    skyGrad.addColorStop(1, "#0d0618");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, DESIGN_W, DESIGN_H);

    // Stars / lights
    drawStars();

    // Side decorations (pandal/procession)
    drawSideDecor();

    // Road
    drawRoad();

    // Collectibles
    drawCollectibles();

    // Obstacles
    drawObstacles();

    // Mushak
    drawMushak();

    // Particles
    drawParticles();

    // Float texts
    drawFloatTexts();

    // Finish line if near end
    if (stageTimeLeft < 6) {
      drawFinishLine();
    }

    // Blessing overlay
    if (blessingActive) {
      ctx.fillStyle = `rgba(255, 189, 89, ${0.08 + Math.sin(Date.now() * 0.008) * 0.04})`;
      ctx.fillRect(ROAD_LEFT, 0, ROAD_RIGHT - ROAD_LEFT, DESIGN_H);
      // vignette
      const glowGrad = ctx.createRadialGradient(mushak.x + mushak.w / 2, mushak.y + mushak.h / 2, 80, mushak.x + mushak.w / 2, mushak.y + mushak.h / 2, 400);
      glowGrad.addColorStop(0, "rgba(255, 248, 160, 0.25)");
      glowGrad.addColorStop(1, "rgba(255, 189, 89, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(mushak.x + mushak.w / 2, mushak.y + mushak.h / 2, 400, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // HUD text on canvas for mobile fallback
    if (gameState === "PLAYING" && isObjectiveComplete() && stageTimeLeft < 8) {
      ctx.save();
      ctx.textAlign = "center";
      ctx.font = "bold 42px Baloo 2";
      ctx.fillStyle = "#ffbd59";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 6;
      ctx.strokeText("🏁 REACH THE PANDAL! 🏁", DESIGN_W / 2, 140);
      ctx.fillText("🏁 REACH THE PANDAL! 🏁", DESIGN_W / 2, 140);
      ctx.restore();
    }
  }

  function drawStars() {
    ctx.save();
    const time = decorOffset * 0.05;
    for (let i = 0; i < 60; i++) {
      const x = (i * 137.5 + time * (i % 3 + 1) * 0.2) % DESIGN_W;
      const y = (i * 73) % (DESIGN_H * 0.6);
      const size = (Math.sin(i) * 0.5 + 1.2) * 2;
      const alpha = 0.3 + Math.sin(time * 0.001 + i) * 0.3;
      ctx.fillStyle = `rgba(255, ${200 + i % 55}, ${150 + i % 100}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawSideDecor() {
    const stage = getStage();
    // Left side
    ctx.save();
    // Left pandal wall
    const leftGrad = ctx.createLinearGradient(0, 0, ROAD_LEFT, 0);
    leftGrad.addColorStop(0, "rgba(0,0,0,0.5)");
    leftGrad.addColorStop(1, "rgba(255,140,66,0.08)");
    ctx.fillStyle = leftGrad;
    ctx.fillRect(0, 0, ROAD_LEFT, DESIGN_H);

    // Right side
    const rightGrad = ctx.createLinearGradient(ROAD_RIGHT, 0, DESIGN_W, 0);
    rightGrad.addColorStop(0, "rgba(255,140,66,0.08)");
    rightGrad.addColorStop(1, "rgba(0,0,0,0.5)");
    ctx.fillStyle = rightGrad;
    ctx.fillRect(ROAD_RIGHT, 0, DESIGN_W - ROAD_RIGHT, DESIGN_H);

    // Decorative lights string
    ctx.strokeStyle = "rgba(255,189,89,0.25)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 12]);
    for (let side of [ROAD_LEFT - 20, ROAD_RIGHT + 20]) {
      ctx.beginPath();
      for (let y = -40 + (decorOffset % 80); y < DESIGN_H + 40; y += 80) {
        if (y === -40 + (decorOffset % 80)) ctx.moveTo(side, y);
        else ctx.lineTo(side + Math.sin(y * 0.01 + decorOffset * 0.002) * 8, y);
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Diyas and flowers
    const decorCount = 12;
    for (let i = 0; i < decorCount; i++) {
      const y = (i * 140 - decorOffset * 0.5) % (DESIGN_H + 200) - 100;
      // Left
      drawDiya(60 + Math.sin(i) * 20, y, 1);
      // Right
      drawDiya(DESIGN_W - 60 + Math.cos(i) * 20, y + 70, 1);
    }

    // Stage-specific
    if (stage.decor === "procession") {
      // Dhol silhouettes
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      for (let i = 0; i < 4; i++) {
        const y = (i * 260 - decorOffset * 0.3) % (DESIGN_H + 300) - 100;
        ctx.fillRect(30, y, 80, 120);
        ctx.fillRect(DESIGN_W - 110, y + 130, 80, 120);
      }
    }

    ctx.restore();
  }

  function drawDiya(x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    // Glow
    const glow = ctx.createRadialGradient(0, -6, 0, 0, -6, 18);
    glow.addColorStop(0, "rgba(255,189,89,0.8)");
    glow.addColorStop(1, "rgba(255,140,66,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, -6, 18, 0, Math.PI * 2);
    ctx.fill();
    // Diya body
    ctx.fillStyle = "#8b4513";
    ctx.beginPath();
    ctx.ellipse(0, 4, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff8c42";
    ctx.beginPath();
    ctx.arc(0, -4, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawRoad() {
    const stage = getStage();
    // Road base
    ctx.fillStyle = stage.bg.road;
    ctx.fillRect(ROAD_LEFT, 0, ROAD_RIGHT - ROAD_LEFT, DESIGN_H);

    // Road texture lines
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 1;
    for (let y = -20 + (roadOffset % 40); y < DESIGN_H; y += 40) {
      ctx.beginPath();
      ctx.moveTo(ROAD_LEFT, y);
      ctx.lineTo(ROAD_RIGHT, y);
      ctx.stroke();
    }

    // Lane lines
    const roadW = ROAD_RIGHT - ROAD_LEFT;
    ctx.strokeStyle = stage.bg.roadLine;
    ctx.lineWidth = 3;
    ctx.setLineDash([22, 28]);
    ctx.lineDashOffset = -roadOffset;
    for (let i = 1; i < 3; i++) {
      const x = ROAD_LEFT + roadW * (i / 3);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, DESIGN_H);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;

    // Road edges
    ctx.strokeStyle = "rgba(255,189,89,0.6)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(ROAD_LEFT, 0);
    ctx.lineTo(ROAD_LEFT, DESIGN_H);
    ctx.moveTo(ROAD_RIGHT, 0);
    ctx.lineTo(ROAD_RIGHT, DESIGN_H);
    ctx.stroke();

    // Rangoli pattern at top (pandal entrance)
    if (roadOffset < 200) {
      ctx.save();
      ctx.globalAlpha = 1 - roadOffset / 200;
      drawRangoli(DESIGN_W / 2, 120 - roadOffset * 0.5, 80);
      ctx.restore();
    }
  }

  function drawRangoli(x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    for (let i = 0; i < 8; i++) {
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = i % 2 === 0 ? "#ff7ac4" : "#ffbd59";
      ctx.beginPath();
      ctx.ellipse(0, -size * 0.5, size * 0.18, size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#2ec4b6";
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawCollectibles() {
    for (const c of collectibles) {
      ctx.save();
      ctx.translate(c.x + c.w / 2, c.y + c.h / 2 + Math.sin(c.bob) * 4);
      ctx.rotate(c.rotation);

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(0, c.h / 2 + 8, c.w * 0.45, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glow for golden
      if (c.type === "golden") {
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, c.w * 0.9);
        glow.addColorStop(0, "rgba(255,215,0,0.6)");
        glow.addColorStop(1, "rgba(255,215,0,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, c.w * 0.9, 0, Math.PI * 2);
        ctx.fill();
      }

      // Base
      ctx.fillStyle = c.color;
      ctx.beginPath();
      if (c.type === "modak") {
        // Modak shape: triangle with rounded top
        ctx.moveTo(0, -c.h * 0.42);
        ctx.bezierCurveTo(c.w * 0.4, -c.h * 0.2, c.w * 0.4, c.h * 0.4, 0, c.h * 0.45);
        ctx.bezierCurveTo(-c.w * 0.4, c.h * 0.4, -c.w * 0.4, -c.h * 0.2, 0, -c.h * 0.42);
      } else if (c.type === "flower") {
        for (let i = 0; i < 5; i++) {
          ctx.rotate((Math.PI * 2) / 5);
          ctx.beginPath();
          ctx.ellipse(0, -c.h * 0.22, c.w * 0.22, c.h * 0.32, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(0, 0, c.w * 0.18, 0, Math.PI * 2);
        ctx.fillStyle = "#ffeb3b";
        ctx.fill();
        ctx.fillStyle = c.color;
      } else if (c.type === "durva") {
        // Durva: three leaves
        for (let i = -1; i <= 1; i++) {
          ctx.save();
          ctx.rotate(i * 0.45);
          ctx.beginPath();
          ctx.ellipse(0, -c.h * 0.15, c.w * 0.12, c.h * 0.42, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      } else { // golden
        ctx.moveTo(0, -c.h * 0.5);
        ctx.lineTo(c.w * 0.45, -c.h * 0.15);
        ctx.lineTo(c.w * 0.28, c.h * 0.45);
        ctx.lineTo(-c.w * 0.28, c.h * 0.45);
        ctx.lineTo(-c.w * 0.45, -c.h * 0.15);
        ctx.closePath();
      }
      ctx.fill();

      // Highlight
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.beginPath();
      ctx.ellipse(-c.w * 0.15, -c.h * 0.15, c.w * 0.12, c.h * 0.12, -0.5, 0, Math.PI * 2);
      ctx.fill();

      // Emoji overlay for quick recognition (small)
      ctx.font = `${Math.floor(c.w * 0.55)}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(COLLECTIBLES[c.type].emoji, 0, 2);

      ctx.restore();
    }
  }

  function drawObstacles() {
    for (const o of obstacles) {
      ctx.save();
      ctx.translate(o.x + o.w / 2, o.y + o.h / 2);
      ctx.rotate(o.rotation);

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath();
      ctx.ellipse(0, o.h / 2 + 6, o.w * 0.5, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.fillStyle = o.color;
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 3;
      if (o.type === "barrier") {
        ctx.fillRect(-o.w / 2, -o.h / 2, o.w, o.h);
        ctx.strokeRect(-o.w / 2, -o.h / 2, o.w, o.h);
        // Stripes
        ctx.fillStyle = "#ffbd59";
        ctx.fillRect(-o.w / 2, -o.h * 0.25, o.w, o.h * 0.15);
        ctx.fillRect(-o.w / 2, o.h * 0.1, o.w, o.h * 0.15);
      } else {
        ctx.beginPath();
        ctx.roundRect(-o.w / 2, -o.h / 2, o.w, o.h, 10);
        ctx.fill();
        ctx.stroke();
      }

      ctx.font = `${Math.floor(o.w * 0.6)}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(o.emoji, 0, 2);

      // Warning if risky golden nearby
      ctx.restore();
    }
  }

  function drawMushak() {
    ctx.save();
    ctx.translate(mushak.x + mushak.w / 2, mushak.y + mushak.h / 2);

    // Squash/stretch based on speed
    const speedFactor = Math.abs(mushak.vx) * 0.001;
    ctx.scale(1 + speedFactor * 0.15, 1 - speedFactor * 0.08);

    // Invulnerability flicker
    if (invulnerableTimer > 0 && Math.floor(invulnerableTimer * 12) % 2 === 0) {
      ctx.globalAlpha = 0.35;
    }

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(0, mushak.h * 0.42, mushak.w * 0.42, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = "#c49a6c";
    ctx.beginPath();
    ctx.ellipse(0, 6, mushak.w * 0.32, mushak.h * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = "#d9b18e";
    ctx.beginPath();
    ctx.ellipse(0, -mushak.h * 0.12, mushak.w * 0.34, mushak.h * 0.30, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = "#a67c52";
    ctx.beginPath();
    ctx.ellipse(-mushak.w * 0.28, -mushak.h * 0.28, 16, 20, -0.3, 0, Math.PI * 2);
    ctx.ellipse(mushak.w * 0.28, -mushak.h * 0.28, 16, 20, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffb3b3";
    ctx.beginPath();
    ctx.ellipse(-mushak.w * 0.28, -mushak.h * 0.26, 8, 11, -0.3, 0, Math.PI * 2);
    ctx.ellipse(mushak.w * 0.28, -mushak.h * 0.26, 8, 11, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#2b1a0e";
    ctx.beginPath();
    ctx.arc(-10, -10, 6, 0, Math.PI * 2);
    ctx.arc(10, -10, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(-8, -12, 2.5, 0, Math.PI * 2);
    ctx.arc(12, -12, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = "#ff8c94";
    ctx.beginPath();
    ctx.arc(0, -2, 5, 0, Math.PI * 2);
    ctx.fill();

    // Tail
    ctx.strokeStyle = "#a67c52";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, mushak.h * 0.30);
    ctx.quadraticCurveTo(18 + Math.sin(Date.now() * 0.008) * 6, mushak.h * 0.45, 8, mushak.h * 0.52);
    ctx.stroke();

    // Blessing aura
    if (blessingActive) {
      ctx.strokeStyle = `rgba(255, 189, 89, ${0.6 + Math.sin(Date.now() * 0.01) * 0.3})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, mushak.w * 0.6, 0, Math.PI * 2);
      ctx.stroke();
      // Om symbol hint
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "bold 14px serif";
      ctx.textAlign = "center";
      ctx.fillText("ॐ", 0, -mushak.h * 0.55);
    }

    // Tiny modak in hand when combo high
    if (combo >= 3) {
      ctx.fillStyle = "#ffbd59";
      ctx.beginPath();
      ctx.arc(18, 10, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawParticles() {
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawFloatTexts() {
    for (const f of floatTexts) {
      ctx.save();
      ctx.globalAlpha = f.alpha;
      ctx.fillStyle = f.color;
      ctx.strokeStyle = "rgba(0,0,0,0.6)";
      ctx.lineWidth = 4;
      ctx.font = "bold 26px Baloo 2";
      ctx.textAlign = "center";
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillText(f.text, f.x, f.y);
      ctx.restore();
    }
  }

  function drawFinishLine() {
    ctx.save();
    const y = DESIGN_H - (stageTimeLeft / 6) * DESIGN_H;
    ctx.fillStyle = "rgba(255,189,89,0.9)";
    ctx.fillRect(ROAD_LEFT, y, ROAD_RIGHT - ROAD_LEFT, 12);
    ctx.fillStyle = "#fff8ec";
    for (let x = ROAD_LEFT; x < ROAD_RIGHT; x += 30) {
      if (Math.floor(x / 30) % 2 === 0) ctx.fillRect(x, y, 15, 12);
    }
    ctx.font = "bold 28px Baloo 2";
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 5;
    ctx.textAlign = "center";
    ctx.strokeText("🛕 PANDAL AHEAD 🛕", DESIGN_W / 2, y - 18);
    ctx.fillText("🛕 PANDAL AHEAD 🛕", DESIGN_W / 2, y - 18);
    ctx.restore();
  }

  // ---------- LOOP ----------
  function gameLoop(time) {
    const dt = Math.min((time - lastTime) / 1000, 0.033);
    lastTime = time;

    if (gameState === "PLAYING") {
      update(dt);
    }
    draw();

    if (gameState === "PLAYING") {
      animationId = requestAnimationFrame(gameLoop);
    } else if (gameState !== "MENU") {
      // Keep drawing paused screens with background
      animationId = requestAnimationFrame(gameLoop);
    }
  }

  // ---------- INPUT ----------
  window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if (e.code === "Space") {
      e.preventDefault();
      if (gameState === "PLAYING") activateBlessing();
    }
    if (e.key === "p" || e.key === "P") {
      if (gameState === "PLAYING") {
        gameState = "PAUSED";
        showScreen("pause");
      } else if (gameState === "PAUSED") {
        gameState = "PLAYING";
        showScreen("game");
        lastTime = performance.now();
        animationId = requestAnimationFrame(gameLoop);
      }
    }
    if (e.key === "r" || e.key === "R") {
      if (gameState === "PLAYING" || gameState === "PAUSED") {
        startGame();
      }
    }
  });
  window.addEventListener("keyup", (e) => { keys[e.key] = false; });

  // Touch controls
  btn.left.addEventListener("touchstart", (e) => { e.preventDefault(); touchLeft = true; });
  btn.left.addEventListener("touchend", (e) => { e.preventDefault(); touchLeft = false; });
  btn.left.addEventListener("mousedown", () => touchLeft = true);
  btn.left.addEventListener("mouseup", () => touchLeft = false);
  btn.left.addEventListener("mouseleave", () => touchLeft = false);

  btn.right.addEventListener("touchstart", (e) => { e.preventDefault(); touchRight = true; });
  btn.right.addEventListener("touchend", (e) => { e.preventDefault(); touchRight = false; });
  btn.right.addEventListener("mousedown", () => touchRight = true);
  btn.right.addEventListener("mouseup", () => touchRight = false);
  btn.right.addEventListener("mouseleave", () => touchRight = false);

  btn.blessing.addEventListener("click", () => { if (gameState === "PLAYING") activateBlessing(); });
  btn.blessing.addEventListener("touchstart", (e) => { e.preventDefault(); if (gameState === "PLAYING") activateBlessing(); });

  // Canvas drag
  function getCanvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const scaleX = DESIGN_W / rect.width;
    return (clientX - rect.left) * scaleX;
  }
  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    isDragging = true;
    dragX = getCanvasPos(e);
    mushak.targetX = dragX - mushak.w / 2;
  }, { passive: false });
  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (isDragging) {
      dragX = getCanvasPos(e);
      mushak.targetX = dragX - mushak.w / 2;
    }
  }, { passive: false });
  canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    isDragging = false;
  });
  canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    dragX = getCanvasPos(e);
    mushak.targetX = dragX - mushak.w / 2;
  });
  canvas.addEventListener("mousemove", (e) => {
    if (isDragging) {
      dragX = getCanvasPos(e);
      mushak.targetX = dragX - mushak.w / 2;
    }
  });
  window.addEventListener("mouseup", () => isDragging = false);

  // ---------- BUTTONS ----------
  btn.play.addEventListener("click", () => { getAudio(); startGame(); });
  btn.howToPlay.addEventListener("click", () => showScreen("howToPlay"));
  btn.htpBack.addEventListener("click", () => showScreen("start"));

  btn.pause.addEventListener("click", () => {
    if (gameState === "PLAYING") {
      gameState = "PAUSED";
      showScreen("pause");
    }
  });
  btn.resume.addEventListener("click", () => {
    gameState = "PLAYING";
    showScreen("game");
    lastTime = performance.now();
    animationId = requestAnimationFrame(gameLoop);
  });
  btn.restartPause.addEventListener("click", () => startGame());
  btn.mainMenuPause.addEventListener("click", () => {
    gameState = "MENU";
    showScreen("start");
    if (animationId) cancelAnimationFrame(animationId);
  });

  btn.nextStage.addEventListener("click", () => nextStage());

  btn.playAgain.addEventListener("click", () => startGame());
  btn.mainMenuOver.addEventListener("click", () => {
    gameState = "MENU";
    showScreen("start");
    if (animationId) cancelAnimationFrame(animationId);
  });
  btn.playAgainFinal.addEventListener("click", () => startGame());
  btn.mainMenuFinal.addEventListener("click", () => {
    gameState = "MENU";
    showScreen("start");
    if (animationId) cancelAnimationFrame(animationId);
  });

  // ---------- INIT ----------
  function init() {
    // Canvas DPR
    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      // Keep design size for logic, but adjust display
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      // For sharpness, we could set internal size * dpr, but we keep design 1600x900 and scale ctx
      // ctx.setTransform(dpr,0,0,dpr,0,0) not needed because we draw in design space
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    ui.bestMenu.textContent = bestScore;
    showScreen("start");
    // Initial draw for menu background
    lastTime = performance.now();
    function menuLoop(t) {
      if (gameState === "MENU") {
        // Animate background for menu
        roadOffset += 1.5;
        decorOffset += 0.6;
        draw();
        animationId = requestAnimationFrame(menuLoop);
      }
    }
    animationId = requestAnimationFrame(menuLoop);

    console.log("🐭 Mushak: The Festive Quest — v0.1 ready. Checklist: movement, collectibles, obstacles, lives, combo, blessing, 3 stages.");
  }

  // Polyfill roundRect
  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
      this.beginPath();
      this.moveTo(x + r, y);
      this.lineTo(x + w - r, y);
      this.quadraticCurveTo(x + w, y, x + w, y + r);
      this.lineTo(x + w, y + h - r);
      this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      this.lineTo(x + r, y + h);
      this.quadraticCurveTo(x, y + h, x, y + h - r);
      this.lineTo(x, y + r);
      this.quadraticCurveTo(x, y, x + r, y);
      this.closePath();
      return this;
    };
  }

  init();
})();
