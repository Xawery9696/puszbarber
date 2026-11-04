"use client";

import { useCallback, useEffect, useState } from "react";
import { pb } from "@/lib/pocketbase";
import { useRequireAuth } from "@/lib/auth";
import { getFileToken, photoUrl } from "@/lib/files";
import {
  ROOMS,
  STATUSES,
  PRIORITIES,
  CATEGORIES,
  labelOf,
  formatDate,
  priorityVariant,
} from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const FILTERS = [
  { key: "status", label: "Status", options: STATUSES },
  { key: "room", label: "Sala", options: ROOMS.map((r) => ({ value: r, label: r })) },
  { key: "priority", label: "Priorytet", options: PRIORITIES },
];

export default function TechnikPage() {
  const { allowed, user } = useRequireAuth("technik");
  const [tickets, setTickets] = useState(null);
  const [token, setToken] = useState();
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ status: "", room: "", priority: "" });
  const [drafts, setDrafts] = useState({}); // { [id]: { status, comment } }
  const [savingId, setSavingId] = useState(null);
  const [rowError, setRowError] = useState({});

  const load = useCallback(async () => {
    try {
      const parts = [];
      const params = {};
      for (const { key } of FILTERS) {
        if (filters[key]) {
          parts.push(`${key} = {:${key}}`);
          params[key] = filters[key];
        }
      }
      const list = await pb.collection("tickets").getFullList({
        sort: "-created",
        expand: "author",
        ...(parts.length ? { filter: pb.filter(parts.join(" && "), params) } : {}),
      });
      setToken(await getFileToken());
      setTickets(list);
      setDrafts({});
      setError("");
    } catch {
      setError("Nie udało się pobrać zgłoszeń.");
    }
  }, [filters]);

  useEffect(() => {
    if (allowed) load();
  }, [allowed, load]);

  async function save(t, draft) {
    setSavingId(t.id);
    setRowError((e) => ({ ...e, [t.id]: "" }));
    try {
      await pb.collection("tickets").update(t.id, { status: draft.status, comment: draft.comment });
      if (draft.status !== t.status) {
        await pb.collection("ticket_events").create({
          ticket: t.id,
          actor: user.id,
          from_status: t.status,
          to_status: draft.status,
        });
      }
      await load();
    } catch {
      setRowError((e) => ({ ...e, [t.id]: "Nie udało się zapisać zmian." }));
    } finally {
      setSavingId(null);
    }
  }

  if (!allowed) return <p className="text-muted-foreground">Ładowanie...</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Wszystkie zgłoszenia</h1>

      <div className="grid gap-3 sm:grid-cols-3">
        {FILTERS.map((f) => (
          <Field key={f.key}>
            <FieldLabel htmlFor={`f-${f.key}`}>{f.label}</FieldLabel>
            <Select
              value={filters[f.key] || "all"}
              onValueChange={(v) => setFilters((prev) => ({ ...prev, [f.key]: v === "all" ? "" : v }))}
            >
              <SelectTrigger id={`f-${f.key}`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                {f.options.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        ))}
      </div>

      {error && <p className="text-destructive">{error}</p>}
      {!tickets && !error && <p className="text-muted-foreground">Ładowanie zgłoszeń...</p>}
      {tickets && tickets.length === 0 && <p className="text-muted-foreground">Brak zgłoszeń dla wybranych filtrów.</p>}

      {tickets && tickets.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Zgłoszenie</TableHead>
              <TableHead>Sala</TableHead>
              <TableHead>Kategoria</TableHead>
              <TableHead>Priorytet</TableHead>
              <TableHead>Autor</TableHead>
              <TableHead>Zdjęcie</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Komentarz</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((t) => {
              const draft = drafts[t.id] ?? { status: t.status, comment: t.comment ?? "" };
              const changed = draft.status !== t.status || draft.comment !== (t.comment ?? "");
              const setDraft = (patch) => setDrafts((d) => ({ ...d, [t.id]: { ...draft, ...patch } }));
              const img = photoUrl(t, token);
              const author = t.expand?.author;
              return (
                <TableRow key={t.id}>
                  <TableCell className="min-w-56 whitespace-normal">
                    <div className="font-medium">{t.title}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(t.created)}</div>
                    <div className="mt-1 text-sm">{t.description}</div>
                  </TableCell>
                  <TableCell>{t.room}</TableCell>
                  <TableCell>{labelOf(CATEGORIES, t.category)}</TableCell>
                  <TableCell>
                    <Badge variant={priorityVariant(t.priority)}>{labelOf(PRIORITIES, t.priority)}</Badge>
                  </TableCell>
                  <TableCell>{author?.name || author?.email || "-"}</TableCell>
                  <TableCell>
                    {img ? (
                      <a href={img} target="_blank" rel="noreferrer" className="underline">
                        Zdjęcie
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="min-w-40">
                    <Select value={draft.status} onValueChange={(v) => setDraft({ status: v })}>
                      <SelectTrigger aria-label="Status" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="min-w-48">
                    <Input
                      aria-label="Komentarz"
                      value={draft.comment}
                      maxLength={500}
                      onChange={(e) => setDraft({ comment: e.target.value })}
                    />
                    {rowError[t.id] && <p className="mt-1 text-xs text-destructive">{rowError[t.id]}</p>}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" disabled={!changed || savingId === t.id} onClick={() => save(t, draft)}>
                      {savingId === t.id ? "Zapisywanie..." : "Zapisz"}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
