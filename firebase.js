import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged, GoogleAuthProvider, linkWithPopup, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
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

    async assignUsername(username) {
        if (!userUid || !db) return { success: false, reason: "NO_NET" };
        if (!navigator.onLine) return { success: true, status: "OFFLINE" };
        const docId = username.trim().toLowerCase();
        const userRef = doc(db, "usernames", docId);
        try {
            const res = await runTransaction(db, async (t) => {
                const userSnap = await t.get(userRef);
                if (!userSnap.exists()) { t.set(userRef, { originalName: username, uid: userUid, type: auth.currentUser.isAnonymous?'guest':'verified', lastActive: Date.now() }); return "NEW"; }
                const d = userSnap.data();
                if (d.uid === userUid) { t.update(userRef, { lastActive: Date.now(), type: auth.currentUser.isAnonymous?'guest':'verified' }); return "OWNED"; }
                if (d.type === 'verified') throw "TAKEN_VERIFIED";
                if (Date.now() - (d.lastActive||0) > ZOMBIE_TIMEOUT) { t.set(userRef, { originalName: username, uid: userUid, type: auth.currentUser.isAnonymous?'guest':'verified', lastActive: Date.now() }); return "ZOMBIE"; }
                throw "TAKEN_ACTIVE";
            });
            return { success: true, status: res };
        } catch (e) { return { success: false, reason: e }; }
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