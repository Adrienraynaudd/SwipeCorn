Nom du projet : SwipeCorn

Description : SwipeCorn est une application qui apprend tes goûts en direct : tu swipes des films (gauche/droite) et l'algorithme adapte instantanément la suite des propositions pour te dénicher le film parfait à regarder.

Les 6 contraintes cochées :

1.Layouts imbriqués
    Nous allons créer deux groupes de routes distincts. 
    Zone Publique : Une page d'accueil   et les pages de connexion . Elles partageront un Layout simple.
    Zone Privée : L'interface de l'application une fois connecté (/swipe, /watchlist). Ce Layout imbriqué contiendra une barre de navigation mobile persistante qui n'existe pas sur la zone publique.

2.Data fetching serveur
    Au chargement, un Server Component interroge d'abord la base de données  pour récupérer les ID des films présents dans la Watchlist de l'utilisateur. Ensuite, le serveur fait un appel groupé à l'API TMDB pour ces films-là afin de générer une pile initiale de recommandations hautement ciblées.

3.Server Action
    Une page /setup contient un formulaire de recherche. L'utilisateur y tape le nom de 3 films qu'il adore. La soumission de ce formulaire appelle une Server Action qui va enregistrer ces 3 films fondateurs dans sa Watchlist en base de données, puis exécuter un redirect('/swipe')

4.Route Handler
    Lorsque le composant client détecte qu'il ne reste que 3 cartes, il effectue en arrière-plan un fetch vers le Route Handler . Ce Handler (côté serveur) va regarder les derniers films swipés à droite durant la session actuelle, interroger l'API TMDB pour trouver des films similaires, filtrer ceux que l'utilisateur a déjà vus ou swipés (pour éviter les doublons), et renvoyer la nouvelle sélection de cartes en JSON.

5.Auth next-auth
    Via NextAuth.js, chaque utilisateur possède son propre profil lié à ses données en base. La pile de recommandations générée sur est 100% unique puisqu'elle se base exclusivement sur le contenu personnalisé de sa Watchlist et de ses swipes passés.

6.Optimisations mesurables
    Images : Utilisation de next/image pour toutes les affiches de films . Configuration du fichier next.config.js pour autoriser le domaine de TMDB, activation du lazy-loading natif et redimensionnement automatique selon l'écran mobile.
    Polices : Optimisation via next/font/google pour éliminer le flash de texte non stylisé
    Streaming : Utilisation d'un fichier loading.tsx sur la page /swipe. Pendant que le serveur récupère les films de la Watchlist puis calcule les recommandations sur TMDB, l'utilisateur voit une belle animation de cartes.

MVP :
Authentification basique : Connexion et déconnexion de l'utilisateur via NextAuth (ex: Google ou GitHub)

Onboarding  : Un écran avec un champ de recherche qui oblige un nouvel utilisateur à trouver et sélectionner 3 films qu'il aime pour initialiser l'algorithme.

Interface de Swipe : Un écran affichant une pile de cartes de films. Chaque carte contient l'affiche, le titre et le synopsis du film.

Lecture de la bande-annonce : Au clic  sur la carte d'un film, l'utilisateur est redirigé vers l'application ou le site YouTube pour visionner la bande-annonce officielle du film.

Actions de Swipe  :  Swipe à droite : Le film est sauvegardé en base de données dans la Watchlist de l'utilisateur.
Swipe à gauche : Le film est ignoré. et quand même enregistré en base de données pour éviter de le reproposer.

Règle métier : Un film swipé ne doit plus jamais réapparaître dans la pile.

Moteur de réapprovisionnement dynamique : Lorsque la pile de cartes tombe à 3 éléments, l'application appelle l'API en arrière-plan pour générer et ajouter de nouvelles cartes basées sur les films de la Watchlist.

Page Watchlist : Une page dédiée listant toutes les affiches des films que l'utilisateur a swipés à droite.

User Story :
1. Authentification & Création de profil
    En tant qu' utilisateur, je veux pouvoir me connecter avec mon compte (ex: Google/GitHub) afin de posséder un profil unique et de sauvegarder mon historique de films.

2. Onboarding
    En tant que nouvel utilisateur, je veux devoir rechercher et sélectionner 3 films que j'aime lors de ma première connexion afin de donner une base de recommandations pertinente à l'algorithme.

3. Affichage des cartes de films
    En tant qu' utilisateur, je veux voir à l'écran une carte affichant l'affiche, le titre et le synopsis d'un film afin de comprendre rapidement de quoi il parle.

4. Lecture de la bande-annonce
    En tant qu' utilisateur, je veux pouvoir cliquer sur la carte d'un film pour être redirigé vers sa bande-annonce sur YouTube afin de m'aider à décider si le film me plaît ou non.

5. Interaction de Swipe (Gauche / Droite)
    En tant qu' utilisateur, je veux pouvoir swiper une carte à droite pour l'ajouter à ma Watchlist, ou à gauche pour l'ignorer, afin de trier facilement les propositions.

6. Règle d'exclusion des doublons
    En tant qu' utilisateur, je veux ne jamais revoir dans ma pile un film que j'ai déjà swipé (à gauche ou à droite) afin de toujours découvrir de nouvelles propositions et ne pas perdre mon temps.

7. Réapprovisionnement dynamique de la pile
    En tant qu' utilisateur, je veux que de nouvelles cartes se chargent de manière invisible en arrière-plan quand il ne m'en reste plus que 3 afin de pouvoir swiper à l'infini sans subir de temps de chargement.

8. Consultation de la Watchlist
    En tant qu' utilisateur, je veux avoir accès à une page "Watchlist" qui regroupe toutes les affiches des films que j'ai swipés à droite afin de choisir facilement le film que je vais regarder ce soir.

9. Optimisation de l'expérience utilisateur
    En tant qu' utilisateur, je veux que les images soient optimisées pour un chargement rapide et que les polices soient chargées de manière fluide afin d'avoir une expérience agréable et sans frustration.