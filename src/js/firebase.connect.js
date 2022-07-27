// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js";
import { getDatabase, ref, set, onValue, child, push, update } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAk6FTP4EeM5hB0j41LXVDnl237h4XKGow",
  authDomain: "junior-test-task-dou.firebaseapp.com",
  databaseURL: "https://junior-test-task-dou-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "junior-test-task-dou",
  storageBucket: "junior-test-task-dou.appspot.com",
  messagingSenderId: "676542670763",
  appId: "1:676542670763:web:5a2a4e8bf0fcb3208754ee"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export { getDatabase, ref, set, onValue, child, push, update };