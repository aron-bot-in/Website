import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get, query, orderByKey, orderByChild, limitToFirst, limitToLast, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey
  && firebaseConfig.authDomain
  && firebaseConfig.databaseURL
  && firebaseConfig.projectId
  && firebaseConfig.appId
);
export const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const database = app ? getDatabase(app) : null;
export const dbRoot = String(import.meta.env.VITE_FIREBASE_DB_ROOT || "botData").replace(/^\/+|\/+$/g, "") || "botData";

export function dbPath(path = "") {
  const childPath = String(path || "").replace(/^\/+|\/+$/g, "");
  return childPath ? `${dbRoot}/${childPath}` : dbRoot;
}

export function dbRef(path = "") {
  if (!database) throw new Error("Firebase is not configured.");
  return ref(database, dbPath(path));
}

export function isPermissionError(error) {
  return error?.code === "PERMISSION_DENIED"
    || error?.code === "permission-denied"
    || /permission.?denied/i.test(String(error?.message || ""));
}

export async function readValue(path, fallback = null) {
  if (!database) return fallback;
  try {
    const snapshot = await get(dbRef(path));
    return snapshot.exists() ? snapshot.val() : fallback;
  } catch (error) {
    if (isPermissionError(error)) return fallback;
    throw error;
  }
}

export function subscribeValue(path, onNext, onError = null, fallback = null) {
  if (!database) {
    onNext?.(fallback);
    return () => {};
  }

  return onValue(
    dbRef(path),
    (snapshot) => onNext?.(snapshot.exists() ? snapshot.val() : fallback),
    (error) => {
      if (isPermissionError(error)) {
        if (onError) onError(error);
        else onNext?.(fallback);
        return;
      }
      onError?.(error);
    }
  );
}

export async function readFirst(path, amount = 24) {
  if (!database) return {};
  try {
    const snapshot = await get(query(dbRef(path), orderByKey(), limitToFirst(amount)));
    return snapshot.exists() ? snapshot.val() : {};
  } catch (error) {
    if (isPermissionError(error)) return {};
    throw error;
  }
}

export async function readLastByChild(path, child, amount = 24) {
  if (!database) return {};
  try {
    const snapshot = await get(query(dbRef(path), orderByChild(child), limitToLast(amount)));
    return snapshot.exists() ? snapshot.val() : {};
  } catch (error) {
    if (isPermissionError(error)) return {};
    throw error;
  }
}

export function subscribeFirst(path, amount = 24, onNext, onError = null) {
  if (!database) {
    onNext?.({});
    return () => {};
  }

  return onValue(
    query(dbRef(path), orderByKey(), limitToFirst(amount)),
    (snapshot) => onNext?.(snapshot.exists() ? snapshot.val() : {}),
    (error) => {
      if (isPermissionError(error)) {
        if (onError) onError(error);
        else onNext?.({});
        return;
      }
      onError?.(error);
    }
  );
}

export function subscribeLastByChild(path, child, amount = 24, onNext, onError = null) {
  if (!database) {
    onNext?.({});
    return () => {};
  }

  return onValue(
    query(dbRef(path), orderByChild(child), limitToLast(amount)),
    (snapshot) => onNext?.(snapshot.exists() ? snapshot.val() : {}),
    (error) => {
      if (isPermissionError(error)) {
        if (onError) onError(error);
        else onNext?.({});
        return;
      }
      onError?.(error);
    }
  );
}
