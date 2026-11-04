"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
    else router.replace(user.role === "technik" ? "/technik" : "/moje");
  }, [ready, user, router]);

  return <p className="text-muted-foreground">Ładowanie...</p>;
}
