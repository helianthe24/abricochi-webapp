window.addEventListener('DOMContentLoaded', () => {
  const title = document.querySelector('h1')
  if (title) {
    title.classList.add('title-bounce')
  }
})

// Paramètres de base pour chaque jauge (0 = vide, 100 = plein)
const DEFAULT_STATE = {
  hunger: 100,
  energy: 100,
  affection: 100,
}

const DEFAULT_STATS = {
  adoptedAt: Date.now(), // Timestamp du début de l'aventure
  feedCount: 0,
  sleepCount: 0,
  cuddleCount: 0,
  lastAction: null,
}

// ===== SYSTÈME DE VIE ET MORT =====
const DEATH_TIMER_DURATION = 180000 // 3 minutes en millisecondes
let deathTimer = null
let catName = null
let isDead = false

// Fonctions de gestion du nom et de la vie
function loadCatName() {
  const saved = localStorage.getItem('catName')
  if (saved) {
    catName = saved
  } else {
    // Première visite - demander le nom
    let name = prompt('🐱 Comment voulez-vous appeler votre chat ?', 'Abricot')
    if (!name || name.trim() === '') {
      name = 'Abricot' // Nom par défaut
    }
    catName = name.trim()
    localStorage.setItem('catName', catName)
  }
  updateCatNameInUI()
}

function updateCatNameInUI() {
  const title = document.querySelector('h1')
  if (title && catName) {
    title.textContent = `Prends soin de ${catName}`
  }
}

function loadGraveyard() {
  const saved = localStorage.getItem('graveyard')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return []
    }
  }
  return []
}

function saveToGraveyard(deadCat) {
  const graveyard = loadGraveyard()
  graveyard.push(deadCat)
  localStorage.setItem('graveyard', JSON.stringify(graveyard))
}

function checkForDeath() {
  if (isDead) return

  const hasZeroGauge =
    state.hunger === 0 || state.energy === 0 || state.affection === 0

  if (hasZeroGauge && !deathTimer) {
    // Commence le timer de mort
    deathTimer = setTimeout(() => {
      killCat()
    }, DEATH_TIMER_DURATION)
  } else if (!hasZeroGauge && deathTimer) {
    // Annule le timer si toutes les jauges sont > 0
    clearTimeout(deathTimer)
    deathTimer = null
  }
}

function killCat() {
  isDead = true

  // Calcule l'âge du chat
  const age = formatDuration(Date.now() - stats.adoptedAt)

  // Sauvegarde dans le cimetière
  const deadCat = {
    name: catName,
    age: age,
    dateOfDeath: new Date().toISOString(),
  }
  saveToGraveyard(deadCat)

  // Affiche l'écran de mort
  showDeathScreen()

  // Met à jour l'affichage du cimetière avec animation
  updateGraveyardDisplay(true)
}

function showDeathScreen() {
  const message = document.getElementById('abrico-message')
  const sprite = document.getElementById('abricot-sprite')
  const container = document.querySelector('.container')

  // Change l'apparence
  message.textContent = `${catName} est mort·e... 🪦`
  sprite.src = 'assets/img/abricot-ill.png' // Utilise le sprite malade
  sprite.alt = `${catName} est mort·e`

  // Désactive les boutons d'action
  document.getElementById('feed-btn').disabled = true
  document.getElementById('sleep-btn').disabled = true
  document.getElementById('cuddle-btn').disabled = true

  // Ajoute un bouton de redémarrage
  const restartBtn = document.createElement('button')
  restartBtn.textContent = '🌟 Adopter un nouveau chat'
  restartBtn.style.marginTop = '1rem'
  restartBtn.style.backgroundColor = '#ff6b6b'
  restartBtn.style.color = 'white'
  restartBtn.addEventListener('click', restartGame)

  const actions = document.querySelector('.actions')
  actions.appendChild(restartBtn)
}

function restartGame() {
  // Remet à zéro l'état du jeu
  isDead = false
  if (deathTimer) {
    clearTimeout(deathTimer)
    deathTimer = null
  }

  // Remet les jauges à 100
  state.hunger = 100
  state.energy = 100
  state.affection = 100

  // Remet les stats à zéro
  stats = { ...DEFAULT_STATS, adoptedAt: Date.now() }

  // Demande un nouveau nom
  localStorage.removeItem('catName')
  loadCatName()

  // Sauvegarde
  saveState(state)
  saveStats(stats)

  // Réactive les boutons
  document.getElementById('feed-btn').disabled = false
  document.getElementById('sleep-btn').disabled = false
  document.getElementById('cuddle-btn').disabled = false

  // Supprime le bouton de redémarrage
  const restartBtn = document.querySelector('.actions button[style*="ff6b6b"]')
  if (restartBtn) {
    restartBtn.remove()
  }

  // Met à jour l'interface
  updateGauges()
  updateMood()
  updateStatsDisplay()
}

// Paramètres de chute pour chaque jauge
const DECAY_SETTINGS = {
  hunger: { interval: 90000, amount: 3 }, // toutes les 1,5 min, baisse de 3
  energy: { interval: 180000, amount: 2 }, // toutes les 3 min, baisse de 2
  affection: { interval: 240000, amount: 1 }, // toutes les 4 min, baisse de 1
}

const ACTION_EMOJIS = {
  hunger: ['🍗', '🥩', '🍣', '🍕', '🥫', '🥕', '🧀', '🥐', '🍞', '🥚', '🥛'],
  energy: ['😴', '💤', '🛌', '🌙', '☁️', '🪶'],
  affection: ['💖', '💗', '🥰', '😽', '💝', '🧡', '💞', '😻', '❤️'],
}

function decayGauge(jauge) {
  state[jauge] = Math.max(0, state[jauge] - DECAY_SETTINGS[jauge].amount)
  updateGauges()
  saveState(state)
  updateMood()
  checkForDeath() // Vérifie si le chat doit mourir
}

function loadStats() {
  const saved = localStorage.getItem('abricot-stats')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return { ...DEFAULT_STATS }
    }
  }
  return { ...DEFAULT_STATS }
}

function saveStats(stats) {
  localStorage.setItem('abricot-stats', JSON.stringify(stats))
}

let stats = loadStats()

const SPRITES = {
  content: [
    'assets/img/abricot-content.png',
    'assets/img/abricot-content-2.png',
    'assets/img/abricot-content-3.png',
    'assets/img/abricot-content-4.png',
  ],
  waiting: [
    'assets/img/abricot-waiting.png',
    'assets/img/abricot-waiting-2.png',
    'assets/img/abricot-waiting-3.png',
    'assets/img/abricot-waiting-4.png',
  ],
  sad: [
    'assets/img/abricot-sad.png',
    'assets/img/abricot-sad-2.png',
    'assets/img/abricot-sad-3.png',
    'assets/img/abricot-sad-4.png',
  ],
  ill: [
    'assets/img/abricot-ill.png',
    'assets/img/abricot-ill-2.png',
    'assets/img/abricot-ill-3.png',
    'assets/img/abricot-ill-4.png',
  ],
}

let soundEnabled = true

function randomSprite(stateName) {
  const list = SPRITES[stateName]
  return list[Math.floor(Math.random() * list.length)]
}

// Récupère l'état sauvegardé (ou les valeurs par défaut)
function loadState() {
  const saved = localStorage.getItem('abricochi-state')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return { ...DEFAULT_STATE }
    }
  }
  return { ...DEFAULT_STATE }
}

// Sauvegarde l'état dans le localStorage
function saveState(state) {
  localStorage.setItem('abricochi-state', JSON.stringify(state))
}

// On initialise l'état du jeu au chargement
let state = loadState()

// Référence aux éléments DOM des jauges
const hungerBar = document.getElementById('hunger')
const energyBar = document.getElementById('energy')
const affectionBar = document.getElementById('affection')

// Fonction qui affiche les jauges dans l'UI
function updateGauges() {
  hungerBar.value = state.hunger
  energyBar.value = state.energy
  affectionBar.value = state.affection
}

// Au démarrage, on met à jour les jauges et on sauvegarde l'état
updateGauges()
saveState(state)

// Initialise le nom du chat
loadCatName()

// Paramètres : vitesse de baisse (en ms) et quantité à décrémenter
const DECAY_INTERVAL = 90000 // toutes les 2 secondes (je pense)
const DECAY_AMOUNT = 2 // chaque jauge baisse de 2 à chaque tick

// Fonction appelée régulièrement pour baisser les jauges
function decayGauges() {
  state.hunger = Math.max(0, state.hunger - DECAY_AMOUNT)
  state.energy = Math.max(0, state.energy - DECAY_AMOUNT)
  state.affection = Math.max(0, state.affection - DECAY_AMOUNT)

  updateGauges()
  saveState(state)
  updateMood()
}

Object.keys(DECAY_SETTINGS).forEach((jauge) => {
  setInterval(() => decayGauge(jauge), DECAY_SETTINGS[jauge].interval)
})

// Paramètres d'augmentation par action
const ACTION_AMOUNT = 25

// ===== LOGIQUE D'APPLICATION DES ACTIONS =====
function canApplyAction(type) {
  // Vérifie si l'action peut avoir un effet (jauge pas déjà pleine)
  switch (type) {
    case 'hunger':
      return state.hunger < 100
    case 'energy':
      return state.energy < 100
    case 'affection':
      return state.affection < 100
    default:
      return false
  }
}

// ===== SYSTÈME DE COOLDOWN ANTI-SPAM =====
const COOLDOWN_DURATION = 2000 // 2 secondes en millisecondes
const buttonCooldowns = {
  hunger: false,
  energy: false,
  affection: false,
}

// Fonction pour désactiver un bouton temporairement
function setCooldown(actionType, buttonId) {
  if (buttonCooldowns[actionType]) return // Déjà en cooldown

  const button = document.getElementById(buttonId)
  if (!button) return

  // Marque le cooldown comme actif
  buttonCooldowns[actionType] = true

  // Désactive visuellement le bouton
  button.disabled = true
  button.style.opacity = '0.5'
  button.style.cursor = 'not-allowed'

  // Réactive le bouton après le cooldown
  setTimeout(() => {
    buttonCooldowns[actionType] = false
    button.disabled = false
    button.style.opacity = ''
    button.style.cursor = ''
  }, COOLDOWN_DURATION)
}

// Fonction générique d'action avec cooldown
function performAction(jauge) {
  // Vérifie si l'action est en cooldown
  if (buttonCooldowns[jauge]) {
    return // Ignore l'action si en cooldown
  }

  // Détermine quel bouton désactiver
  let buttonId
  if (jauge === 'hunger') buttonId = 'feed-btn'
  else if (jauge === 'energy') buttonId = 'sleep-btn'
  else if (jauge === 'affection') buttonId = 'cuddle-btn'

  // Active le cooldown pour ce bouton (même si la jauge est pleine)
  setCooldown(jauge, buttonId)

  // Vérifie si l'action peut avoir un effet
  if (!canApplyAction(jauge)) {
    // La jauge est déjà pleine, on ne fait rien d'autre
    return
  }

  // Exécute l'action seulement si la jauge peut être augmentée
  state[jauge] = Math.min(100, state[jauge] + ACTION_AMOUNT)
  updateGauges()
  saveState(state)
  updateMood()
  showActionFeedback(jauge)
  animateGauge(jauge)

  // Joue les sons et animations seulement si l'action a eu un effet
  if (jauge === 'hunger') {
    playSound('sound-eat')
    stats.feedCount++
    stats.lastAction = `Nourri ${catName}`
  } else if (jauge === 'energy') {
    playSound('sound-sleep')
    stats.sleepCount++
    stats.lastAction = `${catName} a dormi`
  } else if (jauge === 'affection') {
    playSound('sound-meow')
    playSpriteAnimation('bounce')
    stats.cuddleCount++
    stats.lastAction = `Câliné ${catName}`
    launchConfetti('affection')
  }
  saveStats(stats)
  updateStatsDisplay()
}

// Lier chaque bouton à son action
document
  .getElementById('feed-btn')
  .addEventListener('click', () => performAction('hunger'))
document
  .getElementById('sleep-btn')
  .addEventListener('click', () => performAction('energy'))
document
  .getElementById('cuddle-btn')
  .addEventListener('click', () => performAction('affection'))

function playSpriteAnimation(animationClass) {
  const sprite = document.getElementById('abricot-sprite')
  // Enlève toute ancienne animation
  sprite.classList.remove('wiggle', 'tremble', 'bounce')
  // Forcer le reflow pour rejouer l'animation même si même humeur
  void sprite.offsetWidth
  // Ajoute la nouvelle
  sprite.classList.add(animationClass)
}

// Met à jour l'humeur d'Abricot (message et sprite si dispo)
function updateMood() {
  const message = document.getElementById('abrico-message')
  const sprite = document.getElementById('abricot-sprite')

  // Cherche la jauge la plus basse
  const min = Math.min(state.hunger, state.energy, state.affection)

  if (min > 60) {
    message.textContent = `${catName} ronronne de bonheur !`
    sprite.alt = `${catName} heureux`
    sprite.src = sprite.src = randomSprite('content')
    playSpriteAnimation('wiggle')
  } else if (min > 30) {
    message.textContent = `${catName} attend un peu d'attention...`
    sprite.alt = `${catName} pensif`
    sprite.src = randomSprite('waiting')
  } else if (min > 10) {
    message.textContent = `${catName} fait la tête, il a besoin de toi !`
    sprite.alt = `${catName} triste`
    sprite.src = randomSprite('sad')
    playSpriteAnimation('tremble')
  } else {
    message.textContent = `${catName} dépérit... vite, occupe-toi de lui !`
    sprite.alt = `${catName} très triste`
    sprite.src = randomSprite('ill')
    playSpriteAnimation('tremble')
  }

  // Badge d'alerte si état critique
  const badge = document.getElementById('alert-badge')
  if (min <= 10) {
    badge.innerHTML = '&#9888;' // Emoji alerte ⚠️
    badge.classList.add('active')
  } else {
    badge.innerHTML = ''
    badge.classList.remove('active')
  }

  // Animation de la carte si état critique
  const container = document.querySelector('.container')
  if (min <= 10) {
    container.classList.add('card-alert')
  } else {
    container.classList.remove('card-alert')
  }
}

updateMood()

function showActionFeedback(type) {
  const feedback = document.getElementById('action-feedback')
  let icons = ACTION_EMOJIS[type] || ['✨']
  // Tire un emoji au hasard dans la liste
  let icon = icons[Math.floor(Math.random() * icons.length)]
  feedback.textContent = icon
  feedback.classList.remove('show')
  void feedback.offsetWidth
  feedback.classList.add('show')
  setTimeout(() => {
    feedback.classList.remove('show')
    feedback.textContent = ''
  }, 800)
}

function playSound(id) {
  if (!soundEnabled) return
  const audio = document.getElementById(id)
  if (!audio) return
  // Volume personnalisé
  if (id === 'sound-sleep') {
    audio.volume = 0.25 // 50% du volume
  } else {
    audio.volume = 1.0 // 100% pour les autres
  }
  audio.currentTime = 0
  audio.play()
}

// Chargement de l'état du son depuis le localStorage
function loadSoundSetting() {
  const stored = localStorage.getItem('abricot-sound-enabled')
  soundEnabled = stored === null ? true : stored === 'true'
  updateSoundToggle()
}

function updateSoundToggle() {
  const btn = document.getElementById('sound-toggle')
  if (!btn) return
  btn.setAttribute('aria-pressed', soundEnabled)
  btn.textContent = soundEnabled ? '🔊' : '🔈'
}

function toggleSound() {
  soundEnabled = !soundEnabled
  localStorage.setItem('abricot-sound-enabled', soundEnabled)
  updateSoundToggle()
}

// Ajoute l'écouteur sur le bouton (à la fin du script)
document.getElementById('sound-toggle').addEventListener('click', toggleSound)

// Initialise au chargement
loadSoundSetting()

// ===== FONCTIONS DU CIMETIÈRE =====
function updateGraveyardDisplay(isNewDeath = false) {
  const graveyard = loadGraveyard()
  const emptyMessage = document.getElementById('graveyard-empty')
  const graveyardList = document.getElementById('graveyard-list')
  const counter = document.getElementById('graveyard-counter')

  // Met à jour le compteur
  if (graveyard.length === 0) {
    counter.textContent = 'Aucun chat décédé'
  } else {
    counter.textContent = `${graveyard.length} chat${
      graveyard.length > 1 ? 's' : ''
    } décédé${graveyard.length > 1 ? 's' : ''}`
  }

  if (graveyard.length === 0) {
    emptyMessage.style.display = 'block'
    graveyardList.style.display = 'none'
    return
  }

  emptyMessage.style.display = 'none'
  graveyardList.style.display = 'block'

  // Trie par longévité (âge en millisecondes) décroissant
  const sortedGraveyard = graveyard
    .map((cat) => ({
      ...cat,
      ageMs: parseAgeToMs(cat.age),
    }))
    .sort((a, b) => b.ageMs - a.ageMs)
    .slice(0, 10) // Limite à 10 chats maximum

  graveyardList.innerHTML = ''

  sortedGraveyard.forEach((cat, index) => {
    const item = document.createElement('li')
    item.className = 'graveyard-item'

    // Ajoute l'animation si c'est un nouveau décès et que c'est le premier élément
    if (isNewDeath && index === 0) {
      item.classList.add('graveyard-item-new')
      // Retire la classe après l'animation
      setTimeout(() => {
        item.classList.remove('graveyard-item-new')
      }, 600)
    }

    const icon = index < 3 ? '🏆' : '🪦' // Trophée pour le top 3
    const date = new Date(cat.dateOfDeath).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    })

    item.innerHTML = `
      <span class="graveyard-icon">${icon}</span>
      <div class="graveyard-info">
        <div class="graveyard-name">${cat.name}</div>
        <div class="graveyard-details">Vécu ${cat.age} • ${date}</div>
      </div>
    `

    graveyardList.appendChild(item)
  })
}

function parseAgeToMs(ageString) {
  // Convertit "3j 2h 15min" en millisecondes pour le tri
  let totalMs = 0
  const dayMatch = ageString.match(/(\d+)j/)
  const hourMatch = ageString.match(/(\d+)h/)
  const minMatch = ageString.match(/(\d+)min/)

  if (dayMatch) totalMs += parseInt(dayMatch[1]) * 24 * 60 * 60 * 1000
  if (hourMatch) totalMs += parseInt(hourMatch[1]) * 60 * 60 * 1000
  if (minMatch) totalMs += parseInt(minMatch[1]) * 60 * 1000

  return totalMs
}

// Initialise l'affichage du cimetière au chargement
updateGraveyardDisplay()

function formatDuration(ms) {
  // Retourne une durée humaine ex: "1j 2h 5min"
  const totalSec = Math.floor(ms / 1000)
  const days = Math.floor(totalSec / 86400)
  const hours = Math.floor((totalSec % 86400) / 3600)
  const mins = Math.floor((totalSec % 3600) / 60)
  let str = ''
  if (days) str += `${days}j `
  if (hours) str += `${hours}h `
  str += `${mins}min`
  return str
}

function updateStatsDisplay() {
  const now = Date.now()
  document.getElementById(
    'stat-adopted'
  ).textContent = `Adopté·e depuis ${formatDuration(now - stats.adoptedAt)}`
  document.getElementById(
    'stat-feed'
  ).textContent = `Nourri·e ${stats.feedCount} fois`
  document.getElementById(
    'stat-sleep'
  ).textContent = `A dormi ${stats.sleepCount} fois`
  document.getElementById(
    'stat-cuddle'
  ).textContent = `Câliné·e ${stats.cuddleCount} fois`
  document.getElementById('stat-last').textContent = stats.lastAction
    ? `Dernière action : ${stats.lastAction}`
    : ''
}

document.getElementById('reset-stats').addEventListener('click', () => {
  stats = { ...DEFAULT_STATS, adoptedAt: Date.now() }
  saveStats(stats)
  updateStatsDisplay()
})

function animateGauge(jauge) {
  let bar
  if (jauge === 'hunger') bar = document.getElementById('hunger')
  if (jauge === 'energy') bar = document.getElementById('energy')
  if (jauge === 'affection') bar = document.getElementById('affection')
  if (!bar) return
  bar.classList.remove('gauge-anim')
  void bar.offsetWidth // Forcer le reflow pour rejouer l'anim
  bar.classList.add('gauge-anim')
  setTimeout(() => bar.classList.remove('gauge-anim'), 500) // Retire après anim
}

const BG_PARTICLES = ['💖', '✨', '🩷', '💜', '💙', '⭐', '🌸', '🤍'] // Mets ce que tu veux !

function spawnBgParticle() {
  const container = document.getElementById('bg-confetti')
  if (!container) return
  const el = document.createElement('span')
  el.className = 'bg-particle'
  el.textContent = BG_PARTICLES[Math.floor(Math.random() * BG_PARTICLES.length)]
  // Position de départ aléatoire
  const left = Math.random() * 100
  el.style.left = left + 'vw'
  el.style.top = '-3vh'
  el.style.fontSize = 1.1 + Math.random() * 2.2 + 'rem'
  el.style.opacity = 0.38 + Math.random() * 0.37
  // Animation vers le bas
  const duration = 5000 + Math.random() * 5000 // entre 5s et 10s
  el.animate(
    [
      { transform: 'translateY(0) scale(1)', opacity: el.style.opacity },
      {
        transform: `translateY(${110 + Math.random() * 8}vh) scale(${
          0.85 + Math.random() * 0.3
        })`,
        opacity: 0,
      },
    ],
    {
      duration,
      easing: 'linear',
      fill: 'forwards',
    }
  )
  container.appendChild(el)
  setTimeout(() => el.remove(), duration + 500)
}

// Lance la pluie en continu
setInterval(spawnBgParticle, 200) // plus bas = plus de confettis
