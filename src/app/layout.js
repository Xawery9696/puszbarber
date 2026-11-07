"use client";

import "./globals.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthContext, AuthProvider } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";

export default function RootLayout({ children }) {
  const router = useRouter();

  return (
    <html lang="pl">
      <head>
        <title>Zgłoszenia usterek</title>
        <meta name="description" content="Aplikacja do zgłaszania usterek w szkole" />
      </head>
      <body
        className="min-h-screen bg-background text-foreground antialiased"
        style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}
      >
        <AuthProvider>
          <AuthContext.Consumer>
            {({ user, logout }) => (
              <header className="border-b">
                <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <Link href="/" className="font-semibold">
                    Zgłoszenia usterek
                  </Link>
                  {user ? (
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <Link href="/moje" className="hover:underline">
                        Moje zgłoszenia
                      </Link>
                      {user.role === "technik" && (
                        <Link href="/technik" className="hover:underline">
                          Panel technika
                        </Link>
                      )}
                      <span className="text-muted-foreground">{user.name || user.email}</span>
                      <Badge variant="secondary">{user.role === "technik" ? "technik" : "użytkownik"}</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          logout();
                          router.replace("/login");
                        }}
                      >
                        Wyloguj
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Link href="/login" className={buttonVariants({ variant: "outline", size: "sm" })}>
                        Zaloguj się
                      </Link>
                      <Link href="/register" className={buttonVariants({ size: "sm" })}>
                        Załóż konto
                      </Link>
                    </div>
                  )}
                </div>
              </header>
            )}
          </AuthContext.Consumer>
          <main className="mx-auto w-full max-w-5xl px-4 py-6">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}