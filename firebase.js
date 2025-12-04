
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
        
        // On crée une entrée unique dans la collection 'scores' du mode
        // Note: Dans une vraie prod, on utiliserait une Cloud Function pour vérifier le HighScore
        const payload = {
            uid: userUid,
            pseudo: username || "Anonyme",
            score: score,
            mastery: mastery,
            timestamp: new Date().toISOString()
        };

        try {
            // On ajoute simplement le score à l'historique global
            await addDoc(collection(db, `leaderboards/${mode}/scores`), payload);
            console.log(`Score ${score} envoyé vers ${mode}`);
        } catch (e) { console.error("Score Submit Fail:", e); }
    },

    async getLeaderboard(mode) {
        if (!db) return [];
        try {
            const ref = collection(db, `leaderboards/${mode}/scores`);
            const q = query(ref, orderBy("score", "desc"), limit(20));
            const snap = await getDocs(q);
            const results = [];
            snap.forEach(d => results.push(d.data()));
            return results;
        } catch (e) {
            console.error("Leaderboard Read Fail:", e);
            return [];
        }
    }
};
