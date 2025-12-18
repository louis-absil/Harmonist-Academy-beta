
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
// Délai avant qu'un pseudo anonyme inactif ne soit "volable" (90 jours)
const ZOMBIE_TIMEOUT = 90 * 24 * 60 * 60 * 1000;

export const Cloud = {
    initialized: false,

    init() {
        if (this.initialized) return;
        try {
            app = initializeApp(firebaseConfig);
            auth = getAuth(app);
            provider = new GoogleAuthProvider(); // <--- LIGNE À AJOUTER
            db = getFirestore(app);

            onAuthStateChanged(auth, (user) => {
                if (user) {
                    userUid = user.uid;
                    console.log("🟢 Cloud Connecté:", userUid);
                } else {
                    signInAnonymously(auth).catch((e) => console.error("Auth Fail:", e));
                }
            });
            this.initialized = true;
        } catch (e) {
            console.error("Firebase Init Error (Check Config):", e);
        }
    },

    getCurrentUID() {
        return userUid;
    },

    async syncUserStats(appData) {
        if (!userUid || !db) return;
        const payload = {
            username: appData.username || "Anonyme",
            xp: appData.xp,
            lvl: appData.lvl,
            mastery: appData.mastery,
            badges: appData.badges,
            bestChrono: appData.bestChrono,
            bestSprint: appData.bestSprint,
            bestInverse: appData.bestInverse,
            lastSync: new Date().toISOString()
        };
        try {
            await setDoc(doc(db, "users", userUid), payload, { merge: true });
        } catch (e) { console.error("Sync Fail:", e); }
    },

    async submitScore(mode, score, username, mastery) {
        if (!userUid || !db || score <= 0) return;
        
        const payload = {
            uid: userUid,
            pseudo: username || "Anonyme",
            score: score,
            mastery: mastery,
            timestamp: new Date().toISOString()
        };

        try {
            // FIX: Utilisation de l'UID comme ID de document pour éviter les doublons
            const scoreRef = doc(db, `leaderboards/${mode}/scores`, userUid);
            const snap = await getDoc(scoreRef);

            if (snap.exists()) {
                const oldData = snap.data();
                // Si nouveau record, on écrase tout (Score + Pseudo + Mastery)
                if (score > oldData.score) {
                    await setDoc(scoreRef, payload);
                    console.log(`Nouveau Record ${mode}: ${score}`);
                } 
                // Sinon, si le pseudo a changé, on met à jour juste le pseudo (sans toucher au score)
                else if (oldData.pseudo !== payload.pseudo) {
                    await setDoc(scoreRef, { pseudo: payload.pseudo }, { merge: true });
                    console.log(`Pseudo mis à jour dans ${mode}`);
                }
            } else {
                // Premier score dans ce mode
                await setDoc(scoreRef, payload);
                console.log(`Premier Score ${mode}: ${score}`);
            }
        } catch (e) { console.error("Score Submit Fail:", e); }
    },

    async getLeaderboard(mode, period = 'weekly') {
        if (!db) return [];
        try {
            const ref = collection(db, `leaderboards/${mode}/scores`);
            const q = query(ref, orderBy("score", "desc"), limit(50));

            const snap = await getDocs(q);
            const results = [];
            const seenUsers = new Set(); // Pour filtrer les doublons
            
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

            snap.forEach(d => {
                const data = d.data();
                // Clé unique : UID (si dispo) ou Pseudo
                const userKey = data.uid || data.pseudo;

                // Si on a déjà vu ce joueur (qui avait un meilleur score car trié desc), on ignore
                if (seenUsers.has(userKey)) return;

                if(period === 'weekly') {
                    const dDate = new Date(data.timestamp);
                    if(dDate >= sevenDaysAgo) {
                        results.push(data);
                        seenUsers.add(userKey);
                    }
                } else {
                    results.push(data);
                    seenUsers.add(userKey);
                }
            });
            
            return results.slice(0, 20);
        } catch (e) {
            console.error("Leaderboard Read Fail:", e);
            return [];
        }
    },

    // --- CHALLENGE METHODS (V5) ---

    async createChallenge(data) {
        if (!userUid || !db) return null;
        try {
            const docId = data.seed.toUpperCase();
            const docRef = doc(db, "challenges", docId);
            
            // Protection doublon : Vérifier si le document existe avant d'écrire
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                console.warn("Create Challenge Aborted: ID already taken.");
                return null;
            }

            const payload = {
                ...data,
                seed: docId,
                creatorUid: userUid,
                created_at: serverTimestamp()
            };
            await setDoc(docRef, payload);
            return docId;
        } catch (e) {
            console.error("Create Challenge Fail:", e);
            return null;
        }
    },

    async getChallenge(id) {
        if (!db) return null;
        try {
            const snap = await getDoc(doc(db, "challenges", id.toUpperCase()));
            if (snap.exists()) return { id: snap.id, ...snap.data() };
            return null;
        } catch (e) {
            console.error("Get Challenge Fail:", e);
            return null;
        }
    },

    async submitChallengeScore(challengeId, scoreData) {
        if (!userUid || !db) return;
        try {
            // ID Composite: CHALLENGE-ID_USER-UID pour unicité par joueur
            const docId = `${challengeId.toUpperCase()}_${userUid}`;
            const scoreRef = doc(db, `challenges/${challengeId.toUpperCase()}/scores`, docId);

            // 1. On vérifie s'il existe déjà un score pour ce joueur sur ce défi
            const snap = await getDoc(scoreRef);

            if (snap.exists()) {
                const oldData = snap.data();
                // Si le nouveau score est strictement meilleur (Note plus haute OU même note et temps plus court)
                const isBetter = scoreData.note > oldData.note || (scoreData.note === oldData.note && scoreData.time < oldData.time);

                if (isBetter) {
                    // On remplace tout (Nouveau record + Nouveau pseudo éventuel)
                    const payload = { uid: userUid, ...scoreData, timestamp: serverTimestamp() };
                    await setDoc(scoreRef, payload);
                    console.log("Nouveau Record Challenge enregistré !");
                } else {
                    // Le score n'est pas meilleur, mais on met à jour le PSEUDO si changé
                    if (oldData.pseudo !== scoreData.pseudo) {
                        await setDoc(scoreRef, { pseudo: scoreData.pseudo }, { merge: true });
                        console.log("Pseudo mis à jour (Score conservé)");
                    }
                }
            } else {
                // Premier essai : on crée le doc
                const payload = { uid: userUid, ...scoreData, timestamp: serverTimestamp() };
                await setDoc(scoreRef, payload);
                console.log("Premier Score Challenge enregistré !");
            }
        } catch (e) {
            console.error("Submit Challenge Score Fail:", e);
        }
    },

    async getChallengeLeaderboard(challengeId) {
        if (!db) return [];
        try {
            const q = query(
                collection(db, `challenges/${challengeId.toUpperCase()}/scores`), 
                orderBy("note", "desc"), 
                limit(50)
            );
            
            const snap = await getDocs(q);
            const results = [];
            snap.forEach(d => results.push(d.data()));
            
            results.sort((a, b) => {
                if (b.note !== a.note) return b.note - a.note;
                return a.time - b.time;
            });

            return results;
        } catch (e) {
            console.error("Challenge Leaderboard Fail:", e);
            return [];
        }
    },

    getDailyChallengeID() {
        const d = new Date();
        const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
        return `DAILY-${dateStr}`;
    },

    // Helper pour que ui.js puisse lire l'état de l'utilisateur
    get auth() { return auth; },

    // --- V6.0 IDENTITY & SECURITY METHODS ---

    /**
     * Tente de réserver un pseudo unique.
     * Gère la péremption des comptes "Zombies" (Anonymes inactifs > 90j).
     */
    async assignUsername(username) {
        if (!userUid || !db) return { success: false, reason: "NO_CONNECTION" };
        if (!navigator.onLine) return { success: true, status: "OFFLINE_PASS" };

        const cleanName = username.trim();
        const docId = cleanName.toLowerCase(); // ID unique en minuscule
        const userRef = doc(db, "usernames", docId);
        const isGuest = auth.currentUser.isAnonymous;

        try {
            const result = await runTransaction(db, async (transaction) => {
                const sfDoc = await transaction.get(userRef);

                // CAS 1 : Pseudo LIBRE (Nouveau)
                if (!sfDoc.exists()) {
                    transaction.set(userRef, {
                        originalName: cleanName,
                        uid: userUid,
                        type: isGuest ? 'guest' : 'verified',
                        lastActive: Date.now()
                    });
                    return "NEW";
                }

                const data = sfDoc.data();

                // CAS 2 : C'est DÉJÀ MOI (Mise à jour Heartbeat)
                if (data.uid === userUid) {
                    transaction.update(userRef, {
                        lastActive: Date.now(),
                        type: isGuest ? 'guest' : 'verified',
                        originalName: cleanName // Met à jour la casse si besoin
                    });
                    return "OWNED";
                }

                // CAS 3 : Pris par quelqu'un d'autre...
                // Si Certifié -> Intouchable
                if (data.type === 'verified') throw "TAKEN_VERIFIED";

                // Si Zombie (Anonyme inactif > 90j) -> VOL AUTORISÉ
                const timeDiff = Date.now() - (data.lastActive || 0);
                if (timeDiff > ZOMBIE_TIMEOUT) {
                    transaction.set(userRef, {
                        originalName: cleanName,
                        uid: userUid,
                        type: isGuest ? 'guest' : 'verified',
                        lastActive: Date.now()
                    });
                    return "ZOMBIE_CLAIMED";
                }

                throw "TAKEN_ACTIVE";
            });

            console.log(`[Identity] Pseudo '${username}' : ${result}`);
            return { success: true, status: result };

        } catch (e) {
            console.warn("[Identity] Rejet:", e);
            return { success: false, reason: e };
        }
    },

    /**
     * Transforme le compte Anonyme en Compte Google
     * et fusionne/sécurise le pseudo actuel.
     */
    async linkAccount() {
        if (!auth.currentUser) return { success: false, error: "No User" };
        try {
            const result = await linkWithPopup(auth.currentUser, provider);
            // Une fois lié, on met à jour le statut dans la base usernames immédiatement
            // (Note: Cela nécessite de connaître le pseudo actuel, qu'on passera plus tard)
            return { success: true, user: result.user };
        } catch (error) {
            console.error("Link Error:", error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Connexion directe (Pour récupérer un compte existant)
     * Écrase la session invité actuelle.
     */
    async login() {
        try {
            // On force la popup Google classique
            const result = await signInWithPopup(auth, provider);
            return { success: true, user: result.user };
        } catch (error) {
            console.error("Login Error:", error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Simple "Ping" pour dire qu'on est vivant (évite de devenir un Zombie)
     * À appeler silencieusement au démarrage.
     */
    async sendHeartbeat(username) {
        if (!userUid || !username) return;
        const docId = username.trim().toLowerCase();
        try {
            // On ne fait qu'une update simple sans transaction lourde
            await setDoc(doc(db, "usernames", docId), { 
                lastActive: Date.now() 
            }, { merge: true });
        } catch (e) {
            // On ignore les erreurs de heartbeat silencieux
        }
    }
};
