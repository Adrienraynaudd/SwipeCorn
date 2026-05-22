# 🍿 SwipeCorn

Application web de découverte de films inspirée de Tinder. L'utilisateur constitue une liste de films favoris lors de l'onboarding ; l'application génère ensuite une pile de recommandations personnalisées qu'il peut liker ou ignorer.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 16.2.4 — App Router |
| UI | React 19, Tailwind CSS v4 |
| Langage | TypeScript 5 |
| Authentification | next-auth v5 (beta) — credentials uniquement, stratégie JWT |
| ORM | Prisma v5 |
| Base de données | SQLite |
| Hachage mot de passe | bcryptjs |
| API films | TMDB (The Movie Database) |
| Police | Geist via `next/font` |

---

## Prérequis

- Node.js 20+
- Compte [TMDB](https://www.themoviedb.org/) pour obtenir une clé API gratuite

---

## Installation

### 1. Cloner et installer les dépendances

```bash
git clone <url-du-repo>
cd SwipeCorn
npm install
```

### 2. Variables d'environnement

```bash
cp .env.example .env.local
```

Remplis `.env.local` :

```env
# Clé secrète JWT — génère avec : openssl rand -base64 32
AUTH_SECRET=une_chaine_aleatoire_longue

# Base de données SQLite
DATABASE_URL="file:./prisma/dev.db"

# Clé API TMDB (https://www.themoviedb.org/settings/api)
TMDB_API_KEY=ta_cle_tmdb
```

### 3. Base de données

> **Windows** : arrête le serveur de développement avant de lancer ces commandes.
> Le fichier `query_engine-windows.dll.node` est verrouillé par le process Node.

```bash
npx prisma db push      # Crée le fichier SQLite et applique le schéma
npx prisma generate     # Génère le client TypeScript
```

### 4. Lancer le serveur

```bash
npm run dev             # http://localhost:3000
```

---

## Scripts

```bash
npm run dev       # Serveur de développement
npm run build     # Build de production
npm run start     # Serveur de production
npm run lint      # ESLint
```

```bash
npx prisma studio          # Interface graphique pour inspecter la base
npx prisma db push         # Applique le schéma sans créer de migration
npx prisma generate        # Régénère le client après modification du schéma
```

---

## Modèle de données

```prisma
model User {
  id        String           @id @default(cuid())
  name      String
  email     String           @unique
  password  String           # Haché avec bcryptjs, 10 rounds
  watchlist WatchlistEntry[]
  swipes    Swipe[]
}

model WatchlistEntry {
  id        String   @id @default(cuid())
  userId    String
  tmdbId    Int                       # ID du film sur TMDB
  title     String
  poster    String?
  createdAt DateTime @default(now())
  @@unique([userId, tmdbId])          # Un film une seule fois par utilisateur
}

model Swipe {
  id        String   @id @default(cuid())
  userId    String
  tmdbId    Int
  liked     Boolean                   # true = like, false = dislike
  createdAt DateTime @default(now())
  @@unique([userId, tmdbId])          # Un seul swipe par film par utilisateur
}
```

---

## Architecture du projet

```
src/
├── app/
│   ├── (private)/                # Groupe de routes protégées
│   │   ├── layout.tsx            # Vérifie la session + affiche la NavBar
│   │   ├── setup/                # Onboarding : sélection de 3 films favoris
│   │   │   ├── page.tsx
│   │   │   ├── SetupForm.tsx     # Recherche TMDB + sélection (client)
│   │   │   └── actions.ts        # saveOnboardingMovies (server action)
│   │   ├── swipe/                # Pile de recommandations
│   │   │   ├── page.tsx          # Fetch watchlist + swipes → stack TMDB
│   │   │   └── loading.tsx       # Skeleton pendant le chargement
│   │   └── watchlist/            # Films likés (à venir)
│   ├── api/
│   │   ├── auth/[...nextauth]/   # Handler next-auth (GET + POST)
│   │   └── movies/search/        # Proxy TMDB pour le client
│   ├── login/
│   │   ├── page.tsx
│   │   ├── AuthForm.tsx          # Formulaire login / register (client)
│   │   └── actions.ts            # loginAction, registerAction
│   ├── layout.tsx                # Root layout (HTML, font, fond zinc-950)
│   └── page.tsx                  # Landing page publique
├── auth.config.ts                # Config next-auth edge-safe (sans Prisma)
├── proxy.ts                      # Remplace middleware.ts (Next.js 16)
├── components/
│   ├── MovieCard.tsx             # Carte film : poster, titre, note, synopsis
│   └── NavBar.tsx                # Navigation bas de page (Swipe / Watchlist)
└── lib/
    ├── auth.ts                   # Config next-auth complète (Prisma + bcrypt)
    ├── db.ts                     # Singleton PrismaClient
    └── tmdb.ts                   # searchMovies, getRecommendations, getInitialStack
```

### Points notables

- **Split config** — `auth.config.ts` est importé par `proxy.ts` (runtime Edge, sans Prisma). `lib/auth.ts` est utilisé uniquement dans les Server Components et Server Actions (runtime Node.js).
- **proxy.ts** — remplace `middleware.ts`, renommé dans Next.js 16. Il lit le cookie JWT sans appeler la base de données.
- **Exclusion des doublons** — au chargement de `/swipe`, la page construit un `Set` des `tmdbId` déjà swipés et de la watchlist, puis filtre les recommandations TMDB en conséquence. Un film déjà traité ne réapparaît jamais.
- **Server Actions** pour toutes les mutations : connexion, inscription, onboarding.
- **Cache TMDB** — `getRecommendations` et `getMovieDetails` utilisent `next: { revalidate: 3600 }` ; `searchMovies` utilise `revalidate: 60`.

---

## Flux utilisateur

```
/           → landing page + bouton "Commencer"
/login      → connexion (email + mot de passe)
             ou inscription (prénom + email + mot de passe ≥ 8 car.)
/setup      → recherche et sélection de 3 films favoris
/swipe      → pile de recommandations personnalisées
/watchlist  → films likés (non implémenté)
```

L'inscription crée le compte, hache le mot de passe, et connecte l'utilisateur automatiquement avec redirection vers `/setup`.

---

## API Routes

| Méthode | Route | Description |
|---|---|---|
| `GET` `POST` | `/api/auth/[...nextauth]` | Handlers next-auth (session JWT, CSRF) |
| `GET` | `/api/movies/search?q=...` | Recherche TMDB — résultats mis en cache 60 s |

---

## User Stories

| # | Intitulé | Statut |
|---|---|---|
| US1 | Authentification email / mot de passe (connexion + inscription) | ✅ |
| US2 | Onboarding : recherche et sélection de 3 films favoris | ✅ |
| US3 | Affichage des cartes films (poster, titre, note, synopsis) | ✅ |
| US4 | Lien vers la bande-annonce au clic sur une carte | ⬜ |
| US5 | Gestes de swipe gauche / droite | ⬜ |
| US6 | Exclusion des films déjà swipés de la pile | ⬜ |
| US7 | Rechargement dynamique quand il reste 3 cartes | ⬜ |
| US8 | Page Watchlist : liste des films likés | ⬜ |
| US9 | Optimisations images et polices | ⬜ |
