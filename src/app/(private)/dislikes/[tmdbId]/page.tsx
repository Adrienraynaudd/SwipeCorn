import { notFound } from "next/navigation";
import { getMovieDetails } from "@/lib/tmdb";
import { removeFromDislikes, moveToWatchlist } from "../actions";
import MovieDetailLayout from "@/components/MovieDetailLayout";

export default async function DislikeDetailPage({
    params,
}: Readonly<{
    params: Promise<{ tmdbId: string }>;
}>) {
    const { tmdbId: raw } = await params;
    const tmdbId = Number(raw);
    if (Number.isNaN(tmdbId)) notFound();

    const movie = await getMovieDetails(tmdbId);
    if (!movie) notFound();

    return (
        <MovieDetailLayout movie={movie} backHref="/dislikes">
            <form action={moveToWatchlist.bind(null, tmdbId)} className="flex-1">
                <button
                    type="submit"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800 py-3 text-sm font-medium text-zinc-300 transition hover:bg-zinc-700 active:scale-95"
                >
                    <span aria-hidden="true">❤️</span> Déplacer en Watchlist
                </button>
            </form>
            <form action={removeFromDislikes.bind(null, tmdbId)} className="flex-1">
                <button
                    type="submit"
                    className="w-full rounded-xl border border-red-500/30 bg-red-500/10 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/20 active:scale-95"
                >
                    Retirer des Dislikes
                </button>
            </form>
        </MovieDetailLayout>
    );
}
