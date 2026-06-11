"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { saveSwipeInputSchema } from "@/lib/validation";

export async function saveSwipe(input: unknown) {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        throw new Error("Non authentifié");
    }

    const parsedInput = saveSwipeInputSchema.safeParse(input);
    if (!parsedInput.success) {
        throw new Error(parsedInput.error.issues[0]?.message ?? "Payload invalide");
    }

    const { liked, posterPath: poster, title, tmdbId } = parsedInput.data;

    await db.$transaction(async (tx) => {
        await tx.swipe.upsert({
            where: {
                userId_tmdbId: {
                    userId,
                    tmdbId,
                },
            },
            create: {
                userId,
                tmdbId,
                liked,
            },
            update: {
                liked,
            },
        });

        if (!liked) {
            return;
        }

        await tx.watchlistEntry.upsert({
            where: {
                userId_tmdbId: {
                    userId,
                    tmdbId,
                },
            },
            create: {
                userId,
                tmdbId,
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