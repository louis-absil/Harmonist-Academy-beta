# 🎼 Harmonist Academy V5.0 (Challenger Update)

> **L'application ultime d'entraînement auditif pour l'harmonie, le jazz et l'acoustique.**

![Version](https://img.shields.io/badge/version-5.0.0-gold.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Tech](https://img.shields.io/badge/Made%20With-Vanilla%20JS-yellow.svg)

Harmonist Academy est une **Single Page Application (SPA)** gamifiée conçue pour aider les musiciens à reconnaître les accords, les renversements, les voicings jazz et les structures harmoniques complexes à l'oreille.

---

## ⚔️ NOUVEAU DANS LA V5 : L'ARÈNE DES DÉFIS

La mise à jour "Challenger" transforme l'expérience d'apprentissage en véritable compétition e-sportive musicale.

### 🔥 1. Le Défi du Jour (Daily Challenge)
Chaque jour, une **séquence unique de 20 accords** est générée.
*   **Seed Unique :** Tout le monde joue exactement la même séquence (basée sur la date).
*   **Classement Journalier :** Comparez votre score avec la communauté sur le même examen.
*   **Rapport Détaillé :** Analyse précise de vos erreurs et statistiques en fin de session.

### 👻 2. Les Maîtres Fantômes (Ghost Players)
Le Leaderboard n'est plus vide ! Mesurez-vous aux légendes de la musique qui peuplent désormais les classements avec des scores et des citations basés sur leur personnalité :
*   **Erik Satie & Bach** dominent le mode *Chrono* (Endurance).
*   **Mozart & Paganini** règnent sur le mode *Sprint* (Vitesse).
*   **John Cage & Beethoven** vous attendent en mode *Inverse* (Écoute profonde).

### 🤝 3. Défis Personnalisés (PvP)
Créez vos propres examens !
*   **Générateur de Seed :** Créez un défi (ex: "EXAMEN-JAZZ-2") basé sur vos réglages actuels.
*   **Partage :** Envoyez le code à un ami. Il jouera exactement la même suite d'accords que vous.
*   **Mode Examen :** Contrairement au mode Zen, les erreurs sont définitives et la correction n'apparaît qu'à la fin.

---

## ✨ Fonctionnalités Principales

### 🎮 Modes de Jeu
*   **🧘 Mode Zen :** Entraînement sans stress, feedback immédiat.
*   **⚡ Mode Chrono :** 60 secondes pour faire le meilleur score.
*   **🏃 Mode Sprint :** Le temps diminue à chaque réponse. Réservé aux experts.
*   **🎧 Mode Inverse :** Quiz à l'aveugle (QCM). On vous donne le nom, trouvez le son.

### 📚 Contenu Harmonique (Sets)
1.  **🏛️ L'Académie (Classique) :** Accords de base (Maj7, min7, Dom7, Dim7) et gestion des 4 renversements.
2.  **🎷 Le Club (Jazz) :** Extensions (9ème, 13ème, Altérés, Sus) et Voicings (Close, Drop-2, Shell, Rootless).
3.  **🧪 Le Laboratoire (Acoustique) :** Structures intervalliques, Trichordes (Clusters), Accords Suspendus et variations de densité (Contracté/Dilaté).

### 🏆 Gamification & Lore
*   **Système de Maîtrise :** Progressez de *Novice* à *Virtuose* à travers des matériaux nobles (Cristal, Marbre, Or, Obsidienne...).
*   **Badges & Trophées :** +30 succès, dont des badges secrets liés au "Lore" du jeu.
*   **Coach IA :** Analyse vos faiblesses en temps réel pour donner des conseils contextuels.

---

## 💻 Architecture Technique

Le projet a été entièrement migré vers du **JavaScript Pur (ES Modules)** pour une performance maximale et une maintenance simplifiée.

*   **Frontend :** HTML5 / CSS3 (Grid, Flexbox, Glassmorphism).
*   **Logique :** Vanilla JS (ES6+ Modules). Aucune étape de build complexe requise.
*   **Audio :** Web Audio API (Piano samplé + Synthèse SFX).
*   **Backend (Firebase) :**
    *   **Firestore :** Stockage des Leaderboards, des Défis et des Profils.
    *   **Auth :** Authentification anonyme transparente.

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
├── challenges.js   # [NOUVEAU] Gestionnaire des Seeds, RNG & Mode Examen
└── firebase.js     # [NOUVEAU] Connecteur Cloud (Firestore/Auth)
```

---

## 🚀 Installation & Démarrage

L'application utilise des **Modules ES6**, elle nécessite un serveur local pour contourner les politiques CORS (Cross-Origin Resource Sharing).

### Méthode 1 : Avec Node.js & NPM

1.  Installez les dépendances :
    ```bash
    npm install
    ```
2.  Lancez le serveur de développement :
    ```bash
    npm run dev
    ```

### Méthode 2 : Python

Si Python est installé sur votre machine :

```bash
python -m http.server 8000
```
Puis ouvrez `http://localhost:8000` dans votre navigateur.

---

**© 2025 Harmonist Academy** - *Fait par Louis Absil avec ❤️ et beaucoup de café.*
