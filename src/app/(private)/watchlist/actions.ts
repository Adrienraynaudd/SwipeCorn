"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getMovieDetails } from "@/lib/tmdb";

export async function getMovieDetailAction(tmdbId: number) {
    return getMovieDetails(tmdbId);
}

export async function removeFromWatchlist(tmdbId: number) {
    const session = await auth();
    if (!session?.user?.id) return;

    await db.watchlistEntry.deleteMany({
        where: { userId: session.user.id, tmdbId },
    });

    redirect("/watchlist");
}

export async function moveToDislike(tmdbId: number) {
    const session = await auth();
    if (!session?.user?.id) return;
    const userId = session.user.id;

    await Promise.all([
        db.watchlistEntry.deleteMany({ where: { userId, tmdbId } }),
        db.swipe.upsert({
            where: { userId_tmdbId: { userId, tmdbId } },
            update: { liked: false },
            create: { userId, tmdbId, liked: false },
        }),
    ]);

    redirect("/watchlist");
}
