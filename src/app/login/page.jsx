"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/auth";
import { loginSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const { user, ready, login } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (ready && user) router.replace("/");
  }, [ready, user, router]);

  async function onSubmit({ email, password }) {
    try {
      await login(email, password);
      router.replace("/");
    } catch {
      setError("root", { message: "Nieprawidłowy e-mail lub hasło." });
    }
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Logowanie</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
              {errors.email && <FieldError errors={[errors.email]} />}
            </Field>
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">Hasło</FieldLabel>
              <Input id="password" type="password" autoComplete="current-password" aria-invalid={!!errors.password} {...register("password")} />
              {errors.password && <FieldError errors={[errors.password]} />}
            </Field>
            {errors.root && <FieldError errors={[errors.root]} />}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Logowanie..." : "Zaloguj się"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Nie masz konta?{" "}
              <Link href="/register" className="underline">
                Załóż konto
              </Link>
            </p>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
