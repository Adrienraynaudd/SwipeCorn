import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getMovieDetails } from "@/lib/tmdb";
import FilterableGrid, { type MovieForGrid } from "@/components/FilterableGrid";

export default async function DislikeGrid() {
    const session = await auth();
    const userId = session!.user!.id!;

    const dislikedSwipes = await db.swipe.findMany({
        where: { userId, liked: false },
        select: { tmdbId: true },
        orderBy: { createdAt: "desc" },
    });

    const details = await Promise.all(dislikedSwipes.map((s) => getMovieDetails(s.tmdbId)));

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
            linkPrefix="/dislikes"
            emptyIcon="👍"
            emptyMessage="Aucun film disliké pour l'instant. Les films ignorés apparaîtront ici."
        />
    );
}
