"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { describeError, useAuth } from "@/lib/auth";
import { loginSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FIELDS = [
  { name: "email", label: "E-mail", type: "email", autoComplete: "email" },
  { name: "password", label: "Hasło", type: "password", autoComplete: "current-password" },
];

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
    } catch (err) {
      const message = err?.status === 400 ? "Nieprawidłowy e-mail lub hasło." : describeError(err, "Nie udało się zalogować");
      setError("root", { message });
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
            {FIELDS.map((f) => (
              <Field key={f.name} data-invalid={!!errors[f.name]}>
                <FieldLabel htmlFor={f.name}>{f.label}</FieldLabel>
                <Input id={f.name} type={f.type} autoComplete={f.autoComplete} aria-invalid={!!errors[f.name]} {...register(f.name)} />
                {errors[f.name] && <FieldError errors={[errors[f.name]]} />}
              </Field>
            ))}
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