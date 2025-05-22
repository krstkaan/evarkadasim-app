// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyBO4ylAcwFTN7RYLVu4w_1HAqXyPvt0aT0",
    authDomain: "roomiefieschat.firebaseapp.com",
    databaseURL: "https://roomiefieschat-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "roomiefieschat",
    storageBucket: "roomiefieschat.firebasestorage.app",
    messagingSenderId: "660656088890",
    appId: "660656088890:web:2457da883ed22055f39203",
    measurementId: "G-ZM9B50EG5N"
};

// Yukarıyı kendi config’inle doldurmayı unutma!

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
