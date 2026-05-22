"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getMovieDetails } from "@/lib/tmdb";

export async function saveOnboardingMovies(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non authentifié");

    const ids = [
        formData.get("movie1"),
        formData.get("movie2"),
        formData.get("movie3"),
    ]
        .map((v) => Number(v))
        .filter((id) => id > 0);

    if (ids.length !== 3) throw new Error("Sélectionne exactement 3 films");

    const movies = await Promise.all(ids.map(getMovieDetails));

    const userId = session.user.id;
    await Promise.all(
        movies
            .filter(Boolean)
            .map((m) =>
                db.watchlistEntry.upsert({
                    where: { userId_tmdbId: { userId, tmdbId: m!.id } },
                    create: {
                        userId,
                        tmdbId: m!.id,
                        title: m!.title,
                        poster: m!.poster_path ?? null,
                    },
                    update: {},
                })
            )
    );

    redirect("/swipe");
}
