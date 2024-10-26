import { initializeApp } from 'firebase/app';
import { getFirestore  } from 'firebase/firestore';
import {getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAqylhwPBOiQhYWH3v3t6M9PhFJjdC7p2k",
  authDomain: "epipen-addon-test.firebaseapp.com",
  projectId: "epipen-addon-test",
  storageBucket: "epipen-addon-test.appspot.com",
  messagingSenderId: "812950956294",
  appId: "1:812950956294:web:00145a8895061b9baf9687"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

export { app, db, storage };
