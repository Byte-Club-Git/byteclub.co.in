
const firebaseConfig = {
    apiKey: "AIzaSyBJTbtJZXa_ZsaUy1ZFu2fmVeqJlaxSRHg",
    authDomain: "heyi-daa8e.firebaseapp.com",
    projectId: "heyi-daa8e",
    storageBucket: "heyi-daa8e.firebasestorage.app",
    messagingSenderId: "471780988179",
    appId: "1:471780988179:web:5a0098c1a32e22c7d876e6",
    measurementId: "G-ZM7WJ07YZR"
};

let db, auth;

try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('email');
    window.googleProvider = provider;
    console.log('✅ Firebase initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    alert('Firebase configuration error. Please check your setup.');
}
