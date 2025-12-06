
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, orderBy, limit, getDocs, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAMA9hH3hjlkjp-a4lpb3Dg9IusUB-AiMQ",
  authDomain: "harmonist-academy.firebaseapp.com",
  projectId: "harmonist-academy",
  storageBucket: "harmonist-academy.appspot.com",
  messagingSenderId: "1095938878602",
  appId: "1:1095938878602:web:1ea75d46f3f5d76d921173"
};

let app, auth, db, userUid = null;

export const Cloud = {
    initialized: false,

    init() {
        if (this.initialized) return;
        try {
            app = initializeApp(firebaseConfig);
            auth = getAuth(app);
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
            await addDoc(collection(db, `leaderboards/${mode}/scores`), payload);
            console.log(`Score ${score} envoyé vers ${mode}`);
        } catch (e) { console.error("Score Submit Fail:", e); }
    },

    async getLeaderboard(mode, period = 'weekly') {
        if (!db) return [];
        try {
            const ref = collection(db, `leaderboards/${mode}/scores`);
            const q = query(ref, orderBy("score", "desc"), limit(50));

            const snap = await getDocs(q);
            const results = [];
            
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

            snap.forEach(d => {
                const data = d.data();
                if(period === 'weekly') {
                    const dDate = new Date(data.timestamp);
                    if(dDate >= sevenDaysAgo) results.push(data);
                } else {
                    results.push(data);
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
            const payload = {
                ...data,
                seed: docId,
                creatorUid: userUid,
                created_at: serverTimestamp()
            };
            await setDoc(doc(db, "challenges", docId), payload);
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
    }
};
