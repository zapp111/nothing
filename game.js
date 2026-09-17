/* 🐭 Mushak: The Festive Quest — v1.0 Final
   Complete game: art integration, audio, polish, mobile, performance
   Tech: Vanilla JS, Canvas 2D, WebAudio, no frameworks
*/

(() => {
  let DESIGN_W = 1600, DESIGN_H = 900;
  // Responsive canvas size - taller on phone portrait so not small/thin
  function getDesignSize(){
    if(typeof window!=="undefined"){
      const isPortrait = window.innerHeight > window.innerWidth;
      if(window.innerWidth < 600 && isPortrait){
        // Portrait phone: taller canvas, 9:14 aspect (~0.64) - more vertical space for runner
        return {w: 900, h: 1400};
      }
      if(window.innerWidth < 900){
        // Tablet portrait: 3:4
        return {w: 1200, h: 900};
      }
    }
    return {w: 1600, h: 900};
  }
  // Responsive road margins - MUCH wider road on phone so it doesn't look thin
  function getRoadMargin(){
    const size = getDesignSize();
    if(size.w <= 900) return 35; // 92% road on portrait phone
    if(size.w <= 1200) return 80;
    if(typeof window!=="undefined" && window.innerWidth < 600) return 50;
    if(typeof window!=="undefined" && window.innerWidth < 900) return 90;
    return 280;
  }
  let ROAD_MARGIN = getRoadMargin();
  let ROAD_LEFT = ROAD_MARGIN, ROAD_RIGHT = DESIGN_W - ROAD_MARGIN;
  function updateRoadMargins(){
    const size = getDesignSize();
    DESIGN_W = size.w;
    DESIGN_H = size.h;
    ROAD_MARGIN = getRoadMargin();
    ROAD_LEFT = ROAD_MARGIN;
    ROAD_RIGHT = DESIGN_W - ROAD_MARGIN;
    // Update canvas internal size
    if(canvas){
      canvas.width = DESIGN_W;
      canvas.height = DESIGN_H;
    }
    // Keep mushak inside
    if(mushak){
      mushak.y = DESIGN_H - 140;
      mushak.x = clamp(mushak.x, ROAD_LEFT+8, ROAD_RIGHT-mushak.w-8);
      mushak.targetX = clamp(mushak.targetX, ROAD_LEFT+8, ROAD_RIGHT-mushak.w-8);
    }
  }

  const STAGES = [
    { id:1, name:"🛕 Stage 1 — The Pandal", subtitle:"The Pandal", duration:45, baseSpeed:320, maxSpeed:480, spawnInterval:0.85, obstacleChance:0.28, goldenChance:0.06, objective:{modak:4, flower:3, durva:2, total:12}, bg:{skyTop:"#1a0b2e", skyMid:"#2d1b4e", road:"#3a2a1a", roadLine:"#ffbd59"}, decor:"pandal" },
    { id:2, name:"🥁 Stage 2 — The Procession", subtitle:"The Procession", duration:55, baseSpeed:420, maxSpeed:620, spawnInterval:0.62, obstacleChance:0.38, goldenChance:0.09, objective:{modak:6, flower:4, durva:4, total:18}, bg:{skyTop:"#1e0f3a", skyMid:"#3a1f5e", road:"#4a3520", roadLine:"#ff8c42"}, decor:"procession" },
    { id:3, name:"🌊 Stage 3 — The Final Journey", subtitle:"Final Journey", duration:65, baseSpeed:520, maxSpeed:780, spawnInterval:0.48, obstacleChance:0.48, goldenChance:0.13, objective:{modak:8, flower:6, durva:5, total:24}, bg:{skyTop:"#0f0a24", skyMid:"#2a184a", road:"#5a3a20", roadLine:"#ff5a5f"}, decor:"final" }
  ];

  const COLLECTIBLES_CFG = {
    modak:{value:10, color:"#ffbd59", emoji:"🍬", size:46, blessing:10, label:"Modak", img:"modak.png"},
    flower:{value:15, color:"#ff7ac4", emoji:"🌸", size:42, blessing:14, label:"Flower", img:"flower.png"},
    durva:{value:20, color:"#2ec4b6", emoji:"🌿", size:44, blessing:18, label:"Durva", img:"durva.png"},
    golden:{value:100, color:"#ffd700", emoji:"✨", size:56, blessing:30, label:"Golden Modak", img:"golden-modak.png"}
  };
  const OBSTACLES_CFG = [
    {type:"stone", emoji:"🪨", size:54, color:"#6b5a4a", img:"obstacle-stone.png"},
    {type:"box", emoji:"📦", size:58, color:"#8b7355", img:"obstacle-box.png"},
    {type:"barrier", emoji:"🚧", size:62, color:"#ff5a5f", img:"obstacle-barrier.png"},
    {type:"bucket", emoji:"🪣", size:50, color:"#7a6a5a", img:null}
  ];
  const COMBO_THRESHOLDS = [
    {count:3, mult:2, text:"COMBO x2!"},
    {count:6, mult:3, text:"COMBO x3!!"},
    {count:10, mult:4, text:"COMBO x4!!! 🔥"},
    {count:15, mult:5, text:"COMBO x5!!!!! 🌟"},
    {count:22, mult:6, text:"GODLIKE x6!!!! 🌟🌟"},
    {count:30, mult:7, text:"LEGENDARY x7!!!!! 💫"},
    {count:40, mult:8, text:"MYTHIC x8!!!!!! 🌈"},
    {count:55, mult:10, text:"FESTIVAL GOD x10!!!!!!! 🎉"}
  ];

  // DOM
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const screens = {
    loading: document.getElementById("loadingScreen"),
    start: document.getElementById("startScreen"),
    howToPlay: document.getElementById("howToPlayScreen"),
    credits: document.getElementById("creditsScreen"),
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
    bestMenu: document.getElementById("bestScoreMenu"),
    loadingFill: document.getElementById("loadingFill"),
    loadingText: document.getElementById("loadingText"),
    fps: document.getElementById("fpsDisplay"),
    pauseScore: document.getElementById("pauseScore"),
    pauseStage: document.getElementById("pauseStage")
  };
  const btn = {
    play: document.getElementById("playBtn"),
    howToPlay: document.getElementById("howToPlayBtn"),
    credits: document.getElementById("creditsBtn"),
    htpBack: document.getElementById("htpBackBtn"),
    creditsBack: document.getElementById("creditsBackBtn"),
    pause: document.getElementById("pauseBtn"),
    mute: document.getElementById("muteBtn"),
    audioToggle: document.getElementById("audioToggle"),
    resume: document.getElementById("resumeBtn"),
    restartPause: document.getElementById("restartBtnPause"),
    mainMenuPause: document.getElementById("mainMenuBtnPause"),
    nextStage: document.getElementById("nextStageBtn"),
    stageMenu: document.getElementById("stageMenuBtn"),
    playAgain: document.getElementById("playAgainBtn"),
    mainMenuOver: document.getElementById("mainMenuBtnGameOver"),
    playAgainFinal: document.getElementById("playAgainFinalBtn"),
    mainMenuFinal: document.getElementById("mainMenuBtnFinal"),
    left: document.getElementById("leftBtn"),
    right: document.getElementById("rightBtn"),
    blessing: document.getElementById("blessingBtn"),
    copyScore: document.getElementById("copyScoreBtn")
  };

  // State
  let gameState = "LOADING";
  let currentStageIndex = 0, stageTimeLeft = 0, gameSpeed = 300, distanceTraveled = 0;
  let score = 0, lives = 3, combo = 0, bestCombo = 0;
  let blessingMeter = 0, blessingReady = false, blessingActive = false, blessingTimer = 0;
  let collected = {modak:0, flower:0, durva:0, golden:0, total:0};
  let totalStats = {score:0, golden:0, offerings:0, bestCombo:0, perfectStages:0, stagesCleared:0};
  let spawnTimer = 0, difficultyTimer = 0, invulnerableTimer = 0, shakeTimer = 0;
  let bestScore = 0;
  let isMuted = false;
  try {
    bestScore = parseInt(localStorage.getItem("mushak_best")||"0",10);
    isMuted = localStorage.getItem("mushak_muted")==="true";
  } catch(e){ console.warn("localStorage blocked", e); bestScore=0; isMuted=false; }
  let mushak = {x:DESIGN_W/2, y:DESIGN_H-140, w:78, h:78, speed:680, targetX:DESIGN_W/2, vx:0};
  let collectibles=[], obstacles=[], particles=[], floatTexts=[];
  let roadOffset=0, decorOffset=0;
  const keys={}; let touchLeft=false, touchRight=false, isDragging=false, dragX=0;
  let lastTime=0, animationId=null, fps=0, frameCount=0, fpsTimer=0;
  let audioCtx=null, bgMusicGain=null, bgOscillators=[], isMusicPlaying=false;

  // Assets
  const images = {};
  const imageList = [
    "mushak.png","modak.png","golden-modak.png","flower.png","durva.png",
    "diya.png","pandal.png","rangoli.png","obstacle-barrier.png","blessing.png",
    "obstacle-stone.png","obstacle-box.png"
  ];
  let imagesLoaded=0, imagesTotal=imageList.length;

  function loadImages() {
    return new Promise((resolve) => {
      if (imageList.length===0) { resolve(); return; }
      imageList.forEach(name => {
        const img = new Image();
        img.onload = () => {
          images[name]=img;
          imagesLoaded++;
          updateLoadingProgress();
          if (imagesLoaded>=imagesTotal) resolve();
        };
        img.onerror = () => {
          console.warn("Failed to load", name);
          imagesLoaded++;
          updateLoadingProgress();
          if (imagesLoaded>=imagesTotal) resolve();
        };
        img.src = `assets/images/${name}`;
      });
      // Timeout fallback
      setTimeout(()=>{ if(imagesLoaded<imagesTotal) resolve(); }, 4000);
    });
  }
  function updateLoadingProgress() {
    const pct = Math.floor((imagesLoaded/imagesTotal)*100);
    if (ui.loadingFill) ui.loadingFill.style.width = pct+"%";
    const texts = ["Preparing offerings...","Lighting diyas...","Decorating pandal...","Waking Mushak...","Almost ready!"];
    const idx = Math.floor((imagesLoaded/imagesTotal)* (texts.length-1));
    if (ui.loadingText) ui.loadingText.textContent = texts[idx] + ` ${pct}%`;
  }

  // Audio
  function getAudio() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext||window.webkitAudioContext)(); } catch { audioCtx=null; }
    }
    return audioCtx;
  }
  function playTone(freq,dur,type="sine",vol=0.18,slide=0) {
    if (isMuted) return;
    const ac=getAudio(); if(!ac) return;
    const o=ac.createOscillator(), g=ac.createGain();
    o.type=type; o.frequency.value=freq; o.connect(g); g.connect(ac.destination);
    const now=ac.currentTime;
    g.gain.setValueAtTime(0,now); g.gain.linearRampToValueAtTime(vol,now+0.02); g.gain.exponentialRampToValueAtTime(0.001,now+dur);
    if(slide) o.frequency.exponentialRampToValueAtTime(freq+slide,now+dur);
    o.start(now); o.stop(now+dur);
  }
  const SFX = {
    collect:()=>{ playTone(660,0.18,"sine",0.22,220); setTimeout(()=>playTone(880,0.15,"sine",0.15),60); },
    golden:()=>{ playTone(523,0.2,"triangle",0.25); setTimeout(()=>playTone(659,0.2,"triangle",0.25),90); setTimeout(()=>playTone(1046,0.4,"sine",0.3),180); },
    hit:()=>{ playTone(180,0.35,"sawtooth",0.22,-80); playTone(90,0.4,"square",0.15); },
    combo:(lvl)=>{ playTone(400+lvl*120,0.25,"sine",0.22,150); },
    blessingReady:()=>{ playTone(440,0.3,"sine",0.2); setTimeout(()=>playTone(554,0.3,"sine",0.2),120); setTimeout(()=>playTone(659,0.5,"sine",0.25),240); },
    blessingActivate:()=>{ playTone(300,0.6,"triangle",0.28,400); setTimeout(()=>playTone(600,0.8,"sine",0.25),200); },
    stageComplete:()=>{ [0,120,240,400].forEach((d,i)=>setTimeout(()=>playTone(400+i*100,0.35,"sine",0.22),d)); },
    gameOver:()=>{ playTone(300,0.5,"sawtooth",0.2,-150); setTimeout(()=>playTone(180,0.8,"triangle",0.18),300); },
    uiClick:()=>{ playTone(800,0.12,"sine",0.15,100); }
  };

  function startBackgroundMusic() {
    if (isMuted || isMusicPlaying) return;
    const ac=getAudio(); if(!ac) return;
    stopBackgroundMusic();
    try {
      bgMusicGain = ac.createGain();
      bgMusicGain.gain.value = 0.06;
      bgMusicGain.connect(ac.destination);
      // Create gentle festive drone with 2 oscillators
      const osc1 = ac.createOscillator(); osc1.type="sine"; osc1.frequency.value=110;
      const osc2 = ac.createOscillator(); osc2.type="triangle"; osc2.frequency.value=220;
      const lfo = ac.createOscillator(); lfo.type="sine"; lfo.frequency.value=0.15;
      const lfoGain = ac.createGain(); lfoGain.gain.value=8;
      lfo.connect(lfoGain); lfoGain.connect(osc1.frequency);
      osc1.connect(bgMusicGain); osc2.connect(bgMusicGain);
      osc1.start(); osc2.start(); lfo.start();
      bgOscillators=[osc1,osc2,lfo];
      isMusicPlaying=true;
    } catch(e){ console.warn("Music failed", e); }
  }
  function stopBackgroundMusic() {
    bgOscillators.forEach(o=>{ try{o.stop();}catch{} });
    bgOscillators=[]; isMusicPlaying=false;
  }
  function toggleMute() {
    isMuted=!isMuted;
    try { localStorage.setItem("mushak_muted", String(isMuted)); } catch(e){}
    updateMuteUI();
    if(isMuted) stopBackgroundMusic(); else if(gameState==="PLAYING") startBackgroundMusic();
  }
  function updateMuteUI() {
    const icon = isMuted?"🔇":"🔊";
    if(btn.mute) btn.mute.textContent=icon;
    if(btn.audioToggle) btn.audioToggle.textContent=icon;
  }

  // Helpers
  function showScreen(name){
    // Screens that should keep game visible behind them
    const keepGameBehind = ["pause","stageComplete","gameOver","results"];
    const isOverlay = keepGameBehind.includes(name);

    Object.values(screens).forEach(s=>s&&s.classList.remove("active"));
    if(screens[name]) screens[name].classList.add("active");
    // Keep game canvas visible under overlays
    if(isOverlay && screens.game){
      screens.game.classList.add("active");
    }
    // Ensure game UI still draws behind modals
    if(isOverlay){
      // Re-trigger a draw to show background
      if(gameState!=="PLAYING") draw();
    }
  }
  function getStage(){ return STAGES[currentStageIndex]; }
  function getComboMultiplier(){
    let mult=1;
    for(let i=COMBO_THRESHOLDS.length-1;i>=0;i--) if(combo>=COMBO_THRESHOLDS[i].count){ mult=COMBO_THRESHOLDS[i].mult; break; }
    // Infinite scaling after max threshold: every 15 combo adds +1 mult
    const maxThresh = COMBO_THRESHOLDS[COMBO_THRESHOLDS.length-1];
    if(combo > maxThresh.count){
      const extra = Math.floor((combo - maxThresh.count) / 12);
      mult = maxThresh.mult + extra;
    }
    if(blessingActive) mult=Math.max(mult*1.5, mult+1);
    return Math.floor(mult);
  }
  function getComboText(){
    for(let i=COMBO_THRESHOLDS.length-1;i>=0;i--) if(combo>=COMBO_THRESHOLDS[i].count) return COMBO_THRESHOLDS[i].text;
    if(combo > COMBO_THRESHOLDS[COMBO_THRESHOLDS.length-1].count){
      return `FESTIVAL GOD x${getComboMultiplier()}!!!!!!! 🎉🐭`;
    }
    return combo>1?`COMBO x${getComboMultiplier()} (${combo})`:"";
  }
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const rand=(min,max)=>Math.random()*(max-min)+min;
  const randInt=(min,max)=>Math.floor(rand(min,max+1));
  function checkCollision(a,b){ return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
  function getObjectiveProgress(){ const s=getStage(); const need=s.objective.total; const have=collected.total; return {have, need, percent:clamp(have/need,0,1)}; }
  function isObjectiveComplete(){ const s=getStage(); const o=s.objective; return collected.modak>=o.modak && collected.flower>=o.flower && collected.durva>=o.durva && collected.total>=o.total; }

  // Particles
  function spawnParticles(x,y,color,count=12,speed=300){
    for(let i=0;i<count;i++) particles.push({x,y,vx:rand(-speed,speed),vy:rand(-speed,speed)-100,life:rand(0.4,0.9),maxLife:1,size:rand(4,10),color,gravity:600,alpha:1});
  }
  function spawnFloatText(x,y,text,color="#ffffff"){ floatTexts.push({x,y,text,color,life:1,vy:-80,alpha:1}); }

  // Spawning
  function getLaneX(lane){
    const roadW=ROAD_RIGHT-ROAD_LEFT; const laneW=roadW/3; return ROAD_LEFT + laneW*lane + laneW/2;
  }
  function spawnCollectible(){
    const stage=getStage();
    let typeRoll=Math.random(), type="modak";
    if(typeRoll<stage.goldenChance) type="golden";
    else if(typeRoll<stage.goldenChance+0.28) type="durva";
    else if(typeRoll<stage.goldenChance+0.55) type="flower";
    else type="modak";
    const cfg=COLLECTIBLES_CFG[type];
    let lane=randInt(0,2); let x=getLaneX(lane)+rand(-60,60); x=clamp(x,ROAD_LEFT+30,ROAD_RIGHT-30-cfg.size);
    if(Math.random()<0.35){
      const secondType=Math.random()<0.5?"modak":"flower";
      const secondCfg=COLLECTIBLES_CFG[secondType];
      const secondLane=(lane+1)%3; const secondX=getLaneX(secondLane)+rand(-40,40);
      collectibles.push({x:secondX,y:-secondCfg.size-rand(0,120),w:secondCfg.size,h:secondCfg.size,type:secondType,value:secondCfg.value,color:secondCfg.color,rotation:rand(0,Math.PI*2),rotSpeed:rand(-2,2),bob:rand(0,Math.PI*2),img:secondCfg.img});
    }
    collectibles.push({x,y:-cfg.size-rand(0,80),w:cfg.size,h:cfg.size,type,value:cfg.value,color:cfg.color,rotation:rand(0,Math.PI*2),rotSpeed:rand(-2,2),bob:rand(0,Math.PI*2),risky:type==="golden"&&Math.random()<0.7,img:cfg.img});
    if(type==="golden" && Math.random()<0.65){
      const obsType=OBSTACLES_CFG[randInt(0,OBSTACLES_CFG.length-1)];
      const obsLane=Math.random()<0.5?lane:randInt(0,2); const obsX=getLaneX(obsLane)+rand(-30,30);
      obstacles.push({x:clamp(obsX,ROAD_LEFT+20,ROAD_RIGHT-20-obsType.size),y:-obsType.size-rand(60,180),w:obsType.size,h:obsType.size,type:obsType.type,emoji:obsType.emoji,color:obsType.color,rotation:0,img:obsType.img});
    }
  }
  function spawnObstacle(){
    const obsType=OBSTACLES_CFG[randInt(0,OBSTACLES_CFG.length-1)];
    const lane=randInt(0,2); const x=getLaneX(lane)+rand(-35,35);
    obstacles.push({x:clamp(x,ROAD_LEFT+20,ROAD_RIGHT-20-obsType.size),y:-obsType.size-rand(0,100),w:obsType.size,h:obsType.size,type:obsType.type,emoji:obsType.emoji,color:obsType.color,rotation:rand(-0.15,0.15),img:obsType.img});
  }

  // Game logic
  function resetStage(){
    const stage=getStage(); stageTimeLeft=stage.duration; gameSpeed=stage.baseSpeed; distanceTraveled=0; spawnTimer=-0.5; difficultyTimer=0;
    collectibles=[]; obstacles=[]; particles=[]; floatTexts=[];
    collected={modak:0, flower:0, durva:0, golden:0, total:0};
    mushak.x=DESIGN_W/2 - mushak.w/2; mushak.targetX=mushak.x;
    blessingMeter=0; blessingReady=false; blessingActive=false; blessingTimer=0; invulnerableTimer=0; combo=0;
    // Force immediate spawns for mobile - ensure something appears
    for(let i=0;i<3;i++){
      setTimeout(()=>{ if(gameState==="PLAYING") spawnCollectible(); }, i*200);
    }
  }
  function resetGame(){
    currentStageIndex=0; score=0; lives=3; bestCombo=0;
    totalStats={score:0, golden:0, offerings:0, bestCombo:0, perfectStages:0, stagesCleared:0};
    resetStage();
  }
  function startGame(){
    resetGame(); gameState="PLAYING"; showScreen("game"); lastTime=performance.now();
    if(animationId) cancelAnimationFrame(animationId);
    animationId=requestAnimationFrame(gameLoop);
    updateUI(); startBackgroundMusic(); SFX.uiClick();
  }
  function nextStage(){
    totalStats.score=score; totalStats.golden+=collected.golden; totalStats.offerings+=collected.total;
    totalStats.bestCombo=Math.max(totalStats.bestCombo,bestCombo);
    if(isObjectiveComplete()) totalStats.perfectStages++; totalStats.stagesCleared=currentStageIndex+1;
    currentStageIndex++;
    if(currentStageIndex>=STAGES.length){ finishGame(true); }
    else { resetStage(); gameState="PLAYING"; showScreen("game"); lastTime=performance.now(); animationId=requestAnimationFrame(gameLoop); SFX.uiClick(); }
  }
  function finishGame(completedAll=false){
    stopBackgroundMusic();
    if(completedAll){
      gameState="RESULTS";
      const timeBonus=Math.floor(stageTimeLeft*12); const perfectBonus=totalStats.perfectStages*500; const goldenBonus=totalStats.golden*50;
      const finalTotal=score+timeBonus+perfectBonus+goldenBonus;
      document.getElementById("resultFinalScore").textContent=score;
      document.getElementById("resultBestCombo").textContent=`x${totalStats.bestCombo}`;
      document.getElementById("resultGolden").textContent=totalStats.golden;
      document.getElementById("resultOfferings").textContent=totalStats.offerings;
      document.getElementById("resultPerfect").textContent=`${totalStats.perfectStages} / 3`;
      document.getElementById("resultStages").textContent=`3 / 3`;
      document.getElementById("resultSpeed").textContent=`+${timeBonus+perfectBonus+goldenBonus}`;
      document.getElementById("resultTotal").textContent=finalTotal;
      if(finalTotal>bestScore){ bestScore=finalTotal; try{ localStorage.setItem("mushak_best",String(bestScore)); }catch(e){} ui.bestMenu.textContent=bestScore; }
      showScreen("results"); SFX.stageComplete();
    } else {
      gameState="GAME_OVER";
      const reason=lives<=0?"Mushak got tired! Out of lives. Rest and try again!":"Time ran out before completing the objective! Collect faster next time!";
      document.getElementById("gameOverReason").textContent=reason;
      document.getElementById("finalScore").textContent=score;
      document.getElementById("finalCombo").textContent=`x${bestCombo}`;
      document.getElementById("finalGolden").textContent=collected.golden;
      document.getElementById("finalStages").textContent=`${totalStats.stagesCleared} / 3`;
      document.getElementById("finalOfferings").textContent=collected.total;
      document.getElementById("bestScoreDisplay").textContent=bestScore;
      document.getElementById("gameOverTitle").textContent=lives<=0?"💫 GAME OVER":"⏱️ TIME UP!";
      showScreen("gameOver"); SFX.gameOver();
    }
    if(score>bestScore){ bestScore=score; try{ localStorage.setItem("mushak_best",String(bestScore)); }catch(e){} ui.bestMenu.textContent=bestScore; }
  }
  function handleCollect(item){
    const cfg=COLLECTIBLES_CFG[item.type]; const mult=getComboMultiplier(); const points=Math.floor(cfg.value*mult);
    score+=points; combo++; bestCombo=Math.max(bestCombo,combo); collected.total++; if(item.type in collected) collected[item.type]++; if(item.type==="golden") collected.golden++;
    if(!blessingActive){
      blessingMeter=Math.min(100, blessingMeter+cfg.blessing);
      if(blessingMeter>=100 && !blessingReady){ blessingReady=true; SFX.blessingReady(); ui.blessingStatus.textContent="— READY! PRESS SPACE"; ui.blessingFill.classList.add("ready"); btn.blessing.classList.add("ready"); spawnFloatText(mushak.x+mushak.w/2,mushak.y-20,"BLESSING READY!","#ffbd59"); }
    }
    spawnParticles(item.x+item.w/2,item.y+item.h/2,cfg.color,item.type==="golden"?22:12);
    spawnFloatText(item.x+item.w/2,item.y,`+${points}`,cfg.color);
    if(item.type==="golden") SFX.golden(); else SFX.collect();
    if(combo>=3){
      const text=getComboText(); ui.comboPopup.textContent=text; ui.comboPopup.classList.add("show"); setTimeout(()=>ui.comboPopup.classList.remove("show"),900);
      if(COMBO_THRESHOLDS.some(t=>t.count===combo)) SFX.combo(getComboMultiplier());
    }
    updateUI();
  }
  function handleHitObstacle(obs){
    if(invulnerableTimer>0 || blessingActive) return;
    lives--; combo=0; invulnerableTimer=1.6; shakeTimer=0.38;
    spawnParticles(mushak.x+mushak.w/2,mushak.y+mushak.h/2,"#ff5a5f",18,420);
    spawnFloatText(mushak.x+mushak.w/2,mushak.y-30,"-1 LIFE","#ff5a5f");
    SFX.hit(); updateUI();
    if(lives<=0) setTimeout(()=>finishGame(false),450);
  }
  function activateBlessing(){
    if(!blessingReady || blessingActive) return;
    blessingActive=true; blessingReady=false; blessingTimer=6.5; blessingMeter=0;
    ui.blessingFill.classList.remove("ready"); btn.blessing.classList.remove("ready");
    ui.blessingStatus.textContent="— ACTIVE!"; ui.blessingPopup.classList.add("show");
    setTimeout(()=>ui.blessingPopup.classList.remove("show"),2200);
    SFX.blessingActivate(); spawnParticles(mushak.x+mushak.w/2,mushak.y+mushak.h/2,"#ffbd59",32,380);
  }

  function update(dt){
    if(gameState!=="PLAYING") return;
    const stage=getStage();
    stageTimeLeft-=dt;
    if(stageTimeLeft<=0){
      stageTimeLeft=0;
      if(isObjectiveComplete()){
        const stageScore=score; const timeBonus=Math.floor(200+stageTimeLeft*10);
        document.getElementById("stageCompleteTitle").textContent=`${stage.decor==="pandal"?"🛕":stage.decor==="procession"?"🥁":"🌊"} ${stage.subtitle.toUpperCase()} COMPLETE!`;
        document.getElementById("stageCompleteDesc").textContent=isObjectiveComplete()?"You reached the Pandal with all offerings!":"Stage cleared!";
        document.getElementById("stageScore").textContent=stageScore;
        document.getElementById("stageCombo").textContent=`x${bestCombo}`;
        document.getElementById("stageGolden").textContent=collected.golden;
        document.getElementById("stageTimeBonus").textContent=`+${timeBonus}`;
        document.getElementById("stageObjectiveStatus").textContent=isObjectiveComplete()?"✅ Perfect!":"⚠️ Partial";
        document.getElementById("stageTotalScore").textContent=score+timeBonus;
        gameState="STAGE_COMPLETE"; showScreen("stageComplete"); SFX.stageComplete(); return;
      } else { finishGame(false); return; }
    }
    difficultyTimer+=dt;
    const progress=1 - stageTimeLeft/stage.duration;
    gameSpeed=stage.baseSpeed + (stage.maxSpeed-stage.baseSpeed)*progress;
    if(blessingActive) gameSpeed*=0.42;

    let moveInput=0;
    if(keys["ArrowLeft"]||keys["a"]||keys["A"]) moveInput-=1;
    if(keys["ArrowRight"]||keys["d"]||keys["D"]) moveInput+=1;
    if(touchLeft) moveInput-=1; if(touchRight) moveInput+=1;
    if(isDragging) mushak.targetX=dragX - mushak.w/2;
    else mushak.targetX+=moveInput*mushak.speed*dt;
    const diff=mushak.targetX - mushak.x; mushak.vx=diff*12; mushak.x+=mushak.vx*dt; mushak.x+=moveInput*mushak.speed*0.6*dt;
    mushak.x=clamp(mushak.x, ROAD_LEFT+8, ROAD_RIGHT-mushak.w-8);

    spawnTimer-=dt;
    if(spawnTimer<=0){
      spawnTimer=stage.spawnInterval*rand(0.7,1.3); if(blessingActive) spawnTimer*=1.2;
      if(Math.random()<stage.obstacleChance) spawnObstacle();
      spawnCollectible();
      if(progress>0.5 && Math.random()<0.5) spawnCollectible();
      if(progress>0.8 && Math.random()<0.4) spawnObstacle();
    }
    // Failsafe for mobile: if nothing on screen for 2s, force spawn
    if(collectibles.length===0 && obstacles.length===0 && spawnTimer>1.5){
      spawnCollectible();
      if(Math.random()<0.5) spawnObstacle();
      spawnTimer=0.5;
    }
    for(let i=collectibles.length-1;i>=0;i--){
      const c=collectibles[i]; c.y+=gameSpeed*dt; c.rotation+=c.rotSpeed*dt; c.bob+=dt*3;
      if(c.y>DESIGN_H+100){ collectibles.splice(i,1); continue; }
      if(checkCollision(mushak,c)){ handleCollect(c); collectibles.splice(i,1); }
    }
    for(let i=obstacles.length-1;i>=0;i--){
      const o=obstacles[i]; o.y+=gameSpeed*dt;
      if(o.y>DESIGN_H+100){ obstacles.splice(i,1); continue; }
      if(checkCollision(mushak,o)){ handleHitObstacle(o); obstacles.splice(i,1); spawnParticles(o.x+o.w/2,o.y+o.h/2,o.color,14); }
    }
    for(let i=particles.length-1;i>=0;i--){
      const p=particles[i]; p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=p.gravity*dt; p.life-=dt; p.alpha=p.life/p.maxLife; if(p.life<=0) particles.splice(i,1);
    }
    for(let i=floatTexts.length-1;i>=0;i--){
      const f=floatTexts[i]; f.y+=f.vy*dt; f.life-=dt; f.alpha=f.life; if(f.life<=0) floatTexts.splice(i,1);
    }
    if(blessingActive){
      blessingTimer-=dt;
      if(blessingTimer<=0){ blessingActive=false; ui.blessingStatus.textContent=""; }
      else ui.blessingStatus.textContent=`— ${blessingTimer.toFixed(1)}s`;
    }
    if(invulnerableTimer>0) invulnerableTimer-=dt;
    if(shakeTimer>0) shakeTimer-=dt;
    roadOffset+=gameSpeed*dt*0.3; decorOffset+=gameSpeed*dt*0.1;
    distanceTraveled+=gameSpeed*dt;

    // FPS
    frameCount++; fpsTimer+=dt; if(fpsTimer>=0.5){ fps=Math.round(frameCount/fpsTimer*0.5 + fps*0.5); frameCount=0; fpsTimer=0; if(ui.fps) ui.fps.textContent=`${fps} FPS • ${collectibles.length+obstacles.length} objs`; }

    updateUI();
  }
  function updateUI(){
    const stage=getStage(); ui.score.textContent=score;
    const mult=getComboMultiplier(); ui.combo.textContent=combo>=2?`x${mult} (${combo})`:""; ui.combo.style.display=combo>=2?"inline":"none";
    const prog=getObjectiveProgress(); ui.objective.textContent=`${prog.have} / ${prog.need} ${isObjectiveComplete()?"✅":""}`;
    ui.timer.textContent=Math.ceil(stageTimeLeft); ui.lives.textContent="❤️".repeat(Math.max(0,lives))+"🤍".repeat(3-Math.max(0,lives));
    ui.stageName.textContent=stage.name; ui.blessingFill.style.width=`${blessingMeter}%`;
    if(blessingActive){ ui.blessingFill.style.width=`${(blessingTimer/6.5)*100}%`; ui.blessingFill.style.background="linear-gradient(90deg,#fff8a0,#ffbd59,#ffffff)"; }
    else ui.blessingFill.style.background="";
    if(ui.pauseScore) ui.pauseScore.textContent=`Score: ${score}`; if(ui.pauseStage) ui.pauseStage.textContent=stage.name;
  }

  // Draw
  function draw(){
    const stage=getStage();
    ctx.clearRect(0,0,DESIGN_W,DESIGN_H);
    ctx.save();
    if(shakeTimer>0){ const intensity=shakeTimer*18; ctx.translate(rand(-intensity,intensity), rand(-intensity,intensity)); }

    // Sky
    const skyGrad=ctx.createLinearGradient(0,0,0,DESIGN_H);
    skyGrad.addColorStop(0,stage.bg.skyTop); skyGrad.addColorStop(0.5,stage.bg.skyMid); skyGrad.addColorStop(1,"#0d0618");
    ctx.fillStyle=skyGrad; ctx.fillRect(0,0,DESIGN_W,DESIGN_H);

    drawStars(); drawSideDecor(); drawRoad(); drawCollectibles(); drawObstacles(); drawMushak(); drawParticles(); drawFloatTexts();

    if(stageTimeLeft<6) drawFinishLine();
    if(blessingActive){
      ctx.fillStyle=`rgba(255,189,89,${0.08+Math.sin(Date.now()*0.008)*0.04})`; ctx.fillRect(ROAD_LEFT,0,ROAD_RIGHT-ROAD_LEFT,DESIGN_H);
      const glowGrad=ctx.createRadialGradient(mushak.x+mushak.w/2,mushak.y+mushak.h/2,80,mushak.x+mushak.w/2,mushak.y+mushak.h/2,400);
      glowGrad.addColorStop(0,"rgba(255,248,160,0.25)"); glowGrad.addColorStop(1,"rgba(255,189,89,0)");
      ctx.fillStyle=glowGrad; ctx.beginPath(); ctx.arc(mushak.x+mushak.w/2,mushak.y+mushak.h/2,400,0,Math.PI*2); ctx.fill();
      if(images["blessing.png"]){
        ctx.save(); ctx.globalAlpha=0.35+Math.sin(Date.now()*0.005)*0.15;
        ctx.drawImage(images["blessing.png"], mushak.x+mushak.w/2-90, mushak.y+mushak.h/2-90, 180,180);
        ctx.restore();
      }
    }
    ctx.restore();
    if(gameState==="PLAYING" && isObjectiveComplete() && stageTimeLeft<8){
      ctx.save(); ctx.textAlign="center"; ctx.font="bold 42px Baloo 2"; ctx.fillStyle="#ffbd59"; ctx.strokeStyle="#000"; ctx.lineWidth=6;
      ctx.strokeText("🏁 REACH THE PANDAL! 🏁",DESIGN_W/2,140); ctx.fillText("🏁 REACH THE PANDAL! 🏁",DESIGN_W/2,140); ctx.restore();
    }
  }
  function drawStars(){
    ctx.save(); const time=decorOffset*0.05;
    for(let i=0;i<70;i++){
      const x=(i*137.5 + time*(i%3+1)*0.2)%DESIGN_W; const y=(i*73)%(DESIGN_H*0.6);
      const size=(Math.sin(i)*0.5+1.2)*2; const alpha=0.3+Math.sin(time*0.001+i)*0.3;
      ctx.fillStyle=`rgba(255,${200+i%55},${150+i%100},${alpha})`; ctx.beginPath(); ctx.arc(x,y,size,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }
  function drawSideDecor(){
    const stage=getStage(); ctx.save();
    const leftGrad=ctx.createLinearGradient(0,0,ROAD_LEFT,0); leftGrad.addColorStop(0,"rgba(0,0,0,0.5)"); leftGrad.addColorStop(1,"rgba(255,140,66,0.08)"); ctx.fillStyle=leftGrad; ctx.fillRect(0,0,ROAD_LEFT,DESIGN_H);
    const rightGrad=ctx.createLinearGradient(ROAD_RIGHT,0,DESIGN_W,0); rightGrad.addColorStop(0,"rgba(255,140,66,0.08)"); rightGrad.addColorStop(1,"rgba(0,0,0,0.5)"); ctx.fillStyle=rightGrad; ctx.fillRect(ROAD_RIGHT,0,DESIGN_W-ROAD_RIGHT,DESIGN_H);
    ctx.strokeStyle="rgba(255,189,89,0.25)"; ctx.lineWidth=2; ctx.setLineDash([8,12]);
    for(let side of [ROAD_LEFT-20, ROAD_RIGHT+20]){
      ctx.beginPath();
      for(let y=-40+(decorOffset%80); y<DESIGN_H+40; y+=80){
        if(y===-40+(decorOffset%80)) ctx.moveTo(side,y); else ctx.lineTo(side+Math.sin(y*0.01+decorOffset*0.002)*8, y);
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);
    const decorCount=14;
    for(let i=0;i<decorCount;i++){
      const y=(i*140 - decorOffset*0.5)%(DESIGN_H+200)-100;
      drawDiya(60+Math.sin(i)*20, y, 1);
      drawDiya(DESIGN_W-60+Math.cos(i)*20, y+70, 1);
    }
    if(stage.decor==="procession"){
      ctx.fillStyle="rgba(255,255,255,0.04)";
      for(let i=0;i<4;i++){ const y=(i*260 - decorOffset*0.3)%(DESIGN_H+300)-100; ctx.fillRect(30,y,80,120); ctx.fillRect(DESIGN_W-110,y+130,80,120); }
    }
    if(images["pandal.png"] && roadOffset<300){
      ctx.save(); ctx.globalAlpha=1-roadOffset/300; const pw=400, ph=220; ctx.drawImage(images["pandal.png"], DESIGN_W/2-pw/2, -20 - roadOffset*0.3, pw, ph); ctx.restore();
    }
    ctx.restore();
  }
  function drawDiya(x,y,scale=1){
    ctx.save(); ctx.translate(x,y); ctx.scale(scale,scale);
    if(images["diya.png"]){
      ctx.globalAlpha=0.9; ctx.drawImage(images["diya.png"], -22,-22,44,44);
    } else {
      const glow=ctx.createRadialGradient(0,-6,0,0,-6,18); glow.addColorStop(0,"rgba(255,189,89,0.8)"); glow.addColorStop(1,"rgba(255,140,66,0)"); ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(0,-6,18,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="#8b4513"; ctx.beginPath(); ctx.ellipse(0,4,12,6,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="#ff8c42"; ctx.beginPath(); ctx.arc(0,-4,4,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }
  function drawRoad(){
    const stage=getStage(); ctx.fillStyle=stage.bg.road; ctx.fillRect(ROAD_LEFT,0,ROAD_RIGHT-ROAD_LEFT,DESIGN_H);
    ctx.strokeStyle="rgba(0,0,0,0.15)"; ctx.lineWidth=1;
    for(let y=-20+(roadOffset%40); y<DESIGN_H; y+=40){ ctx.beginPath(); ctx.moveTo(ROAD_LEFT,y); ctx.lineTo(ROAD_RIGHT,y); ctx.stroke(); }
    const roadW=ROAD_RIGHT-ROAD_LEFT; ctx.strokeStyle=stage.bg.roadLine; ctx.lineWidth=3; ctx.setLineDash([22,28]); ctx.lineDashOffset=-roadOffset;
    for(let i=1;i<3;i++){ const x=ROAD_LEFT+roadW*(i/3); ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,DESIGN_H); ctx.stroke(); }
    ctx.setLineDash([]); ctx.lineDashOffset=0;
    ctx.strokeStyle="rgba(255,189,89,0.6)"; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(ROAD_LEFT,0); ctx.lineTo(ROAD_LEFT,DESIGN_H); ctx.moveTo(ROAD_RIGHT,0); ctx.lineTo(ROAD_RIGHT,DESIGN_H); ctx.stroke();
    if(images["rangoli.png"] && roadOffset<250){
      ctx.save(); ctx.globalAlpha=1-roadOffset/250; const sz=120; ctx.drawImage(images["rangoli.png"], DESIGN_W/2-sz/2, 110-roadOffset*0.5, sz, sz); ctx.restore();
    } else if(roadOffset<200){
      ctx.save(); ctx.globalAlpha=1-roadOffset/200; drawRangoli(DESIGN_W/2,120-roadOffset*0.5,80); ctx.restore();
    }
  }
  function drawRangoli(x,y,size){
    ctx.save(); ctx.translate(x,y);
    for(let i=0;i<8;i++){ ctx.rotate(Math.PI/4); ctx.fillStyle=i%2===0?"#ff7ac4":"#ffbd59"; ctx.beginPath(); ctx.ellipse(0,-size*0.5,size*0.18,size*0.5,0,0,Math.PI*2); ctx.fill(); }
    ctx.fillStyle="#2ec4b6"; ctx.beginPath(); ctx.arc(0,0,size*0.18,0,Math.PI*2); ctx.fill(); ctx.restore();
  }
  function drawCollectibles(){
    for(const c of collectibles){
      ctx.save(); ctx.translate(c.x+c.w/2, c.y+c.h/2 + Math.sin(c.bob)*4); ctx.rotate(c.rotation);
      ctx.fillStyle="rgba(0,0,0,0.25)"; ctx.beginPath(); ctx.ellipse(0,c.h/2+8,c.w*0.45,6,0,0,Math.PI*2); ctx.fill();
      if(c.type==="golden"){
        const glow=ctx.createRadialGradient(0,0,0,0,0,c.w*0.9); glow.addColorStop(0,"rgba(255,215,0,0.6)"); glow.addColorStop(1,"rgba(255,215,0,0)"); ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(0,0,c.w*0.9,0,Math.PI*2); ctx.fill();
      }
      const imgName=COLLECTIBLES_CFG[c.type]?.img;
      if(images[imgName]){
        const s=c.w*1.2; ctx.drawImage(images[imgName], -s/2, -s/2, s, s);
      } else {
        ctx.fillStyle=c.color; ctx.beginPath();
        if(c.type==="modak"){ ctx.moveTo(0,-c.h*0.42); ctx.bezierCurveTo(c.w*0.4,-c.h*0.2,c.w*0.4,c.h*0.4,0,c.h*0.45); ctx.bezierCurveTo(-c.w*0.4,c.h*0.4,-c.w*0.4,-c.h*0.2,0,-c.h*0.42); }
        else if(c.type==="flower"){ for(let i=0;i<5;i++){ ctx.rotate((Math.PI*2)/5); ctx.beginPath(); ctx.ellipse(0,-c.h*0.22,c.w*0.22,c.h*0.32,0,0,Math.PI*2); ctx.fill(); } ctx.beginPath(); ctx.arc(0,0,c.w*0.18,0,Math.PI*2); ctx.fillStyle="#ffeb3b"; ctx.fill(); ctx.fillStyle=c.color; }
        else if(c.type==="durva"){ for(let i=-1;i<=1;i++){ ctx.save(); ctx.rotate(i*0.45); ctx.beginPath(); ctx.ellipse(0,-c.h*0.15,c.w*0.12,c.h*0.42,0,0,Math.PI*2); ctx.fill(); ctx.restore(); } }
        else { ctx.moveTo(0,-c.h*0.5); ctx.lineTo(c.w*0.45,-c.h*0.15); ctx.lineTo(c.w*0.28,c.h*0.45); ctx.lineTo(-c.w*0.28,c.h*0.45); ctx.lineTo(-c.w*0.45,-c.h*0.15); ctx.closePath(); }
        ctx.fill(); ctx.fillStyle="rgba(255,255,255,0.55)"; ctx.beginPath(); ctx.ellipse(-c.w*0.15,-c.h*0.15,c.w*0.12,c.h*0.12,-0.5,0,Math.PI*2); ctx.fill();
        ctx.font=`${Math.floor(c.w*0.55)}px serif`; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText(COLLECTIBLES_CFG[c.type].emoji,0,2);
      }
      ctx.restore();
    }
  }
  function drawObstacles(){
    for(const o of obstacles){
      ctx.save(); ctx.translate(o.x+o.w/2, o.y+o.h/2); ctx.rotate(o.rotation);
      ctx.fillStyle="rgba(0,0,0,0.35)"; ctx.beginPath(); ctx.ellipse(0,o.h/2+6,o.w*0.5,7,0,0,Math.PI*2); ctx.fill();
      if(o.img && images[o.img]){
        const s=o.w*1.15; ctx.drawImage(images[o.img], -s/2, -s/2, s, s);
      } else {
        ctx.fillStyle=o.color; ctx.strokeStyle="rgba(0,0,0,0.3)"; ctx.lineWidth=3;
        if(o.type==="barrier"){ ctx.fillRect(-o.w/2,-o.h/2,o.w,o.h); ctx.strokeRect(-o.w/2,-o.h/2,o.w,o.h); ctx.fillStyle="#ffbd59"; ctx.fillRect(-o.w/2,-o.h*0.25,o.w,o.h*0.15); ctx.fillRect(-o.w/2,o.h*0.1,o.w,o.h*0.15); }
        else { ctx.beginPath(); ctx.roundRect(-o.w/2,-o.h/2,o.w,o.h,10); ctx.fill(); ctx.stroke(); }
        ctx.font=`${Math.floor(o.w*0.6)}px serif`; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText(o.emoji,0,2);
      }
      ctx.restore();
    }
  }
  function drawMushak(){
    ctx.save(); ctx.translate(mushak.x+mushak.w/2, mushak.y+mushak.h/2);
    const speedFactor=Math.abs(mushak.vx)*0.001; ctx.scale(1+speedFactor*0.15, 1-speedFactor*0.08);
    if(invulnerableTimer>0 && Math.floor(invulnerableTimer*12)%2===0) ctx.globalAlpha=0.35;
    ctx.fillStyle="rgba(0,0,0,0.35)"; ctx.beginPath(); ctx.ellipse(0,mushak.h*0.42,mushak.w*0.42,10,0,0,Math.PI*2); ctx.fill();
    if(images["mushak.png"]){
      const s=mushak.w*1.6; ctx.drawImage(images["mushak.png"], -s/2, -s/2 -8, s, s);
    } else {
      ctx.fillStyle="#c49a6c"; ctx.beginPath(); ctx.ellipse(0,6,mushak.w*0.32,mushak.h*0.32,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="#d9b18e"; ctx.beginPath(); ctx.ellipse(0,-mushak.h*0.12,mushak.w*0.34,mushak.h*0.30,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="#a67c52"; ctx.beginPath(); ctx.ellipse(-mushak.w*0.28,-mushak.h*0.28,16,20,-0.3,0,Math.PI*2); ctx.ellipse(mushak.w*0.28,-mushak.h*0.28,16,20,0.3,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="#ffb3b3"; ctx.beginPath(); ctx.ellipse(-mushak.w*0.28,-mushak.h*0.26,8,11,-0.3,0,Math.PI*2); ctx.ellipse(mushak.w*0.28,-mushak.h*0.26,8,11,0.3,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="#2b1a0e"; ctx.beginPath(); ctx.arc(-10,-10,6,0,Math.PI*2); ctx.arc(10,-10,6,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="white"; ctx.beginPath(); ctx.arc(-8,-12,2.5,0,Math.PI*2); ctx.arc(12,-12,2.5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="#ff8c94"; ctx.beginPath(); ctx.arc(0,-2,5,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle="#a67c52"; ctx.lineWidth=6; ctx.lineCap="round"; ctx.beginPath(); ctx.moveTo(0,mushak.h*0.30); ctx.quadraticCurveTo(18+Math.sin(Date.now()*0.008)*6,mushak.h*0.45,8,mushak.h*0.52); ctx.stroke();
    }
    if(blessingActive){
      ctx.strokeStyle=`rgba(255,189,89,${0.6+Math.sin(Date.now()*0.01)*0.3})`; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(0,0,mushak.w*0.6,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle="rgba(255,255,255,0.9)"; ctx.font="bold 14px serif"; ctx.textAlign="center"; ctx.fillText("ॐ",0,-mushak.h*0.55);
    }
    if(combo>=3){ ctx.fillStyle="#ffbd59"; ctx.beginPath(); ctx.arc(18,10,7,0,Math.PI*2); ctx.fill(); }
    ctx.restore();
  }
  function drawParticles(){
    for(const p of particles){ ctx.save(); ctx.globalAlpha=p.alpha; ctx.fillStyle=p.color; ctx.beginPath(); ctx.arc(p.x,p.y,p.size*p.alpha,0,Math.PI*2); ctx.fill(); ctx.restore(); }
  }
  function drawFloatTexts(){
    for(const f of floatTexts){ ctx.save(); ctx.globalAlpha=f.alpha; ctx.fillStyle=f.color; ctx.strokeStyle="rgba(0,0,0,0.6)"; ctx.lineWidth=4; ctx.font="bold 26px Baloo 2"; ctx.textAlign="center"; ctx.strokeText(f.text,f.x,f.y); ctx.fillText(f.text,f.x,f.y); ctx.restore(); }
  }
  function drawFinishLine(){
    ctx.save(); const y=DESIGN_H - (stageTimeLeft/6)*DESIGN_H;
    ctx.fillStyle="rgba(255,189,89,0.9)"; ctx.fillRect(ROAD_LEFT,y,ROAD_RIGHT-ROAD_LEFT,12); ctx.fillStyle="#fff8ec";
    for(let x=ROAD_LEFT;x<ROAD_RIGHT;x+=30) if(Math.floor(x/30)%2===0) ctx.fillRect(x,y,15,12);
    ctx.font="bold 28px Baloo 2"; ctx.fillStyle="#fff"; ctx.strokeStyle="#000"; ctx.lineWidth=5; ctx.textAlign="center";
    ctx.strokeText("🛕 PANDAL AHEAD 🛕",DESIGN_W/2,y-18); ctx.fillText("🛕 PANDAL AHEAD 🛕",DESIGN_W/2,y-18); ctx.restore();
  }

  function gameLoop(time){
    const dt=Math.min((time-lastTime)/1000,0.033); lastTime=time;
    if(gameState==="PLAYING") update(dt);
    else if(gameState==="MENU" || gameState==="LOADING"){
      // Animate background even in menu
      roadOffset+=1.2; decorOffset+=0.6;
    }
    draw();
    // Always keep loop alive for smooth UI, except when explicitly in overlay we still draw static background
    animationId=requestAnimationFrame(gameLoop);
  }

  // Input - Enhanced for mobile
  window.addEventListener("keydown",(e)=>{
    keys[e.key]=true;
    if(e.code==="Space"){ e.preventDefault(); if(gameState==="PLAYING") activateBlessing(); }
    if(e.key==="p"||e.key==="P"){ if(gameState==="PLAYING"){ gameState="PAUSED"; showScreen("pause"); stopBackgroundMusic(); } else if(gameState==="PAUSED"){ gameState="PLAYING"; showScreen("game"); lastTime=performance.now(); animationId=requestAnimationFrame(gameLoop); startBackgroundMusic(); } }
    if(e.key==="r"||e.key==="R"){ if(gameState==="PLAYING"||gameState==="PAUSED") startGame(); }
  });
  window.addEventListener("keyup",(e)=>{ keys[e.key]=false; });

  // Mobile buttons - both touch and mouse
  function bindMobileBtn(btnEl, onStart, onEnd){
    if(!btnEl) return;
    const start = (e)=>{ e.preventDefault(); onStart(); };
    const end = (e)=>{ e.preventDefault(); onEnd(); };
    btnEl.addEventListener("touchstart", start, {passive:false});
    btnEl.addEventListener("touchend", end, {passive:false});
    btnEl.addEventListener("touchcancel", end, {passive:false});
    btnEl.addEventListener("mousedown", onStart);
    btnEl.addEventListener("mouseup", onEnd);
    btnEl.addEventListener("mouseleave", onEnd);
  }
  bindMobileBtn(btn.left, ()=>{ touchLeft=true; }, ()=>{ touchLeft=false; });
  bindMobileBtn(btn.right, ()=>{ touchRight=true; }, ()=>{ touchRight=false; });
  bindMobileBtn(btn.blessing, ()=>{ if(gameState==="PLAYING") activateBlessing(); }, ()=>{});

  function getCanvasPos(e){
    const rect=canvas.getBoundingClientRect();
    let clientX, clientY;
    if(e.touches && e.touches[0]){ clientX=e.touches[0].clientX; clientY=e.touches[0].clientY; }
    else if(e.changedTouches && e.changedTouches[0]){ clientX=e.changedTouches[0].clientX; clientY=e.changedTouches[0].clientY; }
    else { clientX=e.clientX; clientY=e.clientY; }
    const scaleX = DESIGN_W / rect.width;
    // const scaleY = DESIGN_H / rect.height; // not needed for X only
    return {x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * (DESIGN_H / rect.height)};
  }
  // Pointer events for better mobile support
  canvas.style.touchAction = "none";
  canvas.addEventListener("pointerdown", (e)=>{
    e.preventDefault();
    isDragging=true;
    const pos=getCanvasPos(e);
    dragX=pos.x;
    mushak.targetX=dragX - mushak.w/2;
    try{ canvas.setPointerCapture(e.pointerId); }catch{}
  });
  canvas.addEventListener("pointermove", (e)=>{
    if(!isDragging) return;
    e.preventDefault();
    const pos=getCanvasPos(e);
    dragX=pos.x;
    mushak.targetX=dragX - mushak.w/2;
  });
  canvas.addEventListener("pointerup", (e)=>{
    e.preventDefault();
    isDragging=false;
    try{ canvas.releasePointerCapture(e.pointerId); }catch{}
  });
  canvas.addEventListener("pointercancel", (e)=>{
    isDragging=false;
  });
  // Fallback touch events
  canvas.addEventListener("touchstart",(e)=>{
    e.preventDefault();
    isDragging=true;
    const pos=getCanvasPos(e);
    dragX=pos.x;
    mushak.targetX=dragX - mushak.w/2;
  },{passive:false});
  canvas.addEventListener("touchmove",(e)=>{
    e.preventDefault();
    if(isDragging){
      const pos=getCanvasPos(e);
      dragX=pos.x;
      mushak.targetX=dragX - mushak.w/2;
    }
  },{passive:false});
  canvas.addEventListener("touchend",(e)=>{
    e.preventDefault();
    isDragging=false;
  },{passive:false});
  canvas.addEventListener("mousedown",(e)=>{
    isDragging=true;
    const pos=getCanvasPos(e);
    dragX=pos.x;
    mushak.targetX=dragX - mushak.w/2;
  });
  canvas.addEventListener("mousemove",(e)=>{
    if(isDragging){
      const pos=getCanvasPos(e);
      dragX=pos.x;
      mushak.targetX=dragX - mushak.w/2;
    }
  });
  window.addEventListener("mouseup",()=>isDragging=false);
  window.addEventListener("touchend",()=>{ isDragging=false; touchLeft=false; touchRight=false; });

  // Buttons
  btn.play.addEventListener("click",()=>{ getAudio(); startGame(); });
  btn.howToPlay.addEventListener("click",()=>{ showScreen("howToPlay"); SFX.uiClick(); });
  btn.credits.addEventListener("click",()=>{ showScreen("credits"); SFX.uiClick(); });
  btn.htpBack.addEventListener("click",()=>{ showScreen("start"); SFX.uiClick(); });
  btn.creditsBack.addEventListener("click",()=>{ showScreen("start"); SFX.uiClick(); });
  btn.pause.addEventListener("click",()=>{ if(gameState==="PLAYING"){ gameState="PAUSED"; showScreen("pause"); stopBackgroundMusic(); SFX.uiClick(); } });
  btn.resume.addEventListener("click",()=>{ gameState="PLAYING"; showScreen("game"); lastTime=performance.now(); animationId=requestAnimationFrame(gameLoop); startBackgroundMusic(); SFX.uiClick(); });
  btn.restartPause.addEventListener("click",()=>{ startGame(); });
  btn.mainMenuPause.addEventListener("click",()=>{ gameState="MENU"; showScreen("start"); if(animationId) cancelAnimationFrame(animationId); animationId=requestAnimationFrame(gameLoop); stopBackgroundMusic(); });
  btn.nextStage.addEventListener("click",()=>nextStage());
  btn.stageMenu.addEventListener("click",()=>{ gameState="MENU"; showScreen("start"); if(animationId) cancelAnimationFrame(animationId); animationId=requestAnimationFrame(gameLoop); });
  btn.playAgain.addEventListener("click",()=>startGame());
  btn.mainMenuOver.addEventListener("click",()=>{ gameState="MENU"; showScreen("start"); if(animationId) cancelAnimationFrame(animationId); animationId=requestAnimationFrame(gameLoop); });
  btn.playAgainFinal.addEventListener("click",()=>startGame());
  btn.mainMenuFinal.addEventListener("click",()=>{ gameState="MENU"; showScreen("start"); if(animationId) cancelAnimationFrame(animationId); animationId=requestAnimationFrame(gameLoop); });
  btn.mute.addEventListener("click",()=>{ toggleMute(); SFX.uiClick(); });
  btn.audioToggle.addEventListener("click",()=>{ toggleMute(); SFX.uiClick(); });
  btn.copyScore.addEventListener("click",()=>{
    const text=`🐭 Mushak: The Festive Quest — I scored ${score} with ${collected.golden} Golden Modaks! Can you beat it? #GaneshChaturthi #GameDev`;
    navigator.clipboard.writeText(text).then(()=>{ btn.copyScore.textContent="✅ COPIED!"; setTimeout(()=>btn.copyScore.textContent="📋 COPY SCORE",1500); });
  });

  // Init
  async function init(){
    updateMuteUI();
    ui.bestMenu.textContent=bestScore;
    updateRoadMargins();
    window.addEventListener("resize", ()=>{
      updateRoadMargins();
      // Keep mushak inside new road
      mushak.x = clamp(mushak.x, ROAD_LEFT+8, ROAD_RIGHT-mushak.w-8);
      mushak.targetX = clamp(mushak.targetX, ROAD_LEFT+8, ROAD_RIGHT-mushak.w-8);
    });
    showScreen("loading");
    lastTime=performance.now();
    animationId=requestAnimationFrame(gameLoop);
    await loadImages();
    // Small delay for polish
    setTimeout(()=>{
      gameState="MENU";
      showScreen("start");
      console.log("🐭 Mushak v1.0 ready — images loaded:", Object.keys(images).length, "roadMargin:", ROAD_MARGIN);
    }, 600);
  }
  if(!CanvasRenderingContext2D.prototype.roundRect){
    CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
      this.beginPath(); this.moveTo(x+r,y); this.lineTo(x+w-r,y); this.quadraticCurveTo(x+w,y,x+w,y+r);
      this.lineTo(x+w,y+h-r); this.quadraticCurveTo(x+w,y+h,x+w-r,y+h); this.lineTo(x+r,y+h);
      this.quadraticCurveTo(x,y+h,x,y+h-r); this.lineTo(x,y+r); this.quadraticCurveTo(x,y,x+r,y); this.closePath(); return this;
    };
  }
  init();
})();
