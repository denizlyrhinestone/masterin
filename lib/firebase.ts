import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

// Replace the existing Firebase configuration with the provided values
const firebaseConfig = {
  apiKey: "AIzaSyBiRAdRSEy-xHQOulozoOPavtbd2xTY3Eo",
  authDomain: "master-in-56.firebaseapp.com",
  projectId: "master-in-56",
  storageBucket: "master-in-56.firebasestorage.app",
  messagingSenderId: "939048538345",
  appId: "1:939048538345:web:04e60ed9d10a472c13a078",
  measurementId: "G-06C1KR381K",
}

// Add analytics import and initialization
import { getAnalytics } from "firebase/analytics"

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)

// Initialize Analytics (only in browser environment)
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null
