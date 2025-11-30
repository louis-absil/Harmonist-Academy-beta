

import { Audio, Piano } from './audio.js';
import { BADGES, COACH_DB, CODEX_DATA, DB, MASTERY_NAMES } from './data.js';

export const UI = {
    // --- HELPER: SYMBOLS & LABELS ---
    getSymbol(id) {
        if(id.includes('maj7')) return 'Δ';
        if(id.includes('min7')) return '-'; // Jazz standard for min7
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
        
        // LAB STRUCTURES
        if(id === 'struct_36') return '3/6';
        if(id === 'struct_45tr') return '4/5-Tr';
        if(id === 'trichord') return '3-X';
        if(id === 'sus_sym') return 'Sus';
        
        return id;
    },

    getLabel(item, type) {
        // 1. Chiffrage Vertical (Basse Continue)
        if (item.figure && item.figure.length > 0) {
            return `<div class="figured-bass">${item.figure.map(n => `<span>${n}</span>`).join('')}</div>`;
        }
        
        // 2. Accords: Use TECHNICAL NAME (c.tech) for Game/Settings
        if (type === 'c') {
            return item.tech || item.name;
        }

        // 3. Fallback
        return item.corr || item.name;
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

        // --- CHORDS GRID (LEFT PANEL) ---
        const cg = document.getElementById('chordGrid'); cg.innerHTML='';
        if(d.settings.activeC.length > 4) {
             cg.className = "pad-grid grid-c"; 
        } else {
             cg.className = "pad-grid grid-i"; 
        }

        if(d.settings && d.settings.activeC) { 
            DB.chords.forEach(c => { 
                if(!d.settings.activeC.includes(c.id)) return; 
                const ok = d.stats.c[c.id] ? d.stats.c[c.id].ok : 0;
                // Use getLabel (Technical Name)
                const visual = this.getLabel(c, 'c');
                cg.innerHTML += `<div class="pad ${getRankClass(ok)}" id="c-${c.id}" onclick="window.App.select('c','${c.id}')"><div class="pad-main">${visual}</div><div class="pad-sub">${c.sub}</div></div>`; 
            }); 
        }

        // --- VARIATIONS GRID (RIGHT PANEL) ---
        const ig = document.getElementById('invGrid'); ig.innerHTML='';
        
        if (isLab) {
            // --- LABORATORY 2x2 DASHBOARD ---
            ig.className = "pad-grid grid-lab"; // Apply specific grid layout
            
            // CONTEXT & CONFIG
            const session = window.App.session;
            let contextId = session.selC || (session.chord ? session.chord.type.id : d.settings.activeC[0]);
            
            const labConfig = {
                leftTitle: "8ve CONTRACTÉE >|<",
                rightTitle: "8ve DILATÉE <|>",
                leftColor: "var(--warning)",
                rightColor: "var(--primary)"
            };

            if (contextId === 'trichord') {
                labConfig.leftTitle = "DISSONANCE";
                labConfig.rightTitle = "COULEUR";
            } else if (contextId === 'sus_sym') {
                labConfig.leftTitle = "TRIADES SUS";
                labConfig.rightTitle = "EMPILEMENTS";
            }

            // 1. HEADERS
            ig.innerHTML += `
                <div class="lab-header" style="color:${labConfig.leftColor}">${labConfig.leftTitle}</div>
                <div class="lab-header" style="color:${labConfig.rightColor}">${labConfig.rightTitle}</div>
            `;

            // Helper to generate button HTML
            const createLabBtn = (id) => {
                if(!d.settings.activeI.includes(id)) return `<div class="pad locked"></div>`;
                
                const ok = d.stats.l[id] ? d.stats.l[id].ok : 0;
                let visual = "";
                let tagPos = "POS. ?";
                
                if (contextId === 'trichord') {
                    // Vertical Recipe style for Trichords
                    let top='?', bot='?';
                    if(id===0){top='1/2';bot='1/2'; tagPos="CHROMATIQUE";}
                    if(id===1){top='1/2';bot='Tr'; tagPos="VIENNOIS";}
                    if(id===2){top='1';bot='1'; tagPos="PAR TONS";}
                    if(id===3){top='1/2';bot='3M'; tagPos="OCTATONIQUE";}
                    visual = `<div class="figured-bass"><span>${top}</span><span>${bot}</span></div>`;
                }
                else if (contextId === 'sus_sym') {
                    // Big Text style for Sus
                    let txt = "";
                    if(id===0){txt="Sus 2"; tagPos="TRIADE";}
                    if(id===1){txt="Sus 4"; tagPos="TRIADE";}
                    if(id===2){txt="Quartal"; tagPos="EMPILEMENT";}
                    if(id===3){txt="Quintal"; tagPos="EMPILEMENT";}
                    visual = `<div style="font-size:1.1rem; font-weight:900;">${txt}</div>`;
                }
                else {
                    // Default Structs
                    let top = "?", bot = "?";
                    if (contextId === 'struct_36') {
                        if(id === 0) { top='6m'; bot='3m'; tagPos="POS. BASSE"; } 
                        if(id === 1) { top='3m'; bot='6m'; tagPos="POS. HAUTE"; } 
                        if(id === 2) { top='6M'; bot='3M'; tagPos="POS. BASSE"; } 
                        if(id === 3) { top='3M'; bot='6M'; tagPos="POS. HAUTE"; } 
                    } else if (contextId === 'struct_45tr') {
                        if(id === 0) { top='4J'; bot='Tr'; tagPos="POS. BASSE"; }
                        if(id === 1) { top='Tr'; bot='4J'; tagPos="POS. HAUTE"; }
                        if(id === 2) { top='5J'; bot='Tr'; tagPos="POS. BASSE"; }
                        if(id === 3) { top='Tr'; bot='5J'; tagPos="POS. HAUTE"; }
                    }
                    visual = `<div class="figured-bass"><span>${top}</span><span>${bot}</span></div>`;
                }

                let extraClass = (id < 2) ? "lab-contracted" : "lab-expanded";

                return `<div class="pad ${getRankClass(ok)} ${extraClass}" id="i-${id}" onclick="window.App.select('i',${id})">
                    <div class="pad-main">${visual}</div>
                    <div class="lab-tag">${tagPos}</div>
                </div>`;
            };

            // 3. MANUAL INJECTION (Row by Row flow for Grid)
            // Row 1: Var 1 (Left) and Var 3 (Right)
            ig.innerHTML += createLabBtn(1);
            ig.innerHTML += createLabBtn(3);
            
            // Row 2: Var 0 (Left) and Var 2 (Right)
            ig.innerHTML += createLabBtn(0);
            ig.innerHTML += createLabBtn(2);

        } else {
            // --- STANDARD MODE (ACADEMY / JAZZ) ---
            ig.className = "pad-grid grid-i"; // Reset to standard grid

            if(d.settings && d.settings.activeI) { 
                DB.currentInvs.forEach(i => { 
                    if(!d.settings.activeI.includes(i.id)) return; 
                    
                    let ok = 0;
                    let visual = "";
                    let subText = i.sub;

                    if(d.currentSet === 'jazz') {
                        ok = d.stats.v[i.id] ? d.stats.v[i.id].ok : 0;
                        visual = this.getLabel(i, 'i');
                    } else {
                        ok = d.stats.i[i.id] ? d.stats.i[i.id].ok : 0;
                        visual = this.getLabel(i, 'i');
                    }
                    
                    ig.innerHTML += `<div class="pad ${getRankClass(ok)}" id="i-${i.id}" onclick="window.App.select('i',${i.id})"><div class="pad-main">${visual}</div><div class="pad-sub">${subText}</div></div>`; 
                }); 
            }
        }
    },
    renderSel() {
        document.querySelectorAll('.pad').forEach(p => p.classList.remove('selected'));
        if(window.App.session.selC) document.getElementById('c-'+window.App.session.selC).classList.add('selected');
        if(window.App.session.selI !== null && window.App.session.selI !== -1) document.getElementById('i-'+window.App.session.selI).classList.add('selected');
        document.getElementById('valBtn').disabled = !(window.App.session.selC && window.App.session.selI !== null);
    },
    reveal(okC, okI) {
        const c = window.App.session.chord; document.getElementById('c-'+c.type.id).classList.add(okC?'correct':'correction');
        if(!okC && window.App.session.selC) document.getElementById('c-'+window.App.session.selC).classList.add('wrong');
        if(c.type.id !== 'dim7') { document.getElementById('i-'+c.inv).classList.add(okI?'correct':'correction'); if(!okI && window.App.session.selI !== null) document.getElementById('i-'+window.App.session.selI).classList.add('wrong'); }
    },
    resetVisuals() { 
        document.querySelectorAll('.pad').forEach(p => p.className='pad'); window.UI.renderBoard(); 
        const p = document.getElementById('invPanel');
        if(p) { p.style.opacity = '1'; p.style.pointerEvents = 'auto'; }
        
        // FIX BUG 1: Safe check for .reveal to avoid crash in Lab Mode
        document.querySelectorAll('.quiz-btn').forEach(b => {
            b.className='quiz-btn';
            const rev = b.querySelector('.reveal');
            if(rev) rev.innerText='...';
            // In Lab mode, playNewQuiz will completely rewrite innerHTML immediately after, so no fallback needed here
        });
        
        document.getElementById('pianoCanvas').classList.remove('show');
        document.getElementById('visualizer').style.opacity = '0.5';
    },
    msg(txt, state) { const el = document.getElementById('statusText'); el.innerText = txt; el.className = "feedback-msg " + (state==='correct'?'correct':state==='warning'?'warning':state===false?'wrong':''); },
    vibrate(ptr) { if(navigator.vibrate) navigator.vibrate(ptr); },
    updateHeader() {
        const d = window.App.data; const r = DB.ranks[Math.min(d.lvl-1, DB.ranks.length-1)];
        document.getElementById('rankIcon').innerText = r.i; document.getElementById('rankTitle').innerText = r.t; document.getElementById('lvlOverlayName').innerText = r.t;
        document.getElementById('lvlNum').innerText = d.lvl; 
        
        const m = d.mastery;
        let starType = 'star-gold';
        let icon = '⭐';
        if(m >= 5) { starType = 'star-plat'; icon = '⭐'; }
        if(m >= 10) { starType = 'star-ruby'; icon = '⭐'; } 
        
        let stars = ""; 
        const count = (m % 5) || (m>0?5:0); 
        if(m > 0 && count === 0) {} 
        
        for(let i=0; i<count; i++) stars += `<span class="${starType}">${icon}</span>`;
        document.getElementById('headerStars').innerHTML = stars;
        
        const rt = document.getElementById('rankTitle');
        const bl = document.body.classList;
        bl.remove('aura-gold','aura-plat','aura-ruby');
        if(m > 0 && m < 5) bl.add('aura-gold');
        if(m >= 5 && m < 10) bl.add('aura-plat');
        if(m >= 10) bl.add('aura-ruby');

        document.getElementById('xpBar').style.width = (d.xp/d.next)*100 + '%';
        document.getElementById('streakVal').innerText = window.App.session.streak; 
        document.getElementById('streakVal').className = window.App.session.streak > 20 ? 'stat-val streak-super' : (window.App.session.streak > 10 ? 'stat-val streak-fire' : 'stat-val');
        
        if(document.getElementById('scoreGroup').classList.contains('active')) {
            const sc = document.getElementById('currentScoreVal');
            sc.innerText = window.App.session.score;
            sc.style.color = 'var(--gold)';
        }
        const pct = window.App.session.globalTot ? Math.round((window.App.session.globalOk / window.App.session.globalTot) * 100) : 0; document.getElementById('precisionVal').innerText = pct + '%';
    },
    updateChrono() { document.getElementById('timerVal').innerText = window.App.session.time; document.getElementById('livesVal').innerText = '❤️'.repeat(window.App.session.lives); },
    updateBackground(streak) {
        const body = document.body;
        if(streak >= 20) body.style.backgroundColor = '#370b1b'; 
        else if(streak >= 10) body.style.backgroundColor = '#1e1b4b'; 
        else body.style.backgroundColor = '#0f172a'; 
    },
    triggerCombo(streak) {
        this.updateBackground(streak);
        if(streak > 5) {
            const sv = document.getElementById('streakVal');
            sv.style.transform = "scale(1.5)";
            setTimeout(()=>sv.style.transform="scale(1)", 150);
        }
        if(streak > 0 && streak % 10 === 0) {
            const pop = document.getElementById('comboPopup');
            document.getElementById('comboTitle').innerText = `COMBO x${streak}`;
            pop.classList.add('show');
            Audio.sfx('win');
            setTimeout(() => pop.classList.remove('show'), 1500);
        }
    },
    confetti() { const c=document.getElementById('confetti'); const x=c.getContext('2d'); c.width=window.innerWidth; c.height=window.innerHeight; let p=[]; for(let i=0;i<60;i++)p.push({x:c.width/2,y:c.height/2,vx:(Math.random()-0.5)*25,vy:(Math.random()-0.5)*25,c:`hsl(${Math.random()*360},100%,50%)`,l:1}); const u=()=>{x.clearRect(0,0,c.width,c.height); let a=false; p.forEach(k=>{if(k.l>0){k.x+=k.vx;k.y+=k.vy;k.vy+=0.6;k.l-=0.02;x.fillStyle=k.c;x.beginPath();x.arc(k.x,k.y,6,0,7);x.fill();a=true;}}); if(a)requestAnimationFrame(u);}; u(); },
    showLevelUp() { const ov = document.getElementById('levelOverlay'); ov.classList.add('active'); setTimeout(() => { ov.classList.remove('active'); }, 3000); },
    showToast(msg) { const t = document.getElementById('rankToast'); t.innerText = msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'), 3000); },
    showBadge(b) {
        const el = document.getElementById('badgeRibbon');
        const tit = document.getElementById('badgeRibbonTitle');
        tit.innerText = b.title;
        document.querySelector('.badge-ribbon-icon').innerText = b.icon;
        el.classList.add('show');
        setTimeout(() => el.classList.remove('show'), 4000);
    },
    
    updateModeLocks() {
        const d = window.App.data;
        document.querySelectorAll('.mode-opt').forEach(el => el.classList.remove('locked'));
        
        if(d.mastery === 0) {
             if(d.lvl < 3) document.getElementById('modeInverse').classList.add('locked');
             if(d.lvl < 8) document.getElementById('modeChrono').classList.add('locked');
             if(d.lvl < 12) document.getElementById('modeSprint').classList.add('locked');
        }
    },

    openModal(id, locked = false) { 
        if(id==='settingsModal') window.UI.renderSettings(); 
        if(id==='statsModal') window.UI.renderStats(); 
        if(id==='modalProfile') window.UI.renderProfile();
        const el = document.getElementById(id); 
        if(el) { 
            el.classList.add('open'); 
            el.onclick = (e) => { 
                if (locked) return; 
                if (e.target === el) window.UI.closeModals(); 
            };
        } 
    },
    
    openCodex() {
        Audio.sfx('book');
        window.UI.renderCodexGrid();
        const el = document.getElementById('modalCodex');
        el.classList.add('open', 'book-mode');
        el.onclick = (e) => {
            if (e.target === el) window.UI.closeModals();
        };
        setTimeout(()=>el.classList.remove('book-mode'), 600);
    },
    
    closeModals() { document.querySelectorAll('.modal-overlay').forEach(m=>m.classList.remove('open')); },
    
    renderCodexGrid() {
        const d = window.App.data;
        const gridContainer = document.getElementById('codexGrid');
        gridContainer.innerHTML = '';
        
        // --- RENDER BY CHAPTER (SET) ---
        const setsToRender = ['academy', 'jazz'];
        // Note: Laboratory Codex not implemented in grid yet as requested by prompt focus on gameplay UI
        
        setsToRender.forEach(setKey => {
            const set = DB.sets[setKey];
            if(setKey === 'jazz' && d.mastery === 0) return; 

            // Chapter Header
            const chapterTitle = document.createElement('h3');
            chapterTitle.style.cssText = "grid-column: 1 / -1; color: var(--gold); margin: 20px 0 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 5px;";
            chapterTitle.innerText = `Chapitre : ${set.name}`;
            gridContainer.appendChild(chapterTitle);

            // --- SUB-SECTION: ENTITIES (CHORDS) ---
            const subTitleChords = document.createElement('div');
            subTitleChords.style.cssText = "grid-column: 1 / -1; font-size: 0.8rem; color: var(--text-dim); text-transform: uppercase; margin-top: 10px;";
            subTitleChords.innerText = "Entités Harmoniques";
            gridContainer.appendChild(subTitleChords);

            set.chords.forEach(c => {
                let unlocked = true;
                if(setKey === 'jazz' && d.mastery === 1 && c.unlockLvl > d.lvl) unlocked = false;
                
                const div = document.createElement('div');
                div.className = `codex-card ${unlocked ? 'unlocked' : 'locked'}`;
                
                const visual = unlocked ? this.getSymbol(c.id) : '?';

                div.innerHTML = `
                    <div class="codex-holo"></div>
                    <div class="codex-card-symbol">${visual}</div>
                    <div class="codex-card-title">${unlocked ? c.name : '???'}</div>
                `;
                div.onclick = (e) => {
                    e.stopPropagation(); // Prevent closing modal
                    if(unlocked) {
                        window.UI.showCodexCard(c);
                        Audio.sfx('flip');
                    } else {
                        window.UI.showToast("🔒 Accord Verrouillé");
                        window.UI.vibrate([50]);
                    }
                };
                gridContainer.appendChild(div);
            });

            // --- SUB-SECTION: TECHNIQUES (VARIATIONS) ---
            const subTitleVars = document.createElement('div');
            subTitleVars.style.cssText = "grid-column: 1 / -1; font-size: 0.8rem; color: var(--text-dim); text-transform: uppercase; margin-top: 20px;";
            subTitleVars.innerText = "Techniques & Formes";
            gridContainer.appendChild(subTitleVars);

            const vars = (setKey === 'academy') ? DB.invs : DB.voicings;
            const prefix = (setKey === 'academy') ? 'inv' : 'voc';

            vars.forEach(v => {
                const div = document.createElement('div');
                div.className = `codex-card unlocked landscape`; 
                div.style.aspectRatio = "4/3"; 
                
                let symbolHtml = v.corr;
                if(v.figure && v.figure.length > 0) {
                    symbolHtml = `<div class="figured-bass">${v.figure.map(n=>`<span>${n}</span>`).join('')}</div>`;
                }

                div.innerHTML = `
                    <div class="codex-holo"></div>
                    <div class="codex-card-symbol" style="font-size:1.5rem;">${symbolHtml}</div>
                    <div class="codex-card-title">${v.name}</div>
                `;
                div.onclick = (e) => {
                    e.stopPropagation();
                    const baseChord = (setKey === 'academy') ? DB.sets.academy.chords[0] : DB.sets.jazz.chords[0];
                    const synthId = `${prefix}_${v.id}`;
                    
                    const notes = window.App.getNotes(baseChord, v.id, 60, false); 

                    const syntheticCard = {
                        id: synthId,
                        name: v.name,
                        sub: v.sub,
                        iv: [], // Not used because we pass pre-calc notes
                        _precalcNotes: notes
                    };
                    
                    window.UI.showCodexCard(syntheticCard);
                    Audio.sfx('flip');
                };
                gridContainer.appendChild(div);
            });
        });
        
        document.getElementById('codexGridView').style.display = 'block';
        document.getElementById('codexDetailView').style.display = 'none';
        document.getElementById('codexDetailView').classList.remove('active');
    },
    
    showCodexCard(chord) {
        document.getElementById('codexGridView').style.display = 'none';
        const det = document.getElementById('codexDetailView');
        det.classList.add('active');
        det.style.display = 'flex';
        det.onclick = (e) => e.stopPropagation(); // Prevent closing when clicking detail
        
        document.getElementById('cdName').innerText = chord.name;
        document.getElementById('cdSub').innerText = chord.sub;
        
        const data = CODEX_DATA[chord.id] || {flavor: "Mystère...", theory: "Pas d'info.", coach: "..."};
        
        const flavEl = document.getElementById('cdFlavor');
        const theoryEl = document.getElementById('cdTheory');
        const coachEl = document.getElementById('cdCoach');

        if(flavEl) flavEl.innerHTML = data.flavor; 
        if(theoryEl) theoryEl.innerHTML = data.theory; 
        if(coachEl) coachEl.innerText = data.coach;
        
        let notes = [];
        
        // FIX: AUDIO CORRECTION FOR VARIATIONS
        if(chord.id.startsWith('inv_') || chord.id.startsWith('voc_')) {
             const parts = chord.id.split('_');
             const type = parts[0]; // 'inv' or 'voc'
             const id = parseInt(parts[1]);
             // Base chord for audio preview: C Major 7 (Academy) or C Maj 9 (Jazz)
             const base = (type === 'inv') ? DB.sets.academy.chords[0] : DB.sets.jazz.chords[0]; 
             // Use App.getNotes
             notes = window.App.getNotes(base, id, 60, false);
        } else if(chord._precalcNotes) {
            notes = chord._precalcNotes;
        } else {
            // Root Position for Entity Cards
            notes = chord.iv.map(x => 60 + x);
        }
        
        const canvas = document.getElementById('codexPianoCanvas');
        setTimeout(() => {
            Piano.visualize(notes, canvas);
        }, 100);
        
        det.dataset.notes = JSON.stringify(notes);
        det.dataset.currentId = chord.id;

        const isVar = chord.id.startsWith('inv_') || chord.id.startsWith('voc_');
        document.querySelector('.cd-nav').style.display = isVar ? 'none' : 'flex';
        
        if (!isVar) {
             const allChords = [...DB.sets.academy.chords, ...DB.sets.jazz.chords];
             const idx = allChords.findIndex(c => c.id === chord.id);
             
             document.getElementById('cdPrevBtn').onclick = () => {
                 if(idx > 0) window.UI.showCodexCard(allChords[idx-1]);
             };
             document.getElementById('cdNextBtn').onclick = () => {
                 if(idx < allChords.length - 1) window.UI.showCodexCard(allChords[idx+1]);
             };
        }
    },
    
    playCodexSound() {
        const det = document.getElementById('codexDetailView');
        const btn = document.getElementById('cdPlayBtn');
        btn.classList.add('playing');
        setTimeout(() => btn.classList.remove('playing'), 500);

        if(det.dataset.notes) {
            const notes = JSON.parse(det.dataset.notes);
            Audio.chord(notes, true);
            Piano.visualize(notes, document.getElementById('codexPianoCanvas'));
        }
    },
    
    backToCodex() {
        Audio.sfx('flip');
        document.getElementById('codexDetailView').classList.remove('active');
        document.getElementById('codexDetailView').style.display = 'none';
        document.getElementById('codexGridView').style.display = 'block';
    },
    
    closeCodexCard() {
         window.UI.closeModals();
    },

    renderSettings() { 
        const d = window.App.data;
        
        // FIX BUG 2: Robust selection of the Sets Container
        // Do not rely on brittle style attributes like [style="grid-template-columns:1fr 1fr;"]
        // Select by class hierarchy. The FIRST .settings-grid in the document is the Sets container.
        const grids = document.querySelectorAll('.settings-grid');
        const setContainer = grids[0];

        if(setContainer) {
            setContainer.style.gridTemplateColumns = "1fr 1fr 1fr";
            setContainer.innerHTML = ''; 
            
            const sets = ['academy', 'jazz', 'laboratory'];
            sets.forEach(sid => {
                const s = DB.sets[sid];
                const div = document.createElement('div');
                div.className = d.currentSet === sid ? 'setting-chip active' : 'setting-chip';
                
                let isLocked = false;
                if(sid === 'jazz' && d.mastery < 1) isLocked = true;
                if(sid === 'laboratory' && d.mastery < 2) isLocked = true;

                if(isLocked) div.classList.add('locked');
                
                div.innerText = (sid === 'academy' ? "🏛️ Académie" : (sid === 'jazz' ? "🎷 Le Club" : "🧪 Labo"));
                
                if(sid === 'laboratory') div.style.borderColor = "var(--cyan)";
                if(sid === 'laboratory' && d.currentSet === 'laboratory') div.style.boxShadow = "0 0 15px var(--cyan)";

                div.onclick = () => {
                    if(isLocked) window.UI.showToast("🔒 Verrouillé");
                    else window.App.loadSet(sid);
                };
                setContainer.appendChild(div);
            });
        }
        
        if(d.currentSet === 'jazz' || d.currentSet === 'laboratory') document.getElementById('rowToggleOpen').style.display='none';
        else document.getElementById('rowToggleOpen').style.display='flex';

        const gen = (arr, type, dest) => { 
            document.getElementById(dest).innerHTML = arr.map(x => { 
                const active = (type==='c'?d.settings.activeC:d.settings.activeI).includes(x.id); 
                let locked = false;
                if(d.currentSet === 'jazz' && type === 'c' && d.mastery === 1 && x.unlockLvl > d.lvl) locked = true;
                
                let cls = `setting-chip ${active?'active':''} ${locked?'locked':''}`;
                // GAME/SETTINGS: Use Technical Name (x.tech) or Figured Bass
                const visual = this.getLabel(x, type);
                return `<div class="${cls}" onclick="window.App.toggleSetting('${type}', ${typeof x.id==='string'?"'"+x.id+"'":x.id})">${visual}</div>`; 
            }).join(''); 
        }; 
        gen(DB.chords, 'c', 'settingsChords'); 
        gen(DB.currentInvs, 'i', 'settingsInvs'); 
    },
    
    renderProfile() {
        const d = window.App.data;
        const r = DB.ranks[Math.min(d.lvl-1, DB.ranks.length-1)];
        
        document.getElementById('profileAvatar').innerText = r.i;
        document.getElementById('profileName').innerText = r.t;
        document.getElementById('profileRank').innerText = `Niveau ${d.lvl}`;
        document.getElementById('profileMasteryName').innerText = MASTERY_NAMES[Math.min(d.mastery, MASTERY_NAMES.length-1)];
        
        const m = d.mastery;
        let starType = 'star-gold';
        let icon = '⭐';
        if(m >= 5) { starType = 'star-plat'; icon = '⭐'; }
        if(m >= 10) { starType = 'star-ruby'; icon = '⭐'; }
        let stars = ""; 
        const count = (m % 5) || (m>0?5:0);
        for(let i=0; i<count; i++) stars += `<span class="${starType}">${icon}</span>`;
        document.getElementById('profileStars').innerHTML = stars;
        
        const av = document.getElementById('profileAvatar');
        av.style.boxShadow = m>=10?'0 0 20px #d946ef':(m>=5?'0 0 15px #22d3ee':(m>=1?'0 0 15px #fbbf24':'none'));
        av.style.borderColor = m>=10?'#d946ef':(m>=5?'#22d3ee':(m>=1?'#fbbf24':'transparent'));

        const pct = Math.min(100, (d.xp / d.next) * 100);
        document.getElementById('profileXpBar').style.width = pct + "%";
        document.getElementById('profileXpVal').innerText = Math.floor(d.xp) + " XP";
        document.getElementById('profileNextVal').innerText = d.lvl >= 20 ? "MAX" : (Math.floor(d.next) + " XP");
        
        document.getElementById('profileTotal').innerText = window.App.session.globalTot;
        const acc = window.App.session.globalTot ? Math.round((window.App.session.globalOk/window.App.session.globalTot)*100) : 0;
        document.getElementById('profileAcc').innerText = acc + "%";
        
        const btn = document.getElementById('btnPrestige');
        const nextM = Math.min(d.mastery + 1, MASTERY_NAMES.length - 1);
        if(d.lvl >= 20) {
            btn.disabled = false;
            btn.removeAttribute('disabled');
            document.getElementById('prestigeNextName').innerText = `Vers : ${MASTERY_NAMES[nextM]}`;
            btn.classList.remove('locked');
        } else {
            btn.disabled = true;
            btn.setAttribute('disabled', 'true');
            document.getElementById('prestigeNextName').innerText = "Niveau 20 Requis";
        }
    },

    renderStats() {
        const advice = window.App.analyzeCoach ? window.App.analyzeCoach() : {t:"Conseil", m:"Joue un peu plus !"};
         let msg = advice.m;
        msg = msg.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        msg = msg.replace(/\*(.*?)\*/g, '<em>$1</em>');
        document.getElementById('coachDisplay').innerHTML = `<div class="coach-avatar">🧠</div><div class="coach-bubble"><span class="coach-tag">${advice.t}</span><br>${msg}</div>`;

        const histContainer = document.getElementById('historyChart');
        let histHTML = '<div class="chart-limit-line"></div><div class="chart-container">';
        const data = window.App.data.history || [];
        for(let i=0; i<7; i++) {
            const entry = data[i];
            if(entry) {
                const pct = Math.round((entry.ok / entry.tot) * 100);
                let col = '#ef4444'; if(pct >= 50) col = '#f59e0b'; if(pct >= 80) col = '#10b981';
                histHTML += `<div class="chart-col"><div class="chart-track"><div class="chart-bar" style="height:${pct}%; background:${col};"></div></div><span class="chart-label">${entry.date}</span></div>`;
            } else {
                histHTML += `<div class="chart-col"><div class="chart-track" style="background:rgba(255,255,255,0.02);"></div><span class="chart-label">-</span></div>`;
            }
        }
        histHTML += '</div>';
        histContainer.innerHTML = histHTML;
        
        const html = (arr, cat) => arr.map(x => {
            let s;
            if(cat === 'i' && window.App.data.currentSet === 'jazz') {
                 return ""; 
            }
            s = window.App.data.stats[cat][x.id] || {ok:0, tot:0};
            const p = s.tot?Math.round((s.ok/s.tot)*100):0;
            const col = p>=80?'var(--success)':p>=50?'var(--warning)':'var(--error)';
            return `<div class="stat-item"><div class="stat-header"><span>${x.name||x.corr}</span><span>${p}%</span></div><div class="stat-track"><div class="stat-fill" style="width:${p}%;background:${s.tot?col:'transparent'}"></div></div></div>`;
        }).join('');
        
        let chordHTML = html(DB.chords, 'c');
        let invHTML = "";
        if(window.App.data.currentSet === 'jazz') {
            invHTML = "<h4>Voicings</h4>" + DB.currentInvs.map(x => {
                 const s = window.App.data.stats.v[x.id] || {ok:0, tot:0};
                 const p = s.tot?Math.round((s.ok/s.tot)*100):0;
                 const col = p>=80?'var(--success)':p>=50?'var(--warning)':'var(--error)';
                 return `<div class="stat-item"><div class="stat-header"><span>${x.corr}</span><span>${p}%</span></div><div class="stat-track"><div class="stat-fill" style="width:${p}%;background:${s.tot?col:'transparent'}"></div></div></div>`;
            }).join('');
        } else {
            invHTML = "<h4>Renversements</h4>" + html(DB.currentInvs, 'i');
        }

        document.getElementById('statsContent').innerHTML = "<h4>Accords</h4>"+chordHTML+"<br>"+invHTML;

        const grid = document.getElementById('badgesGrid');
        grid.innerHTML = '';
        let count = 0;
        BADGES.forEach(b => {
            const unlocked = window.App.data.badges.includes(b.id);
            if(unlocked) count++;
            const el = document.createElement('div');
            el.className = `badge-item ${unlocked ? 'unlocked' : ''}`;
            el.innerHTML = b.icon;
            el.onclick = () => {
                const det = document.getElementById('badgeDetail');
                det.innerHTML = `<span style="color:white; text-transform:uppercase;">${b.title}</span><br>${b.desc}`;
                if(!unlocked) det.innerHTML += " <span style='color:var(--text-dim)'>(Verrouillé)</span>";
            };
            grid.appendChild(el);
        });
        document.getElementById('badgeCount').innerText = `${count}/${BADGES.length}`;
    },

    startTraining() {
        const det = document.getElementById('codexDetailView');
        const id = det.dataset.currentId;
        if(!id) return;
        
        // Switch Set FIRST
        let isJazz = DB.sets.jazz.chords.find(x => x.id === id);
        
        if(isJazz && window.App.data.currentSet !== 'jazz' && window.App.data.mastery > 0) {
             window.App.loadSet('jazz', true);
        } else if (!isJazz && window.App.data.currentSet === 'jazz') {
             window.App.loadSet('academy', true);
        }

        window.App.setMode('zen');
        
        // Force this chord active
        const allChords = [...DB.sets.academy.chords, ...DB.sets.jazz.chords];
        const c = allChords.find(x => x.id === id);
        window.App.data.settings.activeC = [id];
        
        // Reset Inversions
        window.App.data.settings.activeI = DB.currentInvs.map(i => i.id);
        
        window.App.save();
        window.UI.closeModals();
        window.UI.renderSettings();
        window.UI.renderBoard();
        window.App.playNew();
        
        window.UI.showToast(`Entraînement : ${c.name}`);
    }
};
