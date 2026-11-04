"use client";

import { useState } from "react";
import { useRequireAuth } from "@/components/auth-provider";
import { TicketForm } from "@/components/ticket-form";
import { MyTickets } from "@/components/my-tickets";

export default function MojePage() {
  const { allowed } = useRequireAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  if (!allowed) return <p className="text-muted-foreground">Ładowanie...</p>;

  return (
    <div className="space-y-8">
      <TicketForm onCreated={() => setRefreshKey((k) => k + 1)} />
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Twoje zgłoszenia</h2>
        <MyTickets refreshKey={refreshKey} />
      </section>
    </div>
  );
}
