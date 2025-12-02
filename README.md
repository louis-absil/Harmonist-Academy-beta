# 🎼 Harmonist Academy V4.0

**L'application ultime d'entraînement auditif pour l'harmonie, le jazz et l'acoustique.**

Harmonist Academy est une "Single Page Application" (SPA) gamifiée conçue pour aider les musiciens à reconnaître les accords, les renversements, les voicings jazz et les structures harmoniques complexes à l'oreille.

---

## ✨ Fonctionnalités Majeures

### 🎮 Modes de Jeu
*   **🧘 Mode Zen :** Entraînement sans stress, écoutez et prenez votre temps.
*   **⚡ Mode Chrono :** 60 secondes pour faire le meilleur score.
*   **🏃 Mode Sprint :** Le temps diminue à chaque réponse. Réservé aux experts.
*   **🎧 Mode Inverse :** Quiz à l'aveugle (QCM). On vous donne le nom, trouvez le son.

### 📚 Contenu Harmonique (Sets)
1.  **🏛️ L'Académie (Classique) :**
    *   Accords de base (Maj7, min7, Dom7, Dim7, etc.).
    *   Gestion des 4 renversements classiques.
2.  **🎷 Le Club (Jazz) :**
    *   Extensions (9ème, 13ème, Altérés, Sus).
    *   **Voicings :** Close, Drop-2, Shell, Rootless.
3.  **🧪 Le Laboratoire (Acoustique - *Nouveau V4*) :**
    *   Structures intervalliques (3-6, 4/5-Tr).
    *   Trichordes (Clusters) et Accords Suspendus Symétriques.
    *   Variations de densité (Contracté/Dilaté).

### 🏆 Gamification & Progression
*   **Système de Niveaux :** Montez du niveau 1 au niveau 20.
*   **Prestige & Lore :** Système de "Maîtrise Infinie" avec 16 rangs de matière (Cristal, Or, Plasma, Absolu...).
*   **Badges & Trophées :** Plus de 30 succès à débloquer, incluant des défis de carrière et des secrets ("Easter Eggs").
*   **Le Coach IA :** Un algorithme analyse vos erreurs en temps réel et vous donne des conseils ciblés.

### 🛠️ Outils
*   **Codex 2.0 :** Une encyclopédie interactive avec visualiseur piano, exemples musicaux célèbres et lecture audio contextuelle.
*   **Piano Virtuel :** Visualisation temps réel des notes jouées.
*   **Statistiques Détaillées :** Suivi de la précision par accord et historique sur 7 jours.

---

## 💻 Architecture Technique

Le projet est construit en **Vanilla JavaScript (ES6+)** pur, sans framework ni dépendances lourdes.

*   **HTML5 / CSS3 :** Utilisation intensive de CSS Grid, Flexbox, Variables CSS et animations (Glassmorphism).
*   **Web Audio API :** Moteur audio hybride (Samples piano haute qualité + Synthèse additive pour les SFX).
*   **Local Storage :** Sauvegarde persistante de la progression (XP, Stats, Badges).
*   **ES Modules :** Architecture modulaire (`import`/`export`).

### Structure des Fichiers

```bash
/
├── index.html      # Point d'entrée unique (DOM structure)
├── styles.css      # Feuille de style globale (Thèmes, Animations, Responsive)
├── app.js          # Cœur logique (State, Game Loop, Save System)
├── ui.js           # Gestion du DOM, Rendu dynamique, Modales
├── data.js         # Base de données (Accords, Badges, Textes, Configs)
├── audio.js        # Moteur sonore (Tone generator, Sampler, SFX)
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
