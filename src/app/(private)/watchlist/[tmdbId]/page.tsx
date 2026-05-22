import { notFound } from "next/navigation";
import { getMovieDetails, TMDB_IMAGE_BASE, TMDB_BACKDROP_BASE } from "@/lib/tmdb";
import { removeFromWatchlist } from "../actions";
import Image from "next/image";
import Link from "next/link";

function formatRuntime(minutes: number) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m.toString().padStart(2, "0")}m` : `${m}m`;
}

function formatMoney(amount: number) {
    if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} Md$`;
    if (amount >= 1_000_000) return `${Math.round(amount / 1_000_000)} M$`;
    return `${amount.toLocaleString("fr-FR")} $`;
}

function formatVotes(n: number) {
    return n.toLocaleString("fr-FR");
}

const STATUS_LABELS: Record<string, string> = {
    Released: "Sorti",
    "Post Production": "Post-production",
    "In Production": "En production",
    Planned: "Planifié",
    Canceled: "Annulé",
    Rumored: "Rumeur",
};

export default async function MovieDetailPage({
    params,
}: Readonly<{
    params: Promise<{ tmdbId: string }>;
}>) {
    const { tmdbId: raw } = await params;
    const tmdbId = Number(raw);
    if (Number.isNaN(tmdbId)) notFound();

    const movie = await getMovieDetails(tmdbId);
    if (!movie) notFound();

    const isDifferentTitle =
        movie.original_title && movie.original_title !== movie.title;

    return (
        <div className="min-h-screen pb-8">
            {/* Backdrop hero */}
            <div className="relative h-52 w-full overflow-hidden bg-zinc-800">
                {movie.backdrop_path ? (
                    <Image
                        src={`${TMDB_BACKDROP_BASE}${movie.backdrop_path}`}
                        alt=""
                        fill
                        sizes="100vw"
                        className="object-cover"
                        priority
                    />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

                <Link
                    href="/watchlist"
                    className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-black/40 px-3 py-1.5 text-sm text-white backdrop-blur-sm transition hover:bg-black/60"
                >
                    ← Retour
                </Link>
            </div>

            <div className="px-5">
                {/* Poster + titre */}
                <div className="flex gap-4 -mt-16 relative z-10">
                    <div className="relative h-36 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-800 shadow-xl ring-2 ring-zinc-700">
                        {movie.poster_path ? (
                            <Image
                                src={`${TMDB_IMAGE_BASE}${movie.poster_path}`}
                                alt={movie.title}
                                fill
                                sizes="96px"
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-3xl">🎬</div>
                        )}
                    </div>

                    <div className="flex min-w-0 flex-col justify-end pb-1 gap-1">
                        <h1 className="text-xl font-bold leading-tight text-white">{movie.title}</h1>
                        {movie.tagline && (
                            <p className="text-sm italic text-zinc-400">{movie.tagline}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
                            {movie.release_date && <span>{movie.release_date.slice(0, 4)}</span>}
                            {movie.runtime ? (
                                <>
                                    <span className="text-zinc-600">·</span>
                                    <span>{formatRuntime(movie.runtime)}</span>
                                </>
                            ) : null}
                            {movie.vote_average > 0 && (
                                <>
                                    <span className="text-zinc-600">·</span>
                                    <span className="font-medium text-yellow-400">
                                        ⭐ {movie.vote_average.toFixed(1)}
                                        {movie.vote_count ? (
                                            <span className="ml-1 font-normal text-zinc-500">
                                                ({formatVotes(movie.vote_count)})
                                            </span>
                                        ) : null}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Genres */}
                {movie.genres && movie.genres.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {movie.genres.map((g) => (
                            <span
                                key={g.id}
                                className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300"
                            >
                                {g.name}
                            </span>
                        ))}
                    </div>
                )}

                {/* Synopsis */}
                {movie.overview && (
                    <div className="mt-6">
                        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">Synopsis</h2>
                        <p className="leading-relaxed text-zinc-300">{movie.overview}</p>
                    </div>
                )}

                {/* Infos */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                    {movie.status && (
                        <InfoBlock label="Statut" value={STATUS_LABELS[movie.status] ?? movie.status} />
                    )}
                    {isDifferentTitle && (
                        <InfoBlock label="Titre original" value={movie.original_title!} />
                    )}
                    {movie.spoken_languages && movie.spoken_languages.length > 0 && (
                        <InfoBlock
                            label="Langue"
                            value={movie.spoken_languages.map((l) => l.english_name).join(", ")}
                        />
                    )}
                    {movie.origin_country && movie.origin_country.length > 0 && (
                        <InfoBlock label="Pays" value={movie.origin_country.join(", ")} />
                    )}
                    {movie.budget ? (
                        <InfoBlock label="Budget" value={formatMoney(movie.budget)} />
                    ) : null}
                    {movie.revenue ? (
                        <InfoBlock label="Recettes" value={formatMoney(movie.revenue)} />
                    ) : null}
                </div>

                {/* Collection */}
                {movie.belongs_to_collection && (
                    <div className="mt-6 flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-800/50 p-3">
                        {movie.belongs_to_collection.poster_path && (
                            <Image
                                src={`${TMDB_IMAGE_BASE}${movie.belongs_to_collection.poster_path}`}
                                alt={movie.belongs_to_collection.name}
                                width={40}
                                height={60}
                                className="rounded-lg object-cover"
                            />
                        )}
                        <div>
                            <p className="text-xs text-zinc-500">Fait partie de</p>
                            <p className="font-medium text-white">{movie.belongs_to_collection.name}</p>
                        </div>
                    </div>
                )}

                {/* Production */}
                {movie.production_companies && movie.production_companies.length > 0 && (
                    <div className="mt-6">
                        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">Production</h2>
                        <p className="text-sm text-zinc-400">
                            {movie.production_companies.map((c) => c.name).join(" · ")}
                        </p>
                    </div>
                )}

                {/* Retirer de la watchlist */}
                <form action={removeFromWatchlist.bind(null, tmdbId)} className="mt-6">
                    <button
                        type="submit"
                        className="w-full rounded-xl border border-red-500/30 bg-red-500/10 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/20 active:scale-95"
                    >
                        Retirer de la Watchlist
                    </button>
                </form>

                {/* Liens externes */}
                <div className="mt-3 flex gap-3">
                    {movie.homepage && (
                        <a
                            href={movie.homepage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-700"
                        >
                            Site officiel ↗
                        </a>
                    )}
                    {movie.imdb_id && (
                        <a
                            href={`https://www.imdb.com/title/${movie.imdb_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-700"
                        >
                            IMDb ↗
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

function InfoBlock({ label, value }: Readonly<{ label: string; value: string }>) {
    return (
        <div className="rounded-xl bg-zinc-800/60 p-3">
            <p className="text-xs text-zinc-500">{label}</p>
            <p className="mt-0.5 text-sm font-medium text-white">{value}</p>
        </div>
    );
}
