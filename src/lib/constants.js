// Nazwy kolekcji i pól z PocketBase. Jeśli coś u siebie zmienisz, popraw TUTAJ.
export const COLLECTIONS = {
  tickets: "Zgloszenia",
  events: "zdarzenia",
};

// pola kolekcji Zgloszenia
export const F = {
  title: "tytul",
  description: "opis",
  room: "miejsce",
  category: "Zdarzenie",
  priority: "priorytet",
  status: "status",
  author: "author",
  comment: "komentarz",
  photo: "zdjecie",
};

// pola kolekcji zdarzenia
export const EV = {
  ticket: "ticket",
  actor: "aktor",
  from: "zstatus",
  to: "dostatus",
};

export const CATEGORIES = [
  { value: "sprzet_komputerowy", label: "Sprzęt komputerowy" },
  { value: "multimedia", label: "Multimedia" },
  { value: "instalacje", label: "Instalacje" },
  { value: "inne", label: "Inne" },
];

export const PRIORITIES = [
  { value: "niski", label: "Niski" },
  { value: "sredni", label: "Średni" },
  { value: "wysoki", label: "Wysoki" },
];

// wartości muszą być IDENTYCZNE jak w polach Select w PocketBase
export const STATUSES = [
  { value: "nowe", label: "Nowe" },
  { value: "w realizacji", label: "W realizacji" },
  { value: "zamkniete", label: "Zamknięte" },
];

export const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5 MB

export const labelOf = (list, value) =>
  list.find((item) => item.value === value)?.label ?? value;

export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleString("pl-PL") : "";

export const statusVariant = (status) =>
  status === STATUSES[0].value ? "default" : status === STATUSES[1].value ? "secondary" : "outline";

export const priorityVariant = (priority) =>
  priority === "wysoki" ? "destructive" : priority === "sredni" ? "secondary" : "outline";