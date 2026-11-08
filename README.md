# Zgłoszenia usterek w szkole

Aplikacja webowa do zgłaszania usterek w szkole (np. niedziałający komputer, zepsuty rzutnik, cieknący kran). Użytkownik dodaje zgłoszenie ze zdjęciem i śledzi jego status, a technik widzi wszystkie zgłoszenia, filtruje je, zmienia status i dodaje komentarz.

- **Aplikacja (HTTPS):** https://xfalinski.online
- **Repozytorium:** https://github.com/Xawery9696/puszbarber

## Zrzuty ekranu

> UZUPEŁNIJ: wrzuć zrzuty do folderu `docs/` w repozytorium i zostaw poniższe odnośniki (albo popraw nazwy plików).

| Ekran | Zrzut |
|---|---|
| Logowanie i rejestracja | ![Logowanie](docs/logowanie.png) |
| Użytkownik: nowe zgłoszenie i lista własnych zgłoszeń | ![Użytkownik](docs/uzytkownik.png) |
| Technik: tabela wszystkich zgłoszeń z filtrami | ![Technik](docs/technik.png) |

## Technologie

- **Next.js** (App Router) w JavaScripcie
- **shadcn/ui** (komponenty interfejsu) + Tailwind CSS
- **react-hook-form** + **zod** (formularze i walidacja)
- **PocketBase** (baza danych, uwierzytelnianie, pliki), uruchomiony jako osobna usługa w Coolify
- **Coolify** na serwerze VPS (wdrożenie), kod w repozytorium na GitHubie

## Funkcje

**Użytkownik**
- rejestracja i logowanie (e-mail i hasło, PocketBase auth),
- dodanie zgłoszenia: tytuł, opis, sala (pole tekstowe), kategoria (sprzęt komputerowy, multimedia, instalacje, inne), priorytet (niski, średni, wysoki),
- dołączenie jednego zdjęcia usterki (maks. 5 MB, tylko obrazy),
- podgląd tylko własnych zgłoszeń wraz ze statusem i komentarzem technika.

**Technik**
- tabela wszystkich zgłoszeń,
- filtrowanie po statusie, sali i priorytecie,
- zmiana statusu (nowe, w realizacji, zamknięte) i dodanie komentarza,
- każda zmiana statusu zapisuje wpis w historii (kolekcja `zdarzenia`: kto, kiedy, z jakiego statusu na jaki).

**Walidacja:** formularze używają react-hook-form i zod, a błędy są wyświetlane po polsku pod polami.

## Role

Dwie role, zapisane w polu `role` kolekcji `users` (wartości `user` i `technik`). Pusta wartość oznacza zwykłego użytkownika. Rolę zmienia wyłącznie superużytkownik PocketBase w panelu administracyjnym (`/_/`). Reguły API blokują nadanie sobie roli przy rejestracji i edycji profilu.

## Model danych (PocketBase)

**`users`** (kolekcja auth): pola domyślne + `role` (Select: `user`, `technik`).

**`Zgloszenia`** (Base)

| Pole | Typ | Opis |
|---|---|---|
| `tytul` | Text | tytuł |
| `opis` | Text | opis usterki |
| `miejsce` | Text | sala |
| `Zdarzenie` | Text | kategoria (zapisywana jako nazwa, np. "Instalacje") |
| `priorytet` | Select | `niski`, `sredni`, `wysoki` |
| `status` | Select | `nowe`, `w realizacji`, `zamkniete` |
| `author` | Relation → `users` | autor zgłoszenia |
| `komentarz` | Text | komentarz technika |
| `zdjecie` | File | 1 plik, maks. 5 MB, tylko obrazy, **Protected** |

**`zdarzenia`** (Base): historia zmian statusu

| Pole | Typ | Opis |
|---|---|---|
| `ticket` | Relation → `Zgloszenia` | zgłoszenie |
| `aktor` | Relation → `users` | kto zmienił |
| `zstatus` | Select | status przed zmianą |
| `dostatus` | Select | status po zmianie |
| `stworzone` | Autodate | kiedy |

Nazwy kolekcji i pól są zebrane w jednym miejscu, w pliku `src/lib/constants.js`. Jeśli zmienisz nazwy w PocketBase, popraw je tylko tam.

### Reguły API (ochrona danych po stronie bazy)

Reguły chronią dane także przy ręcznym zapytaniu (curl, konsola przeglądarki).

**`Zgloszenia`**

| Reguła | Wartość |
|---|---|
| List/Search i View | `@request.auth.id != "" && (author = @request.auth.id \|\| @request.auth.role = "technik")` |
| Create | `@request.auth.id != "" && @request.body.author = @request.auth.id && @request.body.status = "nowe" && @request.body.komentarz:isset = false` |
| Update | `@request.auth.role = "technik"` oraz zakaz zmiany pól `tytul`, `opis`, `miejsce`, `Zdarzenie`, `priorytet`, `author`, `zdjecie` (dozwolone tylko `status` i `komentarz`) |
| Delete | zablokowana (tylko superużytkownik) |

**`zdarzenia`**

| Reguła | Wartość |
|---|---|
| List/Search i View | `@request.auth.id != "" && (ticket.author = @request.auth.id \|\| @request.auth.role = "technik")` |
| Create | `@request.auth.role = "technik" && @request.body.aktor = @request.auth.id` |
| Update i Delete | zablokowane |

**`users`**

| Reguła | Wartość |
|---|---|
| List/Search i View | `id = @request.auth.id \|\| @request.auth.role = "technik"` |
| Create | `@request.body.role:isset = false` |
| Update | `id = @request.auth.id && @request.body.role:isset = false` |
| Delete | zablokowana |

## Uruchomienie lokalnie

Wymagania: **Node.js** (wersja LTS), **Git** oraz działająca instancja PocketBase z kolekcjami opisanymi wyżej.

```bash
git clone https://github.com/Xawery9696/puszbarber.git
cd puszbarber
npm install
```

Utwórz plik `.env.local` w głównym folderze (wzór w `.env.example`):

```
NEXT_PUBLIC_POCKETBASE_URL=https://ADRES-POCKETBASE
```

Wpisz adres PocketBase bez końcowego ukośnika i bez `/_/`. Następnie:

```bash
npm run dev
```

Aplikacja działa pod `http://localhost:3000`. Budowanie produkcyjne: `npm run build`, a potem `npm start`.

## Wdrożenie w Coolify

Wszystko działa na jednym serwerze VPS (Ubuntu) zarządzanym przez Coolify.

### Usługi

| Usługa | Rodzaj w Coolify | Rola |
|---|---|---|
| Coolify | panel instalowany skryptem na VPS | zarządzanie wdrożeniami, proxy i certyfikatami HTTPS |
| PocketBase | gotowa usługa (Services) | baza danych, uwierzytelnianie, pliki; port wewnętrzny 8080 |
| Aplikacja `puszbarber` | Application z repozytorium GitHub | aplikacja Next.js (Build Pack: Railpack lub Nixpacks, port 3000) |

### Domeny

- Aplikacja: `https://xfalinski.online` (rekord A `@` w DNS wskazuje na adres IP serwera).
- Panel Coolify: `https://admin.xfalinski.online`.
- PocketBase: adres z `https://` ustawiony w zakładce **Domains** usługi. **Aplikacja działa pod HTTPS, więc adres PocketBase też musi być HTTPS**, inaczej przeglądarka zablokuje zapytania (mieszana zawartość).

### Zmienne środowiskowe (aplikacja)

| Zmienna | Wartość | Uwagi |
|---|---|---|
| `NEXT_PUBLIC_POCKETBASE_URL` | `https://ADRES-POCKETBASE` | zaznaczona jako **Build Variable**, bo zmienne `NEXT_PUBLIC_` są wstawiane do kodu w czasie budowania. Po każdej zmianie wymagany **Redeploy** |

W repozytorium nie ma haseł ani plików `.env`. Plik `.env.example` zawiera tylko nazwę zmiennej.

### Wolumeny

Usługa PocketBase ma trwały wolumen zamontowany na `/pb_data` (zakładka **Persistent Storage**). Dane i pliki nie znikają po restarcie ani przebudowie kontenera. Test: dodać rekord, zrestartować usługę i sprawdzić, że rekord nadal istnieje.

### Wdrożenie aktualizacji

1. `git push` na gałąź `main` w repozytorium GitHub.
2. W Coolify w aplikacji kliknąć **Redeploy** (wdrożenie jest ręczne).

## Konta testowe

> UZUPEŁNIJ hasła. Użyj haseł przeznaczonych tylko do testów (nie swoich prawdziwych) i przetestuj oba konta przed oddaniem.

| Rola | E-mail | Hasło |
|---|---|---|
| Użytkownik | `user@gmail.com` | UZUPEŁNIJ |
| Technik | UZUPEŁNIJ (np. `technik@example.com`) | UZUPEŁNIJ |

Konto technika to zwykłe konto zarejestrowane w aplikacji, któremu superużytkownik w panelu PocketBase (`/_/` → kolekcja `users` → rekord → pole `role` = `technik`) nadał rolę. Po zmianie roli należy się wylogować i zalogować ponownie.

## Struktura projektu

```
src/
├── app/
│   ├── layout.js          nagłówek, menu, kontekst logowania
│   ├── page.js            przekierowanie według roli
│   ├── login/             logowanie
│   ├── register/          rejestracja
│   ├── moje/              użytkownik: formularz i lista własnych zgłoszeń
│   └── technik/           technik: tabela, filtry, zmiana statusu
├── components/ui/         komponenty shadcn/ui
└── lib/
    ├── auth.jsx           stan zalogowanego użytkownika, obsługa błędów
    ├── constants.js       nazwy kolekcji i pól, listy wartości
    ├── files.js           adresy zdjęć (token dla plików chronionych)
    ├── pocketbase.js      klient PocketBase (adres ze zmiennej środowiskowej)
    └── schemas.js         schematy walidacji zod
```

## Zakres i ograniczenia

Zrealizowano poziom podstawowy oraz historię zmian statusu w osobnej kolekcji. Nie zrealizowano jeszcze: odświeżania listy technika w czasie rzeczywistym (realtime), dashboardu technika oraz przełącznika trybu jasnego i ciemnego.