

// --- MASTERY & SETS ---
export const MASTERY_NAMES = [
    "🏛️ L'Académie", "🎷 Le Club", "🧪 Le Laboratoire", "🌌 Le Cosmos"
];

// Cycle de 5 niveaux de Maîtrise par matière (Utilisé par UI.js et BADGES)
export const LORE_MATERIALS = [
    { name: "Cristal",    particle: "de ",  color: "#a5f3fc", shadow: "#22d3ee" }, // Cyan clair
    { name: "Marbre",     particle: "de ",  color: "#e2e8f0", shadow: "#94a3b8" }, // Blanc gris
    { name: "Argent",     particle: "de l'", color: "#cbd5e1", shadow: "#64748b" }, // Argent
    { name: "Or",         particle: "de l'", color: "#fbbf24", shadow: "#b45309" }, // Or
    { name: "Chrome",     particle: "de ",  color: "#38bdf8", shadow: "#0ea5e9" }, // Bleu électrique
    { name: "Carbone",    particle: "de ",  color: "#71717a", shadow: "#27272a" }, // Gris sombre
    { name: "Titane",     particle: "de ",  color: "#94a3b8", shadow: "#475569" }, // Bleu gris
    { name: "Plasma",     particle: "de ",  color: "#c084fc", shadow: "#9333ea" }, // Violet
    { name: "Saphir",     particle: "de ",  color: "#3b82f6", shadow: "#1d4ed8" }, // Bleu royal
    { name: "Émeraude",   particle: "d'",   color: "#34d399", shadow: "#059669" }, // Vert
    { name: "Rubis",      particle: "de ",  color: "#f43f5e", shadow: "#be123c" }, // Rouge
    { name: "Diamant",    particle: "de ",  color: "#818cf8", shadow: "#4f46e5" }, // Indigo
    { name: "Obsidienne", particle: "d'",   color: "#1e293b", shadow: "#0f172a" }, // Noir bleu
    { name: "Météore",    particle: "de ",  color: "#f97316", shadow: "#c2410c" }, // Orange brûlé
    { name: "Quasar",     particle: "de ",  color: "#d946ef", shadow: "#a21caf" }, // Magenta
    { name: "L'Absolu",   particle: "de ",  color: "#fcd34d", shadow: "#ffffff" }  // Or Blanc
];

export const DB = {
    sets: {
        academy: { 
            id: 'academy',
            name: "L'Académie", 
            mode: "std", 
            description: "Les fondations de l'harmonie occidentale.",
            chords: [ 
                { id: 'maj7', name: 'M7M', tech: 'M7M', sub: 'Maj7 / Δ', iv: [0,4,7,11] }, 
                { id: 'min7', name: 'm7m', tech: 'm7m', sub: 'min7 / m7', iv: [0,3,7,10] }, 
                { id: 'dom7', name: 'M7m', tech: 'M7m', sub: 'Dom7 / 7', iv: [0,4,7,10] }, 
                { id: 'hdim7', name: 'dim7m', tech: 'dim7m', sub: 'm7b5 / Ø', iv: [0,3,6,10] }, 
                { id: 'dim7', name: 'dim7dim', tech: 'dim7dim', sub: 'Dim7 / °7', iv: [0,3,6,9] }, 
                { id: 'minmaj7', name: 'm7M', tech: 'm7M', sub: 'mM7 / -Δ', iv: [0,3,7,11] } 
            ]
        },
        jazz: {
            id: 'jazz',
            name: "Le Club",
            mode: "jazz",
            description: "Extensions, couleurs et textures modernes.",
            chords: [
                { id: 'maj69', name: 'M6/9', tech: 'Maj69', sub: 'Maj69 / 6/9', iv: [0,4,7,9,14], unlockLvl: 1 },
                { id: 'min6', name: 'm6', tech: 'm6', sub: 'min6 / m6', iv: [0,3,7,9], unlockLvl: 2 },
                { id: 'hdim7', name: 'm7b5', tech: 'm7b5', sub: 'm7b5 / Ø', iv: [0,3,6,10], unlockLvl: 4 },
                { id: 'dom13', name: 'Dom13', tech: '13', sub: 'Dom13 / 13', iv: [0,4,7,10,21], unlockLvl: 5 }, 
                { id: 'dim7', name: 'Dim7', tech: 'Dim7', sub: 'Dim7 / °7', iv: [0,3,6,9], unlockLvl: 7 },
                { id: 'alt', name: 'Alt', tech: 'Alt', sub: 'Alt / 7alt', iv: [0,4,10,15,20], unlockLvl: 8 }, 
                { id: 'susb9', name: 'Susb9', tech: 'Susb9', sub: 'Susb9 / 7sus(b9)', iv: [0,5,7,10,13], unlockLvl: 10 },
                { id: '7sus4', name: '7sus4', tech: '7sus4', sub: 'Sus4 / 7sus', iv: [0,5,7,10], unlockLvl: 12 },
                { id: 'maj7s11', name: 'M7#11', tech: 'M7#11', sub: 'Lydien / M7#11', iv: [0,4,7,11,18], unlockLvl: 14 },
                { id: 'minmaj7', name: 'mM7', tech: 'mM7', sub: 'mM7 / -Δ', iv: [0,3,7,11], unlockLvl: 16 },
                { id: 'maj9', name: 'M9', tech: 'Maj9', sub: 'Maj9 / M9', iv: [0,4,7,11,14], unlockLvl: 18 },
                { id: 'min9', name: 'm9', tech: 'min9', sub: 'min9 / m9', iv: [0,3,7,10,14], unlockLvl: 20 }
            ]
        },
        laboratory: {
            id: 'laboratory',
            name: "Le Laboratoire",
            mode: "lab",
            description: "Architectures & Espaces Modernes.",
            chords: [
                { id: 'struct_36', name: 'Structure 3-6', tech: '3/6', sub: 'Struct. A', iv: [0,3,11], unlockLvl: 1 },
                { id: 'struct_45tr', name: 'Structure 4/5-Tr', tech: '4/5-Tr', sub: 'Struct. B', iv: [0,6,11], unlockLvl: 5 },
                { id: 'trichord', name: 'Trichordes', tech: '3-X', sub: 'Texture', iv: [0,1,2], unlockLvl: 10 },
                { id: 'sus_sym', name: 'Suspendus', tech: 'Sus', sub: 'Symétrie', iv: [0,2,7], unlockLvl: 15 }
            ]
        }
    },
    invs: [ 
        { id: 0, name: 'État Fondamental', sub: 'Basse = Tonique', corr: 'Fond.', figure: ['7'], type: 'inv' }, 
        { id: 1, name: '1er Renversement', sub: 'Basse = Tierce', corr: '1er', figure: ['6','5'], type: 'inv' }, 
        { id: 2, name: '2ème Renversement', sub: 'Basse = Quinte', corr: '2ème', figure: ['4','3'], type: 'inv' }, 
        { id: 3, name: '3ème Renversement', sub: 'Basse = 7ème', corr: '3ème', figure: ['2'], type: 'inv' } 
    ],
    voicings: [ 
        { id: 0, name: 'Position Serrée', sub: 'Close', corr: 'Close', type: 'voc' }, 
        { id: 1, name: 'Drop 2', sub: 'Ouvert', corr: 'Drop 2', type: 'voc' },
        { id: 2, name: 'Shell Voicing', sub: 'Main Gauche', corr: 'Shell', type: 'voc' },
        { id: 3, name: 'Rootless', sub: 'Sans Basse', corr: 'Rootless', type: 'voc' }
    ],
    lab_configs: [
        { id: 0, name: 'Forme A', sub: 'Contracté/Bas', corr: 'A', figure: [], type: 'lab' },
        { id: 1, name: 'Forme B', sub: 'Contracté/Haut', corr: 'B', figure: [], type: 'lab' },
        { id: 2, name: 'Forme C', sub: 'Dilaté/Bas', corr: 'C', figure: [], type: 'lab' },
        { id: 3, name: 'Forme D', sub: 'Dilaté/Haut', corr: 'D', figure: [], type: 'lab' }
    ],
    ranks: [ {t:"Tourneur de pages enthousiaste",i:"📄"}, {t:"Régisseur distrait",i:"🔦"}, {t:"Déchiffreur du dimanche",i:"👓"}, {t:"Spécialiste des cordes à vide",i:"🎻"}, {t:"Harmoniste en herbe",i:"🌱"}, {t:"Explorateur de Tonalités",i:"🧭"}, {t:"Adepte des mouvements contraires",i:"↔️"}, {t:"Amateur de résolutions heureuses",i:"😌"}, {t:"Expert du Retard",i:"⏳"}, {t:"Premier Prix de Solfège",i:"🥇"}, {t:"Chef de pupitre",i:"🎼"}, {t:"Supersoliste",i:"🌟"}, {t:"Disciple de Rameau",i:"📖"}, {t:"Architecte des Modulations",i:"🏗️"}, {t:"Chef d'orchestre inspiré",i:"🥢"}, {t:"Virtuose de l’oreille relative",i:"👂"}, {t:"Explorateur du chromatisme",i:"🌈"}, {t:"Théoricien Post-Tonal",i:"🌌"}, {t:"Maître des Fonctions harmoniques",i:"🔮"}, {t:"Réincarnation de Bach",i:"👑"} ],
    chords: [],
    currentInvs: []
};

export const CODEX_DATA = {
    // --- ACADEMY CHORDS ---
    maj7: { flavor: "L'élégance intemporelle.", theory: "<strong>Structure :</strong> Fondamentale + Tierce Maj + Quinte Juste + 7ème Maj.<br><strong>Fonction :</strong> Ier ou IVe degré. Inspire la stabilité, le rêve, la romance.", coach: "Intervalles : 2 tons, 1.5 ton, 2 tons. Chante l'arpège de 'Gymnopédie' de Satie." },
    min7: { flavor: "La mélancolie douce.", theory: "<strong>Structure :</strong> Fondamentale + Tierce min + Quinte Juste + 7ème min.<br><strong>Fonction :</strong> IIe, IIIe ou VIe degré. Le pilier des cadences II-V-I.", coach: "Intervalles : 1.5 ton, 2 tons, 1.5 ton. C'est stable, pas de triton." },
    dom7: { flavor: "Le moteur harmonique.", theory: "<strong>Structure :</strong> Fondamentale + Tierce Maj + Quinte Juste + 7ème min.<br><strong>Fonction :</strong> Ve degré (Dominante). Contient un triton (3 tons) qui appelle une résolution.", coach: "La tierce veut monter, la 7ème veut descendre." },
    hdim7: { flavor: "Le point de bascule.", theory: "<strong>Structure :</strong> Fondamentale + Tierce min + Quinte bémol + 7ème min.<br><strong>Fonction :</strong> IIe degré en mineur. Prépare la tension de la dominante.", coach: "Appelé aussi 'Demi-Diminué'. Très utilisé en Jazz mineur." },
    dim7: { flavor: "La symétrie anxieuse.", theory: "<strong>Structure :</strong> Empilement strict de tierces mineures.<br><strong>Fonction :</strong> Accord de passage ou Dominante sans fondamentale. Symétrique : chaque note peut être la fondamentale.", coach: "Son de film d'horreur classique." },
    minmaj7: { flavor: "Le détective dans la brume.", theory: "<strong>Structure :</strong> Parfait mineur + 7ème Maj.<br><strong>Fonction :</strong> Ier degré en mineur harmonique. Forte dissonance interne (7M vs 3m).", coach: "Le 'Jeu' de l'accord : triste en bas, perçant en haut." },

    // --- ACADEMY INVERSIONS (Techniques) ---
    inv_0: { flavor: "L'Ancrage.", theory: "<strong>Basse :</strong> La Tonique (1).<br>L'état le plus stable et le plus lourd. Toutes les notes reposent sur leur fondation naturelle.", coach: "C'est l'accord 'bloc' standard. Le son est compact et solide." },
    inv_1: { flavor: "La Fluidité.", theory: "<strong>Basse :</strong> La Tierce (3).<br>Plus léger, il donne envie de bouger. La basse n'est pas la racine, ce qui crée un mouvement mélodique.", coach: "Écoute la basse : elle chante une mélodie, elle ne fait pas juste 'boum'." },
    inv_2: { flavor: "L'Instabilité.", theory: "<strong>Basse :</strong> La Quinte (5).<br>Historiquement considéré comme une dissonance (Quarte et Sixte). Il appelle une résolution vers la tonique.", coach: "On a l'impression que l'accord est 'suspendu' en l'air." },
    inv_3: { flavor: "La Tension.", theory: "<strong>Basse :</strong> La 7ème (7).<br>L'état le plus instable. La 7ème à la basse veut impérativement descendre d'un degré.", coach: "La basse est très proche de la tonique (1 ton ou 1/2 ton), ça frotte !" },

    // --- JAZZ CHORDS ---
    maj69: { flavor: "La plénitude solaire.", theory: "<strong>Structure :</strong> Triade Maj + Sixte + Neuvième.<br><strong>Fonction :</strong> Ier degré (Tonique). Remplace le Maj7 pour plus de stabilité (pas de frottement 7M/Fondamentale).", coach: "Son très ouvert, type Bossa Nova." },
    min6: { flavor: "L'espion chic.", theory: "<strong>Structure :</strong> Triade min + Sixte Majeure.<br><strong>Fonction :</strong> Ier degré en mineur (Doriens). Caractéristique de la musique de film.", coach: "La sixte majeure frotte contre la tierce mineure (triton)." },
    dom13: { flavor: "L'éclat Funk.", theory: "<strong>Structure :</strong> Dominante + 9ème + 13ème (Sixte à l'octave).<br><strong>Fonction :</strong> Ve degré enrichi. Très brillant.", coach: "Joué souvent sans la quinte. La 13ème est la note de couleur." },
    alt: { flavor: "Le chaos organisé.", theory: "<strong>Structure :</strong> Dominante + 5te alt (#/b) + 9ème alt (#/b).<br><strong>Fonction :</strong> Résolution maximale vers un accord mineur.", coach: "Toutes les tensions possibles sont présentes." },
    susb9: { flavor: "La tension hispanique.", theory: "<strong>Structure :</strong> Fondamentale + Quarte + Quinte + 7ème + 9ème bémol.<br><strong>Fonction :</strong> Dominante Phrygienne (V7susb9).", coach: "Son caractéristique du Flamenco ou du Jazz Modal 60s." },
    '7sus4': { flavor: "Le flottement spatial.", theory: "<strong>Structure :</strong> Fondamentale + Quarte + Quinte + 7ème min.<br><strong>Fonction :</strong> V7 sans tierce. Ambiguïté modale (Mixolydien).", coach: "L'accord de 'Maiden Voyage'. Pas de résolution immédiate." },
    maj7s11: { flavor: "L'envol onirique.", theory: "<strong>Structure :</strong> Maj7 + 11ème augmentée (#11).<br><strong>Fonction :</strong> IVe degré (Lydien) ou Ier. Son très brillant et éthéré.", coach: "La #11 est un triton au-dessus de la fondamentale." },
    maj9: { flavor: "Le velours épais.", theory: "<strong>Structure :</strong> Maj7 + 9ème majeure.<br><strong>Fonction :</strong> Extension naturelle du Ier degré.", coach: "Ajoute de la richesse sans changer la fonction." },
    min9: { flavor: "La profondeur nocturne.", theory: "<strong>Structure :</strong> min7 + 9ème majeure.<br><strong>Fonction :</strong> Enrichissement standard du min7.", coach: "Très doux, sophistiqué." },

    // --- JAZZ VOICINGS (Techniques) ---
    voc_0: { flavor: "La Densité.", theory: "<strong>Technique :</strong> Toutes les notes sont contenues dans une seule octave.<br>Utile pour le 'Comping' rythmique main gauche.", coach: "Ça sonne un peu 'boueux' dans les graves, à utiliser dans le registre médium." },
    voc_1: { flavor: "L'Ouverture.", theory: "<strong>Technique :</strong> Drop 2.<br>On prend la 2ème note la plus aiguë d'un accord serré et on la baisse d'une octave.", coach: "Le standard des arrangeurs et des guitaristes. Ça laisse respirer l'harmonie." },
    voc_2: { flavor: "L'Essentiel.", theory: "<strong>Technique :</strong> Shell (Coquille).<br>On ne joue que la Fondamentale, la Tierce et la 7ème (parfois la quinte est omise).", coach: "Style Bud Powell. C'est le squelette harmonique pur." },
    voc_3: { flavor: "L'Abstraction.", theory: "<strong>Technique :</strong> Rootless (Sans Fondamentale).<br>La basse est jouée par le contrebassiste. Le piano joue 3-5-7-9.", coach: "Style Bill Evans. Très sophistiqué, ça flotte car on n'entend pas le '1'." },

    // --- LAB STRUCTURES ---
    struct_36: { flavor: "Le Cristal.", theory: "<strong>Concept :</strong> Empilement de Tierces et de Sixtes.<br>Sonorité brillante et géométrique.", coach: "Écoute les intervalles : Petit (3) puis Grand (6), ou l'inverse." },
    struct_45tr: { flavor: "Le Mécanisme.", theory: "<strong>Concept :</strong> Empilement de Quartes, Quintes et Tritons.<br>Sonorité moderne, angulaire, type 20ème siècle.", coach: "Cherche le Triton, c'est l'intervalle 'qui frotte' le plus fort." },
    trichord: { flavor: "La Matière.", theory: "<strong>Concept :</strong> Cluster de 3 notes.<br>Textures denses utilisées par Ligeti ou Penderecki.", coach: "N'essaie pas d'entendre une harmonie fonctionnelle, écoute la 'couleur' du son." },
    sus_sym: { flavor: "L'Espace.", theory: "<strong>Concept :</strong> Accords construits par symétrie.<br>Sus2, Sus4 et empilements quartaux/quintaux.", coach: "Son très ouvert, sans tierce majeure ni mineure." },
    
    // --- LAB CONFIGS ---
    lab_0: { flavor: "Forme A", theory: "Configuration Contractée Basse", coach: "..." },
    lab_1: { flavor: "Forme B", theory: "Configuration Contractée Haute", coach: "..." },
    lab_2: { flavor: "Forme C", theory: "Configuration Dilatée Basse", coach: "..." },
    lab_3: { flavor: "Forme D", theory: "Configuration Dilatée Haute", coach: "..." }
};

export const checkRankColl = (d, type, limit) => {
    const list = (type === 'c') ? DB.sets.academy.chords : DB.invs; 
    const stats = (type === 'c') ? d.stats.c : d.stats.i;
    if(!stats) return false;
    const cleanList = (type==='i') ? list.filter(x => x.id !== 0) : list;
    return cleanList.every(x => (stats[x.id] && stats[x.id].ok >= limit));
};

export const BADGES = [
    // --- CATÉGORIE: GÉNÉRAL (Gameplay & Stats) ---
    { id: 'b_appr', category: 'general', icon: '👶', title: "L'Apprenti", desc: "Jouer 100 accords au total", check: (d) => d.stats.totalPlayed >= 100 },
    { id: 'b_achar', category: 'general', icon: '🏋️', title: "L'Acharné", desc: "Jouer 500 accords au total", check: (d) => d.stats.totalPlayed >= 500 },
    { id: 'b_ency', category: 'general', icon: '📚', title: "L'Encyclopédie", desc: "Valider les 21 combinaisons uniques (Acad.)", check: (d) => d.stats.combos && d.stats.combos.length >= 21 },
    { id: 'b_init', category: 'general', icon: '🥉', title: "L'Initié", desc: "Rang Bronze min. sur les 6 accords académiques", check: (d) => checkRankColl(d, 'c', 20) },
    { id: 'b_conf', category: 'general', icon: '🥈', title: "Le Confirmé", desc: "Rang Argent min. sur les 6 accords académiques", check: (d) => checkRankColl(d, 'c', 50) },
    { id: 'b_virt', category: 'general', icon: '🥇', title: "Le Virtuose", desc: "Rang Or sur les 6 accords académiques", check: (d) => checkRankColl(d, 'c', 100) },
    { id: 'b_bat', category: 'general', icon: '🔨', title: "Le Bâtisseur", desc: "Rang Bronze min. sur les 4 renversements (Acad.)", check: (d) => checkRankColl(d, 'i', 20) },
    { id: 'b_ing', category: 'general', icon: '📐', title: "L'Ingénieur", desc: "Rang Argent min. sur les 4 renversements (Acad.)", check: (d) => checkRankColl(d, 'i', 50) },
    { id: 'b_arch', category: 'general', icon: '🏗️', title: "L'Architecte", desc: "Rang Or sur les 4 renversements (Acad.)", check: (d) => checkRankColl(d, 'i', 100) },
    { id: 'b_reg', category: 'general', icon: '📏', title: "Le Régulier", desc: "Série de 10 sans faute", check: (d, s) => s.streak >= 10 },
    { id: 'b_inv', category: 'general', icon: '🛡️', title: "L'Invincible", desc: "Série de 30 sans faute", check: (d, s) => s.streak >= 30 },
    { id: 'b_snip', category: 'general', icon: '🎯', title: "Le Sniper", desc: "Série de 15 sans faute sans aides", check: (d, s) => s.cleanStreak >= 15 },
    { id: 'b_metro', category: 'general', icon: '⏱️', title: "Métronome", desc: "10 bonnes réponses rapides à la suite", check: (d, s) => s.fastStreak >= 10 },
    { id: 'b_expl', category: 'general', icon: '🧭', title: "L'Explorateur", desc: "Finir une partie dans les 4 modes", check: (d) => d.stats.modesPlayed && d.stats.modesPlayed.length >= 4 },
    { id: 'b_ecl', category: 'general', icon: '⚡', title: "L'Éclair", desc: "3 réponses < 2s d'affilée", check: (d, s) => s.fastStreak >= 3 },
    { id: 'b_bolt', category: 'general', icon: '🏃', title: "Usain Bolt", desc: "Score 2 000 pts (Sprint)", check: (d, s) => s.mode === 'sprint' && s.score >= 2000 },
    { id: 'b_pres', category: 'general', icon: '⏲️', title: "Sous Pression", desc: "Survivre 2 minutes (Chrono)", check: (d, s) => s.mode === 'chrono' && (Date.now() - s.startTime) >= 120000 },
    { id: 'b_phen', category: 'general', icon: '🦅', title: "Le Phénix", desc: "1 vie -> 1 000 pts (Chrono/Sprint)", check: (d, s) => s.lowLifeRecovery && s.score >= 1000 },

    // --- CATÉGORIE: SPÉCIALISATIONS (Modes & Accords Spécifiques) ---
    { id: 'b_blue', category: 'special', icon: '🎷', title: "Blue Note", desc: "Réussir 50 accords Jazz (Club)", check: (d) => { if(!d.stats.v) return false; let tot = 0; for(let k in d.stats.v) tot += d.stats.v[k].ok; return tot >= 50; }},
    { id: 'b_lab', category: 'special', icon: '🧪', title: "Rat de Labo", desc: "Réussir 50 accords Laboratoire", check: (d) => { if(!d.stats.l) return false; let tot = 0; for(let k in d.stats.l) tot += d.stats.l[k].ok; return tot >= 50; }},
    { id: 'b_grand', category: 'special', icon: '🌊', title: "Grand Large", desc: "Série de 15 sans faute en Mode Ouvert (Acad.)", check: (d, s) => s.openStreak >= 15 },
    { id: 'b_pur', category: 'special', icon: '🧐', title: "Le Puriste", desc: "Série de 25 sans faute avec TOUS réglages", check: (d, s) => s.fullConfigStreak >= 25 },
    { id: 'b_duke', category: 'special', icon: '🎩', title: "The Duke", desc: "10 réussites consécutives sur Maj7/min7 (Acad.)", check: (d) => d.stats.str_jazz >= 10 },
    { id: 'b_007', category: 'special', icon: '🕵️', title: "Agent 007", desc: "10 réussites consécutives sur MinMaj7", check: (d) => d.stats.str_007 >= 10 },
    { id: 'b_dem', category: 'special', icon: '💣', title: "Démineur", desc: "10 réussites consécutives sur Dim7", check: (d) => d.stats.str_dim >= 10 },
    { id: 'b_acro', category: 'special', icon: '🤸', title: "L'Acrobate", desc: "10 réussites consécutives sur Renversements", check: (d) => d.stats.str_inv >= 10 },
    { id: 'b_goldear', category: 'special', icon: '👂', title: "Oreille d'Or", desc: "20 sans faute en mode Inverse", check: (d, s) => s.mode === 'inverse' && s.streak >= 20 },
    { id: 'b_comp', category: 'special', icon: '🎼', title: "Le Compositeur", desc: "Série de 10 sans faute (Inverse)", check: (d, s) => s.mode === 'inverse' && s.streak >= 10 },

    // --- CATÉGORIE: HÉRITAGE (Secrets & Maîtrise) ---
    // Note: Les badges de Matière sont générés ci-dessous et ajoutés à ce tableau
    { id: 'b_leg', category: 'lore', icon: '👑', title: "La Légende", desc: "Débloquer tous les badges standards", check: (d) => d.badges.filter(bid => !bid.startsWith('b_mat_')).length >= (BADGES.filter(b => !b.secret).length - 1) }
];

// GÉNÉRATION DES BADGES SECRETS DE MATIÈRE
LORE_MATERIALS.forEach((m, i) => {
    BADGES.push({
        id: `b_mat_${i}`,
        category: 'lore',
        secret: true, // Invisible tant que non débloqué
        icon: '💠',
        title: `L'Éveil du ${m.name}`,
        desc: `Atteindre la Maîtrise de ${m.name} (Niveau ${i*5 + 1})`,
        check: (d) => d.mastery >= (i * 5 + 1)
    });
});

export const PHYSICAL_MAP = {
    'Digit1': 0, 'Digit2': 1, 'Digit3': 2, 'Digit4': 3, 'Digit5': 4, 'Digit6': 5,
    'Numpad1': 0, 'Numpad2': 1, 'Numpad3': 2, 'Numpad4': 3, 'Numpad5': 4, 'Numpad6': 5,
    'KeyQ': 0, 'KeyW': 1, 'KeyE': 2, 'KeyR': 3, 'KeyT': 4, 'KeyY': 5, 'KeyZ': 5
};

// COACH DATABASE
export const COACH_DB = {
    start: ["Prends une grande respiration.", "Ferme les yeux pour mieux entendre.", "Visualise le clavier.", "Écoute la basse en premier.", "Chante la note la plus aiguë."],
    streak: ["Tu es en feu !", "Rien ne t'arrête !", "Quelle concentration !", "Ton oreille s'affine.", "Zone de Flow activée."],
    speed: ["Vif comme l'éclair !", "Réflexes impressionnants.", "Ton cerveau traite le son instantanément.", "Vitesse lumière !", "Tu anticipes l'harmonie."],
    master: ["Une oreille absolue en devenir ?", "Maîtrise totale.", "Tu entends les couleurs.", "L'harmonie n'a plus de secrets.", "Niveau professionnel."],
    theory: ["La 7ème majeure est sensible.", "Le triton divise l'octave en deux.", "La tierce définit la couleur (Majeur/Mineur).", "La quinte stabilise l'accord.", "Les renversements changent la basse, pas la nature."],
    boost: ["L'erreur est la meilleure professeure.", "Respire, et réécoute.", "Ne lâche rien, ça va venir.", "Chaque essai construit ton cerveau.", "La régularité est la clé."],
    weakness: {
        maj7: [{t:"Technique", m:"Essaie d'entendre la 7ème majeure qui frotte juste sous l'octave."}],
        min7: [{t:"Technique", m:"C'est un accord doux, sans le frottement du Maj7 ni la tension du Dom7."}],
        dom7: [{t:"Technique", m:"Repère le Triton. Ça sonne 'bluesy' et instable."}],
        hdim7: [{t:"Technique", m:"C'est sombre et tendu. Comme un film noir."}],
        dim7: [{t:"Technique", m:"Symétrique et effrayant. Le son des méchants de cinéma."}],
        minmaj7: [{t:"Technique", m:"Le son de détective privé. Mineur + Tension aiguë."}]
    }
};
