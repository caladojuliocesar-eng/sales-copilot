import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configurações do Firebase obtidas por variáveis de ambiente do Vite.
// Se as variáveis de ambiente não estiverem configuradas, o app exibirá uma tela instrutiva amigável.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Validação simples se o Firebase está de fato configurado
const isConfigured = firebaseConfig.apiKey && firebaseConfig.projectId;

let app;
let auth;
let db;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error("Erro ao inicializar Firebase SDK:", error);
  }
}

export { auth, db, isConfigured, firebaseConfig };
