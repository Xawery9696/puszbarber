// Wartości muszą być identyczne jak w polach typu Select w PocketBase.
export const ROOMS = [
  "101",
  "102",
  "103",
  "104",
  "105",
  "Pracownia komputerowa",
  "Sala gimnastyczna",
  "Biblioteka",
];

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
  { value: "w_realizacji", label: "W realizacji" },
  { value: "zamkniete", label: "Zamknięte" },
];

export const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5 MB

export const labelOf = (list, value) =>
  list.find((item) => item.value === value)?.label ?? value;

export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleString("pl-PL") : "";

export const statusVariant = (status) =>
  status === "nowe" ? "default" : status === "w_realizacji" ? "secondary" : "outline";

export const priorityVariant = (priority) =>
  priority === "wysoki" ? "destructive" : priority === "sredni" ? "secondary" : "outline";
