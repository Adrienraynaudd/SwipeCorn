# 🍿 SwipeCorn

Application web de découverte de films inspirée de Tinder. Swipe à droite pour ajouter un film à ta watchlist, à gauche pour passer. Les recommandations sont personnalisées à partir de tes films préférés.

---

## Stack technique

| Catégorie | Technologie |
|---|---|
| Framework | Next.js 16.2.4 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Langage | TypeScript 5 |
| Auth | next-auth v5 (beta) — credentials uniquement, JWT |
| ORM | Prisma v5 |
| Base de données | SQLite (dev) |
| Hachage | bcryptjs |
| API films | TMDB (The Movie Database) |
| Police | Geist (Google Fonts via next/font) |

---

## Architecture

```
src/
├── app/
│   ├── (private)/               # Routes protégées (auth guard dans le layout)
│   │   ├── layout.tsx           # Vérifie la session + barre de nav
│   │   ├── setup/               # Onboarding : choix des 3 films favoris
│   │   ├── swipe/               # Page principale de swipe
│   │   └── watchlist/           # Films sauvegardés (à venir)
│   ├── api/
│   │   ├── auth/[...nextauth]/  # Handler next-auth
│   │   └── movies/search/       # Proxy TMDB pour le client
│   ├── login/                   # Page connexion / inscription
│   └── page.tsx                 # Landing page publique
├── auth.config.ts               # Config next-auth edge-safe (sans Prisma)
├── proxy.ts                     # Remplace middleware.ts (Next.js 16)
├── components/
│   ├── MovieCard.tsx            # Carte film (poster, titre, note, synopsis)
│   └── NavBar.tsx               # Navigation bas de page
└── lib/
    ├── auth.ts                  # Config next-auth complète (avec Prisma + bcrypt)
    ├── db.ts                    # Singleton Prisma
    └── tmdb.ts                  # Helpers TMDB (search, recommandations, stack)
```

### Points d'architecture notables

- **Split config** : `auth.config.ts` (edge-safe, pas d'import Prisma) est utilisé par `proxy.ts`. `lib/auth.ts` (avec Prisma) est utilisé uniquement côté serveur Node.js.
- **proxy.ts** remplace `middleware.ts`, renommé dans Next.js 16 ; il tourne en runtime Node.js (pas Edge) pour pouvoir lire les cookies JWT.
- **Server Actions** pour toutes les mutations (connexion, inscription, onboarding, swipe).
- Les recommandations TMDB sont filtrées côté serveur : les films déjà swipés ou en watchlist ne sont jamais renvoyés.

---

## Modèle de données

```prisma
model User {
  id        String           @id @default(cuid())
  name      String
  email     String           @unique
  password  String           # Haché avec bcryptjs (10 rounds)
  watchlist WatchlistEntry[]
  swipes    Swipe[]
}

model WatchlistEntry {
  id        String   @id @default(cuid())
  userId    String
  tmdbId    Int                      # ID TMDB du film
  title     String
  poster    String?
  user      User     @relation(...)
  createdAt DateTime @default(now())
  @@unique([userId, tmdbId])
}

model Swipe {
  id        String   @id @default(cuid())
  userId    String
  tmdbId    Int
  liked     Boolean                  # true = like, false = dislike
  user      User     @relation(...)
  createdAt DateTime @default(now())
  @@unique([userId, tmdbId])         # Un seul swipe par film par utilisateur
}
```

---

## Installation

### Prérequis

- Node.js 20+
- Un compte [TMDB](https://www.themoviedb.org/) pour obtenir une clé API

### 1. Cloner et installer

```bash
git clone <url-du-repo>
cd SwipeCorn
npm install
```

### 2. Variables d'environnement

Copie le fichier exemple et remplis les valeurs :

```bash
cp .env.example .env.local
```

```env
# .env.local

# Clé secrète pour chiffrer les sessions JWT (génère avec : openssl rand -base64 32)
AUTH_SECRET=ta_clé_secrète_aléatoire

# Chemin vers la base SQLite
DATABASE_URL="file:./dev.db"

# Clé API TMDB (https://www.themoviedb.org/settings/api)
TMDB_API_KEY=ta_clé_tmdb
```

### 3. Base de données

```bash
npx prisma db push      # Crée le fichier SQLite et applique le schéma
npx prisma generate     # Génère le client Prisma typé
```

> **Windows** : si le serveur de dev tourne, le fichier `query_engine-windows.dll.node` est verrouillé. Arrête le serveur avant de lancer ces commandes.

### 4. Lancer le serveur de développement

```bash
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

---

## Flux utilisateur

```
/                   Landing page
  └── /login        Connexion ou inscription (email + mot de passe)
        └── /setup  Onboarding : recherche et sélection de 3 films favoris
              └── /swipe  Pile de films recommandés
                    └── /watchlist  Films likés (sauvegardés)
```

1. **Landing** — présentation de l'app + bouton "Commencer".
2. **Login / Register** — formulaire unique avec toggle. Inscription crée le compte, hache le mot de passe, et connecte automatiquement.
3. **Setup** — recherche TMDB en temps réel, sélection de 3 films. Les films sont sauvegardés en watchlist et servent de graine pour les recommandations.
4. **Swipe** — pile de cartes générée à partir des recommandations TMDB de la watchlist. Bouton ✕ (dislike) ou ♥ (like) — chaque action est enregistrée en base et le film n'apparaît plus jamais.

---

## User Stories

| # | Intitulé | Statut |
|---|---|---|
| US1 | Authentification email / mot de passe | ✅ Fait |
| US2 | Onboarding : sélection de 3 films favoris | ✅ Fait |
| US3 | Affichage des cartes films (poster, titre, note, synopsis) | ✅ Fait |
| US4 | Lien vers la bande-annonce au clic sur la carte | ⬜ À faire |
| US5 | Gestes de swipe (glisser gauche / droite) | ⬜ À faire |
| US6 | Exclusion des doublons (films déjà swipés) | ✅ Fait |
| US7 | Rechargement dynamique de la pile à 3 cartes restantes | ⬜ À faire |
| US8 | Page Watchlist (liste des films likés) | ⬜ À faire |
| US9 | Optimisations images et polices | ⬜ À faire |

---

## API Routes

| Méthode | Route | Description |
|---|---|---|
| `GET` `POST` | `/api/auth/[...nextauth]` | Handlers next-auth (session, CSRF) |
| `GET` | `/api/movies/search?q=...` | Recherche de films via TMDB (proxy serveur) |

---

## Scripts

```bash
npm run dev      # Serveur de développement (http://localhost:3000)
npm run build    # Build de production
npm run start    # Serveur de production
npm run lint     # ESLint
```

```bash
npx prisma studio          # Interface graphique pour la base de données
npx prisma db push         # Applique le schéma sans migration
npx prisma generate        # Regénère le client TypeScript
```
