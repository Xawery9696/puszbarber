"use client";

import { useCallback, useEffect, useState } from "react";
import { pb } from "@/lib/pocketbase";
import { useRequireAuth } from "@/components/auth-provider";
import { NativeSelect } from "@/components/native-select";
import { TicketRow } from "@/components/ticket-row";
import { getFileToken } from "@/lib/files";
import { ROOMS, STATUSES, PRIORITIES } from "@/lib/constants";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function TechnikPage() {
  const { allowed } = useRequireAuth("technik");
  const [tickets, setTickets] = useState(null);
  const [token, setToken] = useState();
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ status: "", room: "", priority: "" });

  const load = useCallback(async () => {
    try {
      const parts = [];
      const params = {};
      for (const key of ["status", "room", "priority"]) {
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
      setError("");
    } catch {
      setError("Nie udało się pobrać zgłoszeń.");
    }
  }, [filters]);

  useEffect(() => {
    if (allowed) load();
  }, [allowed, load]);

  if (!allowed) return <p className="text-muted-foreground">Ładowanie...</p>;

  const setFilter = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Wszystkie zgłoszenia</h1>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="f-status">Status</Label>
          <NativeSelect id="f-status" value={filters.status} onChange={setFilter("status")} options={STATUSES} placeholder="Wszystkie" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-room">Sala</Label>
          <NativeSelect id="f-room" value={filters.room} onChange={setFilter("room")} options={ROOMS} placeholder="Wszystkie" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-priority">Priorytet</Label>
          <NativeSelect id="f-priority" value={filters.priority} onChange={setFilter("priority")} options={PRIORITIES} placeholder="Wszystkie" />
        </div>
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
            {tickets.map((t) => (
              <TicketRow key={`${t.id}-${t.updated}`} ticket={t} token={token} onSaved={load} />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
