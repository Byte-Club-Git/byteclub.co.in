// workshopfirebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBFI2_jEndGyX3oTb70LJJxwlbUWlRChtE",
    authDomain: "workshops-418f4.firebaseapp.com",
    projectId: "workshops-418f4",
    storageBucket: "workshops-418f4.firebasestorage.app",
    messagingSenderId: "682306301295",
    appId: "1:682306301295:web:b978653efc215d19c8cc9a",
    measurementId: "G-ECTPS01WY4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
