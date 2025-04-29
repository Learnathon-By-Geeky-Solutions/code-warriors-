import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDLgq9wqnaY6N8jv84pzzI3OWqUPh9OGvs",
  authDomain: "metahivechat.firebaseapp.com",
  projectId: "metahivechat",
  storageBucket: "metahivechat.firebasestorage.app",
  messagingSenderId: "771747585263",
  appId: "1:771747585263:web:6cc356f9108759c466cf1a",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
