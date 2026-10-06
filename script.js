/* =====================================================================
   DETECTIVES DE INTERNET — MOTOR DE JUEGO (JAVASCRIPT VANILLA)
   Desarrollado para 5.º de Primaria (10–11 años)
   Sin dependencias externas • 100% Offline • Web Audio API • Canvas
   ===================================================================== */

(function () {
  'use strict';

  /* =====================================================================
     1. SISTEMA DE AUDIO (WEB AUDIO API SINTETIZADOR OFFLINE)
     ===================================================================== */
  class SoundManager {
    constructor() {
      this.enabled = localStorage.getItem('detectives_sound_muted') !== 'true';
      this.ctx = null;
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem('detectives_sound_muted', (!this.enabled).toString());
      return this.enabled;
    }

    playTone(freq, duration = 0.1, type = 'sine', gainVal = 0.15) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        // Ignorar errores de audio si el navegador bloquea la reproducción
      }
    }

    playClick() {
      this.playTone(800, 0.05, 'triangle', 0.12);
    }

    playSelect() {
      if (!this.enabled) return;
      this.playTone(520, 0.08, 'sine', 0.15);
      setTimeout(() => this.playTone(780, 0.1, 'sine', 0.15), 60);
    }

    playCorrect() {
      if (!this.enabled) return;
      this.init();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 0.18, 'triangle', 0.18);
        }, idx * 80);
      });
    }

    playWrong() {
      if (!this.enabled) return;
      this.playTone(280, 0.15, 'sawtooth', 0.1);
      setTimeout(() => this.playTone(220, 0.22, 'sawtooth', 0.12), 120);
    }

    playCardDrop() {
      this.playTone(400, 0.06, 'sine', 0.12);
    }

    playSearchScan() {
      if (!this.enabled) return;
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          this.playTone(600 + i * 120, 0.05, 'sine', 0.08);
        }, i * 70);
      }
    }

    playLevelComplete() {
      if (!this.enabled) return;
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 0.25, 'triangle', 0.22);
        }, idx * 110);
      });
    }

    playFinalFanfare() {
      if (!this.enabled) return;
      const melody = [523, 659, 784, 1046, 784, 1046, 1318];
      melody.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 0.28, 'triangle', 0.25);
        }, idx * 140);
      });
    }
  }

  const sound = new SoundManager();

  /* =====================================================================
     2. GENERADOR DE ILUSTRACIONES VECTORIALES DE NICO
     ===================================================================== */
  function getNicoSvg(pose = 'neutral') {
    // Expresiones de Nico según pose: 'neutral', 'thinking', 'idea', 'celebrating', 'talking'
    let mouthSvg = '<path d="M42 66 Q50 74 58 66" stroke="#831843" stroke-width="3" fill="#f43f5e" stroke-linecap="round"/>';
    let eyebrowsSvg = '<path d="M35 44 Q42 42 48 45" stroke="#451a03" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M52 45 Q58 42 65 44" stroke="#451a03" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
    let eyesSvg = '<ellipse cx="42" cy="51" rx="4.5" ry="5.5" fill="#1e1b4b"/><ellipse cx="44" cy="49" rx="1.5" ry="1.5" fill="#ffffff"/><ellipse cx="58" cy="51" rx="4.5" ry="5.5" fill="#1e1b4b"/><ellipse cx="60" cy="49" rx="1.5" ry="1.5" fill="#ffffff"/>';
    let extraHandOrProp = '';

    if (pose === 'thinking') {
      mouthSvg = '<path d="M45 68 Q50 67 55 69" stroke="#831843" stroke-width="3" fill="none" stroke-linecap="round"/>';
      eyebrowsSvg = '<path d="M34 43 Q41 46 47 43" stroke="#451a03" stroke-width="2.5" fill="none"/><path d="M53 42 Q60 39 66 43" stroke="#451a03" stroke-width="2.5" fill="none"/>';
      extraHandOrProp = `
        <!-- Magnifying glass near eye -->
        <circle cx="68" cy="48" r="16" fill="rgba(56, 189, 248, 0.25)" stroke="#0284c7" stroke-width="3"/>
        <line x1="78" y1="58" x2="90" y2="72" stroke="#0284c7" stroke-width="5" stroke-linecap="round"/>
      `;
    } else if (pose === 'idea' || pose === 'surprised') {
      mouthSvg = '<ellipse cx="50" cy="69" rx="5" ry="7" fill="#831843"/>';
      eyesSvg = '<ellipse cx="42" cy="50" rx="5.5" ry="6.5" fill="#1e1b4b"/><ellipse cx="44" cy="48" rx="2" ry="2" fill="#ffffff"/><ellipse cx="58" cy="50" rx="5.5" ry="6.5" fill="#1e1b4b"/><ellipse cx="60" cy="48" rx="2" ry="2" fill="#ffffff"/>';
      extraHandOrProp = `
        <!-- Lightbulb idea icon above cap -->
        <g transform="translate(42, 2) scale(0.6)">
          <path d="M12 2 A10 10 0 0 0 4 17 L6 21 L18 21 L20 17 A10 10 0 0 0 12 2 Z" fill="#FBBF24"/>
          <line x1="8" y1="24" x2="16" y2="24" stroke="#D97706" stroke-width="2"/>
        </g>
      `;
    } else if (pose === 'celebrating') {
      mouthSvg = '<path d="M38 64 Q50 78 62 64 Z" fill="#f43f5e" stroke="#831843" stroke-width="2"/>';
      eyebrowsSvg = '<path d="M34 40 Q42 36 48 41" stroke="#451a03" stroke-width="2.5" fill="none"/><path d="M52 41 Q58 36 66 40" stroke="#451a03" stroke-width="2.5" fill="none"/>';
      extraHandOrProp = `
        <!-- Raised hands & sparkle stars -->
        <circle cx="16" cy="38" r="8" fill="#FBBF24"/>
        <circle cx="84" cy="38" r="8" fill="#FBBF24"/>
      `;
    } else if (pose === 'talking') {
      mouthSvg = '<path d="M42 66 Q50 75 58 66 Z" fill="#831843" stroke="#831843" stroke-width="2"/>';
    }

    return `
      <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <!-- Body / Coat -->
        <path d="M24 94 C24 78 36 74 50 74 C64 74 76 78 76 94 Z" fill="#1e293b"/>
        <!-- Vest/Shirt Collar -->
        <polygon points="50,75 42,94 58,94" fill="#0284c7"/>
        <polygon points="50,77 46,90 54,90" fill="#f8fafc"/>
        <polygon points="50,82 48,87 52,87" fill="#f59e0b"/>

        <!-- Detective Badge on chest -->
        <polygon points="34,80 37,84 34,88 31,84" fill="#fbbf24"/>

        <!-- Neck -->
        <rect x="44" y="66" width="12" height="12" rx="3" fill="#fbcfe8"/>

        <!-- Face / Head -->
        <ellipse cx="50" cy="54" rx="20" ry="22" fill="#fed7aa"/>

        <!-- Cheeks -->
        <circle cx="36" cy="58" r="3.5" fill="#fda4af" opacity="0.6"/>
        <circle cx="64" cy="58" r="3.5" fill="#fda4af" opacity="0.6"/>

        <!-- Hair bangs -->
        <path d="M30 46 C35 34 50 36 68 40 C62 34 46 32 30 46 Z" fill="#78350f"/>

        <!-- Eyebrows & Eyes -->
        ${eyebrowsSvg}
        ${eyesSvg}

        <!-- Cute Detective Nose -->
        <ellipse cx="50" cy="58" rx="2" ry="1.5" fill="#ea580c"/>

        <!-- Mouth -->
        ${mouthSvg}

        <!-- Detective Beret / Hat -->
        <path d="M22 38 C26 22 55 16 76 26 C82 30 78 38 72 40 C56 36 38 37 22 38 Z" fill="#334155"/>
        <path d="M18 38 Q50 34 82 40" stroke="#0284c7" stroke-width="3" fill="none" stroke-linecap="round"/>
        <!-- Hat Button -->
        <circle cx="52" cy="22" r="3" fill="#fbbf24"/>

        <!-- Props or expression details -->
        ${extraHandOrProp}
      </svg>
    `;
  }

  function updateNicoAvatar(containerId, pose = 'neutral') {
    const el = document.getElementById(containerId);
    if (el) {
      el.innerHTML = getNicoSvg(pose);
    }
  }

  /* =====================================================================
     3. SISTEMA DE CONFETI Y PARTÍCULAS (CANVAS)
     ===================================================================== */
  class ParticleEngine {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
      this.particles = [];
      this.animating = false;

      this.resize();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      if (this.canvas) {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
      }
    }

    burst(x = window.innerWidth / 2, y = window.innerHeight / 2, count = 70) {
      if (!this.ctx) return;
      const colors = ['#38bdf8', '#fbbf24', '#f43f5e', '#10b981', '#a855f7', '#ffffff'];

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 3;
        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          radius: Math.random() * 5 + 3,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10,
          opacity: 1,
          decay: Math.random() * 0.02 + 0.015,
          isRect: Math.random() > 0.5
        });
      }

      if (!this.animating) {
        this.animating = true;
        this.loop();
      }
    }

    loop() {
      if (!this.ctx) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // Gravedad
        p.opacity -= p.decay;
        p.rotation += p.rotationSpeed;

        if (p.opacity <= 0) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.globalAlpha = p.opacity;
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;

        if (p.isRect) {
          this.ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 1.5);
        } else {
          this.ctx.beginPath();
          this.ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          this.ctx.fill();
        }

        this.ctx.restore();
      }

      if (this.particles.length > 0) {
        requestAnimationFrame(() => this.loop());
      } else {
        this.animating = false;
      }
    }
  }

  const particles = new ParticleEngine('effects-canvas');

  /* =====================================================================
     4. GESTIÓN DEL ESTADO GLOBAL DEL JUEGO
     ===================================================================== */
  const gameState = {
    currentLevel: 1,
    unlockedLevels: 1,
    levelStars: [0, 0, 0, 0, 0, 0], // Índices 0-5 corresponden a Niveles 1-6
    currentHint: '',

    loadProgress() {
      try {
        const savedUnlocked = parseInt(localStorage.getItem('detectives_unlocked_level'), 10);
        if (savedUnlocked && savedUnlocked >= 1 && savedUnlocked <= 6) {
          this.unlockedLevels = savedUnlocked;
        }
        const savedStars = localStorage.getItem('detectives_stars');
        if (savedStars) {
          this.levelStars = JSON.parse(savedStars);
        }
      } catch (e) {
        // Fallback a valores por defecto
      }
    },

    saveProgress() {
      try {
        localStorage.setItem('detectives_unlocked_level', this.unlockedLevels.toString());
        localStorage.setItem('detectives_stars', JSON.stringify(this.levelStars));
      } catch (e) {}
    },

    getTotalStars() {
      return this.levelStars.reduce((acc, curr) => acc + curr, 0);
    },

    setStarsForLevel(lvl, count) {
      if (lvl >= 1 && lvl <= 6) {
        if (count > this.levelStars[lvl - 1]) {
          this.levelStars[lvl - 1] = count;
        }
        if (lvl === this.unlockedLevels && this.unlockedLevels < 6) {
          this.unlockedLevels = lvl + 1;
        }
        this.saveProgress();
      }
    }
  };

  gameState.loadProgress();

  /* =====================================================================
     5. CONTROLADOR DE VISTAS Y NAVEGACIÓN
     ===================================================================== */
  const views = {
    intro: document.getElementById('view-intro'),
    map: document.getElementById('view-map'),
    stage: document.getElementById('view-level-play'),
    final: document.getElementById('view-final')
  };

  const hud = {
    container: document.getElementById('app-header'),
    missionHud: document.getElementById('mission-indicator'),
    missionTitle: document.getElementById('mission-title-hud'),
    progressContainer: document.getElementById('hud-progress-container'),
    progressBarFill: document.getElementById('progress-bar-fill'),
    totalStarsVal: document.getElementById('total-stars-val'),
    btnHint: document.getElementById('btn-hint'),
    btnMapNav: document.getElementById('btn-map-nav'),
    btnAudio: document.getElementById('btn-audio-toggle'),
    soundIcon: document.getElementById('sound-icon'),
    soundLabel: document.getElementById('sound-label')
  };

  function switchView(viewName) {
    Object.keys(views).forEach(k => {
      views[k].classList.remove('active-view');
    });

    if (views[viewName]) {
      views[viewName].classList.add('active-view');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Configurar HUD según vista
    if (viewName === 'intro') {
      hud.missionHud.style.display = 'none';
      hud.progressContainer.style.display = 'none';
      hud.btnHint.style.display = 'none';
      hud.btnMapNav.style.display = 'none';
      updateNicoAvatar('intro-nico-avatar', 'talking');
    } else if (viewName === 'map') {
      hud.missionHud.style.display = 'none';
      hud.progressContainer.style.display = 'flex';
      hud.btnHint.style.display = 'none';
      hud.btnMapNav.style.display = 'none';
      renderMapCards();
      updateHudStars();
    } else if (viewName === 'stage') {
      hud.missionHud.style.display = 'inline-flex';
      hud.progressContainer.style.display = 'flex';
      hud.btnHint.style.display = 'inline-flex';
      hud.btnMapNav.style.display = 'inline-flex';
      hud.missionTitle.textContent = `Nivel ${gameState.currentLevel} de 6`;
      updateHudStars();
    } else if (viewName === 'final') {
      hud.missionHud.style.display = 'none';
      hud.progressContainer.style.display = 'flex';
      hud.btnHint.style.display = 'none';
      hud.btnMapNav.style.display = 'inline-flex';
      updateHudStars();
      sound.playFinalFanfare();
      particles.burst(window.innerWidth / 2, window.innerHeight * 0.3, 100);
    }
  }

  function updateHudStars() {
    const total = gameState.getTotalStars();
    hud.totalStarsVal.textContent = total;
    const pct = Math.min(100, Math.round((gameState.unlockedLevels / 6) * 100));
    hud.progressBarFill.style.width = `${pct}%`;
  }

  function renderMapCards() {
    for (let lvl = 1; lvl <= 6; lvl++) {
      const card = document.getElementById(`mission-card-${lvl}`);
      if (!card) continue;

      const isUnlocked = lvl <= gameState.unlockedLevels;
      const isCompleted = gameState.levelStars[lvl - 1] > 0;
      const btn = card.querySelector('.card-play-btn');
      const badge = card.querySelector('.card-status-badge');
      const starsContainer = document.getElementById(`stars-level-${lvl}`);

      card.className = 'mission-card';
      if (isCompleted) {
        card.classList.add('card-completed', 'card-unlocked');
        badge.textContent = 'COMPLETADO';
      } else if (isUnlocked) {
        card.classList.add('card-unlocked');
        badge.textContent = 'DISPONIBLE';
      } else {
        card.classList.add('card-locked');
        badge.textContent = 'BLOQUEADO';
      }

      if (btn) {
        btn.disabled = !isUnlocked;
        btn.textContent = isCompleted ? 'REPETIR CASO' : (isUnlocked ? 'INVESTIGAR' : 'BLOQUEADO');
      }

      if (starsContainer) {
        const starCount = gameState.levelStars[lvl - 1];
        starsContainer.innerHTML = '';
        for (let s = 1; s <= 3; s++) {
          const starSpan = document.createElement('span');
          starSpan.className = s <= starCount ? 'star star-filled' : 'star';
          starSpan.textContent = s <= starCount ? '⭐' : '☆';
          starsContainer.appendChild(starSpan);
        }
      }
    }
  }

  /* =====================================================================
     6. SISTEMA DE DIÁLOGOS DE NICO Y PISTAS
     ===================================================================== */
  const dialogEl = {
    speechText: document.getElementById('dialog-speech-text'),
    phaseTag: document.getElementById('dialog-phase-tag'),
    svgFrame: 'stage-nico-svg'
  };

  function setNicoSpeech(text, pose = 'talking', phase = 'Fase de Investigación') {
    if (dialogEl.speechText) {
      dialogEl.speechText.innerHTML = text;
    }
    if (dialogEl.phaseTag) {
      dialogEl.phaseTag.textContent = phase;
    }
    updateNicoAvatar(dialogEl.svgFrame, pose);
  }

  function setHint(hintText) {
    gameState.currentHint = hintText;
  }

  // Modales
  const hintModal = document.getElementById('hint-modal');
  const tutorialModal = document.getElementById('tutorial-modal');
  const completeModal = document.getElementById('level-complete-modal');

  function openHintModal() {
    sound.playSelect();
    const hintTextEl = document.getElementById('hint-modal-text');
    if (hintTextEl) {
      hintTextEl.textContent = gameState.currentHint || 'Recuerda: El Navegador abre páginas web; el Buscador encuentra información.';
    }
    updateNicoAvatar('hint-avatar-spot', 'thinking');
    hintModal.classList.add('modal-active');
  }

  function closeHintModal() {
    sound.playClick();
    hintModal.classList.remove('modal-active');
  }

  function openTutorialModal() {
    sound.playSelect();
    tutorialModal.classList.add('modal-active');
  }

  function closeTutorialModal() {
    sound.playClick();
    tutorialModal.classList.remove('modal-active');
  }

  function showLevelCompleteModal(level, recapHtml, message = '¡Caso Resuelto con Éxito!') {
    sound.playLevelComplete();
    particles.burst(window.innerWidth / 2, window.innerHeight * 0.4, 80);

    const titleEl = document.getElementById('level-complete-title');
    const msgEl = document.getElementById('level-complete-message');
    const recapEl = document.getElementById('learning-recap-box');

    if (titleEl) titleEl.textContent = `¡CASO ${level} RESUELTO!`;
    if (msgEl) msgEl.textContent = message;
    if (recapEl) recapEl.innerHTML = recapHtml;

    updateNicoAvatar('complete-avatar-spot', 'celebrating');
    gameState.setStarsForLevel(level, 3);
    updateHudStars();

    const nextBtn = document.getElementById('btn-next-level');
    if (nextBtn) {
      if (level >= 6) {
        nextBtn.innerHTML = '<span class="btn-ico">🎓</span><span class="btn-text">VER GRADUACIÓN Y DIPLOMA</span>';
        nextBtn.onclick = () => {
          completeModal.classList.remove('modal-active');
          switchView('final');
        };
      } else {
        nextBtn.innerHTML = '<span class="btn-ico">🚀</span><span class="btn-text">SIGUIENTE CASO</span>';
        nextBtn.onclick = () => {
          completeModal.classList.remove('modal-active');
          loadLevel(level + 1);
        };
      }
    }

    const modalBody = completeModal.querySelector('.modal-body');
    if (modalBody) modalBody.scrollTop = 0;
    completeModal.scrollTop = 0;
    completeModal.classList.add('modal-active');
  }

  /* =====================================================================
     7. CONTROLADOR DE NIVELES (1 A 6)
     ===================================================================== */
  const stageContent = document.getElementById('mission-stage-content');

  function loadLevel(levelNum) {
    gameState.currentLevel = levelNum;
    switchView('stage');

    switch (levelNum) {
      case 1:
        runLevel1();
        break;
      case 2:
        runLevel2();
        break;
      case 3:
        runLevel3();
        break;
      case 4:
        runLevel4();
        break;
      case 5:
        runLevel5();
        break;
      case 6:
        runLevel6();
        break;
      default:
        runLevel1();
    }
  }

  /* ---------------------------------------------------------------------
     NIVEL 1: ¿QUÉ HERRAMIENTA TENGO? (NAVEGADORES)
     --------------------------------------------------------------------- */
  function runLevel1() {
    setNicoSpeech(
      '¡Bienvenido a tu primer caso, detective! Frente a nosotros está el computador de la agencia. <strong>Explora las aplicaciones</strong> haciendo clic sobre ellas para identificar cuáles son <strong>navegadores</strong>.',
      'talking',
      'Paso 1: Exploración'
    );
    setHint('Busca aplicaciones que te permitan conectarte y ver páginas web: Chrome, Edge o Firefox.');

    const explored = { chrome: false, edge: false, firefox: false };

    stageContent.innerHTML = `
      <div class="os-desktop" id="lvl1-desktop">
        <div class="desktop-icons-grid">
          <!-- Chrome -->
          <div class="desktop-icon-item" data-app="chrome">
            <div class="app-svg-wrapper">
              <svg viewBox="0 0 100 100" width="100%" height="100%"><use href="#icon-chrome"></use></svg>
            </div>
            <span class="app-label">Google Chrome</span>
            <span class="app-tag">Tocar</span>
          </div>

          <!-- Edge -->
          <div class="desktop-icon-item" data-app="edge">
            <div class="app-svg-wrapper">
              <svg viewBox="0 0 100 100" width="100%" height="100%"><use href="#icon-edge"></use></svg>
            </div>
            <span class="app-label">Microsoft Edge</span>
            <span class="app-tag">Tocar</span>
          </div>

          <!-- Firefox -->
          <div class="desktop-icon-item" data-app="firefox">
            <div class="app-svg-wrapper">
              <svg viewBox="0 0 100 100" width="100%" height="100%"><use href="#icon-firefox"></use></svg>
            </div>
            <span class="app-label">Mozilla Firefox</span>
            <span class="app-tag">Tocar</span>
          </div>

          <!-- Fotos (Distractor) -->
          <div class="desktop-icon-item" data-app="photos">
            <div class="app-svg-wrapper" style="background:#475569;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:2rem;">
              🖼️
            </div>
            <span class="app-label">Galería Fotos</span>
            <span class="app-tag">Local</span>
          </div>

          <!-- Calculadora (Distractor) -->
          <div class="desktop-icon-item" data-app="calc">
            <div class="app-svg-wrapper" style="background:#334155;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:2rem;">
              🔢
            </div>
            <span class="app-label">Calculadora</span>
            <span class="app-tag">Local</span>
          </div>
        </div>

        <div id="lvl1-info-card-spot" style="margin-top:auto;"></div>
      </div>
    `;

    const items = stageContent.querySelectorAll('.desktop-icon-item');
    const infoSpot = document.getElementById('lvl1-info-card-spot');

    items.forEach(item => {
      item.addEventListener('click', () => {
        sound.playSelect();
        const app = item.getAttribute('data-app');

        if (app === 'chrome' || app === 'edge' || app === 'firefox') {
          explored[app] = true;
          let appName = app === 'chrome' ? 'Google Chrome' : (app === 'edge' ? 'Microsoft Edge' : 'Mozilla Firefox');
          
          infoSpot.innerHTML = `
            <div style="background:rgba(15,23,42,0.95);border:2px solid #06b6d4;padding:1.2rem;border-radius:14px;text-align:center;box-shadow:0 10px 25px rgba(0,0,0,0.5);animation:page-fade-in 0.3s ease;">
              <h4 style="color:#22d3ee;font-size:1.2rem;margin-bottom:0.4rem;">🌐 ¡Identificaste un NAVEGADOR!</h4>
              <p style="font-size:1rem;color:#f8fafc;"><strong>${appName}</strong>: "Soy un navegador. Mi función es abrir y permitirte utilizar páginas web de todo el mundo."</p>
            </div>
          `;

          setNicoSpeech(
            `¡Muy bien! <strong>${appName}</strong> es un navegador. Nos permite acceder y ver páginas web.`,
            'idea',
            'Identificando navegadores'
          );

          // Si ya exploró al menos los navegadores, avanzar a la misión de apertura
          if (explored.chrome && explored.edge && explored.firefox) {
            setTimeout(() => {
              startLevel1Mission2();
            }, 1800);
          }
        } else {
          infoSpot.innerHTML = `
            <div style="background:rgba(15,23,42,0.95);border:2px solid #94a3b8;padding:1rem;border-radius:14px;text-align:center;">
              <h4 style="color:#cbd5e1;font-size:1.1rem;margin-bottom:0.3rem;">📁 Aplicación del computador</h4>
              <p style="font-size:0.95rem;color:#94a3b8;">Esta es una herramienta local de la computadora (fotos o cálculos), pero <strong>no es un navegador</strong>. No sirve para entrar a Internet.</p>
            </div>
          `;
          sound.playWrong();
          setNicoSpeech(
            'Esa aplicación funciona dentro del computador, pero no nos sirve para entrar a páginas web. ¡Busca los navegadores!',
            'thinking',
            'Pista de Nico'
          );
        }
      });
    });

    function startLevel1Mission2() {
      sound.playCorrect();
      setNicoSpeech(
        '¡Genial! Ya conoces a los tres navegadores. Ahora Nico necesita entrar a la <strong>Revista Científica Escolar</strong>. ¿Qué herramienta debemos abrir? <strong>¡Haz clic en cualquiera de los tres navegadores!</strong>',
        'celebrating',
        'Misión 1: Abre el Navegador'
      );
      setHint('Tanto Chrome, como Edge y Firefox son navegadores web válidos. Cualquiera de los tres te servirá para abrir una página web.');

      infoSpot.innerHTML = `
        <div style="background:rgba(6,182,212,0.18);border:2px solid #06b6d4;padding:1.4rem;border-radius:14px;text-align:center;">
          <h4 style="color:#22d3ee;font-size:1.25rem;margin-bottom:0.5rem;">🎯 CASO URGENTE: Abre un Navegador</h4>
          <p style="color:#ffffff;font-size:1.05rem;">Haz clic sobre <strong>Chrome</strong>, <strong>Edge</strong> o <strong>Firefox</strong> para abrir la ventana web.</p>
        </div>
      `;

      items.forEach(item => {
        const app = item.getAttribute('data-app');
        if (app === 'chrome' || app === 'edge' || app === 'firefox') {
          item.style.border = '2px solid #22d3ee';
          item.style.boxShadow = '0 0 15px rgba(34,211,238,0.5)';
          item.onclick = () => {
            openSimulatedBrowser(app);
          };
        } else {
          item.style.opacity = '0.35';
          item.onclick = null;
        }
      });
    }

    function openSimulatedBrowser(browserName) {
      sound.playCorrect();
      let bTitle = browserName.toUpperCase();

      stageContent.innerHTML = `
        <div class="os-window">
          <div class="window-titlebar">
            <div class="window-controls">
              <span class="win-dot win-dot-red"></span>
              <span class="win-dot win-dot-yellow"></span>
              <span class="win-dot win-dot-green"></span>
            </div>
            <div class="window-title">
              <span>🌐 Navegador Web (${bTitle})</span>
            </div>
            <div style="font-size:0.8rem;color:#64748b;font-weight:700;">Conectado</div>
          </div>

          <div class="window-url-bar">
            <span class="url-lock-icon">🔒</span>
            <div class="url-input-box">
              <span style="color:#0284c7;font-weight:700;">https://</span>
              <span>www.revista-escolar-ciencias.org</span>
            </div>
            <button class="primary-btn" id="btn-lvl1-visit" style="padding:0.4rem 1rem;font-size:0.85rem;">
              Entrar a la página
            </button>
          </div>

          <div class="window-viewport" id="lvl1-viewport">
            <div style="text-align:center;padding:3rem 1rem;">
              <p style="color:#64748b;font-size:1.1rem;margin-bottom:1rem;">El navegador está listo para interpretar y mostrar la página web.</p>
              <button class="primary-btn" id="btn-lvl1-load-page">
                🌐 Cargar Página Web en ${bTitle}
              </button>
            </div>
          </div>
        </div>
      `;

      const loadBtn = document.getElementById('btn-lvl1-load-page');
      const visitBtn = document.getElementById('btn-lvl1-visit');

      const triggerLoad = () => {
        sound.playSelect();
        const viewport = document.getElementById('lvl1-viewport');
        viewport.innerHTML = `
          <div class="mockup-webpage">
            <div class="webpage-header-banner">
              <h2>🔬 REVISTA CIENTÍFICA ESCOLAR</h2>
              <p>Edición especial: La Tecnología y el Aprendizaje</p>
            </div>
            <div class="webpage-body-content">
              <p>¡Felicitaciones! Has utilizado exitosamente un <strong>navegador web</strong> para entrar a este sitio.</p>
              <div class="webpage-indicator-badge">
                <span>✅ PÁGINA WEB ABIERTA CON ÉXITO</span>
              </div>
            </div>
          </div>
        `;

        setNicoSpeech(
          '¡Excelente deducción! Usaste un <strong>navegador</strong> para acceder a una página web. Sin un navegador, no podríamos abrir sitios en Internet.',
          'celebrating',
          '¡Misión 1 Completada!'
        );

        setTimeout(() => {
          showLevelCompleteModal(
            1,
            `
              <strong>Concepto Clave Aprendido:</strong><br>
              🌐 <strong>NAVEGADOR:</strong> Chrome, Edge y Firefox son diferentes navegadores, pero todos cumplen la misma función:<br>
              <em>"Me permiten entrar y utilizar páginas web."</em>
            `,
            '¡Comprendiste la función del Navegador!'
          );
        }, 1500);
      };

      if (loadBtn) loadBtn.onclick = triggerLoad;
      if (visitBtn) visitBtn.onclick = triggerLoad;
    }
  }

  /* ---------------------------------------------------------------------
     NIVEL 2: BUSCADORES EN ACCIÓN (GOOGLE Y BING)
     --------------------------------------------------------------------- */
  function runLevel2() {
    setNicoSpeech(
      'Nico tiene una pregunta urgente de ciencias: <em>"¿Cuál es el planeta más grande del sistema solar?"</em>. Tenemos el navegador abierto, pero <strong>no conocemos la dirección web</strong> de la respuesta. ¿Qué herramienta debemos usar adentro para encontrar información?',
      'thinking',
      'Paso 1: El Dilema'
    );
    setHint('Para encontrar información cuando no sabemos la dirección web, usamos un BUSCADOR (Google o Bing).');

    stageContent.innerHTML = `
      <div class="drag-workbench">
        <div style="text-align:center;margin-bottom:0.5rem;">
          <h3 style="color:#fff;font-size:1.3rem;margin-bottom:0.3rem;">🔎 ¿Qué herramienta nos ayuda a ENCONTRAR información?</h3>
          <p style="color:#94a3b8;font-size:0.95rem;">Selecciona el buscador que prefieras para realizar la investigación:</p>
        </div>

        <div style="display:flex;justify-content:center;gap:2rem;flex-wrap:wrap;">
          <!-- Google Card -->
          <div class="drag-item-card" id="btn-choose-google" style="padding:1.5rem 2rem;flex-direction:column;min-width:200px;cursor:pointer;">
            <div style="width:64px;height:64px;margin-bottom:0.5rem;">
              <svg viewBox="0 0 100 100" width="100%" height="100%"><use href="#icon-google"></use></svg>
            </div>
            <span style="font-size:1.2rem;color:#fff;">Google</span>
            <span style="font-size:0.8rem;color:#94a3b8;">Buscador Web</span>
          </div>

          <!-- Bing Card -->
          <div class="drag-item-card" id="btn-choose-bing" style="padding:1.5rem 2rem;flex-direction:column;min-width:200px;cursor:pointer;">
            <div style="width:64px;height:64px;margin-bottom:0.5rem;">
              <svg viewBox="0 0 100 100" width="100%" height="100%"><use href="#icon-bing"></use></svg>
            </div>
            <span style="font-size:1.2rem;color:#fff;">Bing</span>
            <span style="font-size:0.8rem;color:#94a3b8;">Buscador Web</span>
          </div>
        </div>

        <div id="lvl2-search-container" style="margin-top:1.5rem;"></div>
      </div>
    `;

    const chooseGoogle = document.getElementById('btn-choose-google');
    const chooseBing = document.getElementById('btn-choose-bing');

    chooseGoogle.onclick = () => launchSearchMockup('Google');
    chooseBing.onclick = () => launchSearchMockup('Bing');

    function launchSearchMockup(engineName) {
      sound.playSelect();
      const container = document.getElementById('lvl2-search-container');
      const isGoogle = engineName === 'Google';

      setNicoSpeech(
        `¡Exacto! <strong>${engineName}</strong> es un buscador. Ahora escribe o presiona buscar para que rastree información sobre el planeta más grande.`,
        'idea',
        'Buscador en Acción'
      );

      container.innerHTML = `
        <div class="os-window" style="animation:window-pop 0.3s ease;">
          <div class="window-titlebar">
            <div class="window-controls">
              <span class="win-dot win-dot-red"></span>
              <span class="win-dot win-dot-yellow"></span>
              <span class="win-dot win-dot-green"></span>
            </div>
            <div class="window-title">
              <span>Navegador Web ➔ Buscador ${engineName}</span>
            </div>
            <span style="font-size:0.8rem;color:#10b981;font-weight:700;">En línea</span>
          </div>

          <div class="window-viewport">
            <div class="search-engine-mockup">
              <div class="search-brand-logo ${isGoogle ? 'search-brand-google' : 'search-brand-bing'}">
                ${engineName}
              </div>

              <div class="search-input-wrapper">
                <span>🔎</span>
                <input type="text" class="search-input-field" id="lvl2-search-input" value="planeta mas grande del sistema solar" readonly>
                <button class="search-btn-action" id="btn-lvl2-do-search">BUSCAR</button>
              </div>

              <div id="lvl2-results-spot"></div>
            </div>
          </div>
        </div>
      `;

      const searchBtn = document.getElementById('btn-lvl2-do-search');
      searchBtn.onclick = () => {
        sound.playSearchScan();
        const resultsSpot = document.getElementById('lvl2-results-spot');
        resultsSpot.innerHTML = `
          <div style="text-align:center;padding:1.5rem;color:#64748b;">
            <p>🔍 El buscador está explorando millones de páginas en Internet...</p>
          </div>
        `;

        setTimeout(() => {
          sound.playCorrect();
          resultsSpot.innerHTML = `
            <div class="search-results-container">
              <div class="search-result-item" id="lvl2-best-result">
                <div class="result-url">https://www.astronomia-educativa.org/planetas/jupiter</div>
                <div class="result-title">Júpiter: El gigante gaseoso más grande del Sistema Solar</div>
                <div class="result-snippet">
                  Júpiter es con diferencia el planeta más grande de nuestro sistema solar. Su masa es más del doble que la de todos los demás planetas juntos.
                </div>
              </div>

              <div class="search-result-item" style="opacity:0.7;">
                <div class="result-url">https://www.tienda-telescopios.com</div>
                <div class="result-title">Compra telescopios baratos para observar la luna</div>
                <div class="result-snippet">Encuentra los mejores descuentos en lentes astronómicos y trípodes.</div>
              </div>
            </div>
          `;

          setNicoSpeech(
            '¡Mira los resultados! El buscador encontró páginas con la respuesta. <strong>Haz clic sobre el resultado de astronomía</strong> para visitarlo.',
            'celebrating',
            'Resultados encontrados'
          );

          const bestResult = document.getElementById('lvl2-best-result');
          bestResult.onclick = () => {
            sound.playSelect();
            bestResult.style.background = '#dbeafe';

            setTimeout(() => {
              showLevelCompleteModal(
                2,
                `
                  <strong>Diferencia Fundamental:</strong><br>
                  🌐 <strong>NAVEGADOR:</strong> La puerta para entrar a la web (Chrome, Edge, Firefox).<br>
                  🔎 <strong>BUSCADOR:</strong> El servicio que te ayuda a <strong>encontrar información</strong> (Google, Bing).<br>
                  <em>¡Un buscador funciona DENTRO del navegador!</em>
                `,
                '¡Comprendiste la función del Buscador!'
              );
            }, 800);
          };
        }, 1200);
      };
    }
  }

  /* ---------------------------------------------------------------------
     NIVEL 3: LA BÚSQUEDA PERDIDA (LA CADENA COMPLETA)
     --------------------------------------------------------------------- */
  function runLevel3() {
    setNicoSpeech(
      'Para ser un detective profesional, debes conocer <strong>la cadena completa de una investigación</strong>. ¡Ordena las tarjetas para armar el camino correcto desde encender el equipo hasta ver la información!',
      'talking',
      'El Rompecabezas de la Cadena'
    );
    setHint('El orden es: Computador ➔ Navegador ➔ Buscador ➔ Búsqueda ➔ Resultados ➔ Página Web.');

    const sequenceItems = [
      { id: 'step-pc', name: '💻 Computador', step: 1, desc: 'Equipo donde trabajamos' },
      { id: 'step-nav', name: '🌐 Navegador', step: 2, desc: 'Programa para entrar a la web' },
      { id: 'step-search', name: '🔎 Buscador', step: 3, desc: 'Servicio para hallar datos' },
      { id: 'step-query', name: '🔤 Búsqueda', step: 4, desc: 'Escribir las palabras clave' },
      { id: 'step-res', name: '📋 Resultados', step: 5, desc: 'Lista de páginas sugeridas' },
      { id: 'step-web', name: '🌐 Página Web', step: 6, desc: 'Información final leída' }
    ];

    // Desordenar tarjetas para el estudiante
    const shuffled = [...sequenceItems].sort(() => Math.random() - 0.5);
    const placedSlots = [null, null, null, null, null, null];
    let selectedItem = null;

    stageContent.innerHTML = `
      <div class="drag-workbench">
        <div style="text-align:center;">
          <h3 style="color:#fff;font-size:1.25rem;margin-bottom:0.3rem;">🧩 Arma la Cadena de Investigación Digital</h3>
          <p style="color:#94a3b8;font-size:0.95rem;">Toca una tarjeta y luego toca la casilla vacía donde corresponde (o arrástrala):</p>
        </div>

        <!-- Pool de tarjetas disponibles -->
        <div class="draggable-cards-pool" id="lvl3-cards-pool">
          ${shuffled.map(item => `
            <div class="drag-item-card" draggable="true" data-id="${item.id}" data-step="${item.step}">
              <span>${item.name}</span>
            </div>
          `).join('')}
        </div>

        <!-- Ranuras numeradas 1 al 6 -->
        <div class="sequence-pipeline-grid">
          ${[1, 2, 3, 4, 5, 6].map(num => `
            <div class="pipeline-slot" data-slot="${num}" id="pipeline-slot-${num}">
              <span class="pipeline-slot-num">${num}</span>
              <span class="pipeline-slot-label">Paso ${num}</span>
            </div>
            ${num < 6 ? '<span class="pipeline-arrow">➔</span>' : ''}
          `).join('')}
        </div>

        <div style="text-align:center;margin-top:1rem;">
          <button class="primary-btn" id="btn-check-lvl3-chain" style="display:none;">
            🚀 COMPROBAR CADENA
          </button>
        </div>
      </div>
    `;

    const poolEl = document.getElementById('lvl3-cards-pool');
    const slotEls = stageContent.querySelectorAll('.pipeline-slot');
    const checkBtn = document.getElementById('btn-check-lvl3-chain');

    // Manejo accesible táctil/clic y drag & drop
    function bindCardInteraction() {
      const cards = stageContent.querySelectorAll('.drag-item-card');

      cards.forEach(card => {
        // Clic para seleccionar
        card.onclick = (e) => {
          e.stopPropagation();
          sound.playSelect();
          cards.forEach(c => c.classList.remove('is-selected'));
          selectedItem = card;
          card.classList.add('is-selected');
        };

        // Drag start
        card.ondragstart = (e) => {
          sound.playSelect();
          selectedItem = card;
          card.classList.add('is-dragging');
          e.dataTransfer.setData('text/plain', card.getAttribute('data-id'));
        };

        card.ondragend = () => {
          card.classList.remove('is-dragging');
        };
      });
    }

    bindCardInteraction();

    slotEls.forEach(slot => {
      // Clic para colocar tarjeta seleccionada
      slot.onclick = () => {
        if (!selectedItem) return;
        placeCardInSlot(selectedItem, slot);
      };

      // Drag over / drop
      slot.ondragover = (e) => {
        e.preventDefault();
        slot.classList.add('slot-hover');
      };

      slot.ondragleave = () => {
        slot.classList.remove('slot-hover');
      };

      slot.ondrop = (e) => {
        e.preventDefault();
        slot.classList.remove('slot-hover');
        if (selectedItem) {
          placeCardInSlot(selectedItem, slot);
        }
      };
    });

    function placeCardInSlot(card, slot) {
      sound.playCardDrop();
      const slotNum = parseInt(slot.getAttribute('data-slot'), 10);
      const cardStep = parseInt(card.getAttribute('data-step'), 10);

      // Si ya había una tarjeta en este slot, devolverla al pool
      const existingCard = slot.querySelector('.drag-item-card');
      if (existingCard) {
        poolEl.appendChild(existingCard);
      }

      slot.innerHTML = `<span class="pipeline-slot-num">${slotNum}</span>`;
      slot.appendChild(card);
      card.classList.remove('is-selected');
      selectedItem = null;

      placedSlots[slotNum - 1] = cardStep;

      // Verificar si ya se llenaron las 6 ranuras
      const allFilled = placedSlots.every(s => s !== null);
      if (allFilled) {
        checkBtn.style.display = 'inline-flex';
        checkBtn.onclick = evaluateChain;
      }
    }

    function evaluateChain() {
      const isCorrect = placedSlots.every((step, idx) => step === idx + 1);

      if (isCorrect) {
        sound.playCorrect();
        setNicoSpeech(
          '¡Perfecto, detective! Has conectado la secuencia completa con total exactitud. ¡Esa es la cadena maestra de Internet!',
          'celebrating',
          '¡Cadena Maestra Resuelta!'
        );

        slotEls.forEach(slot => {
          slot.style.borderColor = '#10b981';
          slot.style.background = 'rgba(16, 185, 129, 0.2)';
        });

        setTimeout(() => {
          showLevelCompleteModal(
            3,
            `
              <strong>La Cadena Inquebrantable del Detective:</strong><br>
              1. 💻 <strong>Computador:</strong> Nuestro equipo físico.<br>
              2. 🌐 <strong>Navegador:</strong> Abre la ventana a la web.<br>
              3. 🔎 <strong>Buscador:</strong> Servicio para buscar información.<br>
              4. 🔤 <strong>Búsqueda:</strong> Palabras clave que escribimos.<br>
              5. 📋 <strong>Resultados:</strong> Enlaces sugeridos.<br>
              6. 🌐 <strong>Página Web:</strong> La información que queríamos.
            `,
            '¡Cadena de Investigación Dominada!'
          );
        }, 1200);
      } else {
        sound.playWrong();
        setNicoSpeech(
          'Casi lo tienes. Revisa el orden: Primero necesitas el <strong>Navegador</strong> para poder usar el <strong>Buscador</strong>. ¡Inténtalo de nuevo!',
          'thinking',
          'Pista de Orden'
        );
      }
    }
  }

  /* ---------------------------------------------------------------------
     NIVEL 4: ¿NAVEGADOR O BUSCADOR? (TABLERO DE CASOS)
     --------------------------------------------------------------------- */
  function runLevel4() {
    setNicoSpeech(
      'La agencia está recibiendo llamadas con casos reales. En cada situación, debes decidir si se necesita un <strong>NAVEGADOR</strong> o un <strong>BUSCADOR</strong>.',
      'talking',
      'Despacho de Casos'
    );
    setHint('Si el objetivo es abrir o ingresar a un sitio web, usa Navegador. Si el objetivo es encontrar información o datos que no sabes dónde están, usa Buscador.');

    const cases = [
      {
        id: 1,
        title: 'Caso 1: Noticia Escolar',
        text: '"Quiero abrir una página web para leer una noticia."',
        correct: 'browser',
        expl: '¡Exacto! Para abrir y visualizar una página web necesitas un NAVEGADOR (Chrome, Edge, Firefox).'
      },
      {
        id: 2,
        title: 'Caso 2: Los Volcanes',
        text: '"Quiero encontrar información sobre cómo se forman los volcanes."',
        correct: 'search',
        expl: '¡Muy bien! Para buscar y encontrar información necesitas un BUSCADOR (Google, Bing).'
      },
      {
        id: 3,
        title: 'Caso 3: Dirección Web Conocida',
        text: '"Tengo la dirección exacta www.museo-ciencias.org y quiero entrar directamente."',
        correct: 'browser',
        expl: '¡Correcto! Si ya tienes la dirección web, el NAVEGADOR te lleva directamente al sitio.'
      },
      {
        id: 4,
        title: 'Caso 4: Fauna Colombiana',
        text: '"Quiero buscar información sobre los osos de anteojos en Colombia."',
        correct: 'search',
        expl: '¡Excelente! El BUSCADOR rastreará en la red los artículos sobre esos animales.'
      },
      {
        id: 5,
        title: 'Caso 5: Enlace de la Profesora',
        text: '"La profesora me envió un enlace web de una tarea para que lo abra."',
        correct: 'browser',
        expl: '¡Exacto! El NAVEGADOR es el encargado de abrir y mostrar cualquier enlace web.'
      },
      {
        id: 6,
        title: 'Caso 6: Récord Geográfico',
        text: '"No sé cuál es el desierto más seco del mundo y necesito investigarlo."',
        correct: 'search',
        expl: '¡Bien pensado! El BUSCADOR te ayudará a encontrar ese dato que desconoces.'
      }
    ];

    let currentCaseIdx = 0;

    function renderActiveCase() {
      const c = cases[currentCaseIdx];

      setNicoSpeech(
        `Analiza el <strong>${c.title}</strong>: <em>${c.text}</em>. ¿Qué herramienta debemos usar?`,
        'thinking',
        `Caso ${currentCaseIdx + 1} de ${cases.length}`
      );

      stageContent.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:1.5rem;max-width:800px;margin:0 auto;width:100%;">
          <div style="background:rgba(15,23,42,0.85);border:2px solid rgba(56,189,248,0.3);border-radius:18px;padding:1.8rem;text-align:center;width:100%;box-shadow:0 10px 25px rgba(0,0,0,0.5);">
            <div style="display:inline-block;padding:0.3rem 0.8rem;background:rgba(56,189,248,0.15);color:#38bdf8;border-radius:20px;font-weight:800;font-size:0.85rem;margin-bottom:0.8rem;">
              EXPEDIENTE DIGITAL ${currentCaseIdx + 1} / ${cases.length}
            </div>
            <h3 style="color:#ffffff;font-size:1.4rem;margin-bottom:0.8rem;">${c.title}</h3>
            <p style="color:#e2e8f0;font-size:1.2rem;font-weight:600;line-height:1.4;">${c.text}</p>
          </div>

          <div style="display:flex;justify-content:center;gap:1.5rem;width:100%;flex-wrap:wrap;">
            <!-- Opción Navegador -->
            <button class="primary-btn" id="btn-choice-browser" style="flex:1;min-width:240px;padding:1.4rem;flex-direction:column;gap:0.4rem;background:linear-gradient(135deg,#1d4ed8,#2563eb);">
              <span style="font-size:2.2rem;">🌐</span>
              <span style="font-size:1.15rem;font-weight:900;">NAVEGADOR</span>
              <span style="font-size:0.85rem;color:#bfdbfe;font-weight:600;">Chrome • Edge • Firefox</span>
            </button>

            <!-- Opción Buscador -->
            <button class="primary-btn" id="btn-choice-search" style="flex:1;min-width:240px;padding:1.4rem;flex-direction:column;gap:0.4rem;background:linear-gradient(135deg,#d97706,#f59e0b);">
              <span style="font-size:2.2rem;">🔎</span>
              <span style="font-size:1.15rem;font-weight:900;">BUSCADOR</span>
              <span style="font-size:0.85rem;color:#fef08a;font-weight:600;">Google • Bing</span>
            </button>
          </div>

          <div id="lvl4-feedback-spot" style="width:100%;"></div>
        </div>
      `;

      const btnBrowser = document.getElementById('btn-choice-browser');
      const btnSearch = document.getElementById('btn-choice-search');
      const fbSpot = document.getElementById('lvl4-feedback-spot');

      btnBrowser.onclick = () => evaluateChoice('browser', c, fbSpot);
      btnSearch.onclick = () => evaluateChoice('search', c, fbSpot);
    }

    function evaluateChoice(selected, currentCase, feedbackSpot) {
      if (selected === currentCase.correct) {
        sound.playCorrect();
        feedbackSpot.innerHTML = `
          <div style="background:rgba(16,185,129,0.2);border:2px solid #10b981;padding:1.2rem;border-radius:14px;text-align:center;animation:page-fade-in 0.3s ease;">
            <h4 style="color:#6ee7b7;font-size:1.15rem;margin-bottom:0.3rem;">¡CORRECTO, DETECTIVE!</h4>
            <p style="color:#f8fafc;font-size:1rem;">${currentCase.expl}</p>
          </div>
        `;

        setNicoSpeech(currentCase.expl, 'celebrating', '¡Respuesta Acertada!');

        setTimeout(() => {
          currentCaseIdx++;
          if (currentCaseIdx < cases.length) {
            renderActiveCase();
          } else {
            showLevelCompleteModal(
              4,
              `
                <strong>Has Resuelto los 6 Casos Críticos:</strong><br>
                Demostraste que sabes con certeza cuándo una situación requiere un <strong>Navegador</strong> (para entrar a páginas web) y cuándo requiere un <strong>Buscador</strong> (para encontrar información).
              `,
              '¡Clasificación de Casos Impecable!'
            );
          }
        }, 1800);
      } else {
        sound.playWrong();
        feedbackSpot.innerHTML = `
          <div style="background:rgba(239,68,68,0.2);border:2px solid #ef4444;padding:1.2rem;border-radius:14px;text-align:center;animation:page-fade-in 0.3s ease;">
            <h4 style="color:#fca5a5;font-size:1.15rem;margin-bottom:0.3rem;">Pensemos juntos:</h4>
            <p style="color:#f8fafc;font-size:1rem;">
              ¿La misión es <strong>abrir una página</strong> o es <strong>encontrar información</strong> que aún no tienes? ¡Inténtalo de nuevo!
            </p>
          </div>
        `;

        setNicoSpeech(
          'Casi. Recuerda: el navegador te deja entrar a páginas web; el buscador te ayuda a encontrar información cuando no sabes la dirección.',
          'thinking',
          'Inténtalo de nuevo'
        );
      }
    }

    renderActiveCase();
  }

  /* ---------------------------------------------------------------------
     NIVEL 5: DETECTIVES DE INTERNET (CONSTRUCCIÓN DE BÚSQUEDAS)
     --------------------------------------------------------------------- */
  function runLevel5() {
    setNicoSpeech(
      'En este caso aprenderemos la ciencia de formular preguntas a los buscadores. Nico debe investigar: <em>"¿Por qué los animales están en peligro de extinción?"</em>.',
      'talking',
      'Laboratorio de Palabras Clave'
    );
    setHint('Elige las palabras que definan claramente el tema. Construir una búsqueda específica da mejores resultados.');

    let currentPhase = 1;

    function renderPhase1() {
      // Actividad: Construir la consulta con fichas de palabras
      const availableWords = ['animales', 'en', 'peligro', 'de', 'extinción', 'videojuegos', 'pizza', 'bailar'];
      const queryWords = [];

      stageContent.innerHTML = `
        <div class="query-builder-box">
          <div style="text-align:center;">
            <span style="background:rgba(6,182,212,0.2);color:#22d3ee;padding:0.2rem 0.8rem;border-radius:20px;font-weight:800;font-size:0.8rem;">
              MISIÓN DE PALABRAS CLAVE
            </span>
            <h3 style="color:#fff;font-size:1.3rem;margin:0.5rem 0;">Construye la búsqueda adecuada</h3>
            <p style="color:#94a3b8;font-size:0.95rem;">Toca las palabras que necesitas para armar una búsqueda sobre animales en peligro de extinción:</p>
          </div>

          <!-- Barra de búsqueda donde se acumulan las fichas -->
          <div class="query-drop-target" id="lvl5-query-bar">
            <span style="color:#64748b;font-size:1.1rem;">🔎</span>
            <span id="lvl5-placeholder" style="color:#94a3b8;font-style:italic;">Toca las palabras de abajo para agregarlas aquí...</span>
          </div>

          <!-- Fichas disponibles -->
          <div class="available-words-pool" id="lvl5-words-pool">
            ${availableWords.map(word => `
              <button class="word-pill-btn" data-word="${word}">${word}</button>
            `).join('')}
          </div>

          <div style="display:flex;gap:1rem;margin-top:0.8rem;">
            <button class="primary-btn" id="btn-submit-query">🔍 EJECUTAR BÚSQUEDA</button>
            <button class="secondary-btn" id="btn-clear-query">BORRAR</button>
          </div>

          <div id="lvl5-feedback-spot" style="width:100%;"></div>
        </div>
      `;

      const pool = document.getElementById('lvl5-words-pool');
      const queryBar = document.getElementById('lvl5-query-bar');
      const placeholder = document.getElementById('lvl5-placeholder');
      const submitBtn = document.getElementById('btn-submit-query');
      const clearBtn = document.getElementById('btn-clear-query');
      const fbSpot = document.getElementById('lvl5-feedback-spot');

      pool.querySelectorAll('.word-pill-btn').forEach(btn => {
        btn.onclick = () => {
          sound.playSelect();
          const word = btn.getAttribute('data-word');
          queryWords.push(word);
          renderQueryBar();
        };
      });

      function renderQueryBar() {
        if (queryWords.length === 0) {
          queryBar.innerHTML = `<span style="color:#64748b;font-size:1.1rem;">🔎</span><span id="lvl5-placeholder" style="color:#94a3b8;font-style:italic;">Toca las palabras de abajo para agregarlas aquí...</span>`;
        } else {
          queryBar.innerHTML = `
            <span style="color:#0284c7;font-size:1.1rem;">🔎</span>
            ${queryWords.map((w, idx) => `
              <span class="query-word-chip" data-idx="${idx}">
                ${w}
                <span class="chip-remove-btn" title="Quitar">✕</span>
              </span>
            `).join('')}
          `;

          // Permitir remover palabras al tocar la X
          queryBar.querySelectorAll('.query-word-chip').forEach(chip => {
            chip.onclick = () => {
              sound.playClick();
              const idx = parseInt(chip.getAttribute('data-idx'), 10);
              queryWords.splice(idx, 1);
              renderQueryBar();
            };
          });
        }
      }

      clearBtn.onclick = () => {
        sound.playClick();
        queryWords.length = 0;
        renderQueryBar();
      };

      submitBtn.onclick = () => {
        const queryText = queryWords.join(' ').toLowerCase();

        // Validación de intención pedagógica (no exigir orden robótico estricto)
        const hasAnimales = queryText.includes('animal') || queryText.includes('animales');
        const hasPeligro = queryText.includes('peligro');
        const hasExtincion = queryText.includes('extincion') || queryText.includes('extinción');
        const hasDistractor = queryText.includes('pizza') || queryText.includes('videojuego') || queryText.includes('bailar');

        if (hasAnimales && (hasPeligro || hasExtincion) && !hasDistractor) {
          sound.playCorrect();
          fbSpot.innerHTML = `
            <div style="background:rgba(16,185,129,0.2);border:2px solid #10b981;padding:1.2rem;border-radius:14px;text-align:center;animation:page-fade-in 0.3s ease;">
              <h4 style="color:#6ee7b7;font-size:1.15rem;margin-bottom:0.3rem;">¡EXCELENTE BÚSQUEDA!</h4>
              <p style="color:#f8fafc;font-size:1rem;">
                Tu consulta <em>"${queryWords.join(' ')}"</em> contiene las palabras clave ideales para que el buscador encuentre páginas sobre el tema.
              </p>
            </div>
          `;

          setNicoSpeech(
            '¡Gran trabajo! Esa es una búsqueda con palabras clave precisas. Ahora pasemos a comparar qué búsquedas son más efectivas.',
            'celebrating',
            '¡Búsqueda Exitosa!'
          );

          setTimeout(() => {
            renderPhase2();
          }, 2000);
        } else {
          sound.playWrong();
          fbSpot.innerHTML = `
            <div style="background:rgba(239,68,68,0.2);border:2px solid #ef4444;padding:1.2rem;border-radius:14px;text-align:center;animation:page-fade-in 0.3s ease;">
              <h4 style="color:#fca5a5;font-size:1.15rem;margin-bottom:0.3rem;">Pensemos en las palabras clave:</h4>
              <p style="color:#f8fafc;font-size:1rem;">
                Asegúrate de incluir <strong>animales</strong>, <strong>peligro</strong> o <strong>extinción</strong>, y evita palabras que no tengan relación como pizza o videojuegos.
              </p>
            </div>
          `;

          setNicoSpeech(
            'Revisa tus palabras clave. Necesitamos términos exactos sobre animales y su peligro de desaparecer.',
            'thinking',
            'Pista de Búsqueda'
          );
        }
      };
    }

    function renderPhase2() {
      // Actividad: ¿Cuál búsqueda es mejor?
      setNicoSpeech(
        'Observa estas 3 posibles búsquedas. ¿Cuál crees que le dará a Nico la información más clara y directa sobre la conservación de especies?',
        'thinking',
        'Fase 2: ¿Cuál búsqueda es mejor?'
      );

      stageContent.innerHTML = `
        <div style="max-width:750px;margin:0 auto;width:100%;">
          <div style="text-align:center;margin-bottom:1.5rem;">
            <h3 style="color:#fff;font-size:1.35rem;margin-bottom:0.4rem;">🔎 Análisis de Calidad de Búsqueda</h3>
            <p style="color:#94a3b8;font-size:1rem;">Selecciona la opción que consideras más precisa y efectiva:</p>
          </div>

          <div class="comparison-options-grid">
            <!-- Opción A -->
            <div class="comparison-card" data-opt="A">
              <span class="opt-letter">A</span>
              <div class="opt-text">
                <div style="color:#38bdf8;font-size:1.15rem;">"animales"</div>
                <div style="font-size:0.85rem;color:#94a3b8;">Búsqueda de una sola palabra general</div>
              </div>
            </div>

            <!-- Opción B (Correcta) -->
            <div class="comparison-card" data-opt="B">
              <span class="opt-letter">B</span>
              <div class="opt-text">
                <div style="color:#38bdf8;font-size:1.15rem;">"animales en peligro de extinción"</div>
                <div style="font-size:0.85rem;color:#94a3b8;">Búsqueda con tema específico y palabras clave exactas</div>
              </div>
            </div>

            <!-- Opción C -->
            <div class="comparison-card" data-opt="C">
              <span class="opt-letter">C</span>
              <div class="opt-text">
                <div style="color:#38bdf8;font-size:1.15rem;">"cosas de animales"</div>
                <div style="font-size:0.85rem;color:#94a3b8;">Búsqueda con palabras vagas y confusas</div>
              </div>
            </div>
          </div>

          <div id="lvl5-p2-feedback" style="margin-top:1.5rem;"></div>
        </div>
      `;

      const cards = stageContent.querySelectorAll('.comparison-card');
      const fbSpot = document.getElementById('lvl5-p2-feedback');

      cards.forEach(card => {
        card.onclick = () => {
          const opt = card.getAttribute('data-opt');
          cards.forEach(c => c.classList.remove('card-selected'));
          card.classList.add('card-selected');

          if (opt === 'B') {
            sound.playCorrect();
            fbSpot.innerHTML = `
              <div style="background:rgba(16,185,129,0.2);border:2px solid #10b981;padding:1.4rem;border-radius:14px;text-align:center;animation:page-fade-in 0.3s ease;">
                <h4 style="color:#6ee7b7;font-size:1.2rem;margin-bottom:0.4rem;">¡EXACTAMENTE! LA OPCIÓN B ES LA MEJOR</h4>
                <p style="color:#f8fafc;font-size:1rem;line-height:1.5;">
                  Una búsqueda <strong>específica</strong> como <em>"animales en peligro de extinción"</em> le indica con precisión al buscador qué queremos. La opción A traería fotos y tiendas; y la opción C es demasiado vaga.
                </p>
              </div>
            `;

            setNicoSpeech(
              '¡Maravilloso! Una búsqueda específica le permite al buscador entregarnos exactamente las páginas con la información que necesitamos.',
              'celebrating',
              '¡Caso de Búsquedas Resuelto!'
            );

            setTimeout(() => {
              showLevelCompleteModal(
                5,
                `
                  <strong>El Arte de un Detective Digital:</strong><br>
                  Los <strong>buscadores</strong> funcionan mejor cuando usamos palabras clave claras y específicas.<br>
                  ¡Así encontramos los mejores resultados rápidamente!
                `,
                '¡Maestro de las Búsquedas en Internet!'
              );
            }, 1800);
          } else {
            sound.playWrong();
            let whyMsg = opt === 'A' ? 'Si buscas solo "animales", saldrán millones de páginas de veterinarias, dibujos y tiendas de mascotas sin responder tu tarea.' : 'La palabra "cosas" es muy vaga y confunde al buscador.';

            fbSpot.innerHTML = `
              <div style="background:rgba(239,68,68,0.2);border:2px solid #ef4444;padding:1.2rem;border-radius:14px;text-align:center;">
                <h4 style="color:#fca5a5;font-size:1.1rem;margin-bottom:0.3rem;">Analicemos esta opción:</h4>
                <p style="color:#f8fafc;font-size:0.95rem;">${whyMsg} Busca una opción que exprese claramente el tema específico.</p>
              </div>
            `;

            setNicoSpeech(
              'Piénsalo bien: ¿cuál de las tres frases le dice exactamente al buscador qué tema queremos investigar?',
              'thinking',
              'Pista Pedagógica'
            );
          }
        };
      });
    }

    renderPhase1();
  }

  /* ---------------------------------------------------------------------
     NIVEL 6: LA GRAN INVESTIGACIÓN (OCÉANOS) + CLASIFICACIÓN FINAL
     --------------------------------------------------------------------- */
  function runLevel6() {
    setNicoSpeech(
      '¡Has llegado a la Gran Misión Final! Debemos preparar una investigación completa sobre <strong>los océanos del planeta</strong>. Recorrerás cada paso del detective digital.',
      'talking',
      'Misión Final: Paso 1'
    );
    setHint('Sigue la secuencia: Elige Navegador ➔ Elige Buscador ➔ Formula Búsqueda ➔ Analiza Resultados ➔ Explora la Página Web.');

    let chosenBrowser = 'Chrome';
    let chosenSearch = 'Google';

    // PASO 1: Elegir navegador
    function step1ChooseBrowser() {
      setNicoSpeech(
        'Primer paso fundamental: Antes de buscar nada, necesitamos la herramienta que nos permite entrar a la red. <strong>¿Qué navegador quieres abrir?</strong>',
        'idea',
        'Paso 1: Elige el Navegador'
      );

      stageContent.innerHTML = `
        <div style="text-align:center;max-width:850px;margin:0 auto;width:100%;">
          <div style="margin-bottom:1.5rem;">
            <span style="background:rgba(59,130,246,0.2);color:#93c5fd;padding:0.3rem 0.9rem;border-radius:20px;font-weight:800;font-size:0.85rem;">
              PASO 1 DE 5
            </span>
            <h3 style="color:#fff;font-size:1.4rem;margin:0.5rem 0;">Abre un Navegador Web</h3>
            <p style="color:#94a3b8;font-size:1rem;">Cualquiera de los tres es un navegador legítimo. Selecciona uno:</p>
          </div>

          <div style="display:flex;justify-content:center;gap:1.5rem;flex-wrap:wrap;">
            <div class="drag-item-card" data-b="Google Chrome" style="flex-direction:column;padding:1.5rem;min-width:180px;cursor:pointer;">
              <div style="width:64px;height:64px;margin-bottom:0.5rem;"><svg viewBox="0 0 100 100" width="100%" height="100%"><use href="#icon-chrome"></use></svg></div>
              <span style="font-size:1.1rem;color:#fff;">Google Chrome</span>
              <span style="font-size:0.75rem;color:#94a3b8;">Navegador</span>
            </div>

            <div class="drag-item-card" data-b="Microsoft Edge" style="flex-direction:column;padding:1.5rem;min-width:180px;cursor:pointer;">
              <div style="width:64px;height:64px;margin-bottom:0.5rem;"><svg viewBox="0 0 100 100" width="100%" height="100%"><use href="#icon-edge"></use></svg></div>
              <span style="font-size:1.1rem;color:#fff;">Microsoft Edge</span>
              <span style="font-size:0.75rem;color:#94a3b8;">Navegador</span>
            </div>

            <div class="drag-item-card" data-b="Mozilla Firefox" style="flex-direction:column;padding:1.5rem;min-width:180px;cursor:pointer;">
              <div style="width:64px;height:64px;margin-bottom:0.5rem;"><svg viewBox="0 0 100 100" width="100%" height="100%"><use href="#icon-firefox"></use></svg></div>
              <span style="font-size:1.1rem;color:#fff;">Mozilla Firefox</span>
              <span style="font-size:0.75rem;color:#94a3b8;">Navegador</span>
            </div>
          </div>
        </div>
      `;

      stageContent.querySelectorAll('.drag-item-card').forEach(card => {
        card.onclick = () => {
          sound.playCorrect();
          chosenBrowser = card.getAttribute('data-b');
          step2ChooseSearchEngine();
        };
      });
    }

    // PASO 2: Elegir buscador dentro del navegador
    function step2ChooseSearchEngine() {
      setNicoSpeech(
        `¡Excelente! Ya abriste <strong>${chosenBrowser}</strong>. Ahora, dentro de este navegador, necesitamos una herramienta para encontrar información sobre los océanos. <strong>¿Qué buscador usarás?</strong>`,
        'talking',
        'Paso 2: Elige el Buscador'
      );

      stageContent.innerHTML = `
        <div style="text-align:center;max-width:850px;margin:0 auto;width:100%;">
          <div style="margin-bottom:1.5rem;">
            <span style="background:rgba(245,158,11,0.2);color:#fde68a;padding:0.3rem 0.9rem;border-radius:20px;font-weight:800;font-size:0.85rem;">
              PASO 2 DE 5
            </span>
            <h3 style="color:#fff;font-size:1.4rem;margin:0.5rem 0;">Abre un Buscador Web</h3>
            <p style="color:#94a3b8;font-size:1rem;">Toca el buscador que quieres cargar dentro de ${chosenBrowser}:</p>
          </div>

          <div style="display:flex;justify-content:center;gap:2rem;flex-wrap:wrap;">
            <div class="drag-item-card" data-s="Google" style="flex-direction:column;padding:1.6rem 2.2rem;min-width:200px;cursor:pointer;">
              <div style="width:64px;height:64px;margin-bottom:0.5rem;"><svg viewBox="0 0 100 100" width="100%" height="100%"><use href="#icon-google"></use></svg></div>
              <span style="font-size:1.2rem;color:#fff;">Google</span>
              <span style="font-size:0.8rem;color:#94a3b8;">Buscador Web</span>
            </div>

            <div class="drag-item-card" data-s="Bing" style="flex-direction:column;padding:1.6rem 2.2rem;min-width:200px;cursor:pointer;">
              <div style="width:64px;height:64px;margin-bottom:0.5rem;"><svg viewBox="0 0 100 100" width="100%" height="100%"><use href="#icon-bing"></use></svg></div>
              <span style="font-size:1.2rem;color:#fff;">Bing</span>
              <span style="font-size:0.8rem;color:#94a3b8;">Buscador Web</span>
            </div>
          </div>
        </div>
      `;

      stageContent.querySelectorAll('.drag-item-card').forEach(card => {
        card.onclick = () => {
          sound.playCorrect();
          chosenSearch = card.getAttribute('data-s');
          step3BuildQuery();
        };
      });
    }

    // PASO 3: Construir la búsqueda
    function step3BuildQuery() {
      setNicoSpeech(
        `Estamos dentro de <strong>${chosenBrowser}</strong> utilizando <strong>${chosenSearch}</strong>. Ahora armemos la frase de búsqueda tocando las palabras clave.`,
        'idea',
        'Paso 3: Construye la Búsqueda'
      );

      const words = ['importancia', 'de', 'los', 'océanos', 'planeta'];
      const currentQuery = [];

      stageContent.innerHTML = `
        <div class="query-builder-box" style="max-width:800px;margin:0 auto;width:100%;">
          <div style="text-align:center;">
            <span style="background:rgba(6,182,212,0.2);color:#22d3ee;padding:0.3rem 0.9rem;border-radius:20px;font-weight:800;font-size:0.85rem;">
              PASO 3 DE 5 • DENTRO DE ${chosenBrowser.toUpperCase()}
            </span>
            <h3 style="color:#fff;font-size:1.35rem;margin:0.5rem 0;">Buscador ${chosenSearch}</h3>
          </div>

          <div class="query-drop-target" id="lvl6-query-box">
            <span style="color:#0284c7;font-size:1.1rem;">🔎</span>
            <span id="lvl6-placeholder" style="color:#94a3b8;font-style:italic;">Toca las palabras de abajo...</span>
          </div>

          <div class="available-words-pool">
            ${words.map(w => `<button class="word-pill-btn" data-w="${w}">${w}</button>`).join('')}
          </div>

          <button class="primary-btn" id="btn-lvl6-run-search" style="margin-top:1rem;">
            🔍 ENCONTRAR RESULTADOS
          </button>
        </div>
      `;

      const qBox = document.getElementById('lvl6-query-box');
      const runBtn = document.getElementById('btn-lvl6-run-search');

      stageContent.querySelectorAll('.word-pill-btn').forEach(btn => {
        btn.onclick = () => {
          sound.playSelect();
          const w = btn.getAttribute('data-w');
          currentQuery.push(w);
          qBox.innerHTML = `
            <span style="color:#0284c7;font-size:1.1rem;">🔎</span>
            ${currentQuery.map(item => `<span class="query-word-chip">${item}</span>`).join('')}
          `;
        };
      });

      runBtn.onclick = () => {
        if (currentQuery.length >= 2) {
          sound.playSearchScan();
          step4SelectResult();
        } else {
          sound.playWrong();
          setNicoSpeech('Agrega al menos un par de palabras clave para que el buscador encuentre la información.', 'thinking', 'Pista');
        }
      };
    }

    // PASO 4: Seleccionar el resultado ficticio idóneo
    function step4SelectResult() {
      setNicoSpeech(
        `¡${chosenSearch} encontró 4 resultados! Examínalos cuidadosamente y <strong>haz clic en el resultado que mejor responde a nuestra investigación científica</strong>.`,
        'talking',
        'Paso 4: Análisis de Resultados'
      );

      stageContent.innerHTML = `
        <div class="os-window" style="animation:window-pop 0.3s ease;max-width:900px;margin:0 auto;width:100%;">
          <div class="window-titlebar">
            <div class="window-controls">
              <span class="win-dot win-dot-red"></span>
              <span class="win-dot win-dot-yellow"></span>
              <span class="win-dot win-dot-green"></span>
            </div>
            <div class="window-title">
              <span>${chosenBrowser} ➔ Resultados en ${chosenSearch}</span>
            </div>
            <span style="font-size:0.8rem;color:#10b981;font-weight:700;">4 páginas encontradas</span>
          </div>

          <div class="window-viewport">
            <div class="search-results-container">
              <!-- Resultado A (El correcto) -->
              <div class="search-result-item" id="lvl6-res-correct" style="border-left:4px solid #3b82f6;">
                <div class="result-url">https://www.ciencias-marinas.org/investigacion/oceanos</div>
                <div class="result-title">🌊 ¿Por qué son vitales los océanos para la vida en la Tierra?</div>
                <div class="result-snippet">
                  Los océanos generan más del 50% del oxígeno del planeta, regulan el clima global y albergan la mayor biodiversidad del mundo. Informe educativo para estudiantes.
                </div>
              </div>

              <!-- Resultado B (Juegos) -->
              <div class="search-result-item" id="lvl6-res-game">
                <div class="result-url">https://www.juegos-gratis.net/tiburones</div>
                <div class="result-title">🎮 Juegos de tiburones hambrientos en 3D</div>
                <div class="result-snippet">
                  Juega online gratis a esquivar arrecifes con tu tiburón virtual. Diversión para todas las edades.
                </div>
              </div>

              <!-- Resultado C (Tienda) -->
              <div class="search-result-item" id="lvl6-res-store">
                <div class="result-url">https://www.tienda-acuarios.com</div>
                <div class="result-title">🛒 Compra peceras y sal marina con descuento</div>
                <div class="result-snippet">
                  Envíos a domicilio de acuarios de vidrio y filtros de agua salada para tu casa.
                </div>
              </div>

              <!-- Resultado D (Colorear) -->
              <div class="search-result-item" id="lvl6-res-draw">
                <div class="result-url">https://www.dibujitos.com/peces</div>
                <div class="result-title">🖍️ Dibujos infantiles de pececitos para colorear</div>
                <div class="result-snippet">
                  Descarga láminas para imprimir y pintar con crayolas.
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      const correctRes = document.getElementById('lvl6-res-correct');
      const gameRes = document.getElementById('lvl6-res-game');
      const storeRes = document.getElementById('lvl6-res-store');
      const drawRes = document.getElementById('lvl6-res-draw');

      const distractors = [gameRes, storeRes, drawRes];
      distractors.forEach(item => {
        item.onclick = () => {
          sound.playWrong();
          item.style.borderColor = '#ef4444';
          setNicoSpeech(
            'Ese resultado es entretenido o comercial, pero no responde a nuestra investigación científica sobre la importancia de los océanos. ¡Elige el informe educativo!',
            'thinking',
            'Pista de Relevancia'
          );
        };
      });

      correctRes.onclick = () => {
        sound.playCorrect();
        correctRes.style.background = '#dbeafe';
        step5SimulatedWebpage();
      };
    }

    // PASO 5: Página web simulada
    function step5SimulatedWebpage() {
      setNicoSpeech(
        '¡Eureka! El buscador encontró el enlace y el navegador acaba de cargar la página web. <strong>¡Ya estamos dentro de una página web real gracias a ambas herramientas!</strong>',
        'celebrating',
        'Paso 5: Información en Pantalla'
      );

      stageContent.innerHTML = `
        <div class="os-window" style="animation:window-pop 0.3s ease;max-width:900px;margin:0 auto;width:100%;">
          <div class="window-titlebar">
            <div class="window-controls">
              <span class="win-dot win-dot-red"></span>
              <span class="win-dot win-dot-yellow"></span>
              <span class="win-dot win-dot-green"></span>
            </div>
            <div class="window-title">
              <span>🌐 ${chosenBrowser} — www.ciencias-marinas.org</span>
            </div>
            <span style="font-size:0.8rem;color:#10b981;font-weight:700;">Seguro (SSL)</span>
          </div>

          <div class="window-url-bar">
            <span class="url-lock-icon">🔒</span>
            <div class="url-input-box">
              <span>https://www.ciencias-marinas.org/investigacion/oceanos</span>
            </div>
          </div>

          <div class="window-viewport">
            <div class="mockup-webpage">
              <div class="webpage-header-banner" style="background:linear-gradient(135deg,#0369a1,#0284c7);">
                <h2>🌊 PORTAL CIENTÍFICO MARINO</h2>
                <p>Investigación Oficial: La importancia de los océanos</p>
              </div>

              <div class="webpage-body-content">
                <p><strong>1. Pulmón del Planeta:</strong> El fitoplancton de los océanos produce más de la mitad del oxígeno que respiramos.</p>
                <p><strong>2. Regulador Térmico:</strong> Absorben el exceso de calor solar, manteniendo temperaturas habitables.</p>
                <p><strong>3. Hogar de la Vida:</strong> Albergan ecosistemas indispensables para el equilibrio ecológico mundial.</p>
              </div>

              <div style="margin-top:1.5rem;text-align:center;">
                <button class="primary-btn" id="btn-go-to-mastery" style="padding:0.9rem 2rem;font-size:1.1rem;">
                  🏆 IR AL RETO FINAL DE CLASIFICACIÓN
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      document.getElementById('btn-go-to-mastery').onclick = () => {
        sound.playSelect();
        step6MasteryClassification();
      };
    }

    // RETO FINAL: Clasificar las 5 herramientas
    function step6MasteryClassification() {
      setNicoSpeech(
        '¡La prueba definitiva de graduación! Arrastra o toca cada una de las <strong>5 herramientas</strong> y colócala en su zona correspondiente: <strong>NAVEGADORES</strong> o <strong>BUSCADORES</strong>.',
        'idea',
        'Reto Final de Maestría'
      );
      setHint('Navegadores: Chrome, Edge, Firefox. Buscadores: Google, Bing.');

      const tools = [
        { id: 'tool-chrome', name: 'Google Chrome', icon: 'icon-chrome', category: 'browser' },
        { id: 'tool-edge', name: 'Microsoft Edge', icon: 'icon-edge', category: 'browser' },
        { id: 'tool-firefox', name: 'Mozilla Firefox', icon: 'icon-firefox', category: 'browser' },
        { id: 'tool-google', name: 'Google', icon: 'icon-google', category: 'search' },
        { id: 'tool-bing', name: 'Bing', icon: 'icon-bing', category: 'search' }
      ];

      // Desordenar
      const shuffledTools = [...tools].sort(() => Math.random() - 0.5);
      let selectedTool = null;
      const classified = { browser: [], search: [] };

      stageContent.innerHTML = `
        <div class="drag-workbench">
          <div style="text-align:center;">
            <h3 style="color:#fff;font-size:1.4rem;margin-bottom:0.3rem;">🧠 Clasificación de Maestría Digital</h3>
            <p style="color:#94a3b8;font-size:1rem;">Toca una tarjeta y luego toca la zona donde pertenece (o arrástrala):</p>
          </div>

          <!-- Pool de herramientas -->
          <div class="draggable-cards-pool" id="lvl6-pool">
            ${shuffledTools.map(t => `
              <div class="drag-item-card" draggable="true" data-id="${t.id}" data-cat="${t.category}">
                <div style="width:32px;height:32px;"><svg viewBox="0 0 100 100" width="100%" height="100%"><use href="#${t.icon}"></use></svg></div>
                <span>${t.name}</span>
              </div>
            `).join('')}
          </div>

          <!-- Dos Zonas Magnéticas -->
          <div class="drop-zones-container">
            <!-- Zona Navegadores -->
            <div class="drop-zone" id="zone-browsers" data-accept="browser">
              <div class="drop-zone-header">
                <h3>🌐 ZONA NAVEGADORES</h3>
                <p>Permiten entrar y utilizar páginas web</p>
              </div>
              <div class="drop-zone-cards-list" id="list-browsers"></div>
            </div>

            <!-- Zona Buscadores -->
            <div class="drop-zone" id="zone-searches" data-accept="search">
              <div class="drop-zone-header">
                <h3>🔎 ZONA BUSCADORES</h3>
                <p>Ayudan a encontrar información en Internet</p>
              </div>
              <div class="drop-zone-cards-list" id="list-searches"></div>
            </div>
          </div>
        </div>
      `;

      const poolEl = document.getElementById('lvl6-pool');
      const zoneBrowsers = document.getElementById('zone-browsers');
      const zoneSearches = document.getElementById('zone-searches');
      const listBrowsers = document.getElementById('list-browsers');
      const listSearches = document.getElementById('list-searches');

      function bindToolInteractions() {
        const cards = stageContent.querySelectorAll('.drag-item-card');

        cards.forEach(card => {
          card.onclick = (e) => {
            e.stopPropagation();
            sound.playSelect();
            cards.forEach(c => c.classList.remove('is-selected'));
            selectedTool = card;
            card.classList.add('is-selected');
          };

          card.ondragstart = (e) => {
            sound.playSelect();
            selectedTool = card;
            card.classList.add('is-dragging');
            e.dataTransfer.setData('text/plain', card.getAttribute('data-id'));
          };

          card.ondragend = () => {
            card.classList.remove('is-dragging');
          };
        });
      }

      bindToolInteractions();

      [zoneBrowsers, zoneSearches].forEach(zone => {
        zone.onclick = () => {
          if (!selectedTool) return;
          processDrop(selectedTool, zone);
        };

        zone.ondragover = (e) => {
          e.preventDefault();
          zone.classList.add('zone-hover');
        };

        zone.ondragleave = () => {
          zone.classList.remove('zone-hover');
        };

        zone.ondrop = (e) => {
          e.preventDefault();
          zone.classList.remove('zone-hover');
          if (selectedTool) {
            processDrop(selectedTool, zone);
          }
        };
      });

      function processDrop(card, targetZone) {
        const cardCat = card.getAttribute('data-cat');
        const zoneAccept = targetZone.getAttribute('data-accept');

        if (cardCat === zoneAccept) {
          sound.playCorrect();
          const targetList = zoneAccept === 'browser' ? listBrowsers : listSearches;
          targetList.appendChild(card);
          card.classList.remove('is-selected');
          card.setAttribute('draggable', 'false');
          card.onclick = null;
          selectedTool = null;

          if (zoneAccept === 'browser') {
            classified.browser.push(card.getAttribute('data-id'));
          } else {
            classified.search.push(card.getAttribute('data-id'));
          }

          // Verificar si las 5 herramientas fueron clasificadas
          if (classified.browser.length === 3 && classified.search.length === 2) {
            triggerFinalMasterySuccess();
          }
        } else {
          sound.playWrong();
          card.classList.remove('is-selected');
          selectedTool = null;

          let feedbackText = zoneAccept === 'browser' 
            ? '¡Cuidado! Esa herramienta no es un navegador; es un buscador que ayuda a encontrar información.' 
            : '¡Cuidado! Esa herramienta no es un buscador; es un navegador que permite acceder a páginas web.';

          setNicoSpeech(feedbackText, 'thinking', 'Pista de Clasificación');
        }
      }

      function triggerFinalMasterySuccess() {
        sound.playCorrect();
        setNicoSpeech(
          '¡CASO TOTALMENTE RESUELTO! Eres oficialmente un Detective Digital Experto.',
          'celebrating',
          '¡VICTORIA TOTAL!'
        );

        setTimeout(() => {
          showLevelCompleteModal(
            6,
            `
              <strong>¡DOMINIO COMPLETO ALCANZADO!</strong><br>
              🌐 <strong>NAVEGADORES:</strong> Chrome, Edge, Firefox ➔ Para entrar y utilizar páginas web.<br>
              🔎 <strong>BUSCADORES:</strong> Google, Bing ➔ Para encontrar información en Internet.<br>
              <em>"Para investigar en Internet puedo utilizar un navegador y dentro de él utilizar un buscador."</em>
            `,
            '¡Misión Final Completada con Éxito!'
          );
        }, 1500);
      }
    }

    step1ChooseBrowser();
  }

  /* =====================================================================
     8. EVENT LISTENERS GENERALES Y VINCULACIÓN DE BOTONES
     ===================================================================== */
  // Botones de inicio
  const btnStart = document.getElementById('btn-start-game');
  const btnHowTo = document.getElementById('btn-how-to-play');

  if (btnStart) {
    btnStart.onclick = () => {
      sound.playSelect();
      switchView('map');
    };
  }

  if (btnHowTo) {
    btnHowTo.onclick = openTutorialModal;
  }

  // Modales
  document.getElementById('btn-close-hint')?.addEventListener('click', closeHintModal);
  document.getElementById('btn-understood-hint')?.addEventListener('click', closeHintModal);
  document.getElementById('btn-close-tutorial')?.addEventListener('click', closeTutorialModal);
  document.getElementById('btn-close-tutorial-ok')?.addEventListener('click', closeTutorialModal);

  document.getElementById('btn-back-to-map-from-modal')?.addEventListener('click', () => {
    sound.playClick();
    completeModal.classList.remove('modal-active');
    switchView('map');
  });

  // HUD
  hud.btnHint.onclick = openHintModal;
  hud.btnMapNav.onclick = () => {
    sound.playClick();
    switchView('map');
  };

  hud.btnAudio.onclick = () => {
    const isNowOn = sound.toggle();
    hud.soundIcon.textContent = isNowOn ? '🔊' : '🔇';
    hud.soundLabel.textContent = isNowOn ? 'ON' : 'OFF';
  };

  // Botones de las tarjetas del mapa
  document.querySelectorAll('.card-play-btn').forEach(btn => {
    btn.onclick = () => {
      sound.playSelect();
      const lvl = parseInt(btn.getAttribute('data-level'), 10);
      loadLevel(lvl);
    };
  });

  // Botones de la pantalla final
  const btnPrint = document.getElementById('btn-print-diploma');
  const btnRestart = document.getElementById('btn-restart-game');
  const btnMapFromFinal = document.getElementById('btn-return-map-from-final');
  const dateLabel = document.getElementById('diploma-date-label');

  if (dateLabel) {
    const now = new Date();
    dateLabel.textContent = `Fecha: ${now.toLocaleDateString()}`;
  }

  if (btnPrint) {
    btnPrint.onclick = () => {
      sound.playSelect();
      window.print();
    };
  }

  if (btnRestart) {
    btnRestart.onclick = () => {
      sound.playClick();
      if (confirm('¿Deseas reiniciar tu progreso de detective para empezar de nuevo?')) {
        localStorage.removeItem('detectives_unlocked_level');
        localStorage.removeItem('detectives_stars');
        gameState.unlockedLevels = 1;
        gameState.levelStars = [0, 0, 0, 0, 0, 0];
        gameState.saveProgress();
        switchView('intro');
      }
    };
  }

  if (btnMapFromFinal) {
    btnMapFromFinal.onclick = () => {
      sound.playClick();
      switchView('map');
    };
  }

  // Inicializar estado del botón de sonido según guardado
  if (!sound.enabled) {
    hud.soundIcon.textContent = '🔇';
    hud.soundLabel.textContent = 'OFF';
  }

  // Mostrar vista inicial al cargar
  switchView('intro');

})();
