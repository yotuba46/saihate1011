"use client"

import { useEffect } from 'react';
import { auth } from '@/lib/firebase';

export default function FirebaseInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Firebaseの初期化は lib/firebase.ts で行われるため、
    // ここでは特に何もする必要はありません。
  }, []);

  return <>{children}</>;
}