"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/components/auth-provider";
import { FormField } from "@/components/form-field";
import { registerSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField label="Imię" htmlFor="name" error={errors.name?.message}>
            <Input id="name" autoComplete="name" {...register("name")} />
          </FormField>
          <FormField label="E-mail" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
          </FormField>
          <FormField label="Hasło" htmlFor="password" error={errors.password?.message}>
            <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
          </FormField>
          <FormField label="Powtórz hasło" htmlFor="passwordConfirm" error={errors.passwordConfirm?.message}>
            <Input id="passwordConfirm" type="password" autoComplete="new-password" {...register("passwordConfirm")} />
          </FormField>
          {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Zakładanie konta..." : "Załóż konto"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Masz już konto?{" "}
            <Link href="/login" className="underline">
              Zaloguj się
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
