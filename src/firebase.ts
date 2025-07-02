import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBjGCWV-9nW8nejzLmSIqxGW3tIAXCyeG0",
  authDomain: "herdwise-c5a7a.firebaseapp.com",
  projectId: "herdwise-c5a7a",
  storageBucket: "herdwise-c5a7a.appspot.com",
  messagingSenderId: "529639540339",
  appId: "1:529639540339:web:fb6078df1ccb1d770b0c06",
  measurementId: "G-HENRNQTX39"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app); 