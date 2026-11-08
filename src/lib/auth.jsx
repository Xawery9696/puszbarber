"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { pb } from "@/lib/pocketbase";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
  async function init() {
    if (pb.authStore.isValid) {
      try {
       
        await pb.collection("users").authRefresh();
      } catch {
        pb.authStore.clear();
      }
    }
    setUser(pb.authStore.isValid ? pb.authStore.record : null);
    setReady(true);
  }
  init();

  const unsubscribe = pb.authStore.onChange((_token, record) => setUser(record));
  return unsubscribe;
}, []);

  const login = (email, password) => pb.collection("users").authWithPassword(email, password);

  const register = async ({ name, email, password, passwordConfirm }) => {
    await pb.collection("users").create({ name, email, password, passwordConfirm });
    await login(email, password);
  };

  const logout = () => pb.authStore.clear();

  return <AuthContext.Provider value={{ user, ready, login, register, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

export function useRequireAuth(role) {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
    else if (role && user.role !== role) router.replace("/moje");
  }, [ready, user, role, router]);

  return { user, allowed: Boolean(ready && user && (!role || user.role === role)) };
}
export function describeError(err, fallback) {
  const data = err?.response?.data ?? {};
  const fields = Object.keys(data);
  if (fields.length > 0) {
    return `${fields[0]}: ${data[fields[0]].message}`;
  }
  return `${fallback} (błąd ${err?.status ?? "?"})`;
}