

import { Cloud } from './firebase.js';
import { Audio } from './audio.js';

export const ChallengeManager = {
    active: false,
    config: null, // { id, seed, length, settings, sequence? }
    state: {
        step: 0,
        score: 0,
        mistakes: [], // { chord, userResp }
        startTime: 0,
        netTime: 0, // Temps de réflexion pur (Speedrunner badge)
        history: [],
        attempts: [] // Full log for stats
    },

    // RNG Seeded (Mulberry32)
    seedFunc: null,
    initSeed(str) {
        let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
        for (let i = 0, k; i < str.length; i++) {
            k = str.charCodeAt(i);
            h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
            h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
            h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
            h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
        }
        let seedState = (h1>>>0) + (h2>>>0) + (h3>>>0) + (h4>>>0);
        
        this.seedFunc = () => {
            let t = seedState += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
        console.log("🎲 Challenge RNG initialized with:", str);
    },

    checkRescue() {
        const backup = localStorage.getItem('harmonist_challenge_backup');
        if (backup) {
            console.log("🧹 Nettoyage d'un défi interrompu.");
            this.restore(); 
        }
    },

    async start(challengeData) {
        const App = window.App;
        const snapshot = {
            settings: JSON.parse(JSON.stringify(App.data.settings)),
            currentSet: App.data.currentSet,
            mode: App.session.mode
        };
        localStorage.setItem('harmonist_challenge_backup', JSON.stringify(snapshot));

        this.active = true;
        this.config = challengeData;
        
        // Si une séquence custom est fournie, on utilise le RNG mais la longueur est forcée
        if (challengeData.sequence) {
            this.config.length = challengeData.sequence.length;
        }
        
        this.initSeed(challengeData.seed);
        
        this.state = {
            step: 0,
            score: 0,
            mistakes: [],
            startTime: Date.now(),
            netTime: 0,
            history: [],
            attempts: []
        };

        App.session.isChallenge = true;
        App.rng = this.seedFunc; 
        
        if (challengeData.settings) {
            if (challengeData.settings.set) {
                App.loadSet(challengeData.settings.set, true); 
            }
            App.data.settings.activeC = challengeData.settings.activeC;
            App.data.settings.activeI = challengeData.settings.activeI;
        }
        
        App.setMode('zen'); 
        
        window.UI.closeModals();
        window.UI.updateChallengeControls(true); // Toggle Settings button to Exit button

        document.getElementById('scoreGroup').classList.add('active');
        document.getElementById('currentScoreVal').innerText = "1/" + this.config.length;
        document.getElementById('highScoreVal').innerText = "EXAM";
        document.getElementById('streakVal').innerText = "-"; 
        
        window.UI.showToast(`Défi lancé : ${challengeData.seed}`);
        
        App.playNew(); 
    },

    restore() {
        const App = window.App;
        const backupStr = localStorage.getItem('harmonist_challenge_backup');
        if (backupStr) {
            const backup = JSON.parse(backupStr);
            App.data.currentSet = backup.currentSet;
            App.data.settings = backup.settings;
            App.session.mode = backup.mode || 'zen';
            localStorage.removeItem('harmonist_challenge_backup');
        }
        
        this.active = false;
        App.session.isChallenge = false;
        App.rng = Math.random; 
        
        App.loadSet(App.data.currentSet, true);
        App.setMode(App.session.mode);
        document.getElementById('scoreGroup').classList.remove('active');
        
        window.UI.updateChallengeControls(false); // Restore Settings button
    },

    handleAnswer(win, chord, userResp) {
        const App = window.App;
        
        // Calcul du temps de réflexion NET (sans les animations)
        const thinkingTime = Date.now() - App.session.lastActionTime;
        this.state.netTime += thinkingTime;

        if (win) {
            this.state.score++;
        } else {
            this.state.mistakes.push({
                chord: chord,
                userResp: userResp
            });
        }

        this.state.history.push({ win, time: thinkingTime });
        if(!this.state.attempts) this.state.attempts = [];
        this.state.attempts.push({ chord, userResp, win });

        if (win) {
            Audio.sfx('win');
            window.UI.msg("Validé", "correct");
        } else {
            Audio.sfx('lose');
            window.UI.msg("Erreur", "wrong");
        }

        setTimeout(() => {
            this.state.step++;
            if (this.state.step >= this.config.length) {
                this.finish();
            } else {
                document.getElementById('currentScoreVal').innerText = `${this.state.step + 1}/${this.config.length}`;
                App.playNew();
            }
        }, 1000);
    },

    async finish() {
        const App = window.App;
        const endTime = Date.now();
        const totalTime = endTime - this.state.startTime;
        const finalNote = Math.round((this.state.score / this.config.length) * 20);

        // V5.2 - GESTION DU STREAK (Le Rituel)
        // Vérifie si le défi du jour a été joué
        const todayISO = new Date().toISOString().split('T')[0];
        const lastDaily = App.data.arenaStats.lastDailyDate;
        
        // On met à jour les stats d'Arène
        App.data.arenaStats.totalScore += this.state.score;

        // Si c'est un nouveau jour, on gère la série
        if (lastDaily !== todayISO) {
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            if (lastDaily === yesterday) {
                App.data.arenaStats.currentStreak++;
            } else {
                App.data.arenaStats.currentStreak = 1;
            }
            App.data.arenaStats.lastDailyDate = todayISO;
            // Met à jour le max streak si battu
            if (App.data.arenaStats.currentStreak > App.data.arenaStats.maxStreak) {
                App.data.arenaStats.maxStreak = App.data.arenaStats.currentStreak;
            }
        }
        
        // V5.3 - UPDATE BEST DAILY SCORE (LOCAL)
        // Important: faire ça avant le save()
        App.updateArenaStats(this.state.score, this.config.length);

        // Store length for Badge checking BEFORE saving/checking
        App.session.lastChallengeLength = this.config.length;
        App.save();

        const resultData = {
            seed: this.config.seed,
            note: finalNote,
            score: this.state.score,
            total: this.config.length,
            mistakes: this.state.mistakes,
            attempts: this.state.attempts,
            time: totalTime
        };

        // Envoi au Cloud (Composite ID handled in firebase.js)
        await Cloud.submitChallengeScore(this.config.id, {
            pseudo: App.data.username,
            note: finalNote,
            score: this.state.score, // ADD RAW SCORE
            total: this.config.length,
            time: totalTime,
            mastery: App.data.mastery
        });
        
        // V5.2 - VERIFICATION BADGES DE RANG (Empereur / Outsider)
        // On récupère le leaderboard frais pour savoir où on se situe
        try {
            const lb = await Cloud.getChallengeLeaderboard(this.config.id);
            
            // On cherche l'utilisateur via son UID unique
            const myUid = Cloud.getCurrentUID();
            const myEntryIndex = lb.findIndex(entry => entry.uid === myUid);
            
            if (myEntryIndex !== -1) {
                // Stockage temporaire dans la session pour que App.checkBadges puisse lire
                App.session.challengeRank = myEntryIndex + 1;
                App.session.challengeTotalPlayers = lb.length;
                App.session.challengeNetTime = this.state.netTime;
                
                // Déclenchement vérification badges
                App.checkBadges();
            }
        } catch (e) {
            console.error("Rank Badge Check Fail", e);
        }

        window.UI.updateChallengeControls(false); // Restore UI (although Modal blocks interaction)
        window.UI.renderChallengeReport(resultData);
    },

    exit() {
        this.restore();
        window.UI.closeModals();
        window.UI.showToast("Retour à l'entraînement libre");
    }
};
