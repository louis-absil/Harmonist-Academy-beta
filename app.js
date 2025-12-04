
import { DB, BADGES, COACH_DB } from './data.js';
import { Audio, Piano } from './audio.js';
import { UI } from './ui.js';
import { Cloud } from './firebase.js';

export const App = {
    data: { 
        username: "Élève Anonyme", // NOUVEAU
        xp:0, lvl:1, next:100, mastery:0, currentSet: 'academy',
        bestChrono:0, bestSprint:0, bestInverse:0,
        stats:{
            c:{}, i:{}, v:{}, l:{}, 
            totalPlayed: 0, 
            combos: [], 
            modesPlayed: [], 
            str_jazz: 0, str_007: 0, str_dim: 0, str_inv: 0
        }, 
        badges: [], 
        settings: { activeC: DB.sets.academy.chords.map(c=>c.id), activeI: DB.invs.map(i=>i.id) },
        history: [], tempToday: { date: null, ok: 0, tot: 0 }
    },
    session: { 
        mode:'zen', time:60, lives:3, chord:null, selC:null, selI:null, done:false, 
        hint:false, score:0, streak:0, globalOk:0, globalTot:0, 
        quizOptions:[], quizCorrectIdx:0, quizUserChoice:null, 
        currentSprintTime: 10, roundLocked: false,
        startTime: 0, cleanStreak: 0, openStreak: 0, fullConfigStreak: 0, fastStreak: 0, lowLifeRecovery: false, lastActionTime: 0,
        replayCount: 0, djClickTimes: [], selectionHistory: [], prevChordHash: null,
        str36Streak: 0, str45Streak: 0, geoStreak: 0, triStreak: 0, rootlessStreak: 0, monoStreak: 0, dejaVu: false,
        audioStartTime: 0, lastReactionTime: Infinity, hasReplayed: false, pureStreak: 0, razorTriggered: false,
        titleClicks: 0, lastChordType: null, jackpotStreak: 0, collectedRoots: null,
        seed: null
    },
    timerRef: null, sprintRef: null, vignetteRef: null,

    init() {
        Cloud.init(); 
        try {
            const s = JSON.parse(localStorage.getItem('harmonist_v4_final') || '{}');
            if(s.xp !== undefined) { 
                this.data.username = s.username || "Élève Anonyme";
                this.data.xp = s.xp || 0;
                this.data.lvl = s.lvl || 1;
                this.data.next = s.next || 100;
                this.data.badges = s.badges || [];
                this.data.bestChrono = s.bestChrono || 0;
                this.data.bestSprint = s.bestSprint || 0;
                this.data.bestInverse = s.bestInverse || 0;
                this.data.history = s.history || [];
                this.data.mastery = s.mastery !== undefined ? s.mastery : 0;
                this.data.currentSet = s.currentSet || 'academy';
                this.data.stats.totalPlayed = s.stats?.totalPlayed || 0;
                this.data.stats.c = s.stats?.c || {};
                this.data.stats.i = s.stats?.i || {};
                this.data.stats.v = s.stats?.v || {}; 
                this.data.stats.l = s.stats?.l || {}; 
                this.data.stats.combos = s.stats?.combos || [];
                this.data.stats.modesPlayed = s.stats?.modesPlayed || [];
                this.data.stats.str_jazz = s.stats?.str_jazz || 0;
                this.data.stats.str_007 = s.stats?.str_007 || 0;
                this.data.stats.str_dim = s.stats?.str_dim || 0;
                this.data.stats.str_inv = s.stats?.str_inv || 0;
                if(s.settings && s.settings.activeC) { this.data.settings = s.settings; }
            }
        } catch (e) { console.error("Save Corrupted, resetting", e); }

        const todayStr = new Date().toLocaleDateString('fr-FR', {day: 'numeric', month: 'numeric'});
        if(this.data.tempToday.date !== todayStr) { this.data.tempToday = { date: todayStr, ok: 0, tot: 0 }; }
        
        this.loadSet(this.data.currentSet, true);
        this.calcGlobalStats(); 
        window.UI.renderBoard(); 
        window.UI.updateHeader();
        window.UI.updateModeLocks();
        Piano.init(); 
    },

    // NOUVEAU : ABSTRACTION RNG
    rng() {
        if(this.session.seed !== null) {
            // Simple LCG pseudo-random if seeded (for reproducibility later)
            this.session.seed = (this.session.seed * 9301 + 49297) % 233280;
            return this.session.seed / 233280;
        }
        return Math.random();
    },

    setUsername(val) {
        if(!val || val.length < 2) return;
        this.data.username = val.trim().substring(0, 15);
        this.save();
        window.UI.showToast("Pseudo enregistré !");
    },

    isLocked(id) {
        const c = DB.chords.find(x => x.id === id);
        if(!c) return false;
        if(this.data.currentSet === 'jazz' && this.data.mastery === 1) return (c.unlockLvl && c.unlockLvl > this.data.lvl);
        if(this.data.currentSet === 'laboratory' && this.data.mastery <= 2) return (c.unlockLvl && c.unlockLvl > this.data.lvl);
        return false;
    },

    loadSet(setName, silent = false) {
        if(!DB.sets[setName]) setName = 'academy';
        this.data.currentSet = setName;
        DB.chords = DB.sets[setName].chords;
        
        if(DB.sets[setName].mode === 'jazz') { DB.currentInvs = DB.voicings; document.getElementById('invPanelLabel').innerText = "Voicing (Texture)"; } 
        else if (DB.sets[setName].mode === 'lab') { DB.currentInvs = []; document.getElementById('invPanelLabel').innerText = "Configuration"; } 
        else { DB.currentInvs = DB.invs; document.getElementById('invPanelLabel').innerText = "Renversement (A Z E R)"; }
        
        const validIds = DB.chords.map(c => c.id);
        const hasInvalid = this.data.settings.activeC.some(id => !validIds.includes(id));
        if(hasInvalid || this.data.settings.activeC.length === 0) { this.data.settings.activeC = validIds; }
        
        if(this.data.currentSet === 'laboratory') { this.data.settings.activeI = [0,1,2,3]; } 
        else { const validInvIds = DB.currentInvs.map(i => i.id); this.data.settings.activeI = validInvIds; }

        this.data.settings.activeC = this.data.settings.activeC.filter(id => !this.isLocked(id));
        if(this.data.settings.activeC.length === 0) { const available = DB.chords.find(c => !this.isLocked(c.id)); if(available) this.data.settings.activeC = [available.id]; }

        if(!silent) {
            this.save(); window.UI.renderBoard(); window.UI.renderSettings(); this.resetRound(true); this.playNew(); window.UI.showToast(`Ambiance : ${DB.sets[setName].name}`);
        }
    },

    calcGlobalStats() { let ok=0, tot=0; for(let k in this.data.stats.c) { ok+=this.data.stats.c[k].ok; tot+=this.data.stats.c[k].tot; } this.session.globalOk = ok; this.session.globalTot = tot; },

    getDifficultyMultiplier() {
        const activeC = this.data.settings.activeC.length; const activeI = this.data.settings.activeI.length; const maxC = DB.chords.length;
        if(this.data.currentSet === 'academy' && activeC === 1 && this.data.settings.activeC[0] === 'dim7') return 0; 
        if (activeC === 1 && activeI === 1) return 0;
        if ((activeC * activeI) <= 4) return 0.2;
        if (activeC === maxC && activeI === 1) return 0.75;
        return 1.0;
    },

    passMastery() {
        if(this.data.lvl < 20) return;
        if(confirm("Félicitations ! Vous allez valider ce niveau de Maîtrise.\n\nVotre Niveau reviendra à 1, mais vous gagnerez une Étoile et conserverez vos stats et badges.\n\nContinuer ?")) {
            this.data.mastery++; this.data.lvl = 1; this.data.xp = 0; this.data.next = 100;
            this.data.settings.activeC = this.data.settings.activeC.filter(id => !this.isLocked(id));
            if(this.data.settings.activeC.length === 0) { const available = DB.chords.find(c => !this.isLocked(c.id)); if(available) this.data.settings.activeC = [available.id]; }
            this.save(); window.UI.closeModals(); window.UI.renderBoard(); window.UI.updateHeader(); Audio.sfx('prestige'); window.UI.confetti(); setTimeout(() => window.UI.confetti(), 500); setTimeout(() => window.UI.confetti(), 1000); window.UI.showToast(`✨ Maîtrise ${this.data.mastery} atteinte !`); window.UI.showToast(`Nouveau contenu disponible dans les paramètres !`); window.UI.updateModeLocks(); setTimeout(() => { this.playNew(); }, 4000);
        }
    },

    setMode(m) {
        if(this.data.mastery === 0) {
            if(m === 'inverse' && this.data.lvl < 3) { window.UI.showToast("🔒 Débloqué au Niveau 3"); window.UI.vibrate([50,50]); return; }
            if(m === 'chrono' && this.data.lvl < 8) { window.UI.showToast("🔒 Débloqué au Niveau 8"); window.UI.vibrate([50,50]); return; }
            if(m === 'sprint' && this.data.lvl < 12) { window.UI.showToast("🔒 Débloqué au Niveau 12"); window.UI.vibrate([50,50]); return; }
        }
        if(Audio.ctx && Audio.ctx.state === 'suspended') Audio.ctx.resume();
        Audio.init(); this.session.mode = m;
        document.getElementById('modeZen').className = m==='zen'?'mode-opt active':'mode-opt';
        document.getElementById('modeChrono').className = m==='chrono'?'mode-opt active':'mode-opt';
        document.getElementById('modeSprint').className = m==='sprint'?'mode-opt active':'mode-opt';
        document.getElementById('modeInverse').className = m==='inverse'?'mode-opt active':'mode-opt';
        window.UI.updateModeLocks();
        document.getElementById('chronoDisplay').style.display = (m==='chrono' || m==='sprint') ?'block':'none';
        if(m === 'sprint') { document.getElementById('timerVal').style.display = 'none'; } else { document.getElementById('timerVal').style.display = 'inline'; }
        document.getElementById('toolsBar').className = (m==='sprint') ? 'tools-bar sprint-active' : 'tools-bar';
        if(m !== 'zen') { document.getElementById('scoreGroup').classList.add('active'); let best = 0; if(m === 'chrono') best = this.data.bestChrono; if(m === 'sprint') best = this.data.bestSprint; if(m === 'inverse') best = this.data.bestInverse; document.getElementById('highScoreVal').innerText = best; } else { document.getElementById('scoreGroup').classList.remove('active'); }
        const mainArea = document.getElementById('mainArea'); const appContainer = document.querySelector('.app-container');
        if(m === 'inverse') { mainArea.classList.add('quiz-mode'); appContainer.classList.add('quiz-mode'); document.getElementById('panelChord').style.display = 'none'; document.getElementById('invPanel').style.display = 'none'; document.getElementById('quizArea').style.display = 'flex'; } else { mainArea.classList.remove('quiz-mode'); appContainer.classList.remove('quiz-mode'); document.getElementById('panelChord').style.display = 'flex'; document.getElementById('invPanel').style.display = 'flex'; document.getElementById('quizArea').style.display = 'none'; }
        this.resetRound(true);
        if(m === 'inverse') this.playNewQuiz(); else this.playNew();
    },

    toggleSetting(type, id) {
        if(type === 'c' && this.isLocked(id)) { const chord = DB.chords.find(c => c.id === id); window.UI.showToast(`🔒 Débloqué au Niveau ${chord.unlockLvl}`); window.UI.vibrate([50,50]); return; }
        const list = type === 'c' ? this.data.settings.activeC : this.data.settings.activeI;
        const idx = list.indexOf(id);
        if (idx > -1) { if(list.length > 1) list.splice(idx, 1); } else { if(this.data.currentSet === 'jazz' && list.length >= 6) { window.UI.showToast("⚠️ Max 6 accords actifs"); return; } list.push(id); }
        this.save(); window.UI.renderBoard(); window.UI.renderSettings(); window.UI.updateHeader(); 
    },

    hardReset() { if(confirm("Sûr ?")) { localStorage.removeItem('harmonist_v4_final'); location.reload(); } },
    save() { localStorage.setItem('harmonist_v4_final', JSON.stringify(this.data)); Cloud.syncUserStats(this.data); },
    closeSettings() { window.UI.closeModals(); this.resetRound(true); if(this.session.mode==='inverse') this.playNewQuiz(); else this.playNew(); },

    resetRound(full=false) {
        if(this.timerRef) { clearInterval(this.timerRef); this.timerRef = null; }
        if(this.sprintRef) { clearInterval(this.sprintRef); this.sprintRef = null; }
        if(this.vignetteRef) { clearTimeout(this.vignetteRef); this.vignetteRef = null; }
        document.getElementById('vignette').className = 'vignette-overlay';
        window.UI.updateBackground(0);
        if(full) { 
            this.session.score=0; this.session.streak=0; 
            this.session.cleanStreak=0; this.session.openStreak=0; 
            this.session.fullConfigStreak=0; this.session.fastStreak=0;
            this.session.lowLifeRecovery = false;
            this.session.startTime = Date.now();
            this.session.pureStreak = 0; this.session.titleClicks = 0;
            this.session.lastChordType = null; this.session.jackpotStreak = 0;
            this.session.collectedRoots = new Set();
        }
        this.session.time = 60; this.session.lives = 3; this.session.done = false; 
        this.session.roundLocked = false; this.session.chord = null;
        this.session.quizUserChoice = null; this.session.lastActionTime = Date.now();
        this.session.audioStartTime = Date.now(); this.session.hint = false;
        this.session.hasReplayed = false; this.session.razorTriggered = false;
        window.UI.resetVisuals(); window.UI.updateHeader(); window.UI.updateChrono(); window.UI.msg("Prêt ?");
        document.getElementById('playBtn').innerHTML = "<span class='icon-lg'>▶</span><span>Écouter</span>";
        document.getElementById('valBtn').innerText = "Valider"; document.getElementById('valBtn').classList.remove('next'); document.getElementById('valBtn').disabled = true;
        document.getElementById('hintBtn').disabled = false; document.getElementById('hintBtn').style.opacity = '1';
    },

    clickTitle() { this.session.titleClicks = (this.session.titleClicks || 0) + 1; window.UI.vibrate(20); this.checkBadges(); },

    getNotes(type, invId, root, open, contextSet = null) {
        const currentSet = contextSet || this.data.currentSet;
        if(currentSet === 'laboratory') {
            let intervals = [];
            if(type && type.configs && type.configs[invId]) { intervals = type.configs[invId].iv; } else { intervals = [0, 4, 7]; }
            return intervals.map(i => root + i);
        }
        if(currentSet === 'jazz') {
            let notes = type.iv.map(x => root + x); 
            if(invId === 1) { if(notes.length >= 4) { const dropped = notes[notes.length - 2] - 12; notes.splice(notes.length - 2, 1); notes.push(dropped); notes.sort((a,b)=>a-b); } }
            else if(invId === 2) { const shell = [notes[0], notes[1]]; if(notes.length > 3) shell.push(notes[3]); else if(notes.length > 2) shell.push(notes[2]); notes = shell; }
            else if(invId === 3) { notes.shift(); }
            return notes;
        }
        let notes = type.iv.map(x => root + x);
        for(let i=0; i<invId; i++) notes.push(notes.shift() + 12);
        if(open) { const b = notes[0]; const r = notes.slice(1); r[0]+=12; if(this.rng()>0.5) r[1]+=12; r[2]+=12; notes = [b, ...r]; }
        return notes;
    },

    startSprintTimer(duration) {
        if(this.sprintRef) clearTimeout(this.sprintRef);
        if(this.vignetteRef) clearTimeout(this.vignetteRef);
        document.getElementById('vignette').className = 'vignette-overlay';
        const fill = document.getElementById('sprintFill');
        fill.style.transition = 'none'; fill.style.transform = 'scaleX(1)'; fill.className = 'sprint-bar-fill';
        if(duration > 7) fill.classList.add('easy'); else if(duration > 5) fill.classList.add('med'); else fill.classList.add('hard');
        void fill.offsetWidth; fill.style.transition = `transform ${duration}s linear`; fill.style.transform = 'scaleX(0)';
        const stressTime = duration * 0.7;
        this.vignetteRef = setTimeout(() => { if(!this.session.done) document.getElementById('vignette').classList.add('stress'); }, stressTime * 1000);
        this.sprintRef = setTimeout(() => { if(!this.session.done) { this.handleSprintFail(); } }, duration * 1000);
    },

    handleSprintFail() {
        if(this.session.roundLocked) return; 
        this.session.done = true; this.session.roundLocked = true; this.session.streak = 0; this.session.lives--;
        window.UI.updateBackground(0); window.UI.updateChrono(); Audio.sfx('lose'); window.UI.vibrate(300);
        const c = this.session.chord; const isDim = c.type.id === 'dim7';
        let invName = ""; if (this.data.currentSet === 'laboratory') { invName = c.type.configs[c.inv].name; } else if (!isDim) { invName = DB.currentInvs[c.inv].name; }
        window.UI.msg(`Raté : ${c.type.sub} ${invName}`, false);
        document.getElementById('vignette').className = 'vignette-overlay';
        document.getElementById('c-'+c.type.id).classList.add('correction'); if(c.type.id !== 'dim7') document.getElementById('i-'+c.inv).classList.add('correction');
        if(this.session.lives <= 0) { this.gameOver(); } 
        else { document.getElementById('valBtn').innerText = "Suivant"; document.getElementById('valBtn').classList.add('next'); document.getElementById('valBtn').disabled = false; document.getElementById('playBtn').innerHTML = "<span class='icon-lg'>▶</span><span>Suivant</span>"; document.getElementById('playBtn').disabled = false; }
    },
    
    generateQuizOption() {
        const activeC = DB.chords.filter(c => this.data.settings.activeC.includes(c.id));
        const type = activeC[Math.floor(this.rng() * activeC.length)];
        let invId = 0;
        if(this.data.currentSet === 'laboratory') {
            const availableInvs = this.data.settings.activeI.filter(idx => type.configs[idx]);
            if(availableInvs.length === 0) return { type, inv: 0 };
            invId = availableInvs[Math.floor(this.rng()*availableInvs.length)];
        } else {
            const ai = DB.currentInvs.filter(i => this.data.settings.activeI.includes(i.id));
            if(ai.length === 0) return { type, inv: 0 };
            const invObj = ai[Math.floor(this.rng()*ai.length)];
            invId = invObj.id;
            if(type.id === 'dim7' && this.data.currentSet !== 'jazz') invId = 0;
        }
        if(this.data.currentSet === 'laboratory' && !type.configs) return this.generateQuizOption();
        return { type, inv: invId };
    },

    getNotesWithFixedBass(type, inv, fixedBass) {
        let tempNotes = this.getNotes(type, inv, 0, false);
        let minInterval = Math.min(...tempNotes);
        let effectiveRoot = fixedBass - minInterval;
        return this.getNotes(type, inv, effectiveRoot, false);
    },

    playNewQuiz() {
        Audio.init(); if(!DB.chords.length) { this.loadSet('academy'); return; }
        this.session.done = false; this.session.roundLocked = false; this.session.quizUserChoice = null; this.session.hint = false;
        window.UI.resetVisuals(); this.session.lastActionTime = Date.now();
        
        const opts = []; let safeguard = 0;
        while(opts.length < 3 && safeguard < 100) {
            safeguard++; const candidate = this.generateQuizOption();
            const exists = opts.some(o => o.type.id === candidate.type.id && o.inv === candidate.inv);
            if(!exists) opts.push(candidate);
        }
        const fixedBass = 60 + Math.floor(this.rng() * 5); 
        this.session.quizOptions = opts.map(o => {
            const notes = this.getNotesWithFixedBass(o.type, o.inv, fixedBass);
            return { ...o, notes: notes, label: (this.data.currentSet === 'laboratory') ? o.type.configs[o.inv].name : o.type.name };
        });
        
        const correctIdx = Math.floor(this.rng() * opts.length);
        this.session.quizCorrectIdx = correctIdx;
        const target = this.session.quizOptions[correctIdx];
        if (!target) { this.playNewQuiz(); return; }
        this.session.chord = { ...target, root: fixedBass }; 
        window.UI.renderQuizOptions(this.session.quizOptions, target); window.UI.msg("Quel est ce son ?", "");
        document.getElementById('playBtn').disabled = true; document.getElementById('replayBtn').disabled = true; document.getElementById('hintBtn').disabled = false;
        document.getElementById('valBtn').innerText = "Valider"; document.getElementById('valBtn').className = "cmd-btn btn-action"; document.getElementById('valBtn').disabled = true;
        document.getElementById('playBtn').innerHTML = "<span class='icon-lg'>...</span><span>En cours</span>";
        this.session.hasReplayed = false;
    },

    selectQuiz(idx) {
        const opt = this.session.quizOptions[idx]; if(!opt) return;
        Audio.chord(opt.notes);
        const btn = document.getElementById(`qbtn-${idx}`); if(btn) { btn.classList.add('playing'); setTimeout(() => btn.classList.remove('playing'), 200); }
        if(this.session.done) return; 
        window.UI.vibrate(10); this.session.quizUserChoice = idx;
        window.UI.updateQuizSelection(idx); document.getElementById('valBtn').disabled = false;
    },

    playNew() {
        Audio.init(); if (!DB.chords.length) { this.loadSet(this.data.currentSet); return; }
        if(this.sprintRef) { clearTimeout(this.sprintRef); this.sprintRef = null; }
        if(this.vignetteRef) { clearTimeout(this.vignetteRef); this.vignetteRef = null; }
        document.getElementById('sprintFill').style.transition = 'none'; document.getElementById('sprintFill').style.transform = 'scaleX(1)'; document.getElementById('vignette').className = 'vignette-overlay';
        if(this.session.mode === 'chrono' && !this.timerRef && !this.session.chord) {
            this.timerRef = setInterval(() => { this.session.time--; window.UI.updateChrono(); if(this.session.time <= 0) { clearInterval(this.timerRef); this.timerRef = null; this.gameOver(); } }, 1000);
        }
        this.session.done = false; this.session.roundLocked = false; this.session.selC = null; this.session.selI = null; this.session.hint = false; 
        window.UI.resetVisuals(); this.session.lastActionTime = Date.now(); this.session.replayCount = 0; this.session.djClickTimes = []; this.session.selectionHistory = []; this.session.hasReplayed = false;

        const ac = DB.chords.filter(c => this.data.settings.activeC.includes(c.id));
        if(!ac.length) { this.data.settings.activeC = DB.chords.map(c=>c.id); this.playNew(); return; }
        
        const type = ac[Math.floor(this.rng()*ac.length)];
        if (this.session.lastChordType === type.id) { this.session.jackpotStreak++; } else { this.session.jackpotStreak = 1; }
        this.session.lastChordType = type.id;
        
        let invId = 0;
        if(this.data.currentSet === 'laboratory') {
            const availableInvs = this.data.settings.activeI.filter(idx => type.configs[idx]);
            if(availableInvs.length === 0) { this.data.settings.activeI = [0,1,2,3]; invId = 0; } else { invId = availableInvs[Math.floor(this.rng()*availableInvs.length)]; }
        } else {
            const ai = DB.currentInvs.filter(i => this.data.settings.activeI.includes(i.id));
            if(!ai.length) { this.data.settings.activeI = DB.currentInvs.map(i=>i.id); this.playNew(); return; }
            const invObj = ai[Math.floor(this.rng()*ai.length)];
            invId = invObj.id;
            if(type.id === 'dim7' && this.data.currentSet !== 'jazz') invId = 0;
        }
        
        const open = document.getElementById('toggleOpen').checked && this.data.currentSet === 'academy';
        const root = (open ? 36 : 48) + Math.floor(this.rng()*12);
        try {
            const notes = this.getNotes(type, invId, root, open);
            this.session.chord = { type, inv: invId, notes, root, open };
            Audio.chord(notes); this.session.audioStartTime = Date.now();
            if(this.data.currentSet === 'jazz' && invId === 3) { const bassFreq = 440 * Math.pow(2, (root - 69) / 12); Audio.playPureTone(bassFreq, Audio.ctx.currentTime, 1.5, 'sine'); Audio.playPureTone(bassFreq/2, Audio.ctx.currentTime, 1.5, 'sine'); }
        } catch (e) { console.error("Audio Gen Error", e); }

        window.UI.msg("Écoute...", "");
        document.getElementById('playBtn').disabled = true; document.getElementById('replayBtn').disabled = false; document.getElementById('hintBtn').disabled = false;
        document.getElementById('valBtn').innerText = "Valider"; document.getElementById('valBtn').className = "cmd-btn btn-action"; document.getElementById('valBtn').disabled = true;
        setTimeout(() => { document.getElementById('playBtn').innerHTML = "<span class='icon-lg'>...</span><span>En cours</span>"; }, 500);
        
        if(this.session.mode === 'sprint') {
            const reduction = this.session.streak * 0.25;
            const duration = Math.max(3.5, 10 - reduction);
            this.session.currentSprintTime = duration;
            this.startSprintTimer(duration);
        }
        
        if(this.data.settings.activeC.length === 1) { this.select('c', this.data.settings.activeC[0]); }
        if(this.data.currentSet !== 'laboratory' && this.data.settings.activeI.length === 1) { this.select('i', this.data.settings.activeI[0]); }
    },

    hint() { if(this.session.chord) { Audio.chord(this.session.chord.notes, true); if(!this.session.done) { this.session.hint = true; window.UI.msg("Indice utilisé"); } else { if(Piano) Piano.visualize(this.session.chord.notes); } } },
    replay() { if(this.session.chord) { this.session.replayCount++; this.session.hasReplayed = true; const now = Date.now(); this.session.djClickTimes.push(now); this.session.djClickTimes = this.session.djClickTimes.filter(t => now - t <= 5000); Audio.chord(this.session.chord.notes); if(this.session.done && Piano) Piano.visualize(this.session.chord.notes); } },
    
    preview(typeStr, id) {
        if(!this.session.chord) return;
        let targetTypeId = (typeStr === 'c') ? id : this.session.chord.type.id;
        let targetInvId = (typeStr === 'i') ? id : this.session.chord.inv;
        let targetType = DB.chords.find(c => c.id === targetTypeId); if(!targetType) return;
        if(targetTypeId === 'dim7' && this.data.currentSet !== 'jazz') targetInvId = 0;
        const isOpen = this.session.chord.open;
        const refBass = Math.min(...this.session.chord.notes);
        const draftNotes = this.getNotes(targetType, targetInvId, 60, isOpen);
        const draftBass = Math.min(...draftNotes);
        const shift = refBass - draftBass;
        const finalNotes = draftNotes.map(n => n + shift);
        Audio.chord(finalNotes);
        const elId = (typeStr === 'c') ? 'c-' + id : 'i-' + id;
        const el = document.getElementById(elId); if(el) { el.classList.add('playing'); setTimeout(() => el.classList.remove('playing'), 200); }
    },

    select(type, id) {
        window.UI.vibrate(10);
        if(this.session.done) { this.preview(type, id); return; }
        if(type === 'c') {
            this.session.selC = id; this.session.selectionHistory.push(id);
            const isDim = (id === 'dim7' && this.data.currentSet !== 'jazz');
            const p = document.getElementById('invPanel'); if(p) { p.style.opacity = isDim ? '0.3' : '1'; p.style.pointerEvents = isDim ? 'none' : 'auto'; }
            if(isDim) this.session.selI = -1; else if(this.session.selI === -1) this.session.selI = null;
            if(this.data.currentSet === 'laboratory') { window.UI.renderBoard(); }
        } else { this.session.selI = id; }
        window.UI.renderSel();
    },

    handleMain() { 
         if(this.session.done) { if(this.session.mode === 'inverse') this.playNewQuiz(); else this.playNew(); } 
         else if(!document.getElementById('valBtn').disabled) { if(this.session.mode === 'inverse') this.validateQuiz(); else this.validate(); }
    },

    validate() {
        if(this.session.roundLocked) return; 
        if(this.sprintRef) { clearTimeout(this.sprintRef); this.sprintRef = null; }
        if(this.vignetteRef) { clearTimeout(this.vignetteRef); this.vignetteRef = null; }
        document.getElementById('sprintFill').style.transition = 'none'; document.getElementById('vignette').className = 'vignette-overlay';
        const c = this.session.chord; const okC = this.session.selC === c.type.id; const isDim = c.type.id === 'dim7' && this.data.currentSet !== 'jazz'; const okI = isDim ? true : (this.session.selI === c.inv);
        this.session.done = true; this.session.roundLocked = true; 
        this.processWin(okC, okI); window.UI.reveal(okC, okI);
    },
    
    validateQuiz() {
        if(this.session.roundLocked) return; 
        this.session.done = true; this.session.roundLocked = true;
        const userIdx = this.session.quizUserChoice; const correctIdx = this.session.quizCorrectIdx; const userOpt = this.session.quizOptions[userIdx]; const corrOpt = this.session.quizOptions[correctIdx];
        const okC = userOpt.type.id === corrOpt.type.id; let okI = userOpt.inv === corrOpt.inv; if (corrOpt.type.id === 'dim7' && this.data.currentSet !== 'jazz') okI = true;
        Audio.chord(corrOpt.notes);
        this.processWin(okC, okI);
        window.UI.revealQuiz(userIdx, correctIdx, this.session.quizOptions);
    },

    processWin(okC, okI) {
        const win = okC && okI; const c = this.session.chord; const isDim = c.type.id === 'dim7' && this.data.currentSet !== 'jazz'; const difficultyMult = this.getDifficultyMultiplier(); const isTrivial = difficultyMult === 0;
        const getRank = (ok) => { if(ok >= 100) return 3; if(ok >= 50) return 2; if(ok >= 20) return 1; return 0; };
        let oldCRank = 0; let oldIRank = 0; let invObj = null;
        
        if(!isTrivial) {
            const cStat = this.data.stats.c[c.type.id]; if(cStat) oldCRank = getRank(cStat.ok);
            if(this.data.currentSet === 'jazz') { invObj = this.data.stats.v[c.inv]; } else if (this.data.currentSet === 'laboratory') { invObj = this.data.stats.l[`${c.type.id}_${c.inv}`]; } else { invObj = this.data.stats.i[c.inv]; } if(invObj) oldIRank = getRank(invObj.ok);
        }
        
        if(!isTrivial) {
            if(this.data.currentSet === 'jazz') { if(!this.data.stats.v[c.inv]) this.data.stats.v[c.inv] = {ok:0, tot:0}; this.data.stats.v[c.inv].tot++; if(okI) this.data.stats.v[c.inv].ok++; } 
            else if(this.data.currentSet === 'laboratory') { const lKey = `${c.type.id}_${c.inv}`; if(!this.data.stats.l[lKey]) this.data.stats.l[lKey] = {ok:0, tot:0}; this.data.stats.l[lKey].tot++; if(okI) this.data.stats.l[lKey].ok++; } 
            else { if(!isDim) { if(!this.data.stats.i[c.inv]) this.data.stats.i[c.inv] = {ok:0, tot:0}; this.data.stats.i[c.inv].tot++; if(okI) this.data.stats.i[c.inv].ok++; } }
            if(!this.data.stats.c[c.type.id]) this.data.stats.c[c.type.id] = {ok:0, tot:0}; this.data.stats.c[c.type.id].tot++; if(okC) this.data.stats.c[c.type.id].ok++;
            this.data.stats.totalPlayed++; this.calcGlobalStats();
            if(win) { const comboID = `${c.type.id}-${c.inv}`; if(!this.data.stats.combos.includes(comboID)) this.data.stats.combos.push(comboID); }
        }
        
        if(win) {
            let basePts = 50; if(document.getElementById('toggleOpen').checked) basePts = 75; if(this.session.hint) basePts = 20;
            if(this.session.mode === 'sprint') { const speedMultiplier = 10 / this.session.currentSprintTime; basePts = Math.round(basePts * speedMultiplier); }
            const rawBonus = this.session.hint ? 0 : (this.session.streak * 10); const totalRaw = basePts + rawBonus; let totalGain = Math.round(totalRaw * difficultyMult);
            if(isTrivial) totalGain = 0;
            this.session.score += totalGain;
            let badgeUnlocked = false; let levelUp = false; let rankUp = false;
            
            if(!isTrivial) {
                const newCStat = this.data.stats.c[c.type.id]; const newCRank = newCStat ? getRank(newCStat.ok) : 0;
                let newIRank = 0; let newInvObj = null; if(this.data.currentSet === 'jazz') newInvObj = this.data.stats.v[c.inv]; else if(this.data.currentSet === 'laboratory') newInvObj = this.data.stats.l[`${c.type.id}_${c.inv}`]; else newInvObj = this.data.stats.i[c.inv]; if(newInvObj) newIRank = getRank(newInvObj.ok);
                const rankMessagesC = { 1: `${c.type.sub} : Rang Bronze débloqué !`, 2: `${c.type.sub} : Rang Argent (Solide) !`, 3: `${c.type.sub} : Rang Or (Maîtrise) !` };
                const rankMessagesI = { 1: "Variation : Rang Bronze atteint", 2: "Variation : Niveau Argent", 3: "Variation : Virtuose (Or)" };
                if(newCRank > oldCRank) { rankUp = true; const msg = rankMessagesC[newCRank] || `${c.type.sub} : Niveau Supérieur !`; window.UI.showToast(msg); } 
                else if (!isDim && newIRank > oldIRank) { rankUp = true; const msg = rankMessagesI[newIRank] || "Variation améliorée !"; window.UI.showToast(msg); }
                
                this.data.tempToday.tot++; this.data.tempToday.ok++;
                if(this.data.tempToday.tot >= 5) { const todayStr = this.data.tempToday.date; const lastIdx = this.data.history.length - 1; if(lastIdx >= 0 && this.data.history[lastIdx].date === todayStr) { this.data.history[lastIdx] = { ...this.data.tempToday }; } else { this.data.history.push({ ...this.data.tempToday }); if(this.data.history.length > 7) this.data.history.shift(); } }
                if(!this.session.hint) { this.session.streak++; window.UI.triggerCombo(this.session.streak); }
                if (this.data.lvl < 20) { this.data.xp += totalGain; if(this.data.xp >= this.data.next) { this.data.xp -= this.data.next; this.data.lvl++; this.data.next = Math.floor(this.data.next * 1.2); levelUp = true; window.UI.showLevelUp(); window.UI.updateModeLocks(); if(this.data.mastery === 0) { if(this.data.lvl === 3) setTimeout(()=> window.UI.showToast("🔓 Mode Inverse Débloqué !"), 2000); if(this.data.lvl === 8) setTimeout(()=> window.UI.showToast("🔓 Mode Chrono Débloqué !"), 2000); if(this.data.lvl === 12) setTimeout(()=> window.UI.showToast("🔓 Mode Sprint Débloqué !"), 2000); } } } else { this.data.xp = this.data.next; }
                
                if(!this.session.hint) this.session.cleanStreak++; else this.session.cleanStreak = 0; if(c.open) this.session.openStreak++; else this.session.openStreak = 0;
                const allC = this.data.settings.activeC.length === DB.chords.length; const allI = (this.data.currentSet === 'laboratory') ? true : (this.data.settings.activeI.length === DB.currentInvs.length); if(allC && allI) this.session.fullConfigStreak++; else this.session.fullConfigStreak = 0;
                const reactionTime = (Date.now() - this.session.lastActionTime); if(reactionTime < 2000) this.session.fastStreak++; else this.session.fastStreak = 0; 
                const reactionFromAudio = (Date.now() - this.session.audioStartTime); this.session.lastReactionTime = reactionFromAudio;
                
                if(c.type.id === 'maj7' || c.type.id === 'min7') this.data.stats.str_jazz++; if(c.type.id === 'minmaj7') this.data.stats.str_007++; if(c.type.id === 'dim7') this.data.stats.str_dim++; if(!isDim && c.inv !== 0) this.data.stats.str_inv++; if(this.session.lives === 1) this.session.lowLifeRecovery = true;
                if(c.type.id === 'struct_36') this.session.str36Streak++; else this.session.str36Streak = 0; if(c.type.id === 'struct_45tr') this.session.str45Streak++; else this.session.str45Streak = 0; if(['struct_36', 'struct_45tr'].includes(c.type.id)) this.session.geoStreak++; else this.session.geoStreak = 0; if(c.type.id === 'trichord') this.session.triStreak++; else this.session.triStreak = 0;
                if(this.data.currentSet === 'jazz' && c.inv === 3) this.session.rootlessStreak++; else this.session.rootlessStreak = 0; if(this.data.settings.activeC.length === 1) this.session.monoStreak++; else this.session.monoStreak = 0;
                const curHash = `${c.type.id}-${c.inv}-${c.root}`; this.session.dejaVu = (this.session.prevChordHash === curHash); this.session.prevChordHash = curHash;
                if (!this.session.hasReplayed) this.session.pureStreak++; else this.session.pureStreak = 0;
                if (this.session.mode === 'chrono' && this.session.time <= 2) { this.session.razorTriggered = true; } else { this.session.razorTriggered = false; }
                if (!this.session.collectedRoots) this.session.collectedRoots = new Set(); this.session.collectedRoots.add(this.session.chord.root % 12);

                window.UI.vibrate([50,50,50]); window.UI.confetti(); window.UI.msg(this.session.streak > 2 ? `SÉRIE x${this.session.streak} !` : "EXCELLENT !", true);
                badgeUnlocked = this.checkBadges();
            } else { window.UI.msg("Correct ! (Mode Trivial)", true); }
            if(this.session.mode === 'chrono') this.session.time += 3;
            let soundToPlay = 'win'; if (this.data.lvl === 20 && levelUp) soundToPlay = 'max'; else if (levelUp) soundToPlay = 'lvl'; if (rankUp) soundToPlay = 'rankup'; if (badgeUnlocked) soundToPlay = 'badge'; Audio.sfx(soundToPlay);
        } else {
            this.session.streak = 0; this.session.cleanStreak = 0; this.session.openStreak = 0; this.session.fullConfigStreak = 0; this.session.fastStreak = 0;
            if(c.type.id === 'maj7' || c.type.id === 'min7') this.data.stats.str_jazz = 0; if(c.type.id === 'minmaj7') this.data.stats.str_007 = 0; if(c.type.id === 'dim7') this.data.stats.str_dim = 0; if(!isDim && c.inv !== 0) this.data.stats.str_inv = 0;
            this.session.str36Streak = 0; this.session.str45Streak = 0; this.session.geoStreak = 0; this.session.triStreak = 0; this.session.rootlessStreak = 0; this.session.monoStreak = 0; this.session.dejaVu = false;
            this.session.pureStreak = 0; this.session.jackpotStreak = 0;

            Audio.sfx('lose'); window.UI.vibrate(300); window.UI.updateBackground(0);
            let invName = ""; if(this.data.currentSet === 'laboratory') invName = c.type.configs[c.inv].name; else if(!isDim) invName = DB.currentInvs[c.inv].name;
            window.UI.msg(`Raté : ${c.type.sub} ${invName}`, false);
            
            // MORT SUBITE MODE INVERSE
            if (this.session.mode === 'inverse') {
                this.gameOver();
                return;
            }

            if(this.session.mode === 'chrono' || this.session.mode === 'sprint') { 
                this.session.lives--; 
                if(this.session.lives <= 0) return this.gameOver(); 
            }
        }
        window.UI.updateHeader(); window.UI.updateChrono(); this.save();
        document.getElementById('hintBtn').disabled = false; document.getElementById('hintBtn').style.opacity = '1';
        const btn = document.getElementById('valBtn'); btn.innerText = "Suivant"; btn.classList.add('next'); btn.disabled = false;
        const play = document.getElementById('playBtn'); play.innerHTML = "<span class='icon-lg'>▶</span><span>Suivant</span>"; play.disabled = false;
    },

    checkBadges() {
        let unlockedSomething = false;
        BADGES.forEach(b => {
            if(!this.data.badges.includes(b.id)) { if(b.check(this.data, this.session)) { this.data.badges.push(b.id); window.UI.showBadge(b); unlockedSomething = true; this.save(); } }
        });
        return unlockedSomething;
    },

    gameOver() {
        if(!this.data.stats.modesPlayed.includes(this.session.mode)) { this.data.stats.modesPlayed.push(this.session.mode); }
        const badged = this.checkBadges(); if(badged) Audio.sfx('badge');
        let isBest = false;
        if(this.session.mode === 'chrono' && this.session.score > this.data.bestChrono) { this.data.bestChrono = this.session.score; isBest=true; }
        if(this.session.mode === 'sprint' && this.session.score > this.data.bestSprint) { this.data.bestSprint = this.session.score; isBest=true; }
        if(this.session.mode === 'inverse' && this.session.score > this.data.bestInverse) { this.data.bestInverse = this.session.score; isBest=true; }
        this.save(); 
        
        // ENVOI CLOUD (Pseudo + Mastery)
        if(this.session.score > 0) {
            Cloud.submitScore(this.session.mode, this.session.score, this.data.username, this.data.mastery);
        }
        
        document.getElementById('endScore').innerText = this.session.score;
        document.getElementById('endHighScore').innerText = "Record: " + (this.session.mode==='chrono'?this.data.bestChrono:this.session.mode==='sprint'?this.data.bestSprint:this.data.bestInverse);
        window.UI.openModal('modalGameOver', true);
    },
    
    replaySameMode() { window.UI.closeModals(); this.setMode(this.session.mode); },

    analyzeCoach() {
        const s = this.session; const d = this.data; const rand = (arr) => arr[Math.floor(this.rng() * arr.length)];
        const sTot = s.globalTot; const sOk = s.globalOk; const sAcc = sTot > 0 ? (sOk / sTot) : 0;
        let gOk = 0, gTot = 0; for(let k in d.stats.c) { gOk += d.stats.c[k].ok; gTot += d.stats.c[k].tot; } const gAcc = gTot > 0 ? (gOk / gTot) : 0;
        if(sTot < 5 && gTot < 20) { return { t: "Débutant", m: rand(COACH_DB.start) }; }
        if(gAcc > 0.70 && sTot > 10 && sAcc < 0.50) { return { t: "Santé ☕", m: rand(COACH_DB.critical) }; }
        if (d.stats && d.stats.c) { let candidates = []; for(let cid in d.stats.c) { const st = d.stats.c[cid]; if(st && st.tot >= 5 && (st.ok / st.tot) < 0.45) { if(COACH_DB.weakness[cid]) { candidates.push(cid); } } } if(candidates.length > 0) { const chosenCid = rand(candidates); const tip = rand(COACH_DB.weakness[chosenCid]); return { t: tip.t, m: tip.m, target: chosenCid }; } }
        if(s.fastStreak > 3 && sAcc < 0.60) { return { t: "Vitesse ⚠️", m: rand(COACH_DB.speed_warn) }; }
        if(gAcc < 0.60 && s.streak >= 8) { return { t: "Déclic 💡", m: rand(COACH_DB.breakthrough) }; }
        if(sTot > 40 && sAcc < 0.50) { return { t: "Persévérance 💪", m: rand(COACH_DB.effort) }; }
        if(sTot > 5 && (s.replayCount / sTot) > 2.5 && sAcc > 0.80) { return { t: "Confiance 🦁", m: rand(COACH_DB.patience) }; }
        if(s.streak >= 12) { return { t: "En Feu 🔥", m: rand(COACH_DB.streak) }; }
        return { t: "Rappel 🧠", m: rand(COACH_DB.theory) };
    }
};
