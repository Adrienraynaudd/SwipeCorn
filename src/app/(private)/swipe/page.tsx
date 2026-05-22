import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getInitialStack } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";

export default async function SwipePage() {
    const session = await auth();
    const userId = session!.user!.id!;

    const watchlist = await db.watchlistEntry.findMany({ where: { userId } });
    if (watchlist.length === 0) redirect("/setup");

    const swipes = await db.swipe.findMany({ where: { userId }, select: { tmdbId: true } });
    const seenIds = new Set([
        ...watchlist.map((w) => w.tmdbId),
        ...swipes.map((s) => s.tmdbId),
    ]);

    const movies = await getInitialStack(
        watchlist.map((w) => w.tmdbId),
        seenIds
    );

    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-6 py-8">
            <div className="mb-6 text-center">
                <h2 className="text-lg font-semibold text-white">Films pour toi</h2>
                <p className="text-sm text-zinc-500">{movies.length} films disponibles</p>
            </div>

            {movies.length === 0 ? (
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="text-5xl">🎉</div>
                    <p className="text-zinc-400">Tu as tout vu ! Reviens plus tard.</p>
                </div>
            ) : (
                <div className="relative w-full max-w-sm">
                    <div className="relative h-[480px]">
                        {movies.slice(0, 5).map((movie, i) => (
                            <MovieCard
                                key={movie.id}
                                movie={movie}
                                zIndex={movies.length - i}
                                offset={i}
                            />
                        ))}
                    </div>
                    <p className="mt-4 text-center text-xs text-zinc-600">
                        Clique sur la carte pour voir la bande-annonce
                    </p>
                </div>
            )}
        </div>
    );
}
