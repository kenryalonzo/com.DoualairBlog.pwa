// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Log Firebase config for debugging
console.log("[Firebase] Config check:");
console.log(
  "  - API Key:",
  import.meta.env.VITE_FIREBASE_API_KEY ? "✅ Set" : "❌ Missing"
);
console.log(
  "  - Auth Domain:",
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? "✅ Set" : "❌ Missing"
);
console.log(
  "  - Project ID:",
  import.meta.env.VITE_FIREBASE_PROJECT_ID ? "✅ Set" : "❌ Missing"
);
console.log(
  "  - Storage Bucket:",
  import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? "✅ Set" : "❌ Missing"
);
console.log(
  "  - Messaging Sender ID:",
  import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? "✅ Set" : "❌ Missing"
);
console.log(
  "  - App ID:",
  import.meta.env.VITE_FIREBASE_APP_ID ? "✅ Set" : "❌ Missing"
);
console.log(
  "  - Measurement ID:",
  import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ? "✅ Set" : "❌ Missing"
);

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
