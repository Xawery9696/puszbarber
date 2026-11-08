"use client";

import { useCallback, useEffect, useState } from "react";
import { pb } from "@/lib/pocketbase";
import { describeError, useRequireAuth } from "@/lib/auth";
import { getFileToken, photoUrl } from "@/lib/files";
import {
  STATUSES,
  PRIORITIES,
  COLLECTIONS,
  F,
  EV,
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

const SELECT_FILTERS = [
  { key: "status", label: "Status", options: STATUSES },
  { key: "priority", label: "Priorytet", options: PRIORITIES },
];

export default function TechnikPage() {
  const { allowed, user } = useRequireAuth("technik");
  const [tickets, setTickets] = useState(null);
  const [token, setToken] = useState();
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ status: "", priority: "", room: "" });
  const [roomInput, setRoomInput] = useState("");
  const [drafts, setDrafts] = useState({}); // { [id]: { status, comment } }
  const [savingId, setSavingId] = useState(null);
  const [rowError, setRowError] = useState({});

  // filtr sali uruchamia się dopiero chwilę po przestaniu pisania
  useEffect(() => {
    const t = setTimeout(() => setFilters((p) => ({ ...p, room: roomInput.trim() })), 400);
    return () => clearTimeout(t);
  }, [roomInput]);

  const load = useCallback(async () => {
    try {
      const parts = [];
      const params = {};
      if (filters.status) {
        parts.push(`${F.status} = {:status}`);
        params.status = filters.status;
      }
      if (filters.priority) {
        parts.push(`${F.priority} = {:priority}`);
        params.priority = filters.priority;
      }
      if (filters.room) {
        parts.push(`${F.room} ~ {:room}`);
        params.room = filters.room;
      }
      const list = await pb.collection(COLLECTIONS.tickets).getFullList({
        sort: "-@rowid",
        expand: F.author,
        ...(parts.length ? { filter: pb.filter(parts.join(" && "), params) } : {}),
      });
      setToken(await getFileToken());
      setTickets(list);
      setDrafts({});
      setError("");
    } catch (err) {
      setError(describeError(err, "Nie udało się pobrać zgłoszeń"));
    }
  }, [filters]);

  useEffect(() => {
    if (allowed) load();
  }, [allowed, load]);

  async function save(t, draft) {
    setSavingId(t.id);
    setRowError((e) => ({ ...e, [t.id]: "" }));
    try {
      await pb.collection(COLLECTIONS.tickets).update(t.id, {
        [F.status]: draft.status,
        [F.comment]: draft.comment,
      });
      if (draft.status !== t[F.status]) {
        await pb.collection(COLLECTIONS.events).create({
          [EV.ticket]: t.id,
          [EV.actor]: user.id,
          [EV.from]: t[F.status],
          [EV.to]: draft.status,
        });
      }
      await load();
    } catch (err) {
      setRowError((e) => ({ ...e, [t.id]: describeError(err, "Nie udało się zapisać zmian") }));
    } finally {
      setSavingId(null);
    }
  }

  if (!allowed) return <p className="text-muted-foreground">Ładowanie...</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Wszystkie zgłoszenia</h1>

      <div className="grid gap-3 sm:grid-cols-3">
        {SELECT_FILTERS.map((f) => (
          <Field key={f.key}>
            <FieldLabel htmlFor={`f-${f.key}`}>{f.label}</FieldLabel>
            <Select
              value={filters[f.key] || "all"}
              onValueChange={(v) => setFilters((prev) => ({ ...prev, [f.key]: v === "all" ? "" : v }))}
            >
              <SelectTrigger id={`f-${f.key}`} className="w-full">
                <SelectValue>
                  {filters[f.key] ? labelOf(f.options, filters[f.key]) : "Wszystkie"}
                </SelectValue>
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
        <Field>
          <FieldLabel htmlFor="f-room">Sala</FieldLabel>
          <Input
            id="f-room"
            placeholder="np. 103"
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
          />
        </Field>
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
              const draft = drafts[t.id] ?? { status: t[F.status], comment: t[F.comment] ?? "" };
              const changed = draft.status !== t[F.status] || draft.comment !== (t[F.comment] ?? "");
              const setDraft = (patch) => setDrafts((d) => ({ ...d, [t.id]: { ...draft, ...patch } }));
              const img = photoUrl(t, token);
              const author = t.expand?.[F.author];
              return (
                <TableRow key={t.id}>
                  <TableCell className="min-w-56 whitespace-normal">
                    <div className="font-medium">{t[F.title]}</div>
                    {t.created && <div className="text-xs text-muted-foreground">{formatDate(t.created)}</div>}
                    <div className="mt-1 text-sm">{t[F.description]}</div>
                  </TableCell>
                  <TableCell>{t[F.room]}</TableCell>
                  <TableCell>{t[F.category]}</TableCell>
                  <TableCell>
                    <Badge variant={priorityVariant(t[F.priority])}>{labelOf(PRIORITIES, t[F.priority])}</Badge>
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
                        <SelectValue>{labelOf(STATUSES, draft.status)}</SelectValue>
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