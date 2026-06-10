# SwipeCorn

Application web de découverte de films inspirée de Tinder. L'utilisateur constitue une liste de films favoris lors de l'onboarding ; l'application génère ensuite une pile de recommandations personnalisées qu'il peut liker ou ignorer.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 16.2.4 — App Router |
| UI | React 19, Tailwind CSS v4 |
| Langage | TypeScript 5 |
| Authentification | next-auth v5 (beta) — credentials + GitHub OAuth, stratégie JWT |
| ORM | Prisma v5 |
| Base de données | SQLite |
| Hachage mot de passe | bcryptjs |
| API films | TMDB (The Movie Database) |
| Validation | Zod v4 |
| Police | Geist via `next/font` |

---

## Prérequis

- Node.js 20+
- Compte [TMDB](https://www.themoviedb.org/) pour obtenir une clé API gratuite
- (Optionnel) OAuth App GitHub pour la connexion via GitHub

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

# GitHub OAuth (optionnel — https://github.com/settings/developers)
GITHUB_ID=ton_client_id_github
GITHUB_SECRET=ton_client_secret_github
```

### 3. Base de données

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
  password  String?          # Nullable — absent pour les comptes GitHub OAuth
  accounts  Account[]
  watchlist WatchlistEntry[]
  swipes    Swipe[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  # ... champs OAuth standards (refresh_token, access_token, etc.)
  @@unique([provider, providerAccountId])
}

model WatchlistEntry {
  id        String   @id @default(cuid())
  userId    String
  tmdbId    Int
  title     String
  poster    String?
  createdAt DateTime @default(now())
  @@unique([userId, tmdbId])
}

model Swipe {
  id        String   @id @default(cuid())
  userId    String
  tmdbId    Int
  liked     Boolean                   # true = like, false = dislike
  createdAt DateTime @default(now())
  @@unique([userId, tmdbId])
}
```

---

## Architecture du projet

```
src/
├── app/
│   ├── (private)/                # Groupe de routes protégées (session requise)
│   │   ├── layout.tsx            # Vérifie la session + affiche la NavBar
│   │   ├── loading.tsx           # Skeleton du layout privé
│   │   ├── setup/                # Onboarding : sélection de 3 films favoris
│   │   │   ├── page.tsx
│   │   │   ├── SetupForm.tsx     # Recherche TMDB + sélection (client)
│   │   │   ├── actions.ts        # saveOnboardingMovies (server action)
│   │   │   └── loading.tsx
│   │   ├── swipe/                # Pile de recommandations
│   │   │   ├── page.tsx          # Fetch watchlist + swipes → stack TMDB
│   │   │   ├── SwipeDeck.tsx     # Gestes pointer, overlay LIKE/PASS, refill auto
│   │   │   ├── actions.ts        # saveSwipe (server action)
│   │   │   └── loading.tsx
│   │   ├── watchlist/            # Films likés
│   │   │   ├── page.tsx
│   │   │   ├── WatchlistGrid.tsx # Grille filtrable des films likés
│   │   │   ├── actions.ts        # removeFromWatchlist, moveToDislike
│   │   │   ├── loading.tsx
│   │   │   └── [tmdbId]/         # Page de détail
│   │   │       ├── page.tsx      # Détail film + actions (retirer / déplacer en dislike)
│   │   │       └── loading.tsx
│   │   └── dislikes/             # Films passés
│   │       ├── page.tsx
│   │       ├── DislikeGrid.tsx   # Grille filtrable des films dislikés
│   │       ├── actions.ts        # removeFromDislikes, moveToWatchlist
│   │       ├── loading.tsx
│   │       └── [tmdbId]/         # Page de détail
│   │           ├── page.tsx      # Détail film + actions (retirer / déplacer en watchlist)
│   │           └── loading.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/   # Handler next-auth (GET + POST)
│   │   └── movies/
│   │       ├── search/           # Proxy TMDB pour la recherche (client)
│   │       ├── trailer/          # Redirect YouTube via TMDB
│   │       └── refill/           # Recharge la pile de swipe (POST)
│   ├── login/
│   │   ├── page.tsx
│   │   ├── AuthForm.tsx          # Formulaire login / register + bouton GitHub
│   │   └── actions.ts            # loginAction, registerAction
│   ├── actions.ts                # signOutAction
│   ├── error.tsx                 # Boundary d'erreur global
│   ├── not-found.tsx             # Page 404
│   ├── loading.tsx
│   ├── layout.tsx                # Root layout (HTML, font, fond zinc-950)
│   └── page.tsx                  # Landing page publique
├── auth.config.ts                # Config next-auth edge-safe (sans Prisma)
├── middleware.ts                 # Protège les routes privées (runtime Edge)
├── components/
│   ├── FilterableGrid.tsx        # Grille avec champ de recherche côté client
│   ├── MovieCard.tsx             # Carte film : poster, titre, note, synopsis
│   ├── MovieDetailLayout.tsx     # Layout partagé pour les pages de détail
│   ├── MovieDetailSkeleton.tsx   # Skeleton de la page de détail
│   ├── MovieGridSkeleton.tsx     # Skeleton de la grille
│   └── NavBar.tsx                # Navigation bas de page (Swipe / Watchlist / Dislikes)
└── lib/
    ├── auth.ts                   # Config next-auth complète (Prisma + bcrypt + GitHub)
    ├── db.ts                     # Singleton PrismaClient
    ├── tmdb.ts                   # searchMovies, getRecommendations, getInitialStack, getTrailer
    └── validation.ts             # Schémas Zod partagés
```

### Points notables

- **Split config** — `auth.config.ts` est importé par `middleware.ts` (runtime Edge, sans Prisma). `lib/auth.ts` est utilisé uniquement dans les Server Components et Server Actions (runtime Node.js).
- **GitHub OAuth** — le `PrismaAdapter` est patché pour ignorer les champs `image` et `emailVerified` absents du schéma. Le mot de passe est nullable pour les comptes OAuth.
- **Gestes swipe** — `SwipeDeck.tsx` utilise les Pointer Events (`setPointerCapture`) pour un drag fluide souris et touch. Un tap (déplacement < 12 px) ouvre la bande-annonce YouTube.
- **Refill automatique** — quand la pile descend sous 10 cartes, un appel `POST /api/movies/refill` charge de nouveaux films en arrière-plan sans bloquer l'UI.
- **Exclusion des doublons** — la pile est construite côté serveur en excluant les `tmdbId` déjà dans la watchlist ou les swipes. Côté client, le refill filtre aussi les IDs déjà présents dans le state local.
- **Pages de détail film** — accessibles depuis la watchlist (`/watchlist/[tmdbId]`) et les dislikes (`/dislikes/[tmdbId]`), avec actions croisées (déplacer d'une liste à l'autre).
- **Server Actions** pour toutes les mutations : connexion, inscription, onboarding, swipe, gestion des listes.
- **Cache TMDB** — `getRecommendations` et `getMovieDetails` utilisent `next: { revalidate: 3600 }` ; `searchMovies` utilise `revalidate: 60`.

---

## Flux utilisateur

```
/           → landing page + bouton "Commencer"
/login      → connexion (email + mot de passe, ou GitHub OAuth)
             ou inscription (prénom + email + mot de passe ≥ 8 car.)
/setup      → recherche et sélection de 3 films favoris
/swipe      → pile de recommandations (swipe ou boutons Like/Pass)
              clic sur une carte → bande-annonce YouTube
/watchlist  → grille des films likés + recherche par titre
/watchlist/[tmdbId] → détail : retirer ou déplacer en dislike
/dislikes   → grille des films passés + recherche par titre
/dislikes/[tmdbId]  → détail : retirer ou déplacer en watchlist
```

L'inscription crée le compte, hache le mot de passe, et connecte l'utilisateur automatiquement avec redirection vers `/setup`.

---

## API Routes

| Méthode | Route | Description |
|---|---|---|
| `GET` `POST` | `/api/auth/[...nextauth]` | Handlers next-auth (session JWT, CSRF, OAuth callbacks) |
| `GET` | `/api/movies/search?q=...` | Recherche TMDB — résultats mis en cache 60 s |
| `GET` | `/api/movies/trailer?tmdbId=...` | Redirige vers la bande-annonce YouTube via TMDB |
| `POST` | `/api/movies/refill` | Recharge la pile de swipe (body : `{ excludeIds: number[] }`) |

---

## User Stories

| # | Intitulé | Statut |
|---|---|---|
| US1 | Authentification email / mot de passe (connexion + inscription) | ✅ |
| US2 | Connexion via GitHub OAuth | ✅ |
| US3 | Onboarding : recherche et sélection de 3 films favoris | ✅ |
| US4 | Affichage des cartes films (poster, titre, note, synopsis) | ✅ |
| US5 | Gestes de swipe gauche / droite (souris et touch) | ✅ |
| US6 | Clic sur une carte → bande-annonce YouTube | ✅ |
| US7 | Exclusion des films déjà swipés de la pile | ✅ |
| US8 | Rechargement dynamique quand il reste ≤ 10 cartes | ✅ |
| US9 | Page Watchlist : grille des films likés + recherche | ✅ |
| US10 | Page Dislikes : grille des films passés + recherche | ✅ |
| US11 | Pages de détail film avec actions croisées entre listes | ✅ |
| US12 | Optimisations images et polices | ⬜ |
