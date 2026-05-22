import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getMovieDetails } from "@/lib/tmdb";
import FilterableGrid, { type MovieForGrid } from "@/components/FilterableGrid";

export default async function WatchlistGrid() {
    const session = await auth();
    const userId = session!.user!.id!;

    const [entries, likedSwipes] = await Promise.all([
        db.watchlistEntry.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
        db.swipe.findMany({ where: { userId, liked: true }, select: { tmdbId: true } }),
    ]);

    const allIds = [
        ...new Set([
            ...entries.map((e) => e.tmdbId),
            ...likedSwipes.map((s) => s.tmdbId),
        ]),
    ];

    const details = await Promise.all(allIds.map((id) => getMovieDetails(id)));

    const movies: MovieForGrid[] = details
        .filter(Boolean)
        .map((m) => ({
            tmdbId: m!.id,
            title: m!.title,
            poster: m!.poster_path ?? null,
            year: m!.release_date?.slice(0, 4) ?? "",
            genres: m!.genres?.map((g) => g.name) ?? [],
        }));

    return (
        <FilterableGrid
            movies={movies}
            linkPrefix="/watchlist"
            emptyIcon="🎬"
            emptyMessage="Ta watchlist est vide. Swipe à droite pour sauvegarder des films ici."
        />
    );
}
