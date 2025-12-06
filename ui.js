


import { Audio, Piano } from './audio.js';
import { BADGES, CODEX_DATA, DB, LORE_MATERIALS, GHOSTS } from './data.js';
import { ChallengeManager } from './challenges.js';
import { Cloud } from './firebase.js';

// --- CONFIGURATION LORE (MAÎTRISE) ---
const LORE_GRADES = ['Novice', 'Initié', 'Adepte', 'Virtuose', 'Maître'];
const LORE_PLACES = ['Le Club', 'Le Labo', 'Le Cosmos', "L'Institut", 'La Source'];

export const UI = {
    // STATE
    lbState: { mode: 'chrono', period: 'weekly' },
    createConfig: { length: 10 }, 

    // --- CHALLENGE HUB (V5.0) ---
    
    showChallengeHub() {
        this.openModal('challengeHubModal');
        this.switchChallengeTab('arcade'); 
        this.loadDailyChallengeUI();
    },
    
    updateChallengeControls(active) {
        const btn = document.getElementById('btnSettings');
        if(!btn) return;
        
        if (active) {
            // Mode Défi : Bouton Quitter (Porte)
            btn.innerHTML = "🚪";
            btn.onclick = () => {
                if(confirm("Quitter le défi en cours ? Tout progrès sera perdu.")) {
                    window.ChallengeManager.exit();
                }
            };
            btn.style.borderColor = "var(--error)";
            btn.style.color = "var(--error)";
        } else {
            // Mode Normal : Bouton Settings (Engrenage)
            btn.innerHTML = "⚙️";
            btn.onclick = () => window.UI.openModal('settingsModal');
            btn.style.borderColor = "";
            btn.style.color = "";
        }
    },

    switchChallengeTab(tabName) {
        document.querySelectorAll('.challenge-tab-content').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.challenge-tab-btn').forEach(el => el.classList.remove('active'));
        
        const tabContent = document.getElementById(`c-tab-${tabName}`);
        if(tabContent) tabContent.style.display = 'block';
        
        // Gestion des boutons d'onglets (Mapping manuel basé sur l'ordre HTML)
        const btns = document.querySelectorAll('.challenge-tab-btn');
        if(btns.length >= 4) {
            if(tabName === 'arcade') { btns[0].classList.add('active'); this.updateLeaderboardView(); }
            if(tabName === 'global') btns[1].classList.add('active');
            if(tabName === 'join') btns[2].classList.add('active');
            if(tabName === 'create') btns[3].classList.add('active');
        }
    },

    async loadDailyChallengeUI() {
        const id = Cloud.getDailyChallengeID();
        const dateEl = document.getElementById('dailyDateStr');
        if(dateEl) dateEl.innerText = id.split('-').slice(1).join('/');
        
        const list = document.getElementById('dailyLeaderboardList');
        if(list) {
            list.innerHTML = '<div style="text-align:center; padding:10px; color:var(--text-dim);">Chargement...</div>';
            
            const scores = await Cloud.getChallengeLeaderboard(id);
            const myUid = Cloud.getCurrentUID();
            
            list.innerHTML = '';
            
            if(scores.length === 0) {
                list.innerHTML = '<div style="text-align:center; color:var(--text-dim);">Soyez le premier à jouer aujourd\'hui !</div>';
            } else {
                let userFoundInTop = false;
                
                // VERIFICATION PASSIVE DES BADGES DE RANG (Empereur / Olympien)
                // On cherche l'utilisateur via son UID unique
                const myEntryIndex = scores.findIndex(s => s.uid === myUid);
                
                if (myEntryIndex !== -1) {
                    const rank = myEntryIndex + 1;
                    const total = scores.length;
                    
                    // Mise à jour de la session pour la vérification des badges
                    window.App.session.challengeRank = rank;
                    window.App.session.challengeTotalPlayers = total;
                    
                    // Logique OLYMPIEN (Podium sur 5 challenges différents)
                    if (rank <= 3 && total >= 20) {
                        const podiums = window.App.data.arenaStats.podiumDates;
                        if (!podiums.includes(id)) {
                            podiums.push(id);
                            window.App.save();
                        }
                    }
                    
                    // Déclenchement de la vérification (Débloque Empereur, Outsider, Olympien si conditions remplies)
                    window.App.checkBadges();
                }

                // RENDER LIST
                scores.forEach((s, idx) => {
                    const isMe = (s.uid === myUid);
                    if (isMe) userFoundInTop = true;
                    
                    let rank = idx+1;
                    let color = 'white';
                    if(idx===0) { rank='🥇'; color='var(--gold)'; }
                    else if(idx===1) { rank='🥈'; color='#e2e8f0'; }
                    else if(idx===2) { rank='🥉'; color='#b45309'; }
                    
                    const displayScore = s.score !== undefined ? s.score : s.note; 

                    list.innerHTML += `
                        <div style="display:flex; align-items:center; background:rgba(255,255,255,0.05); padding:8px; border-radius:8px; border:1px solid ${isMe ? 'var(--primary)' : 'transparent'};">
                            <div style="width:30px; text-align:center; font-weight:700;">${rank}</div>
                            <div style="flex:1; font-weight:700; color:${color};">${s.pseudo}</div>
                            <div style="font-weight:900;">${displayScore}/${s.total || 20}</div>
                        </div>
                    `;
                });

                // Message d'encouragement si le joueur a joué aujourd'hui mais n'est pas dans le top affiché
                const todayISO = new Date().toISOString().split('T')[0];
                if (!userFoundInTop && window.App.data.arenaStats.lastDailyDate === todayISO) {
                    list.innerHTML += `
                        <div style="margin-top:10px; padding:10px; background:rgba(99, 102, 241, 0.1); border:1px dashed var(--primary); border-radius:8px; text-align:center; color:#a5b4fc; font-size:0.85rem;">
                            <strong>Continuez vos efforts !</strong><br>Votre score est enregistré, visez le Top 50 pour apparaître ici !
                        </div>
                    `;
                }
            }
        }
    },

    async joinDailyChallenge() {
        const id = Cloud.getDailyChallengeID();
        const settings = {
            activeC: DB.sets.academy.chords.map(c=>c.id), 
            activeI: DB.invs.map(i=>i.id),
            set: 'academy'
        };
        const challengeData = {
            id: id,
            seed: id,
            length: 20,
            settings: settings
        };
        if(confirm(`Lancer le Défi du Jour ?\n\n20 Questions • Mode Académie`)) {
            await ChallengeManager.start(challengeData);
        }
    },

    async joinChallenge() {
        const input = document.getElementById('challengeCodeInput');
        if(!input) return;
        const code = input.value.trim().toUpperCase();
        if(code.length < 3) return;
        
        let data = await Cloud.getChallenge(code);
        if(!data) {
            data = {
                id: code,
                seed: code,
                length: 20,
                settings: { 
                    set: window.App.data.currentSet, 
                    activeC: window.App.data.settings.activeC, 
                    activeI: window.App.data.settings.activeI 
                }
            };
        }
        
        if(confirm(`Rejoindre le défi "${code}" ?`)) {
            await ChallengeManager.start(data);
        }
    },

    async viewChallengeLeaderboard() {
        const input = document.getElementById('challengeCodeInput');
        if(!input) return;
        const code = input.value.trim().toUpperCase();
        if(code.length < 3) { window.UI.showToast("Code trop court"); return; }

        const container = document.getElementById('join-lb-results');
        if(!container) return;

        container.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-dim);">Recherche du classement...</div>';
        const scores = await Cloud.getChallengeLeaderboard(code);
        
        if(scores.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-dim);">Aucun score trouvé pour <strong>${code}</strong>.</div>`;
        } else {
            let html = `<h4 style="margin:10px 0; color:var(--text-dim); text-align:center;">Classement : ${code}</h4><div style="display:flex; flex-direction:column; gap:8px; max-height:200px; overflow-y:auto;">`;
            scores.forEach((s, idx) => {
                let rank = idx+1;
                let color = 'white';
                if(idx===0) { rank='🥇'; color='var(--gold)'; }
                else if(idx===1) { rank='🥈'; color='#e2e8f0'; }
                else if(idx===2) { rank='🥉'; color='#b45309'; }
                
                const displayScore = s.score !== undefined ? s.score : Math.round((s.note/20) * (s.total||20));

                html += `
                    <div style="display:flex; align-items:center; background:rgba(255,255,255,0.05); padding:8px; border-radius:8px;">
                        <div style="width:30px; text-align:center; font-weight:700;">${rank}</div>
                        <div style="flex:1; font-weight:700; color:${color};">${s.pseudo}</div>
                        <div style="font-weight:900;">${displayScore}/${s.total || 20}</div>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        }
    },

    setCreateLength(n) {
        this.createConfig.length = n;
        document.querySelectorAll('#c-tab-create .mode-opt').forEach(b => {
            b.classList.remove('active');
            if(b.innerText == n) b.classList.add('active');
        });
    },

    async createChallengeAction() {
        const seedInput = document.getElementById('createSeedInput');
        let seed = seedInput ? seedInput.value.trim().toUpperCase() : "";
        if(!seed) seed = 'DEF-' + Math.floor(Math.random()*10000);
        
        const data = {
            seed: seed,
            length: this.createConfig.length,
            settings: {
                set: window.App.data.currentSet,
                activeC: window.App.data.settings.activeC,
                activeI: window.App.data.settings.activeI
            }
        };
        
        const id = await Cloud.createChallenge(data);
        if(id) {
            // V5.2 - Increment Challenges Created
            window.App.data.arenaStats.challengesCreated++;
            window.App.save();
            window.App.checkBadges();

            alert(`Défi créé ! Code : ${id}`);
            if(document.getElementById('challengeCodeInput')) {
                document.getElementById('challengeCodeInput').value = id;
            }
            this.switchChallengeTab('join');
        } else {
            alert("Erreur de création (Code déjà pris ?)");
        }
    },

    renderChallengeReport(report) {
        let coachMsg = "Bravo pour cet effort.";
        if (report.mistakes.length > 0) {
            const m = report.mistakes[0];
            const cName = m.chord.type.name;
            coachMsg = `Tu as confondu <strong>${cName}</strong>. Compare tes réponses ci-dessous.`;
        } else {
            coachMsg = "Un parcours sans faute ! Ton oreille est affûtée.";
        }

        const modal = document.getElementById('challengeReportModal');
        if(!modal) return;
        
        // VIEW 1: MISTAKES LIST
        const mistakesHTML = report.mistakes.map(m => {
            const targetNotesStr = JSON.stringify(m.chord.notes);
            const targetName = m.chord.type.name;
            const targetSub = m.chord.type.sub;
            
            // ISO-BASS LOGIC: Detect target physical bass note to align user response
            const targetBass = Math.min(...m.chord.notes);

            let userNotes = [];
            let userLabel = "???";
            let userSub = "";
            
            if (m.userResp.notes) {
                userNotes = m.userResp.notes;
                userLabel = m.userResp.label || m.userResp.type.name;
            } else {
                const uType = m.userResp.type;
                const uInv = m.userResp.inv;
                const uTypeObj = DB.chords.find(c => c.id === uType);
                if (uTypeObj) {
                    userLabel = uTypeObj.name;
                    userSub = uTypeObj.sub;
                    // V5.2 ISO-BASS FIX: Use getNotesFromBass instead of getNotes with default root
                    // This ensures the comparison chord sounds at the same pitch height as the target
                    userNotes = window.App.getNotesFromBass(uTypeObj, uInv, targetBass);
                }
            }
            const userNotesStr = JSON.stringify(userNotes);

            return `
                <div class="mistake-row" style="flex-direction:column; align-items:stretch; cursor:default; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px; padding-bottom:5px; border-bottom:1px solid rgba(255,255,255,0.05);">
                        <span style="font-size:0.7rem; color:var(--text-dim); text-transform:uppercase;">Question ${report.mistakes.indexOf(m) + 1}</span>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <div style="flex:1; background:rgba(16, 185, 129, 0.1); border:1px solid rgba(16, 185, 129, 0.3); border-radius:8px; padding:8px; cursor:pointer;" onclick="window.AudioEngine.chord(${targetNotesStr})">
                            <div style="font-size:0.6rem; color:var(--success); font-weight:700;">CIBLE</div>
                            <div style="font-weight:700; color:white;">${targetName}</div>
                            <div style="font-size:0.7rem; opacity:0.7;">${targetSub}</div>
                            <div style="margin-top:5px; font-size:1.2rem;">🔊</div>
                        </div>
                        <div style="flex:1; background:rgba(239, 68, 68, 0.1); border:1px solid rgba(239, 68, 68, 0.3); border-radius:8px; padding:8px; cursor:pointer;" onclick="window.AudioEngine.chord(${userNotesStr})">
                            <div style="font-size:0.6rem; color:var(--error); font-weight:700;">RÉPONSE</div>
                            <div style="font-weight:700; color:white;">${userLabel}</div>
                            <div style="font-size:0.7rem; opacity:0.7;">${userSub}</div>
                            <div style="margin-top:5px; font-size:1.2rem;">🔊</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // VIEW 2: STATISTICS GRID
        let statsHTML = "";
        let statsInvHTML = "";
        
        if (report.attempts) {
            const stats = {};
            const statsInv = {};
            
            const isLab = window.App.data.currentSet === 'laboratory';
            const isJazz = window.App.data.currentSet === 'jazz';

            report.attempts.forEach(a => {
                // CHORDS AGG
                const id = a.chord.type.id;
                if(!stats[id]) stats[id] = {ok:0, tot:0, name: a.chord.type.name, sub: a.chord.type.sub};
                stats[id].tot++;
                if(a.win) stats[id].ok++;
                
                // INV AGG
                let iName = "";
                if(isLab) {
                    if(a.chord.type.configs && a.chord.type.configs[a.chord.inv]) {
                        iName = a.chord.type.configs[a.chord.inv].name;
                    } else iName = `Config ${a.chord.inv}`;
                } else if (isJazz) {
                    const v = DB.voicings.find(x => x.id === a.chord.inv);
                    iName = v ? v.name : `Voicing ${a.chord.inv}`;
                } else {
                    const i = DB.invs.find(x => x.id === a.chord.inv);
                    iName = i ? i.name : `Inv ${a.chord.inv}`;
                }
                
                // Composite key for Lab to avoid name collision if needed, but display name is enough
                const iKey = isLab ? `${id}_${a.chord.inv}` : a.chord.inv; 
                // Using display name as key for simplicity in grouping same-named invs
                const iDisplayKey = iName;
                
                if(!statsInv[iDisplayKey]) statsInv[iDisplayKey] = {ok:0, tot:0, name: iName};
                statsInv[iDisplayKey].tot++;
                if(a.win) statsInv[iDisplayKey].ok++;
            });
            
            statsHTML = `<h5 style="color:var(--text-dim); margin-bottom:5px;">QUALITÉS</h5>` + Object.values(stats).map(s => {
                const pct = Math.round((s.ok / s.tot) * 100);
                const col = pct >= 80 ? 'var(--success)' : (pct >= 50 ? 'var(--warning)' : 'var(--error)');
                return `
                    <div class="stat-item">
                        <div class="stat-header">
                            <span style="color:white; font-weight:700;">${s.name}</span>
                            <span>${s.ok}/${s.tot} (${pct}%)</span>
                        </div>
                        <div class="stat-track">
                            <div class="stat-fill" style="width:${pct}%; background:${col}"></div>
                        </div>
                    </div>
                `;
            }).join('');
            
            statsInvHTML = `<h5 style="color:var(--text-dim); margin:15px 0 5px 0;">VARIATIONS</h5>` + Object.values(statsInv).map(s => {
                const pct = Math.round((s.ok / s.tot) * 100);
                const col = pct >= 80 ? 'var(--success)' : (pct >= 50 ? 'var(--warning)' : 'var(--error)');
                return `
                    <div class="stat-item">
                        <div class="stat-header">
                            <span style="color:white; font-weight:700;">${s.name}</span>
                            <span>${s.ok}/${s.tot} (${pct}%)</span>
                        </div>
                        <div class="stat-track">
                            <div class="stat-fill" style="width:${pct}%; background:${col}"></div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        const pct = Math.round((report.score / report.total) * 100);

        modal.innerHTML = `
            <div class="modal" style="text-align:center;">
                <h4 style="color:var(--text-dim); margin-bottom:10px;">Rapport de Session</h4>
                <h2 style="margin:0; color:white; font-size:1.5rem;">${report.seed}</h2>
                
                <div class="report-score-circle" style="border-color:${pct >= 50 ? 'var(--success)' : 'var(--error)'}; color:${pct >= 50 ? 'var(--success)' : 'var(--error)'};">
                    <span style="font-size:3.5rem; font-weight:900;">${report.score}</span>
                    <span style="font-size:1rem; opacity:0.8;">/ ${report.total}</span>
                    <div style="font-size:0.9rem; margin-top:5px; color:${pct>=50?'var(--success)':'var(--error)'}">${pct}%</div>
                </div>

                <div class="coach-bubble" style="margin-bottom:20px;">
                    <strong>🧠 Coach:</strong> ${coachMsg}
                </div>

                <div class="report-tabs" style="display:flex; justify-content:center; gap:10px; margin-bottom:10px;">
                    <button id="btn-rep-err" class="mode-opt active" onclick="window.UI.switchReportTab('err')">Erreurs</button>
                    <button id="btn-rep-stat" class="mode-opt" onclick="window.UI.switchReportTab('stat')">Statistiques</button>
                </div>

                <div style="background:rgba(0,0,0,0.2); border-radius:12px; padding:10px; max-height:250px; overflow-y:auto; text-align:left;">
                    <div id="view-rep-err">
                        ${mistakesHTML}
                        ${report.mistakes.length === 0 ? '<div style="text-align:center; opacity:0.5; padding:20px;">Aucune erreur ! Une oreille parfaite.</div>' : ''}
                    </div>
                    <div id="view-rep-stat" style="display:none;">
                        ${statsHTML}
                        ${statsInvHTML}
                    </div>
                </div>

                <button class="cmd-btn btn-action" style="width:100%; margin-top:20px; padding:15px;" onclick="window.ChallengeManager.exit()">Quitter</button>
            </div>
        `;
        modal.classList.add('open');
        Audio.sfx('win');
    },

    switchReportTab(tab) {
        document.getElementById('view-rep-err').style.display = tab === 'err' ? 'block' : 'none';
        document.getElementById('view-rep-stat').style.display = tab === 'stat' ? 'block' : 'none';
        document.getElementById('btn-rep-err').classList.toggle('active', tab === 'err');
        document.getElementById('btn-rep-stat').classList.toggle('active', tab === 'stat');
    },

    // --- LEADERBOARD ARCADE ---
    
    setLbMode(mode) { this.lbState.mode = mode; this.updateLeaderboardView(); },
    setLbPeriod(period) { this.lbState.period = period; this.updateLeaderboardView(); },

    async updateLeaderboardView() {
        const mode = this.lbState.mode;
        const period = this.lbState.period;
        const container = document.getElementById('c-tab-arcade');
        if(!container) return; 

        container.querySelectorAll('.mode-opt').forEach(b => b.classList.remove('active'));
        const activeModeBtn = document.getElementById(`lb-mode-${mode}`);
        if(activeModeBtn) activeModeBtn.classList.add('active');
        
        container.querySelectorAll('.lb-period-btn').forEach(b => b.classList.remove('active'));
        const activePeriodBtn = document.getElementById(`lb-period-${period}`);
        if(activePeriodBtn) activePeriodBtn.classList.add('active');
        
        await this.loadLeaderboardData(mode, period);
    },

    async loadLeaderboardData(mode, period) {
        const list = document.getElementById('lb-list');
        const loader = document.getElementById('lb-loader');
        if(list) list.innerHTML = '';
        if(loader) loader.style.display = 'block';
        try {
            let realScores = await Cloud.getLeaderboard(mode, period);
            realScores = realScores.slice(0, 20); 
            const modeGhosts = GHOSTS.filter(g => g.mode === mode);
            let scores = [...realScores, ...modeGhosts];
            scores.sort((a, b) => b.score - a.score);

            if(loader) loader.style.display = 'none';
            if(scores.length === 0 && list) {
                const periodText = period === 'weekly' ? "cette semaine" : "pour le moment";
                list.innerHTML = `<div style="text-align:center; color:var(--text-dim); margin-top:20px;">Aucun score ${periodText}.<br>Soyez le premier !</div>`;
                return;
            }
            scores.forEach((s, idx) => {
                let rankVisual = `<span style="width:25px; font-weight:700; color:var(--text-dim);">${idx+1}</span>`;
                if(idx === 0) rankVisual = '🥇';
                if(idx === 1) rankVisual = '🥈';
                if(idx === 2) rankVisual = '🥉';
                
                const row = document.createElement('div');
                row.className = s.isGhost ? 'leaderboard-row ghost' : 'leaderboard-row';
                const masteryStars = "★".repeat(Math.max(0, (s.mastery || 0) % 5));
                const masteryColor = LORE_MATERIALS[Math.floor((s.mastery || 0)/5)]?.color || 'var(--text-dim)';
                
                let nameHtml = s.pseudo || s.name;
                let subHtml = `Maîtrise ${s.mastery||0} ${masteryStars}`;
                
                if (s.isGhost) {
                    nameHtml = `${s.name} ✨`;
                    let levelLabel = "Initié";
                    if (s.mastery >= 19) levelLabel = "Divin";
                    else if (s.mastery >= 10) levelLabel = "Maître";
                    subHtml = `<span style="color:var(--text-dim)">Légende</span> • ${levelLabel}`;
                    row.style.cursor = 'help';
                    row.onclick = () => window.UI.showGhostQuote(s.name, s.quote);
                }

                row.innerHTML = `<div style="font-size:1.2rem; width:30px; text-align:center;">${rankVisual}</div><div style="flex:1; margin-left:10px;"><div style="font-weight:700; color:${s.isGhost ? '#a5f3fc' : masteryColor};">${nameHtml}</div><div style="font-size:0.7rem; opacity:0.6;">${subHtml}</div></div><div style="font-weight:900; font-size:1.1rem; color:var(--gold);">${s.score}</div>`;
                if(list) list.appendChild(row);
            });
        } catch (e) { console.error(e); if(loader) loader.innerHTML = "Erreur de chargement..."; }
    },

    showGhostQuote(name, quote) {
        let el = document.getElementById('badgeOverlay');
        if (!el) { el = document.createElement('div'); el.id = 'badgeOverlay'; el.className = 'modal-overlay badge-lightbox'; document.body.appendChild(el); el.onclick = () => { el.classList.remove('open'); }; }
        el.innerHTML = `<div class="modal" style="max-width:350px;"><div style="font-size:3rem; margin-bottom:10px;">👻</div><h2 style="color:var(--cyan); margin:0; text-transform:uppercase; letter-spacing:1px; line-height:1.2;">${name}</h2><div style="margin-top:10px; height:2px; background:var(--panel-border); width:50%; margin-left:auto; margin-right:auto;"></div><p style="color:white; margin-top:20px; font-size:1.1rem; line-height:1.5; font-style:italic;">"${quote}"</p><button class="cmd-btn btn-listen" style="width:100%; margin-top:20px; padding:12px;" onclick="document.getElementById('badgeOverlay').classList.remove('open')">Fermer</button></div>`;
        el.classList.add('open');
        window.UI.vibrate(10);
    },

    // --- STANDARD HELPER METHODS ---
    getSymbol(id) {
        if(id.includes('maj7')) return 'Δ';
        if(id.includes('min7')) return '-'; 
        if(id.includes('dom7') || id === 'dom13') return '7';
        if(id === 'hdim7') return 'Ø';
        if(id === 'dim7') return 'o';
        if(id === 'minmaj7') return '-Δ';
        if(id === 'maj69') return '6/9';
        if(id === 'min6') return '-6';
        if(id === 'alt') return 'Alt';
        if(id.includes('sus')) return 'Sus';
        if(id === 'maj9') return 'Δ9';
        if(id === 'min9') return '-9';
        if(id === 'struct_36') return '3/6';
        if(id === 'struct_45tr') return '4/5-Tr';
        if(id === 'trichord') return '3-X';
        if(id === 'sus_sym') return 'Sus';
        return id;
    },

    getLabel(item, type) {
        if (item.figure && item.figure.length > 0) {
            return `<div class="figured-bass">${item.figure.map(n => `<span>${n}</span>`).join('')}</div>`;
        }
        if (type === 'c') {
            return item.tech || item.name;
        }
        return item.corr || item.name;
    },
    
    renderQuizOptions(options, targetOpt) {
        document.querySelectorAll('.quiz-btn').forEach(b => {
            b.className = 'quiz-btn';
            b.classList.remove('selected', 'correct', 'wrong', 'lab-mode');
        });
        
        const isLab = window.App.data.currentSet === 'laboratory';
        let targetVisual = "";

        if (isLab) {
            const config = targetOpt.type.configs[targetOpt.inv];
            let top='?', bot='?';
            
            if(targetOpt.type.id === 'trichord') {
                const vals = [['1/2','1/2'], ['Tr','1/2'], ['1','1'], ['3M','1/2']];
                [top, bot] = vals[targetOpt.inv] || ['?','?'];
            } else if (targetOpt.type.id === 'struct_36') {
                const vals = [['6m','3m'], ['3m','6m'], ['6M','3M'], ['3M','6M']];
                [top, bot] = vals[targetOpt.inv] || ['?','?'];
            } else if (targetOpt.type.id === 'struct_45tr') {
                const vals = [['Tr','4J'], ['4J','Tr'], ['Tr','5J'], ['5J','Tr']];
                [top, bot] = vals[targetOpt.inv] || ['?','?'];
            } else if (targetOpt.type.id === 'sus_sym') {
                 const txts = ["Sus 2", "Sus 4", "Quartal", "Quintal"];
                 top = txts[targetOpt.inv]; bot = "";
            }
            
            if(targetOpt.type.id === 'sus_sym') {
                targetVisual = `<div style="font-size:2rem; font-weight:900;">${top}</div><div class="lab-tag">${targetOpt.type.name}</div>`;
            } else {
                targetVisual = `<div class="figured-bass quiz-huge"><span>${top}</span><span>${bot}</span></div><div class="lab-tag">${config.name}</div>`;
            }
        } else {
            const labelC = this.getLabel(targetOpt.type, 'c');
            let labelI = "";
            if (targetOpt.type.id !== 'dim7') {
                 const invList = (window.App.data.currentSet === 'jazz') ? DB.voicings : DB.invs;
                 const invObj = invList.find(i => i.id === targetOpt.inv);
                 if(invObj) labelI = this.getLabel(invObj, 'i');
            }
            targetVisual = `${labelC}<div style="font-size:0.4em; opacity:0.7; margin-top:5px;">${labelI}</div>`;
        }
        
        const labelEl = document.getElementById('quizTargetLbl');
        if(labelEl) labelEl.innerHTML = targetVisual;

        [0, 1, 2].forEach(idx => {
            const btn = document.getElementById(`qbtn-${idx}`);
            if(!btn) return;
            if(options[idx]) {
                btn.style.display = 'flex';
                if (isLab) btn.classList.add('lab-mode');
                const letters = ['A', 'B', 'C'];
                btn.innerHTML = `${letters[idx]}<span class="reveal">...</span>`;
            } else {
                btn.style.display = 'none';
            }
        });
    },

    updateQuizSelection(idx) {
        document.querySelectorAll('.quiz-btn').forEach(b => b.classList.remove('selected'));
        if(idx !== null) {
            const btn = document.getElementById(`qbtn-${idx}`);
            if(btn) btn.classList.add('selected');
        }
    },
    
    revealQuiz(userChoiceIdx, correctIdx, options) {
         const isLab = window.App.data.currentSet === 'laboratory';
         options.forEach((opt, idx) => {
            const btn = document.getElementById(`qbtn-${idx}`);
            if(!btn) return;
            btn.classList.remove('selected');
            if(idx === correctIdx) {
                btn.classList.add('correct');
            } else if (idx === userChoiceIdx && userChoiceIdx !== correctIdx) {
                btn.classList.add('wrong');
            }
            
            let visual = "";
            if (isLab) {
                const config = opt.type.configs[opt.inv];
                let top='?', bot='?';
                if(opt.type.id === 'trichord') {
                    const vals = [['1/2','1/2'], ['Tr','1/2'], ['1','1'], ['3M','1/2']];
                    [top, bot] = vals[opt.inv] || ['?','?'];
                } else if (opt.type.id === 'struct_36') {
                    const vals = [['6m','3m'], ['3m','6m'], ['6M','3M'], ['3M','6M']];
                    [top, bot] = vals[opt.inv] || ['?','?'];
                } else if (opt.type.id === 'struct_45tr') {
                    const vals = [['Tr','4J'], ['4J','Tr'], ['Tr','5J'], ['5J','Tr']];
                    [top, bot] = vals[opt.inv] || ['?','?'];
                }
                if (opt.type.id === 'sus_sym') {
                     const txts = ["Sus 2", "Sus 4", "Quartal", "Quintal"];
                     visual = `<div style="font-size:1.1rem; font-weight:900;">${txts[opt.inv]}</div>`;
                } else {
                     visual = `<div class="figured-bass"><span>${top}</span><span>${bot}</span></div>`;
                }
            } else {
                const labelC = this.getLabel(opt.type, 'c');
                let labelI = "";
                if (opt.type.id !== 'dim7') {
                     const invList = (window.App.data.currentSet === 'jazz') ? DB.voicings : DB.invs;
                     const invObj = invList.find(i => i.id === opt.inv);
                     if(invObj) labelI = this.getLabel(invObj, 'i');
                }
                visual = `${labelC}<br><span style="font-size:0.6em; opacity:0.7;">${labelI}</span>`;
            }
            const letters = ['A', 'B', 'C'];
            btn.innerHTML = `${letters[idx]}<span class="reveal">${visual}</span>`;
         });
    },

    getLoreState(m) {
        if (m <= 0) return { rankLabel: 'M-00', starsHTML: '', fullName: 'Débutant', grade: 'Débutant', material: null, place: "L'Académie", color: '#94a3b8', shadow: 'rgba(148, 163, 184, 0.2)' };
        const mIdx = m - 1; 
        const gradeIdx = mIdx % 5;
        const gradeName = LORE_GRADES[gradeIdx];
        const starCount = gradeIdx + 1; 
        const placeName = LORE_PLACES[mIdx] || null;
        const matIdx = Math.floor(mIdx / 5);
        let matName, color, shadow, particle;

        if (matIdx < LORE_MATERIALS.length) {
            const mat = LORE_MATERIALS[matIdx];
            matName = mat.name;
            particle = mat.particle || "de "; 
            color = mat.color;
            shadow = mat.shadow;
        } else {
            const offset = matIdx - LORE_MATERIALS.length;
            const hue = (280 + (offset * 137.5)) % 360; 
            color = `hsl(${Math.round(hue)}, 100%, 60%)`;
            shadow = `hsl(${Math.round(hue)}, 100%, 40%)`;
            matName = `Transcendance ${offset + 1}`;
            particle = "de ";
        }
        const fullName = `${gradeName} ${particle}${matName}`;
        const rankLabel = `M-${m.toString().padStart(2, '0')}`;
        let starsHTML = "";
        for(let i=0; i<starCount; i++) starsHTML += `<span class="tier-star">★</span>`;

        return { rankLabel, starsHTML, grade: gradeName, material: matName, fullName, place: placeName, color, shadow };
    },

    renderBoard() {
        const d = window.App.data;
        const isLab = d.currentSet === 'laboratory';
        const getRankClass = (ok) => {
            if(ok >= 100) return 'rank-gold';
            if(ok >= 50) return 'rank-silver';
            if(ok >= 20) return 'rank-bronze';
            return '';
        };

        const cg = document.getElementById('chordGrid'); 
        if(cg) {
            cg.innerHTML='';
            if(d.settings.activeC.length > 4) { cg.className = "pad-grid grid-c"; } else { cg.className = "pad-grid grid-i"; }

            if(d.settings && d.settings.activeC) { 
                DB.chords.forEach(c => { 
                    if(!d.settings.activeC.includes(c.id)) return; 
                    const ok = d.stats.c[c.id] ? d.stats.c[c.id].ok : 0;
                    const visual = this.getLabel(c, 'c');
                    cg.innerHTML += `<div class="pad ${getRankClass(ok)}" id="c-${c.id}" onclick="window.App.select('c','${c.id}')"><div class="pad-main">${visual}</div><div class="pad-sub">${c.sub}</div></div>`; 
                }); 
            }
        }

        const ig = document.getElementById('invGrid'); 
        if(ig) {
            ig.innerHTML='';
            if (isLab) {
                ig.className = "pad-grid grid-lab";
                const session = window.App.session;
                let contextId = session.selC || (session.chord ? session.chord.type.id : d.settings.activeC[0]);
                const chordObj = DB.sets.laboratory.chords.find(c => c.id === contextId);
                const labConfig = { leftTitle: "8ve CONTRACTÉE >|<", rightTitle: "8ve DILATÉE <|>", leftColor: "var(--warning)", rightColor: "var(--primary)" };

                if (contextId === 'trichord') { labConfig.leftTitle = "DISSONANCE"; labConfig.rightTitle = "COULEUR"; } 
                else if (contextId === 'sus_sym') { labConfig.leftTitle = "TRIADES SUS"; labConfig.rightTitle = "EMPILEMENTS"; }

                ig.innerHTML += `<div class="lab-header" style="color:${labConfig.leftColor}">${labConfig.leftTitle}</div><div class="lab-header" style="color:${labConfig.rightColor}">${labConfig.rightTitle}</div>`;

                const createLabBtn = (id) => {
                    if(!chordObj || !chordObj.configs[id]) return `<div class="pad locked"></div>`;
                    const config = chordObj.configs[id];
                    const statKey = `${contextId}_${id}`;
                    const ok = d.stats.l[statKey] ? d.stats.l[statKey].ok : 0;
                    let visual = "";
                    let tagPos = config.name.toUpperCase();
                    
                    if (contextId === 'trichord') {
                        let top='?', bot='?';
                        if(id===0){top='1/2';bot='1/2';}
                        if(id===1){top='Tr';bot='1/2';} 
                        if(id===2){top='1';bot='1';}
                        if(id===3){top='3M';bot='1/2';}
                        visual = `<div class="figured-bass"><span>${top}</span><span>${bot}</span></div>`;
                    }
                    else if (contextId === 'sus_sym') {
                        let txt = "";
                        if(id===0){txt="Sus 2";} if(id===1){txt="Sus 4";} if(id===2){txt="Quartal";} if(id===3){txt="Quintal";}
                        visual = `<div style="font-size:1.1rem; font-weight:900;">${txt}</div>`;
                    }
                    else if (contextId === 'struct_36') {
                        let top='?', bot='?';
                        if(id===0){top='6m';bot='3m';} if(id===1){top='3m';bot='6m';} if(id===2){top='6M';bot='3M';} if(id===3){top='3M';bot='6M';}
                        visual = `<div class="figured-bass"><span>${top}</span><span>${bot}</span></div>`;
                    }
                    else if (contextId === 'struct_45tr') {
                        let top='?', bot='?';
                        if(id===0){top='Tr';bot='4J';} if(id===1){top='4J';bot='Tr';} if(id===2){top='Tr';bot='5J';} if(id===3){top='5J';bot='Tr';}
                        visual = `<div class="figured-bass"><span>${top}</span><span>${bot}</span></div>`;
                    }
                    let extraClass = (id < 2) ? "lab-contracted" : "lab-expanded";
                    return `<div class="pad ${getRankClass(ok)} ${extraClass}" id="i-${id}" onclick="window.App.select('i',${id})"><div class="pad-main">${visual}</div><div class="lab-tag">${tagPos}</div></div>`;
                };
                ig.innerHTML += createLabBtn(0); ig.innerHTML += createLabBtn(2); ig.innerHTML += createLabBtn(1); ig.innerHTML += createLabBtn(3);
            } else {
                ig.className = "pad-grid grid-i"; 
                if(d.settings && d.settings.activeI) { 
                    DB.currentInvs.forEach(i => { 
                        if(!d.settings.activeI.includes(i.id)) return; 
                        let ok = 0; let visual = ""; let subText = i.sub;
                        if(d.currentSet === 'jazz') { ok = d.stats.v[i.id] ? d.stats.v[i.id].ok : 0; visual = this.getLabel(i, 'i'); } 
                        else { ok = d.stats.i[i.id] ? d.stats.i[i.id].ok : 0; visual = this.getLabel(i, 'i'); }
                        ig.innerHTML += `<div class="pad ${getRankClass(ok)}" id="i-${i.id}" onclick="window.App.select('i',${i.id})"><div class="pad-main">${visual}</div><div class="pad-sub">${subText}</div></div>`; 
                    }); 
                }
            }
        }
    },

    renderSel() {
        document.querySelectorAll('.pad').forEach(p => p.classList.remove('selected'));
        
        // Studio Mode Handling
        if(window.App.session.mode === 'studio') {
            const s = window.App.session.studio;
            if(s.chordId) {
                const el = document.getElementById('c-'+s.chordId);
                if(el) el.classList.add('selected');
            }
            if(s.invId !== null) {
                const el = document.getElementById('i-'+s.invId);
                if(el) el.classList.add('selected');
            }
            const valBtn = document.getElementById('valBtn');
            if(valBtn) valBtn.disabled = false;
            return;
        }

        // Standard Game Mode Handling
        if(window.App.session.selC) {
            const el = document.getElementById('c-'+window.App.session.selC);
            if(el) el.classList.add('selected');
        }
        if(window.App.session.selI !== null && window.App.session.selI !== -1) {
            const el = document.getElementById('i-'+window.App.session.selI);
            if(el) el.classList.add('selected');
        }
        const valBtn = document.getElementById('valBtn');
        if(valBtn) valBtn.disabled = !(window.App.session.selC && window.App.session.selI !== null);
    },

    reveal(okC, okI) {
        const c = window.App.session.chord; 
        const cEl = document.getElementById('c-'+c.type.id);
        if(cEl) cEl.classList.add(okC?'correct':'correction');
        
        if(!okC && window.App.session.selC) {
            const selEl = document.getElementById('c-'+window.App.session.selC);
            if(selEl) selEl.classList.add('wrong');
        }
        
        if(c.type.id !== 'dim7') { 
            const iEl = document.getElementById('i-'+c.inv);
            if(iEl) iEl.classList.add(okI?'correct':'correction');
            
            if(!okI && window.App.session.selI !== null) {
                const selIEl = document.getElementById('i-'+window.App.session.selI);
                if(selIEl) selIEl.classList.add('wrong');
            }
        }
    },

    resetVisuals() { 
        document.querySelectorAll('.pad').forEach(p => p.className='pad'); 
        document.querySelectorAll('.quiz-btn').forEach(b => { b.className = 'quiz-btn'; b.classList.remove('selected', 'correct', 'wrong', 'lab-mode'); });
        window.UI.renderBoard(); 
        const p = document.getElementById('invPanel'); if(p) { p.style.opacity = '1'; p.style.pointerEvents = 'auto'; }
        const piano = document.getElementById('pianoCanvas'); if(piano) piano.classList.remove('show');
        const vis = document.getElementById('visualizer'); if(vis) vis.style.opacity = '0.5';
    },

    msg(txt, state) { 
        const el = document.getElementById('statusText'); 
        if(!el) return;
        el.innerText = txt; 
        el.className = "feedback-msg " + (state==='correct'?'correct':state==='warning'?'warning':state===false?'wrong':''); 
    },

    vibrate(ptr) { if(navigator.vibrate) navigator.vibrate(ptr); },
    
    updateHeader() {
        const d = window.App.data; 
        const r = DB.ranks[Math.min(d.lvl-1, DB.ranks.length-1)];
        document.getElementById('rankIcon').innerText = r.i; document.getElementById('rankTitle').innerText = r.t; document.getElementById('lvlOverlayName').innerText = r.t; document.getElementById('lvlNum').innerText = d.lvl; 
        const lore = this.getLoreState(d.mastery);
        const headerLeft = document.querySelector('.header-left');
        headerLeft.className = "header-left tier-dynamic";
        headerLeft.style.setProperty('--tier-color', lore.color); headerLeft.style.setProperty('--tier-shadow', lore.shadow);
        document.getElementById('headerStars').innerHTML = lore.starsHTML;
        document.getElementById('xpBar').style.width = (d.xp/d.next)*100 + '%';
        document.getElementById('streakVal').innerText = window.App.session.streak; 
        document.getElementById('streakVal').className = window.App.session.streak > 20 ? 'stat-val streak-super' : (window.App.session.streak > 10 ? 'stat-val streak-fire' : 'stat-val');
        if(document.getElementById('scoreGroup').classList.contains('active')) { const sc = document.getElementById('currentScoreVal'); sc.innerText = window.App.session.score; sc.style.color = 'var(--gold)'; }
        const pct = window.App.session.globalTot ? Math.round((window.App.session.globalOk / window.App.session.globalTot) * 100) : 0; document.getElementById('precisionVal').innerText = pct + '%';
    },

    updateChrono() { 
        document.getElementById('timerVal').innerText = window.App.session.time; 
        document.getElementById('livesVal').innerText = '❤️'.repeat(window.App.session.lives); 
    },

    updateBackground(streak) { const body = document.body; if(streak >= 20) body.style.backgroundColor = '#370b1b'; else if(streak >= 10) body.style.backgroundColor = '#1e1b4b'; else body.style.backgroundColor = '#0f172a'; },
    
    triggerCombo(streak) {
        this.updateBackground(streak);
        if(streak > 5) { const sv = document.getElementById('streakVal'); sv.style.transform = "scale(1.5)"; setTimeout(()=>sv.style.transform="scale(1)", 150); }
        if(streak > 0 && streak % 10 === 0) { const pop = document.getElementById('comboPopup'); document.getElementById('comboTitle').innerText = `COMBO x${streak}`; pop.classList.add('show'); Audio.sfx('win'); setTimeout(() => pop.classList.remove('show'), 1500); }
    },

    confetti() { const c=document.getElementById('confetti'); const x=c.getContext('2d'); c.width=window.innerWidth; c.height=window.innerHeight; let p=[]; for(let i=0;i<60;i++)p.push({x:c.width/2,y:c.height/2,vx:(Math.random()-0.5)*25,vy:(Math.random()-0.5)*25,c:`hsl(${Math.random()*360},100%,50%)`,l:1}); const u=()=>{x.clearRect(0,0,c.width,c.height); let a=false; p.forEach(k=>{if(k.l>0){k.x+=k.vx;k.y+=k.vy;k.vy+=0.6;k.l-=0.02;x.fillStyle=k.c;x.beginPath();x.arc(k.x,k.y,6,0,7);x.fill();a=true;}}); if(a)requestAnimationFrame(u);}; u(); },
    
    showLevelUp() { const ov = document.getElementById('levelOverlay'); ov.classList.add('active'); setTimeout(() => { ov.classList.remove('active'); }, 3000); },
    
    showToast(msg) { const t = document.getElementById('rankToast'); t.innerText = msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'), 3000); },
    
    showBadge(b) { const el = document.getElementById('badgeRibbon'); const tit = document.getElementById('badgeRibbonTitle'); tit.innerText = b.title; document.querySelector('.badge-ribbon-icon').innerText = b.icon; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 4000); },
    
    openBadgeLightbox(b) {
        let el = document.getElementById('badgeOverlay');
        if (!el) { el = document.createElement('div'); el.id = 'badgeOverlay'; el.className = 'modal-overlay badge-lightbox'; document.body.appendChild(el); el.onclick = () => { el.classList.remove('open'); }; }
        const unlocked = window.App.data.badges.includes(b.id);
        let title = b.title, desc = b.desc, icon = b.icon, lockedTxt = unlocked ? "DÉBLOQUÉ" : "VERROUILLÉ", statusClass = unlocked ? "unlocked" : "locked";
        if(b.secret && !unlocked) { title = "Badge Mystère"; desc = "Continuez votre progression pour révéler ce badge."; icon = "🔒"; lockedTxt = "SECRET"; }
        el.innerHTML = `<div class="modal" style="max-width:350px;"><div style="font-size:4rem; margin-bottom:10px; animation:pop 0.5s;">${icon}</div><h2 style="color:var(--gold); margin:0; text-transform:uppercase; letter-spacing:1px; line-height:1.2;">${title}</h2><div style="margin-top:10px; font-weight:800; font-size:0.8rem; background:rgba(255,255,255,0.1); padding:4px 10px; border-radius:10px; display:inline-block; letter-spacing:1px;" class="${statusClass}">${lockedTxt}</div><p style="color:var(--text-dim); margin-top:20px; font-size:1rem; line-height:1.5;">${desc}</p><button class="cmd-btn btn-listen" style="width:100%; margin-top:20px; padding:12px;">Fermer</button></div>`;
        el.classList.add('open'); window.UI.vibrate(10);
    },
    
    updateModeLocks() {
        const d = window.App.data;
        document.querySelectorAll('.mode-opt').forEach(el => el.classList.remove('locked'));
        if(d.mastery === 0) { if(d.lvl < 3) document.getElementById('modeInverse').classList.add('locked'); if(d.lvl < 8) document.getElementById('modeChrono').classList.add('locked'); if(d.lvl < 12) document.getElementById('modeSprint').classList.add('locked'); }
    },

    openModal(id, locked = false) { 
        if(id==='settingsModal') window.UI.renderSettings(); if(id==='statsModal') window.UI.renderStats(); if(id==='modalProfile') window.UI.renderProfile();
        const el = document.getElementById(id); if(el) { el.classList.add('open'); el.onclick = (e) => { if (locked) return; if (e.target === el) window.UI.closeModals(); }; } 
    },
    
    openCodex() {
        Audio.sfx('codex_open'); const modal = document.getElementById('modalCodex'); modal.classList.add('open');
        modal.innerHTML = `<div class="modal codex-terminal"><div class="codex-layout"><div class="codex-sidebar"><div class="codex-logo">📖</div><button class="codex-tab active" data-tab="academy" onclick="window.UI.switchCodexTab('academy')"><div class="tab-icon">🏛️</div><div class="tab-label">Académie</div></button><button class="codex-tab" data-tab="jazz" onclick="window.UI.switchCodexTab('jazz')"><div class="tab-icon">🎷</div><div class="tab-label">Club</div></button><button class="codex-tab" data-tab="laboratory" onclick="window.UI.switchCodexTab('laboratory')"><div class="tab-icon">🧪</div><div class="tab-label">Labo</div></button><div style="flex:1"></div><button class="codex-close" onclick="window.UI.closeModals()">✕</button></div><div class="codex-content-area"><div id="codexGridContainer" class="codex-grid-container"></div><div id="codexDetailContainer" class="codex-detail-container" style="display:none;"></div></div></div></div>`;
        modal.onclick = (e) => { if (e.target === modal) window.UI.closeModals(); }; this.switchCodexTab('academy');
    },

    switchCodexTab(tabName) { Audio.sfx('codex_select'); document.querySelectorAll('.codex-tab').forEach(t => t.classList.remove('active')); document.querySelector(`.codex-tab[data-tab="${tabName}"]`).classList.add('active'); document.getElementById('codexDetailContainer').style.display = 'none'; document.getElementById('codexGridContainer').style.display = 'grid'; this.renderCodexGrid(tabName); },
    
    renderCodexGrid(setKey) {
        const d = window.App.data; const grid = document.getElementById('codexGridContainer'); grid.innerHTML = ''; const set = DB.sets[setKey]; if(!set) return;
        if(setKey === 'jazz' && d.mastery === 0) { grid.innerHTML = `<div class="codex-locked-msg">🔒 Débloquez la Maîtrise 1 pour accéder au Club.</div>`; return; }
        if(setKey === 'laboratory' && d.mastery <= 1) { grid.innerHTML = `<div class="codex-locked-msg">🔒 Débloquez la Maîtrise 2 pour accéder au Labo.</div>`; return; }

        const title1 = document.createElement('h3'); title1.className = 'codex-section-title'; title1.innerText = "Entités Harmoniques"; grid.appendChild(title1);
        set.chords.forEach(c => {
            let unlocked = true; if(setKey === 'jazz' && d.mastery === 1 && c.unlockLvl > d.lvl) unlocked = false; if(setKey === 'laboratory' && d.mastery <= 2 && c.unlockLvl > d.lvl) unlocked = false;
            const card = document.createElement('div'); card.className = `codex-card ${unlocked ? 'unlocked' : 'locked'}`; const symbol = unlocked ? this.getSymbol(c.id) : '?';
            card.innerHTML = `<div class="codex-holo"></div><div class="codex-card-symbol">${symbol}</div><div class="codex-card-title">${unlocked ? c.name : '???'}</div>`;
            card.onclick = () => { if(unlocked) { this.showCodexCard(c, setKey); Audio.sfx('card_open'); } else { this.showToast("🔒 Verrouillé"); this.vibrate(50); } }; grid.appendChild(card);
        });

        if(setKey === 'laboratory') {
            set.chords.forEach(parent => {
                let parentUnlocked = true; if(d.mastery <= 2 && parent.unlockLvl > d.lvl) parentUnlocked = false;
                if (parentUnlocked) {
                    const subTitle = document.createElement('h3'); subTitle.className = 'codex-section-title'; subTitle.style.marginTop = '20px'; subTitle.style.color = 'var(--cyan)'; subTitle.innerText = `Analyse : ${parent.name}`; grid.appendChild(subTitle);
                    if (parent.configs) {
                        parent.configs.forEach(conf => {
                            const card = document.createElement('div'); card.className = "codex-card unlocked landscape"; card.style.borderColor = "var(--cyan)"; let symbolHtml = `<span style="font-size:1.5rem">${conf.sub}</span>`;
                            card.innerHTML = `<div class="codex-holo"></div><div class="codex-card-symbol landscape">${symbolHtml}</div><div class="codex-card-title">${conf.name}</div>`;
                            card.onclick = () => { const synth = { id: `lab_${parent.id}_${conf.id}`, isSyntheticLab: true, name: conf.name, sub: `${parent.tech} / ${conf.sub}`, iv: conf.iv, parent: parent }; this.showCodexCard(synth, setKey); Audio.sfx('card_open'); }; grid.appendChild(card);
                        });
                    }
                }
            }); return;
        }

        const title2 = document.createElement('h3'); title2.className = 'codex-section-title'; title2.style.marginTop = '20px'; title2.innerText = "Techniques & Variations"; grid.appendChild(title2);
        let vars = []; if(setKey === 'academy') { vars = DB.invs; } else if(setKey === 'jazz') { vars = DB.voicings; }
        vars.forEach(v => {
            const card = document.createElement('div'); card.className = "codex-card unlocked landscape"; let symbolHtml = v.corr; if(v.figure && v.figure.length > 0) { symbolHtml = `<div class="figured-bass">${v.figure.map(n=>`<span>${n}</span>`).join('')}</div>`; }
            card.innerHTML = `<div class="codex-holo"></div><div class="codex-card-symbol landscape">${symbolHtml}</div><div class="codex-card-title">${v.name}</div>`;
            card.onclick = () => { let syntheticCard = { ...v, iv: [] }; syntheticCard.id = `${setKey === 'jazz'?'voc':'inv'}_${v.id}`; this.showCodexCard(syntheticCard, setKey); Audio.sfx('card_open'); }; grid.appendChild(card);
        });
    },

    showCodexCard(chord, setKey) {
        const grid = document.getElementById('codexGridContainer'); const detail = document.getElementById('codexDetailContainer'); grid.style.display = 'none'; detail.style.display = 'flex';
        let data = CODEX_DATA[chord.id] || { flavor: "Données non disponibles.", theory: "...", coach: "...", tags: [], examples: [] };
        if (chord.isSyntheticLab) { const parentData = CODEX_DATA[chord.parent.id] || {}; data = { flavor: parentData.flavor, coach: parentData.coach, tags: parentData.tags, examples: parentData.examples, theory: `<strong>Intervalles (1/2 tons) :</strong> [ ${chord.iv.join(' - ')} ]<br>Configuration spécifique de la ${chord.parent.name}.` }; }
        const tagsHTML = (data.tags || []).map(t => `<span class="codex-chip">${t}</span>`).join('');
        const examplesHTML = (data.examples && data.examples.length > 0) ? `<div class="cd-examples"><strong>🎵 Exemples Célèbres :</strong><ul>${data.examples.map(e => `<li>${e}</li>`).join('')}</ul></div>` : '';
        let configsHTML = ''; if(setKey === 'laboratory' && chord.configs && !chord.isSyntheticLab) { configsHTML = `<div class="cd-section"><div class="cd-theory"><strong>🔬 Configurations Spécifiques :</strong><ul>`; chord.configs.forEach(c => { configsHTML += `<li><strong>${c.name} :</strong> ${c.sub}</li>`; }); configsHTML += `</ul></div></div>`; }

        detail.innerHTML = `<div class="cd-nav-bar"><button class="cd-back-btn" onclick="window.UI.backToCodexGrid()">← Retour</button><div style="flex:1"></div><button class="cd-close-btn" onclick="window.UI.closeModals()">✕</button></div><div class="cd-scroll-content"><div class="cd-header-hero"><div class="cd-hero-icon">${chord.isSyntheticLab ? '🔬' : this.getSymbol(chord.id)}</div><div class="cd-hero-text"><h2>${chord.name}</h2><span>${chord.sub}</span></div><button class="btn-gold-play" id="cdPlayBtn" onclick="window.UI.playCodexSound()">▶</button></div><div class="cd-tags-row">${tagsHTML}</div><div class="cd-vis"><canvas id="codexPianoCanvas" width="300" height="80"></canvas></div><div class="cd-section"><div class="cd-flavor">${data.flavor}</div></div><div class="cd-section"><div class="cd-theory">${data.theory}</div>${examplesHTML}</div>${configsHTML}<div class="cd-coach-box"><div class="coach-head">🧠 Le Coach</div><div>${data.coach}</div></div><button class="btn-action-train" onclick="window.UI.startTrainingFromCodex('${chord.id}', '${setKey}')">🎯 S'entraîner sur cet accord</button></div>`;
        
        let notes = [];
        if(setKey === 'laboratory') { if (chord.isSyntheticLab) { const root = 60; notes = chord.iv.map(i => root + i); } else if (chord.configs) { notes = window.App.getNotes(chord, 0, 60, false, 'laboratory'); } } 
        else { if (chord.id.startsWith('inv_') || chord.id.startsWith('voc_')) { const demoChord = { id: 'demo', iv: [0,4,7,11] }; const varId = parseInt(chord.id.split('_')[1]); notes = window.App.getNotes(demoChord, varId, 60, false, setKey); } else { notes = window.App.getNotes(chord, 0, 60, false, setKey); } }
        detail.dataset.notes = JSON.stringify(notes); setTimeout(() => { const canvas = document.getElementById('codexPianoCanvas'); if(canvas) Piano.visualize(notes, canvas); }, 100);
    },
    
    playCodexSound() { const det = document.getElementById('codexDetailContainer'); const btn = document.getElementById('cdPlayBtn'); if(btn) { btn.classList.add('playing'); setTimeout(() => btn.classList.remove('playing'), 500); } if(det && det.dataset.notes) { const notes = JSON.parse(det.dataset.notes); Audio.chord(notes, true); Piano.visualize(notes, document.getElementById('codexPianoCanvas')); } },
    backToCodexGrid() { Audio.sfx('codex_select'); document.getElementById('codexDetailContainer').style.display = 'none'; document.getElementById('codexGridContainer').style.display = 'grid'; },
    startTrainingFromCodex(chordId, setKey) {
        let targetC = []; let targetI = []; const isVar = chordId.includes('_') && (chordId.startsWith('inv') || chordId.startsWith('voc') || chordId.startsWith('lab'));
        if (isVar) { const parts = chordId.split('_'); const varId = parseInt(parts[parts.length-1]); targetI = [varId]; if(parts[0] === 'lab') { const parentId = parts.slice(1, parts.length-1).join('_'); targetC = [parentId]; } else { targetC = DB.sets[setKey].chords.map(c => c.id); } window.UI.showToast(`Entraînement : Var ${varId}`); } 
        else { targetC = [chordId]; if(setKey === 'laboratory') targetI = [0,1,2,3]; else if(setKey === 'jazz') targetI = DB.voicings.map(i => i.id); else targetI = DB.invs.map(i => i.id); window.UI.showToast(`Entraînement : ${chordId}`); }
        if (window.App.data.currentSet !== setKey) { window.App.loadSet(setKey, true); }
        window.App.data.settings.activeC = targetC; window.App.data.settings.activeI = targetI; window.App.save();
        window.UI.closeModals(); window.UI.renderSettings(); window.UI.renderBoard(); window.App.playNew();
    },

    closeModals() { document.querySelectorAll('.modal-overlay').forEach(m=>m.classList.remove('open')); },
    
    renderSettings() { 
        const d = window.App.data;
        
        // INPUT USERNAME
        const nameInput = document.getElementById('usernameInput');
        if(nameInput) {
            nameInput.value = d.username || "";
        }

        const grids = document.querySelectorAll('.settings-grid');
        const setContainer = grids[0];
        if(setContainer) {
            setContainer.style.gridTemplateColumns = "1fr 1fr 1fr"; setContainer.innerHTML = ''; 
            const sets = ['academy', 'jazz', 'laboratory'];
            sets.forEach(sid => {
                const s = DB.sets[sid]; const div = document.createElement('div'); div.className = d.currentSet === sid ? 'setting-chip active' : 'setting-chip';
                let isLocked = false; if(sid === 'jazz' && d.mastery < 1) isLocked = true; if(sid === 'laboratory' && d.mastery < 2) isLocked = true; if(isLocked) div.classList.add('locked');
                div.innerText = (sid === 'academy' ? "🏛️ Académie" : (sid === 'jazz' ? "🎷 Le Club" : "🧪 Labo"));
                if(sid === 'laboratory') div.style.borderColor = "var(--cyan)"; if(sid === 'laboratory' && d.currentSet === 'laboratory') div.style.boxShadow = "0 0 15px var(--cyan)";
                if(sid === 'jazz') div.style.borderColor = "var(--gold)"; if(sid === 'jazz' && d.currentSet === 'jazz') div.style.boxShadow = "0 0 15px var(--gold)";
                div.onclick = () => { if(isLocked) window.UI.showToast("🔒 Verrouillé"); else window.App.loadSet(sid); }; setContainer.appendChild(div);
            });
        }
        if(d.currentSet === 'jazz' || d.currentSet === 'laboratory') document.getElementById('rowToggleOpen').style.display='none'; else document.getElementById('rowToggleOpen').style.display='flex';
        const gen = (arr, type, dest) => { document.getElementById(dest).innerHTML = arr.map(x => { const active = (type==='c'?d.settings.activeC:d.settings.activeI).includes(x.id); let locked = window.App.isLocked(x.id); let cls = `setting-chip ${active?'active':''} ${locked?'locked':''}`; const visual = this.getLabel(x, type); return `<div class="${cls}" onclick="window.App.toggleSetting('${type}', ${typeof x.id==='string'?"'"+x.id+"'":x.id})">${visual}</div>`; }).join(''); }; 
        gen(DB.chords, 'c', 'settingsChords'); 
        if(d.currentSet === 'laboratory') { const labOpts = [ {id: 0, name: "Pos. Alpha (0)", corr: "Config 0"}, {id: 1, name: "Pos. Beta (1)", corr: "Config 1"}, {id: 2, name: "Pos. Gamma (2)", corr: "Config 2"}, {id: 3, name: "Pos. Delta (3)", corr: "Config 3"} ]; gen(labOpts, 'i', 'settingsInvs'); } else { gen(DB.currentInvs, 'i', 'settingsInvs'); }
    },
    
    renderProfile() {
        const d = window.App.data;
        const r = DB.ranks[Math.min(d.lvl-1, DB.ranks.length-1)];
        document.getElementById('profileAvatar').innerText = r.i; document.getElementById('profileName').innerText = r.t; document.getElementById('profileRank').innerText = `Niveau ${d.lvl}`;
        const lore = this.getLoreState(d.mastery);
        const techContainer = document.getElementById('profileMasteryName'); const loreContainer = document.getElementById('profileStars');
        techContainer.innerHTML = `<span class="mastery-tech-id">[${lore.rankLabel}]</span> <span class="mastery-tech-stars">${lore.starsHTML}</span>`; techContainer.className = 'profile-tech-row'; loreContainer.innerHTML = "";
        const modal = document.getElementById('modalProfile'); modal.classList.add('tier-dynamic'); modal.style.setProperty('--tier-color', lore.color); modal.style.setProperty('--tier-shadow', lore.shadow);
        let locEl = document.getElementById('profileLocation'); if(!locEl) { locEl = document.createElement('div'); locEl.id = 'profileLocation'; locEl.className = 'profile-location-badge'; document.querySelector('.profile-header').appendChild(locEl); }
        if(lore.place) { locEl.style.display = 'inline-block'; locEl.innerHTML = `🗺️ ${lore.place}`; locEl.style.color = lore.color; locEl.style.borderColor = lore.color; } else { locEl.style.display = 'none'; }
        let footerLore = document.getElementById('profileFooterLore'); if(!footerLore) { footerLore = document.createElement('div'); footerLore.id = 'profileFooterLore'; footerLore.className = 'profile-footer-lore'; document.querySelector('#modalProfile .modal').appendChild(footerLore); } footerLore.innerHTML = `Rang : <span style="color:var(--tier-color); font-weight:700;">${lore.fullName}</span>`;
        const pct = Math.min(100, (d.xp / d.next) * 100); document.getElementById('profileXpBar').style.width = pct + "%"; document.getElementById('profileXpVal').innerText = Math.floor(d.xp) + " XP"; document.getElementById('profileNextVal').innerText = d.lvl >= 20 ? "MAX" : (Math.floor(d.next) + " XP"); document.getElementById('profileTotal').innerText = window.App.session.globalTot; const acc = window.App.session.globalTot ? Math.round((window.App.session.globalOk/window.App.session.globalTot)*100) : 0; document.getElementById('profileAcc').innerText = acc + "%";
        const btn = document.getElementById('btnPrestige'); if(d.lvl >= 20) { const nextM = d.mastery + 1; const nextLore = this.getLoreState(nextM); const destName = nextLore.place ? nextLore.place : "L'Inconnu"; btn.disabled = false; btn.removeAttribute('disabled'); document.getElementById('prestigeNextName').innerText = `Vers : ${destName}`; btn.classList.remove('locked'); } else { btn.disabled = true; btn.setAttribute('disabled', 'true'); document.getElementById('prestigeNextName').innerText = "Niveau 20 Requis"; }
    },

    renderStats() {
        const advice = window.App.analyzeCoach ? window.App.analyzeCoach() : {t:"Conseil", m:"Joue un peu plus !"};
        let badgeHTML = ""; if(advice.target) { let targetName = advice.target; const allChords = [...DB.sets.academy.chords, ...DB.sets.jazz.chords, ...DB.sets.laboratory.chords]; const found = allChords.find(c => c.id === advice.target); if(found) targetName = found.name; badgeHTML = `<span class="coach-tag context-badge" style="background:var(--accent); margin-right:5px;">${targetName}</span>`; }
        let msg = advice.m; msg = msg.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); msg = msg.replace(/\*(.*?)\*/g, '<em>$1</em>');
        document.getElementById('coachDisplay').innerHTML = `<div class="coach-avatar">🧠</div><div class="coach-bubble"><div><span class="coach-tag">${advice.t}</span> ${badgeHTML}</div>${msg}</div>`;
        const histContainer = document.getElementById('historyChart'); let histHTML = '<div class="chart-limit-line"></div><div class="chart-container">'; const data = window.App.data.history || []; for(let i=0; i<7; i++) { const entry = data[i]; if(entry) { const pct = Math.round((entry.ok / entry.tot) * 100); let col = '#ef4444'; if(pct >= 50) col = '#f59e0b'; if(pct >= 80) col = '#10b981'; histHTML += `<div class="chart-col"><div class="chart-track"><div class="chart-bar" style="height:${pct}%; background:${col};"></div></div><span class="chart-label">${entry.date}</span></div>`; } else { histHTML += `<div class="chart-col"><div class="chart-track" style="background:rgba(255,255,255,0.02);"></div><span class="chart-label">-</span></div>`; } } histHTML += '</div>'; histContainer.innerHTML = histHTML;
        const html = (arr, cat) => arr.map(x => { let s; if(cat === 'i' && window.App.data.currentSet === 'jazz') { return ""; } if (window.App.data.currentSet === 'laboratory' && cat === 'i') return ""; s = window.App.data.stats[cat][x.id] || {ok:0, tot:0}; const p = s.tot?Math.round((s.ok/s.tot)*100):0; const col = p>=80?'var(--success)':p>=50?'var(--warning)':'var(--error)'; return `<div class="stat-item"><div class="stat-header"><span>${x.name||x.corr}</span><span>${p}%</span></div><div class="stat-track"><div class="stat-fill" style="width:${p}%;background:${s.tot?col:'transparent'}"></div></div></div>`; }).join('');
        let chordHTML = html(DB.chords, 'c'); let invHTML = "";
        if(window.App.data.currentSet === 'jazz') { invHTML = "<h4>Voicings</h4>" + DB.currentInvs.map(x => { const s = window.App.data.stats.v[x.id] || {ok:0, tot:0}; const p = s.tot?Math.round((s.ok/s.tot)*100):0; const col = p>=80?'var(--success)':p>=50?'var(--warning)':'var(--error)'; return `<div class="stat-item"><div class="stat-header"><span>${x.corr}</span><span>${p}%</span></div><div class="stat-track"><div class="stat-fill" style="width:${p}%;background:${s.tot?col:'transparent'}"></div></div></div>`; }).join(''); } else if (window.App.data.currentSet === 'laboratory') { invHTML = "<h4>Détail des Configurations</h4>"; DB.sets.laboratory.chords.forEach(c => { if(window.App.data.settings.activeC.includes(c.id)) { invHTML += `<h5 style="margin:8px 0 4px 0; color:var(--cyan); border-bottom:1px solid rgba(6,182,212,0.2); padding-bottom:2px;">${c.name}</h5>`; c.configs.forEach(conf => { const key = `${c.id}_${conf.id}`; const s = window.App.data.stats.l[key] || {ok:0, tot:0}; const p = s.tot?Math.round((s.ok/s.tot)*100):0; const col = p>=80?'var(--success)':p>=50?'var(--warning)':'var(--error)'; invHTML += `<div class="stat-item"><div class="stat-header"><span style="color:var(--text-dim);">${conf.name}</span><span>${p}%</span></div><div class="stat-track"><div class="stat-fill" style="width:${p}%;background:${s.tot?col:'transparent'}"></div></div></div>`; }); } }); } else { invHTML = "<h4>Renversements</h4>" + html(DB.currentInvs, 'i'); }
        document.getElementById('statsContent').innerHTML = "<h4>Accords</h4>"+chordHTML+"<br>"+invHTML;
        
        // --- BADGES RENDER ---
        const grid = document.getElementById('badgesGrid'); grid.innerHTML = ''; 
        const unlockedIDs = window.App.data.badges; 
        const totalVisible = BADGES.filter(b => !b.secret || unlockedIDs.includes(b.id)).length; 
        const unlockedCount = unlockedIDs.length; 
        document.getElementById('badgeCount').innerText = `${unlockedCount}/${totalVisible}`;
        
        const renderBadge = (b) => { 
            const unlocked = unlockedIDs.includes(b.id); 
            const el = document.createElement('div'); 
            el.className = `badge-item set-${b.setID || 'core'} ${unlocked ? 'unlocked' : ''}`; 
            el.innerHTML = b.icon; 
            if(b.category === 'arena') el.style.borderColor = "var(--primary)";
            el.onclick = () => { window.UI.openBadgeLightbox(b); }; 
            grid.appendChild(el); 
        };
        
        // V5.2 - SECTION ARENE
        const arenaTitle = document.createElement('h4'); 
        arenaTitle.style.cssText = "grid-column: 1 / -1; margin: 0 0 5px 0; color: var(--primary); font-size: 0.75rem; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 2px;"; 
        arenaTitle.innerText = "⚔️ Arène & Défis"; 
        grid.appendChild(arenaTitle);
        const arenaBadges = BADGES.filter(b => b.category === 'arena' && (!b.secret || unlockedIDs.includes(b.id))); 
        arenaBadges.forEach(b => renderBadge(b));

        const careerTitle = document.createElement('h4'); 
        careerTitle.style.cssText = "grid-column: 1 / -1; margin: 15px 0 5px 0; color: var(--gold); font-size: 0.75rem; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 2px;"; 
        careerTitle.innerText = "🏆 Carrière"; 
        grid.appendChild(careerTitle);
        const careerBadges = BADGES.filter(b => b.category === 'career' && (!b.secret || unlockedIDs.includes(b.id))); 
        const sortOrder = ['core', 'academy', 'jazz', 'laboratory']; 
        careerBadges.sort((a,b) => sortOrder.indexOf(a.setID) - sortOrder.indexOf(b.setID)); 
        careerBadges.forEach(b => renderBadge(b));
        
        const loreTitle = document.createElement('h4'); 
        loreTitle.style.cssText = "grid-column: 1 / -1; margin: 25px 0 5px 0; color: var(--gold); font-size: 0.75rem; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 2px;"; 
        loreTitle.innerText = "💠 Héritage"; 
        grid.appendChild(loreTitle);
        const loreBadges = BADGES.filter(b => b.category === 'lore' && (!b.secret || unlockedIDs.includes(b.id))); 
        loreBadges.forEach(b => renderBadge(b));
        
        const oldDetail = document.getElementById('badgeDetail'); if(oldDetail) oldDetail.style.display = 'none';
    }
};
