"use client";

import { useDeferredValue, useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { TMDB_IMAGE_BASE, type TmdbMovie } from "@/lib/tmdb";
import { saveOnboardingMovies } from "./actions";

export default function SetupForm() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<TmdbMovie[]>([]);
    const [selected, setSelected] = useState<TmdbMovie[]>([]);
    const [searching, setSearching] = useState(false);
    const [isPending, startTransition] = useTransition();

    const deferredQuery = useDeferredValue(query);

    useEffect(() => {
        if (deferredQuery.trim().length < 1) {
            setResults([]);
            return;
        }

        const controller = new AbortController();
        setSearching(true);

        fetch(`/api/movies/search?q=${encodeURIComponent(deferredQuery)}`, {
            signal: controller.signal,
        })
            .then((res) => res.json())
            .then((data: TmdbMovie[]) => {
                setResults(data.slice(0, 8));
                setSearching(false);
            })
            .catch((e: Error) => {
                if (e.name !== "AbortError") throw e;
                setSearching(false);
            });

        return () => controller.abort();
    }, [deferredQuery]);

    const toggle = (movie: TmdbMovie) => {
        setSelected((prev) => {
            const exists = prev.some((m) => m.id === movie.id);
            if (exists) return prev.filter((m) => m.id !== movie.id);
            if (prev.length >= 3) return prev;
            return [...prev, movie];
        });
    };

    const isSelected = (id: number) => selected.some((m) => m.id === id);

    const handleSubmit = () => {
        if (selected.length !== 3) return;
        const fd = new FormData();
        selected.forEach((m, i) => fd.set(`movie${i + 1}`, String(m.id)));
        startTransition(() => saveOnboardingMovies(fd));
    };

    return (
        <div className="flex flex-col gap-6">
            {selected.length > 0 && (
                <div>
                    <p className="mb-2 text-sm font-medium text-zinc-400">
                        Sélectionnés ({selected.length}/3)
                    </p>
                    <div className="flex gap-3">
                        {selected.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => toggle(m)}
                                className="group relative w-20 overflow-hidden rounded-lg border-2 border-yellow-400"
                            >
                                {m.poster_path ? (
                                    <Image
                                        src={`${TMDB_IMAGE_BASE}${m.poster_path}`}
                                        alt={m.title}
                                        width={80}
                                        height={120}
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-[120px] w-full items-center justify-center bg-zinc-800 text-2xl">🎬</div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition group-hover:opacity-100">
                                    <span className="text-xl">✕</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="relative">
                <input
                    type="text"
                    placeholder="Recherche un film..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-400 outline-none focus:border-yellow-400"
                />
                {searching && (
                    <div className="absolute right-3 top-3.5 text-zinc-400 text-sm">
                        ...
                    </div>
                )}
            </div>

            {results.length > 0 && (
                <div className="flex flex-col gap-2">
                    {results.map((movie) => {
                        const sel = isSelected(movie.id);
                        const disabled = !sel && selected.length >= 3;
                        return (
                            <button
                                key={movie.id}
                                onClick={() => !disabled && toggle(movie)}
                                disabled={disabled}
                                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                                    sel
                                        ? "border-yellow-400 bg-yellow-400/10"
                                        : disabled
                                        ? "border-zinc-800 bg-zinc-900 opacity-40"
                                        : "border-zinc-700 bg-zinc-800 hover:border-zinc-500"
                                }`}
                            >
                                {movie.poster_path ? (
                                    <Image
                                        src={`${TMDB_IMAGE_BASE}${movie.poster_path}`}
                                        alt={movie.title}
                                        width={40}
                                        height={60}
                                        className="rounded object-cover"
                                    />
                                ) : (
                                    <div className="flex h-[60px] w-[40px] items-center justify-center rounded bg-zinc-700 text-lg">🎬</div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium text-white">{movie.title}</p>
                                    <p className="text-sm text-zinc-400">
                                        {movie.release_date?.slice(0, 4) ?? "—"}
                                    </p>
                                </div>
                                {sel && <span className="text-yellow-400 text-lg">✓</span>}
                            </button>
                        );
                    })}
                </div>
            )}

            <button
                onClick={handleSubmit}
                disabled={selected.length !== 3 || isPending}
                className="w-full rounded-xl bg-yellow-400 py-3 font-semibold text-zinc-900 transition hover:bg-yellow-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
                {isPending ? "Enregistrement..." : "Commencer à swiper →"}
            </button>
        </div>
    );
}