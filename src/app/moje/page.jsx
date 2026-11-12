"use client";

import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pb } from "@/lib/pocketbase";
import { describeError, useRequireAuth } from "@/lib/auth";
import { ticketSchema } from "@/lib/schemas";
import { getFileToken, photoUrl } from "@/lib/files";
import {
  CATEGORIES, PRIORITIES, STATUSES, COLLECTIONS, F,
  labelOf, formatDate, statusVariant, priorityVariant,
} from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const SELECTS = [
  { name: "category", label: "Kategoria", options: CATEGORIES },
  { name: "priority", label: "Priorytet", options: PRIORITIES },
];

export default function MojePage() {
  const { allowed, user } = useRequireAuth();
  const userId = user?.id;
  const [tickets, setTickets] = useState(null);
  const [token, setToken] = useState();
  const [loadError, setLoadError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register, control, handleSubmit, reset, setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(ticketSchema),
    defaultValues: { title: "", description: "", room: "", category: "", priority: "" },
  });

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      setTickets(
        await pb.collection(COLLECTIONS.tickets).getFullList({
          sort: "-@rowid",
          filter: pb.filter(`${F.author} = {:id}`, { id: userId }),
        })
      );
      setToken(await getFileToken());
      setLoadError("");
    } catch (err) {
      setLoadError(describeError(err, "Nie udało się pobrać zgłoszeń"));
    }
  }, [userId]);

  useEffect(() => {
    if (allowed) load();
  }, [allowed, load]);

  async function onSubmit(v) {
    setSuccess(false);
    const data = {
      [F.title]: v.title,
      [F.description]: v.description,
      [F.room]: v.room,
      [F.category]: labelOf(CATEGORIES, v.category),
      [F.priority]: v.priority,
      [F.status]: STATUSES[0].value,
      [F.author]: userId,
    };
    const fd = new FormData();
    Object.entries(data).forEach(([key, value]) => fd.append(key, value));
    if (v.photo?.length) fd.append(F.photo, v.photo[0]);

    try {
      await pb.collection(COLLECTIONS.tickets).create(fd);
      reset();
      setSuccess(true);
      load();
    } catch (err) {
      setError("root", { message: describeError(err, "Nie udało się dodać zgłoszenia") });
    }
  }

  if (!allowed) return <p className="text-muted-foreground">Ładowanie...</p>;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Nowe zgłoszenie</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Field data-invalid={!!errors.title}>
                <FieldLabel htmlFor="title">Tytuł</FieldLabel>
                <Input id="title" aria-invalid={!!errors.title} {...register("title")} />
                {errors.title && <FieldError errors={[errors.title]} />}
              </Field>

              <Field data-invalid={!!errors.description}>
                <FieldLabel htmlFor="description">Opis</FieldLabel>
                <Textarea id="description" rows={4} aria-invalid={!!errors.description} {...register("description")} />
                {errors.description && <FieldError errors={[errors.description]} />}
              </Field>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field data-invalid={!!errors.room}>
                  <FieldLabel htmlFor="room">Sala</FieldLabel>
                  <Input id="room" placeholder="np. 103 " aria-invalid={!!errors.room} {...register("room")} />
                  {errors.room && <FieldError errors={[errors.room]} />}
                </Field>

                {SELECTS.map((s) => (
                  <Controller
                    key={s.name}
                    name={s.name}
                    control={control}
                    render={({ field }) => (
                      <Field data-invalid={!!errors[s.name]}>
                        <FieldLabel htmlFor={s.name}>{s.label}</FieldLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id={s.name} className="w-full" aria-invalid={!!errors[s.name]}>
                            <SelectValue placeholder="Wybierz...">
                              {field.value ? labelOf(s.options, field.value) : undefined}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {s.options.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors[s.name] && <FieldError errors={[errors[s.name]]} />}
                      </Field>
                    )}
                  />
                ))}
              </div>

              <Field data-invalid={!!errors.photo}>
                <FieldLabel htmlFor="photo">Zdjęcie usterki (opcjonalnie, maks. 5 MB)</FieldLabel>
                <Input id="photo" type="file" accept="image/*" aria-invalid={!!errors.photo} {...register("photo")} />
                {errors.photo && <FieldError errors={[errors.photo]} />}
              </Field>

              {errors.root && <FieldError errors={[errors.root]} />}
              {success && <p className="text-sm text-green-600">Zgłoszenie zostało dodane.</p>}
              <Button type="submit" disabled={isSubmitting} className="w-fit">
                {isSubmitting ? "Wysyłanie..." : "Dodaj zgłoszenie"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Twoje zgłoszenia</h2>
        {loadError && <p className="text-destructive">{loadError}</p>}
        {!tickets && !loadError && <p className="text-muted-foreground">Ładowanie zgłoszeń...</p>}
        {tickets && tickets.length === 0 && (
          <p className="text-muted-foreground">Nie masz jeszcze żadnych zgłoszeń. Dodaj pierwsze w formularzu powyżej.</p>
        )}
        {tickets?.map((t) => {
          const img = photoUrl(t, token);
          return (
            <Card key={t.id}>
              <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">{t[F.title]}</h3>
                    <Badge variant={statusVariant(t[F.status])}>{labelOf(STATUSES, t[F.status])}</Badge>
                    <Badge variant={priorityVariant(t[F.priority])}>{labelOf(PRIORITIES, t[F.priority])}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {[`Sala ${t[F.room]}`, t[F.category], formatDate(t.created)].filter(Boolean).join(" | ")}
                  </p>
                  <p className="whitespace-pre-wrap text-sm">{t[F.description]}</p>
                  {t[F.comment] && (
                    <p className="text-sm">
                      <span className="font-medium">Komentarz technika:</span> {t[F.comment]}
                    </p>
                  )}
                </div>
                {img && (
                  <a href={img} target="_blank" rel="noreferrer" className="shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Zdjęcie usterki: ${t[F.title]}`} className="h-24 w-24 rounded-md border object-cover" />
                  </a>
                )}
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}