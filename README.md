# 🎼 Harmonist Academy V5.2 (Academy Guide)

> **L'application ultime d'entraînement auditif pour l'harmonie, le jazz et l'acoustique.**

![Version](https://img.shields.io/badge/version-5.2.0-guide.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Tech](https://img.shields.io/badge/Made%20With-Vanilla%20JS-yellow.svg)

Harmonist Academy est une **Single Page Application (SPA)** gamifiée conçue pour aider les musiciens à reconnaître les accords, les renversements, les voicings jazz et les structures harmoniques complexes à l'oreille.

---

## 🎓 NOUVEAU DANS LA V5.2 : LE GUIDE INTERACTIF

Cette mise à jour majeure se concentre sur l'expérience utilisateur (UX) et l'accueil des nouveaux élèves.

### 1. Visite Guidée (Walkthrough)
Un système de tutoriel immersif par "Spotlight" (mise en lumière) qui accompagne l'élève pas à pas.
* **Navigation Interactive :** Le guide prend le contrôle de l'interface pour ouvrir physiquement les menus (Paramètres, Stats, Arène) et montrer exactement où cliquer.
* **Pédagogie :** Explication des concepts clés (Couleur vs Renversement) et des pré-requis pour chaque mode.
* **Accessibilité :** Détection automatique des nouveaux utilisateurs et bouton d'aide permanent dans les paramètres.

### 2. Correctifs & Optimisations
* **Arène & Défis :** Correction critique des champs de saisie (Inputs) pour rejoindre un défi.
* **Interface :** Amélioration du scroll automatique dans les modales (Badges, Trophées) pour toujours montrer l'élément concerné.
* **Stabilité :** Nettoyage du code, suppression des doublons et sécurisation du moteur de rendu.

---

## 🎹 DÉJÀ DISPONIBLE (V5.1) : LE STUDIO DE CRÉATION

L'outil de composition pédagogique permettant aux professeurs et aux élèves de créer leurs propres dictées musicales.

* **Timeline Visuelle :** Ajoutez, supprimez et réorganisez vos accords sur une frise chronologique.
* **Contrôle Total :** Choisissez la qualité, le renversement et la note de basse précise grâce au clavier virtuel.
* **Exportation (Custom Seeds) :** Transformez vos créations en défis jouables via un code unique (ex: `JAZZ-EXAM-1`).

---

## ✨ Fonctionnalités Principales

### 🧠 Cœur de Gameplay
* **Système Dual-Check :** Identification séparée de la Qualité (Majeur, Mineur, Dom7...) et du Renversement (État Fondamental, 1er, 2ème...).
* **Moteur Audio Web :** Piano samplé haute qualité et synthétiseur d'effets sonores.
* **Smart Feedback :** Le "Coach Virtuel" analyse vos erreurs (ex: confusion quinte/octave) et vous donne des conseils ciblés.

### 🎮 Modes de Jeu
1.  **Zen :** Entraînement libre sans stress pour assimiler la théorie.
2.  **Inverse (Niv. 3) :** Le jeu donne le nom, vous devez imaginer le son (Ear Training Intérieur).
3.  **Chrono (Niv. 8) :** Course contre la montre pour tester vos réflexes.
4.  **Sprint (Niv. 12) :** Mort subite avec temps décroissant.

### 🏆 Progression RPG
* **Système d'XP :** Gagnez de l'expérience pour monter de niveau (Level 1-100).
* **Maîtrise (Lore) :** Débloquez des matériaux (Cristal, Marbre, Or...) en fonction de votre assiduité.
* **Badges :** +50 Trophées à collectionner (Secrets, Performance, Grind).

### 🧪 Le Laboratoire & Le Club
* **Club Jazz :** Voicings complexes (Drop-2, Shells, Rootless).
* **Laboratoire :** Recherche sur les structures intervalliques (Trichordes, Clusters, Set Theory).

---

## 🛠️ Stack Technique

* **Frontend :** HTML5, CSS3 (Variables, Grid, Flexbox, Glassmorphism).
* **Logique :** Vanilla JS (ES6+ Modules). Aucune étape de build complexe requise.
* **Audio :** Web Audio API (Piano samplé + Synthèse SFX).
* **Backend (Firebase) :**
    * **Firestore :** Stockage des Leaderboards, des Défis et des Profils.
    * **Auth :** Authentification anonyme transparente.

### Structure des Fichiers

```bash
/
├── index.html      # Point d'entrée DOM
├── styles.css      # Design System & Thèmes
├── main.js         # Point d'entrée JS & Event Listeners
├── app.js          # État global (State) & Boucle de jeu
├── ui.js           # Gestion de l'interface & Rendu DOM
├── audio.js        # Moteur Audio & Piano Virtuel
├── data.js         # Base de données (Accords, Badges, Ghosts, Textes)
├── challenges.js   # Gestionnaire des Seeds, RNG & Mode Examen
└── firebase.js     # Connecteur Cloud (Firestore/Auth)
```
## 🚀 Installation & Démarrage
L'application utilise des Modules ES6, elle nécessite un serveur local pour contourner les politiques CORS (Cross-Origin Resource Sharing).

Méthode 1 : Avec Node.js & NPM
Installez les dépendances :

Bash

npm install
Lancez le serveur de développement :

Bash

npm run dev
Méthode 2 : Python
Si Python est installé sur votre machine :

Bash

python -m http.server 8000
# Ouvrez http://localhost:8000
☕ Crédits
Conçu et développé pour les étudiants musiciens, les professeurs de théorie musicale et les passionnés de musique.

**Harmonist Academy © 2025 Louis Absil** - *Fait avec ❤️ et beaucoup de café, par un musicien, pour des musiciens.*

