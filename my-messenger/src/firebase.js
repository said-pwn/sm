import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 
import { getDatabase } from "firebase/database";


const firebaseConfig = {
  apiKey: "AIzaSyAdTwc-BjYhdl4HVWCpzhR05yswzvZFD3Q",
  authDomain: "registelogin.firebaseapp.com",
  projectId: "registelogin",
  storageBucket: "registelogin.appspot.com", // 👈 исправлено .appspot.com
  messagingSenderId: "233125022610",
  appId: "1:233125022610:web:f8fac621e116d9a62d4f4b",
  databaseURL: "https://registelogin-default-rtdb.firebaseio.com",
  measurementId: "G-5MR5YVYVSJ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);
