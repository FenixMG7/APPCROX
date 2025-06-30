
import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

// La configuration de Firebase est lue à partir des variables d'environnement via process.env
// Assurez-vous que ces variables sont définies dans votre environnement de déploiement (par exemple, Vercel).
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let db: Firestore | undefined;

// Initialise Firebase uniquement si la configuration est présente et valide
if (firebaseConfig.projectId) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch(e) {
      console.error("Erreur d'initialisation de Firebase. Vérifiez que vos clés dans les variables d'environnement sont correctes.", e);
  }
} else {
  console.warn(
    "Configuration Firebase (FIREBASE_PROJECT_ID) manquante dans les variables d'environnement. " +
    "L'application ne pourra pas se connecter à la base de données. "
  );
}

// Exporte l'instance de la base de données à utiliser dans l'application
export { db };