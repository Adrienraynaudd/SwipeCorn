"use client";

import { useState } from "react";
import { recordSwipe } from "./actions";
import MovieCard from "@/components/MovieCard";
import type { TmdbMovie } from "@/lib/tmdb";

export default function SwipeDeck({ movies }: { movies: TmdbMovie[] }) {
    const [stack, setStack] = useState(movies);

    async function swipe(liked: boolean) {
        const current = stack[0];
        if (!current) return;
        setStack((prev) => prev.slice(1));
        await recordSwipe(current.id, liked);
    }

    if (stack.length === 0) {
        return (
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="text-5xl">🎉</div>
                <p className="text-zinc-400">Tu as tout vu ! Reviens plus tard.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="relative w-full max-w-sm">
                <div className="relative h-[480px]">
                    {stack.slice(0, 5).map((movie, i) => (
                        <MovieCard
                            key={movie.id}
                            movie={movie}
                            zIndex={stack.length - i}
                            offset={i}
                        />
                    ))}
                </div>
            </div>

            <div className="flex gap-6">
                <button
                    onClick={() => swipe(false)}
                    className="flex h-16 w-16 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-2xl transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-400 active:scale-95"
                    aria-label="Pas intéressé"
                >
                    ✕
                </button>
                <button
                    onClick={() => swipe(true)}
                    className="flex h-16 w-16 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-2xl transition hover:border-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-400 active:scale-95"
                    aria-label="J'aime"
                >
                    ♥
                </button>
            </div>

            <p className="text-xs text-zinc-600">
                {stack.length} film{stack.length > 1 ? "s" : ""} restant{stack.length > 1 ? "s" : ""}
            </p>
        </div>
    );
}
