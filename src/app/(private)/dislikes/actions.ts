"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function removeFromDislikes(tmdbId: number) {
    const session = await auth();
    if (!session?.user?.id) return;

    await db.swipe.deleteMany({ where: { userId: session.user.id, tmdbId } });

    redirect("/dislikes");
}

export async function moveToWatchlist(tmdbId: number) {
    const session = await auth();
    if (!session?.user?.id) return;
    const userId = session.user.id;

    await db.swipe.upsert({
        where: { userId_tmdbId: { userId, tmdbId } },
        update: { liked: true },
        create: { userId, tmdbId, liked: true },
    });

    redirect("/dislikes");
}
