"use client";
import Image from "next/image";
import {TMDB_IMAGE_BASE, type TmdbMovie } from "@/lib/tmdb";


interface Props {
    movie: TmdbMovie;
    zIndex: number;
    offset: number;
}

export default function MovieCard({ movie, zIndex, offset }: Props) {
    const rotation = offset === 0 ? 0 : offset % 2 === 0 ? 3 * offset : -3 * offset;
    const translateY = offset * -6;

    return (
        <div
            className="absolute inset-0 overflow-hidden rounded-2xl shadow-2xl"
            style={{
                zIndex,
                transform: `rotate(${rotation}deg) translateY(${translateY}px)`,
                transition: "transform 0.3s ease",
            }}
        >
            {movie.poster_path ? (
                <Image
                    src={`${TMDB_IMAGE_BASE}${movie.poster_path}`}
                    alt={movie.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 384px"
                    className="select-none object-cover"
                    priority={offset === 0}
                    draggable={false}
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-6xl">
                    🎬
                </div>
            )}

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-5">
                <h3 className="text-xl font-bold text-white leading-tight">
                    {movie.title}
                </h3>
                {movie.release_date && (
                    <p className="mt-0.5 text-sm text-zinc-300">
                        {movie.release_date.slice(0, 4)}
                        {movie.vote_average > 0 && (
                            <span className="ml-2">⭐ {movie.vote_average.toFixed(1)}</span>
                        )}
                    </p>
                )}
                {movie.overview && (
                    <p className="mt-2 line-clamp-3 text-sm text-zinc-300 leading-relaxed">
                        {movie.overview}
                    </p>
                )}
            </div>
        </div>
    );
}
