"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getMovieDetails } from "@/lib/tmdb";

export async function removeFromDislikes(tmdbId: number) {
    const session = await auth();
    if (!session?.user?.id) return;

    await db.swipe.deleteMany({
        where: { userId: session.user.id, tmdbId },
    });

    revalidatePath("/dislikes");
    redirect("/dislikes");
}

export async function moveToWatchlist(tmdbId: number) {
    const session = await auth();
    if (!session?.user?.id) return;
    const userId = session.user.id;

    const movie = await getMovieDetails(tmdbId);
    if (!movie) return;

    await Promise.all([
        db.swipe.deleteMany({ where: { userId, tmdbId } }),
        db.watchlistEntry.upsert({
            where: { userId_tmdbId: { userId, tmdbId } },
            update: {},
            create: {
                userId,
                tmdbId: movie.id,
                title: movie.title,
                poster: movie.poster_path ?? null,
            },
        }),
    ]);

    revalidatePath("/dislikes");
    revalidatePath("/watchlist");
    redirect("/dislikes");
}
