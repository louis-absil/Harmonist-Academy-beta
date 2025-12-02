

import { Audio, Piano } from './audio.js';
import { BADGES, CODEX_DATA, DB, LORE_MATERIALS } from './data.js';

// --- CONFIGURATION LORE (MAÎTRISE) ---
const LORE_GRADES = ['Novice', 'Initié', 'Adepte', 'Virtuose', 'Maître'];
const LORE_PLACES = ['Le Club', 'Le Labo', 'Le Cosmos', "L'Institut", 'La Source'];

export const UI = {
    // --- HELPER: SYMBOLS & LABELS ---
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
        
        // LAB STRUCTURES
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
    
    // --- QUIZ VIEW LOGIC (MVC IMPLEMENTATION) ---
    renderQuizOptions(options, targetOpt) {
        // Reset styles for new round
        document.querySelectorAll('.quiz-btn').forEach(b => {
            b.className = 'quiz-btn';
            b.classList.remove('selected', 'correct', 'wrong', 'lab-mode');
        });
        
        const isLab = window.App.data.currentSet === 'laboratory';
        let targetVisual = "";

        // RENDER TARGET (QUESTION) VISUAL IMMEDIATELY
        if (isLab) {
            // Lab Mode Visual logic for Target
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
            // Standard Academy/Jazz Target Visual
            const labelC = this.getLabel(targetOpt.type, 'c');
            let labelI = "";
            if (targetOpt.type.id !== 'dim7') {
                 const invList = (window.App.data.currentSet === 'jazz') ? DB.voicings : DB.invs;
                 const invObj = invList.find(i => i.id === targetOpt.inv);
                 if(invObj) labelI = this.getLabel(invObj, 'i');
            }
            targetVisual = `${labelC}<div style="font-size:0.4em; opacity:0.7; margin-top:5px;">${labelI}</div>`;
        }
        
        document.getElementById('quizTargetLbl').innerHTML = targetVisual;

        // RENDER BUTTONS (BLIND CONTAINERS) with DYNAMIC HIDING
        [0, 1, 2].forEach(idx => {
            const btn = document.getElementById(`qbtn-${idx}`);
            if(!btn) return;
            
            // Check if this option actually exists (Dynamic Pool Size)
            if(options[idx]) {
                btn.style.display = 'flex';
                if (isLab) btn.classList.add('lab-mode');
                // Just Letters, content hidden until reveal
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
            
            // REVEAL LOGIC : GENERATE LABEL CONTENT
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
                     // FIXED: Use getLabel (Figured Bass) instead of plain text name
                     if(invObj) labelI = this.getLabel(invObj, 'i');
                }
                visual = `${labelC}<br><span style="font-size:0.6em; opacity:0.7;">${labelI}</span>`;
            }
            
            const letters = ['A', 'B', 'C'];
            btn.innerHTML = `${letters[idx]}<span class="reveal">${visual}</span>`;
         });
    },

    // --- MASTERY LORE SYSTEM (Hybrid & Scalable) ---
    getLoreState(m) {
        if (m <= 0) return { 
            rankLabel: 'M-00',
            starsHTML: '', 
            fullName: 'Débutant', 
            grade: 'Débutant',
            material: null,
            place: "L'Académie", 
            color: '#94a3b8', 
            shadow: 'rgba(148, 163, 184, 0.2)' 
        };

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
        for(let i=0; i<starCount; i++) {
            starsHTML += `<span class="tier-star">★</span>`;
        }

        return {
            rankLabel,
            starsHTML,
            grade: gradeName,
            material: matName,
            fullName,
            place: placeName,
            color,
            shadow
        };
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

        // --- CHORDS GRID ---
        const cg = document.getElementById('chordGrid'); cg.innerHTML='';
        if(d.settings.activeC.length > 4) { cg.className = "pad-grid grid-c"; } else { cg.className = "pad-grid grid-i"; }

        if(d.settings && d.settings.activeC) { 
            DB.chords.forEach(c => { 
                if(!d.settings.activeC.includes(c.id)) return; 
                const ok = d.stats.c[c.id] ? d.stats.c[c.id].ok : 0;
                const visual = this.getLabel(c, 'c');
                cg.innerHTML += `<div class="pad ${getRankClass(ok)}" id="c-${c.id}" onclick="window.App.select('c','${c.id}')"><div class="pad-main">${visual}</div><div class="pad-sub">${c.sub}</div></div>`; 
            }); 
        }

        // --- VARIATIONS GRID (RIGHT PANEL) ---
        const ig = document.getElementById('invGrid'); ig.innerHTML='';
        
        if (isLab) {
            // DYNAMIC LAB RENDER
            ig.className = "pad-grid grid-lab";
            const session = window.App.session;
            
            // Determine active chord to show correct variations
            let contextId = session.selC || (session.chord ? session.chord.type.id : d.settings.activeC[0]);
            
            // Find the chord object to get its configs
            const chordObj = DB.sets.laboratory.chords.find(c => c.id === contextId);
            
            // Headers setup
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

            ig.innerHTML += `
                <div class="lab-header" style="color:${labConfig.leftColor}">${labConfig.leftTitle}</div>
                <div class="lab-header" style="color:${labConfig.rightColor}">${labConfig.rightTitle}</div>
            `;

            // Config Generator
            const createLabBtn = (id) => {
                if(!chordObj || !chordObj.configs[id]) return `<div class="pad locked"></div>`;
                
                const config = chordObj.configs[id];
                // Stats Lookup using Unique Key
                const statKey = `${contextId}_${id}`;
                const ok = d.stats.l[statKey] ? d.stats.l[statKey].ok : 0;
                
                let visual = "";
                let tagPos = config.name.toUpperCase();
                
                if (contextId === 'trichord') {
                    let top='?', bot='?';
                    // FIX: VISUAL SWAP REQUESTED
                    if(id===0){top='1/2';bot='1/2';}
                    if(id===1){top='Tr';bot='1/2';} // Swapped from 1/2,Tr
                    if(id===2){top='1';bot='1';}
                    if(id===3){top='3M';bot='1/2';} // Swapped from 1/2,3M
                    visual = `<div class="figured-bass"><span>${top}</span><span>${bot}</span></div>`;
                }
                else if (contextId === 'sus_sym') {
                    let txt = "";
                    if(id===0){txt="Sus 2";}
                    if(id===1){txt="Sus 4";}
                    if(id===2){txt="Quartal";}
                    if(id===3){txt="Quintal";}
                    visual = `<div style="font-size:1.1rem; font-weight:900;">${txt}</div>`;
                }
                else if (contextId === 'struct_36') {
                    let top='?', bot='?';
                    if(id===0){top='6m';bot='3m';}
                    if(id===1){top='3m';bot='6m';}
                    if(id===2){top='6M';bot='3M';}
                    if(id===3){top='3M';bot='6M';}
                    visual = `<div class="figured-bass"><span>${top}</span><span>${bot}</span></div>`;
                }
                else if (contextId === 'struct_45tr') {
                    let top='?', bot='?';
                    if(id===0){top='Tr';bot='4J';}
                    if(id===1){top='4J';bot='Tr';}
                    if(id===2){top='Tr';bot='5J';}
                    if(id===3){top='5J';bot='Tr';}
                    visual = `<div class="figured-bass"><span>${top}</span><span>${bot}</span></div>`;
                }

                let extraClass = (id < 2) ? "lab-contracted" : "lab-expanded";

                return `<div class="pad ${getRankClass(ok)} ${extraClass}" id="i-${id}" onclick="window.App.select('i',${id})">
                    <div class="pad-main">${visual}</div>
                    <div class="lab-tag">${tagPos}</div>
                </div>`;
            };
            
            ig.innerHTML += createLabBtn(0);
            ig.innerHTML += createLabBtn(2);
            ig.innerHTML += createLabBtn(1);
            ig.innerHTML += createLabBtn(3);

        } else {
            ig.className = "pad-grid grid-i"; 
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
        document.querySelectorAll('.pad').forEach(p => p.className='pad'); 
        
        // Reset Quiz Buttons specifically
        document.querySelectorAll('.quiz-btn').forEach(b => {
             b.className = 'quiz-btn';
             b.classList.remove('selected', 'correct', 'wrong', 'lab-mode');
        });
        
        window.UI.renderBoard(); 
        const p = document.getElementById('invPanel');
        if(p) { p.style.opacity = '1'; p.style.pointerEvents = 'auto'; }
        
        document.getElementById('pianoCanvas').classList.remove('show');
        document.getElementById('visualizer').style.opacity = '0.5';
    },
    msg(txt, state) { const el = document.getElementById('statusText'); el.innerText = txt; el.className = "feedback-msg " + (state==='correct'?'correct':state==='warning'?'warning':state===false?'wrong':''); },
    vibrate(ptr) { if(navigator.vibrate) navigator.vibrate(ptr); },
    
    updateHeader() {
        const d = window.App.data; 
        const r = DB.ranks[Math.min(d.lvl-1, DB.ranks.length-1)];
        document.getElementById('rankIcon').innerText = r.i; 
        document.getElementById('rankTitle').innerText = r.t; 
        document.getElementById('lvlOverlayName').innerText = r.t;
        document.getElementById('lvlNum').innerText = d.lvl; 
        
        const lore = this.getLoreState(d.mastery);
        const headerLeft = document.querySelector('.header-left');
        headerLeft.className = "header-left tier-dynamic";
        headerLeft.style.setProperty('--tier-color', lore.color);
        headerLeft.style.setProperty('--tier-shadow', lore.shadow);
        
        document.getElementById('headerStars').innerHTML = lore.starsHTML;

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
    
    openBadgeLightbox(b) {
        let el = document.getElementById('badgeOverlay');
        if (!el) {
            el = document.createElement('div');
            el.id = 'badgeOverlay';
            el.className = 'modal-overlay badge-lightbox';
            document.body.appendChild(el);
            el.onclick = () => { el.classList.remove('open'); };
        }
        
        const unlocked = window.App.data.badges.includes(b.id);
        let title = b.title;
        let desc = b.desc;
        let icon = b.icon;
        let lockedTxt = unlocked ? "DÉBLOQUÉ" : "VERROUILLÉ";
        let statusClass = unlocked ? "unlocked" : "locked";

        if(b.secret && !unlocked) {
            title = "Badge Mystère";
            desc = "Continuez votre progression pour révéler ce badge.";
            icon = "🔒";
            lockedTxt = "SECRET";
        }
        
        el.innerHTML = `
            <div class="modal" style="max-width:350px;">
                 <div style="font-size:4rem; margin-bottom:10px; animation:pop 0.5s;">${icon}</div>
                 <h2 style="color:var(--gold); margin:0; text-transform:uppercase; letter-spacing:1px; line-height:1.2;">${title}</h2>
                 <div style="margin-top:10px; font-weight:800; font-size:0.8rem; background:rgba(255,255,255,0.1); padding:4px 10px; border-radius:10px; display:inline-block; letter-spacing:1px;" class="${statusClass}">${lockedTxt}</div>
                 <p style="color:var(--text-dim); margin-top:20px; font-size:1rem; line-height:1.5;">${desc}</p>
                 <button class="cmd-btn btn-listen" style="width:100%; margin-top:20px; padding:12px;">Fermer</button>
            </div>
        `;
        el.classList.add('open');
        window.UI.vibrate(10);
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
        Audio.sfx('codex_open'); 
        const modal = document.getElementById('modalCodex');
        modal.classList.add('open');
        modal.innerHTML = `
        <div class="modal codex-terminal">
            <div class="codex-layout">
                <div class="codex-sidebar">
                    <div class="codex-logo">📖</div>
                    <button class="codex-tab active" data-tab="academy" onclick="window.UI.switchCodexTab('academy')">
                        <div class="tab-icon">🏛️</div>
                        <div class="tab-label">Académie</div>
                    </button>
                    <button class="codex-tab" data-tab="jazz" onclick="window.UI.switchCodexTab('jazz')">
                        <div class="tab-icon">🎷</div>
                        <div class="tab-label">Club</div>
                    </button>
                    <button class="codex-tab" data-tab="laboratory" onclick="window.UI.switchCodexTab('laboratory')">
                        <div class="tab-icon">🧪</div>
                        <div class="tab-label">Labo</div>
                    </button>
                    <div style="flex:1"></div>
                    <button class="codex-close" onclick="window.UI.closeModals()">✕</button>
                </div>
                <div class="codex-content-area">
                    <div id="codexGridContainer" class="codex-grid-container"></div>
                    <div id="codexDetailContainer" class="codex-detail-container" style="display:none;"></div>
                </div>
            </div>
        </div>
        `;
        modal.onclick = (e) => { if (e.target === modal) window.UI.closeModals(); };
        this.switchCodexTab('academy');
    },

    switchCodexTab(tabName) {
        Audio.sfx('codex_select');
        document.querySelectorAll('.codex-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`.codex-tab[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById('codexDetailContainer').style.display = 'none';
        document.getElementById('codexGridContainer').style.display = 'grid';
        this.renderCodexGrid(tabName);
    },
    
    renderCodexGrid(setKey) {
        const d = window.App.data;
        const grid = document.getElementById('codexGridContainer');
        grid.innerHTML = '';
        
        const set = DB.sets[setKey];
        if(!set) return;

        if(setKey === 'jazz' && d.mastery === 0) {
            grid.innerHTML = `<div class="codex-locked-msg">🔒 Débloquez la Maîtrise 1 pour accéder au Club.</div>`;
            return;
        }
        if(setKey === 'laboratory' && d.mastery <= 1) {
             grid.innerHTML = `<div class="codex-locked-msg">🔒 Débloquez la Maîtrise 2 pour accéder au Labo.</div>`;
             return;
        }

        // --- SECTION 1: ENTITIES (PARENTS) ---
        const title1 = document.createElement('h3');
        title1.className = 'codex-section-title';
        title1.innerText = "Entités Harmoniques";
        grid.appendChild(title1);

        set.chords.forEach(c => {
            let unlocked = true;
            if(setKey === 'jazz' && d.mastery === 1 && c.unlockLvl > d.lvl) unlocked = false;
            if(setKey === 'laboratory' && d.mastery <= 2 && c.unlockLvl > d.lvl) unlocked = false;

            const card = document.createElement('div');
            card.className = `codex-card ${unlocked ? 'unlocked' : 'locked'}`;
            const symbol = unlocked ? this.getSymbol(c.id) : '?';
            
            card.innerHTML = `
                <div class="codex-holo"></div>
                <div class="codex-card-symbol">${symbol}</div>
                <div class="codex-card-title">${unlocked ? c.name : '???'}</div>
            `;
            
            card.onclick = () => {
                if(unlocked) {
                    this.showCodexCard(c, setKey);
                    Audio.sfx('card_open');
                } else {
                    this.showToast("🔒 Verrouillé");
                    this.vibrate(50);
                }
            };
            grid.appendChild(card);
        });

        // --- SECTION 2: TECHNIQUES & VARIATIONS ---
        
        // SPECIAL LAB RENDER: Detailed Breakdown per Structure
        if(setKey === 'laboratory') {
            set.chords.forEach(parent => {
                let parentUnlocked = true;
                if(d.mastery <= 2 && parent.unlockLvl > d.lvl) parentUnlocked = false;
                
                if (parentUnlocked) {
                    const subTitle = document.createElement('h3');
                    subTitle.className = 'codex-section-title';
                    subTitle.style.marginTop = '20px';
                    subTitle.style.color = 'var(--cyan)';
                    subTitle.innerText = `Analyse : ${parent.name}`;
                    grid.appendChild(subTitle);
                    
                    if (parent.configs) {
                        parent.configs.forEach(conf => {
                            const card = document.createElement('div');
                            card.className = "codex-card unlocked landscape";
                            card.style.borderColor = "var(--cyan)";
                            
                            // Visual Symbol for Config
                            let symbolHtml = `<span style="font-size:1.5rem">${conf.sub}</span>`;
                            
                            card.innerHTML = `
                                <div class="codex-holo"></div>
                                <div class="codex-card-symbol landscape">${symbolHtml}</div>
                                <div class="codex-card-title">${conf.name}</div>
                            `;
                            
                            card.onclick = () => {
                                // Create Synthetic Card Object
                                const synth = {
                                    id: `lab_${parent.id}_${conf.id}`,
                                    isSyntheticLab: true,
                                    name: conf.name,
                                    sub: `${parent.tech} / ${conf.sub}`,
                                    iv: conf.iv,
                                    parent: parent
                                };
                                this.showCodexCard(synth, setKey);
                                Audio.sfx('card_open');
                            };
                            grid.appendChild(card);
                        });
                    }
                }
            });
            return; // EXIT for Lab, don't show generic variations
        }

        // STANDARD VARIATIONS RENDER (Academy & Jazz)
        const title2 = document.createElement('h3');
        title2.className = 'codex-section-title';
        title2.style.marginTop = '20px';
        title2.innerText = "Techniques & Variations";
        grid.appendChild(title2);
        
        let vars = [];
        if(setKey === 'academy') { vars = DB.invs; }
        else if(setKey === 'jazz') { vars = DB.voicings; }

        vars.forEach(v => {
            const card = document.createElement('div');
            card.className = "codex-card unlocked landscape";
            
            let symbolHtml = v.corr;
            if(v.figure && v.figure.length > 0) {
                symbolHtml = `<div class="figured-bass">${v.figure.map(n=>`<span>${n}</span>`).join('')}</div>`;
            }

            card.innerHTML = `
                <div class="codex-holo"></div>
                <div class="codex-card-symbol landscape">${symbolHtml}</div>
                <div class="codex-card-title">${v.name}</div>
            `;
            
            card.onclick = () => {
                let syntheticCard = { ...v, iv: [] };
                syntheticCard.id = `${setKey === 'jazz'?'voc':'inv'}_${v.id}`;
                
                this.showCodexCard(syntheticCard, setKey);
                Audio.sfx('card_open');
            };
            grid.appendChild(card);
        });
    },

    showCodexCard(chord, setKey) {
        const grid = document.getElementById('codexGridContainer');
        const detail = document.getElementById('codexDetailContainer');
        grid.style.display = 'none';
        detail.style.display = 'flex';
        
        let data = CODEX_DATA[chord.id] || { flavor: "Données non disponibles.", theory: "...", coach: "...", tags: [], examples: [] };
        
        // --- SYNTHETIC LAB HANDLING ---
        if (chord.isSyntheticLab) {
            const parentData = CODEX_DATA[chord.parent.id] || {};
            data = {
                flavor: parentData.flavor,
                coach: parentData.coach,
                tags: parentData.tags,
                examples: parentData.examples,
                theory: `<strong>Intervalles (1/2 tons) :</strong> [ ${chord.iv.join(' - ')} ]<br>Configuration spécifique de la ${chord.parent.name}.`
            };
        }

        const tagsHTML = (data.tags || []).map(t => `<span class="codex-chip">${t}</span>`).join('');
        const examplesHTML = (data.examples && data.examples.length > 0) 
            ? `<div class="cd-examples"><strong>🎵 Exemples Célèbres :</strong><ul>${data.examples.map(e => `<li>${e}</li>`).join('')}</ul></div>`
            : '';

        // --- SPECIFIC LAB PARENT CONFIGS LIST ---
        let configsHTML = '';
        if(setKey === 'laboratory' && chord.configs && !chord.isSyntheticLab) {
            configsHTML = `<div class="cd-section"><div class="cd-theory"><strong>🔬 Configurations Spécifiques :</strong><ul>`;
            chord.configs.forEach(c => {
                configsHTML += `<li><strong>${c.name} :</strong> ${c.sub}</li>`;
            });
            configsHTML += `</ul></div></div>`;
        }

        detail.innerHTML = `
            <div class="cd-nav-bar">
                <button class="cd-back-btn" onclick="window.UI.backToCodexGrid()">← Retour</button>
                <div style="flex:1"></div>
                <button class="cd-close-btn" onclick="window.UI.closeModals()">✕</button>
            </div>
            
            <div class="cd-scroll-content">
                <div class="cd-header-hero">
                    <div class="cd-hero-icon">${chord.isSyntheticLab ? '🔬' : this.getSymbol(chord.id)}</div>
                    <div class="cd-hero-text">
                        <h2>${chord.name}</h2>
                        <span>${chord.sub}</span>
                    </div>
                    <button class="btn-gold-play" id="cdPlayBtn" onclick="window.UI.playCodexSound()">▶</button>
                </div>
                
                <div class="cd-tags-row">${tagsHTML}</div>
                <div class="cd-vis"><canvas id="codexPianoCanvas" width="300" height="80"></canvas></div>
                
                <div class="cd-section"><div class="cd-flavor">${data.flavor}</div></div>
                <div class="cd-section"><div class="cd-theory">${data.theory}</div>${examplesHTML}</div>
                ${configsHTML}
                
                <div class="cd-coach-box"><div class="coach-head">🧠 Le Coach</div><div>${data.coach}</div></div>
                <button class="btn-action-train" onclick="window.UI.startTrainingFromCodex('${chord.id}', '${setKey}')">🎯 S'entraîner sur cet accord</button>
            </div>
        `;
        
        let notes = [];
        // Force Audio Context to Correct Set
        if(setKey === 'laboratory') {
             if (chord.isSyntheticLab) {
                 // Use specific intervals from synthetic card
                 const root = 60;
                 notes = chord.iv.map(i => root + i);
             } else if (chord.configs) {
                 // Default to Config 0 for Parent Preview
                 notes = window.App.getNotes(chord, 0, 60, false, 'laboratory');
             }
        } else {
             // Standard logic
             // Handle synthetic Variations (Voc/Inv)
             if (chord.id.startsWith('inv_') || chord.id.startsWith('voc_')) {
                 // Mock a C Maj7 for demo
                 const demoChord = { id: 'demo', iv: [0,4,7,11] }; 
                 const varId = parseInt(chord.id.split('_')[1]);
                 notes = window.App.getNotes(demoChord, varId, 60, false, setKey);
             } else {
                 notes = window.App.getNotes(chord, 0, 60, false, setKey);
             }
        }

        detail.dataset.notes = JSON.stringify(notes);
        setTimeout(() => {
             const canvas = document.getElementById('codexPianoCanvas');
             if(canvas) Piano.visualize(notes, canvas);
        }, 100);
    },
    
    playCodexSound() {
        const det = document.getElementById('codexDetailContainer');
        const btn = document.getElementById('cdPlayBtn');
        if(btn) { btn.classList.add('playing'); setTimeout(() => btn.classList.remove('playing'), 500); }
        if(det && det.dataset.notes) {
            const notes = JSON.parse(det.dataset.notes);
            Audio.chord(notes, true); 
            Piano.visualize(notes, document.getElementById('codexPianoCanvas'));
        }
    },
    
    backToCodexGrid() {
        Audio.sfx('codex_select');
        document.getElementById('codexDetailContainer').style.display = 'none';
        document.getElementById('codexGridContainer').style.display = 'grid';
    },

    startTrainingFromCodex(chordId, setKey) {
        let targetC = [];
        let targetI = [];
        const isVar = chordId.includes('_') && (chordId.startsWith('inv') || chordId.startsWith('voc') || chordId.startsWith('lab'));
        
        if (isVar) {
            const parts = chordId.split('_');
            const varId = parseInt(parts[parts.length-1]); // Get last part (index)
            targetI = [varId];
            
            if(parts[0] === 'lab') {
                const parentId = parts.slice(1, parts.length-1).join('_'); // Reconstruct parent ID (e.g. struct_36)
                targetC = [parentId];
            } else {
                targetC = DB.sets[setKey].chords.map(c => c.id);
            }
            window.UI.showToast(`Entraînement : Var ${varId}`);
        } else {
            targetC = [chordId];
            // Fix for Lab Mode Dynamic Invs
            if(setKey === 'laboratory') targetI = [0,1,2,3];
            else if(setKey === 'jazz') targetI = DB.voicings.map(i => i.id);
            else targetI = DB.invs.map(i => i.id);
            window.UI.showToast(`Entraînement : ${chordId}`);
        }
        
        if (window.App.data.currentSet !== setKey) {
            window.App.loadSet(setKey, true);
        }
        
        window.App.data.settings.activeC = targetC;
        window.App.data.settings.activeI = targetI;
        window.App.save();
        
        window.UI.closeModals();
        window.UI.renderSettings();
        window.UI.renderBoard();
        window.App.playNew();
    },

    closeModals() { document.querySelectorAll('.modal-overlay').forEach(m=>m.classList.remove('open')); },
    
    renderSettings() { 
        const d = window.App.data;
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
                div.onclick = () => { if(isLocked) window.UI.showToast("🔒 Verrouillé"); else window.App.loadSet(sid); };
                setContainer.appendChild(div);
            });
        }
        
        if(d.currentSet === 'jazz' || d.currentSet === 'laboratory') document.getElementById('rowToggleOpen').style.display='none';
        else document.getElementById('rowToggleOpen').style.display='flex';

        const gen = (arr, type, dest) => { 
            document.getElementById(dest).innerHTML = arr.map(x => { 
                const active = (type==='c'?d.settings.activeC:d.settings.activeI).includes(x.id); 
                let locked = window.App.isLocked(x.id);
                let cls = `setting-chip ${active?'active':''} ${locked?'locked':''}`;
                const visual = this.getLabel(x, type);
                return `<div class="${cls}" onclick="window.App.toggleSetting('${type}', ${typeof x.id==='string'?"'"+x.id+"'":x.id})">${visual}</div>`; 
            }).join(''); 
        }; 
        
        gen(DB.chords, 'c', 'settingsChords'); 
        
        // Lab specific settings renderer
        if(d.currentSet === 'laboratory') {
             // Generate fake objects for the 4 positions
             const labOpts = [
                 {id: 0, name: "Pos. Alpha (0)", corr: "Config 0"},
                 {id: 1, name: "Pos. Beta (1)", corr: "Config 1"},
                 {id: 2, name: "Pos. Gamma (2)", corr: "Config 2"},
                 {id: 3, name: "Pos. Delta (3)", corr: "Config 3"}
             ];
             gen(labOpts, 'i', 'settingsInvs');
        } else {
             gen(DB.currentInvs, 'i', 'settingsInvs'); 
        }
    },
    
    renderProfile() {
        const d = window.App.data;
        const r = DB.ranks[Math.min(d.lvl-1, DB.ranks.length-1)];
        document.getElementById('profileAvatar').innerText = r.i;
        document.getElementById('profileName').innerText = r.t;
        document.getElementById('profileRank').innerText = `Niveau ${d.lvl}`;
        
        const lore = this.getLoreState(d.mastery);
        const techContainer = document.getElementById('profileMasteryName');
        const loreContainer = document.getElementById('profileStars');

        techContainer.innerHTML = `<span class="mastery-tech-id">[${lore.rankLabel}]</span> <span class="mastery-tech-stars">${lore.starsHTML}</span>`;
        techContainer.className = 'profile-tech-row';
        loreContainer.innerHTML = "";
        
        const modal = document.getElementById('modalProfile');
        modal.classList.add('tier-dynamic');
        modal.style.setProperty('--tier-color', lore.color);
        modal.style.setProperty('--tier-shadow', lore.shadow);

        let locEl = document.getElementById('profileLocation');
        if(!locEl) { locEl = document.createElement('div'); locEl.id = 'profileLocation'; locEl.className = 'profile-location-badge'; document.querySelector('.profile-header').appendChild(locEl); }

        if(lore.place) {
            locEl.style.display = 'inline-block';
            locEl.innerHTML = `🗺️ ${lore.place}`;
            locEl.style.color = lore.color;
            locEl.style.borderColor = lore.color;
        } else { locEl.style.display = 'none'; }

        let footerLore = document.getElementById('profileFooterLore');
        if(!footerLore) { footerLore = document.createElement('div'); footerLore.id = 'profileFooterLore'; footerLore.className = 'profile-footer-lore'; document.querySelector('#modalProfile .modal').appendChild(footerLore); }
        footerLore.innerHTML = `Rang : <span style="color:var(--tier-color); font-weight:700;">${lore.fullName}</span>`;
        
        const pct = Math.min(100, (d.xp / d.next) * 100);
        document.getElementById('profileXpBar').style.width = pct + "%";
        document.getElementById('profileXpVal').innerText = Math.floor(d.xp) + " XP";
        document.getElementById('profileNextVal').innerText = d.lvl >= 20 ? "MAX" : (Math.floor(d.next) + " XP");
        document.getElementById('profileTotal').innerText = window.App.session.globalTot;
        const acc = window.App.session.globalTot ? Math.round((window.App.session.globalOk/window.App.session.globalTot)*100) : 0;
        document.getElementById('profileAcc').innerText = acc + "%";
        
        const btn = document.getElementById('btnPrestige');
        if(d.lvl >= 20) {
            const nextM = d.mastery + 1;
            const nextLore = this.getLoreState(nextM);
            const destName = nextLore.place ? nextLore.place : "L'Inconnu";
            btn.disabled = false; btn.removeAttribute('disabled');
            document.getElementById('prestigeNextName').innerText = `Vers : ${destName}`;
            btn.classList.remove('locked');
        } else {
            btn.disabled = true; btn.setAttribute('disabled', 'true');
            document.getElementById('prestigeNextName').innerText = "Niveau 20 Requis";
        }
    },

    renderStats() {
        const advice = window.App.analyzeCoach ? window.App.analyzeCoach() : {t:"Conseil", m:"Joue un peu plus !"};
        
        let badgeHTML = "";
        // INJECTED CONTEXT BADGE
        if(advice.target) {
            let targetName = advice.target;
            // Lookup name
            const allChords = [
                ...DB.sets.academy.chords,
                ...DB.sets.jazz.chords,
                ...DB.sets.laboratory.chords
            ];
            const found = allChords.find(c => c.id === advice.target);
            if(found) targetName = found.name;
            
            // Lab structure name fix
            if(advice.target.startsWith('struct') || advice.target === 'trichord' || advice.target === 'sus_sym') {
                 if(found) targetName = found.name;
            }

            badgeHTML = `<span class="coach-tag context-badge" style="background:var(--accent); margin-right:5px;">${targetName}</span>`;
        }

        let msg = advice.m;
        msg = msg.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        msg = msg.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        document.getElementById('coachDisplay').innerHTML = `<div class="coach-avatar">🧠</div><div class="coach-bubble"><div><span class="coach-tag">${advice.t}</span> ${badgeHTML}</div>${msg}</div>`;

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
            if(cat === 'i' && window.App.data.currentSet === 'jazz') { return ""; }
            
            if (window.App.data.currentSet === 'laboratory' && cat === 'i') return ""; // Don't show generic invs for lab

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
        } else if (window.App.data.currentSet === 'laboratory') {
            // ALIGNED LAB STATS RENDER
            invHTML = "<h4>Détail des Configurations</h4>";
            
            // Loop through defined Structures in the Lab set to match Codex/Board hierarchy
            DB.sets.laboratory.chords.forEach(c => {
                // Check if this chord has stats (or is active)
                // We show all configs for the structure
                if(window.App.data.settings.activeC.includes(c.id)) {
                    invHTML += `<h5 style="margin:8px 0 4px 0; color:var(--cyan); border-bottom:1px solid rgba(6,182,212,0.2); padding-bottom:2px;">${c.name}</h5>`;
                    
                    c.configs.forEach(conf => {
                        const key = `${c.id}_${conf.id}`;
                        const s = window.App.data.stats.l[key] || {ok:0, tot:0};
                        const p = s.tot?Math.round((s.ok/s.tot)*100):0;
                        const col = p>=80?'var(--success)':p>=50?'var(--warning)':'var(--error)';
                        
                        invHTML += `<div class="stat-item"><div class="stat-header"><span style="color:var(--text-dim);">${conf.name}</span><span>${p}%</span></div><div class="stat-track"><div class="stat-fill" style="width:${p}%;background:${s.tot?col:'transparent'}"></div></div></div>`;
                    });
                }
            });
        } else {
            invHTML = "<h4>Renversements</h4>" + html(DB.currentInvs, 'i');
        }

        document.getElementById('statsContent').innerHTML = "<h4>Accords</h4>"+chordHTML+"<br>"+invHTML;

        const grid = document.getElementById('badgesGrid');
        grid.innerHTML = '';
        
        const unlockedIDs = window.App.data.badges;
        const totalVisible = BADGES.filter(b => !b.secret || unlockedIDs.includes(b.id)).length;
        const unlockedCount = unlockedIDs.length;
        document.getElementById('badgeCount').innerText = `${unlockedCount}/${totalVisible}`;
        
        const renderBadge = (b) => {
            const unlocked = unlockedIDs.includes(b.id);
            const el = document.createElement('div');
            el.className = `badge-item set-${b.setID || 'core'} ${unlocked ? 'unlocked' : ''}`;
            el.innerHTML = b.icon;
            el.onclick = () => { window.UI.openBadgeLightbox(b); };
            grid.appendChild(el);
        };

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
        
        const oldDetail = document.getElementById('badgeDetail');
        if(oldDetail) oldDetail.style.display = 'none';
    }
};
