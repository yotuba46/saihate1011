import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getDatabase, ref, set, get, Database } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

let app;
let auth: Auth;
let database: Database;

try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  database = getDatabase(app);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

export const setUserRoom = async (userId: string, roomId: string | null) => {
  const userRoomRef = ref(database, `users/${userId}/currentRoom`);
  await set(userRoomRef, roomId);
};

export const getUserRoom = async (userId: string): Promise<string | null> => {
  const userRoomRef = ref(database, `users/${userId}/currentRoom`);
  const snapshot = await get(userRoomRef);
  return snapshot.val();
};

export { auth, database };