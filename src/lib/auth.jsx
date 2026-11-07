"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { pb } from "@/lib/pocketbase";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function init() {
      if (pb.authStore.isValid) {
        try {
          // odświeżenie, żeby mieć aktualną rolę z bazy
          await pb.collection("users").authRefresh();
        } catch {
          pb.authStore.clear();
        }
      }
      if (active) {
        setUser(pb.authStore.isValid ? pb.authStore.record : null);
        setReady(true);
      }
    }
    init();

    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser(record);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  async function login(email, password) {
    await pb.collection("users").authWithPassword(email, password);
  }

  async function register({ name, email, password, passwordConfirm }) {
    // rola NIE jest wysyłana: nadaje ją tylko superużytkownik w panelu PocketBase
    await pb.collection("users").create({ name, email, password, passwordConfirm });
    await login(email, password);
  }

  function logout() {
    pb.authStore.clear();
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// Przekierowuje niezalogowanych na /login, a użytkowników bez wymaganej roli na /moje.
export function useRequireAuth(role) {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
    else if (role && user.role !== role) router.replace("/moje");
  }, [ready, user, role, router]);

  const allowed = Boolean(ready && user && (!role || user.role === role));
  return { user, allowed };
}

// Zamienia błąd PocketBase na czytelny komunikat z konkretną przyczyną.
export function describeError(err, fallback) {
  const base = pb.baseURL;
  const status = err?.status;

  if (!base || base === "/") {
    return "Brak adresu PocketBase w buildzie strony. W Coolify ustaw NEXT_PUBLIC_POCKETBASE_URL jako Build Variable i zrób Redeploy.";
  }
  if (
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    base.startsWith("http:")
  ) {
    return `Adres PocketBase (${base}) zaczyna się od http://, a strona działa na https://. Przeglądarka to blokuje. Użyj adresu https://.`;
  }
  if (status === 0) {
    return `Brak połączenia z PocketBase pod adresem ${base}. Sprawdź, czy ${base}/api/health otwiera się w przeglądarce.`;
  }
  if (status === 404) {
    return `PocketBase (${base}) zwrócił 404. Sprawdź, czy kolekcja users istnieje i czy adres wskazuje na PocketBase.`;
  }
  const data = err?.response?.data ?? {};
  const first = Object.entries(data)[0];
  if (first) return `${first[0]}: ${first[1]?.message ?? "niepoprawna wartość"}`;
  const msg = err?.response?.message;
  return `${fallback} (błąd ${status ?? "?"}${msg ? ": " + msg : ""}, adres: ${base})`;
}