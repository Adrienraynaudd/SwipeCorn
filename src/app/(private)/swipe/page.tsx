import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getInitialStack } from "@/lib/tmdb";
import SwipeDeck from "./SwipeDeck";

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
            </div>
            <SwipeDeck movies={movies} />
        </div>
    );
}
