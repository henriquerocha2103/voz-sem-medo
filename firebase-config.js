import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCN0m5pJf87joOANBcaNspFYMgMBjceC70",
  authDomain: "voz-sem-medo.firebaseapp.com",
  projectId: "voz-sem-medo",
  storageBucket: "voz-sem-medo.firebasestorage.app",
  messagingSenderId: "771086386905",
  appId: "1:771086386905:web:2b315381caace2038120c8",
  measurementId: "G-TK3CZGKFV8"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);