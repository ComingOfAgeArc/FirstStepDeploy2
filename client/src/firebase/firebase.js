import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyASLKXZl-WHuND9JzudE_epKqaFbzGcRuU",
  authDomain: "firststep-jobs.firebaseapp.com",
  projectId: "firststep-jobs",
  storageBucket: "firststep-jobs.appspot.com", 
  messagingSenderId: "881475737256",
  appId: "1:881475737256:web:d5075863f68336b2d8149d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
