// server/config/firebaseAdmin.js
import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

// We support two ways to provide credentials:
// 1) FIREBASE_SERVICE_ACCOUNT_JSON - the full service account JSON as a single-line string (good for hosting envs like Render/Railway/Vercel)
// 2) FIREBASE_SERVICE_ACCOUNT_PATH - a path to a serviceAccountKey.json file on disk (good for local dev)
//
// Get this file from: Firebase Console -> Project Settings -> Service Accounts -> Generate New Private Key
// NEVER commit this file or paste its contents into client-side code. It belongs on the server only.

let credential;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  credential = admin.credential.cert(serviceAccount);
} else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  // eslint-disable-next-line
  const serviceAccount = JSON.parse(
    (await import('fs')).readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8')
  );
  credential = admin.credential.cert(serviceAccount);
} else {
  throw new Error(
    'Missing Firebase service account credentials. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH in server/.env'
  );
}

if (!admin.apps.length) {
  admin.initializeApp({ credential });
}

export default admin;
