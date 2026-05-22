import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getMovieDetails } from "@/lib/tmdb";
import LazyCard from "./LazyCard";
import WatchlistCard from "./WatchlistCard";

type Movie = { tmdbId: number; title: string; poster: string | null; year: string };

export default async function WatchlistGrid() {
    const session = await auth();
    const userId = session!.user!.id!;

    const [entries, likedSwipes] = await Promise.all([
        db.watchlistEntry.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
        db.swipe.findMany({ where: { userId, liked: true }, select: { tmdbId: true } }),
    ]);

    const entryIds = new Set(entries.map((e) => e.tmdbId));
    const extraIds = likedSwipes.map((s) => s.tmdbId).filter((id) => !entryIds.has(id));
    const extraMovies = await Promise.all(extraIds.map(getMovieDetails));

    const movies: Movie[] = [
        ...entries.map((e) => ({ tmdbId: e.tmdbId, title: e.title, poster: e.poster ?? null, year: "" })),
        ...extraMovies.filter(Boolean).map((m) => ({
            tmdbId: m!.id,
            title: m!.title,
            poster: m!.poster_path ?? null,
            year: m!.release_date?.slice(0, 4) ?? "",
        })),
    ];

    if (movies.length === 0) {
        return (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
                <div className="text-5xl">🎬</div>
                <p className="text-zinc-400">Ta watchlist est vide.</p>
                <p className="text-sm text-zinc-600">Swipe à droite pour sauvegarder des films ici.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-8 gap-2">
            {movies.map((movie, i) => (
                <LazyCard key={movie.tmdbId} delay={(i % 8) * 40}>
                    <WatchlistCard movie={movie} />
                </LazyCard>
            ))}
        </div>
    );
}
