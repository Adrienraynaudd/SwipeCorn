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
│   ├── (private)/                    # Groupe de routes protégées
│   │   ├── layout.tsx                # Vérifie la session + affiche la NavBar
│   │   ├── setup/                    # Onboarding : sélection de 3 films favoris
│   │   │   ├── page.tsx
│   │   │   ├── SetupForm.tsx         # Recherche TMDB + sélection (client)
│   │   │   ├── loading.tsx
│   │   │   └── actions.ts            # saveOnboardingMovies
│   │   ├── swipe/                    # Pile de recommandations
│   │   │   ├── page.tsx              # RSC : fetch watchlist + swipes → stack TMDB
│   │   │   ├── SwipeDeck.tsx         # Client : gestes drag, refill, trailer
│   │   │   ├── loading.tsx
│   │   │   └── actions.ts            # saveSwipe
│   │   ├── watchlist/                # Films likés
│   │   │   ├── page.tsx
│   │   │   ├── WatchlistGrid.tsx     # RSC : fetch + liste des affiches
│   │   │   ├── loading.tsx
│   │   │   ├── actions.ts            # removeFromWatchlist, moveToDislike
│   │   │   └── [tmdbId]/             # Détail d'un film de la watchlist
│   │   │       ├── page.tsx
│   │   │       └── loading.tsx
│   │   └── dislikes/                 # Films ignorés (swipe gauche)
│   │       ├── page.tsx
│   │       ├── DislikeGrid.tsx       # RSC : fetch + liste des affiches
│   │       ├── loading.tsx
│   │       ├── actions.ts            # removeFromDislikes, moveToWatchlist
│   │       └── [tmdbId]/             # Détail d'un film ignoré
│   │           ├── page.tsx
│   │           └── loading.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/       # Handler next-auth (GET + POST)
│   │   └── movies/
│   │       ├── search/               # Proxy TMDB pour le client (cache 60 s)
│   │       ├── refill/               # Nouvelles cartes quand la pile est basse
│   │       └── trailer/              # Lien YouTube de la bande-annonce
│   ├── login/
│   │   ├── page.tsx
│   │   ├── AuthForm.tsx              # Formulaire login / register (client)
│   │   └── actions.ts                # loginAction, registerAction
│   ├── actions.ts                    # logout
│   ├── layout.tsx                    # Root layout (HTML, Geist font, fond zinc-950)
│   ├── loading.tsx
│   ├── error.tsx
│   ├── not-found.tsx
│   └── page.tsx                      # Landing page publique
├── auth.config.ts                    # Config next-auth edge-safe (sans Prisma)
├── proxy.ts                          # Remplace middleware.ts (Next.js 16)
├── components/
│   ├── MovieCard.tsx                 # Carte film : poster, titre, note, synopsis
│   ├── MovieDetailLayout.tsx         # Layout page détail (backdrop, infos, actions)
│   ├── FilterableGrid.tsx            # Grille filtrée côté client
│   └── NavBar.tsx                    # Navigation bas de page (Swipe / Watchlist / Dislikes)
└── lib/
    ├── auth.ts                       # Config next-auth complète (Prisma + bcrypt)
    ├── db.ts                         # Singleton PrismaClient
    ├── tmdb.ts                       # searchMovies, getRecommendationStack, getMovieDetails…
    └── validation.ts                 # Schémas Zod partagés
```

### Points notables

- **Split config** — `auth.config.ts` est importé par `proxy.ts` (runtime Edge, sans Prisma). `lib/auth.ts` est utilisé uniquement dans les Server Components et Server Actions (runtime Node.js).
- **proxy.ts** — remplace `middleware.ts`, renommé dans Next.js 16. Il lit le cookie JWT sans appeler la base de données.
- **Exclusion des doublons** — au chargement de `/swipe`, la page construit un `Set` des `tmdbId` déjà swipés et de la watchlist, puis filtre les recommandations TMDB en conséquence. Un film déjà traité ne réapparaît jamais.
- **Réapprovisionnement dynamique** — `SwipeDeck` détecte quand il reste ≤ 10 cartes et appelle le Route Handler `/api/movies/refill` en arrière-plan, sans interruption visible pour l'utilisateur.
- **Server Actions** pour toutes les mutations : connexion, inscription, onboarding, swipe, watchlist, dislikes, déconnexion. Chaque action appelle `revalidatePath()` avant `redirect()` pour invalider le cache immédiatement.
- **Stratégie de cache TMDB**

  | Fonction | Type | Durée | Tags | Justification |
  |---|---|---|---|---|
  | `getMovieDetails` | ISR — `next: { revalidate }` | 3 600 s (1 h) | — | Les métadonnées d'un film (titre, genres, synopsis) sont quasi-statiques ; 1 h évite les appels redondants sans risquer de données périmées. |
  | `getRecommendations` | ISR — `next: { revalidate }` | 3 600 s (1 h) | — | Les recommandations TMDB évoluent lentement ; le cache long préserve le quota API. |
  | `getPopularMovies` | ISR — `next: { revalidate }` | 3 600 s (1 h) | — | Le classement des films populaires ne change pas plus d'une fois par heure. |
  | `discoverMoviesByGenre` | ISR — `next: { revalidate }` | 3 600 s (1 h) | — | Données éditoriales stables ; durée longue pour limiter les appels TMDB lors du calcul de la pile. |
  | `getTrailer` | ISR — `next: { revalidate }` | 3 600 s (1 h) | — | Un lien YouTube de bande-annonce ne change pas ; cache long approprié. |
  | `searchMovies` | ISR — `next: { revalidate }` | 60 s (1 min) | — | Les résultats de recherche doivent rester frais pour refléter les nouvelles sorties ; durée courte intentionnelle. |

  **Type :** ISR (Incremental Static Regeneration) via `next: { revalidate: N }`. Next.js met la réponse `fetch` en cache côté serveur et la revalide en arrière-plan après expiration — aucune requête TMDB pendant la fenêtre de cache.

  **Tags :** non utilisés. La revalidation est pilotée par expiration temporelle. Des tags (`next: { tags: ["movie-details"] }`) seraient pertinents pour invalider sélectivement après une mutation sur une base de films propre, ce qui ne s'applique pas ici (source externe TMDB en lecture seule).

  **Revalidation après mutation :** les Server Actions appellent `revalidatePath()` avant `redirect()` pour invalider immédiatement les pages affectées (ex. `revalidatePath("/watchlist")` après ajout ou suppression d'un film).

---

## Flux utilisateur

```
/                   → landing page + bouton "Commencer"
/login              → connexion (email + mot de passe)
                       ou inscription (prénom + email + mot de passe ≥ 8 car.)
/setup              → recherche et sélection de 3 films favoris
/swipe              → pile de recommandations personnalisées (swipe gauche / droite)
/watchlist          → liste des films likés (swipe droite)
/watchlist/[id]     → détail d'un film de la watchlist
/dislikes           → liste des films ignorés (swipe gauche)
/dislikes/[id]      → détail d'un film ignoré
```

L'inscription crée le compte, hache le mot de passe, et connecte l'utilisateur automatiquement avec redirection vers `/setup`. Depuis `/watchlist` et `/dislikes`, l'utilisateur peut déplacer un film d'une liste à l'autre ou le supprimer.

---

## API Routes

| Méthode | Route | Description |
|---|---|---|
| `GET` `POST` | `/api/auth/[...nextauth]` | Handlers next-auth (session JWT, CSRF) |
| `GET` | `/api/movies/search?q=...` | Recherche TMDB — résultats mis en cache 60 s |
| `POST` | `/api/movies/refill` | Nouvelles cartes quand la pile ≤ 10 — exclut les films déjà vus |
| `GET` | `/api/movies/trailer?id=...` | Lien YouTube de la bande-annonce (cache 1 h) |

---

## User Stories

| # | Intitulé | Statut |
|---|---|---|
| US1 | Authentification email / mot de passe (connexion + inscription + déconnexion) | ✅ |
| US2 | Onboarding : recherche et sélection de 3 films favoris | ✅ |
| US3 | Affichage des cartes films (poster, titre, note, synopsis) | ✅ |
| US4 | Lien vers la bande-annonce au clic sur une carte | ✅ |
| US5 | Gestes de swipe gauche / droite | ✅ |
| US6 | Exclusion des films déjà swipés de la pile | ✅ |
| US7 | Rechargement dynamique quand il reste ≤ 10 cartes | ✅ |
| US8 | Page Watchlist + Dislikes : liste et détail des films | ✅ |
| US9 | Optimisations `next/image` (affiches) et `next/font` (Geist) | ✅ |
