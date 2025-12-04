# 🎼 Harmonist Academy V4.0

> **L'application ultime d'entraînement auditif pour l'harmonie, le jazz et l'acoustique.**

![Version](https://img.shields.io/badge/version-4.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Tech](https://img.shields.io/badge/Made%20With-Vanilla%20JS-yellow.svg)

Harmonist Academy est une **Single Page Application (SPA)** gamifiée conçue pour aider les musiciens à reconnaître les accords, les renversements, les voicings jazz et les structures harmoniques complexes à l'oreille.

---

## 🌍 NOUVEAU DANS LA V4.0 : LEADERBOARD MONDIAL

C'est la mise à jour majeure que vous attendiez. L'entraînement auditif devient compétitif !

* **🔐 Système de Connexion :** Créez votre profil de musicien sécurisé.
* **🏆 Classement en Temps Réel :** Comparez votre oreille absolue avec les musiciens du monde entier.
* **☁️ Cloud Save :** Vos scores et votre progression ne sont plus limités à votre navigateur.

---

## ✨ Fonctionnalités Majeures

### 🎮 Modes de Jeu
* **🧘 Mode Zen :** Entraînement sans stress, écoutez et prenez votre temps.
* **⚡ Mode Chrono :** 60 secondes pour faire le meilleur score.
* **🏃 Mode Sprint :** Le temps diminue à chaque réponse. Réservé aux experts.
* **🎧 Mode Inverse :** Quiz à l'aveugle (QCM). On vous donne le nom, trouvez le son.

### 📚 Contenu Harmonique (Sets)
1.  **🏛️ L'Académie (Classique) :** Accords de base (Maj7, min7, Dom7, Dim7) et gestion des 4 renversements.
2.  **🎷 Le Club (Jazz) :** Extensions (9ème, 13ème, Altérés, Sus) et Voicings (Close, Drop-2, Shell, Rootless).
3.  **🧪 Le Laboratoire (Acoustique) :** Structures intervalliques, Trichordes (Clusters), Accords Suspendus et variations de densité (Contracté/Dilaté).

### 🏆 Gamification & Progression
* **Niveaux 1 à 20 :** Une courbe de progression ajustée.
* **Prestige & Lore :** Système de "Maîtrise Infinie" avec rangs honorifiques.
* **Badges & Trophées :** +30 succès, défis de carrière et "Easter Eggs".
* **🤖 Coach IA :** Un algorithme analyse vos erreurs en temps réel pour donner des conseils ciblés.

### 🛠️ Outils
* **Codex 2.0 :** Encyclopédie interactive avec visualiseur piano et exemples musicaux.
* **Piano Virtuel :** Visualisation temps réel des notes.
* **Stats Détaillées :** Suivi de la précision par accord et historique sur 7 jours.

---

## 💻 Architecture Technique

Le projet est construit en **Vanilla JavaScript (ES6+)** pur, privilégiant la performance sans dépendances lourdes.

* **Frontend :** HTML5 / CSS3 (Grid, Flexbox, Glassmorphism, CSS Variables).
* **Audio :** Web Audio API (Moteur hybride : Samples piano HQ + Synthèse additive SFX).
* **Data & State :** Architecture modulaire (ES Modules).
* **Persistance Hybride :**
    * *Local Storage* pour les préférences et le cache.
    * *Base de données* pour le Leaderboard et les profils utilisateurs.

### Structure des Fichiers

```bash
/
├── index.html      # Point d'entrée unique (DOM structure)
├── styles.css      # Feuille de style globale (Thèmes, Animations)
├── app.js          # Cœur logique (State, Game Loop)
├── ui.js           # Gestion du DOM, Rendu dynamique, Modales
├── data.js         # Base de données (Accords, Badges, Textes)
├── audio.js        # Moteur sonore (Tone generator, Sampler)
├── auth.js         # Gestion de la connexion et API Leaderboard (NEW)
└── main.js         # Script d'initialisation et Event Listeners
```

---

## 🚀 Installation & Démarrage

Puisque l'application utilise des **Modules ES6**, elle ne peut pas être lancée directement en double-cliquant sur `index.html` (à cause des politiques CORS des navigateurs pour les fichiers locaux).

### Méthode 1 : Avec Node.js & NPM (Recommandé)

1.  Installez les dépendances (serveur de développement léger) :
    ```bash
    npm install
    ```
2.  Lancez le serveur :
    ```bash
    npm run dev
    ```
3.  Ouvrez votre navigateur sur l'adresse indiquée (ex: `http://localhost:5173`).

### Méthode 2 : Avec l'extension VS Code "Live Server"

1.  Ouvrez le dossier du projet dans VS Code.
2.  Installez l'extension **Live Server** (Ritwick Dey).
3.  Faites un clic droit sur `index.html` -> **Open with Live Server**.

### Méthode 3 : Python (Simple)

Si Python est installé sur votre machine :

```bash
# Python 3
python -m http.server 8000
```
Puis ouvrez `http://localhost:8000`.

---

## 🤝 Contribution

Ce projet est conçu pour être facilement extensible.

*   **Ajouter des accords :** Modifiez `DB.sets` dans `data.js`.
*   **Créer des badges :** Ajoutez des entrées dans le tableau `BADGES` (`data.js`).
*   **Modifier le style :** Tout est centralisé dans `styles.css` via des variables CSS (`:root`).

---

**© 2025 Harmonist Academy** - *Fait avec passion pour la théorie musicale.*
