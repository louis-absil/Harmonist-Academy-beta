import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInAnonymously, signOut, onAuthStateChanged, GoogleAuthProvider, linkWithPopup, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, orderBy, limit, getDocs, where, serverTimestamp, runTransaction } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAMA9hH3hjlkjp-a4lpb3Dg9IusUB-AiMQ",
  authDomain: "harmonist-academy.firebaseapp.com",
  projectId: "harmonist-academy",
  storageBucket: "harmonist-academy.appspot.com",
  messagingSenderId: "1095938878602",
  appId: "1:1095938878602:web:1ea75d46f3f5d76d921173"
};

let app, auth, db, provider, userUid = null;
let isSyncDone = false; // 🔒 VERROU DE SÉCURITÉ (Nouveau)

// Délai avant qu'un pseudo anonyme inactif ne soit "volable" (90 jours)
const ZOMBIE_TIMEOUT = 90 * 24 * 60 * 60 * 1000;

export const Cloud = {
    initialized: false,

    // --- 1. INITIALISATION (Version Hybride Corrigée) ---
    async init(onLoginCallback) {
        if (this.initialized) return;

        try {
            // Initialisation robuste des services
            if (!app) app = initializeApp(firebaseConfig);
            if (!auth) auth = getAuth(app);
            if (!db) db = getFirestore(app);
            if (!provider) provider = new GoogleAuthProvider();

            this.initialized = true;

            onAuthStateChanged(auth, async (user) => {
                isSyncDone = false; // 🔒 On verrouille immédiatement au changement de compte

                if (user) {
                    userUid = user.uid;
                    console.log("🔥 Session :", user.isAnonymous ? "Anonyme" : "Google", userUid);

                    let cloudData = null;

                    // Si compte Google, on récupère les données
                    if (!user.isAnonymous) {
                        try {
                            const docRef = doc(db, "users", userUid);
                            const docSnap = await getDoc(docRef);
                            
                            if (docSnap.exists()) {
                                cloudData = docSnap.data();
                                console.log("📥 Données Cloud reçues");
                            }
                        } catch (e) {
                            console.error("Erreur lecture Cloud:", e);
                        }
                    }

                    // ⚡ C'EST ICI LA CLÉ : On prévient l'App (Mise à jour UI + Synchro)
                    if (onLoginCallback) onLoginCallback(user, cloudData);

                    isSyncDone = true; // 🔓 Données chargées, on autorise la sauvegarde
                    console.log("✅ Synchro terminée, sauvegardes activées.");

                } else {
                    // Fallback Invité
                    console.log("⚪ Création session invité...");
                    signInAnonymously(auth).then(() => {
                        isSyncDone = true; // 🔓 Mode invité prêt (rien à télécharger)
                    }).catch(console.error);
                }
            });

        } catch (e) {
            console.error("Firebase Init Error:", e);
        }
    },

    getCurrentUID() { return userUid; },
    get auth() { return auth; },

    // --- 2. SAUVEGARDE SÉCURISÉE ---
    
    // Alias pour compatibilité avec l'ancien code qui appelle peut-être syncUserStats
    async syncUserStats(appData) { return this.saveUser(appData); },

    async saveUser(appData) {
        // 🛑 ON BLOQUE SI LA SYNCHRO N'EST PAS FINIE
        if (!userUid || !db || !isSyncDone) {
            console.warn("⏳ Sauvegarde bloquée : En attente de synchro Cloud...");
            return;
        }

        const payload = {
            username: appData.username || "Anonyme",
            xp: appData.xp,
            lvl: appData.lvl,
            mastery: appData.mastery,
            badges: appData.badges,
            bestChrono: appData.bestChrono,
            bestSprint: appData.bestSprint,
            bestInverse: appData.bestInverse,
            // On sauvegarde aussi les stats complètes
            stats: appData.stats, 
            settings: appData.settings,
            currentSet: appData.currentSet,
            arenaStats: appData.arenaStats,
            lastSync: new Date().toISOString()
        };

        try {
            await setDoc(doc(db, "users", userUid), payload, { merge: true });
        } catch (e) { console.error("Save Fail:", e); }
    },

    // --- 3. GESTION COMPTE (Login / Link / Heartbeat) ---

    async login() {
        // Sécurité ajoutée : Re-init si auth est perdu
        if (!auth) { 
            console.warn("⚠️ Auth perdu, re-init...");
            app = initializeApp(firebaseConfig); auth = getAuth(app); provider = new GoogleAuthProvider(); 
        }
        try { 
            const result = await signInWithPopup(auth, provider);
            return { success: true, user: result.user }; 
        } catch (e) { 
            console.error("Login Error:", e);
            return { success: false, error: e.message }; 
        }
    },

    async linkAccount() {
        if (!auth.currentUser) return { success: false };
        try { return { success: true, user: (await linkWithPopup(auth.currentUser, provider)).user }; } 
        catch (e) { return { success: false, error: e.message }; }
    },

    async sendHeartbeat(username) {
        if (!userUid || !username) return;
        const docId = username.trim().toLowerCase();
        try {
            await setDoc(doc(db, "usernames", docId), { lastActive: Date.now() }, { merge: true });
        } catch (e) { }
    },

    //  LEGACY
    //     async assignUsername(username) {
    //     if (!userUid || !db) return { success: false, reason: "NO_NET" };
    //     if (!navigator.onLine) return { success: true, status: "OFFLINE" };
    //     const docId = username.trim().toLowerCase();
    //     const userRef = doc(db, "usernames", docId);
    //     try {
    //         const res = await runTransaction(db, async (t) => {
    //             const userSnap = await t.get(userRef);
                
    //             // CAS 1 : Nouveau pseudo (Création)
    //             if (!userSnap.exists()) { 
    //                 t.set(userRef, { 
    //                     originalName: username, 
    //                     uid: userUid, 
    //                     type: auth.currentUser.isAnonymous?'guest':'verified', 
    //                     lastActive: Date.now(),
    //                     updatedAt: serverTimestamp() // <--- INSERTION 1 (Création)
    //                 }); 
    //                 return "NEW"; 
    //             }
                
    //             const d = userSnap.data();
                
    //             // CAS 2 : C'est déjà mon pseudo (Mise à jour)
    //             if (d.uid === userUid) { 
    //                 t.update(userRef, { 
    //                     lastActive: Date.now(), 
    //                     type: auth.currentUser.isAnonymous?'guest':'verified',
    //                     updatedAt: serverTimestamp() // <--- INSERTION 2 (Refresh)
    //                 }); 
    //                 return "OWNED"; 
    //             }
                
    //             if (d.type === 'verified') throw "TAKEN_VERIFIED";
                
    //             // CAS 3 : Vol de compte Zombie (Écrasement)
    //             if (Date.now() - (d.lastActive||0) > ZOMBIE_TIMEOUT) { 
    //                 t.set(userRef, { 
    //                     originalName: username, 
    //                     uid: userUid, 
    //                     type: auth.currentUser.isAnonymous?'guest':'verified', 
    //                     lastActive: Date.now(),
    //                     updatedAt: serverTimestamp() // <--- INSERTION 3 (Zombie)
    //                 }); 
    //                 return "ZOMBIE"; 
    //             }
    //             throw "TAKEN_ACTIVE";
    //         });
    //         return { success: true, status: res };
    //     } catch (e) { return { success: false, reason: e }; }
    // },

    async assignUsername(username) {
        const currentUser = auth.currentUser;
        if (!currentUser || !db) return false;
        
        const uid = currentUser.uid;
        const cleanName = username.trim().toLowerCase();
        if (cleanName.length < 3) return false;

        const userDocRef = doc(db, 'users', uid);
        const newNameRef = doc(db, 'usernames', cleanName);

        try {
            await runTransaction(db, async (transaction) => {
                // A. Vérifier si le NOUVEAU pseudo est pris
                const nameSnap = await transaction.get(newNameRef);
                if (nameSnap.exists() && nameSnap.data().uid !== uid) {
                    throw "Ce pseudo est déjà pris !";
                }

                // B. Récupérer l'ANCIEN pseudo depuis le profil utilisateur
                const userSnap = await transaction.get(userDocRef);
                let oldName = null;
                if (userSnap.exists() && userSnap.data().username) {
                    oldName = userSnap.data().username.toLowerCase();
                }

                // C. Si on change de nom...
                if (oldName && oldName !== cleanName) {
                    const oldNameRef = doc(db, 'usernames', oldName);
                    // --- CORRECTION CRUCIALE ICI ---
                    // 1. On lit le document de l'ancien pseudo
                    const oldNameSnap = await transaction.get(oldNameRef);
                    
                    // 2. On ne tente de le supprimer QUE s'il existe vraiment
                    // (Cela évite le crash des règles de sécurité sur un document fantôme)
                    if (oldNameSnap.exists()) {
                         if (oldNameSnap.data().uid === uid) {
                             transaction.delete(oldNameRef);
                         } else {
                             // Cas rare : Le pseudo dans mon profil appartenait à quelqu'un d'autre ?
                             // On ne fait rien, on le laisse tranquille.
                         }
                    }
                }

                // D. On réserve le nouveau nom
                transaction.set(newNameRef, { uid: uid, updatedAt: serverTimestamp() });

                // E. On met à jour le profil utilisateur
                transaction.set(userDocRef, { 
                    username: username, 
                    updatedAt: serverTimestamp() 
                }, { merge: true });
            });

            console.log("✅ Pseudo sauvegardé :", username);
            return true;

        } catch (e) {
            console.error("❌ Erreur Pseudo :", e);
            window.UI.showToast(typeof e === 'string' ? e : "Erreur lors du changement de pseudo");
            return false;
        }
    },

    // --- NOUVELLE AUTHENTIFICATION (V6.2) ---
    async login(localData) {
        if (!auth) return { success: false, error: "Auth non initialisé" };
        
        try {
            // 1. Popup Google
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            userUid = user.uid;

            // 2. Récupération des données Cloud existantes
            const userRef = doc(db, 'users', userUid);
            const snap = await getDoc(userRef);
            
            let finalData = localData;

            if (snap.exists()) {
                const cloudData = snap.data();
                console.log("☁️ Compte trouvé. Fusion des données...");
                
                // FUSION INTELLIGENTE (Smart Merge)
                // On garde la meilleure valeur pour chaque statistique critique
                finalData = {
                    ...localData, // On part du local
                    ...cloudData, // On écrase avec le Cloud (pour les infos basiques)
                    
                    // FUSION DES SCORING (Le meilleur l'emporte)
                    xp: Math.max(localData.xp || 0, cloudData.xp || 0),
                    lvl: Math.max(localData.lvl || 1, cloudData.lvl || 1),
                    mastery: Math.max(localData.mastery || 0, cloudData.mastery || 0),
                    bestChrono: Math.max(localData.bestChrono || 0, cloudData.bestChrono || 0),
                    bestSprint: Math.max(localData.bestSprint || 0, cloudData.bestSprint || 0),
                    bestInverse: Math.max(localData.bestInverse || 0, cloudData.bestInverse || 0),
                    
                    // CORRECTION PSEUDO : Le Cloud gagne s'il a un nom défini
                    username: cloudData.username || localData.username,

                    // FUSION DES BADGES (Union sans doublons)
                    badges: [...new Set([...(localData.badges || []), ...(cloudData.badges || [])])],
                    
                    // Pour les stats complexes (Accords), on garde celles du profil qui a le plus d'XP
                    stats: (cloudData.xp > localData.xp) ? cloudData.stats : localData.stats
                };
            }

            // 4. On sauvegarde immédiatement le résultat fusionné sur le Cloud
            await setDoc(userRef, finalData, { merge: true });
            
            return { success: true, user: user, data: finalData };

        } catch (error) {
            console.error("Login Error:", error);
            return { success: false, error: error.message };
        }
    },

    async logout() {
        try {
            await signOut(auth);
            userUid = null;
            return { success: true };
        } catch (e) { return { success: false, error: e }; }
    },

    // --- 4. LEADERBOARDS & CHALLENGES (Inchangé de l'ancien code) ---

    async submitScore(mode, score, username, mastery) {
        if (!userUid || !db || score <= 0) return;
        const payload = { uid: userUid, pseudo: username || "Anonyme", score: score, mastery: mastery, timestamp: new Date().toISOString() };
        try {
            const scoreRef = doc(db, `leaderboards/${mode}/scores`, userUid);
            const snap = await getDoc(scoreRef);
            if (snap.exists()) {
                if (score > snap.data().score) await setDoc(scoreRef, payload);
                else if (snap.data().pseudo !== username) await setDoc(scoreRef, { pseudo: username }, { merge: true });
            } else { await setDoc(scoreRef, payload); }
        } catch (e) { console.error("Score Submit Fail:", e); }
    },

    async getLeaderboard(mode, period = 'weekly') {
        if (!db) return [];
        try {
            const ref = collection(db, `leaderboards/${mode}/scores`);
            const q = query(ref, orderBy("score", "desc"), limit(50));
            const snap = await getDocs(q);
            const results = []; const seenUsers = new Set();
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            snap.forEach(d => {
                const data = d.data(); const key = data.uid || data.pseudo;
                if (seenUsers.has(key)) return;
                if(period === 'weekly' && new Date(data.timestamp) < sevenDaysAgo) return;
                results.push(data); seenUsers.add(key);
            });
            return results.slice(0, 20);
        } catch (e) { return []; }
    },

    async createChallenge(data) {
        if (!userUid || !db) return null;
        try {
            const docId = data.seed.toUpperCase();
            const docRef = doc(db, "challenges", docId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) return null;
            await setDoc(docRef, { ...data, seed: docId, creatorUid: userUid, created_at: serverTimestamp() });
            return docId;
        } catch (e) { return null; }
    },

    async getChallenge(id) {
        if (!db) return null;
        try {
            const snap = await getDoc(doc(db, "challenges", id.toUpperCase()));
            return snap.exists() ? { id: snap.id, ...snap.data() } : null;
        } catch (e) { return null; }
    },

    async submitChallengeScore(challengeId, scoreData) {
        if (!userUid || !db) return;
        try {
            const docId = `${challengeId.toUpperCase()}_${userUid}`;
            const scoreRef = doc(db, `challenges/${challengeId.toUpperCase()}/scores`, docId);
            const snap = await getDoc(scoreRef);
            if (snap.exists()) {
                const old = snap.data();
                if (scoreData.note > old.note || (scoreData.note === old.note && scoreData.time < old.time)) {
                    await setDoc(scoreRef, { uid: userUid, ...scoreData, timestamp: serverTimestamp() });
                } else if (old.pseudo !== scoreData.pseudo) {
                    await setDoc(scoreRef, { pseudo: scoreData.pseudo }, { merge: true });
                }
            } else {
                await setDoc(scoreRef, { uid: userUid, ...scoreData, timestamp: serverTimestamp() });
            }
        } catch (e) { console.error("Challenge Submit Fail", e); }
    },

    async getChallengeLeaderboard(challengeId) {
        if (!db) return [];
        try {
            const q = query(collection(db, `challenges/${challengeId.toUpperCase()}/scores`), orderBy("note", "desc"), limit(50));
            const snap = await getDocs(q);
            const results = []; snap.forEach(d => results.push(d.data()));
            return results.sort((a, b) => (b.note !== a.note) ? b.note - a.note : a.time - b.time);
        } catch (e) { return []; }
    },

    getDailyChallengeID() { return `DAILY-${new Date().toISOString().split('T')[0]}`; },
};