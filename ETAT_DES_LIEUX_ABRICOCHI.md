# État des lieux du projet Abricochi 🐱

## Vue d'ensemble du projet

**Abricochi** est un jeu de tamagotchi virtuel mettant en scène un chat nommé Abricot. Le joueur doit prendre soin de son animal virtuel en gérant trois besoins principaux : la faim, l'énergie et l'affection.

## Architecture technique

### Structure des fichiers

```
abricochi-webapp/
├── index.html              # Page principale du jeu
├── Notes.txt               # Notes de développement et améliorations futures
├── css/
│   └── style.css          # Styles et animations
├── js/
│   └── main.js            # Logique du jeu
└── assets/
    ├── img/               # Sprites d'Abricot (16 images)
    │   ├── abricot-content*.png    # États heureux (4 variantes)
    │   ├── abricot-waiting*.png    # États d'attente (4 variantes)
    │   ├── abricot-sad*.png        # États tristes (4 variantes)
    │   └── abricot-ill*.png        # États malades (4 variantes)
    └── sounds/            # Effets sonores
        ├── eat.mp3        # Son de nourriture
        ├── meow.mp3       # Miaulement
        └── sleep.mp3      # Son de sommeil
```

### Technologies utilisées

- **HTML5** : Structure sémantique
- **CSS3** : Animations, gradients, responsive design
- **JavaScript Vanilla** : Logique du jeu, localStorage, gestion d'état
- **Web Audio API** : Gestion des sons
- **LocalStorage** : Sauvegarde persistante

## Fonctionnalités implémentées

### 🎮 Mécaniques de jeu

1. **Système de jauges** (0-100) :

   - **Faim** : Diminue de 3 points toutes les 1,5 minutes
   - **Énergie** : Diminue de 2 points toutes les 3 minutes
   - **Affection** : Diminue de 1 point toutes les 4 minutes

2. **Actions du joueur** :

   - **Nourrir** 🍓 : +25 faim
   - **Faire dormir** 💤 : +25 énergie
   - **Câliner** 🤗 : +25 affection

3. **États d'humeur d'Abricot** :
   - **Heureux** (>60) : Sprite content, message positif, animation wiggle
   - **Attentif** (30-60) : Sprite d'attente, demande d'attention
   - **Triste** (10-30) : Sprite triste, animation tremble
   - **Critique** (≤10) : Sprite malade, alerte visuelle, animation de carte

### 🎨 Interface utilisateur

1. **Design** :

   - Gradient de fond animé (24s de cycle)
   - Carte principale centrée avec ombres douces
   - Palette de couleurs pastel (violets, verts, roses)
   - Design responsive (mobile-first)

2. **Animations** :

   - **Sprite** : wiggle, tremble, bounce selon l'humeur
   - **Jauges** : Animation flash colorée lors des actions
   - **Feedback** : Bulles d'émojis lors des actions
   - **Particules** : Pluie continue de particules en arrière-plan
   - **Titre** : Animation d'apparition au chargement

3. **Éléments visuels** :
   - Badge d'alerte rouge en cas d'état critique
   - Bouton son avec état visuel (🔊/🔈)
   - Empreintes de pattes animées
   - Feedback visuel pour chaque action

### 🔊 Système audio

- **Contrôle utilisateur** : Bouton toggle son
- **Sons contextuels** :
  - Manger : eat.mp3
  - Dormir : sleep.mp3 (volume réduit à 25%)
  - Câliner : meow.mp3
- **Sauvegarde** : Préférence son dans localStorage

### 📊 Système de statistiques

1. **Données trackées** :

   - Date d'adoption (timestamp)
   - Nombre de fois nourri
   - Nombre de fois endormi
   - Nombre de fois câliné
   - Dernière action effectuée

2. **Affichage** :
   - Durée depuis l'adoption (format "Xj Xh Xmin")
   - Compteurs d'actions
   - Bouton de remise à zéro

### 💾 Persistance des données

- **État du jeu** : Valeurs des jauges sauvegardées en temps réel
- **Statistiques** : Historique complet des interactions
- **Préférences** : État du son
- **Récupération** : Gestion des erreurs de parsing JSON

## Détails techniques avancés

### Gestion d'état

```javascript
// État par défaut
const DEFAULT_STATE = {
  hunger: 100,
  energy: 100,
  affection: 100,
}

// Paramètres de dégradation
const DECAY_SETTINGS = {
  hunger: { interval: 90000, amount: 3 },
  energy: { interval: 180000, amount: 2 },
  affection: { interval: 240000, amount: 1 },
}
```

### Système de sprites

- **4 états d'humeur** × **4 variantes** = 16 images
- Sélection aléatoire des variantes pour éviter la répétition
- Sprites 120×120px avec bordures arrondies

### Animations CSS

- **Keyframes** : 15+ animations définies
- **Transitions** : Effets fluides sur les interactions
- **Transform** : Rotations, échelles, translations
- **Cubic-bezier** : Courbes d'animation personnalisées

### Responsive design

- **Breakpoints** : 480px (mobile), 900px (tablette)
- **Layout** : Flexbox avec passage en colonne sur mobile
- **Tailles** : Adaptation des sprites et textes

## Problèmes identifiés (Notes.txt)

### 🐛 Bugs/Améliorations

1. **Spam des boutons** : Possibilité de spammer pour augmenter artificiellement les stats
2. **Sons conditionnels** : Pas de son si la barre n'augmente pas
3. **Audit** : Vérification Lighthouse à effectuer

### 🚀 Fonctionnalités futures

1. **Authentification** : Système de comptes utilisateurs
2. **Leaderboard** : Classement des joueurs
3. **Aide contextuelle** : Bouton "?" avec règles du jeu
4. **Écran de chargement** : Animation personnalisée
5. **Thèmes** : Changement de couleurs par l'utilisateur
6. **Polish graphique** : Ombres colorées, micro-particules

## Performance et optimisation

### Points forts

- **Vanilla JS** : Pas de dépendances externes
- **LocalStorage** : Sauvegarde instantanée
- **CSS optimisé** : Animations GPU-accelerated
- **Images** : Format PNG optimisé

### Points d'amélioration

- **Lazy loading** : Images non utilisées
- **Service Worker** : Cache pour mode hors-ligne
- **Compression** : Minification CSS/JS
- **WebP** : Format d'images moderne

## Accessibilité

### Implémenté

- **ARIA** : Labels et états sur les boutons
- **Sémantique** : Structure HTML correcte
- **Focus** : Outline visible sur les éléments interactifs
- **Alt text** : Descriptions des images

### À améliorer

- **Contraste** : Vérification WCAG
- **Navigation clavier** : Support complet
- **Screen readers** : Tests avec lecteurs d'écran

## Déploiement

### Configuration actuelle

- **Repository** : https://github.com/helianthe24/abricochi-webapp.git
- **Hébergement** : À définir
- **Build** : Aucun processus de build nécessaire

### Recommandations

- **GitHub Pages** : Déploiement automatique
- **Netlify/Vercel** : Alternatives avec CI/CD
- **CDN** : Distribution des assets

## Métriques et analytics

### Non implémenté

- **Google Analytics** : Suivi des utilisateurs
- **Événements** : Tracking des actions de jeu
- **Performance** : Métriques de chargement

## Conclusion

Abricochi est un projet web abouti présentant :

- ✅ **Gameplay fonctionnel** avec mécaniques équilibrées
- ✅ **Interface soignée** avec animations fluides
- ✅ **Code maintenable** et bien structuré
- ✅ **Expérience utilisateur** engageante

Le projet est prêt pour la production avec quelques améliorations mineures identifiées dans les notes de développement.

---

_État des lieux généré le 05/08/2025 - Version actuelle du projet_
