import "server-only";

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";

type AdminBucket = ReturnType<Storage["bucket"]>;

function getPrivateKey() {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  return key?.replace(/\\n/g, "\n");
}

function getServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }

  return {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: getPrivateKey()
  };
}

function createAdminApp(): App {
  if (getApps().length) return getApps()[0];

  const serviceAccount = getServiceAccount();
  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    throw new Error("Missing Firebase Admin credentials. Check FIREBASE_* environment variables.");
  }

  return initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}

let cachedApp: App | null = null;
let cachedAuth: Auth | null = null;
let cachedDb: Firestore | null = null;
let cachedStorage: Storage | null = null;
let cachedBucket: AdminBucket | null = null;

export function getAdminApp() {
  cachedApp ??= createAdminApp();
  return cachedApp;
}

export function getAdminAuth() {
  cachedAuth ??= getAuth(getAdminApp());
  return cachedAuth;
}

export function getAdminDb() {
  cachedDb ??= getFirestore(getAdminApp());
  return cachedDb;
}

export function getAdminStorage() {
  cachedStorage ??= getStorage(getAdminApp());
  return cachedStorage;
}

export function getAdminBucket() {
  cachedBucket ??= getAdminStorage().bucket(process.env.FIREBASE_STORAGE_BUCKET);
  return cachedBucket;
}

function lazyProxy<T extends object>(factory: () => T): T {
  return new Proxy({} as T, {
    get(_target, prop, receiver) {
      return Reflect.get(factory(), prop, receiver);
    },
    set(_target, prop, value, receiver) {
      return Reflect.set(factory(), prop, value, receiver);
    }
  });
}

export const adminApp = lazyProxy<App>(getAdminApp);
export const adminAuth = lazyProxy<Auth>(getAdminAuth);
export const adminDb = lazyProxy<Firestore>(getAdminDb);
export const adminStorage = lazyProxy<Storage>(getAdminStorage);
export const adminBucket = lazyProxy<AdminBucket>(getAdminBucket);
