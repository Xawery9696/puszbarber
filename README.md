# Zgłoszenia usterek w szkole

Aplikacja do zgłaszania usterek w szkole. Użytkownik dodaje zgłoszenie (opcjonalnie ze zdjęciem) i widzi tylko swoje zgłoszenia. Technik widzi wszystkie, filtruje je, zmienia status i dodaje komentarz.

- Aplikacja: https://xfalinski.online
- Repozytorium: https://github.com/Xawery9696/puszbarber

**Technologie:** Next.js (App Router, JavaScript), shadcn/ui, react-hook-form + zod, PocketBase, Coolify.

## Zrzuty ekranu

![Logowanie](docs/logowanie.png)
![Użytkownik](docs/uzytkownik.png)
![Technik](docs/technik.png)

## Role i dostęp

Rola jest polem `role` w kolekcji `users` (`user` albo `technik`) i zmienia ją tylko superużytkownik w panelu PocketBase. Dostęp do danych chronią reguły API w PocketBase (a nie tylko interfejs): użytkownik widzi tylko własne zgłoszenia, a status i komentarz może zmieniać tylko technik. Zmiany statusu zapisują się w kolekcji `zdarzenia`.

## Uruchomienie lokalnie

Potrzebne: Node.js (LTS), Git i działający PocketBase.

```bash
git clone https://github.com/Xawery9696/puszbarber.git
cd puszbarber
npm install
```

Utwórz plik `.env.local` (wzór w `.env.example`):

```
NEXT_PUBLIC_POCKETBASE_URL=https://ADRES-POCKETBASE
```

```bash
npm run dev
```

Aplikacja działa pod `http://localhost:3000`.

## Wdrożenie w Coolify

**Usługi** (jeden serwer VPS z Ubuntu):
- Coolify: panel i proxy z certyfikatami HTTPS (`https://admin.xfalinski.online`),
- PocketBase: osobna usługa (Services), baza danych i logowanie,
- aplikacja `puszbarber`: Application z repozytorium GitHub (Railpack, port 3000), domena `https://xfalinski.online`.

**Zmienna środowiskowa** (aplikacja, zaznaczona jako *Build Variable*, bo `NEXT_PUBLIC_` jest wstawiane podczas budowania):

| Zmienna | Wartość |
|---|---|
| `NEXT_PUBLIC_POCKETBASE_URL` | `https://pocketbase-afkbqaxpumzawqjn9pnsiutk.15.235.126.148.sslip.io`  |

**Wolumen:** usługa PocketBase ma trwały wolumen na `/pb_data`, więc restart kontenera nie kasuje danych.

**Aktualizacja:** `git push` na `main`, potem *Redeploy* w Coolify.

## Konta testowe

| Rola | E-mail | Hasło |
|---|---|---|
| Użytkownik | `user@gmail.com` | `useruser` |
| Technik | `technik@gmail.com` | `techniktechnik` |