
export const COLLECTIONS = { tickets: "Zgloszenia", events: "zdarzenia" };

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

export const EV = { ticket: "ticket", actor: "aktor", from: "zstatus", to: "dostatus" };

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
export const STATUSES = [
  { value: "nowe", label: "Nowe" },
  { value: "w realizacji", label: "W realizacji" },
  { value: "zamkniete", label: "Zamknięte" },
];

export const MAX_PHOTO_SIZE = 5 * 1024 * 1024; 

export const labelOf = (list, value) => list.find((i) => i.value === value)?.label ?? value;
export const formatDate = (iso) => (iso ? new Date(iso).toLocaleString("pl-PL") : "");
export function statusVariant(status) {
  if (status === STATUSES[0].value) return "default";
  if (status === STATUSES[1].value) return "secondary";
  return "outline";
}

export function priorityVariant(priority) {
  if (priority === "wysoki") return "destructive";
  if (priority === "sredni") return "secondary";
  return "outline";
}