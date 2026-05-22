"use client";

import { useEffect, useRef, useState } from "react";
import MovieCard from "@/components/MovieCard";
import type { TmdbMovie } from "@/lib/tmdb";
import { saveSwipe } from "./actions";

const SWIPE_THRESHOLD = 110;
const REFILL_THRESHOLD = 10;

type DragState = {
    active: boolean;
    pointerId: number | null;
    startX: number;
    deltaX: number;
};

const initialDragState: DragState = {
    active: false,
    pointerId: null,
    startX: 0,
    deltaX: 0,
};

export default function SwipeDeck({ initialMovies }: { initialMovies: TmdbMovie[] }) {
    const [movies, setMovies] = useState(initialMovies);
    const [drag, setDrag] = useState<DragState>(initialDragState);
    const [isSaving, setIsSaving] = useState(false);
    const [isRefilling, setIsRefilling] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refillError, setRefillError] = useState<string | null>(null);
    const lastRefillSignatureRef = useRef<string | null>(null);

    const topMovie = movies[0];

    const resetDrag = () => setDrag(initialDragState);

    useEffect(() => {
        if (movies.length === 0 || movies.length > REFILL_THRESHOLD || isRefilling) {
            return;
        }

        const signature = movies.map((movie) => movie.id).join(",");
        if (lastRefillSignatureRef.current === signature) {
            return;
        }

        lastRefillSignatureRef.current = signature;

        const refill = async () => {
            setIsRefilling(true);
            setRefillError(null);

            try {
                const response = await fetch("/api/movies/refill", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        excludeIds: movies.map((movie) => movie.id),
                    }),
                });

                if (!response.ok) {
                    throw new Error("Refill failed");
                }

                const incomingMovies = (await response.json()) as TmdbMovie[];

                setMovies((current) => {
                    const existingIds = new Set(current.map((movie) => movie.id));
                    const uniqueMovies = incomingMovies.filter(
                        (movie) => !existingIds.has(movie.id)
                    );

                    if (uniqueMovies.length === 0) {
                        return current;
                    }

                    return [...current, ...uniqueMovies];
                });
            } catch {
                setRefillError("Impossible de recharger de nouveaux films.");
            } finally {
                setIsRefilling(false);
            }
        };

        void refill();
    }, [isRefilling, movies]);

    const commitSwipe = async (liked: boolean) => {
        const movie = movies[0];
        if (!movie || isSaving) return;

        setError(null);
        setIsSaving(true);
        setDrag({
            active: false,
            pointerId: null,
            startX: 0,
            deltaX: liked ? window.innerWidth : -window.innerWidth,
        });

        try {
            await saveSwipe({
                tmdbId: movie.id,
                liked,
                title: movie.title,
                posterPath: movie.poster_path,
            });
            setMovies((current) => current.slice(1));
            resetDrag();
        } catch {
            setError("Impossible d'enregistrer ce swipe.");
            resetDrag();
        } finally {
            setIsSaving(false);
        }
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        if (isSaving || !topMovie) return;

        setError(null);
        event.currentTarget.setPointerCapture(event.pointerId);
        setDrag({
            active: true,
            pointerId: event.pointerId,
            startX: event.clientX,
            deltaX: 0,
        });
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!drag.active || drag.pointerId !== event.pointerId || isSaving) return;

        setDrag((current) => ({
            ...current,
            deltaX: event.clientX - current.startX,
        }));
    };

    const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
        if (drag.pointerId === event.pointerId && event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }

        if (!drag.active || drag.pointerId !== event.pointerId || isSaving) return;

        const deltaX = drag.deltaX;
        if (Math.abs(deltaX) < SWIPE_THRESHOLD) {
            resetDrag();
            return;
        }

        void commitSwipe(deltaX > 0);
    };

    if (movies.length === 0) {
        return (
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="text-5xl">🎉</div>
                <p className="text-zinc-400">Tu as tout vu pour le moment.</p>
                {error && (
                    <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                        {error}
                    </p>
                )}
            </div>
        );
    }

    const overlayOpacity = Math.min(Math.abs(drag.deltaX) / SWIPE_THRESHOLD, 1);
    const preventNativeDrag = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    return (
        <div className="w-full max-w-sm">
            <div className="relative h-[480px]">
                {movies.slice(0, 5).map((movie, index) => {
                    const isTopCard = index === 0;
                    const dragRotation = isTopCard ? drag.deltaX / 18 : 0;
                    const dragTransform = isTopCard
                        ? `translateX(${drag.deltaX}px) rotate(${dragRotation}deg)`
                        : undefined;

                    return (
                        <div
                            key={movie.id}
                            className={isTopCard ? "absolute inset-0 select-none cursor-grab active:cursor-grabbing" : "absolute inset-0"}
                            onPointerDown={isTopCard ? handlePointerDown : undefined}
                            onPointerMove={isTopCard ? handlePointerMove : undefined}
                            onPointerUp={isTopCard ? handlePointerEnd : undefined}
                            onPointerCancel={isTopCard ? handlePointerEnd : undefined}
                            onDragStart={isTopCard ? preventNativeDrag : undefined}
                            style={{
                                zIndex: movies.length - index,
                                transform: dragTransform,
                                transition: drag.active && isTopCard ? "none" : "transform 0.22s ease",
                                touchAction: isTopCard ? "none" : "auto",
                            }}
                        >
                            <MovieCard movie={movie} zIndex={1} offset={index} />

                            {isTopCard && (
                                <>
                                    <div
                                        className="pointer-events-none absolute left-5 top-5 rounded-full border-2 border-emerald-400 bg-emerald-400/10 px-4 py-2 text-sm font-semibold tracking-[0.2em] text-emerald-300"
                                        style={{
                                            opacity: drag.deltaX > 0 ? overlayOpacity : 0,
                                        }}
                                    >
                                        LIKE
                                    </div>
                                    <div
                                        className="pointer-events-none absolute right-5 top-5 rounded-full border-2 border-rose-400 bg-rose-400/10 px-4 py-2 text-sm font-semibold tracking-[0.2em] text-rose-300"
                                        style={{
                                            opacity: drag.deltaX < 0 ? overlayOpacity : 0,
                                        }}
                                    >
                                        PASS
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
                <span>Glisse a gauche pour passer</span>
                <span>Glisse a droite pour liker</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={() => void commitSwipe(false)}
                    disabled={!topMovie || isSaving}
                    className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Pass
                </button>
                <button
                    type="button"
                    onClick={() => void commitSwipe(true)}
                    disabled={!topMovie || isSaving}
                    className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Like
                </button>
            </div>

            {isSaving && (
                <p className="mt-3 text-center text-sm text-zinc-400">Enregistrement du swipe...</p>
            )}

            {isRefilling && (
                <p className="mt-3 text-center text-sm text-zinc-500">
                    Chargement de nouvelles cartes...
                </p>
            )}

            {error && (
                <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                    {error}
                </p>
            )}

            {refillError && (
                <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                    {refillError}
                </p>
            )}
        </div>
    );
}