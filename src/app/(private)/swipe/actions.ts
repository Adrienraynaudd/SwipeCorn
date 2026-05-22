"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function saveSwipe(input: { tmdbId: number; liked: boolean }) {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        throw new Error("Non authentifié");
    }

    if (!Number.isInteger(input.tmdbId) || input.tmdbId <= 0) {
        throw new Error("Film invalide");
    }

    await db.swipe.upsert({
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

    return { ok: true };
}