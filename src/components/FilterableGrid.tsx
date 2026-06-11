"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TMDB_IMAGE_BASE } from "@/lib/tmdb";

export type MovieForGrid = {
    tmdbId: number;
    title: string;
    poster: string | null;
    year: string;
    genres: string[];
};

type Sort = "az" | "za" | "year-desc" | "year-asc";

const SORT_LABELS: Record<Sort, string> = {
    az: "A → Z",
    za: "Z → A",
    "year-desc": "Plus récents",
    "year-asc": "Plus anciens",
};

export default function FilterableGrid({
    movies,
    linkPrefix,
    emptyIcon,
    emptyMessage,
}: Readonly<{
    movies: MovieForGrid[];
    linkPrefix: string;
    emptyIcon: string;
    emptyMessage: string;
}>) {
    const [search, setSearch] = useState("");
    const [activeGenres, setActiveGenres] = useState<Set<string>>(new Set());
    const [sort, setSort] = useState<Sort>("az");

    const allGenres = useMemo(() => {
        const set = new Set<string>();
        for (const m of movies) for (const g of m.genres) set.add(g);
        return [...set].sort((a, b) => a.localeCompare(b, "fr"));
    }, [movies]);

    const filtered = useMemo(() => {
        let result = movies;
        const q = search.trim().toLowerCase();
        if (q) result = result.filter((m) => m.title.toLowerCase().includes(q));
        if (activeGenres.size > 0)
            result = result.filter((m) => m.genres.some((g) => activeGenres.has(g)));
        return [...result].sort((a, b) => {
            if (sort === "az") return a.title.localeCompare(b.title, "fr");
            if (sort === "za") return b.title.localeCompare(a.title, "fr");
            if (sort === "year-desc") return (b.year || "0").localeCompare(a.year || "0");
            return (a.year || "0").localeCompare(b.year || "0");
        });
    }, [movies, search, activeGenres, sort]);

    function toggleGenre(genre: string) {
        setActiveGenres((prev) => {
            const next = new Set(prev);
            if (next.has(genre)) next.delete(genre);
            else next.add(genre);
            return next;
        });
    }

    if (movies.length === 0) {
        return (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
                <div className="text-5xl">{emptyIcon}</div>
                <p className="text-zinc-400">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Barre de recherche + tri */}
            <div className="flex gap-3">
                <input
                    type="text"
                    aria-label="Rechercher un film"
                    placeholder="Rechercher un film..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-400 outline-none focus:border-yellow-400 transition"
                />
                <select
                    aria-label="Trier par"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as Sort)}
                    className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-300 outline-none focus:border-yellow-400 transition"
                >
                    {(Object.entries(SORT_LABELS) as [Sort, string][]).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </div>

            {/* Filtres genre */}
            {allGenres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {allGenres.map((genre) => (
                        <button
                            key={genre}
                            onClick={() => toggleGenre(genre)}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition active:scale-95 ${
                                activeGenres.has(genre)
                                    ? "bg-yellow-400 text-zinc-900"
                                    : "border border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-white"
                            }`}
                        >
                            {genre}
                        </button>
                    ))}
                    {activeGenres.size > 0 && (
                        <button
                            onClick={() => setActiveGenres(new Set())}
                            className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs text-zinc-400 transition hover:text-white"
                        >
                            Effacer
                        </button>
                    )}
                </div>
            )}

            {/* Compteur */}
            <p className="text-sm text-zinc-400" aria-live="polite">
                {filtered.length} film{filtered.length !== 1 ? "s" : ""}
                {(search || activeGenres.size > 0) && movies.length !== filtered.length
                    ? ` sur ${movies.length}`
                    : ""}
            </p>

            {/* Grille ou état vide filtré */}
            {filtered.length === 0 ? (
                <div className="py-16 text-center text-zinc-400">Aucun résultat</div>
            ) : (
                <div className="grid grid-cols-8 gap-2">
                    {filtered.map((movie) => (
                        <Link
                            key={movie.tmdbId}
                            href={`${linkPrefix}/${movie.tmdbId}`}
                            className="group relative block aspect-[2/3] overflow-hidden rounded-lg bg-zinc-800"
                        >
                            {movie.poster ? (
                                <Image
                                    src={`${TMDB_IMAGE_BASE}${movie.poster}`}
                                    alt={movie.title}
                                    fill
                                    sizes="(max-width: 640px) 12vw, 100px"
                                    className="object-cover transition group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-xl">🎬</div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1 opacity-0 transition group-hover:opacity-100">
                                <p className="truncate text-[10px] font-medium text-white">{movie.title}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
