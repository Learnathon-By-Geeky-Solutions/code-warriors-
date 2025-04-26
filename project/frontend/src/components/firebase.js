

import { initializeApp } from "firebase/app"
import { getFirestore }   from "firebase/firestore"

const {
  NEXT_PUBLIC_FIREBASE_API_KEY: apiKey,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: authDomain,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: projectId,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: storageBucket,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: messagingSenderId,
  NEXT_PUBLIC_FIREBASE_APP_ID: appId,
} = process.env

// sanity check
if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) {
  throw new Error("⚠️ Missing Firebase environment variables")
}

const firebaseConfig = { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId }

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
