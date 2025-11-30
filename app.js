

import { DB, BADGES, COACH_DB } from './data.js';
import { Audio, Piano } from './audio.js';
import { UI } from './ui.js';

export const App = {
    data: { 
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
        startTime: 0, cleanStreak: 0, openStreak: 0, fullConfigStreak: 0, fastStreak: 0, lowLifeRecovery: false, lastActionTime: 0
    },
    timerRef: null,
    sprintRef: null,
    vignetteRef: null,

    init() {
        try {
            const s = JSON.parse(localStorage.getItem('harmonist_v4_final') || '{}');
            if(s.xp !== undefined) { 
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

                if(s.settings && s.settings.activeC) {
                    this.data.settings = s.settings;
                }
            }
        } catch (e) {
            console.error("Save Corrupted, resetting", e);
        }

        const todayStr = new Date().toLocaleDateString('fr-FR', {day: 'numeric', month: 'numeric'});
        if(this.data.tempToday.date !== todayStr) { this.data.tempToday = { date: todayStr, ok: 0, tot: 0 }; }
        
        this.loadSet(this.data.currentSet, true);
        this.calcGlobalStats(); 
        window.UI.renderBoard(); 
        window.UI.updateHeader();
        window.UI.updateModeLocks();
        Piano.init(); 
    },

    // CENTRALIZED LOCKING LOGIC
    isLocked(id) {
        const c = DB.chords.find(x => x.id === id);
        if(!c) return false;
        
        // Jazz Logic: Mastery 1 + Level progression
        if(this.data.currentSet === 'jazz' && this.data.mastery === 1) {
            return (c.unlockLvl && c.unlockLvl > this.data.lvl);
        }
        
        // Lab Logic: Always Level progression
        if(this.data.currentSet === 'laboratory') {
            return (c.unlockLvl && c.unlockLvl > this.data.lvl);
        }
        
        return false;
    },

    loadSet(setName, silent = false) {
        if(!DB.sets[setName]) setName = 'academy';
        this.data.currentSet = setName;
        DB.chords = DB.sets[setName].chords;
        
        if(DB.sets[setName].mode === 'jazz') {
            DB.currentInvs = DB.voicings;
            document.getElementById('invPanelLabel').innerText = "Voicing (Texture)";
        } else if (DB.sets[setName].mode === 'lab') {
            DB.currentInvs = DB.lab_configs;
            document.getElementById('invPanelLabel').innerText = "Configuration";
        } else {
            DB.currentInvs = DB.invs;
            document.getElementById('invPanelLabel').innerText = "Renversement (A Z E R)";
        }
        
        const validIds = DB.chords.map(c => c.id);
        const hasInvalid = this.data.settings.activeC.some(id => !validIds.includes(id));
        if(hasInvalid || this.data.settings.activeC.length === 0) {
             this.data.settings.activeC = validIds;
        }
        const validInvIds = DB.currentInvs.map(i => i.id);
        this.data.settings.activeI = validInvIds;

        // SANITIZATION: Filter out locked items based on current level/mastery
        this.data.settings.activeC = this.data.settings.activeC.filter(id => !this.isLocked(id));
        
        // Ensure at least one chord is active (fallback to first available)
        if(this.data.settings.activeC.length === 0) {
            const available = DB.chords.find(c => !this.isLocked(c.id));
            if(available) this.data.settings.activeC = [available.id];
        }

        if(!silent) {
            this.save();
            window.UI.renderBoard();
            window.UI.renderSettings();
            this.resetRound(true);
            this.playNew();
            window.UI.showToast(`Ambiance : ${DB.sets[setName].name}`);
        }
    },

    calcGlobalStats() { let ok=0, tot=0; for(let k in this.data.stats.c) { ok+=this.data.stats.c[k].ok; tot+=this.data.stats.c[k].tot; } this.session.globalOk = ok; this.session.globalTot = tot; },

    getDifficultyMultiplier() {
        const activeC = this.data.settings.activeC.length;
        const activeI = this.data.settings.activeI.length;
        const maxC = DB.chords.length;
        if (activeC === 1 && activeI === 1) return 0;
        if ((activeC * activeI) <= 4) return 0.2;
        if (activeC === maxC && activeI === 1) return 0.75;
        return 1.0;
    },

    passMastery() {
        if(this.data.lvl < 20) return;
        if(confirm("Félicitations ! Vous allez valider ce niveau de Maîtrise.\n\nVotre Niveau reviendra à 1, mais vous gagnerez une Étoile et conserverez vos stats et badges.\n\nContinuer ?")) {
            this.data.mastery++;
            this.data.lvl = 1; // Reset Level
            this.data.xp = 0;
            this.data.next = 100;
            
            // CLEANUP: Remove locked items since Level dropped to 1
            this.data.settings.activeC = this.data.settings.activeC.filter(id => !this.isLocked(id));
            if(this.data.settings.activeC.length === 0) {
                 const available = DB.chords.find(c => !this.isLocked(c.id));
                 if(available) this.data.settings.activeC = [available.id];
            }

            this.save();
            window.UI.closeModals();
            window.UI.renderBoard(); // Update visual board
            window.UI.updateHeader();
            Audio.sfx('prestige');
            window.UI.confetti();
            setTimeout(() => window.UI.confetti(), 500);
            setTimeout(() => window.UI.confetti(), 1000);
            window.UI.showToast(`✨ Maîtrise ${this.data.mastery} atteinte !`);
            window.UI.showToast(`Nouveau contenu disponible dans les paramètres !`);
            window.UI.updateModeLocks();
            setTimeout(() => { this.playNew(); }, 4000);
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
        if(m === 'sprint') { document.getElementById('timerVal').style.display = 'none'; } 
        else { document.getElementById('timerVal').style.display = 'inline'; }
        document.getElementById('toolsBar').className = (m==='sprint') ? 'tools-bar sprint-active' : 'tools-bar';
        if(m !== 'zen') {
            document.getElementById('scoreGroup').classList.add('active');
            let best = 0;
            if(m === 'chrono') best = this.data.bestChrono;
            if(m === 'sprint') best = this.data.bestSprint;
            if(m === 'inverse') best = this.data.bestInverse;
            document.getElementById('highScoreVal').innerText = best;
        } else {
            document.getElementById('scoreGroup').classList.remove('active');
        }
        const mainArea = document.getElementById('mainArea');
        const appContainer = document.querySelector('.app-container');
        if(m === 'inverse') {
            mainArea.classList.add('quiz-mode');
            appContainer.classList.add('quiz-mode');
            document.getElementById('panelChord').style.display = 'none';
            document.getElementById('invPanel').style.display = 'none';
            document.getElementById('quizArea').style.display = 'flex';
        } else {
            mainArea.classList.remove('quiz-mode');
            appContainer.classList.remove('quiz-mode');
            document.getElementById('panelChord').style.display = 'flex';
            document.getElementById('invPanel').style.display = 'flex';
            document.getElementById('quizArea').style.display = 'none';
        }
        this.resetRound(true);
        if(m === 'inverse') this.playNewQuiz(); else this.playNew();
    },

    toggleSetting(type, id) {
        // Use Centralized Locking Logic
        if(type === 'c' && this.isLocked(id)) {
            const chord = DB.chords.find(c => c.id === id);
            window.UI.showToast(`🔒 Débloqué au Niveau ${chord.unlockLvl}`);
            window.UI.vibrate([50,50]);
            return;
        }

        const list = type === 'c' ? this.data.settings.activeC : this.data.settings.activeI;
        const idx = list.indexOf(id);
        if (idx > -1) { 
            if(list.length > 1) list.splice(idx, 1); 
        } else { 
            if(this.data.currentSet === 'jazz' && list.length >= 6) {
                window.UI.showToast("⚠️ Max 6 accords actifs");
                return;
            }
            list.push(id); 
        }
        this.save(); window.UI.renderBoard(); window.UI.renderSettings();
        window.UI.updateHeader(); 
    },

    hardReset() { if(confirm("Sûr ?")) { localStorage.removeItem('harmonist_v4_final'); location.reload(); } },
    save() { localStorage.setItem('harmonist_v4_final', JSON.stringify(this.data)); },
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
        }
        this.session.time = 60; this.session.lives = 3; this.session.done = false; 
        this.session.roundLocked = false; 
        this.session.chord = null;
        this.session.quizUserChoice = null;
        this.session.lastActionTime = Date.now();
        this.session.hint = false;
        window.UI.resetVisuals(); window.UI.updateHeader(); window.UI.updateChrono(); window.UI.msg("Prêt ?");
        document.getElementById('playBtn').innerHTML = "<span class='icon-lg'>▶</span><span>Écouter</span>";
        document.getElementById('valBtn').innerText = "Valider";
        document.getElementById('valBtn').classList.remove('next');
        document.getElementById('valBtn').disabled = true;
        document.getElementById('hintBtn').disabled = false;
        document.getElementById('hintBtn').style.opacity = '1';
    },

    getNotes(type, invId, root, open) {
        if(this.data.currentSet === 'laboratory') {
            let intervals = [];
            // Fallback for mixed state (avoid crash)
            if (!type || !type.id) return [root, root+4, root+7]; 

            if(type.id === 'struct_36') {
                if(invId === 0) intervals = [0, 3, 11]; 
                if(invId === 1) intervals = [0, 8, 11]; 
                if(invId === 2) intervals = [0, 4, 13]; 
                if(invId === 3) intervals = [0, 9, 13]; 
            }
            else if(type.id === 'struct_45tr') {
                // FIXED SEMANTIC AUDIO MATCHING VISUALS
                if(invId === 0) intervals = [0, 5, 11]; // Pos Basse: Basse + 4te + Tr
                if(invId === 1) intervals = [0, 6, 11]; // Pos Haute: Basse + Tr + 4te
                if(invId === 2) intervals = [0, 7, 13]; // Pos Basse: Basse + 5te + Tr
                if(invId === 3) intervals = [0, 6, 13]; // Pos Haute: Basse + Tr + 5te
            } 
            else if(type.id === 'trichord') {
                if(invId === 0) intervals = [0, 1, 2]; // Chromatique
                if(invId === 1) intervals = [0, 1, 6]; // Viennois
                if(invId === 2) intervals = [0, 2, 4]; // Par Tons
                if(invId === 3) intervals = [0, 1, 4]; // Octatonique
            }
            else if(type.id === 'sus_sym') {
                if(invId === 0) intervals = [0, 2, 7]; // Sus 2
                if(invId === 1) intervals = [0, 5, 7]; // Sus 4
                if(invId === 2) intervals = [0, 5, 10]; // Quartal
                if(invId === 3) intervals = [0, 7, 14]; // Quintal
            }
            else {
                // Safe fallback for Lab mode if weird chord is passed
                intervals = [0, 4, 7];
            }
            return intervals.map(i => root + i);
        }
        if(this.data.currentSet === 'jazz') {
            let notes = type.iv.map(x => root + x); 
            if(invId === 1) { 
                if(notes.length >= 4) {
                    const dropped = notes[notes.length - 2] - 12;
                    notes.splice(notes.length - 2, 1);
                    notes.push(dropped);
                    notes.sort((a,b)=>a-b);
                }
            }
            else if(invId === 2) { 
                const shell = [notes[0], notes[1]];
                if(notes.length > 3) shell.push(notes[3]); 
                else if(notes.length > 2) shell.push(notes[2]); 
                notes = shell;
            }
            else if(invId === 3) { notes.shift(); }
            return notes;
        }
        let notes = type.iv.map(x => root + x);
        for(let i=0; i<invId; i++) notes.push(notes.shift() + 12);
        if(open) {
            const b = notes[0]; const r = notes.slice(1);
            r[0]+=12; if(Math.random()>0.5) r[1]+=12; r[2]+=12;
            notes = [b, ...r];
        }
        return notes;
    },

    startSprintTimer(duration) {
        if(this.sprintRef) clearTimeout(this.sprintRef);
        if(this.vignetteRef) clearTimeout(this.vignetteRef);
        document.getElementById('vignette').className = 'vignette-overlay';
        const fill = document.getElementById('sprintFill');
        fill.style.transition = 'none';
        fill.style.transform = 'scaleX(1)';
        fill.className = 'sprint-bar-fill';
        if(duration > 7) fill.classList.add('easy');
        else if(duration > 5) fill.classList.add('med');
        else fill.classList.add('hard');
        void fill.offsetWidth;
        fill.style.transition = `transform ${duration}s linear`;
        fill.style.transform = 'scaleX(0)';
        const stressTime = duration * 0.7;
        this.vignetteRef = setTimeout(() => {
            if(!this.session.done) document.getElementById('vignette').classList.add('stress');
        }, stressTime * 1000);
        this.sprintRef = setTimeout(() => {
            if(!this.session.done) {
                this.handleSprintFail();
            }
        }, duration * 1000);
    },

    handleSprintFail() {
        if(this.session.roundLocked) return; 
        this.session.done = true;
        this.session.roundLocked = true;
        this.session.streak = 0;
        this.session.lives--;
        window.UI.updateBackground(0);
        window.UI.updateChrono();
        Audio.sfx('lose');
        window.UI.vibrate(300);
        const c = this.session.chord;
        const isDim = c.type.id === 'dim7';
        const invName = isDim ? "" : DB.currentInvs[c.inv].name;
        window.UI.msg(`Raté : ${c.type.sub} ${invName}`, false);
        document.getElementById('vignette').className = 'vignette-overlay';
        document.getElementById('c-'+c.type.id).classList.add('correction');
        if(c.type.id !== 'dim7') document.getElementById('i-'+c.inv).classList.add('correction');
        if(this.session.lives <= 0) {
            this.gameOver();
        } else {
            document.getElementById('valBtn').innerText = "Suivant";
            document.getElementById('valBtn').classList.add('next');
            document.getElementById('valBtn').disabled = false;
            document.getElementById('playBtn').innerHTML = "<span class='icon-lg'>▶</span><span>Suivant</span>"; 
            document.getElementById('playBtn').disabled = false;
        }
    },

    playNew() {
        Audio.init();
        
        // SAFEGUARD: Force reset if data corrupted (Empty Arrays)
        if (!DB.chords.length || !DB.currentInvs.length) {
            this.loadSet(this.data.currentSet);
            return;
        }

        if(this.sprintRef) { clearTimeout(this.sprintRef); this.sprintRef = null; }
        if(this.vignetteRef) { clearTimeout(this.vignetteRef); this.vignetteRef = null; }
        document.getElementById('sprintFill').style.transition = 'none';
        document.getElementById('sprintFill').style.transform = 'scaleX(1)';
        document.getElementById('vignette').className = 'vignette-overlay';
        if(this.session.mode === 'chrono' && !this.timerRef && !this.session.chord) {
            this.timerRef = setInterval(() => {
                this.session.time--; window.UI.updateChrono();
                if(this.session.time <= 0) { clearInterval(this.timerRef); this.timerRef = null; this.gameOver(); }
            }, 1000);
        }
        this.session.done = false; 
        this.session.roundLocked = false; 
        this.session.selC = null; 
        this.session.selI = null; 
        this.session.hint = false; 
        window.UI.resetVisuals();
        this.session.lastActionTime = Date.now();
        
        // SAFEGUARD: Ensure Active Lists match current DB
        const ac = DB.chords.filter(c => this.data.settings.activeC.includes(c.id));
        const ai = DB.currentInvs.filter(i => this.data.settings.activeI.includes(i.id));
        
        if(!ac.length || !ai.length) { 
            this.data.settings.activeC = DB.chords.map(c=>c.id); 
            this.data.settings.activeI = DB.currentInvs.map(i=>i.id); 
            this.playNew(); return; 
        }
        
        const type = ac[Math.floor(Math.random()*ac.length)];
        let inv = ai[Math.floor(Math.random()*ai.length)];
        
        if(type.id === 'dim7' && this.data.currentSet !== 'jazz') inv = DB.currentInvs.find(i => i.id === 0);
        
        // STATE LEAK FIX: Ensure Open Position only applies to Academy
        const open = document.getElementById('toggleOpen').checked && this.data.currentSet === 'academy';
        
        const root = (open ? 36 : 48) + Math.floor(Math.random()*12);
        
        try {
            const notes = this.getNotes(type, inv.id, root, open);
            this.session.chord = { type, inv: inv.id, notes, root, open };
            
            // Audio attempt inside try block
            Audio.chord(notes);
            if(this.data.currentSet === 'jazz' && inv.id === 3) {
                const bassFreq = 440 * Math.pow(2, (root - 69) / 12);
                Audio.playPureTone(bassFreq, Audio.ctx.currentTime, 1.5, 'sine'); 
                Audio.playPureTone(bassFreq/2, Audio.ctx.currentTime, 1.5, 'sine'); 
            }
        } catch (e) {
            console.error("Audio Gen Error", e);
        }

        // UI UPDATE : Guaranteed to run even if Audio fails
        window.UI.msg("Écoute...", "");
        document.getElementById('playBtn').disabled = true; 
        document.getElementById('replayBtn').disabled = false; 
        document.getElementById('hintBtn').disabled = false;
        document.getElementById('valBtn').innerText = "Valider"; 
        document.getElementById('valBtn').className = "cmd-btn btn-action"; 
        document.getElementById('valBtn').disabled = true;

        setTimeout(() => { document.getElementById('playBtn').innerHTML = "<span class='icon-lg'>...</span><span>En cours</span>"; }, 500);
        
        if(this.session.mode === 'sprint') {
            const reduction = this.session.streak * 0.25;
            const duration = Math.max(3.5, 10 - reduction);
            this.session.currentSprintTime = duration;
            this.startSprintTimer(duration);
        }
        if(this.data.settings.activeC.length === 1) { this.select('c', this.data.settings.activeC[0]); }
        if(this.data.settings.activeI.length === 1) { this.select('i', this.data.settings.activeI[0]); }
    },

    hint() { 
        if(this.session.chord) { 
            Audio.chord(this.session.chord.notes, true); 
            if(!this.session.done) { this.session.hint = true; window.UI.msg("Indice utilisé"); } 
            else { if(Piano) Piano.visualize(this.session.chord.notes); }
        } 
    },

    replay() { 
        if(this.session.chord) {
            Audio.chord(this.session.chord.notes);
            if(this.session.done && Piano) Piano.visualize(this.session.chord.notes);
        } 
    },
    
    preview(typeStr, id) {
        if(!this.session.chord) return;
        let targetTypeId = (typeStr === 'c') ? id : this.session.chord.type.id;
        let targetInvId = (typeStr === 'i') ? id : this.session.chord.inv;
        if(targetTypeId === 'dim7' && this.data.currentSet !== 'jazz') targetInvId = 0;
        const targetType = DB.chords.find(c => c.id === targetTypeId);
        const isOpen = this.session.chord.open;
        const notes = this.getNotes(targetType, targetInvId, 60, isOpen); 
        Audio.chord(notes);
        const elId = (typeStr === 'c') ? 'c-' + id : 'i-' + id;
        const el = document.getElementById(elId);
        if(el) { el.classList.add('playing'); setTimeout(() => el.classList.remove('playing'), 200); }
    },

    select(type, id) {
        window.UI.vibrate(10);
        if(this.session.done) { this.preview(type, id); return; }
        if(type === 'c') {
            this.session.selC = id;
            const isDim = (id === 'dim7' && this.data.currentSet !== 'jazz');
            const p = document.getElementById('invPanel');
            if(p) { p.style.opacity = isDim ? '0.3' : '1'; p.style.pointerEvents = isDim ? 'none' : 'auto'; }
            if(isDim) this.session.selI = -1; else if(this.session.selI === -1) this.session.selI = null;
            
            // REACTIVITY FIX FOR LAB: Force re-render board to update contextual intervals
            if(this.data.currentSet === 'laboratory') {
                window.UI.renderBoard();
            }
        } else { this.session.selI = id; }
        window.UI.renderSel();
    },

    handleMain() { 
         if(this.session.done) {
            if(this.session.mode === 'inverse') this.playNewQuiz();
            else this.playNew();
        } else if(!document.getElementById('valBtn').disabled) {
            if(this.session.mode === 'inverse') this.validateQuiz();
            else this.validate();
        }
    },

    validate() {
        if(this.session.roundLocked) return; 
        if(this.sprintRef) { clearTimeout(this.sprintRef); this.sprintRef = null; }
        if(this.vignetteRef) { clearTimeout(this.vignetteRef); this.vignetteRef = null; }
        document.getElementById('sprintFill').style.transition = 'none';
        document.getElementById('vignette').className = 'vignette-overlay';
        
        const c = this.session.chord;
        const okC = this.session.selC === c.type.id;
        const isDim = c.type.id === 'dim7' && this.data.currentSet !== 'jazz';
        const okI = isDim ? true : (this.session.selI === c.inv);
        
        this.session.done = true; 
        this.session.roundLocked = true; 
        
        // Pass distinct booleans for granular stats
        this.processWin(okC, okI);
        window.UI.reveal(okC, okI);
    },
    
    validateQuiz() {
        if(this.session.roundLocked) return; 
        this.session.done = true;
        this.session.roundLocked = true;
        
        const userIdx = this.session.quizUserChoice;
        const correctIdx = this.session.quizCorrectIdx;
        
        // Analyze user choice vs correct choice for partial stats
        const userOpt = this.session.quizOptions[userIdx];
        const corrOpt = this.session.quizOptions[correctIdx];

        const okC = userOpt.type.id === corrOpt.type.id;
        
        // Check inversion (handle Dim7 edge case)
        let okI = userOpt.inv === corrOpt.inv;
        if (corrOpt.type.id === 'dim7' && this.data.currentSet !== 'jazz') okI = true;
        
        const win = (userIdx === correctIdx); // Strict win for visual feedback on buttons
        
        this.processWin(okC, okI);
        
        document.querySelectorAll('.quiz-btn').forEach((btn, i) => {
            const o = this.session.quizOptions[i];
            
            // For Lab mode, we keep the specific HTML structure
            if(this.data.currentSet === 'laboratory') {
                btn.innerHTML = o.label; // Label contains the huge figure
            } else {
                btn.querySelector('.reveal').innerHTML = o.label;
            }
            
            if(i === correctIdx) btn.classList.add('correct');
            else if(i === userIdx && !win) btn.classList.add('wrong');
        });
    },

    processWin(okC, okI) {
        // STRICT GAMEPLAY WIN CONDITION (Must have both right for points/lives)
        const win = okC && okI;
        
        const c = this.session.chord;
        const isDim = c.type.id === 'dim7' && this.data.currentSet !== 'jazz';
        const difficultyMult = this.getDifficultyMultiplier();
        const isTrivial = difficultyMult === 0;
        const getRank = (ok) => {
            if(ok >= 100) return 3; 
            if(ok >= 50) return 2;  
            if(ok >= 20) return 1;  
            return 0;
        };
        let oldCRank = 0; let oldIRank = 0; let invObj = null;
        if(!isTrivial) {
            const cStat = this.data.stats.c[c.type.id];
            if(cStat) oldCRank = getRank(cStat.ok);
            if(this.data.currentSet === 'jazz') { invObj = this.data.stats.v[c.inv]; } 
            else if (this.data.currentSet === 'laboratory') { invObj = this.data.stats.l[c.inv]; } 
            else { invObj = this.data.stats.i[c.inv]; }
            if(invObj) oldIRank = getRank(invObj.ok);
        }
        
        if(!isTrivial) {
            // --- PARTIAL STATS UPDATE LOGIC ---
            
            // 1. UPDATE INVERSION STATS (Using okI)
            if(this.data.currentSet === 'jazz') {
                 if(!this.data.stats.v[c.inv]) this.data.stats.v[c.inv] = {ok:0, tot:0};
                 this.data.stats.v[c.inv].tot++;
                 if(okI) this.data.stats.v[c.inv].ok++;
            } else if(this.data.currentSet === 'laboratory') {
                 if(!this.data.stats.l[c.inv]) this.data.stats.l[c.inv] = {ok:0, tot:0};
                 this.data.stats.l[c.inv].tot++;
                 if(okI) this.data.stats.l[c.inv].ok++;
            } else {
                 if(!isDim) {
                     if(!this.data.stats.i[c.inv]) this.data.stats.i[c.inv] = {ok:0, tot:0};
                     this.data.stats.i[c.inv].tot++; 
                     if(okI) this.data.stats.i[c.inv].ok++;
                 }
            }

            // 2. UPDATE CHORD STATS (Using okC)
            if(!this.data.stats.c[c.type.id]) this.data.stats.c[c.type.id] = {ok:0, tot:0};
            this.data.stats.c[c.type.id].tot++; 
            if(okC) this.data.stats.c[c.type.id].ok++;
            
            this.data.stats.totalPlayed++; 
            this.calcGlobalStats();
            
            // Combos require STRICT WIN
            if(win) {
                const comboID = `${c.type.id}-${c.inv}`;
                if(!this.data.stats.combos.includes(comboID)) this.data.stats.combos.push(comboID);
            }
        }
        
        if(win) {
            let basePts = 50; if(document.getElementById('toggleOpen').checked) basePts = 75;
            if(this.session.hint) basePts = 20;
            if(this.session.mode === 'sprint') {
                const speedMultiplier = 10 / this.session.currentSprintTime; 
                basePts = Math.round(basePts * speedMultiplier);
            }
            let finalXP = Math.round(basePts * difficultyMult);
            const bonus = this.session.hint ? 0 : (this.session.streak * 10);
            let totalGain = finalXP + bonus;
            if(isTrivial) totalGain = 0;
            this.session.score += totalGain;
            let badgeUnlocked = false; let levelUp = false; let rankUp = false;
            if(!isTrivial) {
                const newCStat = this.data.stats.c[c.type.id];
                const newCRank = newCStat ? getRank(newCStat.ok) : 0;
                let newIRank = 0; let newInvObj = null;
                if(this.data.currentSet === 'jazz') newInvObj = this.data.stats.v[c.inv];
                else if(this.data.currentSet === 'laboratory') newInvObj = this.data.stats.l[c.inv];
                else newInvObj = this.data.stats.i[c.inv];
                if(newInvObj) newIRank = getRank(newInvObj.ok);
                if(newCRank > oldCRank) {
                    rankUp = true;
                    const rankNames = ["", "Bronze", "Argent", "Or"];
                    window.UI.showToast(`${c.type.sub} est passé en ${rankNames[newCRank]} !`);
                } else if (!isDim && newIRank > oldIRank) {
                    rankUp = true;
                    const rankNames = ["", "Bronze", "Argent", "Or"];
                    window.UI.showToast(`Renversement passé en ${rankNames[newIRank]} !`);
                }
                this.data.tempToday.tot++; this.data.tempToday.ok++;
                if(this.data.tempToday.tot >= 5) {
                    const todayStr = this.data.tempToday.date;
                    const lastIdx = this.data.history.length - 1;
                    if(lastIdx >= 0 && this.data.history[lastIdx].date === todayStr) { this.data.history[lastIdx] = { ...this.data.tempToday }; } 
                    else { this.data.history.push({ ...this.data.tempToday }); if(this.data.history.length > 7) this.data.history.shift(); }
                }
                if(!this.session.hint) { 
                    this.session.streak++; 
                    window.UI.triggerCombo(this.session.streak); 
                }
                if (this.data.lvl < 20) {
                    this.data.xp += totalGain;
                    if(this.data.xp >= this.data.next) {
                        this.data.xp -= this.data.next; this.data.lvl++; this.data.next = Math.floor(this.data.next * 1.2);
                        levelUp = true; window.UI.showLevelUp();
                        window.UI.updateModeLocks(); 
                        if(this.data.mastery === 0) {
                            if(this.data.lvl === 3) setTimeout(()=> window.UI.showToast("🔓 Mode Inverse Débloqué !"), 2000);
                            if(this.data.lvl === 8) setTimeout(()=> window.UI.showToast("🔓 Mode Chrono Débloqué !"), 2000);
                            if(this.data.lvl === 12) setTimeout(()=> window.UI.showToast("🔓 Mode Sprint Débloqué !"), 2000);
                        }
                    }
                } else { this.data.xp = this.data.next; }
                if(!this.session.hint) this.session.cleanStreak++; else this.session.cleanStreak = 0;
                if(c.open) this.session.openStreak++; else this.session.openStreak = 0;
                const allC = this.data.settings.activeC.length === DB.chords.length;
                const allI = this.data.settings.activeI.length === DB.currentInvs.length;
                if(allC && allI) this.session.fullConfigStreak++; else this.session.fullConfigStreak = 0;
                const reactionTime = (Date.now() - this.session.lastActionTime);
                if(reactionTime < 3500) this.session.fastStreak++; else this.session.fastStreak = 0; 
                if(c.type.id === 'maj7' || c.type.id === 'min7') this.data.stats.str_jazz++;
                if(c.type.id === 'minmaj7') this.data.stats.str_007++;
                if(c.type.id === 'dim7') this.data.stats.str_dim++;
                if(!isDim && c.inv !== 0) this.data.stats.str_inv++;
                if(this.session.lives === 1) this.session.lowLifeRecovery = true;
                window.UI.vibrate([50,50,50]); 
                window.UI.confetti(); 
                window.UI.msg(this.session.streak > 2 ? `SÉRIE x${this.session.streak} !` : "EXCELLENT !", true);
                badgeUnlocked = this.checkBadges();
            } else {
                window.UI.msg("Correct ! (Mode Trivial)", true);
            }
            if(this.session.mode === 'chrono') this.session.time += 3;
            let soundToPlay = 'win';
            if (this.data.lvl === 20 && levelUp) soundToPlay = 'max';
            else if (levelUp) soundToPlay = 'lvl';
            if (rankUp) soundToPlay = 'rankup'; 
            if (badgeUnlocked) soundToPlay = 'badge'; 
            Audio.sfx(soundToPlay);
        } else {
            this.session.streak = 0; 
            this.session.cleanStreak = 0; this.session.openStreak = 0; 
            this.session.fullConfigStreak = 0; this.session.fastStreak = 0;
            if(c.type.id === 'maj7' || c.type.id === 'min7') this.data.stats.str_jazz = 0;
            if(c.type.id === 'minmaj7') this.data.stats.str_007 = 0;
            if(c.type.id === 'dim7') this.data.stats.str_dim = 0;
            if(!isDim && c.inv !== 0) this.data.stats.str_inv = 0;
            Audio.sfx('lose'); window.UI.vibrate(300); window.UI.updateBackground(0);
            const invName = isDim ? "" : DB.currentInvs[c.inv].name;
            window.UI.msg(`Raté : ${c.type.sub} ${invName}`, false);
            if(this.session.mode === 'chrono' || this.session.mode === 'sprint') { 
                this.session.lives--; 
                if(this.session.lives <= 0) return this.gameOver(); 
            }
        }
        window.UI.updateHeader(); window.UI.updateChrono(); this.save();
        document.getElementById('hintBtn').disabled = false; 
        document.getElementById('hintBtn').style.opacity = '1';
        const btn = document.getElementById('valBtn'); btn.innerText = "Suivant"; btn.classList.add('next'); btn.disabled = false;
        const play = document.getElementById('playBtn'); play.innerHTML = "<span class='icon-lg'>▶</span><span>Suivant</span>"; play.disabled = false;
    },

    checkBadges() {
        let unlockedSomething = false;
        BADGES.forEach(b => {
            if(!this.data.badges.includes(b.id)) {
                if(b.check(this.data, this.session)) {
                    this.data.badges.push(b.id);
                    window.UI.showBadge(b);
                    unlockedSomething = true;
                    this.save();
                }
            }
        });
        return unlockedSomething;
    },

    gameOver() {
        if(!this.data.stats.modesPlayed.includes(this.session.mode)) {
            this.data.stats.modesPlayed.push(this.session.mode);
        }
        const badged = this.checkBadges();
        if(badged) Audio.sfx('badge');
        let isBest = false;
        if(this.session.mode === 'chrono' && this.session.score > this.data.bestChrono) { this.data.bestChrono = this.session.score; isBest=true; }
        if(this.session.mode === 'sprint' && this.session.score > this.data.bestSprint) { this.data.bestSprint = this.session.score; isBest=true; }
        if(this.session.mode === 'inverse' && this.session.score > this.data.bestInverse) { this.data.bestInverse = this.session.score; isBest=true; }
        this.save(); 
        document.getElementById('endScore').innerText = this.session.score;
        document.getElementById('endHighScore').innerText = "Record: " + (this.session.mode==='chrono'?this.data.bestChrono:this.session.mode==='sprint'?this.data.bestSprint:this.data.bestInverse);
        window.UI.openModal('modalGameOver', true);
    },
    
    replaySameMode() { window.UI.closeModals(); this.setMode(this.session.mode); },

    playNewQuiz() {
        Audio.init();
        this.session.done = false; 
        this.session.roundLocked = false;
        this.session.hint = false; 
        this.session.quizUserChoice = null;
        window.UI.resetVisuals();
        this.session.lastActionTime = Date.now();
        const ac = DB.chords.filter(c => this.data.settings.activeC.includes(c.id));
        const ai = DB.currentInvs.filter(i => this.data.settings.activeI.includes(i.id));
        if(!ac.length || !ai.length) { 
            this.data.settings.activeC = DB.chords.map(c=>c.id); 
            this.data.settings.activeI = DB.currentInvs.map(i=>i.id); 
            this.playNew(); return; 
        }
        const type = ac[Math.floor(Math.random()*ac.length)];
        let inv = ai[Math.floor(Math.random()*ai.length)];
        if(type.id === 'dim7' && this.data.currentSet !== 'jazz') inv = DB.currentInvs.find(i => i.id === 0);
        
        // STATE LEAK FIX: Force Open Position to false if not Academy
        const open = document.getElementById('toggleOpen').checked && this.data.currentSet === 'academy';
        
        const root = (open ? 36 : 48) + Math.floor(Math.random()*12);
        const notes = this.getNotes(type, inv.id, root, open);
        const realBass = Math.min(...notes);
        this.session.chord = { type, inv: inv.id, notes, root, open };
        let options = [];

        // FIX: Define missing variables for scope
        const poolC = ac.length ? ac : DB.chords;
        const poolI = ai.length ? ai : DB.currentInvs;
        
        const isLab = this.data.currentSet === 'laboratory';

        const genLbl = (t, i) => {
            // FIX: LAB QUIZ LABELING - DYNAMIC
            if (isLab) {
                const configId = i.id;
                
                if (t.id === 'trichord') {
                    // Vertical Recipe style for Trichords
                    let top='?', bot='?';
                    if(configId===0){top='1/2';bot='1/2';}
                    if(configId===1){top='1/2';bot='Tr';}
                    if(configId===2){top='1';bot='1';}
                    if(configId===3){top='1/2';bot='3M';}
                    return `<div class="figured-bass quiz-huge"><span>${top}</span><span>${bot}</span></div>`;
                }
                
                if (t.id === 'sus_sym') {
                    // Text style for Sus
                    let txt = "Sus ?";
                    if(configId===0) txt="Sus 2";
                    if(configId===1) txt="Sus 4";
                    if(configId===2) txt="Quartal";
                    if(configId===3) txt="Quintal";
                    return `<div style="font-size:2rem; font-weight:900;">${txt}</div>`;
                }

                // Default Structs logic
                let top = "?", bot = "?";
                if (t.id === 'struct_36') {
                    if(configId === 0) { top='6m'; bot='3m'; } 
                    if(configId === 1) { top='3m'; bot='6m'; } 
                    if(configId === 2) { top='6M'; bot='3M'; } 
                    if(configId === 3) { top='3M'; bot='6M'; } 
                } else if (t.id === 'struct_45tr') {
                    if(configId === 0) { top='Tr'; bot='4J'; }
                    if(configId === 1) { top='4J'; bot='Tr'; }
                    if(configId === 2) { top='Tr'; bot='5J'; }
                    if(configId === 3) { top='5J'; bot='Tr'; }
                }
                return `<div class="figured-bass quiz-huge"><span>${top}</span><span>${bot}</span></div>`;
            }
            
            let invH = "";
            if (i.figure && i.figure.length > 0) {
                invH = `<div class="figured-bass" style="font-size:0.6em; vertical-align:middle; margin-left:8px;">${i.figure.map(n=>`<span>${n}</span>`).join('')}</div>`;
            } else { invH = i.corr; }
            return `${t.tech} ${invH}`;
        };
        const targetHTML = genLbl(type, DB.currentInvs[inv.id]);
        document.getElementById('quizTargetLbl').innerHTML = targetHTML;
        const quizHint = document.querySelector('.quiz-hint-txt');
        if(quizHint) quizHint.innerText = "Trouve l'accord :";
        options.push({ type, inv: inv.id, notes, correct: true, label: genLbl(type, DB.currentInvs[inv.id]) });
        let attempts = 0;
        while(options.length < 3 && attempts < 50) {
            attempts++;
            let pC = (attempts < 10) ? poolC : (attempts < 20 ? poolC : DB.chords);
            let pI = (attempts < 10) ? poolI : DB.currentInvs;
            const cType = pC[Math.floor(Math.random()*pC.length)];
            let cInv = pI[Math.floor(Math.random()*pI.length)];
            if(cType.id === 'dim7' && this.data.currentSet !== 'jazz') cInv = DB.currentInvs.find(i => i.id === 0);
            const exists = options.find(o => o.type.id === cType.id && o.inv === cInv.id);
            if(exists) continue;
            const draftNotes = this.getNotes(cType, cInv.id, 60, open);
            const draftBass = Math.min(...draftNotes);
            const diff = realBass - draftBass;
            const finalNotes = draftNotes.map(n => n + diff);
            options.push({ type: cType, inv: cInv.id, notes: finalNotes, correct: false, label: genLbl(cType, DB.currentInvs[cInv.id]) });
        }
        options.sort(() => Math.random() - 0.5);
        this.session.quizOptions = options;
        this.session.quizCorrectIdx = options.findIndex(o => o.correct);
        
        const letters = ['A', 'B', 'C'];
        document.querySelectorAll('.quiz-btn').forEach((btn, i) => {
            btn.className = 'quiz-btn' + (isLab ? ' lab-mode' : '');
            
            if (isLab) {
                // Remove A/B/C letter, just show dot or nothing until reveal
                btn.innerHTML = '<span class="reveal">●</span>'; 
            } else {
                // Standard mode
                btn.innerHTML = letters[i] + '<span class="reveal">...</span>';
            }
        });
        window.UI.msg("Trouve l'accord !", "");
        document.getElementById('playBtn').disabled = true; 
        document.getElementById('replayBtn').disabled = true; 
        document.getElementById('hintBtn').disabled = true;     
        document.getElementById('valBtn').innerText = "Valider";
        document.getElementById('valBtn').className = "cmd-btn btn-action";
        document.getElementById('valBtn').disabled = true;
    },
    selectQuiz(idx) {
         if(Audio.ctx && Audio.ctx.state === 'suspended') Audio.ctx.resume();
        if(!Audio.ctx) Audio.init();
        if(this.session.done) {
            const opt = this.session.quizOptions[idx];
            const btn = document.getElementById('qbtn-'+idx);
            btn.classList.add('playing');
            setTimeout(() => btn.classList.remove('playing'), 200);
            Audio.chord(opt.notes);
            return;
        }
        this.session.quizUserChoice = idx;
        document.querySelectorAll('.quiz-btn').forEach(b => b.classList.remove('selected'));
        document.getElementById('qbtn-'+idx).classList.add('selected');
        
        // FIX: Try/Catch for Audio to prevent UI freeze
        try {
            Audio.chord(this.session.quizOptions[idx].notes);
        } catch(e) {}
        
        document.getElementById('valBtn').disabled = false;
    },
    analyzeCoach() {
        const s = this.session;
        const d = this.data;
        const tot = s.globalTot;
        if(tot < 10) {
            const m = COACH_DB.start[Math.floor(Math.random()*COACH_DB.start.length)];
            return { t: "Débutant", m: m };
        }
        let weakTips = [];
        if (d.stats && d.stats.c) {
            for(let cid in d.stats.c) {
                const st = d.stats.c[cid];
                if(st && st.tot >= 5 && (st.ok / st.tot) < 0.60) {
                    if(COACH_DB.weakness[cid]) {
                        weakTips.push(...COACH_DB.weakness[cid]);
                    }
                }
            }
        }
        const currentSet = d.currentSet || 'academy'; 
        const isJazz = currentSet === 'jazz';
        const invStats = isJazz ? (d.stats && d.stats.v) : (d.stats && d.stats.i);
        const invList = isJazz ? DB.voicings : DB.invs;
        if (invStats && invList) {
            for (let iid in invStats) {
                const st = invStats[iid];
                if (st && st.tot >= 5 && (st.ok / st.tot) < 0.60) {
                    const info = invList.find(x => x.id == iid);
                    const name = info ? (info.name || info.corr) : 'Variation';
                    let msg = "";
                    let type = "Technique";
                    if(isJazz) {
                        msg = `Le voicing **${name}** semble te poser problème (${Math.round((st.ok/st.tot)*100)}%). Écoute bien la note la plus aiguë (top note).`;
                    } else {
                        msg = `Tu as du mal avec le **${name}** (${Math.round((st.ok/st.tot)*100)}%). Essaie de repérer l'intervalle entre la basse et le reste de l'accord.`;
                    }
                    weakTips.push({ t: type, m: msg });
                }
            }
        }
        if(weakTips.length > 0) {
            return weakTips[Math.floor(Math.random() * weakTips.length)];
        }
        if(s.streak >= 10) {
            const m = COACH_DB.streak[Math.floor(Math.random() * COACH_DB.streak.length)];
            return { t: "En Feu 🔥", m: m };
        }
        if(s.fastStreak >= 5) {
             const m = COACH_DB.speed[Math.floor(Math.random() * COACH_DB.speed.length)];
             return { t: "Vitesse ⚡", m: m };
        }
        const acc = tot > 0 ? (s.globalOk / tot) : 0;
        if(acc >= 0.80) {
            const pool = [...COACH_DB.master, ...COACH_DB.theory];
            const m = pool[Math.floor(Math.random() * pool.length)];
            return { t: "Expert 🎓", m: m };
        }
        const m = COACH_DB.boost[Math.floor(Math.random() * COACH_DB.boost.length)];
        return { t: "Motivation 💪", m: m };
    },
    cheat(scenario) {
        const d = this.data;
        switch(scenario) {
            case 'weak_inv':
                d.stats.totalPlayed = 200; // Not beginner
                d.stats.c = {}; d.stats.i = {};
                DB.chords.forEach(c => d.stats.c[c.id] = {ok:20, tot:20}); // 100% chords
                DB.invs.forEach(i => {
                    // Inv 2 (43/2nd) at 15% success
                    if(i.id === 2) d.stats.i[i.id] = {ok:3, tot:20};
                    else d.stats.i[i.id] = {ok:20, tot:20};
                });
                this.session.streak = 0; // Reset streak to avoid momentum message
                window.UI.showToast("🕵️ Mode Test: Faiblesse Renversement");
                break;
            case 'endgame':
                d.lvl = 19; d.xp = d.next * 0.95;
                window.UI.showToast("🚀 Mode Test: Fin de partie (Lvl 19)");
                break;
            case 'badges':
                d.badges = BADGES.map(b => b.id).filter(id => id !== 'b_leg'); // All except Legend
                window.UI.showToast("🏅 Mode Test: Chasseur de Badges");
                break;
            case 'maitrise':
                d.mastery = 5;
                window.UI.showToast("💎 Mode Test: Maîtrise Platine");
                break;
        }
        this.save();
        this.calcGlobalStats();
        window.UI.updateHeader();
        window.UI.renderProfile();
        window.UI.renderStats();
    }
};