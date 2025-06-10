window.addEventListener("DOMContentLoaded", () => {
  const title = document.querySelector("h1");
  if (title) {
    title.classList.add("title-bounce");
  }
});

// Paramètres de base pour chaque jauge (0 = vide, 100 = plein)
const DEFAULT_STATE = {
  hunger: 100,
  energy: 100,
  affection: 100,
};

const DEFAULT_STATS = {
  adoptedAt: Date.now(), // Timestamp du début de l’aventure
  feedCount: 0,
  sleepCount: 0,
  cuddleCount: 0,
  lastAction: null,
};

// Paramètres de chute pour chaque jauge
const DECAY_SETTINGS = {
  hunger: { interval: 90000, amount: 3 }, // toutes les 1,5 min, baisse de 3
  energy: { interval: 180000, amount: 2 }, // toutes les 3 min, baisse de 2
  affection: { interval: 240000, amount: 1 }, // toutes les 4 min, baisse de 1
};

const ACTION_EMOJIS = {
  hunger: ["🍗", "🥩", "🍣", "🍕", "🥫", "🥕", "🧀", "🥐", "🍞", "🥚", "🥛"],
  energy: ["😴", "💤", "🛌", "🌙", "☁️", "🪶"],
  affection: ["💖", "💗", "🥰", "😽", "💝", "🧡", "💞", "😻", "❤️"],
};

function decayGauge(jauge) {
  state[jauge] = Math.max(0, state[jauge] - DECAY_SETTINGS[jauge].amount);
  updateGauges();
  saveState(state);
  updateMood();
}

function loadStats() {
  const saved = localStorage.getItem("abricot-stats");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return { ...DEFAULT_STATS };
    }
  }
  return { ...DEFAULT_STATS };
}

function saveStats(stats) {
  localStorage.setItem("abricot-stats", JSON.stringify(stats));
}

let stats = loadStats();

const SPRITES = {
  content: [
    "assets/img/abricot-content.png",
    "assets/img/abricot-content-2.png",
    "assets/img/abricot-content-3.png",
    "assets/img/abricot-content-4.png",
  ],
  waiting: [
    "assets/img/abricot-waiting.png",
    "assets/img/abricot-waiting-2.png",
    "assets/img/abricot-waiting-3.png",
    "assets/img/abricot-waiting-4.png",
  ],
  sad: [
    "assets/img/abricot-sad.png",
    "assets/img/abricot-sad-2.png",
    "assets/img/abricot-sad-3.png",
    "assets/img/abricot-sad-4.png",
  ],
  ill: [
    "assets/img/abricot-ill.png",
    "assets/img/abricot-ill-2.png",
    "assets/img/abricot-ill-3.png",
    "assets/img/abricot-ill-4.png",
  ],
};

let soundEnabled = true;

function randomSprite(stateName) {
  const list = SPRITES[stateName];
  return list[Math.floor(Math.random() * list.length)];
}

// Récupère l'état sauvegardé (ou les valeurs par défaut)
function loadState() {
  const saved = localStorage.getItem("abricochi-state");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return { ...DEFAULT_STATE };
    }
  }
  return { ...DEFAULT_STATE };
}

// Sauvegarde l'état dans le localStorage
function saveState(state) {
  localStorage.setItem("abricochi-state", JSON.stringify(state));
}

// On initialise l'état du jeu au chargement
let state = loadState();

// Référence aux éléments DOM des jauges
const hungerBar = document.getElementById("hunger");
const energyBar = document.getElementById("energy");
const affectionBar = document.getElementById("affection");

// Fonction qui affiche les jauges dans l’UI
function updateGauges() {
  hungerBar.value = state.hunger;
  energyBar.value = state.energy;
  affectionBar.value = state.affection;
}

// Au démarrage, on met à jour les jauges et on sauvegarde l’état
updateGauges();
saveState(state);

// Paramètres : vitesse de baisse (en ms) et quantité à décrémenter
const DECAY_INTERVAL = 90000; // toutes les 2 secondes (je pense)
const DECAY_AMOUNT = 2; // chaque jauge baisse de 2 à chaque tick

// Fonction appelée régulièrement pour baisser les jauges
function decayGauges() {
  state.hunger = Math.max(0, state.hunger - DECAY_AMOUNT);
  state.energy = Math.max(0, state.energy - DECAY_AMOUNT);
  state.affection = Math.max(0, state.affection - DECAY_AMOUNT);

  updateGauges();
  saveState(state);
  updateMood();
}

Object.keys(DECAY_SETTINGS).forEach((jauge) => {
  setInterval(() => decayGauge(jauge), DECAY_SETTINGS[jauge].interval);
});

// Paramètres d’augmentation par action
const ACTION_AMOUNT = 25;

// Fonction générique d'action
function performAction(jauge) {
  state[jauge] = Math.min(100, state[jauge] + ACTION_AMOUNT);
  updateGauges();
  saveState(state);
  updateMood();
  showActionFeedback(jauge);
  animateGauge(jauge);

  // Joue les sons et animations comme avant
  // Sons et animations…
  if (jauge === "hunger") {
    playSound("sound-eat");
    stats.feedCount++;
    stats.lastAction = "Nourri Abricot";
  } else if (jauge === "energy") {
    playSound("sound-sleep");
    stats.sleepCount++;
    stats.lastAction = "Abricot a dormi";
  } else if (jauge === "affection") {
    playSound("sound-meow");
    playSpriteAnimation("bounce");
    stats.cuddleCount++;
    stats.lastAction = "Câliné Abricot";
    launchConfetti("affection");
  }
  saveStats(stats);
  updateStatsDisplay();
}

// Lier chaque bouton à son action
document
  .getElementById("feed-btn")
  .addEventListener("click", () => performAction("hunger"));
document
  .getElementById("sleep-btn")
  .addEventListener("click", () => performAction("energy"));
document
  .getElementById("cuddle-btn")
  .addEventListener("click", () => performAction("affection"));

function playSpriteAnimation(animationClass) {
  const sprite = document.getElementById("abricot-sprite");
  // Enlève toute ancienne animation
  sprite.classList.remove("wiggle", "tremble", "bounce");
  // Forcer le reflow pour rejouer l'animation même si même humeur
  void sprite.offsetWidth;
  // Ajoute la nouvelle
  sprite.classList.add(animationClass);
}

// Met à jour l'humeur d'Abricot (message et sprite si dispo)
function updateMood() {
  const message = document.getElementById("abrico-message");
  const sprite = document.getElementById("abricot-sprite");

  // Cherche la jauge la plus basse
  const min = Math.min(state.hunger, state.energy, state.affection);

  if (min > 60) {
    message.textContent = "Abricot ronronne de bonheur !";
    sprite.alt = "Abricot heureux";
    sprite.src = sprite.src = randomSprite("content");
    playSpriteAnimation("wiggle");
  } else if (min > 30) {
    message.textContent = "Abricot attend un peu d'attention...";
    sprite.alt = "Abricot pensif";
    sprite.src = randomSprite("waiting");
  } else if (min > 10) {
    message.textContent = "Abricot fait la tête, il a besoin de toi !";
    sprite.alt = "Abricot triste";
    sprite.src = randomSprite("sad");
    playSpriteAnimation("tremble");
  } else {
    message.textContent = "Abricot dépérit... vite, occupe-toi de lui !";
    sprite.alt = "Abricot très triste";
    sprite.src = randomSprite("ill");
    playSpriteAnimation("tremble");
  }

  // Badge d’alerte si état critique
  const badge = document.getElementById("alert-badge");
  if (min <= 10) {
    badge.innerHTML = "&#9888;"; // Emoji alerte ⚠️
    badge.classList.add("active");
  } else {
    badge.innerHTML = "";
    badge.classList.remove("active");
  }

  // Animation de la carte si état critique
  const container = document.querySelector(".container");
  if (min <= 10) {
    container.classList.add("card-alert");
  } else {
    container.classList.remove("card-alert");
  }
}

updateMood();

function showActionFeedback(type) {
  const feedback = document.getElementById("action-feedback");
  let icons = ACTION_EMOJIS[type] || ["✨"];
  // Tire un emoji au hasard dans la liste
  let icon = icons[Math.floor(Math.random() * icons.length)];
  feedback.textContent = icon;
  feedback.classList.remove("show");
  void feedback.offsetWidth;
  feedback.classList.add("show");
  setTimeout(() => {
    feedback.classList.remove("show");
    feedback.textContent = "";
  }, 800);
}

function playSound(id) {
  if (!soundEnabled) return;
  const audio = document.getElementById(id);
  if (!audio) return;
  // Volume personnalisé
  if (id === "sound-sleep") {
    audio.volume = 0.25; // 50% du volume
  } else {
    audio.volume = 1.0; // 100% pour les autres
  }
  audio.currentTime = 0;
  audio.play();
}

// Chargement de l'état du son depuis le localStorage
function loadSoundSetting() {
  const stored = localStorage.getItem("abricot-sound-enabled");
  soundEnabled = stored === null ? true : stored === "true";
  updateSoundToggle();
}

function updateSoundToggle() {
  const btn = document.getElementById("sound-toggle");
  if (!btn) return;
  btn.setAttribute("aria-pressed", soundEnabled);
  btn.textContent = soundEnabled ? "🔊" : "🔈";
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem("abricot-sound-enabled", soundEnabled);
  updateSoundToggle();
}

// Ajoute l’écouteur sur le bouton (à la fin du script)
document.getElementById("sound-toggle").addEventListener("click", toggleSound);

// Initialise au chargement
loadSoundSetting();

function formatDuration(ms) {
  // Retourne une durée humaine ex: "1j 2h 5min"
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  let str = "";
  if (days) str += `${days}j `;
  if (hours) str += `${hours}h `;
  str += `${mins}min`;
  return str;
}

function updateStatsDisplay() {
  const now = Date.now();
  document.getElementById(
    "stat-adopted"
  ).textContent = `Adopté·e depuis ${formatDuration(now - stats.adoptedAt)}`;
  document.getElementById(
    "stat-feed"
  ).textContent = `Nourri·e ${stats.feedCount} fois`;
  document.getElementById(
    "stat-sleep"
  ).textContent = `A dormi ${stats.sleepCount} fois`;
  document.getElementById(
    "stat-cuddle"
  ).textContent = `Câliné·e ${stats.cuddleCount} fois`;
  document.getElementById("stat-last").textContent = stats.lastAction
    ? `Dernière action : ${stats.lastAction}`
    : "";
}

document.getElementById("reset-stats").addEventListener("click", () => {
  stats = { ...DEFAULT_STATS, adoptedAt: Date.now() };
  saveStats(stats);
  updateStatsDisplay();
});

function animateGauge(jauge) {
  let bar;
  if (jauge === "hunger") bar = document.getElementById("hunger");
  if (jauge === "energy") bar = document.getElementById("energy");
  if (jauge === "affection") bar = document.getElementById("affection");
  if (!bar) return;
  bar.classList.remove("gauge-anim");
  void bar.offsetWidth; // Forcer le reflow pour rejouer l'anim
  bar.classList.add("gauge-anim");
  setTimeout(() => bar.classList.remove("gauge-anim"), 500); // Retire après anim
}

const BG_PARTICLES = ["💖", "✨", "🩷", "💜", "💙", "⭐", "🌸", "🤍"]; // Mets ce que tu veux !

function spawnBgParticle() {
  const container = document.getElementById("bg-confetti");
  if (!container) return;
  const el = document.createElement("span");
  el.className = "bg-particle";
  el.textContent =
    BG_PARTICLES[Math.floor(Math.random() * BG_PARTICLES.length)];
  // Position de départ aléatoire
  const left = Math.random() * 100;
  el.style.left = left + "vw";
  el.style.top = "-3vh";
  el.style.fontSize = 1.1 + Math.random() * 2.2 + "rem";
  el.style.opacity = 0.38 + Math.random() * 0.37;
  // Animation vers le bas
  const duration = 5000 + Math.random() * 5000; // entre 5s et 10s
  el.animate(
    [
      { transform: "translateY(0) scale(1)", opacity: el.style.opacity },
      {
        transform: `translateY(${110 + Math.random() * 8}vh) scale(${
          0.85 + Math.random() * 0.3
        })`,
        opacity: 0,
      },
    ],
    {
      duration,
      easing: "linear",
      fill: "forwards",
    }
  );
  container.appendChild(el);
  setTimeout(() => el.remove(), duration + 500);
}

// Lance la pluie en continu
setInterval(spawnBgParticle, 200); // plus bas = plus de confettis
