"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/auth";
import { registerSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FIELDS = [
  { name: "name", label: "Imię", type: "text", autoComplete: "name" },
  { name: "email", label: "E-mail", type: "email", autoComplete: "email" },
  { name: "password", label: "Hasło", type: "password", autoComplete: "new-password" },
  { name: "passwordConfirm", label: "Powtórz hasło", type: "password", autoComplete: "new-password" },
];

export default function RegisterPage() {
  const { user, ready, register: registerUser } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  useEffect(() => {
    if (ready && user) router.replace("/");
  }, [ready, user, router]);

  async function onSubmit(values) {
    try {
      await registerUser(values);
      router.replace("/");
    } catch (err) {
      const data = err?.response?.data ?? {};
      if (data.email) {
        setError("email", { message: "Ten adres e-mail jest już zajęty lub niepoprawny." });
      } else if (data.password) {
        setError("password", { message: "Hasło jest niepoprawne (min. 8 znaków)." });
      } else {
        setError("root", { message: "Nie udało się założyć konta. Spróbuj ponownie." });
      }
    }
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Rejestracja</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            {FIELDS.map((f) => (
              <Field key={f.name} data-invalid={!!errors[f.name]}>
                <FieldLabel htmlFor={f.name}>{f.label}</FieldLabel>
                <Input
                  id={f.name}
                  type={f.type}
                  autoComplete={f.autoComplete}
                  aria-invalid={!!errors[f.name]}
                  {...register(f.name)}
                />
                {errors[f.name] && <FieldError errors={[errors[f.name]]} />}
              </Field>
            ))}
            {errors.root && <FieldError errors={[errors.root]} />}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Zakładanie konta..." : "Załóż konto"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Masz już konto?{" "}
              <Link href="/login" className="underline">
                Zaloguj się
              </Link>
            </p>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
