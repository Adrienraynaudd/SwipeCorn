import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getInitialStack } from "@/lib/tmdb";
import SwipeDeck from "./SwipeDeck";

export const dynamic = "force-dynamic";

const NEGATIVE_SEED_LIMIT = 10;

export default async function SwipePage() {
    const session = await auth();
    const userId = session!.user!.id!;

    const [watchlist, swipes, likedSwipes, dislikedSwipes] = await Promise.all([
        db.watchlistEntry.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
        db.swipe.findMany({ where: { userId }, select: { tmdbId: true } }),
        db.swipe.findMany({
            where: { userId, liked: true },
            select: { tmdbId: true },
            orderBy: { createdAt: "desc" },
            take: NEGATIVE_SEED_LIMIT,
        }),
        db.swipe.findMany({
            where: { userId, liked: false },
            select: { tmdbId: true },
            orderBy: { createdAt: "desc" },
            take: NEGATIVE_SEED_LIMIT,
        }),
    ]);

    if (watchlist.length === 0) redirect("/setup");

    const seenIds = new Set([
        ...watchlist.map((w) => w.tmdbId),
        ...swipes.map((s) => s.tmdbId),
    ]);

    const dislikedSeedIds = dislikedSwipes.map((swipe) => swipe.tmdbId);
    const dislikedSeedIdSet = new Set(dislikedSeedIds);
    const positiveSeedIds = [...new Set([
        ...watchlist.map((entry) => entry.tmdbId),
        ...likedSwipes.map((swipe) => swipe.tmdbId),
    ])].filter((id) => !dislikedSeedIdSet.has(id));

    const movies = await getInitialStack(positiveSeedIds, seenIds, dislikedSeedIds);

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
                    <SwipeDeck initialMovies={movies} />
                    <p className="mt-4 text-center text-xs text-zinc-600">
                        Clique sur la carte pour voir la bande-annonce
                    </p>
                </div>
            )}
        </div>
    );
}
