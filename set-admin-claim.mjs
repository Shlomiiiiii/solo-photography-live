import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const uid = process.argv[2];

if (!uid) {
  console.error("Usage: node scripts/set-admin-claim.mjs <firebase-auth-uid>");
  process.exit(1);
}

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
  : {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
    };

initializeApp({
  credential: cert(serviceAccount)
});

await getAuth().setCustomUserClaims(uid, { admin: true });
console.log(`Admin claim applied to ${uid}. Sign out and back in to refresh the token.`);

