"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getMovieDetails } from "@/lib/tmdb";
import { onboardingMoviesSchema } from "@/lib/validation";

export async function saveOnboardingMovies(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non authentifié");

    const parsedMovieIds = onboardingMoviesSchema.safeParse({
        movie1: formData.get("movie1"),
        movie2: formData.get("movie2"),
        movie3: formData.get("movie3"),
    });
    if (!parsedMovieIds.success) {
        throw new Error(parsedMovieIds.error.issues[0]?.message ?? "Sélection invalide");
    }

    const ids = parsedMovieIds.data;

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
