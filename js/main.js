// Paramètres de base pour chaque jauge (0 = vide, 100 = plein)
const DEFAULT_STATE = {
  hunger: 100,
  energy: 100,
  affection: 100,
};

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

// Lancement du timer
setInterval(decayGauges, DECAY_INTERVAL);

// Paramètres d’augmentation par action
const ACTION_AMOUNT = 25;

// Fonction générique d'action
function performAction(jauge) {
  state[jauge] = Math.min(100, state[jauge] + ACTION_AMOUNT);
  updateGauges();
  saveState(state);
  updateMood();
  showActionFeedback(jauge);
  if (jauge === "affection") {
    playSpriteAnimation("bounce");
  }
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
  let icon = "✨";
  if (type === "hunger") icon = "🍓";
  else if (type === "energy") icon = "💤";
  else if (type === "affection") icon = "💖";
  feedback.textContent = icon;
  feedback.classList.remove("show"); // Si l’animation est déjà en cours
  void feedback.offsetWidth; // Pour forcer le reflow et rejouer l’anim
  feedback.classList.add("show");
  // Optionnel : efface après l’animation pour éviter les soucis
  setTimeout(() => {
    feedback.classList.remove("show");
    feedback.textContent = "";
  }, 800);
}
