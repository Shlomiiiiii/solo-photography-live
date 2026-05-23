"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { Toaster } from "sonner";
import { auth } from "@/lib/firebase/client";

type AuthContextValue = {
  user: User | null;
  authLoading: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  authLoading: true
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthLoading(false);
    });
  }, []);

  const value = useMemo(() => ({ user, authLoading }), [user, authLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
      <Toaster
        theme="dark"
        richColors
        closeButton
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(17,17,19,0.92)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#f5f5f4",
            backdropFilter: "blur(18px)"
          }
        }}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

