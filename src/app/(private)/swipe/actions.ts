"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function recordSwipe(tmdbId: number, liked: boolean) {
    const session = await auth();
    if (!session?.user?.id) return;

    await db.swipe.upsert({
        where: { userId_tmdbId: { userId: session.user.id, tmdbId } },
        update: { liked },
        create: { userId: session.user.id, tmdbId, liked },
    });
}
