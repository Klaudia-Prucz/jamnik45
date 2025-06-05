import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDDo97GFBYzHA132vn2piA11qfR2YQwBHc",
  authDomain: "jamnik45-6f920.firebaseapp.com",
  projectId: "jamnik45-6f920",
  storageBucket: "jamnik45-6f920.appspot.com", 
  messagingSenderId: "761543253197",
  appId: "1:761543253197:web:cc4ad4bc26bfe137c15d84"
};

const app = initializeApp(firebaseConfig);


export const db = getFirestore(app);
