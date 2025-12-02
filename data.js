// --- MASTERY & SETS ---
export const MASTERY_NAMES = [
    "🏛️ L'Académie", "🎷 Le Club", "🧪 Le Laboratoire", "🌌 Le Cosmos"
];

// Cycle de 5 niveaux de Maîtrise par matière (Utilisé par UI.js et BADGES)
export const LORE_MATERIALS = [
    { name: "Cristal",    icon: "💠", particle: "de ",  color: "#a5f3fc", shadow: "#22d3ee" }, // Cyan clair
    { name: "Marbre",     icon: "🏛️", particle: "de ",  color: "#e2e8f0", shadow: "#94a3b8" }, // Blanc gris
    { name: "Argent",     icon: "🥈", particle: "de l'", color: "#cbd5e1", shadow: "#64748b" }, // Argent (Médaille)
    { name: "Or",         icon: "⚜️", particle: "de l'", color: "#fbbf24", shadow: "#b45309" }, // Or (Fleur de Lys)
    { name: "Chrome",     icon: "💿", particle: "de ",  color: "#38bdf8", shadow: "#0ea5e9" }, // Bleu électrique
    { name: "Carbone",    icon: "🌑", particle: "de ",  color: "#71717a", shadow: "#27272a" }, // Gris sombre / Lune
    { name: "Titane",     icon: "🛡️", particle: "de ",  color: "#94a3b8", shadow: "#475569" }, // Bleu gris
    { name: "Plasma",     icon: "⚛️", particle: "de ",  color: "#c084fc", shadow: "#9333ea" }, // Violet / Atome
    { name: "Saphir",     icon: "🔹", particle: "de ",  color: "#3b82f6", shadow: "#1d4ed8" }, // Bleu royal
    { name: "Émeraude",   icon: "🟢", particle: "d'",   color: "#34d399", shadow: "#059669" }, // Vert
    { name: "Rubis",      icon: "🔻", particle: "de ",  color: "#f43f5e", shadow: "#be123c" }, // Rouge
    { name: "Diamant",    icon: "💎", particle: "de ",  color: "#818cf8", shadow: "#4f46e5" }, // Indigo
    { name: "Obsidienne", icon: "🌋", particle: "d'",   color: "#1e293b", shadow: "#0f172a" }, // Noir bleu / Volcan
    { name: "Météore",    icon: "☄️", particle: "de ",  color: "#f97316", shadow: "#c2410c" }, // Orange brûlé
    { name: "Quasar",     icon: "🌀", particle: "de ",  color: "#d946ef", shadow: "#a21caf" }, // Magenta
    { name: "Absolu",     icon: "🌟", particle: "de l'",  color: "#fcd34d", shadow: "#ffffff" }  // Or Blanc / Étoile
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
                { 
                    id: 'struct_36', name: 'Structure 3-6', tech: '3/6', sub: 'Struct. A', unlockLvl: 1,
                    configs: [
                        { id: 0, name: 'Contractée Basse', sub: '6m - 3m', iv: [0,3,11] }, // 3m + 6m = 3 + 8 = 11
                        { id: 1, name: 'Contractée Haute', sub: '3m - 6m', iv: [0,8,11] }, // 0-8 is m6, 8-11 is m3
                        { id: 2, name: 'Dilatée Basse', sub: '6M - 3M', iv: [0,4,13] },    // 0-4 is M3, 4-13 is M6 (9st)
                        { id: 3, name: 'Dilatée Haute', sub: '3M - 6M', iv: [0,9,13] }     // 0-9 is M6, 9-13 is M3
                    ]
                },
                { 
                    id: 'struct_45tr', name: 'Structure 4/5-Tr', tech: '4/5-Tr', sub: 'Struct. B', unlockLvl: 5,
                    configs: [
                        { id: 0, name: 'Pos. Basse 4', sub: '4J + Tr', iv: [0,5,11] }, // 0-5 (4J), 5-11 (Tr)
                        { id: 1, name: 'Pos. Haute 4', sub: 'Tr + 4J', iv: [0,6,11] }, // 0-6 (Tr), 6-11 (4J)
                        { id: 2, name: 'Pos. Basse 5', sub: '5J + Tr', iv: [0,7,13] }, // 0-7 (5J), 7-13 (Tr)
                        { id: 3, name: 'Pos. Haute 5', sub: 'Tr + 5J', iv: [0,6,13] }  // 0-6 (Tr), 6-13 (5J)
                    ]
                },
                { 
                    id: 'trichord', name: 'Trichordes', tech: '3-X', sub: 'Texture', unlockLvl: 10,
                    configs: [
                        { id: 0, name: 'Chromatique', sub: '1/2 + 1/2', iv: [0,1,2] },
                        { id: 1, name: 'Viennois', sub: '1/2 + Tr', iv: [0,1,6] },
                        { id: 2, name: 'Par Tons', sub: '1 + 1', iv: [0,2,4] },
                        { id: 3, name: 'Octatonique', sub: '1/2 + 3M', iv: [0,1,4] }
                    ]
                },
                { 
                    id: 'sus_sym', name: 'Suspendus', tech: 'Sus', sub: 'Symétrie', unlockLvl: 15,
                    configs: [
                        { id: 0, name: 'Sus 2', sub: '2M + 4J', iv: [0,2,7] },
                        { id: 1, name: 'Sus 4', sub: '4J + 2M', iv: [0,5,7] },
                        { id: 2, name: 'Quartal', sub: '4J + 4J', iv: [0,5,10] },
                        { id: 3, name: 'Quintal', sub: '5J + 5J', iv: [0,7,14] }
                    ]
                }
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
    ranks: [ 
        {t:"Tourneur de pages enthousiaste",i:"📄"}, 
        {t:"Régisseur distrait",i:"🔦"}, 
        {t:"Déchiffreur du dimanche",i:"👓"}, 
        {t:"Spécialiste des cordes à vide",i:"🎻"}, 
        {t:"Harmoniste en herbe",i:"🌱"}, 
        {t:"Explorateur de Tonalités",i:"🧭"}, 
        {t:"Adepte des mouvements contraires",i:"↔️"}, 
        {t:"Amateur de résolutions heureuses",i:"😌"}, 
        {t:"Expert du Retard",i:"⏳"}, 
        {t:"Premier Prix de Solfège",i:"🥇"}, 
        {t:"Chef de pupitre",i:"🎹"}, 
        {t:"Supersoliste",i:"🌟"}, 
        {t:"Disciple de Rameau",i:"📖"}, 
        {t:"Architecte des Modulations",i:"🏗️"}, 
        {t:"Chef d'orchestre inspiré",i:"🥢"}, 
        {t:"Virtuose de l’oreille relative",i:"👂"}, 
        {t:"Explorateur du chromatisme",i:"🌈"}, 
        {t:"Théoricien Post-Tonal",i:"🌌"}, // GARDÉ
        {t:"Maître des Fonctions harmoniques",i:"🔮"}, 
        {t:"Réincarnation de Bach",i:"👑"} // GARDÉ
    ],
    chords: [],
    currentInvs: []
};

export const CODEX_DATA = {
    // --- ACADEMY CHORDS ---
    maj7: { 
        flavor: "L'élégance intemporelle.", 
        theory: "<strong>Structure :</strong> Fondamentale + Tierce Maj + Quinte Juste + 7ème Maj.<br><strong>Fonction :</strong> Ier ou IVe degré. Inspire la stabilité, le rêve, la romance.", 
        coach: "Intervalles : 2 tons, 1.5 ton, 2 tons. Chante l'arpège de 'Gymnopédie' de Satie.",
        tags: ["#Stable", "#Romantique", "#IerDegré"],
        examples: ["Gymnopédie No.1 (Satie)", "Don't Know Why (Norah Jones)", "Imagine (John Lennon)"]
    },
    min7: { 
        flavor: "La mélancolie douce.", 
        theory: "<strong>Structure :</strong> Fondamentale + Tierce min + Quinte Juste + 7ème min.<br><strong>Fonction :</strong> IIe, IIIe ou VIe degré. Le pilier des cadences II-V-I.", 
        coach: "Intervalles : 1.5 ton, 2 tons, 1.5 ton. C'est stable, pas de triton.",
        tags: ["#Mélancolique", "#Doux", "#Pilier"],
        examples: ["So What (Miles Davis)", "Just the Two of Us (Grover Washington Jr.)", "Moanin' (Art Blakey)"]
    },
    dom7: { 
        flavor: "Le moteur harmonique.", 
        theory: "<strong>Structure :</strong> Fondamentale + Tierce Maj + Quinte Juste + 7ème min.<br><strong>Fonction :</strong> Ve degré (Dominante). Contient un triton (3 tons) qui appelle une résolution.", 
        coach: "La tierce veut monter, la 7ème veut descendre.",
        tags: ["#Tension", "#Blues", "#Résolution"],
        examples: ["Blues classique (I7-IV7-V7)", "I Feel Good (James Brown)", "La Marseillaise (Cadence finale)"]
    },
    hdim7: { 
        flavor: "Le point de bascule.", 
        theory: "<strong>Structure :</strong> Fondamentale + Tierce min + Quinte bémol + 7ème min.<br><strong>Fonction :</strong> IIe degré en mineur. Prépare la tension de la dominante.", 
        coach: "Appelé aussi 'Demi-Diminué'. Très utilisé en Jazz mineur.",
        tags: ["#Sombre", "#Jazz", "#II-V-I Mineur"],
        examples: ["Stella by Starlight (Début)", "Alone Together", "I Will Survive (Refrain)"]
    },
    dim7: { 
        flavor: "La symétrie anxieuse.", 
        theory: "<strong>Structure :</strong> Empilement strict de tierces mineures.<br><strong>Fonction :</strong> Accord de passage ou Dominante sans fondamentale. Symétrique : chaque note peut être la fondamentale.", 
        coach: "Son de film d'horreur classique.",
        tags: ["#Horreur", "#Symétrie", "#Passage"],
        examples: ["Toccata & Fugue (Bach)", "Musique de film muet (Méchants)", "Scènes de suspense"]
    },
    minmaj7: { 
        flavor: "Le détective dans la brume.", 
        theory: "<strong>Structure :</strong> Parfait mineur + 7ème Maj.<br><strong>Fonction :</strong> Ier degré en mineur harmonique. Forte dissonance interne (7M vs 3m).", 
        coach: "Le 'Jeu' de l'accord : triste en bas, perçant en haut.",
        tags: ["#Mystère", "#Hitchcock", "#Dissonance"],
        examples: ["James Bond Theme", "Harlem Nocturne", "Solar (Miles Davis)"]
    },

    // --- ACADEMY INVERSIONS (Techniques) ---
    inv_0: { flavor: "L'Ancrage.", theory: "<strong>Basse :</strong> La Tonique (1).<br>L'état le plus stable et le plus lourd. Toutes les notes reposent sur leur fondation naturelle.", coach: "C'est l'accord 'bloc' standard. Le son est compact et solide.", tags: ["#Base", "#Solide"], examples: [] },
    inv_1: { flavor: "La Fluidité.", theory: "<strong>Basse :</strong> La Tierce (3).<br>Plus léger, il donne envie de bouger. La basse n'est pas la racine, ce qui crée un mouvement mélodique.", coach: "Écoute la basse : elle chante une mélodie, elle ne fait pas juste 'boum'.", tags: ["#Mélodie", "#Léger"], examples: [] },
    inv_2: { flavor: "L'Instabilité.", theory: "<strong>Basse :</strong> La Quinte (5).<br>Historiquement considéré comme une dissonance (Quarte et Sixte). Il appelle une résolution vers la tonique.", coach: "On a l'impression que l'accord est 'suspendu' en l'air.", tags: ["#Suspension", "#Attente"], examples: [] },
    inv_3: { flavor: "La Tension.", theory: "<strong>Basse :</strong> La 7ème (7).<br>L'état le plus instable. La 7ème à la basse veut impérativement descendre d'un degré.", coach: "La basse est très proche de la tonique (1 ton ou 1/2 ton), ça frotte !", tags: ["#Frottement", "#Passage"], examples: [] },

    // --- JAZZ CHORDS ---
    maj69: { flavor: "La plénitude solaire.", theory: "<strong>Structure :</strong> Triade Maj + Sixte + Neuvième.<br><strong>Fonction :</strong> Ier degré (Tonique). Remplace le Maj7 pour plus de stabilité (pas de frottement 7M/Fondamentale).", coach: "Son très ouvert, type Bossa Nova.", tags: ["#Bossa", "#Solaire", "#Stable"], examples: ["Garota de Ipanema", "Plein Soleil (Impressionnisme)"] },
    min6: { flavor: "L'espion chic.", theory: "<strong>Structure :</strong> Triade min + Sixte Majeure.<br><strong>Fonction :</strong> Ier degré en mineur (Doriens). Caractéristique de la musique de film.", coach: "La sixte majeure frotte contre la tierce mineure (triton).", tags: ["#Espion", "#Dorian", "#Chic"], examples: ["Pink Panther Theme", "Summertime"] },
    dom13: { flavor: "L'éclat Funk.", theory: "<strong>Structure :</strong> Dominante + 9ème + 13ème (Sixte à l'octave).<br><strong>Fonction :</strong> Ve degré enrichi. Très brillant.", coach: "Joué souvent sans la quinte. La 13ème est la note de couleur.", tags: ["#Funk", "#Brillant", "#GrosSon"], examples: ["James Brown (Accords de pêche)", "Jazz Big Band"] },
    alt: { flavor: "Le chaos organisé.", theory: "<strong>Structure :</strong> Dominante + 5te alt (#/b) + 9ème alt (#/b).<br><strong>Fonction :</strong> Résolution maximale vers un accord mineur.", coach: "Toutes les tensions possibles sont présentes.", tags: ["#TensionMax", "#Moderne", "#Complexe"], examples: ["Jazz Moderne", "Fusion"] },
    susb9: { flavor: "La tension hispanique.", theory: "<strong>Structure :</strong> Fondamentale + Quarte + Quinte + 7ème + 9ème bémol.<br><strong>Fonction :</strong> Dominante Phrygienne (V7susb9).", coach: "Son caractéristique du Flamenco ou du Jazz Modal 60s.", tags: ["#Flamenco", "#Modal", "#Phrygien"], examples: ["Spain (Chick Corea)", "Nardis"] },
    '7sus4': { flavor: "Le flottement spatial.", theory: "<strong>Structure :</strong> Fondamentale + Quarte + Quinte + 7ème min.<br><strong>Fonction :</strong> V7 sans tierce. Ambiguïté modale (Mixolydien).", coach: "L'accord de 'Maiden Voyage'. Pas de résolution immédiate.", tags: ["#Spatial", "#Modal", "#Flottant"], examples: ["Maiden Voyage (Herbie Hancock)", "Pop 80s"] },
    maj7s11: { flavor: "L'envol onirique.", theory: "<strong>Structure :</strong> Maj7 + 11ème augmentée (#11).<br><strong>Fonction :</strong> IVe degré (Lydien) ou Ier. Son très brillant et éthéré.", coach: "La #11 est un triton au-dessus de la fondamentale.", tags: ["#Lydien", "#Magique", "#Cinéma"], examples: ["E.T. Theme (Flying)", "Simpsons Theme (Début)"] },
    maj9: { flavor: "Le velours épais.", theory: "<strong>Structure :</strong> Maj7 + 9ème majeure.<br><strong>Fonction :</strong> Extension naturelle du Ier degré.", coach: "Ajoute de la richesse sans changer la fonction.", tags: ["#Lush", "#Sophistiqué"], examples: ["Ballades Jazz", "R&B"] },
    min9: { flavor: "La profondeur nocturne.", theory: "<strong>Structure :</strong> min7 + 9ème majeure.<br><strong>Fonction :</strong> Enrichissement standard du min7.", coach: "Très doux, sophistiqué.", tags: ["#Profond", "#Smooth", "#Nuit"], examples: ["Blue in Green", "Sade"] },

    // --- JAZZ VOICINGS (Techniques) ---
    voc_0: { flavor: "La Densité.", theory: "<strong>Technique :</strong> Toutes les notes sont contenues dans une seule octave.<br>Utile pour le 'Comping' rythmique main gauche.", coach: "Ça sonne un peu 'boueux' dans les graves, à utiliser dans le registre médium.", tags: ["#Comping", "#Serré"], examples: [] },
    voc_1: { flavor: "L'Ouverture.", theory: "<strong>Technique :</strong> Drop 2.<br>On prend la 2ème note la plus aiguë d'un accord serré et on la baisse d'une octave.", coach: "Le standard des arrangeurs et des guitaristes. Ça laisse respirer l'harmonie.", tags: ["#Guitare", "#Arrangement", "#Clarté"], examples: ["Wes Montgomery", "Bill Evans"] },
    voc_2: { flavor: "L'Essentiel.", theory: "<strong>Technique :</strong> Shell (Coquille).<br>On ne joue que la Fondamentale, la Tierce et la 7ème (parfois la quinte est omise).", coach: "Style Bud Powell. C'est le squelette harmonique pur.", tags: ["#Bebop", "#Squelette"], examples: ["Bud Powell", "Thelonious Monk"] },
    voc_3: { flavor: "L'Abstraction.", theory: "<strong>Technique :</strong> Rootless (Sans Fondamentale).<br>La basse est jouée par le contrebassiste. Le piano joue 3-5-7-9.", coach: "Style Bill Evans. Très sophistiqué, ça flotte car on n'entend pas le '1'.", tags: ["#Moderne", "#Trio", "#Flottant"], examples: ["Bill Evans Trio", "Herbie Hancock"] },

    // --- LAB STRUCTURES ---
    struct_36: { 
        flavor: "La Géométrie Cristalline.", 
        theory: "<strong>Physique Acoustique :</strong> Alternance stricte de consonances imparfaites (Tierces et Sixtes).<br>Absence totale de quintes justes et de quartes. Crée une texture homogène sans 'centre' fort.", 
        coach: "Écoute les intervalles : Petit (3) puis Grand (6), ou l'inverse.",
        tags: ["#Consonance", "#Homogène", "#SansQuinte"],
        examples: ["Musique minimaliste", "Études de intervalles"]
    },
    struct_45tr: { 
        flavor: "Le Mécanisme Angulaire.", 
        theory: "<strong>Physique Acoustique :</strong> Empilement d'intervalles 'durs' (Quartes, Quintes) et du Triton (3 tons).<br>Génère une forte tension structurelle sans fonction tonale classique.", 
        coach: "Cherche le Triton, c'est l'intervalle 'qui frotte' le plus fort.",
        tags: ["#Dissonance", "#Moderne", "#Mécanique"],
        examples: ["Bartók (Mikrokosmos)", "Stravinsky"]
    },
    trichord: { 
        flavor: "La Densité de la Matière.", 
        theory: "<strong>Physique Acoustique :</strong> Clusters (Agrégats) de 3 notes confinées dans un espace réduit.<br>L'ambitus total ne dépasse pas la Tierce Majeure. Crée des battements rapides.", 
        coach: "N'essaie pas d'entendre une harmonie fonctionnelle, écoute la 'couleur' du son.",
        tags: ["#Cluster", "#Battements", "#Texture"],
        examples: ["Ligeti (Atmosphères)", "Penderecki"]
    },
    sus_sym: { 
        flavor: "L'Espace Infini.", 
        theory: "<strong>Physique Acoustique :</strong> Accords construits par symétrie intervallique (2nde+2nde ou 4te+4te).<br>L'absence de tierce rend le mode (Majeur/Mineur) indéterminé.", 
        coach: "Son très ouvert, sans tierce majeure ni mineure.",
        tags: ["#Ouvert", "#Symétrique", "#Ambigu"],
        examples: ["Debussy (Gammes par tons)", "McCoy Tyner (Quartal)"]
    }
};

export const checkRankColl = (d, type, limit) => {
    const list = (type === 'c') ? DB.sets.academy.chords : DB.invs; 
    const stats = (type === 'c') ? d.stats.c : d.stats.i;
    if(!stats) return false;
    const cleanList = (type==='i') ? list.filter(x => x.id !== 0) : list;
    return cleanList.every(x => (stats[x.id] && stats[x.id].ok >= limit));
};

export const BADGES = [
    // --- SUPER-CATÉGORIE: CARRIÈRE (Gameplay, Modes, Sets) ---
    // setID: 'core' (Général), 'academy', 'jazz', 'laboratory'
    
    // CORE (Général)
    { id: 'b_appr', category: 'career', setID: 'core', icon: '👶', title: "L'Apprenti", desc: "Jouer 100 accords au total", check: (d) => d.stats.totalPlayed >= 100 },
    { id: 'b_achar', category: 'career', setID: 'core', icon: '🏋️', title: "L'Acharné", desc: "Jouer 500 accords au total", check: (d) => d.stats.totalPlayed >= 500 },
    { id: 'b_reg', category: 'career', setID: 'core', icon: '📏', title: "Le Régulier", desc: "Série de 10 sans faute", check: (d, s) => s.streak >= 10 },
    { id: 'b_inv', category: 'career', setID: 'core', icon: '🛡️', title: "L'Invincible", desc: "Série de 30 sans faute", check: (d, s) => s.streak >= 30 },
    { id: 'b_snip', category: 'career', setID: 'core', icon: '🎯', title: "Le Sniper", desc: "Série de 15 sans faute sans aides", check: (d, s) => s.cleanStreak >= 15 },
    { id: 'b_metro', category: 'career', setID: 'core', icon: '⏱️', title: "Métronome", desc: "10 bonnes réponses rapides à la suite", check: (d, s) => s.fastStreak >= 10 },
    { id: 'b_expl', category: 'career', setID: 'core', icon: '🧭', title: "L'Explorateur", desc: "Finir une partie dans les 4 modes", check: (d) => d.stats.modesPlayed && d.stats.modesPlayed.length >= 4 },
    { id: 'b_ecl', category: 'career', setID: 'core', icon: '⚡', title: "L'Éclair", desc: "3 réponses < 2s d'affilée", check: (d, s) => s.fastStreak >= 3 },
    { id: 'b_bolt', category: 'career', setID: 'core', icon: '🏃', title: "Usain Bolt", desc: "Score 2 000 pts (Sprint)", check: (d, s) => s.mode === 'sprint' && s.score >= 2000 },
    { id: 'b_pres', category: 'career', setID: 'core', icon: '⏲️', title: "Sous Pression", desc: "Survivre 2 minutes (Chrono)", check: (d, s) => s.mode === 'chrono' && (Date.now() - s.startTime) >= 120000 },
    { id: 'b_phen', category: 'career', setID: 'core', icon: '🐦‍🔥', title: "Le Phénix", desc: "1 vie -> 1 000 pts (Chrono/Sprint)", check: (d, s) => s.lowLifeRecovery && s.score >= 1000 },
    { id: 'b_goldear', category: 'career', setID: 'core', icon: '👂', title: "Oreille d'Or", desc: "20 sans faute en mode Inverse", check: (d, s) => s.mode === 'inverse' && s.streak >= 20 },
    { id: 'b_comp', category: 'career', setID: 'core', icon: '🎼', title: "Le Compositeur", desc: "Série de 10 sans faute (Inverse)", check: (d, s) => s.mode === 'inverse' && s.streak >= 10 },
    { id: 'b_pur', category: 'career', setID: 'core', icon: '🧐', title: "Le Puriste", desc: "Série de 25 sans faute avec TOUS réglages", check: (d, s) => s.fullConfigStreak >= 25 },
    
    // ACADEMY SPECIFIC (Moved to Core for simplicity or explicit setID)
    { id: 'b_ency', category: 'career', setID: 'academy', icon: '📚', title: "L'Encyclopédie", desc: "Valider les 21 combinaisons uniques (Acad.)", check: (d) => d.stats.combos && d.stats.combos.length >= 21 },
    { id: 'b_init', category: 'career', setID: 'academy', icon: '🥉', title: "L'Initié", desc: "Rang Bronze min. sur les 6 accords académiques", check: (d) => checkRankColl(d, 'c', 20) },
    { id: 'b_conf', category: 'career', setID: 'academy', icon: '🥈', title: "Le Confirmé", desc: "Rang Argent min. sur les 6 accords académiques", check: (d) => checkRankColl(d, 'c', 50) },
    { id: 'b_virt', category: 'career', setID: 'academy', icon: '🥇', title: "Le Virtuose", desc: "Rang Or sur les 6 accords académiques", check: (d) => checkRankColl(d, 'c', 100) },
    { id: 'b_bat', category: 'career', setID: 'academy', icon: '🔨', title: "Le Bâtisseur", desc: "Rang Bronze min. sur les 4 renversements (Acad.)", check: (d) => checkRankColl(d, 'i', 20) },
    { id: 'b_ing', category: 'career', setID: 'academy', icon: '📐', title: "L'Ingénieur", desc: "Rang Argent min. sur les 4 renversements (Acad.)", check: (d) => checkRankColl(d, 'i', 50) },
    { id: 'b_arch', category: 'career', setID: 'academy', icon: '🏗️', title: "L'Architecte", desc: "Rang Or sur les 4 renversements (Acad.)", check: (d) => checkRankColl(d, 'i', 100) },
    { id: 'b_duke', category: 'career', setID: 'academy', icon: '🎩', title: "The Duke", desc: "10 réussites consécutives sur Maj7/min7 (Acad.)", check: (d) => d.stats.str_jazz >= 10 },
    { id: 'b_007', category: 'career', setID: 'academy', icon: '🕵️', title: "Agent 007", desc: "10 réussites consécutives sur MinMaj7", check: (d) => d.stats.str_007 >= 10 },
    { id: 'b_dem', category: 'career', setID: 'academy', icon: '💣', title: "Démineur", desc: "10 réussites consécutives sur Dim7", check: (d) => d.stats.str_dim >= 10 },
    { id: 'b_acro', category: 'career', setID: 'academy', icon: '🤸', title: "L'Acrobate", desc: "10 réussites consécutives sur Renversements", check: (d) => d.stats.str_inv >= 10 },
    { id: 'b_grand', category: 'career', setID: 'academy', icon: '🌊', title: "Grand Large", desc: "Série de 15 sans faute en Mode Ouvert (Acad.)", check: (d, s) => s.openStreak >= 15 },

    // JAZZ SPECIFIC
    { id: 'b_blue', category: 'career', setID: 'jazz', icon: '🎷', title: "Blue Note", desc: "Réussir 50 accords Jazz (Club)", check: (d) => { if(!d.stats.v) return false; let tot = 0; for(let k in d.stats.v) tot += d.stats.v[k].ok; return tot >= 50; }},
    { id: 'b_velvet', category: 'career', setID: 'jazz', icon: '🧤', title: "Doigts de Velours", desc: "Série de 10 sur Voicing Rootless", check: (d, s) => s.rootlessStreak >= 10 },
    { id: 'b_alt', category: 'career', setID: 'jazz', icon: '💥', title: "Altered Beast", desc: "20 réussites sur l'accord Altéré", check: (d) => (d.stats.c['alt']?.ok || 0) >= 20 },
    { id: 'b_bebop', category: 'career', setID: 'jazz', icon: '🎺', title: "Bebop Flow", desc: "5 réponses rapides en mode Jazz", check: (d, s) => s.fastStreak >= 5 && d.currentSet === 'jazz' },

    // LAB SPECIFIC
    { id: 'b_lab', category: 'career', setID: 'laboratory', icon: '🧪', title: "Rat de Labo", desc: "Réussir 50 accords Laboratoire", check: (d) => { if(!d.stats.l) return false; let tot = 0; for(let k in d.stats.l) tot += d.stats.l[k].ok; return tot >= 50; }},
    { id: 'b_geo', category: 'career', setID: 'laboratory', icon: '📐', title: "L'Œil du Géomètre", desc: "Série de 15 sur les Structures (36/45tr)", check: (d, s) => s.geoStreak >= 15 },
    { id: 'b_cryst', category: 'career', setID: 'laboratory', icon: '💠', title: "Cristallographe", desc: "Série de 10 sur Structure 3-6", check: (d, s) => s.str36Streak >= 10 },
    { id: 'b_tri', category: 'career', setID: 'laboratory', icon: '😈', title: "Détecteur de Tritons", desc: "Tirer le Diabolus in Musica par la queue", check: (d, s) => s.str45Streak >= 10 },
    { id: 'b_arch_abs', category: 'career', setID: 'laboratory', icon: '🏗️', title: "L'Architecte Abstrait", desc: "50 réussites sur Struct 3-6 ET 45tr", check: (d) => (d.stats.c['struct_36']?.ok || 0) >= 50 && (d.stats.c['struct_45tr']?.ok || 0) >= 50 },
    { id: 'b_quant', category: 'career', setID: 'laboratory', icon: '⚛️', title: "Oreille Quantique", desc: "Série de 10 sur Trichordes", check: (d, s) => s.triStreak >= 10 },
    { id: 'b_sym', category: 'career', setID: 'laboratory', icon: '🦋', title: "Symétrie Parfaite", desc: "30 réussites sur Suspendus", check: (d) => (d.stats.c['sus_sym']?.ok || 0) >= 30 },

    // --- SUPER-CATÉGORIE: HÉRITAGE (Lore & Progression) ---
    // setID: 'lore'
    { id: 'b_leg', category: 'lore', setID: 'lore', icon: '👑', title: "La Légende", desc: "Débloquer tous les badges standards", check: (d) => d.badges.filter(bid => !bid.startsWith('b_mat_')).length >= (BADGES.filter(b => !b.secret).length - 1) },

    // EASTER EGGS (SECRETS)
    { id: 'b_audio', category: 'lore', setID: 'lore', secret: true, icon: '🤔', title: "L'Audiophile", desc: "La patience est une vertu", check: (d, s) => s.replayCount > 5 },
    { id: 'b_auto', category: 'lore', setID: 'lore', secret: true, icon: '🤖', title: "L'Automate", desc: "Votre régularité n'est plus humaine (Série 50)", check: (d, s) => s.streak >= 50 },
    { id: 'b_dj', category: 'lore', setID: 'lore', secret: true, icon: '🎧', title: "Le DJ", desc: "Remix en cours... (Spam Rejouer)", check: (d, s) => s.djClickTimes.length >= 5 },
    { id: 'b_ind', category: 'lore', setID: 'lore', secret: true, icon: '🤷', title: "L'Indécis", desc: "Il n'y a que les imbéciles qui ne changent pas d'avis", check: (d, s) => {
        const h = s.selectionHistory;
        if(h.length < 3) return false;
        // Check pattern A -> B -> A
        const last = h[h.length-1];
        const prev = h[h.length-2];
        const ante = h[h.length-3];
        return last === ante && last !== prev;
    }},
    { id: 'b_deja', category: 'lore', setID: 'lore', secret: true, icon: '🐈', title: "Déjà-Vu", desc: "Une faille dans la matrice ?", check: (d, s) => s.dejaVu === true },
    { id: 'b_surv', category: 'lore', setID: 'lore', secret: true, icon: '🚑', title: "Le Survivant", desc: "Ce qui ne vous tue pas vous donne de l'XP", check: (d, s) => (s.mode === 'chrono' || s.mode === 'sprint') && s.lives === 1 && s.score >= 500 },
    { id: 'b_mono', category: 'lore', setID: 'lore', secret: true, icon: '🥋', title: "Monomaniaque", desc: "Plus un esprit se limite, plus il touche à l'infini", check: (d, s) => s.monoStreak >= 20 }
];

// GÉNÉRATION DES BADGES SECRETS DE MATIÈRE
LORE_MATERIALS.forEach((m, i) => {
    BADGES.push({
        id: `b_mat_${i}`,
        category: 'lore',
        setID: 'lore',
        secret: true, // Invisible tant que non débloqué
        icon: m.icon || '💠',
        title: `L'Éveil ${m.particle}${m.name}`, // GRAMMAIRE AUTO
        desc: `Atteindre la Maîtrise ${m.particle}${m.name} (Niveau ${i*5 + 1})`, // GRAMMAIRE AUTO
        check: (d) => d.mastery >= (i * 5 + 1)
    });
});

export const PHYSICAL_MAP = {
    'Digit1': 0, 'Digit2': 1, 'Digit3': 2, 'Digit4': 3, 'Digit5': 4, 'Digit6': 5,
    'Numpad1': 0, 'Numpad2': 1, 'Numpad3': 2, 'Numpad4': 3, 'Numpad5': 4, 'Numpad6': 5,
    'KeyQ': 0, 'KeyW': 1, 'KeyE': 2, 'KeyR': 3, 'KeyT': 4, 'KeyY': 5, 'KeyZ': 5
};

// COACH DATABASE V2 (Pedagogy & Psychology)
export const COACH_DB = {
    start: [
        "Bienvenue. Prends une grande respiration avant de commencer.",
        "Ferme les yeux. Ton oreille voit mieux quand tes yeux sont clos.",
        "Ne cherche pas à deviner. Écoute la résonance jusqu'au bout.",
        "Chante la note la plus aiguë dans ta tête, cela t'aidera à t'orienter.",
        "L'objectif n'est pas la vitesse, mais la précision de ta sensation."
    ],
    // High accuracy, high streak
    streak: [
        "Ton cerveau anticipe la couleur avant même la fin de l'accord.",
        "Tu es en état de flux (Flow). Ne force rien, laisse venir.",
        "Tes connexions neuronales se renforcent à chaque bonne réponse.",
        "Tu ne réfléchis plus, tu entends. C'est ça, l'intériorisation.",
        "Excellent. Garde cette détente, c'est là que réside la justesse."
    ],
    // Fast but inaccurate
    speed_warn: [
        "Ralentis. Laisse le son résonner avant de cliquer.",
        "La vitesse sans précision ne construit pas d'oreille solide.",
        "Prends le temps de chanter intérieurement l'accord.",
        "Tu confonds vitesse et précipitation. Respire.",
        "Laisse l'accord se déposer en toi."
    ],
    // High level advice
    master: [
        "Essaie maintenant d'entendre chaque note individuellement.",
        "Peux-tu identifier la quinte de cet accord ?",
        "Concentre-toi sur la 'texture' du son plutôt que sur les notes.",
        "L'harmonie n'a plus de secrets pour toi.",
        "Tu entends les couleurs avec une clarté impressionnante."
    ],
    // General Theory
    theory: [
        "La 7ème majeure crée une tension qui veut monter vers l'octave.",
        "Le triton (3 tons) divise l'octave en deux parties égales.",
        "La tierce est l'âme de l'accord : elle le rend Majeur ou Mineur.",
        "La quinte est le pilier : elle stabilise l'ensemble.",
        "Les renversements changent la basse, mais la couleur globale reste la même."
    ],
    // Encouragement (Diesel / Struggle)
    effort: [
        "L'harmonie s'apprend par la répétition. Ton cerveau construit des ponts.",
        "L'erreur est une information précieuse. Compare ce que tu as entendu avec la correction.",
        "Ne lâche rien. La neuroplasticité demande du temps et de l'effort.",
        "C'est dans la difficulté que l'oreille progresse le plus.",
        "La régularité bat le talent. Continue."
    ],
    // Critical / Fatigue
    critical: [
        "Attention à la saturation de l'oreille. Une pause n'est pas du temps perdu !",
        "Ton attention baisse. Fais quelques pas, bois de l'eau.",
        "L'oreille fatigue vite. Reviens dans 10 minutes, tu seras plus performant.",
        "Ne force pas si tu ne sens plus les couleurs. Repose-toi.",
        "La qualité de l'écoute dépend de la fraîcheur mentale."
    ],
    // Breakthrough (Low stats -> High streak)
    breakthrough: [
        "Tu as trouvé le truc ! Garde cette sensation précise.",
        "C'est le déclic. Tu entends enfin la différence.",
        "Bravo, tu viens de franchir un palier de compréhension.",
        "C'est ça ! Tu as connecté le son au concept."
    ],
    // Doubter (High acc, slow time, many replays)
    patience: [
        "Le premier ressenti est souvent le bon. Fais-toi confiance.",
        "Tu entends juste, n'hésite pas autant.",
        "Ton instinct est bon. Arrête d'intellectualiser le son.",
        "La patience est une vertu, mais la confiance est une force."
    ],
    weakness: {
        maj7: [
            {t:"Sensation", m:"Le Maj7 est nostalgique. Cherche la 7ème qui frotte juste sous l'octave."},
            {t:"Technique", m:"Intervalles : 2 tons, 1.5 ton, 2 tons. Chante l'arpège de 'Gymnopédie'."},
            {t:"Astuce", m:"Si tu n'entends pas la couleur, essaie de visualiser le clavier en secours."}
        ],
        min7: [
            {t:"Sensation", m:"C'est un accord doux et stable, sans le frottement du Maj7 ni la tension du Dom7."},
            {t:"Technique", m:"Souvent le IIe degré. Il est neutre et contemplatif."},
            {t:"Astuce", m:"Il sonne 'jazz' mais sans agressivité."}
        ],
        dom7: [
            {t:"Sensation", m:"Il contient un Triton. C'est ce frottement qui demande à être résolu."},
            {t:"Technique", m:"La tierce veut monter, la 7ème veut descendre. C'est un moteur."},
            {t:"Astuce", m:"Repère le côté 'Blues' et instable."}
        ],
        hdim7: [
            {t:"Sensation", m:"C'est sombre et tendu. Comme un film noir."},
            {t:"Technique", m:"Appelé aussi Demi-Diminué. Le pivot du mode mineur."},
            {t:"Astuce", m:"Plus sombre que le mineur 7, mais moins dramatique que le diminué complet."}
        ],
        dim7: [
            {t:"Sensation", m:"Symétrique et angoissant. Le son des méchants de cinéma."},
            {t:"Technique", m:"Empilement de tierces mineures. Aucune note ne domine."},
            {t:"Astuce", m:"Une tension extrême sans direction précise."}
        ],
        minmaj7: [
            {t:"Sensation", m:"Le son de détective privé. Une base triste avec une pointe acide."},
            {t:"Technique", m:"Mineur avec une 7ème Majeure. Forte dissonance interne."},
            {t:"Astuce", m:"Repère le frottement dur entre la 7ème et la tonique."}
        ]
    }
};
