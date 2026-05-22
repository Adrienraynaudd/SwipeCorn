# SwipeCorn

> Application qui apprend tes goûts en direct : tu swipes des films (gauche/droite) et l'algorithme adapte instantanément les propositions pour te trouver le film parfait à regarder.

---

## Les 6 contraintes techniques

### 1. Layouts imbriqués

Deux groupes de routes distincts :

- **Zone publique** — page d'accueil et connexion, layout minimal.
- **Zone privée** (`/swipe`, `/watchlist`) — layout imbriqué avec une barre de navigation mobile persistante, absente de la zone publique.

### 2. Data fetching serveur

Au chargement, un Server Component interroge la base de données pour récupérer les ID des films de la Watchlist de l'utilisateur, puis effectue un appel groupé à l'API TMDB pour générer une pile initiale de recommandations ciblées.

### 3. Server Action

La page `/setup` contient un formulaire de recherche. L'utilisateur sélectionne 3 films fondateurs. La soumission appelle une Server Action qui enregistre ces films en base de données, puis exécute un `redirect('/swipe')`.

### 4. Route Handler

Quand le composant client détecte qu'il ne reste que 3 cartes, il appelle un Route Handler en arrière-plan. Celui-ci récupère les derniers films swipés à droite, interroge TMDB pour trouver des films similaires, filtre les doublons, et renvoie les nouvelles cartes en JSON.

### 5. Authentification next-auth

Via NextAuth.js, chaque utilisateur possède son propre profil lié à ses données en base. La pile de recommandations est 100 % unique : elle se base exclusivement sur la Watchlist et les swipes passés de l'utilisateur.

### 6. Optimisations mesurables

- **Images** — `next/image` pour toutes les affiches, domaine TMDB autorisé dans `next.config`, lazy-loading natif, redimensionnement automatique selon l'écran.
- **Polices** — `next/font/google` pour éliminer le flash de texte non stylisé (FOUT).
- **Streaming** — fichier `loading.tsx` sur `/swipe` : pendant le calcul des recommandations, l'utilisateur voit une animation de cartes skeleton.

---

## MVP

| Fonctionnalité | Description |
| --- | --- |
| Authentification | Connexion et déconnexion via NextAuth |
| Onboarding | Recherche et sélection de 3 films favoris pour initialiser l'algorithme |
| Interface de swipe | Pile de cartes (affiche, titre, synopsis) |
| Bande-annonce | Clic sur une carte → redirection YouTube |
| Actions de swipe | Droite = Watchlist, Gauche = ignoré (les deux enregistrés en base) |
| Règle doublon | Un film swipé ne réapparaît jamais dans la pile |
| Réapprovisionnement | Nouvelles cartes chargées en arrière-plan à 3 cartes restantes |
| Watchlist | Page listant toutes les affiches des films likés |

---

## User Stories

### US1 — Authentification & création de profil

En tant qu'utilisateur, je veux pouvoir me connecter avec mon compte afin de posséder un profil unique et de sauvegarder mon historique de films.

### US2 — Onboarding

En tant que nouvel utilisateur, je veux rechercher et sélectionner 3 films que j'aime lors de ma première connexion afin de donner une base de recommandations pertinente à l'algorithme.

### US3 — Affichage des cartes de films

En tant qu'utilisateur, je veux voir à l'écran une carte affichant l'affiche, le titre et le synopsis d'un film afin de comprendre rapidement de quoi il parle.

### US4 — Lecture de la bande-annonce

En tant qu'utilisateur, je veux pouvoir cliquer sur la carte d'un film pour être redirigé vers sa bande-annonce sur YouTube afin de m'aider à décider si le film me plaît ou non.

### US5 — Interaction de swipe (gauche / droite)

En tant qu'utilisateur, je veux pouvoir swiper une carte à droite pour l'ajouter à ma Watchlist, ou à gauche pour l'ignorer, afin de trier facilement les propositions.

### US6 — Règle d'exclusion des doublons

En tant qu'utilisateur, je veux ne jamais revoir dans ma pile un film que j'ai déjà swipé (à gauche ou à droite) afin de toujours découvrir de nouvelles propositions et ne pas perdre mon temps.

### US7 — Réapprovisionnement dynamique de la pile

En tant qu'utilisateur, je veux que de nouvelles cartes se chargent de manière invisible en arrière-plan quand il ne m'en reste plus que 3 afin de pouvoir swiper à l'infini sans temps de chargement.

### US8 — Consultation de la Watchlist

En tant qu'utilisateur, je veux avoir accès à une page "Watchlist" regroupant toutes les affiches des films que j'ai swipés à droite afin de choisir facilement le film à regarder ce soir.

### US9 — Optimisation de l'expérience utilisateur

En tant qu'utilisateur, je veux que les images soient optimisées pour un chargement rapide et que les polices se chargent de manière fluide afin d'avoir une expérience agréable et sans frustration.
