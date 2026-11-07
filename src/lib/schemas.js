import { z } from "zod";
import { MAX_PHOTO_SIZE } from "@/lib/constants";

export const loginSchema = z.object({
  email: z.string().email("Podaj poprawny adres e-mail"),
  password: z.string().min(1, "Podaj hasło"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Imię jest za krótkie (min. 2 znaki)"),
    email: z.string().email("Podaj poprawny adres e-mail"),
    password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków"),
    passwordConfirm: z.string().min(1, "Powtórz hasło"),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "Hasła nie są takie same",
    path: ["passwordConfirm"],
  });

const noFile = (files) => !files || files.length === 0;

export const ticketSchema = z.object({
  title: z
    .string()
    .min(3, "Tytuł jest za krótki (min. 3 znaki)")
    .max(120, "Tytuł może mieć maks. 120 znaków"),
  description: z
    .string()
    .min(10, "Opisz usterkę dokładniej (min. 10 znaków)")
    .max(2000, "Opis może mieć maks. 2000 znaków"),
  room: z
    .string()
    .trim()
    .min(1, "Wpisz numer lub nazwę sali")
    .max(50, "Nazwa sali może mieć maks. 50 znaków"),
  category: z.string().min(1, "Wybierz kategorię"),
  priority: z.string().min(1, "Wybierz priorytet"),
  photo: z
    .any()
    .refine((f) => noFile(f) || f[0].type.startsWith("image/"), "Dozwolone są tylko obrazy")
    .refine((f) => noFile(f) || f[0].size <= MAX_PHOTO_SIZE, "Zdjęcie może mieć maks. 5 MB"),
});