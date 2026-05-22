"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type SaveSwipeInput = {
    tmdbId: number;
    liked: boolean;
    title?: string;
    posterPath?: string | null;
};

export async function saveSwipe(input: SaveSwipeInput) {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        throw new Error("Non authentifié");
    }

    if (!Number.isInteger(input.tmdbId) || input.tmdbId <= 0) {
        throw new Error("Film invalide");
    }

    const title = input.title?.trim();
    const poster = input.posterPath?.trim() || null;

    if (input.liked && !title) {
        throw new Error("Titre invalide");
    }

    await db.$transaction(async (tx) => {
        await tx.swipe.upsert({
            where: {
                userId_tmdbId: {
                    userId,
                    tmdbId: input.tmdbId,
                },
            },
            create: {
                userId,
                tmdbId: input.tmdbId,
                liked: input.liked,
            },
            update: {
                liked: input.liked,
            },
        });

        if (!input.liked) {
            return;
        }

        await tx.watchlistEntry.upsert({
            where: {
                userId_tmdbId: {
                    userId,
                    tmdbId: input.tmdbId,
                },
            },
            create: {
                userId,
                tmdbId: input.tmdbId,
                title: title!,
                poster,
            },
            update: {
                title: title!,
                poster,
            },
        });
    });

    return { ok: true };
}